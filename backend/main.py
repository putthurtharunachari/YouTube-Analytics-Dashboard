"""
Main entry point for the FastAPI backend.
Sets up the application, global exception handlers, CORS, and binds analytics routers.
"""
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

import re
from config.database import engine, Base, get_db
import models
from services.channel_extractor import extract_channel_info
from services.video_extractor import extract_video_metadata
from api.analytics import router as analytics_router
from config.logger import logger

def validate_channel_id(channel_id: str):
    if not channel_id or len(channel_id) < 5 or " " in channel_id:
        logger.warning(f"Invalid channel ID provided: {channel_id}")
        raise HTTPException(status_code=400, detail="Please enter a valid YouTube channel ID.")


# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="YouTube Analytics API")
app.include_router(analytics_router)

from fastapi import Request
from fastapi.responses import JSONResponse

# Configure CORS for React frontend (Vite defaults to port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catches all globally unhandled exceptions and prevents the application from crashing
    by gracefully returning a 500 server error response.
    """
    logger.error(f"Unhandled server error at {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred while processing your request. Please try again later."}
    )

@app.get("/")
def read_root():
    """ Health check endpoint to verify backend API is online. """
    return {"message": "Welcome to YouTube Analytics API. Engine is running."}

@app.post("/api/extract/channel/{channel_id}")
async def extract_channel(channel_id: str, db: Session = Depends(get_db)):
    """ Extracts ONLY channel info and stores it in DB. """
    try:
        validate_channel_id(channel_id)
        logger.info(f"Extracting channel info for {channel_id}")
        channel_data = extract_channel_info(channel_id)
        
        db_channel = db.query(models.Channel).filter(models.Channel.channel_id == channel_id).first()
        if not db_channel:
            db_channel = models.Channel(**channel_data)
            db.add(db_channel)
            logger.info(f"Adding new channel to DB: {channel_id}")
        else:
            for key, value in channel_data.items():
                setattr(db_channel, key, value)
            # Bump the timestamp so it appears at the top of 'Recently Analyzed'
            db_channel.created_at = datetime.utcnow()
            logger.info(f"Updated existing channel in DB: {channel_id}")
                
        db.commit()
        db.refresh(db_channel)

        return {
            "status": "success", 
            "message": "Channel data fetched successfully.",
            "data": channel_data,
            "db_id": db_channel.id
        }
    except HTTPException as he:
        # Re-raise HTTP exceptions to return correct status and message
        raise he
    except Exception as e:
        logger.error(f"Error extracting channel {channel_id}: {str(e)}")
        error_msg = str(e) if "YouTube API" in str(e) or "Channel Extraction Failed" in str(e) else "An unexpected error occurred while extracting channel info."
        raise HTTPException(status_code=400, detail=error_msg)

@app.post("/api/extract/videos/{channel_id}")
async def extract_videos(channel_id: str, db_id: int, db: Session = Depends(get_db)):
    """ Extracts ONLY video info for a channel and stores it in DB. """
    try:
        validate_channel_id(channel_id)
        logger.info(f"Extracting videos for {channel_id} (DB ID: {db_id})")
        videos_processed = process_videos(channel_id, db_id, db)
        return {
            "status": "success",
            "message": f"Successfully processed and stored {videos_processed} videos."
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error processing videos for {channel_id}: {str(e)}")
        error_msg = str(e) if "Quota" in str(e) or "Video Extraction Failed" in str(e) else "An unexpected error occurred while extracting video metadata."
        raise HTTPException(status_code=400, detail=error_msg)

def process_videos(youtube_channel_id: str, db_channel_id: int, db: Session):
    """
    Worker to extract videos and insert into MySQL. Returns processed count.
    """
    try:
        videos_data = extract_video_metadata(youtube_channel_id)
        processed_count = 0
        
        for v_data in videos_data:
            # Separate Statistics from core Video data
            video_core_data = {
                "video_id": v_data["video_id"],
                "channel_id": db_channel_id,
                "title": v_data["title"],
                "description": v_data["description"],
                "published_at": v_data["published_at"],
                "duration": v_data["duration"],
                "duration_sec": v_data.get("duration_sec", 0),
                "thumbnail": v_data["thumbnail"]
            }

            stats_data = {
                "view_count": v_data["view_count"],
                "like_count": v_data["like_count"],
                "comment_count": v_data["comment_count"]
            }

            db_video = db.query(models.Video).filter(models.Video.video_id == v_data["video_id"]).first()
            if not db_video:
                db_video = models.Video(**video_core_data)
                db.add(db_video)
            else:
                for key, value in video_core_data.items():
                    setattr(db_video, key, value)
            
            db.commit()
            db.refresh(db_video)

            # Insert/Update Statistics snapshot
            new_stat = models.VideoStatistic(video_id=db_video.id, **stats_data)
            db.add(new_stat)
            processed_count += 1
            
        db.commit()
        return processed_count
    except Exception as e:
        logger.error(f"Video Processing Data Insert Error: {str(e)}")
        db.rollback()
        raise e

@app.get("/api/channels/recent")
async def get_recent_channels(limit: int = 5, db: Session = Depends(get_db)):
    """ Returns the most recently analyzed channels from DB """
    recent = db.query(models.Channel).order_by(models.Channel.created_at.desc()).limit(limit).all()
    return {"status": "success", "data": recent}

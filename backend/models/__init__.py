from sqlalchemy import Column, Integer, String, Text, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    subscribers = Column(BigInteger, default=0)
    total_videos = Column(Integer, default=0)
    total_views = Column(BigInteger, default=0)
    thumbnail = Column(String(500))
    banner = Column(String(500))
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    videos = relationship("Video", back_populates="channel", cascade="all, delete-orphan")

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String(100), unique=True, index=True, nullable=False)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    published_at = Column(DateTime, index=True)
    duration = Column(String(50))
    duration_sec = Column(Integer, default=0, index=True)
    thumbnail = Column(String(500))

    channel = relationship("Channel", back_populates="videos")
    statistics = relationship("VideoStatistic", back_populates="video", cascade="all, delete-orphan")

class VideoStatistic(Base):
    __tablename__ = "video_statistics"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    view_count = Column(BigInteger, default=0, index=True)
    like_count = Column(BigInteger, default=0, index=True)
    comment_count = Column(BigInteger, default=0, index=True)
    extracted_at = Column(DateTime, default=datetime.utcnow, index=True)

    video = relationship("Video", back_populates="statistics")

class ReportTemplate(Base):
    __tablename__ = "report_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    channel_id = Column(String(100), index=True, nullable=False) # Store the YouTube Channel ID
    config = Column(Text) # JSON string of selected metrics/charts
    created_at = Column(DateTime, default=datetime.utcnow)

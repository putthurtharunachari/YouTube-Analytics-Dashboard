import os
import sys
import re
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '../../.gitenv')
print(f"Loading env from {env_path}")
load_dotenv(env_path)

from sqlalchemy import create_engine, text
from config.database import SQLALCHEMY_DATABASE_URL
from sqlalchemy.orm import sessionmaker

def parse_duration(dur_str):
    if not dur_str:
        return 0
    total_seconds = 0
    hours = re.search(r'(\d+)H', dur_str)
    mins = re.search(r'(\d+)M', dur_str)
    secs = re.search(r'(\d+)S', dur_str)
    if hours: total_seconds += int(hours.group(1)) * 3600
    if mins: total_seconds += int(mins.group(1)) * 60
    if secs: total_seconds += int(secs.group(1))
    return total_seconds

def populate_duration():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # First, try to add the column if it doesn't exist
    print("Checking for duration_sec column...")
    try:
        with engine.connect() as con:
            con.execute(text("ALTER TABLE videos ADD COLUMN duration_sec INT DEFAULT 0, ADD INDEX ix_videos_duration_sec (duration_sec);"))
            con.commit()
            print("Added duration_sec column and index successfully.")
    except Exception as e:
        print(f"Column likely already exists. Error message: {e}")

    # Now backfill data
    print("Backfilling duration_sec data...")
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        # We'll use raw SQL to fetch strings and update just to be safe if model is out of sync
        result = session.execute(text("SELECT id, duration FROM videos WHERE duration_sec IS NULL OR duration_sec = 0;"))
        videos = result.fetchall()
        
        updated_count = 0
        for vid in videos:
            v_id = vid[0]
            dur_str = vid[1]
            dur_sec = parse_duration(dur_str)
            
            if dur_sec > 0:
                session.execute(text("UPDATE videos SET duration_sec = :sec WHERE id = :id"), {"sec": dur_sec, "id": v_id})
                updated_count += 1
                
        session.commit()
        print(f"Successfully backfilled duration_sec for {updated_count} videos.")
    except Exception as e:
        session.rollback()
        print(f"Error backfilling: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    populate_duration()

import os
import sys
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '../../.gitenv')
print(f"Loading env from {env_path}")
load_dotenv(env_path)

from sqlalchemy import create_engine, text
from config.database import SQLALCHEMY_DATABASE_URL

def apply_indexes():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as con:
        indexes = [
            "CREATE INDEX ix_videos_published_at ON videos(published_at);",
            "CREATE INDEX ix_video_statistics_view_count ON video_statistics(view_count);",
            "CREATE INDEX ix_video_statistics_like_count ON video_statistics(like_count);",
            "CREATE INDEX ix_video_statistics_comment_count ON video_statistics(comment_count);",
            "CREATE INDEX ix_video_statistics_extracted_at ON video_statistics(extracted_at);"
        ]
        
        for idx in indexes:
            try:
                print(f"Executing: {idx}")
                con.execute(text(idx))
                print("Success.")
            except Exception as e:
                print(f"Skipped/Error: {e}")
        con.commit()
    print("Optimization indexes application completed.")

if __name__ == "__main__":
    apply_indexes()

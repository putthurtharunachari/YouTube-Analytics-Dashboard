from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables from .gitenv and system/.env
env_path = os.path.join(os.path.dirname(__file__), '../../.gitenv')
if os.path.exists(env_path):
    load_dotenv(env_path)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DB_USER = os.getenv("MYSQL_USER")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
DB_HOST = os.getenv("MYSQL_HOST")
DB_NAME = os.getenv("MYSQL_DATABASE", "youtube_analytics")

engine = None
SessionLocal = None

def init_engine():
    global engine, SessionLocal
    
    # 1. Direct DATABASE_URL (Render, Supabase, Railway, etc.)
    if DATABASE_URL:
        db_url = DATABASE_URL
        if db_url.startswith("mysql://"):
            db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
        elif db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        try:
            eng = create_engine(db_url, pool_pre_ping=True)
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Successfully connected via DATABASE_URL")
            engine = eng
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            return
        except Exception as e:
            print(f"Failed to connect using DATABASE_URL: {e}")

    # 2. MySQL via individual env vars
    if DB_USER and DB_HOST:
        encoded_password = quote_plus(DB_PASSWORD) if DB_PASSWORD else ""
        mysql_url = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"
        try:
            eng = create_engine(
                mysql_url,
                pool_size=10,
                max_overflow=20,
                pool_timeout=5,
                pool_pre_ping=True
            )
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Successfully connected to MySQL database")
            engine = eng
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            return
        except Exception as e:
            print(f"Warning: Could not connect to MySQL at {DB_HOST}: {e}")

    # 3. Fallback to SQLite (ensures app never crashes on cloud deployment)
    print("Falling back to local SQLite database (youtube_analytics.db)")
    sqlite_url = "sqlite:///./youtube_analytics.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

init_engine()

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

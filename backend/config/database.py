from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from .gitenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.gitenv'))

# Database URL configuration
from urllib.parse import quote_plus

DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
DB_HOST = os.getenv("MYSQL_HOST", "localhost")
DB_NAME = os.getenv("MYSQL_DATABASE", "youtube_analytics")

# URL-encode the password to safely handle special characters like '@'
encoded_password = quote_plus(DB_PASSWORD) if DB_PASSWORD else ""
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"

# We disable check_same_thread for MySQL, but pool config is useful
try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        pool_size=20, 
        max_overflow=30, 
        pool_timeout=30,
        pool_pre_ping=True
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"Error connecting to MySQL Database: {e}")
    # Fallback to sqlite for testing if MySQL is offline
    SQLALCHEMY_DATABASE_URL = "sqlite:///./youtube_analytics.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

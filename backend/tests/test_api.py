import pytest
from fastapi.testclient import TestClient
from main import app
from config.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

# Setup an in-memory SQLite database for testing the API routes
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    """ Runs before each test to ensure a clean slate and insert seed data """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Insert mock channel
    channel = models.Channel(
        channel_id="UC_TEST",
        name="Mock Analytics Channel",
        subscribers=50000,
        total_views=1000000,
        total_videos=20
    )
    db.add(channel)
    db.commit()
    db.refresh(channel)
    
    # Insert mock video
    video = models.Video(
        video_id="vid_1",
        channel_id=channel.id,
        title="Test Video 1"
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    
    # Insert mock stats
    stat = models.VideoStatistic(
        video_id=video.id,
        view_count=5000,
        like_count=100,
        comment_count=20
    )
    db.add(stat)
    db.commit()
    
    yield
    db.close()

def test_get_leaderboard():
    """Test leaderboard returns ranked channels"""
    response = client.get("/api/analytics/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["name"] == "Mock Analytics Channel"

def test_get_dashboard_analytics_success():
    """Test fetching channel dashboard data"""
    response = client.get("/api/analytics/UC_TEST/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["channelInfo"]["name"] == "Mock Analytics Channel"
    assert data["data"]["metrics"][1]["value"] == 5000 # Total Views from VideoStatistic

def test_get_dashboard_analytics_not_found():
    """Test fetching dashboard for non-existent channel throws 404"""
    response = client.get("/api/analytics/INVALID_ID/dashboard")
    assert response.status_code == 404
    assert response.json() == {"detail": "Channel not found"}

def test_get_channel_videos():
    """Test fetching videos grid data"""
    response = client.get("/api/analytics/UC_TEST/videos")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]["topVideos"]) == 1
    assert data["data"]["topVideos"][0]["title"] == "Test Video 1"
    assert data["data"]["topVideos"][0]["views"] == 5000
    assert data["data"]["topVideos"][0]["engagement"] == 2.4 # (120/5000) * 100

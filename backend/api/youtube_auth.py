import os
from googleapiclient.discovery import build

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.gitenv'))

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

class YouTubeClient:
    def __init__(self):
        if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "AIzaSy...Your_API_Key_Here":
            print("WARNING: Valid YouTube API Key not found in .gitenv")
            self.youtube = None
        else:
            try:
                self.youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
            except Exception as e:
                print(f"Failed to initialize YouTube API Client: {e}")
                self.youtube = None

    def get_client(self):
        return self.youtube

# Singleton client instance
youtube_manager = YouTubeClient()

def get_youtube_client():
    client = youtube_manager.get_client()
    if not client:
        raise ValueError("YouTube client is not properly initialized. Check your API key.")
    return client

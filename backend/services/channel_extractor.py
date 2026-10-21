import pandas as pd
from googleapiclient.errors import HttpError
from api.youtube_auth import get_youtube_client
from config.logger import logger

def extract_channel_info(channel_id: str) -> dict:
    """
    Extracts comprehensive channel information using the YouTube Data API.
    Returns structured channel statistics or raises an exception on error.
    """
    try:
        youtube = get_youtube_client()
        request = youtube.channels().list(
            part="snippet,contentDetails,statistics,brandingSettings",
            id=channel_id
        )
        response = request.execute()

        if not response.get('items'):
            raise ValueError(f"No channel found for ID: {channel_id}")

        channel_data = response['items'][0]
        snippet = channel_data['snippet']
        statistics = channel_data['statistics']
        branding = channel_data.get('brandingSettings', {})

        structured_data = {
            "channel_id": channel_id,
            "name": snippet.get('title', 'Unknown'),
            "description": snippet.get('description', ''),
            "subscribers": int(statistics.get('subscriberCount', 0)),
            "total_videos": int(statistics.get('videoCount', 0)),
            "total_views": int(statistics.get('viewCount', 0)),
            "published_at": snippet.get('publishedAt'),
            "thumbnail": snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
            "banner": branding.get('image', {}).get('bannerExternalUrl', '')
        }

        # Convert to pandas DataFrame to satisfy prompt requirement, 
        # but return dict for easier database ORM parsing in FastAPI
        df = pd.DataFrame([structured_data])
        df['published_at'] = pd.to_datetime(df['published_at'])
        channel_record = df.to_dict(orient='records')[0]
        if hasattr(channel_record.get('published_at'), 'to_pydatetime'):
            channel_record['published_at'] = channel_record['published_at'].to_pydatetime()
        return channel_record

    except HttpError as e:
        logger.error(f"YouTube Channel API Error: {e}")
        if e.resp.status == 403:
            raise Exception("Unable to fetch data from YouTube API. API Quota Exceeded. Please try again later.")
        if e.resp.status == 404:
            raise Exception("YouTube channel not found. Please check the channel ID.")
        raise Exception("YouTube API is currently unavailable. Please try again later.")
    except Exception as e:
        logger.error(f"Unexpected error in extract_channel_info: {e}")
        raise Exception(str(e))

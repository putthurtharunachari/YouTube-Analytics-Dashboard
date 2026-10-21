"""
Service handles extracting paginated video metadata and statistics from the YouTube Data API.
Handles API quota limits, paginated calls, and data structuring.
"""
"""
Service handles extracting paginated video metadata and statistics from the YouTube Data API.
Handles API quota limits, paginated calls, and data structuring.
"""
import pandas as pd
from googleapiclient.errors import HttpError
from api.youtube_auth import get_youtube_client
from config.logger import logger

def extract_video_metadata(channel_id: str) -> list[dict]:
    """
    Extracts detailed video information for all videos in a given channel.
    Retrieves video metadata and handles API pagination (max 50 results per request).
    """
    try:
        youtube = get_youtube_client()
        
        # 1. First, get the 'Uploads' playlist ID for the channel
        request = youtube.channels().list(
            part="contentDetails",
            id=channel_id
        )
        response = request.execute()

        if not response.get('items'):
            raise ValueError(f"No upload playlist found for channel ID: {channel_id}")

        uploads_playlist_id = response['items'][0]['contentDetails']['relatedPlaylists']['uploads']

        # 2. Extract Video IDs from the Uploads playlist with pagination
        video_ids = []
        next_page_token = None
        pages_fetched = 0
        max_pages = 10 # Limit to 500 videos for performance

        while True:
            playlist_req = youtube.playlistItems().list(
                part="snippet",
                playlistId=uploads_playlist_id,
                maxResults=50,
                pageToken=next_page_token
            )
            playlist_res = playlist_req.execute()

            for item in playlist_res.get('items', []):
                v_id = item['snippet']['resourceId']['videoId']
                video_ids.append(v_id)

            next_page_token = playlist_res.get('nextPageToken')
            pages_fetched += 1
            if not next_page_token or pages_fetched >= max_pages:
                break

        if not video_ids:
            return []

        # 3. Request Statistics for those specific Video IDs in chunks of 50
        videos_metadata = []
        
        import re
        def parse_dur(dur_str):
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

        for i in range(0, len(video_ids), 50):
            chunk = video_ids[i:i + 50]
            stats_req = youtube.videos().list(
                part="snippet,contentDetails,statistics",
                id=",".join(chunk)
            )
            stats_res = stats_req.execute()

            for v in stats_res.get('items', []):
                snippet = v.get('snippet', {})
                statistics = v.get('statistics', {})
                content_details = v.get('contentDetails', {})
                dur_str = content_details.get('duration', '')

                videos_metadata.append({
                    "video_id": v['id'],
                    "channel_id": snippet.get('channelId'),
                    "title": snippet.get('title', 'Unknown'),
                    "description": snippet.get('description', ''),
                    "published_at": snippet.get('publishedAt'),
                    "duration": dur_str,
                    "duration_sec": parse_dur(dur_str),
                    "view_count": int(statistics.get('viewCount', 0)),
                    "like_count": int(statistics.get('likeCount', 0)),
                    "comment_count": int(statistics.get('commentCount', 0)),
                    "thumbnail": snippet.get('thumbnails', {}).get('high', {}).get('url', '')
                })

        # Process via pandas DataFrame to ensure numerical typing matches prompt reqs
        df = pd.DataFrame(videos_metadata)
        
        # Ensure correct datatypes including MySQL compatible DATETIME
        df['published_at'] = pd.to_datetime(df['published_at'])
        df['view_count'] = pd.to_numeric(df['view_count'], errors='coerce').fillna(0).astype('int64')
        df['like_count'] = pd.to_numeric(df['like_count'], errors='coerce').fillna(0).astype('int64')
        df['comment_count'] = pd.to_numeric(df['comment_count'], errors='coerce').fillna(0).astype('int64')

        return df.to_dict(orient='records')

    except HttpError as e:
        logger.error(f"YouTube Video API Error: {e}")
        if e.resp.status == 403:
            raise Exception("Unable to fetch data from YouTube API. API Quota Exceeded. Please try again later.")
        raise Exception("YouTube API is currently unavailable. Please try again later.")
    except Exception as e:
        logger.error(f"Unexpected error in extract_video_metadata: {e}")
        if isinstance(e, ValueError):
            raise Exception(str(e))
        raise Exception("An error occurred while parsing video data.")

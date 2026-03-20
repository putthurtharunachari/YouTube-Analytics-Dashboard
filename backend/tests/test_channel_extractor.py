import pytest
from unittest.mock import MagicMock, patch
from services.channel_extractor import extract_channel_info
from googleapiclient.errors import HttpError

@patch('services.channel_extractor.get_youtube_client')
def test_extract_channel_info_success(mock_get_youtube_client):
    """Test successful channel extraction"""
    mock_youtube_client = MagicMock()
    mock_get_youtube_client.return_value = mock_youtube_client

    # Create the mock response shape
    mock_response = {
        "items": [{
            "id": "UC12345",
            "snippet": {
                "title": "Test Channel",
                "description": "A channel for testing",
                "thumbnails": {"high": {"url": "http://example.com/thumb.jpg"}},
                "publishedAt": "2020-01-01T00:00:00Z"
            },
            "statistics": {
                "subscriberCount": "1000",
                "videoCount": "50",
                "viewCount": "50000"
            },
            "brandingSettings": {
                "image": {"bannerExternalUrl": "http://example.com/banner.jpg"}
            }
        }]
    }

    # Setup the mock chain: client.channels().list().execute()
    mock_channels = MagicMock()
    mock_list = MagicMock()
    mock_list.execute.return_value = mock_response
    mock_channels.list.return_value = mock_list
    mock_youtube_client.channels.return_value = mock_channels

    # Execute
    result = extract_channel_info("UC12345")

    # Assert
    assert result is not None
    assert result["channel_id"] == "UC12345"
    assert result["name"] == "Test Channel"
    assert result["subscribers"] == 1000
    assert result["total_videos"] == 50
    assert result["total_views"] == 50000
    assert result["thumbnail"] == "http://example.com/thumb.jpg"

@patch('services.channel_extractor.get_youtube_client')
def test_extract_channel_info_not_found(mock_get_youtube_client):
    """Test extraction when channel doesn't exist"""
    mock_youtube_client = MagicMock()
    mock_get_youtube_client.return_value = mock_youtube_client
    mock_response = {"items": []}
    
    mock_channels = MagicMock()
    mock_list = MagicMock()
    mock_list.execute.return_value = mock_response
    mock_channels.list.return_value = mock_list
    mock_youtube_client.channels.return_value = mock_channels

    with pytest.raises(Exception, match="No channel found for ID"):
        extract_channel_info("INVALID_ID")

@patch('services.channel_extractor.get_youtube_client')
def test_extract_channel_info_api_error(mock_get_youtube_client):
    """Test extraction when Google API throws an HttpError (e.g., Quota Exceeded)"""
    mock_youtube_client = MagicMock()
    mock_get_youtube_client.return_value = mock_youtube_client
    mock_channels = MagicMock()
    mock_list = MagicMock()
    
    # Create a mock HTTP response
    resp = MagicMock()
    resp.status = 403
    resp.reason = "Quota Exceeded"
    
    mock_list.execute.side_effect = HttpError(resp=resp, content=b'{"error": "quotaExceeded"}')
    mock_channels.list.return_value = mock_list
    mock_youtube_client.channels.return_value = mock_channels

    with pytest.raises(Exception, match="Quota Exceeded"):
        extract_channel_info("UC12345")

from youtube_transcript_api import YouTubeTranscriptApi
import sys

video_id = 'lf7j5qzHvDc'
try:
    api = YouTubeTranscriptApi()
    fetched = api.fetch(video_id, languages=['ru', 'en'])
    full_text = " ".join([snippet.text for snippet in fetched])
    print(full_text)
except Exception as e:
    print(f"ERROR: {str(e)}")

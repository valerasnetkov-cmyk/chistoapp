from youtube_transcript_api import YouTubeTranscriptApi
import sys

video_id = 'lf7j5qzHvDc'
try:
    transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['ru', 'en'])
    full_text = " ".join([entry['text'] for entry in transcript])
    print(full_text)
except Exception as e:
    print(f"ERROR: {str(e)}")

from youtube_transcript_api import YouTubeTranscriptApi
import sys

# Testing the static methods correctly
video_id = 'lf7j5qzHvDc'
try:
    # Based on error, maybe first param is something else? Or it's an instance method.
    api = YouTubeTranscriptApi()
    transcript = api.fetch(video_id, languages=['ru', 'en'])
    full_text = " ".join([entry['text'] for entry in transcript])
    print(full_text)
except Exception as e:
    print(f"ERROR: {str(e)}")

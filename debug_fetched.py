from youtube_transcript_api import YouTubeTranscriptApi
import sys

# Testing the static methods correctly
video_id = 'lf7j5qzHvDc'
try:
    api = YouTubeTranscriptApi()
    # It seems fetch returns an object, let's see what's in it
    fetched = api.fetch(video_id, languages=['ru', 'en'])
    print(dir(fetched))
    # Or maybe it is an iterable of snippets? snippet.text?
    for snippet in fetched:
        print(dir(snippet))
        break
except Exception as e:
    print(f"ERROR: {str(e)}")

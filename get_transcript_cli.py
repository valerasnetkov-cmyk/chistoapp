from youtube_transcript_api import YouTubeTranscriptApi
import sys

# Try lowercase/alternative names based on dir output
# dir said 'list' and 'fetch'
video_id = 'lf7j5qzHvDc'
try:
    # Based on dir() it might be lowercase 'list' or 'fetch'
    # Official docs say get_transcript but dir() doesn't show it.
    # Let's try the cli to see if it works
    import subprocess
    result = subprocess.run(['youtube-transcript-api', video_id, '--languages', 'ru'], capture_output=True, text=True)
    if result.returncode == 0:
        print(result.stdout)
    else:
        print(f"CLI ERROR: {result.stderr}")
except Exception as e:
    print(f"ERROR: {str(e)}")

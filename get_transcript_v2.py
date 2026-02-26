from youtube_transcript_api import YouTubeTranscriptApi
import sys

video_id = 'lf7j5qzHvDc'
try:
    # Testing fetching directly via list
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    # Fetching Russian transcript
    transcript = transcript_list.find_transcript(['ru']).fetch()
    full_text = " ".join([entry['text'] for entry in transcript])
    print(full_text)
except Exception as e:
    # Try finding any available
    try:
        transcript = transcript_list.find_transcript(['en']).fetch()
        full_text = " ".join([entry['text'] for entry in transcript])
        print(full_text)
    except:
        print(f"ERROR: {str(e)}")

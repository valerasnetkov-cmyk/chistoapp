import sys
import requests
from bs4 import BeautifulSoup

def get_video_info(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find('title').text if soup.find('title') else 'Unknown Title'
        # Basic description check (not always reliable via direct fetch)
        description = soup.find('meta', {'name': 'description'})
        desc_text = description['content'] if description else ''
        return title, desc_text
    except Exception as e:
        return str(e), ''

video_url = "https://www.youtube.com/watch?v=MIJ92ciaG2g"
title, desc = get_video_info(video_url)
print(f"Title: {title}")
print(f"Description: {desc}")

import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime

def fetch_ads(channel_url, last_processed_at, processed_ids):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    # Ensure it's the preview URL
    if '/s/' not in channel_url:
        channel_url = channel_url.replace('t.me/', 't.me/s/')
    
    response = requests.get(channel_url, headers=headers)
    if response.status_code != 200:
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    messages = soup.find_all('div', class_='tgme_widget_message_wrap')
    
    new_ads = []
    channel_name = soup.find('div', class_='tgme_channel_info_header_title').text.strip() if soup.find('div', class_='tgme_channel_info_header_title') else "Channel"

    for msg in messages:
        # Extract message ID
        msg_bubble = msg.find('div', class_='tgme_widget_message')
        if not msg_bubble or not msg_bubble.has_attr('data-post'):
            continue
        
        post_id = msg_bubble['data-post']
        if post_id in processed_ids:
            continue
            
        # Extract timestamp
        time_tag = msg.find('time', class_='time')
        if not time_tag or not time_tag.has_attr('datetime'):
            continue
        
        # Telegram timestamps are usually ISO 8601
        dt = datetime.fromisoformat(time_tag['datetime'].replace('Z', '+00:00'))
        ts = int(dt.timestamp())
        
        if ts <= last_processed_at:
            continue
            
        # Extract text
        text_div = msg.find('div', class_='tgme_widget_message_text')
        if not text_div:
            continue
            
        text = text_div.get_text(separator='\n')
        
        new_ads.append({
            'id': post_id,
            'timestamp': ts,
            'text': text,
            'channel_name': channel_name,
            'url': f"https://t.me/{post_id}"
        })
        
    return new_ads

if __name__ == "__main__":
    with open('memory/sakh_ads_sources.json', 'r') as f:
        sources = json.load(f)
        
    with open('memory/sakh_ads_state.json', 'r') as f:
        state = json.load(f)
    
    last_processed_at = state.get('lastProcessedAt', 0)
    processed_ids = set(state.get('processedIds', []))
    
    all_new_ads = []
    for source in sources:
        all_new_ads.extend(fetch_ads(source, last_processed_at, processed_ids))
        
    # Sort by timestamp
    all_new_ads.sort(key=lambda x: x['timestamp'])
    
    # Output the result as JSON for the next step
    print(json.dumps(all_new_ads, ensure_ascii=False))

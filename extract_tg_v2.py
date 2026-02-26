import requests
from bs4 import BeautifulSoup
import json
import sys
import time

urls = [
    "https://t.me/s/kyplu_prodam_sahalin",
    "https://t.me/s/baraholka_yuzhno_sahalinsk",
    "https://t.me/s/obyavlenia_sahalin",
    "https://t.me/s/bizsakh",
    "https://t.me/s/bsakhalin",
    "https://t.me/s/sakhnewgrup"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/'
}

results = []

for url in urls:
    channel_id = url.split('/')[-1]
    print(f"Processing {channel_id}...", file=sys.stderr)
    try:
        # We use a session to handle any potential cookies
        session = requests.Session()
        # First visit the main channel page to get any cookies
        session.get(f"https://t.me/{channel_id}", headers=headers, timeout=10)
        
        # Then visit the web preview
        resp = session.get(url, headers=headers, timeout=10)
        
        if resp.status_code != 200:
            print(f"Error {resp.status_code} for {url}", file=sys.stderr)
            continue
            
        soup = BeautifulSoup(resp.text, 'html.parser')
        message_wraps = soup.find_all('div', class_='tgme_widget_message_wrap')
        
        if not message_wraps:
            print(f"No messages found for {channel_id}", file=sys.stderr)
            # Try to see if there's any content at all
            if "tgme_widget_message" not in resp.text:
                print(f"DEBUG: Content length {len(resp.text)}", file=sys.stderr)
            continue

        # Take last 5 messages
        count = 0
        for wrap in reversed(message_wraps):
            if count >= 5:
                break
            
            msg = wrap.find('div', class_='tgme_widget_message')
            if not msg:
                continue
                
            text_elem = msg.find('div', class_='tgme_widget_message_text')
            text = text_elem.get_text(separator='\n').strip() if text_elem else "[No text or only media]"
            
            # Post ID
            post_id = ""
            if msg.has_attr('data-post'):
                post_id = msg['data-post'].split('/')[-1]
            
            results.append({
                'channel': channel_id,
                'text': text,
                'id': post_id
            })
            count += 1
            
        time.sleep(1) # Be nice
    except Exception as e:
        print(f"Error processing {url}: {e}", file=sys.stderr)

print(json.dumps(results, ensure_ascii=False, indent=2))

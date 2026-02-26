import requests
from bs4 import BeautifulSoup
import json
import sys

urls = [
    "https://t.me/s/kyplu_prodam_sahalin",
    "https://t.me/s/baraholka_yuzhno_sahalinsk",
    "https://t.me/s/obyavlenia_sahalin",
    "https://t.me/s/bizsakh",
    "https://t.me/s/bsakhalin",
    "https://t.me/s/sakhnewgrup"
]

results = []

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

for url in urls:
    try:
        print(f"Fetching {url}...", file=sys.stderr)
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code != 200:
            print(f"Error fetching {url}: {resp.status_code}", file=sys.stderr)
            continue
        
        # DEBUG
        if "tgme_widget_message_wrap" not in resp.text:
            print(f"DEBUG: No messages found in {url}. Length: {len(resp.text)}", file=sys.stderr)
            # Print a bit of the body
            print(resp.text[:500], file=sys.stderr)
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        messages = soup.find_all('div', class_='tgme_widget_message_wrap')
        
        # Get latest 5 messages
        latest_messages = messages[-5:]
        latest_messages.reverse() # Latest first if preferred, or keep order. User said "5 latest". Usually bottom are latest.
        # Wait, usually the bottom messages are the latest in Telegram web preview.
        # Let's take the last 5 in the list.
        
        channel_name = url.split('/')[-1]
        
        for msg in reversed(messages[-5:]):
            text_elem = msg.find('div', class_='tgme_widget_message_text')
            text = text_elem.get_text(separator='\n').strip() if text_elem else ""
            
            # Message ID is usually in the link or data-post
            msg_link = msg.find('a', class_='tgme_widget_message_date')
            msg_id = ""
            if msg_link and 'href' in msg_link.attrs:
                msg_id = msg_link['href'].split('/')[-1]
            
            results.append({
                'channel': channel_name,
                'text': text,
                'id': msg_id
            })
    except Exception as e:
        print(f"Exception for {url}: {e}", file=sys.stderr)

print(json.dumps(results, ensure_ascii=False, indent=2))

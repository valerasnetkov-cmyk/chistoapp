import requests
import re
import json
import time
from datetime import datetime

sources = [
    "kyplu_prodam_sahalin",
    "baraholka_yuzhno_sahalinsk",
    "obyavlenia_sahalin",
    "bizsakh",
    "bsakhalin",
    "sakhnewgrup"
]

with open('memory/sakh_ads_state.json', 'r') as f:
    state = json.load(f)

last_ids = state.get('processedIds', [0] * len(sources))
last_processed_at = state.get('lastProcessedAt', 0)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_message_text(channel, msg_id):
    url = f"https://t.me/{channel}/{msg_id}"
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code != 200:
            return None
        
        # Look for <meta property="og:description" content="...">
        match = re.search(r'<meta property="og:description" content="(.*?)">', r.text)
        if match:
            return match.group(1)
    except:
        pass
    return None

all_new_ads = []
new_ids = list(last_ids)

for i, channel in enumerate(sources):
    print(f"Checking {channel} starting from {last_ids[i]}...")
    current_id = last_ids[i] + 1
    consecutive_failures = 0
    
    # Try up to 20 new messages per channel per run to avoid timeout
    limit = 20 
    found_in_channel = 0
    
    while found_in_channel < limit and consecutive_failures < 5:
        text = get_message_text(channel, current_id)
        if text and len(text) > 10: # Ignore very short messages
            # Filter for ads
            if any(k in text.lower() for k in ['продам', 'куплю', 'сдам', 'ищу', 'цена', 'руб', 'отдам', 'требуется', 'работа']):
                all_new_ads.append({
                    'channel': channel,
                    'id': current_id,
                    'text': text
                })
            new_ids[i] = current_id
            found_in_channel += 1
            consecutive_failures = 0
        else:
            consecutive_failures += 1
        
        current_id += 1
        time.sleep(0.5) # Avoid rate limiting

print(json.dumps({
    'ads': all_new_ads,
    'new_ids': new_ids
}, ensure_ascii=False))

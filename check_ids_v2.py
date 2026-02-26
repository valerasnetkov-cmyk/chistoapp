import requests
import re
import json
import time
import sys

def check_msg(channel, msg_id):
    url = f"https://t.me/{channel}/{msg_id}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code != 200:
            return None
        
        match = re.search(r'<meta property="og:description" content="([^"]+)">', r.text)
        if match:
            text = match.group(1)
            # Basic cleanup of entities
            text = text.replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
            if " members, " in text or " online" in text:
                return None
            return text
        return None
    except:
        return None

state_map = {
    "kyplu_prodam_sahalin": 304524,
    "baraholka_yuzhno_sahalinsk": 108178,
    "obyavlenia_sahalin": 53465,
    "bizsakh": 915150,
    "bsakhalin": 6828027,
    "sakhnewgrup": 6828026
}

found_ads = []
new_ids = state_map.copy()

for channel, last_id in state_map.items():
    consecutive_missing = 0
    # Search for next ads
    for i in range(1, 100): # Check up to 100
        curr_id = last_id + i
        text = check_msg(channel, curr_id)
        if text:
            # Check if it's an ad
            if any(keyword in text.lower() for keyword in ['продам', 'куплю', 'сдам', 'ищу', 'цена', 'руб', 'отдам', 'требуется', 'работа']):
                found_ads.append({
                    'channel': channel,
                    'id': curr_id,
                    'text': text
                })
            new_ids[channel] = curr_id
            consecutive_missing = 0
        else:
            consecutive_missing += 1
            if consecutive_missing > 3:
                break
        time.sleep(0.3)

print(json.dumps({'ads': found_ads, 'new_ids': new_ids}, ensure_ascii=False))

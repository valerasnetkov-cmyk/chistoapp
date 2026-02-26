import requests
import re
import json
import time

def check_msg(channel, msg_id):
    url = f"https://t.me/{channel}/{msg_id}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code != 200:
            return None
        
        # Look for og:description
        match = re.search(r'<meta property="og:description" content="([^"]+)">', r.text)
        if match:
            text = match.group(1)
            # Filter out channel description
            if " members, " in text or " online" in text:
                return None
            return text
        return None
    except:
        return None

# Map domains to their last IDs
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
    print(f"Checking {channel} starting from {last_id}...")
    # Check next 50 IDs
    consecutive_missing = 0
    for i in range(1, 51):
        curr_id = last_id + i
        text = check_msg(channel, curr_id)
        if text:
            print(f"Found {curr_id}: {text[:50]}...")
            found_ads.append({
                'channel': channel,
                'id': curr_id,
                'text': text
            })
            new_ids[channel] = curr_id
            consecutive_missing = 0
        else:
            consecutive_missing += 1
            if consecutive_missing > 5: # If 5 missing in a row, stop
                break
        time.sleep(0.5)

print(json.dumps({'ads': found_ads, 'new_ids': new_ids}, ensure_ascii=False))

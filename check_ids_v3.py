import requests
import re
import json
import time
import sys

def check_msg(channel, msg_id):
    url = f"https://t.me/{channel}/{msg_id}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code != 200: return None
        match = re.search(r'<meta property="og:description" content="([^"]+)">', r.text)
        if match:
            text = match.group(1).replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
            if " members, " in text or " online" in text: return None
            return text
    except: return None

state_map = {
    "kyplu_prodam_sahalin": 304524,
    "baraholka_yuzhno_sahalinsk": 108178,
    "obyavlenia_sahalin": 53465
}

found_ads = []
new_ids = state_map.copy()

for channel, last_id in state_map.items():
    consecutive_missing = 0
    for i in range(1, 20): # Only check 20
        curr_id = last_id + i
        text = check_msg(channel, curr_id)
        if text:
            if any(keyword in text.lower() for keyword in ['продам', 'куплю', 'сдам', 'ищу', 'цена', 'руб', 'отдам']):
                found_ads.append({'channel': channel, 'id': curr_id, 'text': text})
            new_ids[channel] = curr_id
            consecutive_missing = 0
        else:
            consecutive_missing += 1
            if consecutive_missing > 2: break
        time.sleep(0.1)

print(json.dumps({'ads': found_ads, 'new_ids': new_ids}, ensure_ascii=False))

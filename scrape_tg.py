import requests
import re

channels = [
    "kyplu_prodam_sahalin",
    "baraholka_yuzhno_sahalinsk",
    "obyavlenia_sahalin",
    "bizsakh",
    "bsakhalin",
    "sakhnewgrup"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_messages(channel):
    url = f"https://t.me/s/{channel}"
    session = requests.Session()
    # First request to get cookies
    session.get(url, headers=headers)
    # Second request to get the feed
    response = session.get(url, headers=headers)
    print(f"Len: {len(response.text)}")
    if "tgme_widget_message_text" not in response.text:
        # Try one more time with a different approach
        response = session.get(f"{url}?before=999999", headers=headers)
    
    messages = re.findall(r'<div class="tgme_widget_message_text js-message_text" dir="auto">(.*?)</div>', response.text, re.DOTALL)
    ids = re.findall(r'data-post=".*?/(\d+)"', response.text)
    
    return list(zip(ids, messages))

for chan in channels:
    print(f"--- {chan} ---")
    msgs = get_messages(chan)
    for mid, txt in msgs[-3:]: # last 3
        print(f"ID: {mid}\nText: {txt[:100]}...\n")

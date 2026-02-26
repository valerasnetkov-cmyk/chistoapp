import os
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

# Paths
SOURCES_PATH = "memory/sakh_ads_sources.json"
STATE_PATH = "memory/sakh_ads_state.json"

def get_timestamp(dt_str):
    try:
        # 2026-02-18T09:34:00+00:00
        return int(datetime.fromisoformat(dt_str).timestamp())
    except:
        return 0

def clean_text(text):
    return " ".join(text.split())

def extract_ad_info(text):
    # Very basic extraction logic
    price_match = re.search(r'(\d+[\s\d]*)\s?(руб|р\.|₽)', text, re.IGNORECASE)
    price = price_match.group(0) if price_match else "Не указана"
    
    # Contact info: phone numbers, handles
    phone_match = re.search(r'(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}', text)
    handle_match = re.search(r'@[a-zA-Z0-9_]+', text)
    
    contacts = []
    if phone_match: contacts.append(phone_match.group(0))
    if handle_match: contacts.append(handle_match.group(0))
    
    contact = ", ".join(contacts) if contacts else "Смотрите в источнике"
    
    # Categorization
    category = "#sale"
    if any(kw in text.lower() for kw in ["авто", "машина", "колеса", "toyota", "nissan"]): category = "#auto"
    elif any(kw in text.lower() for kw in ["квартира", "сдам", "сниму", "дом", "участок"]): category = "#property"
    elif any(kw in text.lower() for kw in ["работа", "вакансия", "требуется"]): category = "#jobs"
    
    return {
        "price": price,
        "contact": contact,
        "category": category
    }

def run():
    with open(SOURCES_PATH, "r") as f:
        sources = json.load(f)
    
    with open(STATE_PATH, "r") as f:
        state = json.load(f)
    
    last_processed_at = state.get("lastProcessedAt", 0)
    processed_ids = state.get("processedIds", [])
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    new_ads = []
    current_max_timestamp = last_processed_at
    
    for url in sources:
        print(f"Fetching {url}...")
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            print(f"DEBUG: {resp.text[:500]}")
            if resp.status_code != 200:
                print(f"Failed to fetch {url}: {resp.status_code}")
                continue
            
            soup = BeautifulSoup(resp.text, 'html.parser')
            messages = soup.find_all("div", class_="tgme_widget_message")
            print(f"DEBUG: Found {len(messages)} messages in {url}")
            
            channel_name = soup.find("div", class_="tgme_channel_info_header_title")
            channel_name = channel_name.text.strip() if channel_name else url.split("/")[-1]
            
            for msg in messages:
                # Message ID
                msg_id_attr = msg.get("data-post")
                if not msg_id_attr: continue
                msg_id = msg_id_attr.split("/")[-1]
                
                # Check if processed
                if msg_id in processed_ids: continue
                
                # Date
                time_tag = msg.find("time")
                if not time_tag: continue
                dt_str = time_tag.get("datetime")
                ts = get_timestamp(dt_str)
                
                if ts <= last_processed_at: continue
                
                # Text
                text_div = msg.find("div", class_="tgme_widget_message_text")
                if not text_div: continue
                
                raw_text = text_div.get_text(separator="\n").strip()
                if len(raw_text) < 10: continue # Skip noise
                
                info = extract_ad_info(raw_text)
                
                ad = {
                    "id": msg_id,
                    "text": raw_text,
                    "price": info["price"],
                    "contact": info["contact"],
                    "category": info["category"],
                    "source_name": channel_name,
                    "source_url": f"https://t.me/{msg_id_attr}",
                    "timestamp": ts
                }
                new_ads.append(ad)
                
                if ts > current_max_timestamp:
                    current_max_timestamp = ts
                    
        except Exception as e:
            print(f"Error processing {url}: {e}")

    # Sort ads by timestamp
    new_ads.sort(key=lambda x: x["timestamp"])
    
    # Save results to temporary file for the bot to pick up
    with open("/tmp/new_sakh_ads.json", "w") as f:
        json.dump({
            "ads": new_ads,
            "new_last_processed_at": current_max_timestamp
        }, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    run()

import requests

url = "https://t.me/s/kyplu_prodam_sahalin"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    "Upgrade-Insecure-Requests": "1"
}

r = requests.get(url, headers=headers, allow_redirects=True)
print(f"Status: {r.status_code}")
print(f"URL: {r.url}")
if "tgme_widget_message_text" in r.text:
    print("Found messages!")
else:
    print("No messages found.")
    print(r.text[:500])

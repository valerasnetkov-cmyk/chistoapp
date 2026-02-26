import requests
import json
import os

def get_windy_forecast(lat, lon):
    with open('memory/windy_credentials.json', 'r') as f:
        creds = json.load(f)
    
    api_key = creds.get('windy_api_key')
    url = "https://api.windy.com/api/point-forecast/v2"
    
    payload = {
        "lat": lat,
        "lon": lon,
        "model": "gfs",
        "parameters": ["temp", "wind", "precip", "windGust", "ptype"],
        "levels": ["surface"],
        "key": api_key
    }
    
    response = requests.post(url, json=payload)
    return response.json()

if __name__ == "__main__":
    # Координаты Южно-Сахалинска
    lat, lon = 46.954, 142.731
    try:
        data = get_windy_forecast(lat, lon)
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error: {e}")

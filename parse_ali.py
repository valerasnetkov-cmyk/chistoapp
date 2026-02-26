from bs4 import BeautifulSoup
with open('/root/ali_dom.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
    # Try to find common order related text
    text = soup.get_text()
    print(text[:2000])

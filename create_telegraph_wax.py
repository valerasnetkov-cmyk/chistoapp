import sys
import os
import json
import requests

def create_telegraph_page(title, content_html, image_url):
    with open('memory/telegraph_credentials.json', 'r') as f:
        creds = json.load(f)
    
    access_token = creds['access_token']
    
    content_nodes = []
    
    # Add Image at the top
    content_nodes.append({"tag":"img","attrs":{"src":image_url}})
    
    for line in content_html.split('\n'):
        if line.strip():
            if line.startswith('**'):
                content_nodes.append({"tag":"p","children":[{"tag":"b","children":[line.strip('* ')]}]})
            elif line.startswith('1.') or line.startswith('2.') or line.startswith('3.'):
                content_nodes.append({"tag":"p","children":[line]})
            elif line.startswith('👉'):
                content_nodes.append({"tag":"p","children":[{"tag":"a","attrs":{"href":"https://t.me/SoloBuildAI"},"children":[line]}]})
            else:
                content_nodes.append({"tag":"p","children":[line]})

    response = requests.post('https://api.telegra.ph/createPage', json={
        'access_token': access_token,
        'title': title,
        'author_name': creds.get('author_name', 'SoloBuildAI'),
        'content': json.dumps(content_nodes),
        'return_content': True
    })
    
    return response.json()

if __name__ == "__main__":
    title = "Local RAG Mastery: Sub-Millisecond Intelligence Without the API Bill"
    content = """The biggest overhead for AI solopreneurs isn't just the LLM tokens—it's the RAG (Retrieval-Augmented Generation) infrastructure. Between vector database subscriptions and embedding API latency, your "simple" automation stack can quickly become a cost center.

Enter **Wax**, a new project that just hit Hacker News, promising sub-millisecond RAG directly on Apple Silicon. No server. No API. Just one file.

**The Breakdown:**
1. **Zero-Latency Retrieval:** By running directly on the metal (Apple Silicon), Wax eliminates the network round-trip. This allows for real-time context injection that feels instantaneous to the user.
2. **Infinite Privacy:** Your data never leaves the device. For solopreneurs handling sensitive client data or proprietary business logic, this is a massive competitive advantage.
3. **One-File Deployment:** Minimalist architecture means less can go wrong. No more managing complex Docker containers for your vector DB or worrying about breaking changes in hosted services.

**Solo Strategy:**
Stop outsourcing your memory. Transition your local development tools and private knowledge bases to a local RAG stack like Wax. As a solo-builder, "Local-First" is your best defense against subscription fatigue and vendor lock-in.

👉 [Join Moltbook](https://t.me/moltbookin)

Original Source: https://github.com/christopherkarani/Wax"""

    image_url = "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1000"

    result = create_telegraph_page(title, content, image_url)
    if result.get('ok'):
        print(f"URL: {result['result']['url']}")
    else:
        print(f"ERROR: {json.dumps(result)}")

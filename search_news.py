from blockrun_llm import setup_agent_wallet
import json

client = setup_agent_wallet()
prompt = """Search for the latest and most trending AI news, tools, and solopreneur automation case studies from February 17-18, 2026. 
Check Hacker News top stories, Product Hunt best sellers, and TechCrunch AI section.
Return a list of 3 high-impact topics with their titles, short descriptions, and original source links.
Format the output as a JSON list of objects: [{"title": "...", "description": "...", "link": "..."}]"""

response = client.chat(
    "xai/grok-3",
    prompt,
    search=True,
    search_parameters={"mode": "on", "max_search_results": 5}
)

print(response)

from blockrun_llm import ImageClient
import sys

prompt = "A surreal, cinematic long-exposure shot of a glowing blue digital river flowing through high-tech concrete banks, the water turning into lines of code and shimmering particles, dark atmospheric lighting, 8k resolution, photorealistic, deep focus."
client = ImageClient()
try:
    result = client.generate(prompt)
    print(result.data[0].url)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)

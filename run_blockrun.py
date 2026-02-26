import os
import subprocess
import sys

def run():
    # Setup venv if not exists
    if not os.path.exists(".venv_blockrun"):
        subprocess.run([sys.executable, "-m", "venv", ".venv_blockrun"], check=True)
    
    # Install blockrun-llm
    subprocess.run([".venv_blockrun/bin/pip", "install", "blockrun-llm"], check=True)
    
    # Generate image
    script = """
from blockrun_llm import ImageClient
client = ImageClient()
result = client.generate("High-tech cinematic digital art of a sleek robotic assistant operating a complex holographic interface in a futuristic office, symbolizing high-speed AI thinking and autonomous action, vibrant neon accents, 8k resolution, photorealistic.")
print(result.data[0].url)
"""
    with open("gen_img.py", "w") as f:
        f.write(script)
    
    res = subprocess.run([".venv_blockrun/bin/python", "gen_img.py"], capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print(res.stderr, file=sys.stderr)

if __name__ == "__main__":
    run()

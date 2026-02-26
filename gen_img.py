
from blockrun_llm import ImageClient
client = ImageClient()
result = client.generate("High-tech cinematic digital art of a sleek robotic assistant operating a complex holographic interface in a futuristic office, symbolizing high-speed AI thinking and autonomous action, vibrant neon accents, 8k resolution, photorealistic.")
print(result.data[0].url)

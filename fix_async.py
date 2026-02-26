import os
import re

def fix_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # 1. Ensure export functions are async
    content = re.sub(r'export function (\w+)', r'export async function \1', content)
    
    # 2. Fix nested functions used in event listeners
    # Search for functions that contain await and make them async
    # Pattern: function name(...) { ... await ... }
    # This is hard with regex, let's try a simpler approach: 
    # Just make all 'function' definitions async if they are not already
    content = re.sub(r'(?<!async )function (\w+)\((.*?)\)\s*\{', r'async function \1(\2) {', content)
    
    # 3. Ensure arrow functions in event listeners are async if they contain await
    # btn.addEventListener('click', () => { ... await ... })
    # content = re.sub(r'\(\)\s*=>\s*\{(?=[^}]*await)', r'async () => {', content)
    
    # Actually, let's just make all arrow functions async for safety in pages
    content = re.sub(r'\((\w*)\)\s*=>\s*\{', r'async (\1) => {', content)
    
    # 4. Remove double async/await
    content = content.replace('async async', 'async')
    content = content.replace('await await', 'await')
    
    with open(path, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('wax_project/src/pages'):
    for file in files:
        if file.endswith('.js'):
            fix_file(os.path.join(root, file))

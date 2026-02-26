import os
import re

def fix_content(content):
    # Ensure export functions are async
    content = re.sub(r'export function (\w+)', r'export async function \1', content)
    
    # Make all 'function' definitions async
    content = re.sub(r'(?<!async )function (\w+)\((.*?)\)\s*\{', r'async function \1(\2) {', content)
    
    # Make all arrow functions async
    content = re.sub(r'\((\w*)\)\s*=>\s*\{', r'async (\1) => {', content)
    
    # Fix store calls: await store.xxx(...) -> (await store.xxx(...))
    # to handle chaining like (await store.getAll()).filter(...)
    # We do this for getAll, add, update, remove
    for method in ['getAll', 'add', 'update', 'remove']:
        # Match await store.method(...) but NOT (await store.method(...))
        pattern = r'(?<!\()await store\.' + method + r'\((.*?)\)'
        content = re.sub(pattern, r'(await store.' + method + r'(\1))', content)

    # Clean up double async/await
    content = content.replace('async async', 'async')
    content = content.replace('await await', 'await')
    content = content.replace('((await', '(await')
    content = content.replace(')))', '))')
    
    return content

for root, dirs, files in os.walk('wax_project/src/pages'):
    for file in files:
        if file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            new_content = fix_content(content)
            with open(path, 'w') as f:
                f.write(new_content)

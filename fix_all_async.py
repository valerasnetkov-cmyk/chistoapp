import os
import re

async_funcs = [
    'store\\.getAll', 'store\\.add', 'store\\.update', 'store\\.remove',
    'getNotifications', 'getUnreadCount', 'markAsRead', 'markAllAsRead',
    'createNotification', 'notifyLowRating', 'sendReminder', 
    'notifyPostAssigned', 'notifyWashComplete', 'renderHeader'
]

def fix_content(content):
    # Ensure export functions are async
    content = re.sub(r'export function (\w+)', r'export async function \1', content)
    
    # Make all 'function' definitions async
    content = re.sub(r'(?<!async )function (\w+)\((.*?)\)\s*\{', r'async function \1(\2) {', content)
    
    # Make all arrow functions async
    content = re.sub(r'\((\w*)\)\s*=>\s*\{', r'async (\1) => {', content)
    
    # Wrap async calls in (await ...)
    for func in async_funcs:
        # Match function calls that are NOT preceded by 'await' or '(await'
        pattern = r'(?<!await )(?<!\(await )' + func + r'\((.*?)\)'
        content = re.sub(pattern, r'(await ' + func.replace('\\', '') + r'(\1))', content)

    # Clean up double async/await and excessive parentheses
    content = content.replace('async async', 'async')
    content = content.replace('await await', 'await')
    content = content.replace('((await', '(await')
    content = content.replace(')))', '))')
    
    # Fix broken export syntax from too aggressive regex
    content = re.sub(r'export async function \(await (\w+)\)\(\)', r'export async function \1()', content)
    
    return content

targets = []
for root, dirs, files in os.walk('wax_project/src'):
    for file in files:
        if file.endswith('.js') and 'node_modules' not in root:
            targets.append(os.path.join(root, file))

for path in targets:
    with open(path, 'r') as f:
        content = f.read()
    new_content = fix_content(content)
    with open(path, 'w') as f:
        f.write(new_content)

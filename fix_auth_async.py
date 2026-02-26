import sys
import os
import re

files_to_fix = [
    "wax_project/src/pages/client/history.js",
    "wax_project/src/pages/client/loyalty.js",
    "wax_project/src/pages/client/dashboard.js",
    "wax_project/src/pages/client/profile.js",
    "wax_project/src/pages/client/booking.js",
    "wax_project/src/pages/admin/dashboard.js",
    "wax_project/src/pages/admin/queue.js",
    "wax_project/src/main.js",
    "wax_project/src/router.js",
    "wax_project/src/components/header.js"
]

patterns = [
    (r'(?<!await )getCurrentUser\(', 'await getCurrentUser('),
    (r'(?<!await )isLoggedIn\(', 'await isLoggedIn('),
    (r'(?<!await )hasRole\(', 'await hasRole('),
    (r'(?<!await )requireRole\(', 'await requireRole(')
]

for file_path in files_to_fix:
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}")
        continue
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in patterns:
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Fixed {file_path}")
    else:
        print(f"No changes for {file_path}")

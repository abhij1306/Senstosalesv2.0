
import os
import re

directories = [
    "frontend/components/po/organisms",
    "frontend/components/po-notes/organisms",
    "frontend/components/srv/organisms",
    "frontend/components/reports/organisms",
    "frontend/components/dashboard/organisms"
]

replacements = [
    (r'from "\.\./atoms/', 'from "@/components/design-system/atoms/'),
    (r'from "\.\./molecules/', 'from "@/components/design-system/molecules/'),
    (r'from "\./SummaryCards"', 'from "@/components/design-system/organisms/SummaryCards"'),
    (r'from "\.\./organisms/', 'from "@/components/design-system/organisms/'),
]

for d in directories:
    if not os.path.exists(d): continue
    for f in os.listdir(d):
        if f.endswith(".tsx"):
            path = os.path.join(d, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            new_content = content
            for pattern, replacement in replacements:
                new_content = re.sub(pattern, replacement, new_content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Updated {path}")

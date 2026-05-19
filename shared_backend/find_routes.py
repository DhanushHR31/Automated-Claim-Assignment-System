
import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

routes = re.findall(r'@app\.(?:get|post|put|patch|delete)\(["\'](/hospitals[^"\']*)["\']', content)
for r in routes:
    print(r)

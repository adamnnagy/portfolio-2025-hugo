import urllib.request
import re
import json
import os

USERNAME = 'villanykorte'

url = f'https://letterboxd.com/{USERNAME}/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as response:
    html = response.read().decode('utf-8')

match = re.search(rf'<a href="/{USERNAME}/films/"[^>]*>[\s\S]*?<span class="value">([\d,]+)<\/span>', html)

if not match:
    raise Exception('Could not find film count')

count = int(match.group(1).replace(',', ''))

os.makedirs('data', exist_ok=True)
with open('data/letterboxd.json', 'w') as f:
    json.dump({'count': count}, f, indent=2)

print(f'✓ Letterboxd film count: {count}')
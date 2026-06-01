import urllib.request
import re
import json
import os

USERNAME = 'villanykorte'

LASTFM_USERNAME = 'voicestream'
LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY')

def get_scrobble_count():
    url = f'https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user={LASTFM_USERNAME}&api_key={LASTFM_API_KEY}&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
    return int(data['user']['playcount'])

scrobble_count = get_scrobble_count()

print(f'✓ Last.fm scrobble count: {scrobble_count}')



url = f'https://letterboxd.com/{USERNAME}/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as response:
    html = response.read().decode('utf-8')

match = re.search(rf'<a href="/{USERNAME}/films/"[^>]*>[\s\S]*?<span class="value">([\d,]+)<\/span>', html)

if not match:
    raise Exception('Could not find film count')

count = int(match.group(1).replace(',', ''))

os.makedirs('data', exist_ok=True)
with open('data/stats.json', 'w') as f:
    json.dump({
        'films': count,
        'scrobbles': scrobble_count
    }, f, indent=2)

print(f'✓ Letterboxd film count: {count}')
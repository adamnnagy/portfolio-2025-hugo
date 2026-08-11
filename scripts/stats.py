import urllib.request
import re
import json
import os
import time
from datetime import datetime

def get_github_commits():
    year = datetime.now().year
    page = 1
    commits = 0

    while True:
        url = f'https://api.github.com/search/commits?q=author:{GITHUB_USERNAME}+committer-date:{year}-01-01..{year}-12-31&per_page=100&page={page}'
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/vnd.github.cloak-preview'
        })
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))

        commits = data['total_count']
        break

    return commits

def get_scrobble_count():
    url = f'https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user={LASTFM_USERNAME}&api_key={LASTFM_API_KEY}&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
    return int(data['user']['playcount'])


def get_letterboxd_filmcount():
    url = f'https://letterboxd.com/{LETTERBOXD_USERNAME}/'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://letterboxd.com/',
    })

    attempts = 3
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
            break
        except urllib.error.HTTPError:
            if attempt == attempts:
                raise
            time.sleep(3 * attempt)

    match = re.search(rf'<a href="/{LETTERBOXD_USERNAME}/films/"[^>]*>[\s\S]*?<span class="value">([\d,]+)<\/span>', html)

    if not match:
        raise Exception('Could not find film count')
    count = int(match.group(1).replace(',', ''))

    return count

LETTERBOXD_USERNAME = 'villanykorte'

LASTFM_USERNAME = 'voicestream'
LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY')

GITHUB_USERNAME = 'adamnnagy'

os.makedirs('data', exist_ok=True)

existing = {}
try:
    with open('data/stats.json', 'r') as f:
        existing = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    pass

stats = [
    ('films', get_letterboxd_filmcount, 'Letterboxd film count'),
    ('scrobbles', get_scrobble_count, 'Last.fm scrobble count'),
    ('commits', get_github_commits, 'GitHub commits this year'),
]

for key, fetch, label in stats:
    try:
        value = fetch()
        existing[key] = value
        print(f'✓ {label}: {value}')
    except Exception as e:
        print(f'⚠ {label}: fetch failed ({e}), keeping previous value {existing.get(key)}')

with open('data/stats.json', 'w') as f:
    json.dump(existing, f, indent='\t')


import urllib.request
import re
import json
import os
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
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')

    match = re.search(rf'<a href="/{LETTERBOXD_USERNAME}/films/"[^>]*>[\s\S]*?<span class="value">([\d,]+)<\/span>', html)

    if not match:
        raise Exception('Could not find film count')
    count = int(match.group(1).replace(',', ''))

    return count

LETTERBOXD_USERNAME = 'villanykorte'

LASTFM_USERNAME = 'voicestream'
LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY')

GITHUB_USERNAME = 'adamnnagy'

film_count = get_letterboxd_filmcount()
scrobble_count = get_scrobble_count()
github_commits = get_github_commits()

print(f'✓ Last.fm scrobble count: {scrobble_count}')
print(f'✓ Letterboxd film count: {film_count}')
print(f'✓ GitHub commits this year: {github_commits}')

os.makedirs('data', exist_ok=True)
with open('data/stats.json', 'w') as f:
    json.dump({
        'films': film_count,
        'scrobbles': scrobble_count,
        'commits': github_commits,
    }, f, indent=2)


"""
Turn the photos in picks.json into the site's pixel-art dish images.

  python3 scripts/dish-photos/build.py

For every recipe slug it:
  1. downloads the photo from Wikimedia Commons (800 px) into scripts/dish-photos/.cache/
  2. crops a square around the dish  (picks.json "crop": [centre-x, centre-y, size], fractions)
  3. shrinks to 64x64, limits to 16 colours, rounds the corners, adds a 1 px cocoa outline
  4. writes public/dishes/<slug>.png         (used by the site)
           scripts/dish-photos/pixels/<slug>.rgba  (raw pixels, used for social images)
           src/data/photo-credits.json        (credit + licence shown on each recipe page)

To change a dish's picture: edit its entry in picks.json (any Commons file with a CC0 / CC BY /
CC BY-SA / public-domain licence), delete its file in .cache/, and run this again.
"""
import json, os, re, time, urllib.error, urllib.parse, urllib.request
from PIL import Image, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE, PIX = os.path.join(HERE, '.cache'), os.path.join(HERE, 'pixels')
OUT_DIR = os.path.join(ROOT, 'public', 'dishes')
UA = {'User-Agent': 'PixelPuddingRecipeSite/1.0 (https://github.com/; pixel dish image builder) python-urllib'}

def get(url, timeout=60):
    """GET with polite retries: Wikimedia answers 429 when we go too fast."""
    for attempt in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 5: raise
            wait = int(e.headers.get('Retry-After') or 0) or 5 * (attempt + 1)
            print(f'  slow down: waiting {wait}s'); time.sleep(wait)
SIZE, COLOURS, OUTLINE = 64, 16, (0x4E, 0x3A, 0x3E, 255)
for d in (CACHE, PIX, OUT_DIR): os.makedirs(d, exist_ok=True)

def fetch(title):
    # include a hash of the exact title: macOS file names ignore case, so 'X.jpg' and 'X.JPG' would collide
    import hashlib
    fn = os.path.join(CACHE, hashlib.sha1(title.encode()).hexdigest()[:8] + '-' + re.sub(r'[^\w.-]', '_', title.replace('File:', '')))
    if not fn.lower().endswith(('.jpg', '.jpeg', '.png')): fn += '.jpg'
    if os.path.exists(fn): return fn
    q = urllib.parse.urlencode({'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url', 'iiurlwidth': 800, 'format': 'json'})
    url = list(json.loads(get('https://commons.wikimedia.org/w/api.php?' + q))['query']['pages'].values())[0]['imageinfo'][0]['thumburl']
    time.sleep(1)
    open(fn, 'wb').write(get(url))
    time.sleep(1.5)
    return fn

def rounded_mask(n, cut=(4, 2, 1, 1)):
    m = Image.new('L', (n, n), 255); p = m.load()
    for row, c in enumerate(cut):
        for i in range(c):
            for (x, y) in ((i, row), (n - 1 - i, row), (i, n - 1 - row), (n - 1 - i, n - 1 - row)): p[x, y] = 0
    return m

def pixelize(path, crop):
    im = Image.open(path).convert('RGB')
    w, h = im.size; s = min(w, h) * crop[2]
    cx, cy = w * crop[0], h * crop[1]
    x0 = max(0, min(w - s, cx - s / 2)); y0 = max(0, min(h - s, cy - s / 2))
    im = im.crop((int(x0), int(y0), int(x0 + s), int(y0 + s)))
    im = ImageEnhance.Color(im).enhance(1.3); im = ImageEnhance.Contrast(im).enhance(1.12)
    small = im.resize((SIZE, SIZE), Image.LANCZOS)
    q = small.quantize(colors=COLOURS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGBA')
    q.putalpha(rounded_mask(SIZE))
    canvas = Image.new('RGBA', (SIZE + 2, SIZE + 2), (0, 0, 0, 0)); canvas.paste(q, (1, 1), q)
    ring = canvas.split()[3].filter(ImageFilter.MaxFilter(3))
    out = Image.new('RGBA', canvas.size, OUTLINE); out.putalpha(ring); out.alpha_composite(canvas)
    return out

picks = json.load(open(os.path.join(HERE, 'picks.json')))
credits = {}
for slug, p in picks.items():
    img = pixelize(fetch(p['title']), p['crop'])
    img.save(os.path.join(OUT_DIR, slug + '.png'), optimize=True)
    open(os.path.join(PIX, slug + '.rgba'), 'wb').write(img.tobytes())
    credits[slug] = {k: p[k] for k in ('title', 'page', 'artist', 'license', 'licenseUrl')}
    print('ok', slug)
json.dump(credits, open(os.path.join(ROOT, 'src', 'data', 'photo-credits.json'), 'w'), indent=1, ensure_ascii=False)
print(f'{len(credits)} dishes -> public/dishes/  ({SIZE + 2}x{SIZE + 2})')

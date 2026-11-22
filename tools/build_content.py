"""Ubah naskah Markdown di Claudy/Konten menjadi public/content/lessons.json.
Pakai: python tools/build_content.py <folder Konten>
"""
import json, re, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent / "Konten"
OUT = HERE / "public" / "content"
FREE = {"1.1","1.2","1.3","1.4","1.5","1.6","1.7","1.8","2.1","2.2"}  # sama dengan FREE_COUNT di curriculum.js
IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_W = 1280  # gambar diperkecil supaya cepat dibuka di HP

try:
    from PIL import Image, ImageDraw  # pip install pillow
except ImportError:
    Image = None
    print("PERINGATAN: Pillow belum terpasang (pip install pillow). Gambar disalin apa adanya (besar, lambat di HP).")

def img_order(p):
    # Sampul tampil paling atas, gambar perayaan paling akhir, sisanya urut nama.
    n = p.name.lower()
    return (0 if "sampul" in n else 2 if "perayaan" in n else 1, n)

def put_image(src, dest_dir):
    """Salin gambar ke folder web. Bila Pillow ada: perkecil ke 1280px dan simpan WebP."""
    if Image is None or src.suffix.lower() == ".gif":
        shutil.copy2(src, dest_dir / src.name); return src.name
    im = Image.open(src)
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    name = src.stem + ".webp"
    im.save(dest_dir / name, "WEBP", quality=80, method=6)
    return name

def make_logo(src, dest):
    """Logo Kodi: latar polos (hitam/putih) dibuat transparan, dipotong pas, 256px."""
    if Image is None:
        shutil.copy2(src, dest); return
    im = Image.open(src).convert("RGBA")
    mask = im.convert("RGB")
    W, H = mask.size
    for xy in ((0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1)):
        ImageDraw.floodfill(mask, xy, (255, 0, 255), thresh=40)
    px, mp = im.load(), mask.load()
    for y in range(H):
        for x in range(W):
            if mp[x, y] == (255, 0, 255): px[x, y] = (0, 0, 0, 0)
    im = im.crop(im.getbbox())
    side = max(im.size); sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    sq.resize((256, 256), Image.LANCZOS).save(dest, "PNG", optimize=True)

def parse(md):
    lines = md.splitlines()
    title = re.sub(r"^#\s*(Pelajaran|Lesson)\s*[\d.]+:\s*", "", lines[0]).strip()
    text = "\n".join(lines[1:])
    m = re.search(r"^##\s*(Kuis|Quiz)\b.*$", text, re.M)
    body, quiz_md = (text[:m.start()], text[m.end():]) if m else (text, "")
    body = re.sub(r"\n-{3,}\s*$", "", body.strip()).strip()
    quiz, cur = [], None
    for ln in quiz_md.splitlines():
        q = re.match(r"^\*\*\d+\.\s*(.+?)\*\*\s*$", ln.strip())
        if q:
            cur = {"q": q.group(1), "options": [], "answer": None, "note": ""}
            quiz.append(cur); continue
        o = re.match(r"^-\s+(.+)$", ln.strip())
        if o and cur is not None:
            opt = o.group(1)
            if "✅" in opt:
                opt, _, rest = opt.partition("✅")
                cur["answer"] = len(cur["options"])
                n = re.search(r"\*\((.+?)\)\*", rest)
                if n: cur["note"] = n.group(1)
            cur["options"].append(re.sub(r"^[A-D]\.\s*", "", opt.strip()))
    return title, body, [q for q in quiz if q["answer"] is not None]

def main():
    lessons = {}
    for d in sorted(SRC.glob("Modul-*/*")):
        m = re.match(r"^(\d+\.\d+)", d.name)
        if not m or not d.is_dir(): continue
        lid = m.group(1); entry = {}
        for lang, fn in (("id", "naskah-ID.md"), ("en", "script-EN.md")):
            f = d / fn
            if f.exists():
                t, b, q = parse(f.read_text(encoding="utf-8"))
                entry[lang] = {"title": t, "body": b, "quiz": q}
        imgs = []
        gdir = d / "gambar"
        if gdir.is_dir():
            dest = OUT / "img" / lid
            if dest.exists(): shutil.rmtree(dest)  # hanya folder hasil build, bukan folder Konten
            dest.mkdir(parents=True, exist_ok=True)
            for img in sorted(gdir.iterdir(), key=img_order):
                if img.suffix.lower() in IMG_EXT:
                    imgs.append(f"content/img/{lid}/{put_image(img, dest)}")
        entry["images"] = imgs
        vid = d / "video-drive-id.txt"  # opsional: ID file video di Google Drive
        if vid.exists(): entry["video"] = vid.read_text().strip()
        lessons[lid] = entry
    # Logo/maskot: pakai pose tunggal (kodi-logo.png bila ada, lalu kodi-senang.png).
    for name in ("kodi-logo.png", "kodi-senang.png", "kodi-referensi.png"):
        kodi = SRC / "00-Kodi-Maskot" / name
        if kodi.exists():
            make_logo(kodi, HERE / "public" / "img" / "kodi.png"); break
    OUT.mkdir(parents=True, exist_ok=True)
    free = {k: v for k, v in lessons.items() if k in FREE}
    paid = {k: v for k, v in lessons.items() if k not in FREE}
    (OUT / "lessons.json").write_text(json.dumps(free, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(free)} pelajaran gratis -> {OUT/'lessons.json'}")
    if paid:
        pf = HERE / "paid-lessons.json"  # JANGAN taruh di folder public
        pf.write_text(json.dumps(paid, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{len(paid)} pelajaran berbayar -> {pf} (unggah lewat Panel Admin > Konten berbayar)")
        print("Catatan: gambar pelajaran berbayar ikut tersalin ke public/content/img dan bisa dibuka siapa saja.")
    for k, v in lessons.items():
        print(k, {l: len(v[l]['quiz']) for l in ('id','en') if l in v}, len(v["images"]), "gambar")

if __name__ == "__main__":
    main()

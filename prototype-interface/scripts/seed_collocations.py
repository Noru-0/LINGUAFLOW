import os
import json
import sqlite3
import urllib.request
import urllib.error
from dotenv import dotenv_values

# Load items from lib/db/initial_collocations.ts
with open('lib/db/initial_collocations.ts', 'r', encoding='utf-8') as f:
    text = f.read()

assign_idx = text.find('= [')
json_str = text[assign_idx + 2:].strip()
if json_str.endswith(';'):
    json_str = json_str[:-1].strip()

items = json.loads(json_str)
print(f"Loaded {len(items)} items from initial_collocations.ts")

# 1. Update SQLite local.db if exists
for db_file in ['local.db', 'lingua_flow.db']:
    if os.path.exists(db_file):
        try:
            conn = sqlite3.connect(db_file)
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS collocations (
                    id TEXT PRIMARY KEY,
                    category TEXT,
                    head_word TEXT NOT NULL,
                    tail_chunk TEXT NOT NULL,
                    full_phrase TEXT NOT NULL,
                    meaning_vi TEXT NOT NULL,
                    example_sentence TEXT NOT NULL,
                    distractors_json TEXT,
                    cefr_level TEXT NOT NULL,
                    ielts_topic TEXT NOT NULL
                )
            """)
            cur.execute("PRAGMA table_info(collocations)")
            cols = [c[1] for c in cur.fetchall()]
            if 'category' not in cols:
                cur.execute("ALTER TABLE collocations ADD COLUMN category TEXT")
            if 'distractors_json' not in cols:
                cur.execute("ALTER TABLE collocations ADD COLUMN distractors_json TEXT")

            for it in items:
                cur.execute("""
                    INSERT INTO collocations (
                        id, category, head_word, tail_chunk, full_phrase,
                        meaning_vi, example_sentence, distractors_json, cefr_level, ielts_topic
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        category=excluded.category,
                        head_word=excluded.head_word,
                        tail_chunk=excluded.tail_chunk,
                        full_phrase=excluded.full_phrase,
                        meaning_vi=excluded.meaning_vi,
                        example_sentence=excluded.example_sentence,
                        distractors_json=excluded.distractors_json,
                        cefr_level=excluded.cefr_level,
                        ielts_topic=excluded.ielts_topic
                """, (
                    it['id'],
                    it['category'],
                    it['head_word'],
                    it['tail_chunk'],
                    it['full_phrase'],
                    it['meaning_vi'],
                    it['example_sentence'],
                    json.dumps(it.get('distractors', []), ensure_ascii=False),
                    it['cefr_level'],
                    it['ielts_topic']
                ))
            conn.commit()
            cur.execute("SELECT count(*) FROM collocations")
            cnt = cur.fetchone()[0]
            print(f"[SQLite] {db_file} updated! Total collocations: {cnt}")
            conn.close()
        except Exception as e:
            print(f"[SQLite Error] {db_file}: {e}")

# 2. Update Supabase via REST API
env_vars = {}
for env_name in ['.env.local', '.env']:
    if os.path.exists(env_name):
        env_vars.update(dotenv_values(env_name))

sb_url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
sb_key = env_vars.get('SUPABASE_SERVICE_ROLE_KEY') or env_vars.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if sb_url and sb_key:
    print(f"Attempting Supabase REST API sync to {sb_url}...")
    endpoint = f"{sb_url.rstrip('/')}/rest/v1/collocations"
    
    # Map to database column names (snake_case)
    records = []
    for it in items:
        records.append({
            "id": it["id"],
            "category": it.get("category", "General"),
            "head_word": it["head_word"],
            "tail_chunk": it["tail_chunk"],
            "full_phrase": it["full_phrase"],
            "meaning_vi": it["meaning_vi"],
            "example_sentence": it["example_sentence"],
            "distractors_json": json.dumps(it.get("distractors", []), ensure_ascii=False),
            "cefr_level": it["cefr_level"],
            "ielts_topic": it["ielts_topic"]
        })

    # Batch in 50s
    batch_size = 50
    total_synced = 0
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        req_data = json.dumps(batch).encode('utf-8')
        req = urllib.request.Request(
            f"{endpoint}?on_conflict=id",
            data=req_data,
            headers={
                "apikey": sb_key,
                "Authorization": f"Bearer {sb_key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req) as resp:
                if resp.status in (200, 201):
                    total_synced += len(batch)
        except urllib.error.HTTPError as he:
            err_body = he.read().decode('utf-8', errors='ignore')
            print(f"[Supabase REST Warning] Batch {i//batch_size + 1}: HTTP {he.code} - {err_body[:150]}")
        except Exception as ex:
            print(f"[Supabase REST Error] Batch {i//batch_size + 1}: {ex}")

    print(f"[Supabase REST] Synced {total_synced}/{len(records)} collocations.")

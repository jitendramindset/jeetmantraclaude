# JeetMantra — Local AI plan (Python sidecar)

**Question asked:** *"Can we use Python to take this to the next level — RAG, vector,
offline LLM over user history / feed / downloads / personal docs (notes, image, PDF, Word),
multilingual, end-to-end?"*

**Short answer:** Yes — as a **separate FastAPI sidecar the Node backend proxies to**,
*not* embedded in Node and *not* in the browser. You already have a real RAG spine
(`config/aiProvider.js` multi-provider + `routes/rag.js` extract→chunk→embed→retrieve +
pgvector). Python closes three specific gaps. Everything below is additive; the working
app is untouched until you wire the proxy route.

---

## What the audit actually found (ground truth)

| Capability | Today | Gap |
|---|---|---|
| RAG pipeline | `rag.js` extracts **PDF/TXT/MD/JSON/HTML**, chunks (900/150), embeds (OpenAI), cosine **or** keyword fallback | **DOCX & images skipped** (`rag.js:40`); embeddings **require an OpenAI key** |
| Vector search | `course_embeddings` (pgvector) + `rag_chunks` tables exist | `search.js` semantic route is **stubbed** — always keyword (`search.js:88-98`); no auto-embed job |
| LLM | 4 **cloud** providers, per-user encrypted keys, 5-call/day free tier | **No local/offline LLM** |
| `rag_chunks` table | referenced throughout `rag.js` | **not defined in any migration** (latent bug) |

## Where Python plugs in (exact attach points)

```
upload  ──▶ POST /api/course-content/:id/materials  (courseContent.js:203)
                │  multer saved the file
                ▼
        Node → POST localhost:8000/extract  (Python: DOCX / image-OCR / PDF)
                │  returns { text }
                ▼
        indexContent({courseId, materialId, text})   (rag.js:102)  ← UNCHANGED
                │  chunks → rag_chunks
                ▼
        Node → POST localhost:8000/embed   (sentence-transformers, local, free)
                │  returns { vectors }
                ▼
        write vectors into rag_chunks.embedding (pgvector)
                ▼
retrieveChunks() (rag.js:130) → real cosine search → POST /api/ai/tutor (ai.js:217)
                │  optionally:
                ▼
        Node → POST localhost:8000/tutor   (Ollama, offline-capable)
```

## Honest caveats

- **"Offline LLM in the browser" is not realistic.** A usable 7–8B model needs ~6–8 GB
  RAM/VRAM. "Local" means **on a server or a school's desktop**, not per-student in-browser.
  The browser keeps its existing keyword offline fallback (`offlineTutorAnswer()`).
- **Cloud Claude stays the higher-quality online path** (already wired via `aiProvider.js`,
  `anthropic` provider). Use the local LLM for offline/no-key/cost-sensitive cases; route to
  Claude (`claude-opus-4-8`) when online and quality matters.
- **Tesseract OCR** needs the system binary installed (`apt install tesseract-ocr` /
  Windows installer), not just the pip package.
- **Embedding dimension changes.** `bge-m3` is 1024-dim; the existing `course_embeddings`
  column is 1536-dim (OpenAI). Pick ONE embedding model per table and don't mix vectors.

---

## Run it

```bash
cd backend/python-ai
python -m venv .venv
# Windows: .venv\Scripts\activate    |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000
# (offline LLM) install Ollama, then:  ollama pull llama3.1:8b
```

`GET http://localhost:8000/health` → `{ "status": "ok", ... }`

## Wire it into Node (one proxy route)

Add to `backend/.env`:
```
LOCAL_AI_URL=http://localhost:8000
```

Add to `backend/routes/ai.js` (reuses the existing auth + axios pattern):
```js
const axios = require('axios');
const LOCAL_AI = process.env.LOCAL_AI_URL;

// Extract text from an uploaded DOCX/image/PDF via the Python sidecar.
router.post('/local/extract', authenticateToken, async (req, res) => {
  if (!LOCAL_AI) return res.status(503).json({ error: 'local AI not configured' });
  try {
    const r = await axios.post(`${LOCAL_AI}/extract`, req.body, { timeout: 60000 });
    res.json(r.data);                          // → feed r.data.text into indexContent()
  } catch (e) { res.status(502).json({ error: e.message }); }
});
```
(For file uploads, forward the multer file with `form-data`; for `/embed` and `/tutor`,
forward JSON the same way.)

---

## Phased rollout (recommended order)

1. **Fix the latent bug first** — add the `rag_chunks` migration (SQL below). This is a
   live-DB change; **run only with explicit approval.**
2. **`/extract`** — unlock DOCX + image-OCR + personal-document ingestion. Highest value,
   lowest risk (pure text in/out).
3. **`/embed` + activate `search.js` semantic route** — real vector search, no API key.
   Add a background auto-embed worker (poll `rag_chunks WHERE embedding IS NULL`).
4. **`/tutor` (Ollama)** — offline/local LLM as a fallback provider behind `aiProvider.js`.
5. **Personalization** — re-rank retrieved chunks by the student's weak areas
   (`ai.js:275 /suggest` already reads enrollments + sessions + activity + test scores).

### Step 1 migration (review, then run with approval)

```sql
-- backend/database/migration-rag-chunks.sql
CREATE TABLE IF NOT EXISTS rag_chunks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    text,
  material_id  text,
  source_title text,
  content      text NOT NULL,
  embedding    vector(1024),          -- bge-m3 local; use vector(1536) for OpenAI
  chunk_index  int  NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_course ON rag_chunks (course_id);
-- after embeddings are populated, for fast ANN search:
-- CREATE INDEX ON rag_chunks USING hnsw (embedding vector_cosine_ops);
```

# Japan 2026 — Document Ingestion

Mobile-friendly contract for adding documents to the Belgeler tab.

## Flow

1. Drop new files (any name) into `/resources` at the repo root.
2. Tell Claude Code: **"ingest japan2026 docs"** (or run manually below).
3. Script classifies, copies into `/public/docs/japan2026/`, and upserts metadata into Neon.
4. Reload the room — new docs appear in Belgeler.

## Manual run

```bash
# local dev
npx tsx scripts/japan2026/ingest-docs.ts

# against a deployed environment
BASE_URL=https://your.deploy.app npx tsx scripts/japan2026/ingest-docs.ts
```

The dev server must be running (or `BASE_URL` must point at one) — the script POSTs to `/api/japan2026`.

## Adding a new document category

Edit `RULES` in `scripts/japan2026/ingest-docs.ts`. Each rule:

```ts
{
  match: (name) => name === "exact-filename.pdf",
  owner: "eren" | "zenci" | "ossan" | "shared",
  category: "ticket" | "hotel" | "insurance" | "visa-qr" | "criminal-record" | "misc",
  doc_type: "flight-ticket" | "hotel-confirmation" | ...,
  slug: "short-canonical-label",
  lang: "tr" | "en" | null,
  title: "Human-readable title",
  meta: { /* anything */ },
}
```

Re-run the script. It's idempotent (upserts on `(room, id)` where `id = sha256(originalName).slice(0,16)`).

## Skipped files (intentional)

- `passport.pdf`, IDP, ehliyet — physical-only, never digitize
- `bilet.pdf` — out of scope (bus ticket)
- `jp otel-1.pdf` — duplicate
- `rip.html`, `selected-car.png`, `nissan*.jpg` — Araç tab assets, not user docs

---

## Consume Protocol (for agents)

Classifying a doc into Belgeler is **step 1**. The doc usually contains data that should also flow into other tabs. Step 2 is consuming that data and integrating it.

Each time the user drops a new file in `resources/`, work through this checklist:

### A. Read the file completely
Use the `Read` tool on the PDF or image. Extract every actionable fact:
- People names (and which persona — eren/zenci/ossan/shared)
- Dates and times (with timezone if relevant)
- Reference numbers (PNR, booking, reservation, policy)
- Addresses and phone numbers
- Prices and currencies
- Validity windows (insurance from–to, hotel check-in/out, ticket flight times)
- Any constraints or conditions noted in fine print

### B. Cross-check against existing room data
Look for **conflicts** between the new doc and what's already encoded in `Room.tsx` or Neon:
- Flight times in `FlightLeg` props vs. ticket PDF (Eren's outdated `9OY2JB` ticket vs. Burak's canonical `HAIWZK`)
- Hotel check-out date in IR rows vs. booking confirmation
- Car return time in Araç tab vs. Nissan reservation PDF
- Hardcoded contact numbers in Acil tab vs. doc
- Dates in `ZERO_DAYS` itinerary

If the doc is newer / more authoritative, **the doc wins**. Update Room.tsx and note the resolution in `HUB_STATE.md` under the japan2026 entry's "Source-of-truth resolutions" list.

### C. Integration points (always check these)

| Doc category | Where it must also surface |
|---|---|
| `ticket` | Uçuşlar tab `FlightLeg` schedules · PNR cards · Acil tab "Rezervasyonlar" · Özet tab hero stats and timeline strip |
| `hotel` | Oteller tab `DetSection` · Acil tab Rezervasyonlar · ZERO_DAYS check-in/out events · Belgeler card |
| `car` | Araç tab Rezervasyon `IR` rows · car return event in `ZERO_DAYS` · Acil tab car number · Belgeler "Anahtar dokümanlar" auto-pulls from `category=car` |
| `insurance` | Acil tab "Türk Büyükelçiliği" sub-section if relevant claim phone differs · Checklist "Sağlık & Güvenlik" item gets persona owner |
| `visa-qr` | EXPECTED_DOCS panel — remove the persona's entry if filled · Belgeler grid |
| `criminal-record` | Belgeler grid only (no other tab consumes this) |

### D. Update the heuristic table
Add a new rule in `RULES` (script `scripts/japan2026/ingest-docs.ts`):
- `match` — exact filename (NFC-normalized)
- `meta` — every reference number / date / address you extracted in step A. The richer this object, the more the UI can pull from it later.

If the doc is the third version of something already classified (e.g., updated insurance), **delete the obsolete file's rule** rather than adding a new one. The pipeline upserts on `id = sha256(filename)` so a new filename produces a new row; manually `POST type=document_delete` for the stale one.

### E. Re-run + verify
```bash
npx tsx scripts/japan2026/ingest-docs.ts
```
Expect the new file in `Classified` and 0 in `Unclassified`. If unclassified, add a rule and re-run.

Then visit the affected tabs in the dev server and confirm the integration landed.

### F. Common doc shapes (cheat sheet)

- **MIAT / Enuygun ticket** — `Yolcu`, `PNR`, departure/arrival times, baggage, `Bilet No`. Lives in `ticket` category.
- **Booking.com hotel** — `Booking number`, property name, address, check-in/out, total. `hotel` category.
- **Hepiyi/AXA travel insurance** — `Poliçe No`, `Sigortalı`, `Başlama/Bitiş Tarihi`, `Teminat Limiti`. `insurance` category.
- **Visit Japan Web QR** — Persona's name printed below QR. `visa-qr` category.
- **Adli Sicil Kaydı** — Title is bilingual (TR + JP). Issued by T.C. Adalet Bakanlığı. `criminal-record` category.
- **Nissan Rent a Car reservation** — `Reservation Number`, pickup/dropoff with branch, vehicle, compensation plan, total ¥. `car` category.

### G. When the doc supersedes existing room state
If a doc proves a hardcoded fact in Room.tsx is stale (like Eren's outdated 14:10 schedule), do all three:
1. Update Room.tsx to reflect the canonical value.
2. In `RULES.meta`, mark the outdated source with `outdated_schedule: true` (or analogous flag) — `DocCard` reads this and shows an `ESKİ TARİFELİ` chip on the doc.
3. Add a one-line entry under "Source-of-truth resolutions" in `HUB_STATE.md`.

This keeps the doc accessible (because the user might still need to show it physically) while preventing it from misleading anyone reading the app.

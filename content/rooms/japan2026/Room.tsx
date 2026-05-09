"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── TYPES ──────────────────────────────────────────────────────────────────
type UserName  = "eren" | "zenci" | "ossan";
type CheckState = Record<string, { v: boolean; u?: string; t?: string; d?: string }>;
type ActivityEntry = { user: string; action: "check" | "uncheck"; label: string; time: string; date: string };
type DayEvent  = { id: string; time: string; text: string };
type DayEntry  = { id: string; date: string; day: string; label: string; events: DayEvent[] };
type ClItem    = { id: string; label: string };
type ClSection = { id: string; title: string; crit?: boolean; note?: string; owner?: UserName; items: ClItem[] };
type DocEntry  = {
  id: string; slug: string; owner: UserName | "shared"; category: string;
  doc_type: string; lang: "tr" | "en" | null; title: string;
  original_name: string; public_path: string; size_bytes: number;
  mime: string; meta: Record<string, unknown>; ingested_at: string;
};
type ExpectedDoc = { owner: UserName | "shared"; category: string; title: string; reason?: string };

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────
const C = {
  bg: "#FAFAF8", ink: "#111111", ink2: "#2a2a2a", muted: "#8a8a85",
  line: "#E8E6E0", line2: "#F0EEE8", red: "#BC002D", redSoft: "rgba(188,0,45,.08)",
  serif: "'Fraunces', ui-serif, Georgia, serif",
  sans: "'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
};

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const USERS: Record<UserName, { color: string; letter: string; avatar: string }> = {
  eren:  { color: "#111111", letter: "E", avatar: "/japan2026/avatars/eren.png" },
  zenci: { color: "#BC002D", letter: "Z", avatar: "/japan2026/avatars/zenci.png" },
  ossan: { color: "#637b63", letter: "O", avatar: "/japan2026/avatars/ossan.png" },
};

const DEPARTURE = new Date("2026-05-10T13:20:00");

const TABS = [
  { id: "ozet",      num: "01", label: "Özet" },
  { id: "gunler",    num: "02", label: "Günler" },
  { id: "ucuslar",   num: "03", label: "Uçuşlar" },
  { id: "oteller",   num: "04", label: "Oteller" },
  { id: "arac",      num: "05", label: "Araç" },
  { id: "checklist", num: "06", label: "Checklist" },
  { id: "belgeler",  num: "07", label: "Belgeler" },
  { id: "acil",      num: "08", label: "Acil" },
];

// Docs we know SHOULD exist but haven't been ingested yet.
const EXPECTED_DOCS: ExpectedDoc[] = [
  { owner: "zenci", category: "visa-qr", title: "Visit Japan Web QR", reason: "Eren ve Ossan'da var, Zenci'de eksik." },
];

// ── ZERO-STATE CONSTANTS (seed when DB is empty) ───────────────────────────
function uid() { return crypto.randomUUID(); }

const ZERO_DAYS: DayEntry[] = [
  { id: uid(), date: "10 Mayıs", day: "Pazar", label: "Kalkış günü", events: [
    { id: uid(), time: "09:00", text: "Kahvaltı, son bagaj kontrolü" },
    { id: uid(), time: "10:30", text: "İstanbul Havalimanı'na varış · check-in, bagaj" },
    { id: uid(), time: "11:30", text: "Kapı önü içme · havaalanı barı (uçuş saatine kadar)" },
    { id: uid(), time: "13:20", text: "IST → Ulan Batur kalkış · OM162 · 8 sa 20 dk" },
  ]},
  { id: uid(), date: "11 Mayıs", day: "Pazartesi", label: "Tokyo varış", events: [
    { id: uid(), time: "02:40", text: "Ulan Batur varış · 5 sa 5 dk aktarma · havalimanında takıl" },
    { id: uid(), time: "07:45", text: "Ulan Batur → Tokyo Narita kalkış · OM501 · 5 sa 55 dk" },
    { id: uid(), time: "13:40", text: "Narita varış · pasaport, bagaj, gümrük (Visit Japan QR hazır olsun)" },
    { id: uid(), time: "~14:30", text: "Narita Express → Shinjuku · ~80 dk · doğrudan otele git" },
    { id: uid(), time: "16:00", text: "Hanabi Hotel check-in · bagaj bırak (Hyakunincho 2-8-5)" },
    { id: uid(), time: "Akşam", text: "Shinjuku'da içki & dolaş · Kabukicho ya da Shin-Okubo" },
    { id: uid(), time: "Gece", text: "Hanabi'ye dön · erken yat — sabah 06:00 kalkış" },
  ]},
  { id: uid(), date: "12 Mayıs", day: "Salı", label: "Osaka yolculuğu · Tokyo'da son detour", events: [
    { id: uid(), time: "06:00", text: "Kalk · hızlı kahvaltı · taksiyle Takadanobaba" },
    { id: uid(), time: "07:00", text: "Nissan teslim alma · Takadanobaba 1-35-3 · NOTE e-POWER · araç fotoğrafı çek" },
    { id: uid(), time: "07:30", text: "Yakıt full kontrol · ETC kart · navigasyonu İngilizce'ye al" },
    { id: uid(), time: "07:45", text: "Shibuya Scramble Crossing detour · arabayla geç (Han'ın öldüğü yer) · Hachiko Bridge'den fotoğraf" },
    { id: uid(), time: "08:30", text: "Tokyo → Osaka · Tomei/Meishin Expressway · ~6 saat · ~¥6,000 geçiş" },
    { id: uid(), time: "14:30–15:30", text: "Osaka varış · Hotel Hillarys'e direkt git" },
    { id: uid(), time: "Park", text: "Otelle anlaşıldı — arabayı erken bırakabiliyoruz, valizleri otele teslim et" },
    { id: uid(), time: "Öğleden sonra", text: "Dotonbori, Glico Man, Shinsaibashi · Kuromon Ichiba street food" },
    { id: uid(), time: "20:00+", text: "Hotel Hillarys resmi check-in · erken yat (sabah 06:00 Kyoto kalkış)" },
  ]},
  { id: uid(), date: "13 Mayıs", day: "Çarşamba", label: "Kyoto sabahı · Tokyo'ya geri dönüş", events: [
    { id: uid(), time: "06:00", text: "Kalk · check-out · arabayı al" },
    { id: uid(), time: "07:00", text: "Osaka → Kyoto · ~1 saat" },
    { id: uid(), time: "08:00", text: "Fushimi Inari Taisha · torii gates · sabah erken, kalabalık öncesi" },
    { id: uid(), time: "Geç sabah", text: "Kinkaku-ji · Altın Pavyon" },
    { id: uid(), time: "Öğle", text: "Arashiyama · bambu ormanı · Tenryu-ji" },
    { id: uid(), time: "Öğleden sonra", text: "Hızlı yemek · Nishiki Market ya da yatay yemek" },
    { id: uid(), time: "15:00–16:00", text: "Kyoto → Tokyo · ~6 saat · gece otoyolu" },
    { id: uid(), time: "Gece", text: "Tokyo Hanabi · arabayı sabaha hazır park et" },
  ]},
  { id: uid(), date: "14 Mayıs", day: "Perşembe", label: "Araç iade · Tokyo serbest", events: [
    { id: uid(), time: "06:00", text: "Kalk · arabayı kontrol · yakıt full" },
    { id: uid(), time: "07:00", text: "Nissan iade · Takadanobaba · hasar kontrolü" },
    { id: uid(), time: "—", text: "Tokyo serbest gün — narrative pending" },
  ]},
  { id: uid(), date: "15 Mayıs", day: "Cuma", label: "TBD — narrative pending", events: [
    { id: uid(), time: "—", text: "—" },
  ]},
  { id: uid(), date: "16 Mayıs", day: "Cumartesi", label: "TBD — narrative pending", events: [
    { id: uid(), time: "—", text: "—" },
  ]},
  { id: uid(), date: "17 Mayıs", day: "Pazar", label: "Son tam gün — Tokyo", events: [
    { id: uid(), time: "—", text: "Tokyo'da son tam gün. teamLab, Asakusa, son alışveriş — narrative pending." },
  ]},
  { id: uid(), date: "18 Mayıs", day: "Pazartesi", label: "Eve dönüş başlıyor", events: [
    { id: uid(), time: "Sabah", text: "Hanabi Hotel check-out · 05:00–10:00 arası" },
    { id: uid(), time: "~11:00", text: "Narita Express → Narita HAV · ~80 dk · erken git!" },
    { id: uid(), time: "14:40", text: "Narita → Ulan Batur kalkış · OM502 · 4 sa 35 dk" },
    { id: uid(), time: "19:15", text: "Ulan Batur varış · havalimanında geceleme · 11 sa 40 dk transit" },
  ]},
  { id: uid(), date: "19 Mayıs", day: "Salı", label: "İstanbul varış", events: [
    { id: uid(), time: "06:55", text: "Ulan Batur → İstanbul kalkış · OM161 · 9 sa 30 dk" },
    { id: uid(), time: "11:25", text: "İstanbul Havalimanı varış 🎌 — yolculuk bitti" },
  ]},
];

const ZERO_CHECKLIST: ClSection[] = [
  { id: uid(), title: "Kritik: Araç sürücüsü", crit: true, owner: "eren",
    note: "IDP yanlış formatta olursa araç verilmez. Eren'in sorumluluğunda.",
    items: [
      { id: uid(), label: "Eren'in pasaportu hazır" },
      { id: uid(), label: "Eren'in Türkiye ehliyeti hazır" },
      { id: uid(), label: "Japonya geçerli IDP yanında (Japonya'da çıkarılamaz)" },
      { id: uid(), label: "Rezervasyon ismi = ehliyet = pasaport adı uyumlu" },
      { id: uid(), label: "Kredi kartı limiti depozito için yeterli" },
    ]},
  { id: uid(), title: "Evrak & Giriş",
    items: [
      { id: uid(), label: "Pasaportların geçerlilik tarihi ok (6+ ay)" },
      { id: uid(), label: "Visit Japan Web hesabı açıldı" },
      { id: uid(), label: "Giriş/gümrük formu dolduruldu — QR hazır" },
      { id: uid(), label: "İlk gece adresi girildi: Hanabi Hotel, Shinjuku" },
      { id: uid(), label: "Tüm belgeler offline PDF olarak indirildi" },
    ]},
  { id: uid(), title: "Uçuşlar",
    items: [
      { id: uid(), label: "Gidiş bileti teyit edildi" },
      { id: uid(), label: "Dönüş bileti teyit edildi" },
      { id: uid(), label: "Online check-in yapıldı (24 sa öncesi)" },
      { id: uid(), label: "Koltuk seçimi onaylandı" },
    ]},
  { id: uid(), title: "Oteller",
    items: [
      { id: uid(), label: "Hanabi Hotel teyit edildi (tarih, adres, rez. no)" },
      { id: uid(), label: "Hotel Hillarys teyit edildi (geç check-in 20:00+)" },
      { id: uid(), label: "Otel telefon numaraları kaydedildi" },
      { id: uid(), label: "Osaka için en yakın coin parking araştırıldı" },
    ]},
  { id: uid(), title: "Araç Kiralama",
    items: [
      { id: uid(), label: "Kiralama rezervasyonu teyit edildi" },
      { id: uid(), label: "IDP hazır (Takadanobaba tesliminde gerekli)" },
      { id: uid(), label: "Teslim alma yeri ve saati not alındı" },
      { id: uid(), label: "İade tarihi ve saati not alındı" },
      { id: uid(), label: "ETC kart alınacak (otoyol geçişi için)" },
      { id: uid(), label: "CDW sigortası dahil — onaylandı" },
    ]},
  { id: uid(), title: "Ödeme & Para",
    items: [
      { id: uid(), label: "Kartların yurt dışı kullanımı açıldı" },
      { id: uid(), label: "Nakit yen hazır" },
      { id: uid(), label: "7-Eleven / Japan Post ATM planı var" },
      { id: uid(), label: "Suica/PASMO Apple Wallet'a eklendi" },
    ]},
  { id: uid(), title: "İnternet & Navigasyon",
    items: [
      { id: uid(), label: "eSIM aktif ve test edildi" },
      { id: uid(), label: "Google Maps offline Japonya indirildi" },
      { id: uid(), label: "Google Translate Japonca offline indirildi" },
      { id: uid(), label: "Acil numaralar ve otel adresleri offline kaydedildi" },
    ]},
  { id: uid(), title: "Bavul",
    items: [
      { id: uid(), label: "Pasaport çantada" },
      { id: uid(), label: "Türkiye ehliyeti + IDP çantada" },
      { id: uid(), label: "Universal adaptör (Type A, 100V)" },
      { id: uid(), label: "Powerbank + telefon şarj kabloları" },
      { id: uid(), label: "Yağmurluk / kat kat giyim" },
      { id: uid(), label: "Rahat yürüyüş ayakkabısı" },
    ]},
  { id: uid(), title: "Sağlık & Güvenlik",
    items: [
      { id: uid(), label: "Seyahat sağlık sigortası alındı" },
      { id: uid(), label: "İlaçlar yeterince hazır" },
      { id: uid(), label: "Japonya acil numaraları kaydedildi (110 / 119)" },
    ]},
  { id: uid(), title: "Son 24 saat",
    items: [
      { id: uid(), label: "Pasaport çantada mı?" },
      { id: uid(), label: "Ehliyet + IDP çantada mı?" },
      { id: uid(), label: "Visit Japan Web QR hazır mı?" },
      { id: uid(), label: "Sigorta PDF hazır mı?" },
      { id: uid(), label: "eSIM aktif mi?" },
      { id: uid(), label: "Kartların yurt dışı kullanımı açık mı?" },
      { id: uid(), label: "Powerbank dolu mu?" },
    ]},

  // ── GELMİŞKEN — fun "while we're here" lists ───────────────────────────
  { id: uid(), title: "Gelmişken — JAPONYA",
    items: [
      { id: uid(), label: "Kombini tamago sando dene (7-Eleven en iyisi)" },
      { id: uid(), label: "Counter ramen — vending makinesinden ticket al" },
      { id: uid(), label: "Kaiten sushi (kayan tabakla) en az bir kez" },
      { id: uid(), label: "Vending machine'den BOSS kahvesi" },
      { id: uid(), label: "Vending machine'den weird bir şey dene (Pocari Sweat / corn soup / weird Pepsi)" },
      { id: uid(), label: "Suica/PASMO Apple Wallet'a ekle, kullan" },
      { id: uid(), label: "Kombini onigiri en az 3 farklı dolgu" },
      { id: uid(), label: "Karaoke bir gece (özel oda, sake/highball)" },
      { id: uid(), label: "Onsen ya da sentō (dövme şartı kontrol)" },
      { id: uid(), label: "İzakaya ya da yatay (street food alley) bir akşam" },
      { id: uid(), label: "Don Quijote (Donki) gece keşfi" },
      { id: uid(), label: "Pachinko parlor önünden geç ve ses banyosu yap" },
      { id: uid(), label: "Train station'da ekiben (boxed lunch) bir kez" },
      { id: uid(), label: "100-yen shop / Daiso turu" },
    ]},

  { id: uid(), title: "Gelmişken — Tokyo",
    items: [
      { id: uid(), label: "Shibuya Scramble Crossing — kalabalıkken geç + Hachiko Bridge'den izle" },
      { id: uid(), label: "Hachiko heykeli (Shibuya Station)" },
      { id: uid(), label: "Akihabara — elektronik & manga & retro arcade" },
      { id: uid(), label: "Senso-ji & Nakamise yolu (Asakusa)" },
      { id: uid(), label: "Meiji Jingu Shrine (Harajuku)" },
      { id: uid(), label: "Harajuku Takeshita-dori — kötü tatlar, gençlik" },
      { id: uid(), label: "Tsukiji Outer Market kahvaltı (sashimi & tamago skewer)" },
      { id: uid(), label: "Tokyo Tower ya da Skytree — gece ışığında" },
      { id: uid(), label: "Shinjuku Golden Gai — bir kuytu bar" },
      { id: uid(), label: "Omoide Yokocho — duman içinde yakitori" },
      { id: uid(), label: "Yoyogi Park yürüyüş" },
      { id: uid(), label: "Roppongi Hills observation deck (gün batımı)" },
      { id: uid(), label: "Don Quijote Shibuya 24h" },
      { id: uid(), label: "teamLab Planets Toyosu (online bilet)" },
      { id: uid(), label: "Yanaka Ginza — eski Tokyo sokakları" },
      { id: uid(), label: "Kichijoji + Inokashira Park" },
      { id: uid(), label: "Ueno Park & Ameyoko market" },
      { id: uid(), label: "Game center — UFO catcher dene" },
      { id: uid(), label: "Kabukicho gece yürüyüşü (Robot Restaurant kapısı)" },
    ]},

  { id: uid(), title: "Gelmişken — Osaka",
    items: [
      { id: uid(), label: "Dotonbori canal · Glico Man fotoğrafı" },
      { id: uid(), label: "Kuromon Ichiba Market — taze sashimi & ikayaki (mürekkep balığı çubukta)" },
      { id: uid(), label: "Takoyaki en az 3 farklı yerde dene" },
      { id: uid(), label: "Osaka Castle (Osaka-jo)" },
      { id: uid(), label: "Shinsaibashi-suji shopping street yürüyüş" },
      { id: uid(), label: "Hozenji Yokocho — moss-covered Buddha, dar sokak" },
      { id: uid(), label: "Amerikamura (Ame-mura) — youth district" },
      { id: uid(), label: "Umeda Sky Building — Floating Garden manzara" },
      { id: uid(), label: "Namba'da bir gece izakaya" },
      { id: uid(), label: "Ichiran ramen ya da Kinryu Ramen (golden dragon)" },
      { id: uid(), label: "Shinsekai · Tsutenkaku Tower bölgesi · kushikatsu" },
    ]},

  { id: uid(), title: "Gelmişken — Kyoto",
    items: [
      { id: uid(), label: "Fushimi Inari Taisha — sabah erken, üst kısma çık" },
      { id: uid(), label: "Kinkaku-ji — Altın Pavyon" },
      { id: uid(), label: "Arashiyama Bamboo Grove (sabah)" },
      { id: uid(), label: "Tenryu-ji — bambu yakını, zen bahçesi" },
      { id: uid(), label: "Kiyomizu-dera Temple — sunset" },
      { id: uid(), label: "Gion district akşam yürüyüş — maiko/geiko gör (rahatsız etme)" },
      { id: uid(), label: "Nishiki Market — food stalls" },
      { id: uid(), label: "Pontocho alley — geceleyin lanternlerin altı" },
      { id: uid(), label: "Philosopher's Path" },
      { id: uid(), label: "Sanjusangendo — 1001 buddha" },
      { id: uid(), label: "Bir tea house'da matcha + wagashi" },
      { id: uid(), label: "Yatsuhashi (Kyoto'ya özgü cinnamon mochi) dene" },
    ]},
];

// ── HELPERS ───────────────────────────────────────────────────────────────
function nowStr() {
  const d = new Date();
  const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  return {
    date: `${d.getDate()} ${months[d.getMonth()]}`,
    time: `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`,
  };
}

function getCountdown() {
  const diff = DEPARTURE.getTime() - Date.now();
  if (diff <= 0) return { days: "0", gone: true };
  return { days: String(Math.floor(diff / 86400000)), gone: false };
}

function groupDocs(docs: DocEntry[]): { key: string; variants: DocEntry[] }[] {
  const map = new Map<string, DocEntry[]>();
  for (const d of docs) {
    const k = `${d.owner}__${d.slug}`;
    const arr = map.get(k);
    if (arr) arr.push(d); else map.set(k, [d]);
  }
  // Within a group, prefer EN first then TR for consistent variant order.
  for (const [, arr] of map) {
    arr.sort((a, b) => {
      const order = { en: 0, tr: 1 };
      const ax = a.lang ? order[a.lang] ?? 2 : 3;
      const bx = b.lang ? order[b.lang] ?? 2 : 3;
      return ax - bx;
    });
  }
  return Array.from(map.entries()).map(([key, variants]) => ({ key, variants }));
}

function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: T) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function Japan2026Room() {
  const [user, setUser]           = useState<UserName | null>(null);
  const [activeTab, setActiveTab] = useState("ozet");
  const [clState, setClState]     = useState<CheckState>({});
  const [activity, setActivity]   = useState<ActivityEntry[]>([]);
  const [notes, setNotes]         = useState<Record<number, string>>({});
  const [days, setDays]           = useState<DayEntry[]>([]);
  const [docs, setDocs]           = useState<DocEntry[]>([]);
  const [docFilter, setDocFilter] = useState<"all" | UserName | "shared">("all");
  const [araçNissanOpen, setAraçNissanOpen] = useState<Set<string>>(new Set());
  const [clSchema, setClSchema]   = useState<ClSection[]>([]);
  const [openDays, setOpenDays]   = useState<Set<number>>(new Set([0]));
  const [openSecs, setOpenSecs]   = useState<Set<string>>(new Set());
  const [clSearch, setClSearch]   = useState("");
  const [copied, setCopied]       = useState<string | null>(null);
  const [cdDays, setCdDays]       = useState(getCountdown);
  const [hydrated, setHydrated]   = useState(false);
  const [auth, setAuth]           = useState<"checking" | "locked" | "ok">("checking");
  const [pinInput, setPinInput]   = useState("");
  const [pinError, setPinError]   = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [editingDays, setEditingDays] = useState(false);
  const [editingCl, setEditingCl]     = useState(false);
  const [dragEv, setDragEv]           = useState<{ dayId: string; eventId: string } | null>(null);
  const [dragOverEv, setDragOverEv]   = useState<string | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveDays   = useCallback(debounce((d: DayEntry[]) => {
    fetch("/api/japan2026", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "itinerary", days: d }) }).catch(console.error);
  }, 600), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveSchema = useCallback(debounce((s: ClSection[]) => {
    fetch("/api/japan2026", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "checklist_schema", schema: s }) }).catch(console.error);
  }, 600), []);

  useEffect(() => {
    setHydrated(true);
    const saved = localStorage.getItem("jp26_user") as UserName | null;
    if (saved && USERS[saved]) setUser(saved);
    const iv = setInterval(() => setCdDays(getCountdown()), 60000);
    return () => clearInterval(iv);
  }, []);

  const loadAll = useCallback(() => {
    Promise.all([
      fetch("/api/japan2026?type=checklist").then(r => { if (r.status === 401) throw new Error("locked"); return r.json(); }),
      fetch("/api/japan2026?type=activity").then(r => r.json()),
      fetch("/api/japan2026?type=checklist_schema").then(r => r.json()),
      fetch("/api/japan2026?type=itinerary").then(r => r.json()),
      fetch("/api/japan2026?type=documents").then(r => r.json()),
    ]).then(([cl, act, schema, itinerary, documents]) => {
      setAuth("ok");
      _applyLoaded(cl, act, schema, itinerary, documents);
    }).catch(err => {
      if (err?.message === "locked") setAuth("locked");
      else console.error(err);
    });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _applyLoaded = useCallback((cl: unknown, act: unknown, schema: unknown, itinerary: unknown, documents: unknown) => {
      setClState(cl as CheckState);
      setActivity(act as ActivityEntry[]);
      setDocs((documents as DocEntry[]) ?? []);
      const loadedSchema = schema ?? ZERO_CHECKLIST;
      setClSchema(loadedSchema as ClSection[]);
      setOpenSecs(new Set((loadedSchema as ClSection[]).filter((_, i) => i === loadedSchema.length - 1).map((s: ClSection) => s.id)));
      const loadedDays = itinerary ?? ZERO_DAYS;
      setDays(loadedDays as DayEntry[]);
      // load notes for each day
      (loadedDays as DayEntry[]).forEach((_: DayEntry, i: number) => {
        fetch(`/api/japan2026?type=notes&day=${i}`)
          .then(r => r.json()).then(({ text }: { text: string }) => {
            if (text) setNotes(prev => ({ ...prev, [i]: text }));
          }).catch(() => {});
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    loadAll();
  }, [hydrated, loadAll]);

  const submitPin = useCallback(async () => {
    setPinError(false);
    const res = await fetch("/api/japan2026/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinInput }),
    });
    if (res.ok) { setPinInput(""); loadAll(); }
    else setPinError(true);
  }, [pinInput, loadAll]);

  const doLogin = useCallback((name: UserName) => {
    setUser(name); localStorage.setItem("jp26_user", name); setSwitchOpen(false);
  }, []);

  const copyVal = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id); setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const handleCheck = useCallback((itemId: string, label: string, checked: boolean) => {
    const { date, time } = nowStr();
    setClState(prev => ({
      ...prev,
      [itemId]: checked ? { v: true, u: user ?? "?", t: time, d: date } : { v: false },
    }));
    fetch("/api/japan2026", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "checklist", key: itemId, checked, user: user ?? "?" }),
    }).catch(console.error);
    if (user) {
      const entry: ActivityEntry = { user, action: checked ? "check" : "uncheck", label, time, date };
      setActivity(prev => [entry, ...prev].slice(0, 60));
      fetch("/api/japan2026", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "activity", user, action: entry.action, label }),
      }).catch(console.error);
    }
  }, [user]);

  const handleNote = useCallback((i: number, text: string) => {
    setNotes(prev => ({ ...prev, [i]: text }));
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      fetch("/api/japan2026", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "notes", day: i, text }),
      }).catch(console.error);
    }, 800);
  }, []);

  // ── ITINERARY EDIT HELPERS ────────────────────────────────────────────
  const updateDay = useCallback((dayId: string, patch: Partial<DayEntry>) => {
    setDays(prev => { const next = prev.map(d => d.id === dayId ? { ...d, ...patch } : d); saveDays(next); return next; });
  }, [saveDays]);

  const updateEvent = useCallback((dayId: string, evId: string, patch: Partial<DayEvent>) => {
    setDays(prev => { const next = prev.map(d => d.id === dayId ? { ...d, events: d.events.map(e => e.id === evId ? { ...e, ...patch } : e) } : d); saveDays(next); return next; });
  }, [saveDays]);

  const addEvent = useCallback((dayId: string) => {
    setDays(prev => { const next = prev.map(d => d.id === dayId ? { ...d, events: [...d.events, { id: uid(), time: "", text: "" }] } : d); saveDays(next); return next; });
  }, [saveDays]);

  const removeEvent = useCallback((dayId: string, evId: string) => {
    setDays(prev => { const next = prev.map(d => d.id === dayId ? { ...d, events: d.events.filter(e => e.id !== evId) } : d); saveDays(next); return next; });
  }, [saveDays]);

  const reorderEvent = useCallback((dayId: string, fromId: string, toId: string) => {
    if (fromId === toId) return;
    setDays(prev => {
      const next = prev.map(d => {
        if (d.id !== dayId) return d;
        const fromIdx = d.events.findIndex(e => e.id === fromId);
        const toIdx   = d.events.findIndex(e => e.id === toId);
        if (fromIdx < 0 || toIdx < 0) return d;
        const events = [...d.events];
        const [moved] = events.splice(fromIdx, 1);
        events.splice(toIdx, 0, moved);
        return { ...d, events };
      });
      saveDays(next);
      return next;
    });
  }, [saveDays]);

  const addDay = useCallback(() => {
    setDays(prev => { const next = [...prev, { id: uid(), date: "", day: "", label: "", events: [] }]; saveDays(next); return next; });
  }, [saveDays]);

  const removeDay = useCallback((dayId: string) => {
    setDays(prev => { const next = prev.filter(d => d.id !== dayId); saveDays(next); return next; });
  }, [saveDays]);

  // ── CHECKLIST EDIT HELPERS ────────────────────────────────────────────
  const updateSection = useCallback((secId: string, patch: Partial<ClSection>) => {
    setClSchema(prev => { const next = prev.map(s => s.id === secId ? { ...s, ...patch } : s); saveSchema(next); return next; });
  }, [saveSchema]);

  const moveSection = useCallback((secId: string, dir: -1 | 1) => {
    setClSchema(prev => {
      const i = prev.findIndex(s => s.id === secId);
      if (i < 0 || i + dir < 0 || i + dir >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      saveSchema(next); return next;
    });
  }, [saveSchema]);

  const removeSection = useCallback((secId: string) => {
    setClSchema(prev => { const next = prev.filter(s => s.id !== secId); saveSchema(next); return next; });
  }, [saveSchema]);

  const addSection = useCallback(() => {
    setClSchema(prev => { const next = [...prev, { id: uid(), title: "Yeni kategori", items: [] }]; saveSchema(next); return next; });
  }, [saveSchema]);

  const updateItem = useCallback((secId: string, itemId: string, label: string) => {
    setClSchema(prev => { const next = prev.map(s => s.id === secId ? { ...s, items: s.items.map(it => it.id === itemId ? { ...it, label } : it) } : s); saveSchema(next); return next; });
  }, [saveSchema]);

  const addItem = useCallback((secId: string) => {
    setClSchema(prev => { const next = prev.map(s => s.id === secId ? { ...s, items: [...s.items, { id: uid(), label: "" }] } : s); saveSchema(next); return next; });
  }, [saveSchema]);

  const removeItem = useCallback((secId: string, itemId: string) => {
    setClSchema(prev => { const next = prev.map(s => s.id === secId ? { ...s, items: s.items.filter(it => it.id !== itemId) } : s); saveSchema(next); return next; });
  }, [saveSchema]);

  const clTotal = clSchema.reduce((a, s) => a + s.items.length, 0);
  const clDone  = clSchema.reduce((a, s) => a + s.items.filter(it => clState[it.id]?.v).length, 0);
  const clPct   = clTotal ? Math.round((clDone / clTotal) * 100) : 0;

  if (!hydrated) return null;
  if (auth === "checking") return null;

  // ── PIN GATE ─────────────────────────────────────────────────────────────
  if (auth === "locked") {
    return (
      <div style={{ fontFamily: C.sans, minHeight: "100vh", background: C.bg, color: C.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&display=swap');`}</style>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "520px", height: "520px", borderRadius: "50%", background: C.red, transform: "translate(-50%,-50%)", opacity: .045, filter: "blur(.5px)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "440px", width: "100%" }}>
          <div style={{ fontFamily: C.sans, fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginBottom: "36px" }}>Japan · 2026</div>
          <h1 style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "clamp(40px,6vw,72px)", letterSpacing: "-.04em", lineHeight: .95, marginBottom: "20px" }}>
            Özel <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>oda</em><span style={{ color: C.red }}>.</span>
          </h1>
          <p style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "18px", color: C.muted, marginBottom: "44px", letterSpacing: "-.01em" }}>
            Şifre gerekiyor.
          </p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pinInput}
            onChange={e => { setPinInput(e.target.value); setPinError(false); }}
            onKeyDown={e => { if (e.key === "Enter") submitPin(); }}
            placeholder="••••"
            style={{
              width: "100%",
              padding: "20px 24px",
              fontSize: "28px",
              letterSpacing: ".5em",
              textAlign: "center",
              fontFamily: C.serif,
              fontWeight: 300,
              border: `1px solid ${pinError ? C.red : C.line}`,
              background: "transparent",
              color: C.ink,
              outline: "none",
              fontVariantNumeric: "tabular-nums",
              transition: "border-color .15s",
            }}
          />
          {pinError && (
            <p style={{ marginTop: "16px", fontSize: "12px", color: C.red, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 500 }}>Yanlış şifre</p>
          )}
          <button onClick={submitPin}
            style={{ marginTop: "28px", padding: "16px 40px", border: `1px solid ${C.ink}`, background: C.ink, color: "#fff", fontSize: "12px", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 500, minWidth: "160px" }}>
            Aç
          </button>
        </div>
        <div style={{ position: "absolute", bottom: "32px", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>
          afroxhub · rooms · japan2026
        </div>
      </div>
    );
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ fontFamily: C.sans, minHeight: "100vh", background: C.bg, color: C.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&display=swap');`}</style>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "520px", height: "520px", borderRadius: "50%", background: C.red, transform: "translate(-50%,-50%)", opacity: .045, filter: "blur(.5px)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "560px" }}>
          <div style={{ fontFamily: C.sans, fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginBottom: "36px" }}>Japan · 2026</div>
          <h1 style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "clamp(48px,7vw,92px)", letterSpacing: "-.045em", lineHeight: .95, marginBottom: "24px" }}>
            Kim <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>burada</em><span style={{ color: C.red }}>.</span>
          </h1>
          <p style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "20px", color: C.muted, marginBottom: "64px", letterSpacing: "-.01em" }}>
            İsmini seç ve odaya gir.
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            {(["eren", "zenci", "ossan"] as UserName[]).map(name => (
              <LoginBtn key={name} onClick={() => doLogin(name)} avatar={USERS[name].avatar}>{name.charAt(0).toUpperCase() + name.slice(1)}</LoginBtn>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "32px", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>
          afroxhub · rooms · japan2026
        </div>
      </div>
    );
  }

  const u = USERS[user];

  // ── MAIN ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: C.sans, minHeight: "100vh", background: C.bg, color: C.ink, WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${C.red}; color: #fff; }
        a { color: inherit; text-decoration: none; }
        button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
        input, textarea { font: inherit; color: inherit; }
      `}</style>

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,250,248,.88)", backdropFilter: "saturate(180%) blur(14px)", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: C.red, flexShrink: 0 }} />
            <span style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "18px", letterSpacing: "-.02em" }}>
              Japan 2026 <em style={{ fontStyle: "italic", color: C.muted, fontWeight: 300, marginLeft: "2px" }}>· Mayıs</em>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "15px", letterSpacing: "-.01em", color: C.ink2 }}>
              <b style={{ fontWeight: 500, color: C.red, fontStyle: "italic" }}>{cdDays.gone ? "Gidiyoruz!" : cdDays.days}</b>
              {!cdDays.gone && " gün kaldı"}
            </div>
            <button onClick={() => setSwitchOpen(true)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 14px 5px 5px", border: `1px solid ${C.line}`, borderRadius: "999px", fontSize: "12px", fontWeight: 500, letterSpacing: ".04em", transition: "border-color .15s" }}>
              <img src={u.avatar} alt={user} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", display: "block" }} />
              {user.charAt(0).toUpperCase() + user.slice(1)}
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav style={{ position: "sticky", top: "69px", zIndex: 49, background: "rgba(250,250,248,.88)", backdropFilter: "saturate(180%) blur(14px)", borderBottom: `1px solid ${C.line}`, overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 40px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: "18px 18px 16px", fontSize: "12px", fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase", color: activeTab === t.id ? C.ink : C.muted, borderBottom: `1px solid ${activeTab === t.id ? C.red : "transparent"}`, marginBottom: "-1px", whiteSpace: "nowrap", transition: "color .15s, border-color .15s" }}>
              <span style={{ fontSize: "9px", color: activeTab === t.id ? C.red : C.muted, marginRight: "6px", letterSpacing: ".05em", fontVariantNumeric: "tabular-nums" }}>{t.num}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* PANELS */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>

        {/* ═══ ÖZET ═══ */}
        {activeTab === "ozet" && (
          <div>
            <div style={{ position: "relative", padding: "120px 0 100px", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "50%", right: "-180px", width: "720px", height: "720px", borderRadius: "50%", background: C.red, transform: "translateY(-50%)", zIndex: 0, opacity: .06 }} />
              <div style={{ position: "relative", zIndex: 1, maxWidth: "880px" }}>
                <div style={{ fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginBottom: "36px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ display: "inline-block", width: "36px", height: "1px", background: C.ink }} />
                  Issue 01 · İlkbahar
                </div>
                <h1 style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "clamp(72px,10vw,156px)", letterSpacing: "-.05em", lineHeight: .92, marginBottom: "36px" }}>
                  <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>{cdDays.gone ? "🎌" : cdDays.days}</em> gün<br />Japonya<span style={{ color: C.red }}>.</span>
                </h1>
                <p style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "24px", color: C.ink2, maxWidth: "600px", letterSpacing: "-.01em", lineHeight: 1.4 }}>
                  Üç yolcu için küçük bir oda — Eren, Zenci ve Ossan — gitmeden önce her parçayı yerine oturtmak için.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: `1px solid ${C.line}`, paddingTop: "44px", marginBottom: "120px" }}>
              {[
                { label: "Hareket", value: "10", unit: "Mayıs", sub: "Pazar · İstanbul Havalimanı\nIST → ULN, OM162 · 13:20" },
                { label: "Tokyo Varış", value: "11", unit: "Mayıs", sub: "Pazartesi · Narita 13:40\nHanabi check-in ~16:00" },
                { label: "Japonya'da", value: "7", unit: "gün", sub: "6 gece Tokyo · 1 Osaka\n12–14 Mayıs araçlı" },
                { label: "Checklist", value: String(clPct), unit: "%", sub: `${clDone} / ${clTotal} tamamlandı\n${clPct === 100 ? "Her şey hazır 🎉" : "Devam ediyor"}` },
              ].map((s, i) => (
                <div key={i} style={{ paddingRight: "32px", borderRight: i < 3 ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ fontSize: "10px", letterSpacing: ".28em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginBottom: "18px" }}>{s.label}</div>
                  <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "54px", letterSpacing: "-.04em", lineHeight: 1, marginBottom: "10px" }}>
                    {s.value} <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>{s.unit}</em>
                  </div>
                  <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.5, whiteSpace: "pre-line" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "80px", paddingTop: "80px", borderTop: `1px solid ${C.line}`, marginBottom: "80px" }}>
              <div>
                <Eyebrow num="02">Seyahat takvimi</Eyebrow>
                <div>
                  {[
                    { date: "10 May", day: "Pazar",     title: "Kalkış günü",     desc: "İstanbul Havalimanı'nda toplan. OM162 13:20'de kalkıyor. Ulan Batur aktarmalı." },
                    { date: "11 May", day: "Pazartesi", title: "Tokyo varış",     desc: "OM501 Narita'ya 13:40'ta iner. Narita Express → Shinjuku · Hanabi Hotel ~16:00 check-in. Akşam Shinjuku takılması." },
                    { date: "12 May", day: "Salı",      title: "Osaka yolculuğu", desc: "07:00 Takadanobaba'dan Nissan NOTE e-POWER. Tomei/Meishin ~6 saat batıya. Hotel Hillarys'e arabayı erken bırak (anlaşıldı). Dotonbori, Glico Man. 20:00+ resmi check-in." },
                    { date: "13 May", day: "Çarşamba",  title: "Osaka — TBD",     desc: "Plan beklemede. Kyoto side-trip muhtemel — geceyi Tokyo'da yatma şartı (sabah 14 May 07:00 araç iadesi)." },
                    { date: "14 May", day: "Perşembe",  title: "Araç iadesi",     desc: "07:00 Takadanobaba'da Nissan iadesi. Yakıt full, hasar kontrolü. Sonrası TBD." },
                    { date: "15–17 May", day: "Tokyo",  title: "Serbest günler",  desc: "Plan beklemede — narrative pending." },
                    { date: "18 May", day: "Pazartesi", title: "Eve dönüş başlıyor", desc: "Hanabi check-out 05:00–10:00. Narita Express, OM502 14:40'ta kalkıyor. Ulan Batur'da gece geçer." },
                    { date: "19 May", day: "Salı",      title: "İstanbul varış",  desc: "OM161 İstanbul'a 11:25'te iner. Yolculuk bitti 🎌" },
                  ].map((row, i, arr) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "32px", padding: "22px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line2}` : "none", alignItems: "baseline" }}>
                      <div>
                        <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "22px", letterSpacing: "-.02em", lineHeight: 1.1 }}>{row.date}</div>
                        <small style={{ display: "block", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: C.muted, marginTop: "4px", fontFamily: C.sans, fontWeight: 500 }}>{row.day}</small>
                      </div>
                      <div>
                        <h4 style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "20px", letterSpacing: "-.02em", marginBottom: "6px" }}>{row.title}</h4>
                        <p style={{ fontSize: "14px", color: C.ink2, lineHeight: 1.65, maxWidth: "560px" }}>{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside>
                <Eyebrow num="03">Son aktiviteler</Eyebrow>
                {activity.length === 0
                  ? <p style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, color: C.muted, fontSize: "16px", padding: "32px 0", lineHeight: 1.6 }}>— sessiz bir sabah. Checklist'ten bir şey işaretle.</p>
                  : <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "24px" }}>
                      {activity.slice(0, 12).map((e, i) => {
                        const eu = USERS[e.user as UserName] ?? { color: C.muted };
                        return (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "14px", alignItems: "baseline", fontSize: "13px", paddingBottom: "14px", borderBottom: i < Math.min(11, activity.length - 1) ? `1px solid ${C.line2}` : "none" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: eu.color, alignSelf: "center" }} />
                            <span>{e.action === "check" ? "✓" : "↩"} <strong>{e.user}</strong> · {e.label}</span>
                            <span style={{ fontSize: "11px", color: C.muted, fontVariantNumeric: "tabular-nums", letterSpacing: ".04em" }}>{e.time}</span>
                          </div>
                        );
                      })}
                    </div>
                }
              </aside>
            </div>

            <div style={{ paddingBottom: "80px", paddingTop: "60px", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>
              <span>Japan 2026 — özel bir oda</span>
              <span>Eren, Zenci, Ossan için</span>
            </div>
          </div>
        )}

        {/* ═══ GÜNLER ═══ */}
        {activeTab === "gunler" && (
          <div>
            <div style={{ padding: "80px 0 48px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: `1px solid ${C.line}` }}>
              <div>
                <h1 style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "clamp(48px,6vw,84px)", letterSpacing: "-.04em", lineHeight: 1 }}>
                  Günler<em style={{ fontStyle: "italic", color: C.red }}>.</em>
                </h1>
                <p style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "18px", color: C.muted, lineHeight: 1.5, marginTop: "12px" }}>
                  {editingDays ? "Düzenleme modu — her alan tıklanabilir." : "Bir güne tıkla, saatleri gör ve not bırak."}
                </p>
              </div>
              <button onClick={() => setEditingDays(e => !e)}
                style={{ padding: "10px 22px", border: `1px solid ${editingDays ? C.red : C.line}`, fontSize: "11px", fontWeight: 500, letterSpacing: ".22em", textTransform: "uppercase", color: editingDays ? C.red : C.muted, transition: "all .18s", flexShrink: 0, marginLeft: "32px" }}>
                {editingDays ? "Bitti ✓" : "Düzenle"}
              </button>
            </div>

            <div style={{ paddingBottom: "100px" }}>
              {days.map((d, i) => {
                const isOpen = openDays.has(i) || editingDays;
                return (
                  <div key={d.id} style={{ borderBottom: `1px solid ${C.line}`, padding: "36px 0", display: "grid", gridTemplateColumns: "200px 1fr 60px", gap: "48px", alignItems: "start" }}>
                    {/* Date column */}
                    <div style={{ position: "sticky", top: "140px", cursor: editingDays ? "default" : "pointer" }} onClick={() => !editingDays && setOpenDays(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; })}>
                      {editingDays ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <input value={d.date} onChange={ev => updateDay(d.id, { date: ev.target.value })}
                            placeholder="10 Mayıs"
                            style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "28px", letterSpacing: "-.02em", lineHeight: 1, border: "none", borderBottom: `1px solid ${C.line}`, background: "transparent", outline: "none", width: "100%", color: C.ink }} />
                          <input value={d.day} onChange={ev => updateDay(d.id, { day: ev.target.value })}
                            placeholder="Pazar"
                            style={{ fontFamily: C.sans, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500, border: "none", borderBottom: `1px solid ${C.line2}`, background: "transparent", outline: "none", width: "100%" }} />
                          <input value={d.label} onChange={ev => updateDay(d.id, { label: ev.target.value })}
                            placeholder="Gün başlığı"
                            style={{ fontFamily: C.serif, fontStyle: "italic", fontSize: "16px", color: C.ink2, fontWeight: 300, border: "none", borderBottom: `1px solid ${C.line2}`, background: "transparent", outline: "none", width: "100%" }} />
                          <button onClick={() => removeDay(d.id)} style={{ marginTop: "8px", fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: C.red, fontWeight: 500, textAlign: "left" }}>
                            × Günü sil
                          </button>
                        </div>
                      ) : (
                        <div style={{ cursor: "pointer" }}>
                          <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "64px", letterSpacing: "-.04em", lineHeight: .9 }}>
                            {d.date.split(" ")[0]} <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>{d.date.split(" ")[1]}</em>
                          </div>
                          <div style={{ fontFamily: C.sans, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, marginTop: "14px", fontWeight: 500 }}>{d.day}</div>
                          <div style={{ fontFamily: C.serif, fontStyle: "italic", fontSize: "18px", color: C.ink2, marginTop: "12px", fontWeight: 300, letterSpacing: "-.01em" }}>{d.label}</div>
                        </div>
                      )}
                    </div>

                    {/* Events column */}
                    <div onClick={!editingDays ? e => { e.stopPropagation(); } : undefined}>
                      <div style={{ overflow: "hidden", maxHeight: isOpen ? "none" : 0 }}>
                        {editingDays ? (
                          <div>
                            {d.events.map((ev, ei) => {
                              const isOver = dragOverEv === ev.id && dragEv?.dayId === d.id && dragEv?.eventId !== ev.id;
                              return (
                                <div key={ev.id}
                                  onDragOver={e => { if (dragEv?.dayId === d.id) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverEv(ev.id); } }}
                                  onDragLeave={() => setDragOverEv(prev => prev === ev.id ? null : prev)}
                                  onDrop={e => {
                                    if (dragEv?.dayId === d.id && dragEv.eventId !== ev.id) {
                                      e.preventDefault();
                                      reorderEvent(d.id, dragEv.eventId, ev.id);
                                    }
                                    setDragEv(null); setDragOverEv(null);
                                  }}
                                  style={{ display: "grid", gridTemplateColumns: "20px 100px 1fr 28px", gap: "10px", padding: "10px 0", borderTop: ei > 0 ? `1px solid ${C.line2}` : "none", alignItems: "center", borderBottom: isOver ? `2px solid ${C.red}` : undefined, background: dragEv?.eventId === ev.id ? C.line2 : "transparent", transition: "background .15s" }}>
                                  <span draggable={true}
                                    onDragStart={e => { setDragEv({ dayId: d.id, eventId: ev.id }); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", ev.id); }}
                                    onDragEnd={() => { setDragEv(null); setDragOverEv(null); }}
                                    title="Sürükle"
                                    style={{ cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, userSelect: "none" }}>
                                    <DragDots />
                                  </span>
                                  <input value={ev.time} onChange={e => updateEvent(d.id, ev.id, { time: e.target.value })}
                                    placeholder="Saat"
                                    style={{ fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: C.muted, fontWeight: 500, border: "none", borderBottom: `1px solid ${C.line2}`, background: "transparent", outline: "none", width: "100%" }} />
                                  <input value={ev.text} onChange={e => updateEvent(d.id, ev.id, { text: e.target.value })}
                                    placeholder="Etkinlik açıklaması"
                                    style={{ fontSize: "15px", color: C.ink, border: "none", borderBottom: `1px solid ${C.line2}`, background: "transparent", outline: "none", width: "100%" }} />
                                  <button onClick={() => removeEvent(d.id, ev.id)} style={{ color: C.muted, fontSize: "16px", lineHeight: 1, flexShrink: 0, transition: "color .15s" }}
                                    onMouseEnter={e => (e.currentTarget.style.color = C.red)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>×</button>
                                </div>
                              );
                            })}
                            <button onClick={() => addEvent(d.id)}
                              style={{ marginTop: "16px", fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500, display: "flex", alignItems: "center", gap: "8px", transition: "color .15s" }}
                              onMouseEnter={e => (e.currentTarget.style.color = C.ink)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                              + Etkinlik ekle
                            </button>
                            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${C.line2}` }}>
                              <label style={{ fontSize: "10px", letterSpacing: ".26em", textTransform: "uppercase", color: C.muted, fontWeight: 500, display: "block", marginBottom: "10px" }}>Notlar</label>
                              <textarea value={notes[i] ?? ""} onChange={ev => handleNote(i, ev.target.value)}
                                placeholder="Bu güne ait plan, adres, hatırlatıcı…"
                                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "17px", color: C.ink, lineHeight: 1.55, resize: "none", letterSpacing: "-.01em", minHeight: "48px" }} />
                            </div>
                          </div>
                        ) : (
                          <div>
                            {d.events.map((ev, ei) => (
                              <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "24px", padding: "14px 0", borderTop: ei > 0 ? `1px solid ${C.line2}` : "none", alignItems: "baseline" }}>
                                <div style={{ fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: C.muted, fontWeight: 500, fontVariantNumeric: "tabular-nums", paddingTop: "2px" }}>{ev.time}</div>
                                <div style={{ fontSize: "15px", lineHeight: 1.6, color: C.ink2 }}>{ev.text}</div>
                              </div>
                            ))}
                            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${C.line2}` }}>
                              <label style={{ fontSize: "10px", letterSpacing: ".26em", textTransform: "uppercase", color: C.muted, fontWeight: 500, display: "block", marginBottom: "10px" }}>Notlar</label>
                              <textarea value={notes[i] ?? ""} onChange={ev => handleNote(i, ev.target.value)}
                                placeholder="Bu güne ait plan, adres, hatırlatıcı…"
                                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "17px", color: C.ink, lineHeight: 1.55, resize: "none", letterSpacing: "-.01em", minHeight: "48px" }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Toggle chevron (hidden in edit mode) */}
                    {!editingDays && (
                      <div onClick={() => setOpenDays(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; })}
                        style={{ fontFamily: C.serif, fontSize: "24px", color: isOpen ? C.red : C.muted, textAlign: "right", lineHeight: 1, paddingTop: "8px", transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .25s", fontWeight: 300, cursor: "pointer" }}>+</div>
                    )}
                  </div>
                );
              })}

              {editingDays && (
                <div style={{ padding: "32px 0", borderBottom: `1px solid ${C.line}` }}>
                  <button onClick={addDay}
                    style={{ fontSize: "13px", fontWeight: 500, letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, display: "flex", alignItems: "center", gap: "12px", transition: "color .18s", padding: "14px 0" }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.ink)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                    <span style={{ fontSize: "20px", lineHeight: 1, fontWeight: 300, fontFamily: C.serif }}>+</span> Gün ekle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ UÇUŞLAR ═══ */}
        {activeTab === "ucuslar" && (
          <div>
            <TabHead title="Uçuşlar" lede="MIAT Mongolian Airlines, Ulan Batur üzerinden. İki aktarma — biri kısa, biri geceleme." />
            <div style={{ paddingBottom: "120px" }}>
              <DetSection title="Gidiş" titleEm="10 / 11 Mayıs" sub="İstanbul · Ulan Batur · Tokyo Narita">
                <FlightBlock>
                  <FlightLeg from={{ time: "13:20", code: "IST", name: "İstanbul Havalimanı", date: "Paz, 10 Mayıs" }} to={{ time: "02:40", code: "ULN", name: "Chinggis Khaan", date: "Pzt, 11 Mayıs" }} flight="OM162 · Eko V" dur="8sa 20dk" />
                  <Layover>— Ulan Batur aktarma · 5 sa 5 dk —</Layover>
                  <FlightLeg from={{ time: "07:45", code: "ULN", name: "Chinggis Khaan", date: "Pzt, 11 Mayıs" }} to={{ time: "13:40", code: "NRT", name: "Narita Int'l", date: "Pzt, 11 Mayıs" }} flight="OM501 · Eko V" dur="5sa 55dk" />
                </FlightBlock>
              </DetSection>

              <DetSection title="Dönüş" titleEm="18 / 19 Mayıs" sub="Tokyo Narita · Ulan Batur · İstanbul">
                <FlightBlock>
                  <FlightLeg from={{ time: "14:40", code: "NRT", name: "Narita Int'l", date: "Pzt, 18 Mayıs" }} to={{ time: "19:15", code: "ULN", name: "Chinggis Khaan", date: "Pzt, 18 Mayıs" }} flight="OM502 · Eko V" dur="4sa 35dk" />
                  <Layover>— Ulan Batur'da geceleme · 11 sa 40 dk —</Layover>
                  <FlightLeg from={{ time: "06:55", code: "ULN", name: "Chinggis Khaan", date: "Sal, 19 Mayıs" }} to={{ time: "11:25", code: "IST", name: "İstanbul Havalimanı", date: "Sal, 19 Mayıs" }} flight="OM161 · Eko V" dur="9sa 30dk" />
                </FlightBlock>
                <InfoGrid>
                  <div>
                    <IR label="Havayolu" val="MIAT Mongolian" />
                    <IR label="Kabin" val="Ekonomi · V sınıfı" />
                    <IR label="Bagaj" val="1 × 23 kg / uçuş" />
                  </div>
                  <div>
                    <IR label="Toplam (Eren)" val="28.821,31 ₺" />
                    <IR label="Acente" val="Enuygun · 0850 333 88 88" href="tel:+908503338888" />
                  </div>
                </InfoGrid>
              </DetSection>

              <DetSection title="Yolcu PNR'ları" titleEm="·" sub="Herkes hepsini görüyor. Kendi PNR'ın yıldızlı.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "8px" }}>
                  {([
                    { who: "eren" as UserName, pnr: "9OY2JB", note: "ESKİ TARİFELİ — gerçek kalkış 13:20", warn: true },
                    { who: "zenci" as UserName, pnr: "HAIWZK / 9NVSB3", note: "MIAT canlı tarife", warn: false },
                    { who: "ossan" as UserName, pnr: "—", note: "PNR henüz dijital değil", warn: false, missing: true },
                  ] as const).map(card => {
                    const isMe = user === card.who;
                    const u2 = USERS[card.who];
                    return (
                      <div key={card.who} style={{ padding: "20px 22px", border: `1px solid ${isMe ? C.red : C.line}`, background: isMe ? C.redSoft : "transparent", position: "relative" }}>
                        {isMe && <span style={{ position: "absolute", top: "10px", right: "12px", fontSize: "10px", color: C.red, letterSpacing: ".2em", fontWeight: 600 }}>★ SEN</span>}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: u2.color }} />
                          <span style={{ fontFamily: C.sans, fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>{card.who}</span>
                        </div>
                        <div style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "22px", letterSpacing: "-.01em", marginBottom: "6px", fontVariantNumeric: "tabular-nums" }}>{card.pnr}</div>
                        <div style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "13px", color: card.warn ? C.red : C.muted, lineHeight: 1.5 }}>{card.note}</div>
                      </div>
                    );
                  })}
                </div>
              </DetSection>
            </div>
          </div>
        )}

        {/* ═══ OTELLER ═══ */}
        {activeTab === "oteller" && (
          <div>
            <TabHead title="Oteller" lede="Shinjuku'da bir hafta, Namba'da bir gece." />
            <div style={{ paddingBottom: "120px" }}>
              <DetSection title="Hanabi Hotel" titleEm="ハナビホテル" sub="Tokyo · Shinjuku-ku · 7 gece">
                <img src="/japan2026/hotels/hanabi.jpg" alt="Hanabi Hotel" style={{ width: "100%", height: "auto", maxHeight: "360px", objectFit: "cover", marginBottom: "24px", border: `1px solid ${C.line}` }} />
                <InfoGrid style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                  <div>
                    <IR label="Adres" val="Hyakunincho 2-8-5, Shinjuku-ku" />
                    <IR label="Check-in" val="11 Mayıs · 15:00" />
                    <IR label="Check-out" val="18 Mayıs · 05:00–10:00" />
                    <IR label="Oda" val="Japon tarzı · 3 yetişkin · 3 futon" />
                    <IR label="Rezervasyon adı" val="Kahraman Burak" />
                    <IR label="Telefon" val="+81 3 3366 9688" href="tel:+81333669688" />
                  </div>
                  <div>
                    <IR label="Rezervasyon" val="5001.805.511" copy id="hanabi" copied={copied} onCopy={copyVal} />
                    <IR label="PIN" val="4826" copy id="pin" copied={copied} onCopy={copyVal} />
                    <IR label="Fiyat" val="¥143,329 (~₺40,343)" />
                    <IR label="Wi-Fi" val="Ücretsiz · genel" />
                    <IR label="Otopark" val="¥2,000 / gün" />
                    <IR label="En yakın istasyon" val="Shin-Okubo · Yamanote" />
                  </div>
                </InfoGrid>
                <a href="https://maps.google.com/?q=Shinjuku-ku+Hyakunincho+2-8-5+Tokyo" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "12px 22px", border: `1px solid ${C.ink}`, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 500, marginTop: "24px", color: C.ink }}>
                  Haritada göster →
                </a>
                <NoteBox>Narita Express → Shinjuku (~80 dk) → Yamanote bir durak → Shin-Okubo → 3 dk yürüyüş.</NoteBox>
                <NoteBox type="red">4 Mayıs sonrası iade yok. Rezervasyon kesinleşmiş sayılır.</NoteBox>
              </DetSection>

              <DetSection title="Hotel Hillarys" titleEm="ホテルヒラリーズ" sub="Osaka · Naniwa-ku · 1 gece">
                <img src="/japan2026/hotels/hillarys.jpg" alt="Hotel Hillarys" style={{ width: "100%", height: "auto", maxHeight: "360px", objectFit: "cover", marginBottom: "24px", border: `1px solid ${C.line}` }} />
                <InfoGrid style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                  <div>
                    <IR label="Adres" val="Nippombashi 3-4-10, Naniwa-ku" />
                    <IR label="Check-in" val="12 Mayıs · 20:00+ (geç)" />
                    <IR label="Check-out" val="13 Mayıs · Çarşamba" />
                    <IR label="Oda" val="3 yetişkin · standart" />
                    <IR label="Rezervasyon adı" val="Oğuzhan Eren" />
                    <IR label="Posta kodu" val="556-0006" />
                  </div>
                  <div>
                    <IR label="Rezervasyon" val="6237128862" copy id="hillarys" copied={copied} onCopy={copyVal} />
                    <IR label="Fiyat" val="¥9,210 · ödendi" />
                    <IR label="Wi-Fi" val="Ücretsiz · genel" />
                    <IR label="Otopark" val="Anlaşıldı (otel araba erken alır)" />
                    <IR label="En yakın istasyon" val="Nippombashi · Sennichimae" />
                    <IR label="Mahalle" val="Dotonbori 8 dk yürüyüş" />
                  </div>
                </InfoGrid>
                <a href="https://maps.google.com/?q=Naniwa-ku+Nippombashi+3-4-10+Osaka" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "12px 22px", border: `1px solid ${C.ink}`, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 500, marginTop: "24px", color: C.ink }}>
                  Haritada göster →
                </a>
                <NoteBox type="red">Resmi check-in 20:00 sonrası, ama otelle önceden konuşuldu — geç saatte gelsek bile arabayı erken bırakabiliyoruz.</NoteBox>
              </DetSection>
            </div>
          </div>
        )}

        {/* ═══ ARAÇ ═══ */}
        {activeTab === "arac" && (
          <div>
            <TabHead title="Araç" lede="Nissan NOTE e-POWER · 12–14 Mayıs · Takadanobaba gidiş dönüş." />
            <div style={{ paddingBottom: "120px" }}>

              {/* Hero — car photo + headline rental facts */}
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "48px", padding: "48px 0", borderBottom: `1px solid ${C.line}`, alignItems: "center" }}>
                <div>
                  <Eyebrow num="01">Senin aracın</Eyebrow>
                  <h2 style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "clamp(40px,5vw,72px)", letterSpacing: "-.04em", lineHeight: 1, marginBottom: "20px" }}>
                    NOTE <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>e-POWER</em>
                  </h2>
                  <p style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "18px", color: C.ink2, lineHeight: 1.55, marginBottom: "28px", maxWidth: "440px" }}>
                    5 kişilik · sınıf yükseltme onaylı · ETC kart ve drive recorder dahil · Full Support Plan ile çıkıyorsun.
                  </p>
                  {user === "eren" && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 18px", border: `1px solid ${C.red}`, color: C.red, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 600 }}>
                      ★ Şoför · Eren
                    </div>
                  )}
                  {user !== "eren" && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 18px", border: `1px solid ${C.line}`, color: C.muted, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 500 }}>
                      Şoför · Eren
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img src="/japan2026/nissan/note-epower.png" alt="Nissan NOTE e-POWER" style={{ maxWidth: "100%", height: "auto", display: "block" }} />
                </div>
              </div>

              <DetSection title="Rezervasyon" titleEm="Nissan Rent a Car" sub="26050202231 · Check-in tamamlandı · Sözleşme onaylı">
                <InfoGrid style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                  <div>
                    <IR label="Şube" val="Takadanobaba Station" />
                    <IR label="Telefon" val="03-3298-7000" href="tel:+81332987000" />
                    <IR label="Teslim alma" val="12 Mayıs Sal · 07:00" />
                    <IR label="İade" val="14 Mayıs Per · 07:00" valStyle={{ color: C.red }} />
                    <IR label="Rezervasyon" val="26050202231" copy id="nissan" copied={copied} onCopy={copyVal} />
                    <IR label="Yolcu sayısı" val="3 · upgrade kabul" />
                  </div>
                  <div>
                    <IR label="Araç ücreti" val="¥13,160" />
                    <IR label="Opsiyon (ETC + recorder)" val="¥700" />
                    <IR label="Sigorta planı" val="¥4,000" />
                    <IR label="Vergi" val="¥1,786" />
                    <IR label="Toplam (ödendi)" val="¥19,646" valStyle={{ color: C.red }} />
                    <IR label="Sigorta planı türü" val="Full Support Plan" />
                  </div>
                </InfoGrid>
                <NoteBox type="red">Geçerli iade saati 14 Mayıs Perşembe 07:00. 13 Mayıs gecesi Tokyo'ya geri dönmüş olmak zorundasın — sabah hızlı iade için yakıt full ile gel.</NoteBox>
              </DetSection>

              {/* Nissan onboarding — paraphrased TR with self-hosted Nissan reference icons */}
              <DetSection title="Nissan rehberi" titleEm="Teslim öncesi okumalı" sub="Nissan'ın online check-in akışından çıkarılan 9 başlık. Tıklayıp aç.">
                {(() => {
                  const ICON = "/japan2026/nissan/icons";
                  type Card = { id: string; n: string; title: string; render: () => React.ReactNode };
                  const cards: Card[] = [
                    {
                      id: "n01", n: "01", title: "Nissan'ın 3 isteği",
                      render: () => (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "8px" }}>
                          {[
                            { img: `${ICON}/belt.png`, label: "Tüm yolcular kemer takar" },
                            { img: `${ICON}/service_area.png`, label: "Sık mola — yorulmadan in" },
                            { img: `${ICON}/speed.png`, label: "Yavaş kullan, sınırı geçme" },
                          ].map((c, i) => (
                            <div key={i} style={{ padding: "20px 16px", border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px" }}>
                              <img src={c.img} alt="" style={{ width: "100%", maxWidth: "150px", height: "auto" }} />
                              <span style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "15px", letterSpacing: "-.01em", lineHeight: 1.4 }}>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      id: "n02", n: "02", title: "Trafik kuralları",
                      render: () => (
                        <>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            {[
                              { img: `${ICON}/confirm-traffic-rules-1.png`, label: "Trafik soldan akar — direksiyon sağda." },
                              { img: `${ICON}/confirm-traffic-rules-2.png`, label: "Kırmızı ışıkta sağa/sola dönüş yasak." },
                              { img: `${ICON}/confirm-traffic-rules-3.png`, label: "Yeşil ok varsa o yöne git, ışık sarı/kırmızı olsa bile." },
                              { img: `${ICON}/confirm-traffic-rules-4.png`, label: "Hız sınırları otomatik kameralarla denetleniyor." },
                              { img: `${ICON}/confirm-traffic-rules-5.png`, label: "Alkol = 0. Sürüşte telefon yasak." },
                              { img: `${ICON}/confirm-traffic-rules-6.png`, label: "Sol şeritte sür, ama bordüre fazla yaklaşma." },
                            ].map((r, i, a) => (
                              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 96px", gap: "20px", padding: "16px 0", borderBottom: i < a.length - 1 ? `1px solid ${C.line2}` : "none", alignItems: "center" }}>
                                <span style={{ fontSize: "14px", lineHeight: 1.55, color: C.ink2 }}>{r.label}</span>
                                <img src={r.img} alt="" style={{ width: "96px", height: "96px", objectFit: "contain" }} />
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: "32px", padding: "24px", border: `1px solid ${C.line}` }}>
                            <div style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "18px", marginBottom: "16px" }}>Yol işaretleri</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                              {[
                                { img: `${ICON}/no-parking.png`, label: "Park yasak" },
                                { img: `${ICON}/no-parking-or-stopping.png`, label: "Park & duraklama yasak" },
                                { img: `${ICON}/no-entry.png`, label: "Girişi olmayan yol" },
                                { img: `${ICON}/one-way.png`, label: "Tek yön" },
                              ].map((s, i) => (
                                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
                                  <img src={s.img} alt="" style={{ width: "72px", height: "72px", objectFit: "contain" }} />
                                  <span style={{ fontSize: "11px", color: C.muted, letterSpacing: ".04em" }}>{s.label}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                              <img src={`${ICON}/stop.png`} alt="" style={{ maxWidth: "100%", height: "auto", maxHeight: "120px", objectFit: "contain" }} />
                              <span style={{ fontSize: "13px", color: C.muted }}>"止まれ" — DUR.</span>
                            </div>
                          </div>
                        </>
                      ),
                    },
                    {
                      id: "n03", n: "03", title: "Yasak park",
                      render: () => (
                        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "32px", alignItems: "start" }}>
                          <img src={`${ICON}/illegal_parking.png`} alt="" style={{ width: "100%", height: "auto" }} />
                          <div>
                            <p style={{ fontSize: "14px", lineHeight: 1.65, color: C.ink2, marginBottom: "20px" }}>
                              Sadece otoparklar. Yol kenarına bırakma. Ceza kâğıdı bulursan en yakın polis karakoluna git, ödemeyi yap, makbuzu iadede Nissan'a göster.
                            </p>
                            <div style={{ background: C.redSoft, padding: "16px 20px", border: `1px solid ${C.red}` }}>
                              <div style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "13px", color: "#5a0a1f", marginBottom: "10px" }}>Ceza tarifesi</div>
                              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                                <span style={{ fontSize: "14px" }}>Normal araç</span>
                                <span style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>¥25,000</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                <span style={{ fontSize: "14px" }}>Orta sınıf araç</span>
                                <span style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>¥30,000</span>
                              </div>
                            </div>
                            <p style={{ fontSize: "12px", color: C.muted, marginTop: "12px", fontStyle: "italic" }}>Çekici alırsa çekme + park ücreti ayrı.</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: "n04", n: "04", title: "ETC kapıları",
                      render: () => (
                        <div>
                          <img src={`${ICON}/etc-gate.png`} alt="" style={{ width: "100%", height: "auto", maxHeight: "260px", objectFit: "contain", marginBottom: "24px" }} />
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left", padding: "10px", border: `1px solid ${C.line}`, background: C.line2, fontWeight: 500 }}> </th>
                                <th style={{ padding: "10px", border: `1px solid ${C.line}`, background: C.line2, fontWeight: 500 }}>ETC専用 (sadece)</th>
                                <th style={{ padding: "10px", border: `1px solid ${C.line}`, background: C.line2, fontWeight: 500 }}>ETC / 一般</th>
                                <th style={{ padding: "10px", border: `1px solid ${C.line}`, background: C.line2, fontWeight: 500 }}>一般 (genel)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{ padding: "10px", border: `1px solid ${C.line}`, fontWeight: 500 }}>ETC kart var (bizde)</td>
                                <td style={{ padding: "10px", border: `1px solid ${C.line}`, textAlign: "center", color: C.red }}>○</td>
                                <td style={{ padding: "10px", border: `1px solid ${C.line}`, textAlign: "center", color: C.red }}>○</td>
                                <td style={{ padding: "10px", border: `1px solid ${C.line}`, textAlign: "center", color: C.muted }}>×</td>
                              </tr>
                              <tr>
                                <td style={{ padding: "10px", border: `1px solid ${C.line}`, fontWeight: 500 }}>Kart yok</td>
                                <td style={{ padding: "10px", border: `1px solid ${C.line}`, textAlign: "center", color: C.muted }}>×</td>
                                <td style={{ padding: "10px", border: `1px solid ${C.line}`, textAlign: "center", color: C.red }}>○</td>
                                <td style={{ padding: "10px", border: `1px solid ${C.line}`, textAlign: "center", color: C.red }}>○</td>
                              </tr>
                            </tbody>
                          </table>
                          <p style={{ fontSize: "13px", color: C.muted, marginTop: "16px", fontStyle: "italic" }}>ETC kart yuvada takılı mı kontrol et — yoksa mavi kapılar açılmaz.</p>
                        </div>
                      ),
                    },
                    {
                      id: "n05", n: "05", title: "Kaza adımları",
                      render: () => (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: "12px", alignItems: "start", marginBottom: "32px" }}>
                            {[
                              { img: `${ICON}/injury.png`, n: "1", title: "Ambulans · 119", text: "Yaralı varsa önce ambulans. Yaralılara yardım et, sonra aracı güvenli alana çek." },
                              { img: `${ICON}/police.png`, n: "2", title: "Polis · 110", text: "Hem kazaya neden olan hem mağdur polise haber vermek zorunda. \"Kaza sertifikası\"nı al." },
                              { img: `${ICON}/outlet.png`, n: "3", title: "Şube + sigorta", text: "Takadanobaba'yı ara. Açık değilse direkt Sompo Japan Nipponkoa Kaza Resepsiyonu'na haber ver." },
                            ].flatMap((step, i, arr) => [
                              <div key={`s${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px" }}>
                                <img src={step.img} alt="" style={{ width: "100%", maxWidth: "120px", height: "auto" }} />
                                <div style={{ fontSize: "10px", letterSpacing: ".22em", color: C.muted, fontWeight: 500 }}>ADIM {step.n}</div>
                                <div style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "16px" }}>{step.title}</div>
                                <div style={{ fontSize: "12px", color: C.ink2, lineHeight: 1.55 }}>{step.text}</div>
                              </div>,
                              i < arr.length - 1 ? <div key={`a${i}`} style={{ paddingTop: "40px", color: C.muted, fontSize: "20px" }}>›</div> : null,
                            ]).filter(Boolean)}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div style={{ border: `1px solid ${C.line}`, padding: "20px" }}>
                              <div style={{ fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginBottom: "10px" }}>Sompo Kaza Resepsiyonu</div>
                              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "8px" }}>7/24 · 365 gün</div>
                              <a href="tel:0120256110" style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "26px", color: C.red, fontVariantNumeric: "tabular-nums" }}>0120-256-110</a>
                              <div style={{ fontSize: "12px", color: C.muted, marginTop: "10px" }}>Ücretsizden bağlanmazsa:</div>
                              <a href="tel:+81422354219" style={{ fontFamily: C.serif, fontSize: "18px", color: C.red, fontVariantNumeric: "tabular-nums" }}>0422-35-4219</a>
                            </div>
                            <div style={{ border: `1px solid ${C.line}`, padding: "20px" }}>
                              <div style={{ fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginBottom: "10px" }}>JAF · Yol yardım</div>
                              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "8px" }}>Çekici, patlak lastik</div>
                              <a href="tel:+81570008139" style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "26px", color: C.red, fontVariantNumeric: "tabular-nums" }}>0570-00-8139</a>
                              <div style={{ fontSize: "12px", color: C.muted, marginTop: "10px" }}>Hızlı tuş: <span style={{ fontFamily: "ui-monospace, monospace" }}>#8139</span></div>
                            </div>
                          </div>
                          <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 240px", gap: "24px", alignItems: "center", padding: "20px", background: C.line2 }}>
                            <div>
                              <div style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "16px", marginBottom: "8px" }}>"Kaza sonrası ne yapılır" formu</div>
                              <div style={{ fontSize: "13px", color: C.ink2, lineHeight: 1.6 }}>Aracın inceleme dosyası (glove box'ta) içinde formu bul, doldur, iadede Nissan'a ver. Sigorta için şart.</div>
                            </div>
                            <img src={`${ICON}/accident-form.png`} alt="" style={{ width: "100%", height: "auto" }} />
                          </div>
                        </>
                      ),
                    },
                    {
                      id: "n06", n: "06", title: "NOC — Kullanım kaybı tarifesi",
                      render: () => (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                          {[
                            { img: `${ICON}/img-accident-1.png`, label: "Küçük çizik / göçük", price: "max ¥50,000" },
                            { img: `${ICON}/img-accident-2.png`, label: "Ciddi hasar (kullanılamaz)", price: "max ¥100,000" },
                          ].map((c, i) => (
                            <div key={i} style={{ background: C.line2, padding: "20px" }}>
                              <div style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "20px", color: C.red, fontVariantNumeric: "tabular-nums", marginBottom: "8px" }}>JPY {c.price}</div>
                              <div style={{ fontSize: "13px", color: C.ink2, marginBottom: "16px" }}>{c.label}</div>
                              <img src={c.img} alt="" style={{ width: "100%", height: "auto" }} />
                            </div>
                          ))}
                          <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "8px" }}>
                            {[
                              { img: `${ICON}/accident-example-1.png`, label: "Otoparkta · ayna ayarı, dikkatli direksiyon" },
                              { img: `${ICON}/accident-example-2.png`, label: "Arkadan çarpma · sürüşte telefon yok" },
                              { img: `${ICON}/accident-example-3.png`, label: "Kavşakta · sağ dönüşte iki tekerli, sol dönüşte motor/bisiklet" },
                              { img: `${ICON}/accident-example-4.png`, label: "Yağmur/kar kayması · mesafeyi aç" },
                            ].map((e, i) => (
                              <div key={i} style={{ border: `1px solid ${C.line}`, padding: "16px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
                                <img src={e.img} alt="" style={{ width: "100%", height: "auto", maxHeight: "120px", objectFit: "contain" }} />
                                <span style={{ fontSize: "11px", color: C.ink2, lineHeight: 1.5 }}>{e.label}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ gridColumn: "1 / -1", padding: "16px 20px", background: C.redSoft, borderLeft: `2px solid ${C.red}`, fontSize: "13px", lineHeight: 1.65, color: "#5a0a1f", fontStyle: "italic", marginTop: "12px" }}>
                            Full Support Plan'imiz var — out-of-pocket ¥0. Yine de patlak lastik, hub kapağı kaybı, kendi hatamızla biten akü → kapsam dışı.
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: "n07", n: "07", title: "Yakıt",
                      render: () => (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "24px", alignItems: "center", padding: "20px", border: `1px solid ${C.line}` }}>
                            <img src={`${ICON}/fuel.png`} alt="" style={{ width: "100%", height: "auto" }} />
                            <div>
                              <div style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "16px", marginBottom: "10px" }}>NOTE e-POWER → Regular benzin (レギュラー)</div>
                              <div style={{ fontSize: "13px", color: C.ink2, lineHeight: 1.65 }}>Yanlış yakıt = motor hasarı, ücret bizden çıkar. Yakıt türünü teslim alırken Nissan'a sor.</div>
                            </div>
                          </div>
                          <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "100px 1fr", gap: "24px", alignItems: "center", padding: "20px", border: `1px solid ${C.line}` }}>
                            <img src={`${ICON}/fuel_receipt.png`} alt="" style={{ width: "100%", height: "auto" }} />
                            <div style={{ fontSize: "13px", color: C.ink2, lineHeight: 1.65 }}>İadede full + benzin makbuzu zorunlu. Eksikse mesafeye göre fazla ücret biner (gerçek doluş ücretinden pahalı).</div>
                          </div>
                          <div style={{ marginTop: "20px" }}>
                            <img src={`${ICON}/fuel_type.png`} alt="" style={{ width: "100%", height: "auto", maxHeight: "180px", objectFit: "contain" }} />
                          </div>
                        </>
                      ),
                    },
                    {
                      id: "n08", n: "08", title: "İade saati",
                      render: () => (
                        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "24px", alignItems: "center" }}>
                          <img src={`${ICON}/shop_call.png`} alt="" style={{ width: "100%", height: "auto" }} />
                          <div>
                            <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "32px", letterSpacing: "-.02em", lineHeight: 1, marginBottom: "8px" }}>
                              14 Mayıs Per <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>07:00</em>
                            </div>
                            <div style={{ fontSize: "13px", color: C.ink2, lineHeight: 1.6, marginBottom: "12px" }}>Takadanobaba Station şubesi.</div>
                            <div style={{ fontSize: "12px", color: C.muted, fontStyle: "italic", lineHeight: 1.55 }}>Geç kalacaksan ofisi ara — ekstra ücret olabilir. 24 saat öncesine kadar değişiklik yapılabilir.</div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      id: "n09", n: "09", title: "7/24 iletişim",
                      render: () => (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          {[
                            { img: `${ICON}/contact-list-1.png`, label: "Sigorta Kaza Resepsiyonu", sub: "Sompo Japan Nipponkoa", num: "0422-35-4219", href: "tel:+81422354219" },
                            { img: `${ICON}/contact-list-2.png`, label: "Polis", sub: "Kaza durumunda (her iki taraf da arar)", num: "110", href: "tel:110" },
                            { img: `${ICON}/contact-list-3.png`, label: "Ambulans", sub: "Kazada yaralı varsa", num: "119", href: "tel:119" },
                            { img: `${ICON}/contact-list-4.png`, label: "JAF · Yol yardım", sub: "Çekici, patlak lastik", num: "0570-00-8139", href: "tel:+81570008139" },
                            { img: `${ICON}/contact-list-5.png`, label: "Yabancı destek hattı", sub: "Trafik kazası dışındaki sorunlar", num: "03-6625-8290", href: "tel:+81366258290" },
                          ].map((c, i, a) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "20px", alignItems: "center", padding: "16px 0", borderBottom: i < a.length - 1 ? `1px solid ${C.line2}` : "none" }}>
                              <img src={c.img} alt="" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
                              <div>
                                <div style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "16px", marginBottom: "4px" }}>{c.label}</div>
                                <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.5 }}>{c.sub}</div>
                              </div>
                              <a href={c.href} style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "22px", color: C.red, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", textDecoration: "none" }}>{c.num}</a>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      id: "n10", n: "10", title: "Tazminat planı · Full Support",
                      render: () => (
                        <div style={{ padding: "24px 28px", background: "#E8F4E8", borderLeft: `3px solid #4a7a4a` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <span style={{ fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 600, color: "#2f4d2f", padding: "3px 8px", background: "#fff", border: "1px solid #4a7a4a" }}>SEÇİLİ</span>
                            <span style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "20px" }}>Full Support Plan</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderBottom: `1px solid #c4d6c4`, marginBottom: "10px" }}>
                            <span style={{ fontSize: "13px", color: "#2f4d2f" }}>Kaza sırasında out-of-pocket</span>
                            <span style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "22px", color: "#2f4d2f", fontVariantNumeric: "tabular-nums" }}>0 ¥</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderBottom: `1px solid #c4d6c4` }}>
                            <span style={{ fontSize: "13px", color: "#2f4d2f" }}>Plan ücreti</span>
                            <span style={{ fontFamily: C.serif, fontWeight: 500, fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>2,200 ¥ / 24 saat</span>
                          </div>
                          <div style={{ marginTop: "16px", fontSize: "12px", color: "#2f4d2f", lineHeight: 1.6, fontStyle: "italic" }}>
                            Patlak lastik, kaybolan teçhizat, hub kapağı kaybı, kendi hatamızla biten akü — bu plan dahi kapsam dışı.
                          </div>
                        </div>
                      ),
                    },
                  ];
                  return cards.map(card => {
                    const isOpen = araçNissanOpen.has(card.id);
                    return (
                      <div key={card.id} style={{ borderBottom: `1px solid ${C.line2}`, padding: "20px 0" }}>
                        <div onClick={() => setAraçNissanOpen(prev => { const s = new Set(prev); s.has(card.id) ? s.delete(card.id) : s.add(card.id); return s; })}
                          style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "20px", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                          <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "14px", color: C.muted, fontVariantNumeric: "tabular-nums", letterSpacing: ".04em", width: "32px" }}>{card.n}</div>
                          <div style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "22px", letterSpacing: "-.02em", lineHeight: 1.2 }}>{card.title}</div>
                          <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "22px", color: isOpen ? C.red : C.muted, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .25s", lineHeight: 1 }}>+</div>
                        </div>
                        {isOpen && (
                          <div style={{ marginTop: "24px", paddingLeft: "52px" }}>
                            {card.render()}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </DetSection>

              <DetSection title="Anahtar dokümanlar" titleEm="·" sub="Tek tıkla aç. Belgeler sekmesinde de bulabilirsin.">
                <InfoGrid style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                  <div>
                    {docs.filter(d => d.category === "car").map(d => (
                      <div key={d.id} style={{ padding: "14px 0", borderBottom: `1px solid ${C.line2}`, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px" }}>
                        <span style={{ fontSize: "14px" }}>{d.title}</span>
                        <a href={d.public_path} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: C.red, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 500 }}>Aç →</a>
                      </div>
                    ))}
                    {docs.filter(d => d.category === "car").length === 0 && (
                      <div style={{ padding: "14px 0", fontSize: "13px", color: C.muted, fontStyle: "italic" }}>Henüz Nissan rezervasyon dokümanı ingest edilmedi.</div>
                    )}
                  </div>
                  <div>
                    <NoteBox type="info">Trafik kazası: ilk 110 ve 119, sonra Sompo 0422-35-4219. Yolda kaldıysan JAF 0570-00-8139.</NoteBox>
                  </div>
                </InfoGrid>
              </DetSection>
            </div>
          </div>
        )}

        {/* ═══ CHECKLİST ═══ */}
        {activeTab === "checklist" && (
          <div>
            <TabHead title="Checklist" lede={editingCl ? "Düzenleme modu — kategori ve madde ekle, sil, sırala." : `${clSchema.length} kategori. Yaptıkça işaretle.`} />

            {/* Toolbar */}
            <div style={{ display: "grid", gridTemplateColumns: editingCl ? "1fr auto" : "1fr auto auto", gap: "24px", padding: "32px 0", borderBottom: `1px solid ${C.line}`, alignItems: "center" }}>
              {!editingCl && (
                <input type="search" value={clSearch} onChange={e => setClSearch(e.target.value)}
                  placeholder="Ara — IDP, sigorta, pasaport…"
                  style={{ padding: "12px 0", border: "none", borderBottom: `1px solid ${C.line}`, background: "transparent", fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "18px", color: C.ink, outline: "none", width: "100%", letterSpacing: "-.01em" }} />
              )}
              {editingCl && <div />}
              {!editingCl && (
                <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "24px", letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>{clDone}</em>/{clTotal}
                </div>
              )}
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                {!editingCl && (
                  <button onClick={() => { if (confirm("Tüm tikleri sıfırlamak istediğine emin misin?")) { setClState({}); fetch("/api/japan2026", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "checklist_reset" }) }).catch(console.error); } }}
                    style={{ fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>
                    Sıfırla
                  </button>
                )}
                <button onClick={() => setEditingCl(e => !e)}
                  style={{ fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: editingCl ? C.red : C.muted, fontWeight: 500, padding: "8px 16px", border: `1px solid ${editingCl ? C.red : C.line}`, transition: "all .18s" }}>
                  {editingCl ? "Bitti ✓" : "Düzenle"}
                </button>
              </div>
            </div>

            {!editingCl && (
              <div style={{ height: "1px", background: C.line, marginTop: "16px", position: "relative", overflow: "hidden", marginBottom: "0" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: C.red, width: `${clPct}%`, transition: "width .4s" }} />
              </div>
            )}

            <div style={{ paddingBottom: "100px" }}>
              {editingCl ? (
                /* ── EDIT MODE ── */
                <div>
                  {clSchema.map((sec, si) => (
                    <div key={sec.id} style={{ borderBottom: `1px solid ${C.line}`, padding: "28px 0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {sec.crit && <span style={{ color: C.red, fontSize: "9px" }}>●</span>}
                          <input value={sec.title} onChange={e => updateSection(sec.id, { title: e.target.value })}
                            style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "22px", letterSpacing: "-.02em", border: "none", borderBottom: `1px solid ${C.line}`, background: "transparent", outline: "none", color: C.ink, width: "100%" }} />
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                          <button onClick={() => moveSection(sec.id, -1)} disabled={si === 0}
                            style={{ fontSize: "14px", color: si === 0 ? C.line : C.muted, cursor: si === 0 ? "default" : "pointer", padding: "4px 6px", transition: "color .15s" }}>↑</button>
                          <button onClick={() => moveSection(sec.id, 1)} disabled={si === clSchema.length - 1}
                            style={{ fontSize: "14px", color: si === clSchema.length - 1 ? C.line : C.muted, cursor: si === clSchema.length - 1 ? "default" : "pointer", padding: "4px 6px", transition: "color .15s" }}>↓</button>
                          <button onClick={() => removeSection(sec.id)}
                            style={{ fontSize: "16px", color: C.muted, padding: "4px 8px", transition: "color .15s" }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.red)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>×</button>
                        </div>
                      </div>

                      <div style={{ marginLeft: "24px", paddingLeft: "24px", borderLeft: `1px solid ${C.line2}` }}>
                        {sec.items.map((item) => (
                          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 28px", gap: "12px", padding: "8px 0", borderTop: `1px solid ${C.line2}`, alignItems: "center" }}>
                            <input value={item.label} onChange={e => updateItem(sec.id, item.id, e.target.value)}
                              style={{ fontSize: "14px", color: C.ink, border: "none", borderBottom: `1px solid ${C.line2}`, background: "transparent", outline: "none", width: "100%", lineHeight: 1.6 }} />
                            <button onClick={() => removeItem(sec.id, item.id)}
                              style={{ fontSize: "16px", color: C.muted, transition: "color .15s", flexShrink: 0 }}
                              onMouseEnter={e => (e.currentTarget.style.color = C.red)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>×</button>
                          </div>
                        ))}
                        <button onClick={() => addItem(sec.id)}
                          style={{ marginTop: "12px", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: C.muted, fontWeight: 500, transition: "color .15s" }}
                          onMouseEnter={e => (e.currentTarget.style.color = C.ink)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                          + Madde ekle
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: "32px 0" }}>
                    <button onClick={addSection}
                      style={{ fontSize: "13px", fontWeight: 500, letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, display: "flex", alignItems: "center", gap: "12px", transition: "color .18s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.ink)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                      <span style={{ fontSize: "20px", lineHeight: 1, fontWeight: 300, fontFamily: C.serif }}>+</span> Kategori ekle
                    </button>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                clSchema.map((sec, si) => {
                  const filtered = clSearch ? sec.items.filter(it => it.label.toLocaleLowerCase("tr-TR").includes(clSearch.toLocaleLowerCase("tr-TR"))) : sec.items;
                  const titleMatch = !clSearch || sec.title.toLocaleLowerCase("tr-TR").includes(clSearch.toLocaleLowerCase("tr-TR"));
                  if (clSearch && filtered.length === 0 && !titleMatch) return null;
                  const isOpen = openSecs.has(sec.id) || (!!clSearch && (filtered.length > 0 || titleMatch));
                  const secDone = sec.items.filter(it => clState[it.id]?.v).length;

                  return (
                    <div key={sec.id} style={{ borderBottom: `1px solid ${C.line}`, padding: "32px 0" }}>
                      <div onClick={() => setOpenSecs(prev => { const s = new Set(prev); s.has(sec.id) ? s.delete(sec.id) : s.add(sec.id); return s; })}
                        style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: "24px", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                        <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "14px", color: C.muted, fontVariantNumeric: "tabular-nums", letterSpacing: ".04em", width: "32px" }}>{String(si + 1).padStart(2, "0")}</div>
                        <div>
                          <div style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "24px", letterSpacing: "-.02em", lineHeight: 1.2 }}>
                            {sec.crit && <span style={{ color: C.red, fontSize: "9px", verticalAlign: "middle", marginRight: "10px" }}>●</span>}
                            {sec.owner && (
                              <span style={{ color: sec.owner === user ? C.red : C.muted, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", marginRight: "12px", fontWeight: 600, fontFamily: C.sans }}>
                                {sec.owner === user ? "★" : ""}{sec.owner}
                              </span>
                            )}
                            {sec.title}
                          </div>
                        </div>
                        <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "18px", fontVariantNumeric: "tabular-nums", color: C.muted, letterSpacing: "-.01em" }}>
                          {secDone > 0 && <em style={{ fontStyle: "italic", color: C.red, fontWeight: 400 }}>{secDone}</em>}
                          {secDone === 0 && "0"}/{sec.items.length}
                        </div>
                        <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "22px", color: isOpen ? C.red : C.muted, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .25s", lineHeight: 1 }}>+</div>
                      </div>

                      <div style={{ height: "1px", background: C.line2, marginTop: "18px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: C.red, width: `${sec.items.length ? Math.round(secDone / sec.items.length * 100) : 0}%`, transition: "width .35s" }} />
                      </div>

                      {isOpen && (
                        <div style={{ marginTop: "24px", marginLeft: "56px", paddingLeft: "24px", borderLeft: `1px solid ${C.line2}` }}>
                          {sec.note && <div style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "15px", color: C.ink2, marginBottom: "20px", padding: "14px 18px", background: "#FFF7E6", borderLeft: `2px solid #C99A2E`, lineHeight: 1.55 }}>{sec.note}</div>}
                          {(clSearch ? filtered : sec.items).map((item, li) => {
                            const st = clState[item.id];
                            const eu = st?.u ? USERS[st.u as UserName] : null;
                            return (
                              <label key={item.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "18px", padding: "14px 0", borderTop: li > 0 ? `1px solid ${C.line2}` : "none", alignItems: "start", cursor: "pointer" }}>
                                <input type="checkbox" checked={!!st?.v} onChange={ev => handleCheck(item.id, item.label, ev.target.checked)}
                                  style={{ width: "18px", height: "18px", appearance: "none", border: `1px solid ${st?.v ? C.red : C.ink}`, background: st?.v ? C.red : "transparent", cursor: "pointer", position: "relative", marginTop: "2px", flexShrink: 0, borderRadius: "1px" }} />
                                <div>
                                  <div style={{ fontSize: "15px", lineHeight: 1.55, color: st?.v ? C.muted : C.ink, fontWeight: 400, letterSpacing: "-.005em", textDecoration: st?.v ? "line-through" : "none", textDecorationThickness: "1px", textUnderlineOffset: "3px" }}>{item.label}</div>
                                </div>
                                {st?.v && eu && (
                                  <div style={{ fontSize: "11px", color: C.muted, fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, textAlign: "right", whiteSpace: "nowrap", lineHeight: 1.4, paddingTop: "3px" }}>
                                    <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: eu.color, marginRight: "6px", verticalAlign: "middle" }} />
                                    {st.u} · {st.t}
                                  </div>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ═══ BELGELER ═══ */}
        {activeTab === "belgeler" && (
          <div>
            <TabHead title="Belgeler" lede="Bilet, sigorta, QR — hepsi bir arada. Senin belgelerin üstte." />
            <div style={{ paddingBottom: "120px" }}>

              {/* My docs strip */}
              {(() => {
                const mine = groupDocs(docs.filter(d => d.owner === user));
                if (mine.length === 0) return null;
                return (
                  <div style={{ padding: "32px 0", borderBottom: `1px solid ${C.line}` }}>
                    <Eyebrow num="01">Senin belgelerin · {mine.length}</Eyebrow>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                      {mine.map(g => <DocCard key={g.key} variants={g.variants} mine />)}
                    </div>
                  </div>
                );
              })()}

              {/* Filter pills */}
              <div style={{ padding: "32px 0 16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {([
                  { k: "all" as const,    label: "Tümü",  count: docs.length },
                  { k: "eren" as const,   label: "Eren",  count: docs.filter(d => d.owner === "eren").length },
                  { k: "zenci" as const,  label: "Zenci", count: docs.filter(d => d.owner === "zenci").length },
                  { k: "ossan" as const,  label: "Ossan", count: docs.filter(d => d.owner === "ossan").length },
                  { k: "shared" as const, label: "Ortak", count: docs.filter(d => d.owner === "shared").length },
                ]).map(p => (
                  <button key={p.k} onClick={() => setDocFilter(p.k)}
                    style={{ padding: "8px 16px", border: `1px solid ${docFilter === p.k ? C.ink : C.line}`, background: docFilter === p.k ? C.ink : "transparent", color: docFilter === p.k ? "#fff" : C.ink, fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 500, transition: "all .18s" }}>
                    {p.label} <span style={{ marginLeft: "8px", opacity: 0.6, fontVariantNumeric: "tabular-nums" }}>{p.count}</span>
                  </button>
                ))}
              </div>

              {/* Grouped by category */}
              {(() => {
                const filtered = docFilter === "all" ? docs : docs.filter(d => d.owner === docFilter);
                const cats = [
                  { key: "ticket",          label: "Uçuş Biletleri" },
                  { key: "hotel",           label: "Konaklama" },
                  { key: "car",             label: "Araç" },
                  { key: "insurance",       label: "Sigorta" },
                  { key: "visa-qr",         label: "Vize / Giriş QR" },
                  { key: "criminal-record", label: "Adli Sicil" },
                ];
                return cats.map(cat => {
                  const list = filtered.filter(d => d.category === cat.key);
                  const groups = groupDocs(list)
                    .sort((a, b) => (a.variants[0].owner === user ? -1 : b.variants[0].owner === user ? 1 : 0));
                  if (groups.length === 0) return null;
                  return (
                    <div key={cat.key} style={{ padding: "32px 0", borderBottom: `1px solid ${C.line}` }}>
                      <Eyebrow num={cat.key === "ticket" ? "02" : cat.key === "hotel" ? "03" : cat.key === "car" ? "04" : cat.key === "insurance" ? "05" : cat.key === "visa-qr" ? "06" : "07"}>{cat.label}</Eyebrow>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                        {groups.map(g => <DocCard key={g.key} variants={g.variants} mine={g.variants[0].owner === user} />)}
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Eksik belgeler */}
              <div style={{ padding: "48px 0 0" }}>
                <Eyebrow num="08">Eksik belgeler</Eyebrow>
                {EXPECTED_DOCS.length === 0
                  ? <p style={{ fontFamily: C.serif, fontStyle: "italic", color: C.muted, fontSize: "16px" }}>Hepsi tamam.</p>
                  : EXPECTED_DOCS.map((e, i) => (
                      <div key={i} style={{ padding: "20px 0", borderBottom: `1px solid ${C.line2}`, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "16px", alignItems: "center" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: e.owner === "shared" ? C.muted : USERS[e.owner as UserName].color }} />
                        <div>
                          <div style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "16px" }}>
                            <span style={{ color: C.muted, marginRight: "10px", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase" }}>{e.owner}</span>
                            {e.title}
                          </div>
                          {e.reason && <small style={{ display: "block", marginTop: "4px", fontSize: "12px", color: C.muted, fontStyle: "italic" }}>{e.reason}</small>}
                        </div>
                        <span style={{ fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", color: C.red, fontWeight: 600 }}>BEKLENİYOR</span>
                      </div>
                    ))}
              </div>

              <div style={{ marginTop: "48px", padding: "24px 28px", border: `1px dashed ${C.line}`, fontSize: "13px", color: C.muted, fontFamily: C.serif, fontStyle: "italic", lineHeight: 1.6 }}>
                Yeni bir belge eklemek için: dosyayı <code style={{ fontFamily: "ui-monospace, monospace", background: C.line2, padding: "1px 6px", borderRadius: "2px" }}>resources/</code> klasörüne bırak, ardından
                <code style={{ fontFamily: "ui-monospace, monospace", background: C.line2, padding: "1px 6px", borderRadius: "2px", marginLeft: "6px" }}>npx tsx scripts/japan2026/ingest-docs.ts</code> çalıştır.
              </div>
            </div>
          </div>
        )}

        {/* ═══ ACİL ═══ */}
        {activeTab === "acil" && (
          <div>
            <TabHead title="Acil" lede="Acele gerekebilecek numaralar ve bilgiler." />
            <div style={{ paddingBottom: "120px" }}>
              <EmergSection title="Japonya'da">
                <EmergGrid>
                  <EI name="Polis" sub="Ulusal acil" num="110" href="tel:110" />
                  <EI name="Ambulans & İtfaiye" sub="Ulusal acil" num="119" href="tel:119" />
                  <EI name="İngilizce Polis Hattı" sub="Tokyo Emniyet" num="+81 3 3501 0110" href="tel:+81335010110" />
                  <EI name="Tokyo Sağlık Hattı (İngilizce)" sub="Her gün 09:00–20:00" num="03 5285 8181" href="tel:+81352858181" />
                </EmergGrid>
              </EmergSection>
              <EmergSection title="Rezervasyonlar">
                <EmergGrid>
                  <EI name="Hanabi Hotel" sub="Rez 5001.805.511 · PIN 4826" num="+81 3 3366 9688" href="tel:+81333669688" />
                  <EI name="Nissan Takadanobaba" sub="Rez 26050202231" num="03 3298 7000" href="tel:+81332987000" />
                  <EI name="MIAT / Enuygun" sub="PNR 9OY2JB" num="0850 333 88 88" href="tel:+908503338888" />
                  <EI name="Hotel Hillarys" sub="Booking 6237128862" num="Osaka · Naniwa-ku" />
                </EmergGrid>
              </EmergSection>
              <EmergSection title="Türk Büyükelçiliği">
                <EmergGrid>
                  <EI name="Türkiye Büyükelçiliği, Tokyo" sub="Minato-ku · Pasaport kaybı, konsolosluk işlemleri" num="+81 3 3470 0640" href="tel:+81334700640" />
                </EmergGrid>
              </EmergSection>
              <EmergSection title="Hatırlatıcılar" last>
                <EmergGrid>
                  <EI name="Elektrik" sub="Type A fiş · adaptör gerekli" num="100 V" plain />
                  <EI name="Saat farkı" sub="Tokyo, İstanbul'dan ileride" num="+ 6 sa" plain />
                  <EI name="ATM" sub="7-Eleven & Japan Post en güvenilir" num="¥ only" plain italic />
                  <EI name="IC Kart" sub="Suica / PASMO — Apple Wallet'a ekle" num="tap & go" plain italic />
                  <EI name="Bahşiş" sub="Japon kültüründe yok" num="verme" numRed italic />
                  <EI name="Japonca" sub="Tasukete = İmdat · Byōin = Hastane" num="2 kelime" plain italic />
                </EmergGrid>
              </EmergSection>
            </div>
          </div>
        )}

      </div>

      {/* SWITCH USER MODAL */}
      {switchOpen && (
        <div onClick={() => setSwitchOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(17,17,17,.4)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg, padding: "48px 56px", maxWidth: "520px", width: "100%", textAlign: "center", position: "relative" }}>
            <button onClick={() => setSwitchOpen(false)} style={{ position: "absolute", top: "20px", right: "24px", fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>Kapat ✕</button>
            <h3 style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "42px", letterSpacing: "-.03em", marginBottom: "32px" }}>
              Yolcuyu <em style={{ fontStyle: "italic", color: C.red }}>değiştir</em>
            </h3>
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
              {(["eren", "zenci", "ossan"] as UserName[]).map(name => (
                <LoginBtn key={name} onClick={() => doLogin(name)} avatar={USERS[name].avatar}>{name.charAt(0).toUpperCase() + name.slice(1)}</LoginBtn>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────
function LoginBtn({ children, onClick, avatar }: { children: React.ReactNode; onClick: () => void; avatar?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "16px 20px 18px", border: `1px solid ${hover ? C.ink : C.line}`, background: hover ? C.ink : "transparent", color: hover ? "#fff" : C.ink, fontSize: "12px", fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase", minWidth: "140px", transition: "all .18s ease" }}>
      {avatar && <img src={avatar} alt="" style={{ width: "84px", height: "84px", borderRadius: "50%", objectFit: "cover", filter: hover ? "grayscale(0)" : "grayscale(.15)", transition: "filter .18s" }} />}
      {children}
    </button>
  );
}

function TabHead({ title, lede }: { title: string; lede: string }) {
  return (
    <div style={{ padding: "80px 0 48px", display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "end", borderBottom: `1px solid ${C.line}`, marginBottom: "0" }}>
      <h1 style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "clamp(48px,6vw,84px)", letterSpacing: "-.04em", lineHeight: 1 }}>
        {title}<em style={{ fontStyle: "italic", color: C.red }}>.</em>
      </h1>
      <p style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "18px", color: C.muted, maxWidth: "380px", lineHeight: 1.5, textAlign: "right" }}>{lede}</p>
    </div>
  );
}

function Eyebrow({ children, num }: { children: React.ReactNode; num: string }) {
  return (
    <div style={{ fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginBottom: "24px", display: "flex", alignItems: "center", gap: "14px" }}>
      <span style={{ display: "inline-block", width: "24px", height: "1px", background: C.ink }} />
      <span style={{ color: C.red, fontVariantNumeric: "tabular-nums" }}>{num}</span>
      {children}
    </div>
  );
}

function DetSection({ title, titleEm, sub, children }: { title: string; titleEm: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "48px 0", borderBottom: `1px solid ${C.line}` }}>
      <h2 style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "32px", letterSpacing: "-.02em", marginBottom: "6px" }}>
        {title} <em style={{ fontStyle: "italic", color: C.red }}>{titleEm}</em>
      </h2>
      <p style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, color: C.muted, fontSize: "16px", marginBottom: "36px" }}>{sub}</p>
      {children}
    </div>
  );
}

function FlightBlock({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: "36px" }}>{children}</div>;
}

function FlightLeg({ from, to, flight, dur }: { from: { time: string; code: string; name: string; date: string }; to: { time: string; code: string; name: string; date: string }; flight: string; dur: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "48px", padding: "36px 0", alignItems: "center", borderTop: `1px solid ${C.line2}` }}>
      <div>
        <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "48px", letterSpacing: "-.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{from.time}</div>
        <div style={{ fontSize: "11px", letterSpacing: ".28em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginTop: "14px" }}>{from.code}</div>
        <div style={{ fontSize: "13px", color: C.ink2, marginTop: "4px" }}>{from.name}</div>
        <div style={{ fontSize: "12px", color: C.muted, marginTop: "10px", fontFamily: C.serif, fontStyle: "italic" }}>{from.date}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", minWidth: "140px" }}>
        <div style={{ fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>{flight}</div>
        <div style={{ width: "100%", height: "1px", background: C.ink, position: "relative", opacity: .7 }}>
          <span style={{ position: "absolute", right: "-3px", top: "-4px", width: "7px", height: "7px", borderRadius: "50%", background: C.red, display: "inline-block" }} />
          <span style={{ position: "absolute", left: "-3px", top: "-2px", width: "5px", height: "5px", borderRadius: "50%", background: C.ink, display: "inline-block" }} />
        </div>
        <div style={{ fontSize: "12px", color: C.ink2, fontFamily: C.serif, fontStyle: "italic" }}>{dur}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "48px", letterSpacing: "-.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{to.time}</div>
        <div style={{ fontSize: "11px", letterSpacing: ".28em", textTransform: "uppercase", color: C.muted, fontWeight: 500, marginTop: "14px" }}>{to.code}</div>
        <div style={{ fontSize: "13px", color: C.ink2, marginTop: "4px" }}>{to.name}</div>
        <div style={{ fontSize: "12px", color: C.muted, marginTop: "10px", fontFamily: C.serif, fontStyle: "italic" }}>{to.date}</div>
      </div>
    </div>
  );
}

function Layover({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "18px 0", fontFamily: C.serif, fontStyle: "italic", fontSize: "14px", color: C.muted, borderTop: `1px dashed ${C.line}`, borderBottom: `1px dashed ${C.line}`, margin: "8px 0" }}>{children}</div>;
}

function InfoGrid({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 64px", marginTop: "36px", paddingTop: "36px", borderTop: `1px solid ${C.line2}`, ...style }}>
      {children}
    </div>
  );
}

function IR({ label, val, copy, id, copied, onCopy, href, valStyle }: { label: string; val: string; copy?: boolean; id?: string; copied?: string | null; onCopy?: (v: string, id: string) => void; href?: string; valStyle?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px", padding: "14px 0", borderBottom: `1px solid ${C.line2}`, fontSize: "14px" }}>
      <span style={{ color: C.muted, fontSize: "12px", letterSpacing: ".06em", fontWeight: 500 }}>{label}</span>
      {href
        ? <a href={href} style={{ fontWeight: 500, color: C.red, textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: "3px" }}>{val}</a>
        : copy && id && onCopy
          ? <button onClick={() => onCopy(val, id)} style={{ fontWeight: 500, color: id === copied ? C.red : C.ink, cursor: "pointer", letterSpacing: ".02em", fontVariantNumeric: "tabular-nums", transition: "color .15s" }}>
              {id === copied ? "Kopyalandı ✓" : val} <span style={{ color: C.muted, fontSize: "11px", opacity: 0.6 }}>⎘</span>
            </button>
          : <span style={{ fontWeight: 500, textAlign: "right", ...valStyle }}>{val}</span>
      }
    </div>
  );
}

function NoteBox({ children, type = "default" }: { children: React.ReactNode; type?: "default" | "red" | "info" }) {
  const styles = {
    default: { background: "#FFF7E6", borderLeft: `2px solid #C99A2E`, color: "#5c4715" },
    red:     { background: C.redSoft, borderLeft: `2px solid ${C.red}`, color: "#5a0a1f" },
    info:    { background: "#F0F4F0", borderLeft: `2px solid #637b63`, color: "#2f3d2f" },
  };
  const s = styles[type];
  return <div style={{ padding: "24px 28px", ...s, marginTop: "24px", fontFamily: C.serif, fontStyle: "italic", fontSize: "15px", lineHeight: 1.65, fontWeight: 300 }}>{children}</div>;
}

function EmergSection({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: "48px 0", borderBottom: last ? "none" : `1px solid ${C.line}` }}>
      <h2 style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "28px", letterSpacing: "-.02em", marginBottom: "32px" }}>{title}</h2>
      {children}
    </div>
  );
}

function EmergGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0 80px" }}>{children}</div>;
}

function DragDots() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden style={{ display: "block" }}>
      <circle cx="2" cy="3"  r="1.2" fill="currentColor" />
      <circle cx="8" cy="3"  r="1.2" fill="currentColor" />
      <circle cx="2" cy="8"  r="1.2" fill="currentColor" />
      <circle cx="8" cy="8"  r="1.2" fill="currentColor" />
      <circle cx="2" cy="13" r="1.2" fill="currentColor" />
      <circle cx="8" cy="13" r="1.2" fill="currentColor" />
    </svg>
  );
}

function DocCard({ variants, mine }: { variants: DocEntry[]; mine?: boolean }) {
  // variants share (owner, slug). May be 1 doc or 2 (TR + EN).
  const owners: Record<string, { color: string; avatar?: string }> = {
    eren:   USERS.eren,
    zenci:  USERS.zenci,
    ossan:  USERS.ossan,
    shared: { color: C.muted },
  };
  const langs = variants.map(v => v.lang).filter(Boolean) as ("tr" | "en")[];
  const initial: "tr" | "en" | "none" =
    langs.includes("en") ? "en"
    : langs.includes("tr") ? "tr"
    : "none";
  const [active, setActive] = useState<"tr" | "en" | "none">(initial);
  const d = variants.find(v => v.lang === active) ?? variants[0];
  const o = owners[d.owner] ?? { color: C.muted };
  const sizeKb = (d.size_bytes / 1024).toFixed(0);
  const isOutdated = (d.meta as { outdated_schedule?: boolean })?.outdated_schedule;

  return (
    <div style={{ padding: "20px 22px", border: `1px solid ${mine ? C.red : C.line}`, background: mine ? C.redSoft : "transparent", display: "flex", flexDirection: "column", gap: "14px", minHeight: "192px", position: "relative" }}>
      {mine && <span style={{ position: "absolute", top: "10px", right: "12px", fontSize: "10px", color: C.red, letterSpacing: ".2em", fontWeight: 600 }}>★</span>}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {o.avatar
          ? <img src={o.avatar} alt={d.owner} style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover", display: "block" }} />
          : <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: o.color }} />
        }
        <span style={{ fontFamily: C.sans, fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", color: C.muted, fontWeight: 500 }}>
          {d.owner}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "16px", letterSpacing: "-.01em", lineHeight: 1.35, marginBottom: "8px" }}>{d.title}</div>
        {isOutdated && (
          <div style={{ display: "inline-block", padding: "3px 8px", background: C.red, color: "#fff", fontSize: "9px", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600, marginTop: "4px" }}>
            ESKİ TARİFELİ
          </div>
        )}
        <div style={{ fontSize: "11px", color: C.muted, marginTop: "6px", letterSpacing: ".04em" }}>
          {sizeKb} KB · {d.mime.split("/")[1]?.toUpperCase()}
        </div>
      </div>

      {/* Lang toggle, only when 2 variants */}
      {variants.length > 1 && (
        <div style={{ display: "flex", gap: "4px" }}>
          {variants.map(v => (
            <button key={v.id} onClick={() => v.lang && setActive(v.lang)}
              style={{
                padding: "4px 10px", fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600,
                border: `1px solid ${active === v.lang ? C.ink : C.line}`,
                background: active === v.lang ? C.ink : "transparent",
                color: active === v.lang ? "#fff" : C.muted,
                transition: "all .15s",
              }}>
              {v.lang ?? "—"}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
        <a href={d.public_path} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "8px 0", textAlign: "center", border: `1px solid ${C.ink}`, background: C.ink, color: "#fff", fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 500 }}>
          Görüntüle
        </a>
        <a href={d.public_path} download={d.original_name} style={{ flex: 1, padding: "8px 0", textAlign: "center", border: `1px solid ${C.ink}`, color: C.ink, fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 500 }}>
          İndir
        </a>
      </div>
    </div>
  );
}

function EI({ name, sub, num, href, plain, italic, numRed }: { name: string; sub: string; num: string; href?: string; plain?: boolean; italic?: boolean; numRed?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "baseline", padding: "20px 0", borderBottom: `1px solid ${C.line2}` }}>
      <div>
        <div style={{ fontFamily: C.serif, fontWeight: 400, fontSize: "18px", letterSpacing: "-.01em", lineHeight: 1.3 }}>{name}</div>
        <small style={{ display: "block", fontFamily: C.sans, fontStyle: "normal", fontSize: "12px", color: C.muted, fontWeight: 400, letterSpacing: 0, marginTop: "4px", lineHeight: 1.5 }}>{sub}</small>
      </div>
      {href
        ? <a href={href} style={{ fontFamily: C.serif, fontWeight: 300, fontSize: "22px", letterSpacing: "-.01em", fontVariantNumeric: "tabular-nums", color: C.red, whiteSpace: "nowrap", textDecoration: "none" }}>{num}</a>
        : <div style={{ fontFamily: plain ? C.sans : C.serif, fontWeight: plain ? 400 : 300, fontSize: plain ? "18px" : "22px", letterSpacing: plain ? 0 : "-.01em", fontVariantNumeric: plain ? undefined : "tabular-nums", color: numRed ? C.red : plain ? C.ink2 : C.red, whiteSpace: "nowrap", fontStyle: italic ? "italic" : "normal" }}>{num}</div>
      }
    </div>
  );
}

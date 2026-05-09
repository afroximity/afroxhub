/**
 * Idempotent migration: append the four "Gelmişken" sections to the
 * checklist schema if they don't exist yet. Safe to re-run.
 *
 *   JP26_PIN=... BASE_URL=http://localhost:3005 \
 *     npx tsx scripts/japan2026/seed-gelmisken.ts
 */

import { randomUUID } from "node:crypto";

type ClItem = { id: string; label: string };
type ClSection = {
  id: string; title: string; crit?: boolean; note?: string;
  owner?: "eren" | "zenci" | "ossan"; items: ClItem[];
};

const uid = () => randomUUID();
const item = (label: string) => ({ id: uid(), label });

const NEW_SECTIONS: ClSection[] = [
  { id: uid(), title: "Gelmişken — JAPONYA", items: [
    item("Kombini tamago sando dene (7-Eleven en iyisi)"),
    item("Counter ramen — vending makinesinden ticket al"),
    item("Kaiten sushi (kayan tabakla) en az bir kez"),
    item("Vending machine'den BOSS kahvesi"),
    item("Vending machine'den weird bir şey dene (Pocari Sweat / corn soup / weird Pepsi)"),
    item("Suica/PASMO Apple Wallet'a ekle, kullan"),
    item("Kombini onigiri en az 3 farklı dolgu"),
    item("Karaoke bir gece (özel oda, sake/highball)"),
    item("Onsen ya da sentō (dövme şartı kontrol)"),
    item("İzakaya ya da yatay (street food alley) bir akşam"),
    item("Don Quijote (Donki) gece keşfi"),
    item("Pachinko parlor önünden geç ve ses banyosu yap"),
    item("Train station'da ekiben (boxed lunch) bir kez"),
    item("100-yen shop / Daiso turu"),
  ]},
  { id: uid(), title: "Gelmişken — Tokyo", items: [
    item("Shibuya Scramble Crossing — kalabalıkken geç + Hachiko Bridge'den izle"),
    item("Hachiko heykeli (Shibuya Station)"),
    item("Akihabara — elektronik & manga & retro arcade"),
    item("Senso-ji & Nakamise yolu (Asakusa)"),
    item("Meiji Jingu Shrine (Harajuku)"),
    item("Harajuku Takeshita-dori — kötü tatlar, gençlik"),
    item("Tsukiji Outer Market kahvaltı (sashimi & tamago skewer)"),
    item("Tokyo Tower ya da Skytree — gece ışığında"),
    item("Shinjuku Golden Gai — bir kuytu bar"),
    item("Omoide Yokocho — duman içinde yakitori"),
    item("Yoyogi Park yürüyüş"),
    item("Roppongi Hills observation deck (gün batımı)"),
    item("Don Quijote Shibuya 24h"),
    item("teamLab Planets Toyosu (online bilet)"),
    item("Yanaka Ginza — eski Tokyo sokakları"),
    item("Kichijoji + Inokashira Park"),
    item("Ueno Park & Ameyoko market"),
    item("Game center — UFO catcher dene"),
    item("Kabukicho gece yürüyüşü (Robot Restaurant kapısı)"),
  ]},
  { id: uid(), title: "Gelmişken — Osaka", items: [
    item("Dotonbori canal · Glico Man fotoğrafı"),
    item("Kuromon Ichiba Market — taze sashimi & ikayaki (mürekkep balığı çubukta)"),
    item("Takoyaki en az 3 farklı yerde dene"),
    item("Osaka Castle (Osaka-jo)"),
    item("Shinsaibashi-suji shopping street yürüyüş"),
    item("Hozenji Yokocho — moss-covered Buddha, dar sokak"),
    item("Amerikamura (Ame-mura) — youth district"),
    item("Umeda Sky Building — Floating Garden manzara"),
    item("Namba'da bir gece izakaya"),
    item("Ichiran ramen ya da Kinryu Ramen (golden dragon)"),
    item("Shinsekai · Tsutenkaku Tower bölgesi · kushikatsu"),
  ]},
  { id: uid(), title: "Gelmişken — Kyoto", items: [
    item("Fushimi Inari Taisha — sabah erken, üst kısma çık"),
    item("Kinkaku-ji — Altın Pavyon"),
    item("Arashiyama Bamboo Grove (sabah)"),
    item("Tenryu-ji — bambu yakını, zen bahçesi"),
    item("Kiyomizu-dera Temple — sunset"),
    item("Gion district akşam yürüyüş — maiko/geiko gör (rahatsız etme)"),
    item("Nishiki Market — food stalls"),
    item("Pontocho alley — geceleyin lanternlerin altı"),
    item("Philosopher's Path"),
    item("Sanjusangendo — 1001 buddha"),
    item("Bir tea house'da matcha + wagashi"),
    item("Yatsuhashi (Kyoto'ya özgü cinnamon mochi) dene"),
  ]},
];

async function main() {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  const pin = process.env.JP26_PIN;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (pin) headers["x-jp26-pin"] = pin;

  const cur = await fetch(`${baseUrl}/api/japan2026?type=checklist_schema`, { headers })
    .then(r => r.json()) as ClSection[] | null;

  if (!cur || !Array.isArray(cur) || cur.length === 0) {
    console.log("No existing schema. Will be seeded from Room.tsx ZERO_CHECKLIST on next load.");
    return;
  }

  const have = new Set(cur.filter(s => s.title.startsWith("Gelmişken — ")).map(s => s.title));
  const toAdd = NEW_SECTIONS.filter(s => !have.has(s.title));

  if (toAdd.length === 0) {
    console.log("All Gelmişken sections already present. No-op.");
    return;
  }

  const merged = [...cur, ...toAdd];
  const res = await fetch(`${baseUrl}/api/japan2026`, {
    method: "POST",
    headers,
    body: JSON.stringify({ type: "checklist_schema", schema: merged }),
  });

  console.log(`Appended ${toAdd.length} section(s):`);
  for (const s of toAdd) console.log(`  · ${s.title}  (${s.items.length} items)`);
  console.log(`API: ${res.status} ${await res.text()}`);
}

main().catch(err => { console.error(err); process.exit(1); });

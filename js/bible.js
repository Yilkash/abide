/* ---------- the Bible ---------- */
let BIBLE = null;           // [book][chapter][verse]
let CH = [];                // every chapter in order: { b, c, n }
let TOTAL_VERSES = 0;
const bibleReady = fetch("kjv.json").then((r) => r.json()).then((data) => {
  BIBLE = data;
  CH = []; TOTAL_VERSES = 0;
  data.forEach((book, b) => book.forEach((ch, c) => { CH.push({ b, c: c + 1, n: ch.length }); TOTAL_VERSES += ch.length; }));
});
const chIndex = (b, c) => CH.findIndex((x) => x.b === b && x.c === c);
const chName = (i) => `${NAMES[CH[i].b]} ${CH[i].c}`;
// "Genesis 1–3, Exodus 1" for a list of chapter numbers in order
function rangeName(list) {
  const parts = [];
  for (const i of list) {
    const last = parts[parts.length - 1];
    if (last && last.b === CH[i].b && last.to === CH[i].c - 1) last.to = CH[i].c;
    else parts.push({ b: CH[i].b, from: CH[i].c, to: CH[i].c });
  }
  return parts.map((p) => `${NAMES[p.b]} ${p.from}${p.to > p.from ? "–" + p.to : ""}`).join(", ");
}

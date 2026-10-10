# AGENTS.md

Notes for whoever works on this app next, human or AI agent. Read README.md for what it does.

## Shape

- Files (no build step; edit and push):
  - `index.html`: the page shell (header, tab bar, sheets) and the `<script>` tags in load order.
  - `css/app.css`: all the styles.
  - `js/`: the core, loaded first: `core.js` (version, storage helpers, all saved state), `data.js` (book names and themed verses), `icons.js`, `bible.js` (KJV loading), `niv.js`, `plan.js` (reading plan), `ui.js` (toast, ask, sheet), `router.js` (`go`, `render`, the empty `VIEWS`), `reminders.js`, `backup.js`, `shell.js` (theme, font, install, update check), and `main.js` (start-up, loaded last).
  - `js/features/`: one file per section. Each holds its helpers and adds its screens with `Object.assign(VIEWS, { … })`.
  - These are plain scripts, not ES modules. They share one global scope, so a name declared in one file is visible to the others (the HTML `onclick`s rely on this). Never declare the same top-level name twice, and keep the load order: a file may only use another file's names at load time if that file comes earlier.
  - **A new file must be added to `index.html` and to `FILES` in `sw.js`**, or the app breaks offline.
  - `kjv.json`: the full KJV as `[book][chapter][verse]` (66 books, 1,189 chapters, 31,102 verses; public domain).
  - `sw.js`: offline. Network-first, except `kjv.json`, which is cache-first.
  - `manifest.webmanifest`, `icon-192.png`, `icon-512.png`.
- The themed scripture lists are in `js/data.js` as `DATA` (book names plus `themes`). Each verse's text was taken from `kjv.json`, and every reference was checked to exist. If you add a verse, generate its text from `kjv.json`; never type scripture by hand.
- Hosted on GitHub Pages from `main` of `Yilkash/abide`.
- No backend. Data lives in `localStorage` under `abide.*`:
  - `settings`: `{name, font, times:[6,13,20], fastDays:[3,5], fastStart:6, fastEnd:15}`.
  - `read`: chapter numbers 0–1188.
  - `pre`: chapters already read when the plan was (re)started via Settings → "Mark everything up to here". `onTrack()` measures pace from there.
  - `days`: date → `{parts:[[…],[…],[…]]}`, today's reading, fixed once the day starts.
  - `log`: date → chapters read that day, used for the streak.
  - `fasts`: date → `{done, focus, note}`.
  - `dreams`: `[{id, date, title, text, feelings[], tags[], meaning, scripture, status: new|praying|fulfilled, fulfilledAt, fulfilledNote, created, updated}]`. Empty dreams are dropped when leaving the editor.
  - `prayers`, `journal`, `lessons`, `favs`, `saved`, `start`, `theme`, `tab`.
  - `teach`: `{notes, studied}` for the healing teachings.
  - `declared`: date → refs of the healing declarations spoken that day ("Speak it").
  - `body`: `{stage 0–4, stageSince, sessions: date → {kind, rounds?, done?}, pain: date → 0–10, waist: [{date, cm}], calm: [], avoid: []}` (Body section; private).
  - `lock`: `{salt, hash, hint}` for the optional PIN (SHA-256 of salt + PIN). **Never** included in backups.
  - Backup/restore in Settings exports and imports these keys as JSON.
- **Never rename or reshape these keys without a migration.** They hold real progress.

## NIV (through api.bible)

- **Why it's set up this way:** the full NIV can't be bundled; Biblica's free general rule is up to 500 verses. Biblica allows truly non-commercial apps with no AI to use it royalty-free through api.bible's Starter (non-commercial) plan: 3 copyrighted Bibles, 5,000 calls a month. Abide must stay free, with no ads, sales or AI, or this stops applying.
- **The owner's key:** they type it in Settings. It's stored as `abide.niv` (`{key, bibleId, name, copyright}`) and is deliberately left out of backups. Never put a key in the code or the repo.
- **Requests:** `https://rest.api.bible/v1` with the `api-key` header. The NIV's bibleId is found from `/bibles?language=eng`. Chapters use `GET /bibles/{id}/chapters/GEN.1` and themed verses `/passages/ISA.53.4-ISA.53.5`, with `content-type=text&fums-version=3`. `parseVerses()` splits the text on `[n]` markers.
- **api.bible's rules, which the code enforces:**
  - cache fewer than 500 verses in a row (`MAX_CACHED_VERSES` 480, only today's reading plus the open chapter);
  - refresh within 14 days (`FRESH_MS` 13 days);
  - report every view to FUMS (`reportFums`, with `https://pkg.api.bible/fumsV3.min.js` loaded on demand);
  - show the copyright string the API returns;
  - stop at 4,800 calls a month.
- **Not cached by the service worker:** `sw.js` never caches `*.api.bible`.
- **Fallback:** the KJV is used whenever the NIV isn't connected or a chapter isn't cached and there's no data.

## Speak it (v8)

- `DECLARATIONS` pairs a first-person declaration (our wording) with a verse from the verified `Healing` theme, looked up by ref, so scripture text is never typed by hand. If a ref is missing from the theme, that declaration is dropped.
- The `declare` view: today's declaration (rotates by day), read aloud with `speechSynthesis` (declaration, then the verse), "I declared it", a streak, and the full list. Today shows it under the round shortcuts.

## Healing teachings (v10)

- `js/features/teachings.js`: `TEACHINGS`, 14 main points of T.L. Osborn's *Healing the Sick*, **summarised in our own words**. The book is under copyright: never copy its text, chapter titles or long quotes into the app.
- Each teaching lists scripture by reference only. `bibleVerse(ref)` builds the verse from `kjv.json` at runtime (the NIV fills in through `fillVerses` as usual), so no scripture is typed by hand. `findVerse` falls back to it, so Meditate works on these verses too.
- Saved in `teach`: `{notes: id -> text, studied: id -> date}`; included in backups. Today shows the teaching of the day under "Speak it today"; More → Healing teachings lists them all.

## PIN lock (v8)

- Optional, set in Settings → Privacy. It locks `PRIVATE` = prayer list, journal and dreams; `render()` sends those views to the `lock` view until the PIN is entered. The Today screen hides prayer names while locked.
- It relocks after 2 minutes in the background or on reload. Five wrong tries wait 30 seconds. "Forgot PIN?" shows the hint, then offers to remove the lock **and delete** the private pages.
- It keeps a casual look away; it is not encryption (localStorage is readable with developer tools).

## Body (v9)

- More → Body (and a card on Today), behind the PIN. A weekly plan built around the fasting days (`dayKind`): Mon/Thu strength, Tue/Sat walk or jog (Sat adds ball work), fast days gentle, Sun rest; a Wed or Fri that isn't a fast day becomes an easy walk or stretching.
- Strength: `MOVES` × `ROUNDS` (3) with a 60-second rest timer; every two finished workouts raise the level (+2 reps, wall sit +5 s, max level 11).
- "Back to the ball": five walk/jog `STAGES`; she moves on after a pain-free week or steps back.
- Pain after exercise (0–10, last 14 days), a weekly waist log with a line, and two food lists she types herself. **Never put the owner's personal food or health details in the code or docs; the repo is public.**
- Reminders: Settings → "Include my training days" adds `abide-body` (Mon/Tue/Thu/Sat minus fast days) at `settings.bodyTime` (default 5pm).

## Look (v8)

- Plus Jakarta Sans for the interface, Lora for scripture. Today's top is a small app icon plus the greeting (no big title), then round shortcuts: Read (today's next chapter), Speak it, Pray, Journal.

## Meditation

- The `Meditation` theme (30 verses, verified against the KJV) supplies "Meditate today" on the Today screen (`meditationOfDay`).
- The `meditate` view guides 5 steps, offers a 5-minute timer, and saves notes to the journal. It works on any themed verse.

## Dreams

- **Where:** More → Dreams, plus a "Had a dream last night?" card on Today before 10am. A new dream's date defaults to the previous night when created before noon.
- **Voice typing:** uses the browser's `SpeechRecognition` (Chrome sends audio to Google; the UI says so).
- **List:** recurring symbols come from tags used more than once. Search covers title, text, meaning, scripture and tags.
- **Scriptures:** the `Dreams & visions` theme (18 verses, verified against the KJV).

## Reading plan

`planFor(day)` gives each day an even share, by verses, of what's still unread, until `PLAN_END` (2027-03-31). It splits the share into morning, afternoon and night. A missed day is automatically spread over the remaining days. Checked by simulation: reading every day finishes all 1,189 chapters in 176 days, averaging about 7 a day.

## Rules

- **On every deploy, bump `CACHE` in `sw.js` and `APP_VERSION` in `js/core.js` together.** The update banner compares them.
- Confirmations use `ask()`. Never use `confirm()` or `alert()`.
- Messages are YouTube **search** links. Never invent video IDs.
- Tests for the NIV use a mock of api.bible (same paths and response shapes). Before claiming the live NIV works, check it with the owner's real key via Settings → Test NIV connection.
- Reminders: Settings → Reminders → "Add reminders to my calendar" downloads `abide-reminders.ics` (built by `buildReminders()`: floating local times, fixed UIDs `abide-morning/afternoon/night/fast@yilkash.github.io` with a rising SEQUENCE so re-importing updates rather than duplicates, ends at PLAN_END). The owner opens it and picks their own calendar. Never write to any connected Google account on their behalf (an earlier mistake did; those events were deleted on 2026-10-08).
- The owner wants a plan described before anything new is built.

## Deploy and test

- **Push** as the `Yilkash` GitHub account.
- **Test** with Playwright at 390×844, served over HTTP (`python3 -m http.server`); `file://` can't fetch `kjv.json`. Cover:
  - day 1 is Genesis 1–2 / 3–5 / 6–7 and "On track";
  - a session read-through;
  - the fast card on a Wednesday at 10:30;
  - scripture save and open in context;
  - prayer, journal and lesson;
  - reload persistence;
  - the full-plan simulation finishes 1189/1189;
  - Speak it (read aloud with a mocked `speechSynthesis`, declare, streak);
  - Body: strength rounds and rest timer, level-up, fast day, Saturday ball day, waist, foods, steps, reminders;
  - the PIN: set, locked prayer list, wrong PIN, hint, right PIN, relock after time away, turn off.

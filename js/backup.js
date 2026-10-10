/* ---------- backup ---------- */
const KEYS = ["settings", "pre", "read", "dreams", "days", "log", "fasts", "prayers", "journal", "lessons", "favs", "saved", "start", "declared", "body", "teach"];
function backup() {
  const data = { app: "abide", at: new Date().toISOString() };
  for (const k of KEYS) data[k] = load(k, null);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
  a.download = `abide-backup-${todayKey()}.json`;
  a.click();
}
function restore(e) {
  const file = e.target.files[0]; if (!file) return;
  file.text().then(async (text) => {
    let data; try { data = JSON.parse(text); } catch { return toast("That file isn't an Abide backup"); }
    if (data.app !== "abide") return toast("That file isn't an Abide backup");
    if (!(await ask({ title: "Restore this backup?", text: `From ${new Date(data.at).toLocaleString()}. It replaces what's on this phone now.`, yes: "Restore", danger: true }))) return;
    for (const k of KEYS) if (data[k] != null) save(k, data[k]);
    location.reload();
  });
}

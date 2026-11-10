const apps = [
  ["growthspace", "Growthspace"], ["gmail", "Gmail"], ["outlook-mail", "Outlook Mail"],
  ["apple-mail", "Apple Mail"], ["whatsapp", "WhatsApp"], ["messages", "Messages"], ["calls", "Calls"],
];
const root = document.querySelector("#apps");
const status = document.querySelector("#status");
for (const [id, label] of apps) {
  const button = document.createElement("button"); button.className = "app"; button.textContent = label; button.disabled = true;
  button.addEventListener("click", async () => {
    status.textContent = `Opening ${label}…`;
    const result = await chrome.runtime.sendMessage({ type: "open-approved-app", app: id });
    status.textContent = result?.ok ? `${label} opened.` : (result?.error || "Could not open app.");
    if (!result?.ok) status.className = "status error";
  }); root.append(button);
}
chrome.tabs.query({ url: ["https://growthspacecrm.vercel.app/*"] }).then(async (tabs) => {
  if (!tabs[0]?.id) throw new Error("Open GrowthSpace and sign in first.");
  return chrome.tabs.sendMessage(tabs[0].id, { type: "get-browser-policy" });
})
  .then((data) => {
    if (!data?.ok) throw new Error(data?.error || "Could not read workspace policy.");
    const allowed = new Set(data.policy?.allowed_apps || []);
    [...root.children].forEach((button, index) => { button.disabled = !data.policy?.enabled || !allowed.has(apps[index][0]); });
    status.textContent = data.policy?.enabled ? "Connected · admin policy active" : "Browser access is disabled by admin.";
  })
  .catch((error) => { status.textContent = error.message; status.className = "status error"; });

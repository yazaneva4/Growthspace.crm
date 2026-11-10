const APPS = {
  growthspace: { label: "Growthspace", url: "https://growthspace.sa/" },
  gmail: { label: "Gmail", url: "https://mail.google.com/" },
  "outlook-mail": { label: "Outlook Mail", url: "https://outlook.office.com/mail/" },
  "apple-mail": { label: "Apple Mail", url: "https://www.icloud.com/mail/" },
  whatsapp: { label: "WhatsApp", url: "https://web.whatsapp.com/" },
  messages: { label: "Messages", url: "https://messages.google.com/web/" },
  calls: { label: "Calls", url: "https://growthspace.sa/" },
};
const POLICY_URL = "https://growthspacecrm.vercel.app/api/agent/browser";

function allowedHost(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname === "growthspace.sa" || u.hostname.endsWith(".growthspace.sa") || Object.values(APPS).some((app) => new URL(app.url).hostname === u.hostname));
  } catch { return false; }
}

async function policy() {
  const tabs = await chrome.tabs.query({ url: ["https://growthspacecrm.vercel.app/*"] });
  const tab = tabs[0];
  if (!tab?.id) throw new Error("Open GrowthSpace and sign in first.");
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { type: "get-browser-policy" }, (result) => {
      if (chrome.runtime.lastError) reject(new Error("Refresh the signed-in GrowthSpace tab first."));
      else if (!result?.ok) reject(new Error(result?.error || "Could not read workspace policy."));
      else resolve(result);
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "open-approved-app") return false;
  (async () => {
    const app = APPS[message.app];
    if (!app) throw new Error("App is not approved by the extension.");
    const data = await policy();
    if (!data.policy?.enabled || !data.policy.allowed_apps?.includes(message.app)) throw new Error("This app is disabled by the workspace admin.");
    await chrome.tabs.create({ url: app.url });
    return { ok: true };
  })().then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "computer-action-request") return false;
  (async () => {
    const data = await policy();
    if (!data.policy?.computer_access_enabled) throw new Error("Computer access is disabled by the workspace admin.");
    if (!data.policy?.require_confirmation) throw new Error("Confirmation is required for computer actions.");
    return { ok: false, requiresConfirmation: true, action: message.action };
  })().then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

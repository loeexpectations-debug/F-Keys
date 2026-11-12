chrome.action.onClicked.addListener(async ({ id: tabId }) => {
  if (tabId === undefined) return;
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["overlay.js"] });
    await chrome.action.setBadgeText({ tabId, text: "" });
    await chrome.action.setTitle({ tabId, title: "Show or hide F Keys" });
  } catch {
    await chrome.action.setBadgeText({ tabId, text: "!" });
    await chrome.action.setTitle({ tabId, title: "F Keys cannot open on this page" });
  }
});

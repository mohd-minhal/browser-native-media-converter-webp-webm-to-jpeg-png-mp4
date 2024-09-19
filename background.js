chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ webpConvert: "image/png" }, () => {
      console.log('Default format set to image/png');
  });
});

chrome.downloads.onChanged.addListener(async (delta) => {
    if (!delta.state || delta.state.current !== "complete") return;

  
    const { converterEnabled, webpConvert } = await new Promise((resolve) =>
      chrome.storage.local.get(["converterEnabled", "webpConvert"], resolve)
    );
  
    if (!converterEnabled) return;
  
    try {
      const results = await new Promise((resolve, reject) => {
        chrome.downloads.search({ id: delta.id }, (results) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(results);
          }
        });
      });
  
      const file = results[0];
  
      if (file.filename.endsWith(".webm") || file.filename.endsWith(".webp")) {
        const tabs = await new Promise((resolve) =>
          chrome.tabs.query({ active: true, currentWindow: true }, resolve)
        );
  
        const tab = tabs[0];
        if (tab) {
          chrome.tabs.sendMessage(
            tab.id,
            {
              command: "logMessage",
              fileName: file.filename.split('/').pop().split('\\').pop(),
              fileUrl: file.url,
              webpConvert:webpConvert,
            },
            (response) => {
              console.log("Content script response:", response);
              if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
              }
            }
          );
        }
      }
    } catch (error) {
      console.error("Error handling download change:", error);
    }
  });
  
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.command === "download") {
      const { url, filename } = message;
  
      try {
        const downloadId = await new Promise((resolve, reject) => {
          chrome.downloads.download(
            { url: url, filename: filename, saveAs: false },
            (downloadId) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(downloadId);
              }
            }
          );
        });
  
        console.log("File downloaded with ID:", downloadId);
        sendResponse({ success: true, downloadId });
      } catch (error) {
        console.error("Error downloading file:", error);
        sendResponse({ success: false, error: error.message });
      }
  
      return true;
    }
  });
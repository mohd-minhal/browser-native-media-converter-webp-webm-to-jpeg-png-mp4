document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("isenableBtn");
    const conversionForm = document.getElementById("conversionForm");
  
    chrome.storage.local.get(
      ["converterEnabled", "webpConvert"],
      function (result) {
        toggleButton.textContent = result.converterEnabled ? "Disable" : "Enable";
        toggleButton.style.backgroundColor = result.converterEnabled
          ? "red"
          : "#62f608";
  
        if (result.webpConvert) {
          document.getElementById("webpConvert").value = result.webpConvert;
        }
      }
    );
  
    toggleButton.addEventListener("click", () => {
      chrome.storage.local.get(["converterEnabled"], function (result) {
        const newState = !result.converterEnabled;
        chrome.storage.local.set({ converterEnabled: newState }, function () {
          toggleButton.textContent = newState ? "Disable" : "Enable";
          toggleButton.style.backgroundColor = newState ? "red" : "#62f608";
        });
      });
    });
  
    conversionForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const webpConvert = document.getElementById("webpConvert").value;
  
      chrome.storage.local.set({ webpConvert }, function () {
        alert("Conversion preferences saved!");
      });
    });
  });
  
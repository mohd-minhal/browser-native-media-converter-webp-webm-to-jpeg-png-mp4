console.log("Content script loaded");

chrome.runtime.onMessage.addListener(async function(
  message,
  sender,
  sendResponse
) {
  if (message.command === "logMessage") {
    let fileExtension = message.fileUrl.split(".").pop();
    if (fileExtension === "webm") {
      const mp4BlobUrl = await convertWebMToMP4(message.fileUrl);
      chrome.runtime.sendMessage({
        command: "download",
        url: mp4BlobUrl,
        filename:
          message.fileName
            .split(".")
            .slice(0, -1)
            .join(".") + ".mp4",
      });
    } else {
      const imgBlobUrl = await convertWebp(
        message.fileUrl,
        message.webpConvert
      );
      chrome.runtime.sendMessage({
        command: "download",
        url: imgBlobUrl,
        filename:
          message.fileName
            .split(".")
            .slice(0, -1)
            .join(".") +
          "." +
          message.webpConvert.split("/")[1],
      });
    }
    return true;
  }
});

async function convertWebMToMP4(fileUrl) {
  try {
    const response = await fetch(fileUrl);
    const webmBlob = await response.blob();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const mp4Blob = new Blob([arrayBuffer], { type: "video/mp4" });
    const mp4BlobUrl = URL.createObjectURL(mp4Blob);
    return mp4BlobUrl;
  } catch (error) {
    console.error("Error during WebM to MP4 conversion:", error);
  }
}

async function convertWebp(fileUrl, format="image/png", quality = 1.0) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = fileUrl;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  const blob = await new Promise((resolve) => {
    if (format === "image/jpeg") {
      canvas.toBlob(resolve, format, quality);
    } else {
      canvas.toBlob(resolve, format);
    }
  });

  const blobUrl = URL.createObjectURL(blob);

  return blobUrl;
}

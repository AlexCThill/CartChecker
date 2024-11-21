//need OnMessage Listener here
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scrapeDate") {
    scraperDate();
    sendResponse({ success: true });
  }
});

function scraperDate() {
  let modDateElement = document.querySelector(".basketModificationDate");

  if (modDateElement) {
    let modDate = modDateElement.innerText.trim();

    console.log("scraped modDate:", modDate);

    browser.runtime.sendMessage({
      action: "addModDate",
      modDate: modDate,
    });

    console.log("Going back in history...");
    history.back();
  } else {
    console.log("Mod date element not found");
  }
}

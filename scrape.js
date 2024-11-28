//need OnMessage Listener here
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scrapeDate") {
    scraperDate();
    sendResponse({ success: true });
  }
});

function scraperDate() {
  let modDateElement = document.querySelector(".basketModificationDate");
  let creationDateElement = document.querySelector(".basketCreationDate");
  let basketTotalElement = document.querySelector(".basketTotal");

  let modDate = modDateElement ? modDateElement.innerText.trim() : null;
  let creationDate = creationDateElement
    ? creationDateElement.innerText.trim()
    : null;
  let basketTotal = basketTotalElement
    ? basketTotalElement.innerText.trim()
    : null;

  console.log("scraped modDate:", modDate);
  console.log("scraped creationDate:", creationDate);
  console.log("scraped basketTotal:", basketTotal);

  history.back();

  browser.runtime.sendMessage({
    action: "addScrapedData",
    modDate: modDate,
    creationDate: creationDate,
    basketTotal: basketTotal,
  });

  console.log("Going back in history...");
}

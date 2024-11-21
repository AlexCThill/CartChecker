let customerEmailsToSearch = [
  // "athill@gmail.com",
  "Athill@lumens.com",
  "athilll@yahoo.com",
];

let matchingCustomerEmails = [];
let scrapedDates = [];
let currentEmailIndex = 0;

//This is for scraping modDate from customer page
const targetUrl = "https://www.lumens.com/csc/view-customer/";

browser.browserAction.onClicked.addListener((tab) => {
  startSearch(tab.id);
});

function startSearch(tabId) {
  // currentEmailIndex = 0;
  browser.tabs.sendMessage(tabId, {
    action: "searchEmail",
    email: customerEmailsToSearch[currentEmailIndex],
  });
}

//The listener for checkForMatches function that checks and
// Email match then presses select customer button
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "result") {
    if (message.match) {
      matchingCustomerEmails.push(customerEmailsToSearch[currentEmailIndex]);
      // currentEmailIndex++;
      browser.runtime
        .sendMessage({ action: "scrapeDate" })
        .then((response) => {
          if (response.success) {
            console.log("scrapeDate action triggered successfully.");
          } else {
            console.error("scrapeDate action failed.");
          }
        })
        .catch((error) => {
          console.error("Error sending scrapeDate message:", error);
        });
    } else {
    }

    // Target URL
    const targetURL = "https://www.lumens.com/csc/view-customer/";

    // Use webNavigation API to detect when the target URL is visited
    browser.webNavigation.onCompleted.addListener(
      (details) => {
        if (details.url === targetURL) {
          console.log("Target URL visited:", details.url);

          // Send a message to the content script (scrape.js)
          browser.tabs.sendMessage(details.tabId, { action: "scrapeDate" });
        }
      },
      { url: [{ urlEquals: targetURL }] }
    );

    if (currentEmailIndex < customerEmailsToSearch.length) {
      browser.tabs.sendMessage(sender.tab.id, {
        action: "searchEmail",
        email: customerEmailsToSearch[currentEmailIndex],
      });
    } else {
      displayResults(sender.tab.id);
    }
  }
});

//Listener for scraped date data + stores in array
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addModDate") {
    if (message.modDate) {
      console.log("Date added to scrapedDates:", message.modDate);
      scrapedDates.push(message.modDate);
      console.log("Updated scrapedDates array:", scrapedDates);
      currentEmailIndex++;
      console.log(currentEmailIndex);
      startSearch(sender.tab.id);

      if (currentEmailIndex < customerEmailsToSearch.length) {
        startSearch(sender.tab.id);
      } else {
        displayResults(sender.tab.id);
      }

      // Send a success response
      sendResponse({ success: true, message: "modDate added successfully" });
    } else {
      console.error("modDate not found in the message");
      sendResponse({ success: false, message: "modDate is missing" });
    }
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    browser.tabs.sendMessage(tabId, {
      action: "checkForMatch",
      email: customerEmailsToSearch[currentEmailIndex],
    });
  }
});

// Listener for tab updates for Customer Cart Page
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes(targetUrl)
  ) {
    console.log(`Landed on the target webpage: ${tab.url}`);
    // Inject the script to run `dateChecker`
    browser.scripting.executeScript({
      target: { tabId: tabId },
      files: ["scape.js"], // Ensure this script is included in your extension manifest
    });
  }
});

function displayResults(tabId) {
  browser.tabs.sendMessage(tabId, {
    action: "displayResults",
    results: matchingCustomerEmails,
  });
}

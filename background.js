let customerEmailsToSearch = [
  "athill@gmail.com",
  "athill@lumens.com",
  "athilll@yahoo.com",
];

let matchingCustomerEmails = [];
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

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    browser.tabs.sendMessage(tabId, {
      action: "checkForMatch",
      email: customerEmailsToSearch[currentEmailIndex],
    });
  }
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "result") {
    if (message.match) {
      matchingCustomerEmails.push(customerEmailsToSearch[currentEmailIndex]);
    }

    //This broken
    currentEmailIndex++;

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

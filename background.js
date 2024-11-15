let customerEmailsToSearch = [
  "athill@gmail.com",
  "athill@lumens.com",
  "athilll@yahoo.com",
];
let matchingCustomerEmails = [];
let currentEmailIndex = 0;

browser.browserAction.onClicked.addListener((tab) => {
  startSearch(tab.id);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    browser.tabs.sendMessage(tabId, {
      action: "checkForMatch",
      email: customerEmailsToSearch[currentEmailIndex],
    });
  }
});

function startSearch(tabId) {
  currentEmailIndex = 0;
  browser.tabs.sendMessage(tabId, {
    action: "searchEmail",
    email: customerEmailsToSearch[currentEmailIndex],
  });
}

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "result") {
    if (message.match) {
      matchingCustomerEmails.push(customerEmailsToSearch[currentEmailIndex]);
    }
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

function displayResults(tabId) {
  browser.tabs.sendMessage(tabId, {
    action: "displayResults",
    results: matchingCustomerEmails,
  });
}

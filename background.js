let customerEmailsToSearch = [
  "Stephanie.Schilling@kohler.com",
  "kristin@kristinsteleadesign.com",
  "devraj.sudha@gmail.com",
  "Stephanie.Schilling@kohler.com",
  "kristin@dogreatprojects.com",
  "trishaelliott10@gmail.com",
  "whitney@tgmillerco.com",
  "Stephanie.Schilling@kohler.com",
  "Mona@monarizzardihomes.com",
  "dippedinteriors@gmail.com",
  "jkpolk7@gmail.com",
  "lunaz13@comcast.net",
  "fairwoodinteriors@gmail.com",
  "Lucinda@lucindalesterdesign.com",
  "scott@promenadedb.com",
  "vicki@ryancustomhomesinc.com",
];

let matchingCustomerEmails = [];
let scrapedData = [];
let currentEmailIndex = 0;

//This is for scraping modDate, creationDate, and basketTotal from customer page
const targetUrl = "https://www.lumens.com/csc/view-customer/";

browser.browserAction.onClicked.addListener((tab) => {
  currentEmailIndex = 0; // Restart search on addon button press
  matchingCustomerEmails = [];
  scrapedData = [];
  startSearch(tab.id);
});

function startSearch(tabId) {
  browser.tabs.sendMessage(tabId, {
    action: "searchEmail",
    email: customerEmailsToSearch[currentEmailIndex],
  });
}

// Listener for email match checking and customer selection
browser.runtime.onMessage.addListener((message, sender) => {
  console.log("background:" + message.action);
  if (message.action === "result") {
    console.log("message.match:" + message.match);
    if (message.match) {
      // Target URL
      const targetURL = "https://www.lumens.com/csc/view-customer/";

      const oneTimeViewCustomerPageListener = (details) => {
        if (details.url === targetURL) {
          console.log("Target URL visited:", details.url);

          // Send a message to the content script (scrape.js)
          browser.tabs.sendMessage(details.tabId, { action: "scrapeDate" });

          // Remove listener after use
          browser.webNavigation.onCompleted.removeListener(
            oneTimeViewCustomerPageListener
          );
        }
      };

      // Detect when the target URL is visited
      browser.webNavigation.onCompleted.addListener(
        oneTimeViewCustomerPageListener,
        { url: [{ urlEquals: targetURL }] }
      );
    } else {
      console.log("No email match found.");

      // Move to next email
      currentEmailIndex++;
      console.log("currentEmailIndex:" + currentEmailIndex);

      if (currentEmailIndex < customerEmailsToSearch.length) {
        browser.tabs.sendMessage(sender.tab.id, {
          action: "searchEmail",
          email: customerEmailsToSearch[currentEmailIndex],
        });
      } else {
        console.log(matchingCustomerEmails);
        console.log(scrapedData);
        console.log("DONE");
      }
    }
  } else {
    return; // Not handled by this listener
  }
});

// Listener for scraped data (modDate, creationDate, basketTotal)
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addScrapedData") {
    const { modDate, creationDate, basketTotal } = message;

    if (modDate || creationDate || basketTotal) {
      matchingCustomerEmails.push(customerEmailsToSearch[currentEmailIndex]);
      scrapedData.push({ modDate, creationDate, basketTotal });

      console.log("Scraped data received:", {
        modDate,
        creationDate,
        basketTotal,
      });
      currentEmailIndex++;

      setTimeout(() => {
        if (currentEmailIndex < customerEmailsToSearch.length) {
          startSearch(sender.tab.id);
        } else {
          displayResults(sender.tab.id);
        }
      }, 2000); // Allow page reload time

      sendResponse({
        success: true,
        message: "Scraped data processed successfully",
      });
    } else {
      console.error("Scraped data is missing or null");
      currentEmailIndex++;

      setTimeout(() => {
        if (currentEmailIndex < customerEmailsToSearch.length) {
          startSearch(sender.tab.id);
        } else {
          displayResults(sender.tab.id);
        }
      }, 2000);

      sendResponse({
        success: false,
        message: "Scraped data is missing or null",
      });
    }
  }
});

function displayResults(tabId) {
  console.log("Scraped Data:", scrapedData);

  const combinedArray = matchingCustomerEmails.map((email, index) => {
    const { modDate, creationDate, basketTotal } = scrapedData[index] || {};
    return { email, modDate, creationDate, basketTotal };
  });

  console.log(combinedArray);

  browser.tabs.sendMessage(tabId, {
    action: "displayResults",
    results: combinedArray,
  });
}

let customerEmailsToSearch = [
  "Athill@lumens.com",
  "Alex1@gmail.com",
  "Alex2@gmail.com",
  "Athill@lumens.com",
  // "Alex3@gmail.com",
  // "Athill@lumens.com",
  // "Alex4@gmail.com",
  // "Athill@lumens.com",
  // "Alex5@gmail.com",
  // "Athill@lumens.com",
  // "Alex6@gmail.com",
  // "Athill@lumens.com",
  // "Alex7@gmail.com",
  // "Alex8@gmail.com",
  // "Alex9@gmail.com",
  // "Alex10@gmail.com",
  // "Alex11@gmail.com",
  // "Alex12@gmail.com",
  // "Alex13@gmail.com",
  // "Alex14@gmail.com",
  // "Alex15@gmail.com",
  // "Alex16@gmail.com",
  // "Alex17@gmail.com",
  // "Alex18@gmail.com",
  // "Alex19@gmail.com",
  // "Alex20@gmail.com",
];

let matchingCustomerEmails = [];
let scrapedDates = [];
let currentEmailIndex = 0;

//This is for scraping modDate from customer page
const targetUrl = "https://www.lumens.com/csc/view-customer/";

browser.browserAction.onClicked.addListener((tab) => {
  currentEmailIndex = 0; // Assuming the addon button press should restart the search (?)
  startSearch(tab.id);
});

function startSearch(tabId) {
  browser.tabs.sendMessage(tabId, {
    action: "searchEmail",
    email: customerEmailsToSearch[currentEmailIndex],
  });
}

//The listener for checkForMatches function that checks and
// Email match then presses select customer button
browser.runtime.onMessage.addListener((message, sender) => {
  console.log('background:' + message.action);
  if (message.action === "result") {
    console.log('message.match:' + message.match);
    if (message.match) {
      matchingCustomerEmails.push(customerEmailsToSearch[currentEmailIndex]);
      //
      // I removed this message send because it's too early to scrape the data.
      // An error is thrown when sending the message:
      // "Error sending scrapeDate message: Error: Could not establish connection. Receiving end does not exist." 
      // Also, the message is sent again in the listener below. So it was being sent twice.
      //
      // browser.runtime
      //   .sendMessage({ action: "scrapeDate" })
      //   .then((response) => {
      //     if (response.success) {
      //       console.log("scrapeDate action triggered successfully.");
      //     } else {
      //       console.error("scrapeDate action failed.");
      //     }
      //   })
      //   .catch((error) => {
      //     console.error("Error sending scrapeDate message:", error);
      //   });

      // Target URL
      const targetURL = "https://www.lumens.com/csc/view-customer/";


      const oneTimeViewCustomerPageListener = (details) => {
        if (details.url === targetURL) {
          console.log("Target URL visited:", details.url);

          // Send a message to the content script (scrape.js)
          browser.tabs.sendMessage(details.tabId, { action: "scrapeDate" });

          // Only want to send this message once per match, so remove the listner
          // It will be added again on the next match
          browser.webNavigation.onCompleted.removeListener(oneTimeViewCustomerPageListener);
        }
      };

      // Use webNavigation API to detect when the target URL is visited
      browser.webNavigation.onCompleted.addListener(
        oneTimeViewCustomerPageListener,
        { url: [{ urlEquals: targetURL }] }
      );

      // The listener above hasn't been run yet, only set up.
      // So it's too early to start the next search.
      // Starting here will cause the two actions to run on top of eachother (scrape date + search next email)

      // if (currentEmailIndex < customerEmailsToSearch.length) {
      //   browser.tabs.sendMessage(sender.tab.id, {
      //     action: "searchEmail",
      //     email: customerEmailsToSearch[currentEmailIndex],
      //   });
      // } else {
      //   displayResults("It broke in this spot:3", sender.tab.id);
      // }

    } else {
      console.log("No email match found.");

      // No match for this email, so I think we can just move on to the next email at this point(?)
      currentEmailIndex++;
      console.log('currentEmailIndex:' + currentEmailIndex);

      if (currentEmailIndex < customerEmailsToSearch.length) {
        browser.tabs.sendMessage(sender.tab.id, {
          action: "searchEmail",
          email: customerEmailsToSearch[currentEmailIndex],
        });
      } else {
        console.log('DONZO');
      }

    }

  } else {
    console.log('Message not handled by this listener');
    // currentEmailIndex++;
    // setTimeout(() => {
    //   startSearch(sender.tab.id);
    // }, 2000);
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
      console.log("Current email index:", currentEmailIndex);

      // Time out to get page time to reload after back button
      setTimeout(() => {
        if (currentEmailIndex < customerEmailsToSearch.length) {
          startSearch(sender.tab.id);
        } else {
          displayResults(sender.tab.id);
        }
      }, 2000); // 1000ms = 1 second

      // Send a success response
      sendResponse({ success: true, message: "modDate added successfully" });
    } else {
      console.error("modDate not found in the message");
      sendResponse({ success: false, message: "modDate is missing" });
    }
  }
});

// I'm not sure why this is here, but its causing some confusion
// With this listener, we end up with multiple checkForMatch calls per single match
// This is because searchEmail also calls checkForMatch directly
//
// browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
//   if (changeInfo.status === "complete") {
//     browser.tabs.sendMessage(tabId, {
//       action: "checkForMatch",
//       email: customerEmailsToSearch[currentEmailIndex],
//     });
//   }
// });

// I don't think this is required because the manifest includes scrape.js on the view-customer page
// Also, this code is not doing anything right now
// Throws error: TypeError: browser.scripting is undefined
//
// Listener for tab updates for Customer Cart Page
// browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (
//     changeInfo.status === "complete" &&
//     tab.url &&
//     tab.url.includes(targetUrl)
//   ) {
//     console.log(`Landed on the target webpage: ${tab.url}`);
//     // Inject the script to run `dateChecker`
//     browser.scripting.executeScript({
//       target: { tabId: tabId },
//       files: ["scape.js"], // Ensure this script is included in your extension manifest
//     });
//   }
// });

function displayResults(tabId) {
  browser.tabs.sendMessage(tabId, {
    action: "displayResults",
    results: matchingCustomerEmails,
  });
}

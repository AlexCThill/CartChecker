browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "searchEmail") {
    searchEmail(message.email);
  } else if (message.action === "checkForMatch") {
    checkForMatch(message.email);
  } else if (message.action === "displayResults") {
    displayResults(message.results);
  }
});

function searchEmail(email) {
  let searchField = document.querySelector("#searchTerm");
  let searchButton = document.querySelector("#cs-agent-search-customer");

  if (searchField && searchButton) {
    searchField.value = email;
    console.log(email);
    searchButton.click(); // Trigger the search

    // Periodically check for the customer list container
    const intervalId = setInterval(() => {
      const customerListContainer = document.querySelector(".customer_email");
      const emptyRow = document.querySelector(".dataTables_empty");
      if (customerListContainer || emptyRow) {
        clearInterval(intervalId); // Stop checking once the container is found
        checkForMatch(email); // Trigger the function to check for matches
      } else {
        console.log(
          "Search result elements not found. Keep waiting for load.."
        );
      }
    }, 2000);
  } else {
    console.log("Search field or button not found on the page.");
  }
}

function checkForMatch(email) {
  let customerListContainer = document.querySelector(".customer_email");
  let errorContainer = document.querySelector(".error-message"); // Replace with the actual error container selector

  if (customerListContainer) {
    // Cart exists
    let containerText = customerListContainer.textContent.trim().toLowerCase();
    let normalizedEmail = email.toLowerCase();

    if (containerText === normalizedEmail) {
      console.log("They match!");
      browser.runtime
        .sendMessage({ action: "result", match: true })
        .then(() => {
          let selectCustomerbtn = document.querySelector(
            ".customer-record-item"
          );
          selectCustomerbtn && selectCustomerbtn.click();
        });
    } else {
      console.log("Not a match, stopping everything");
      browser.runtime.sendMessage({ action: "result", match: false });
    }
  } else if (errorContainer) {
    // Explicitly handle the "No records found" case
    console.log("Error: No records found for the given email.");
    browser.runtime.sendMessage({ action: "result", match: false });
  } else {
    // Default case for safety
    console.log("No match and no error container detected.");
    browser.runtime.sendMessage({ action: "result", match: false });
  }
}

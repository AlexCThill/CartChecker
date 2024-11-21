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
      if (customerListContainer) {
        clearInterval(intervalId); // Stop checking once the container is found
        checkForMatch(email); // Trigger the function to check for matches
      }
    }, 3000);
  } else {
    console.log("Search field or button not found on the page.");
  }
}

function checkForMatch(email) {
  let customerListContainer = document.querySelector(".customer_email");
  let selectCustomerbtn = document.querySelector(".customer-record-item");

  if (customerListContainer != null) {
    let containerText = customerListContainer.textContent.trim();

    if (containerText === email) {
      console.log("They match!");
      browser.runtime
        .sendMessage({ action: "result", match: true })
        .then(selectCustomerbtn.click());
    } else {
      console.log("Not a match");
      browser.runtime.sendMessage({ action: "result", match: false });
    }
  }
}

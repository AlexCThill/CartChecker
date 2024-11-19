browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "searchEmail") {
    searchEmail(message.email);
  } else if (message.action === "checkForMatch") {
    checkForMatch(message.email);
  } else if (message.action === "displayResults") {
    displayResults(message.results);
  }
});

browser.runtime.onMessage.addListener();
function searchEmail(email) {
  let searchField = document.querySelector("#searchTerm");
  let searchButton = document.querySelector("#cs-agent-search-customer");

  if (searchField && searchButton) {
    searchField.value = email;
    searchButton.click();
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
      selectCustomerbtn.click();

      //   browser.runtime.sendMessage({ action: "result", match: true });
    } else {
      console.log("Not a match");
      browser.runtime.sendMessage({ action: "result", match: false });
    }
  }
}

function displayResults(results) {
  let modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.backgroundColor = "white";
  modal.style.padding = "20px";
  modal.style.border = "1px solid black";
  modal.style.zIndex = "10000";

  let title = document.createElement("h3");
  title.textContent = "Matching Customer Emails";
  modal.appendChild(title);

  if (results.length > 0) {
    results.forEach((email) => {
      let emailItem = document.createElement("p");
      emailItem.textContent = email;
      modal.appendChild(emailItem);
    });
  } else {
    let noMatchMessage = document.createElement("p");
    noMatchMessage.textContent = "No matches found.";
    modal.appendChild(noMatchMessage);
  }

  let closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.onclick = () => document.body.removeChild(modal);
  modal.appendChild(closeButton);

  document.body.appendChild(modal);
}

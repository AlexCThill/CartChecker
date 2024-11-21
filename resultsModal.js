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

function displayResults(results) {
  // Modal container
  let modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.backgroundColor = "white";
  modal.style.padding = "20px";
  modal.style.border = "1px solid black";
  modal.style.zIndex = "10000";
  modal.style.width = "80%";
  modal.style.maxWidth = "600px";

  // Scrollable content section
  let contentContainer = document.createElement("div");
  contentContainer.style.maxHeight = "60vh"; // Limit height to 60% of the viewport
  contentContainer.style.overflowY = "auto"; // Enable scrolling for content
  contentContainer.style.marginBottom = "20px";

  let title = document.createElement("h3");
  title.textContent = "Matching Customer Emails and Data";
  contentContainer.appendChild(title);

  if (results.length > 0) {
    // Create the table
    let table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    // Create the header row
    let headerRow = document.createElement("tr");

    const headers = ["Email", "Modified Date", "Creation Date", "Basket Total"];
    headers.forEach((headerText) => {
      let headerCell = document.createElement("th");
      headerCell.textContent = headerText;
      headerCell.style.border = "1px solid black";
      headerCell.style.padding = "8px";
      headerCell.style.textAlign = "left";
      headerRow.appendChild(headerCell);
    });

    table.appendChild(headerRow);

    // Populate the table with data
    results.forEach((result) => {
      let row = document.createElement("tr");

      let emailCell = document.createElement("td");
      emailCell.textContent = result.email || "N/A";
      emailCell.style.border = "1px solid black";
      emailCell.style.padding = "8px";

      let modDateCell = document.createElement("td");
      modDateCell.textContent = result.modDate || "N/A";
      modDateCell.style.border = "1px solid black";
      modDateCell.style.padding = "8px";

      let creationDateCell = document.createElement("td");
      creationDateCell.textContent = result.creationDate || "N/A";
      creationDateCell.style.border = "1px solid black";
      creationDateCell.style.padding = "8px";

      let basketTotalCell = document.createElement("td");
      basketTotalCell.textContent = result.basketTotal || "N/A";
      basketTotalCell.style.border = "1px solid black";
      basketTotalCell.style.padding = "8px";

      row.appendChild(emailCell);
      row.appendChild(modDateCell);
      row.appendChild(creationDateCell);
      row.appendChild(basketTotalCell);
      table.appendChild(row);
    });

    contentContainer.appendChild(table);
  } else {
    let noMatchMessage = document.createElement("p");
    noMatchMessage.textContent = "No matches found.";
    contentContainer.appendChild(noMatchMessage);
  }

  // Add content to the modal
  modal.appendChild(contentContainer);

  // Button container (fixed below the scrollable content)
  let buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";

  // Add Copy Button
  let copyButton = document.createElement("button");
  copyButton.textContent = "Copy to Clipboard";
  copyButton.style.flex = "1";
  copyButton.style.marginRight = "10px";
  copyButton.onclick = () => {
    // Include headers in the copied text
    const textToCopy = [
      "Email\tModified Date\tCreation Date\tBasket Total", // Header row
      ...results.map(
        (result) =>
          `${result.email || "N/A"}\t${result.modDate || "N/A"}\t${
            result.creationDate || "N/A"
          }\t${result.basketTotal || "N/A"}`
      ), // Data rows
    ].join("\n"); // Join rows with newline characters

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        alert("Data copied to clipboard. You can now paste it into Excel.");
      },
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
  };

  // Close Button
  let closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.flex = "1";
  closeButton.style.marginLeft = "10px";
  closeButton.onclick = () => document.body.removeChild(modal);

  // Append buttons to container
  buttonContainer.appendChild(copyButton);
  buttonContainer.appendChild(closeButton);

  // Add button container to modal
  modal.appendChild(buttonContainer);

  // Add modal to the document
  document.body.appendChild(modal);
}

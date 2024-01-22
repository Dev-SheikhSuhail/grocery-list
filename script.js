// Select relevant elements from the HTML document.
const form = document.querySelector(".content");
const alert = document.querySelector(".alert");
const grocery = document.getElementById("grocery");
const submitBtn = document.querySelector(".add-btn");
const container = document.querySelector(".grocery-container");
const list = document.querySelector(".items-list");
const clearBtn = document.querySelector(".clear-btn");
/* Variables for editing items. */
// To store a reference to the grocery item element that is currently being edited.
let editElement;
// Serves as a boolean flag to track whether the user is currently editing an existing grocery item or adding a new one.
let editFlag = false;
// Stores the unique ID of the grocery item that is currently being edited.
// For accurately targeting and updating the correct item in both the HTML list and local storage.
let editID = "";

/* Attach event listeners to handle user interactions. */
// To ensure that the code responds to user input and handles the addition of new grocery items or the editing of existing ones.
form.addEventListener("submit", addItem); // When the form is submitted, call addItem.
// To clear the entire grocery list and reset associated states when the user clicks the button.
clearBtn.addEventListener("click", clearItems); // When the clear button is clicked, call clearItems.
// To ensure that the setupItems function is executed as soon as the HTML content of the page has been parsed and loaded by the browser.
window.addEventListener("DOMContentLoaded", setupItems); // When the page loads, call setupItems
function addItem(e) {
  // Preventing the default form submission behavior (which would typically reload the page).
  e.preventDefault();
  // Retrieving the grocery item value from the form input field.
  const val = grocery.value;
  // Creates a unique ID for the item using the current timestamp. This ensures distinct identification for each item.
  const id = new Date().getTime().toString();
  // If there's a value and we're not editing.
  if (val !== "" && !editFlag) {
    // Create a new grocery list item element.
    // Creates a new article element to represent the grocery item in the HTML list.
    const element = document.createElement("article");
    // Creates a "data-id" attribute to store the unique ID.
    let attr = document.createAttribute("data-id");
    // Sets the value of the attribute to the generated ID.
    attr.value = id;
    // Attaches the attribute to the element.
    element.setAttributeNode(attr);
    // Applies a class for styling purposes.
    element.classList.add("grocery-item");
    // Sets the inner content of the element.
    element.innerHTML = `<p class="title">${val}</p>
              <div class="btn-container">
                <!-- edit btn -->
                <button type="button" class="edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <!-- delete btn -->
                <button type="button" class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `;
    /* Add event listeners to both buttons */
    // The button with the class "delete-btn" within that specific item(element).
    const deleteBtn = element.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", deleteItem); // To remove the item from the grocery list.
    // The button with the class "edit-btn" within that specific item(element).
    const editBtn = element.querySelector(".edit-btn");
    editBtn.addEventListener("click", editItem); // To initiate the editing process for the item.
    // Adds the newly created item to the grocery list in the HTML.
    list.appendChild(element);

    // Shows a success message.
    displayAlert("Item Added", "success");
    // Make the grocery list container visible.
    container.classList.add("show-container");
    // Store the item in local storage.
    // To store a newly added grocery item in the browser's local storage, ensuring persistence of the data even if the page is refreshed or closed.
    addToLocalStorage(id, val);

    // Reset form and edit flags. To reset various variables and states to their initial values, preparing the application for the next user interaction.
    setBackToDefault();
  }
  // Handles the editing of an existing grocery item rather than creating a new one.
  else if (val !== "" && editFlag) {
    // Update the item's content.
    editElement.innerHTML = val;

    // Display a success alert.
    displayAlert("Item Name Updated", "success");

    // Update the item in local storage.
    // To update an existing grocery item in the browser's local storage after a user has edited its value. This ensures that the changes persist even if the page is refreshed or closed.
    editLocalStorage(editID, val);

    // Reset form and edit flags
    setBackToDefault();
  } else {
    // Display an error alert if no value is entered in the input field.
    // Displays an error message asking the user to provide a value.
    displayAlert("Please Enter Value", "danger");
  }
}
// Displays a temporary alert message on the screen to provide visual feedback to the user about various actions or events within the application.
function displayAlert(text, action) {
  // Updates the text content of the HTML element with the class 'alert' by the provided message.
  alert.textContent = text;
  // Class name is constructed dynamically, allowing for flexibility in styling different alert types.
  alert.classList.add(`alert-${action}`);
  // Remove the alert message after 1(1000ms) second
  setTimeout(function () {
    // Clear the alert message and remove its visual styling, effectively hiding the alert message.
    alert.textContent = "";
    alert.classList.remove(`alert-${action}`); // Removes the CSS class that was dynamically added to the alert element.
  }, 1000);
}
// To completely clear the grocery list, removing all items visually and from local storage, resetting the interface, and displaying a confirmation alert.
function clearItems() {
  // Selects all HTML elements with the class "grocery-item", representing individual grocery items in a list.
  const items = document.querySelectorAll(".grocery-item");
  // Checks if any items were found.
  if (items.length > 0) {
    items.forEach(function (item) {
      // Remove the item from its parent element, a container element named "items-list".
      list.removeChild(item);
    });
  }
  // To hide the whole container visually, along with other elements related to the list.
  container.classList.remove("show-container");
  // Display a danger alert: display a message indicating that the list is now empty.
  displayAlert("Empty List", "danger");
  // Reset form and edit flags.
  setBackToDefault();
  // Clear local storage -  removes the item with the key "list" from the browser's local storage.
  localStorage.removeItem("list");
}
// Removes a specific grocery item from the list, both visually and from local storage.
function deleteItem(e) {
  // Traverses up the DOM hierarchy to find the parent element containing the item's data.
  const element = e.currentTarget.parentElement.parentElement;
  // Extract the unique identifier of the item from its dataset.id property. This ID is used to locate and remove the item in local storage.
  const id = element.dataset.id;
  // Removes the item element from its parent element.
  list.removeChild(element);

  // Check if the list is now empty after the removal.
  if (list.children.length === 0) {
    // Hide the whole container visually, along with other elements related to the list.
    container.classList.remove("show-container");
  }
  // Display a danger alert - to inform the user about the successful removal.
  displayAlert("Item Removed", "danger");
  // Reset form and edit flags.
  setBackToDefault();
  // To remove the item with the specified id from local storage.
  removeFromLocalStorage(id);
}
// Initiates the editing process for a grocery list item by preparing the interface, capturing relevant data, and setting flags for subsequent logic.
function editItem(e) {
  // Traverses up the DOM hierarchy to find the parent element containing the item's data.
  const element = e.currentTarget.parentElement.parentElement;
  // Stores a reference to the element that displays the item's text content - a sibling element of the button that triggered the edit action.
  editElement = e.currentTarget.parentElement.previousElementSibling;
  // To edit the item's text within the input field.
  grocery.value = editElement.innerHTML;
  editFlag = true; // Sets a flag indicating that the application is in edit mode.
  editID = element.dataset.id; // Stores the unique identifier of the item being edited.
  submitBtn.textContent = "Update"; // Changes the text content of a button.
}
// Set back to default - resets the application's state to its initial, non-editing mode, clearing input fields, flags, and button labels to prepare for new additions or actions.
function setBackToDefault() {
  grocery.value = "";
  editFlag = false;
  editID = "";
  submitBtn.textContent = "Add";
}

/* ****** LOCAL STORAGE ********** */
// To add a new grocery item to the list stored in local storage.
function addToLocalStorage(id, value) {
  // Constructs an object representing the item to be added, containing its unique ID and value(text content).
  const grocery = { id, value };
  let items = getLocalStorage(); // To retrieve the current list of items(already stored) from local storage.
  items.push(grocery); // Adds the newly created grocery object to the array of items, effectively appending it to the list.
  localStorage.setItem("list", JSON.stringify(items)); // Store the modified array of items back into local storage under the key "list". JSON.stringify is used to convert the array of objects into a string format suitable for local storage.
}
// Retrieves a list of grocery items from local storage, and handling cases where data might not exist.
function getLocalStorage() {
  // To retrieve the item list stored under the key "list" in local storage. If no data exists, it returns null.
  // Parses the JSON string into an array of objects using JSON.parse and returns that array. If no data exists, it returns an empty array ([]), providing a default value.
  return localStorage.getItem("list")
    ? JSON.parse(localStorage.getItem("list"))
    : [];
}
// Removes a specific grocery item from the list stored in local storage, using its unique ID.
function removeFromLocalStorage(id) {
  let items = getLocalStorage(); // To retrieve the current list of items(already stored) from local storage.
  // Creating a new array containing only the items that meet a specific condition.
  items = items.filter(function (item) {
    // Keep only items whose 'id' property is different from the provided 'id', this removes the item with the matching ID from the array.
    if (item.id !== id) {
      return item;
    }
  });
  // Store the filtered array of items back into local storage under the key "list", overwriting the previous data.
  localStorage.setItem("list", JSON.stringify(items));
}
// Modifies the textual content of a specific grocery item in the list stored in local storage, using its unique ID.
function editLocalStorage(id, value) {
  let items = getLocalStorage();
  // Creates a new array of items by applying a transformation to each item in the original array.
  items = items.map(function (item) {
    // Checks if the item's 'id' matches the provided 'id'
    if (item.id === id) {
      // Update the item's value property with the new value argument.
      item.value = value;
    }
    return item; // Otherwise, return the item unchanged.
  });
  // Store the modified array of items back into local storage.
  localStorage.setItem("list", JSON.stringify(items));
}
// ****** SETUP ITEMS **********
// Initializes the grocery list display by retrieving items from local storage, creating visible list elements for each item, and ensuring the list container is displayed appropriately.
function setupItems() {
  let items = getLocalStorage();
  // Checks if any items were retrieved.
  if (items.length > 0) {
    items.forEach(function (item) {
      createListItem(item.id, item.value); // Call createListItem().
    });
    // Make the grocery list container visible.
    container.classList.add("show-container");
  }
}
//  Creates a new visual item element for the grocery list, and attaching event listeners for interactive actions.
function createListItem(id, value) {
  // Creates a new <article> element, which will serve as the container for each list item.
  const element = document.createElement("article");
  let attr = document.createAttribute("data-id"); // Creates a new attribute named "data-id".
  attr.value = id; // Sets the value of this attribute to the provided 'id'.
  element.setAttributeNode(attr); // Attaches the attribute to the element.
  element.classList.add("grocery-item"); // Add a CSS class named "grocery-item" to the element for styling.
  //  Set the inner HTML content of the element
  element.innerHTML = `<p class="title">${value}</p>
            <div class="btn-container">
              <!-- edit btn -->
              <button type="button" class="edit-btn">
                <i class="fas fa-edit"></i>
              </button>
              <!-- delete btn -->
              <button type="button" class="delete-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `;
  /* Add event listeners to both buttons */
  // The button with the class "delete-btn" within that specific item(element).
  const deleteBtn = element.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", deleteItem); // To remove the item from the grocery list.
  // The button with the class "edit-btn" within that specific item(element).
  const editBtn = element.querySelector(".edit-btn");
  editBtn.addEventListener("click", editItem); // To initiate the editing process for the item.

  // Append child - Append the newly created and configured item element to an element named "list"(the main list container).
  list.appendChild(element);
}

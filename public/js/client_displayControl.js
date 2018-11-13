// HTML-elements ------------------------------

// LOGIN USIKKER
let loggedIn = false;
// -------

if (loggedIn) {
    window.location = "viewLists.html";
} else {
    displayLogin();
}

function displayNewUser() {
    clearScreen();
    console.log("displaying newUser");
    let newUser = createElementFromTemplate("#newUserTemplate")
    addElement(newUser);
}

function displayLogin() {
    clearScreen();
    let login = createElementFromTemplate("#loginTemplate")
    addElement(login);
    console.log("displaying login");
}

// GENERELLE FUNKSJONER ========

function addElement(element) {
    document.getElementById("templateContainer").appendChild(element);
}

function clearScreen() {
    document.getElementById("templateContainer").innerHTML = "";
}

function createElementFromTemplate(templateID) {
    let template = document.querySelector(templateID);
    let clone = document.importNode(template.content, true);
    return clone;
}
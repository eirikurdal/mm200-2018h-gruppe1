// HTML-ELEMENTS ----------------

//--------------------------------------------------------
// Endpoints ---------------------------------------------
const ADD_NEW_USER_ENDPOINT = '/users/register'; //'/api/user';
const DELETE_USER_ENDPOINT = '/users/delete';
const LOGIN_ENDPOINT = '/users/login';

// ADD new user elements --------
const INPUT_NEW_USERNAME = "newUsername";
const INPUT_NEW_EMAIL = "newEmail";
const INPUT_NEW_PASSWORD = "newPassword";

// LOGIN elements ----------------------
const INPUT_LOGIN_EMAIL = "loginEmail";
const INPUT_LOGIN_PASSWORD = "loginPassword";

// ===============================================
// FUNCTIONS =====================================

// Add new user ==================================
function addNewUser(evt) {
    evt.preventDefault();
    console.log("addNewUser");

    let username = document.getElementById(INPUT_NEW_USERNAME).value;
    let email = document.getElementById(INPUT_NEW_EMAIL).value;
    let password = document.getElementById(INPUT_NEW_PASSWORD).value;

    let user = {
        username: username,
        email: email,
        password: password
    };

    sendAndRecieveUsernameDB(user).then(response => {
        if (response.status !== 200) {
            window.alert(response.msg);
            displayLogin();
        }
    });
}


function sendAndRecieveUsernameDB(user) {
    console.log("sendAndRecieveUsernameDB");
    return fetch(ADD_NEW_USER_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
        },
        body: JSON.stringify(user)
    }).then(data => {
        return data.json();
    });
}

// Log in ==================================
function login(evt) {
    evt.preventDefault();
    let email = document.getElementById(INPUT_LOGIN_EMAIL).value;
    let password = document.getElementById(INPUT_LOGIN_PASSWORD).value;

    let user = {
        email: email,
        password: password
    };

    sendAndRecieveLoginInfo(user).then(user => {
        localStorage.setItem("token", user.token);
        localStorage.setItem("id", user.id);
        greetUser(user.msg);
        window.location = "viewLists.html";
    }).catch(err => {
        errorLoggingIn();
    });
}

function sendAndRecieveLoginInfo(user) {
    return fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(data => {
        if (data.status === 200) {
            console.log("Status: " + data.status);
            return data.json();
        } else {
            console.log("Status: " + data.status);
            return Promise.reject(new Error('fail'));
        }
    });
}

function greetUser(message) {
    window.alert(message);
}

function errorLoggingIn() {
    window.alert("Brukernavn eller passord er galt. Logg inn på nytt");
}

// Log out ======================================

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    location.reload();
}

// Delete user ==================================

function deleteUser() {

    let confirmed = confirm("Er du sikker på at du vil slette brukeren din?");
    if (confirmed !== true) {
        toggleMenu();
        return;
    }

    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");

    sendAndRecieveDeleteInfo(userId, token).then(response => {
        window.alert(response.msg);
        localStorage.removeItem("id");
        localStorage.removeItem("token");
        window.location = "index.html";

    }).catch(error => {
        window.alert(error);
    });
}

function sendAndRecieveDeleteInfo(userId, token) {
    return fetch(DELETE_USER_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'userId': userId
        }
    }).then(data => {

        if (data.status === 200) {
            return data.json();
        } else if (data.status === 400) {
            return Promise.reject(new Error(data.status + ', Noe gikk galt!'));
        } else if (data.status === 404) {
            return Promise.reject(new Error(data.status + ', Brukeren du vil slette eksisterer ikke.'));
        } else {
            return Promise.reject(new Error(data.status + ', fail'));
        }
    });
}

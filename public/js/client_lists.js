// Endpoints =================================
const ADD_NEW_LIST_ENDPOINT = '/lists/add';
const ADD_NEW_LISTELEMENT_ENDPOINT = '/lists/update';
const GET_SINGLE_LIST_ENDPOINT = '/lists/get';
const GET_ALL_LISTS_ENDPOINT = '/lists/getall';
const DELETE_LIST_ENDPOINT = '/lists/delete';

// ADD new list elements --------
const INPUT_LIST_TITLE = "listTitle";

// OUTPUT elements ----------------------
const OUTPUT_LIST_CONTAINER = "listContainer";


// ===========================================
// FUNCTIONS =================================
// ===========================================


// Add new list ----------------
function createList() {
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");

    let listTitle = prompt("NY LISTE - fyll inn tittel:");
    if (!listTitle) {
        return;
    }

    let list = {
        listTitle: listTitle
    };

    sendListToDB(userId, token, list).then(response => {
        if (response.status !== 200) {
            showLists();
        }
    });

}

function sendListToDB(userId, token, list) {

    return fetch(ADD_NEW_LIST_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId
        },
        body: JSON.stringify(list)
    }).then(data => {
        return data.json();
    });
}

// Add list element --------------------

async function addListElement(evt) {
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.id;
    console.log(listId);

    let listElement = prompt("Legg til nytt punkt i listen");
    if (!listElement) {
        return;
    }

    let currentList = await getSingleListFromDB(userId, token, listId);
    let listElements = currentList[0].content.listElements;
    listElements.push(listElement);
    console.log(listElements);

    updateListInDB(userId, token, listId, listElements).then(response => {
        if (response.status !== 200) {
            showLists();
        }
    });
}

function updateListInDB(userId, token, listId, listElements) {

    return fetch(ADD_NEW_LISTELEMENT_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId,
            'ListId': listId
        },
        body: JSON.stringify(listElements)
    }).then(data => {
        return data.json();
    });
}

// Show all lists ----------------------------
function showLists() {

    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");

    getAllListsFromDB(userId, token).then(response => {
        if (response.status !== 200) {
            let lists = response.lists;
            //lists.reverse();
            console.log(lists);

            let listContainer = document.getElementById("listContainer");
            listContainer.innerHTML = "";

            for (let i = 0; i < lists.length; i++) {
                let listContent = lists[i].content;
                let listId = lists[i].id;
                let html = "";
                html += `<div id="${listId}" class="list-card">`;
                html += `<h3>${lists[i].title}</h3>`;
                html += `<div class="list-config-container" onclick="deleteList(event)">
                                <i class="fas fa-cog list-config-icon"></i>
                                </div>`;
                if (listContent) {
                    let listElements = listContent.listElements;
                    html += `<ul>`;
                    for (let j = 0; j < listElements.length; j++) {
                        html += `<li>${listElements[j]}</li>`;
                        html += `<div class="listelement-config-container" onclick="deleteElement(event)">
                                <i class="fas fa-ellipsis-h listelement-config-icon"></i>
                                </div>`;
                    }
                    html += `</ul>`;
                }
                html += `<div class="new-list-element" onclick="addListElement(event)">`;
                html += `<i class="fas fa-plus new-list-element-icon"></i>`;
                html += `</div>`;
                html += `</div>`;

                listContainer.innerHTML += html;

            }
        }
    });
}

// Delete list -------------------------------
function deleteList(evt) {
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.id;

    deleteListInDB(userId, token, listId).then(response => {
        window.alert(response.msg);
        showLists();
    }).catch(error => {
        window.alert(error);
    });
}

function deleteListInDB(userId, token, listId) {
    return fetch(DELETE_LIST_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'userId': userId,
            'listId': listId
        }
    }).then(data => {

        if (data.status === 200) {
            return data.json();
        } else if (data.status === 400) {
            return Promise.reject(new Error(data.status + ', Noe gikk galt!'));
        } else if (data.status === 404) {
            return Promise.reject(new Error(data.status + ', Listen du vil slette eksisterer ikke.'));
        } else {
            return Promise.reject(new Error(data.status + ', error'));
        }
    });
}


// Utilities ---------------------------------

function getAllListsFromDB(userId, token) {

    return fetch(GET_ALL_LISTS_ENDPOINT, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId
        },
    }).then(data => {
        return data.json();
    });
}

function getSingleListFromDB(userId, token, listId) {

    return fetch(GET_SINGLE_LIST_ENDPOINT, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId,
            'listId': listId
        },
    }).then(data => {
        return data.json();
    });
}

// ===========================================
// INIT ======================================
// ===========================================

(function () { // Start point for our litle demo.
    let token = localStorage.getItem("token");
    let userId = localStorage.getItem("id");
    if (token && userId) {
        ///TODO: Autorisering på server
        showLists();

    } else {
        window.location = "index.html";
    }
})()

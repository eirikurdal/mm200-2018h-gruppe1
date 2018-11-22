// Endpoints =================================
const ADD_NEW_LIST_ENDPOINT = '/lists/add';
const ADD_NEW_LISTELEMENT_ENDPOINT = '/lists/update/list';
const UPDATE_LISTELEMENT_ENDPOINT = '/lists/update/element';
const UPDATE_LISTTITLE_ENDPOINT = '/lists/update/listtitle';
const GET_SINGLE_LIST_ENDPOINT = '/lists/get';
const GET_ALL_LISTS_ENDPOINT = '/lists/getall';
const DELETE_LIST_ENDPOINT = '/lists/delete';
const DELETE_LISTELEMENT_ENDPOINT = '/lists/delete/element';
const TOGGLE_LIST_PUBLIC_ENDPOINT = '/lists/togglepublic';
const TOGGLE_LIST_CONTRIBUTOR_ENDPOINT = '/lists/togglecontributor';

// ADD new list elements --------
const INPUT_LIST_TITLE = "listTitle";

// OUTPUT elements ----------------------
const OUTPUT_LIST_CONTAINER = "listContainer";

// VARIABLES -----------------------------
let activeFilter = "all";


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

    let listElementTitle = prompt("Legg til nytt punkt i listen");
    if (!listElementTitle) {
        return;
    }

    let currentList = await getSingleListFromDB(userId, token, listId);
    let listElements = currentList[0].content.listElements;
    let newId = (currentList[0].idcount);
    let newIdCount = (newId + 1);
    let newListElement = {
        title: listElementTitle,
        duedate: "",
        tag: "all",
        id: newId
    };
    listElements.push(newListElement);
    console.log(listElements);

    updateListInDB(userId, token, listId, listElements, newIdCount).then(response => {
        if (response.status !== 200) {
            showLists(activeFilter);
        }
    });
}

function updateListInDB(userId, token, listId, listElements, newIdCount) {

    return fetch(ADD_NEW_LISTELEMENT_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId,
            'ListId': listId,
            'NewIdCount': newIdCount
        },
        body: JSON.stringify(listElements)
    }).then(data => {
        return data.json();
    });
}


// Update list title ----------------------
async function updateListTitle(evt) {
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.parentNode.parentNode.id;
    let currentList = await getSingleListFromDB(userId, token, listId);
    console.log(currentList);

    let oldTitle = currentList[0].title;
    let newTitle = prompt("Endre listetittel", oldTitle);

    console.log(newTitle);

    updateListtitleInDB(userId, token, listId, newTitle).then(response => {
        if (response.status !== 200) {
            showLists(activeFilter);
        }
    });
}

function updateListtitleInDB(userId, token, listId, newTitle) {

    return fetch(UPDATE_LISTTITLE_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId,
            'ListId': listId,
            'NewTitle': newTitle
        }
    }).then(data => {
        return data.json();
    });
}


// Update list element --------------------
async function updateListElement(evt) {
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    let listElementId = evt.currentTarget.parentNode.parentNode.parentNode.id;
    let currentList = await getSingleListFromDB(userId, token, listId);
    let idCount = currentList[0].idcount;

    let listElements = currentList[0].content.listElements;

    let index = listElements.findIndex(function (element) {
        return element.id == listElementId;
    });

    let oldText = currentList[0].content.listElements[index].title;
    let newText = prompt("Endre listeelementet", oldText);

    listElements[index].title = newText;
    console.log(listElements);

    updateListelementsInDB(userId, token, listId, listElements, idCount).then(response => {
        if (response.status !== 200) {
            showLists(activeFilter);
        }
    });
}

function updateListelementsInDB(userId, token, listId, listElements, idCount) {

    return fetch(ADD_NEW_LISTELEMENT_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId,
            'ListId': listId,
            'NewIdCount': idCount
        },
        body: JSON.stringify(listElements)
    }).then(data => {
        return data.json();
    });
}


// Update due date --------------------
async function updateDueDate(evt) {
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    let listElementId = evt.currentTarget.parentNode.parentNode.parentNode.id;

    let currentList = await getSingleListFromDB(userId, token, listId);
    let idCount = currentList[0].idcount;

    let listElements = currentList[0].content.listElements;

    let index = listElements.findIndex(function (element) {
        return element.id == listElementId;
    });

    let todayString = function () {
        let today = new Date();
        let month = ((today.getMonth()) + 1);
        let day = today.getDate();
        let year = today.getFullYear();

        return (month + "/" + day + "/" + year);
    }

    let newDate = prompt("Endre forfallsdato (MM/DD/ÅÅÅÅ)", todayString());
    if (!newDate) {
        return;
    }

    listElements[index].duedate = newDate;
    console.log(listElements);

    updateListelementsInDB(userId, token, listId, listElements, idCount).then(response => {
        if (response.status !== 200) {
            showLists(activeFilter);
        }
    });
}

function updateListelementsInDB(userId, token, listId, listElements, idCount) {

    return fetch(ADD_NEW_LISTELEMENT_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId,
            'ListId': listId,
            'NewIdCount': idCount
        },
        body: JSON.stringify(listElements)
    }).then(data => {
        return data.json();
    });
}


// Toggle list element tag --------------------
async function toggleListElementTag(evt, newTag) {
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    let listElementId = evt.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    let currentList = await getSingleListFromDB(userId, token, listId);
    let idCount = currentList[0].idcount;

    let listElements = currentList[0].content.listElements;

    let index = listElements.findIndex(function (element) {
        return element.id == listElementId;
    });

    if (newTag == "none") {
        newTag = "all";
    }

    listElements[index].tag = newTag;
    console.log(listElements);

    updateListelementsInDB(userId, token, listId, listElements, idCount).then(response => {
        if (response.status !== 200) {
            showLists(activeFilter);
        }
    });
}

function updateListelementsInDB(userId, token, listId, listElements, idCount) {

    return fetch(ADD_NEW_LISTELEMENT_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'UserId': userId,
            'ListId': listId,
            'NewIdCount': idCount
        },
        body: JSON.stringify(listElements)
    }).then(data => {
        return data.json();
    });
}


// Delete list -------------------------------
function deleteList(evt) {
    let confirmed = confirm("Er du sikker på at du vil slette listen?");
    if (confirmed !== true) {
        return;
    }

    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.parentNode.parentNode.id;

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


// Delete listelement ------------------------
async function deleteListElement(evt) {
    let confirmed = confirm("Er du sikker på at du vil slette dette listeelementet?");
    if (confirmed !== true) {
        return;
    }

    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    let listElementId = evt.currentTarget.parentNode.parentNode.parentNode.id;
    console.log("listid= " + listId + ", listelement = " + listElementId);


    deleteListElementInDB(userId, token, listId, listElementId).then(response => {
        console.log(response.msg);
        showLists();
    }).catch(error => {
        window.alert(error);
    });

}

function deleteListElementInDB(userId, token, listId, listElementId) {
    return fetch(DELETE_LISTELEMENT_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'userId': userId,
            'listId': listId,
            'listElementId': listElementId
        }
    }).then(data => {
        if (data.status === 200) {
            return data.json();
        } else if (data.status === 400) {
            return Promise.reject(new Error(data.status + ', Noe gikk galt!'));
        } else if (data.status === 404) {
            return Promise.reject(new Error(data.status + ', Listeelementet du vil slette eksisterer ikke.'));
        } else {
            return Promise.reject(new Error(data.status + ', error'));
        }
    });
}


// Toggle list public -------------------------------
function togglePublic(evt) {
    let confirmed = confirm("Er du sikker på at du vil endre listens delingsinnstillinger?");
    if (confirmed !== true) {
        return;
    }

    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.parentNode.parentNode.id;

    toggleListPublicInDB(userId, token, listId).then(response => {
        window.alert(response.msg);
        showLists();
    }).catch(error => {
        window.alert(error);
    });
}

function toggleListPublicInDB(userId, token, listId) {
    return fetch(TOGGLE_LIST_PUBLIC_ENDPOINT, {
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
            return Promise.reject(new Error(data.status + ', Listen du vil offentliggjøre eksisterer ikke.'));
        } else {
            return Promise.reject(new Error(data.status + ', error'));
        }
    });
}

// Toggle contributor -------------------------------
function toggleContributor(evt) {
    let email = prompt("Skriv inn E-MAIL til brukeren du vil dele listen med.", "name@mail.com");
    if (!email || email == "name@mail.com") {
        return;
    }
    
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");
    let listId = evt.currentTarget.parentNode.parentNode.parentNode.id;

    toggleContributorInDB(userId, token, listId, email).then(response => {
        window.alert(response.msg);
        showLists();
    }).catch(error => {
        window.alert(error);
    });
}

function toggleContributorInDB(userId, token, listId, email) {
    return fetch(TOGGLE_LIST_CONTRIBUTOR_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Auth': token,
            'userId': userId,
            'listId': listId,
            'email': email
        }
    }).then(data => {

        if (data.status === 200) {
            return data.json();
        } else if (data.status === 400) {
            return Promise.reject(new Error(data.status + ', Noe gikk galt!'));
        } else if (data.status === 404) {
            return Promise.reject(new Error(data.status + ', Listen du vil endre delingsinnstillinger for eksisterer ikke.'));
        } else {
            return Promise.reject(new Error(data.status + ', error'));
        }
    });
}


// Utilities ---------------------------------
function showLists(newFilter) {
    let userId = localStorage.getItem("id");
    let token = localStorage.getItem("token");

    getAllListsFromDB(userId, token).then(response => {
        if (response.status !== 200) {
            let lists = response.lists;
            let listContainer = document.getElementById("listContainer");
            listContainer.innerHTML = "";
            
            // Rapportere antall lister i meny
            let userGreeting = document.querySelector(".user-greeting");
            let username = localStorage.getItem("username");
            let numberOfLists = lists.length;
            userGreeting.innerHTML = `Hei ${username}!<br>Du har totalt ${numberOfLists} lister.`;
            

            for (let i = 0; i < lists.length; i++) {
                let listContent = lists[i].content;
                let listElements = listContent.listElements;
                let sortedListElements = filterListElements(listElements, newFilter);
                let listId = lists[i].id;
                let html = "";

                // Sjekke om listen har innhold med aktivt filter
                let listContainsElements = function (newFilter) {
                    if (activeFilter == "all"){
                        return true;
                    } else if (activeFilter == "duetoday"){
                        return true;
                    }
                    for (let k = 0; k < listElements.length; k++) {
                        if (listElements[k].tag == newFilter) {
                            return true;
                        }
                    }
                    return false;
                }
                //------

                if (listContainsElements(newFilter) === true) {
                    html += `<div id="${listId}" class="list-card">
                            <h3>${lists[i].title}</h3>
                            <div class="list-config-container">
                            <i class="fas fa-cog list-config-icon" alt="listeinnstillinger"></i>
                            <div class="dropdown">
                                <div alt="endre listenavn" onclick="updateListTitle(event)">Endre</div>
                                <div alt="gjør offentlig" onclick="togglePublic(event)">Offentlig/Privat</div>
                                <div alt="endre delingsinnstillinger" onclick="toggleContributor(event)">Deling</div>
                                <div alt="slett liste" onclick="deleteList(event)">Slett</div>
                            </div>
                        </div>`;
                    if (listContent) {
                        html += `<ul>`;
                        for (let j = 0; j < sortedListElements.length; j++) {
                            let id = sortedListElements[j].id;

                            // Sjekke forfall
                            let duedateString = sortedListElements[j].duedate;
                            let duedate = new Date(duedateString);
                            let today = new Date();

                            let daysToDuedate = findDifferenceInDays(duedate, today);

                            let colorCodeClass;

                            if (daysToDuedate >= 7) {
                                colorCodeClass = "duedate-ok";
                            } else if (daysToDuedate < 0) {
                                colorCodeClass = "duedate-passed";
                            } else if (daysToDuedate == 0) {
                                colorCodeClass = "duedate-today";
                            } else {
                                colorCodeClass = "duedate-soon";
                            }

                            //-------

                            html += `<li id="${id}">${sortedListElements[j].title}
                                    <div class="listelement-config-container">
                                        <div class="duedate ${colorCodeClass}">${duedateString}</div>
                                        <i class="fas fa-ellipsis-h listelement-config-icon"></i>
                                        <div class="dropdown">
                                            <div alt="endre listeelement" onclick="updateListElement(event)">Endre</div>
                                            <div alt="endre forfallsdato" onclick="updateDueDate(event)">Forfallsdato</div>
                                            <div alt="legg til tagger på listeelement" class="dropdown-sub-container">Tagger
                                                <div class="dropdown-sub">
                                                    <div alt="ta bort tagger" onclick="toggleListElementTag(event,'none')">
                                                        <i class="far fa-circle filter-all"></i>
                                                        Ingen
                                                    </div>
                                                    <div alt="tag hjem" onclick="toggleListElementTag(event,'hjem')">
                                                        <i class="fas fa-circle filter-hjem"></i>
                                                        Hjem
                                                    </div>
                                                    <div alt="tag jobb" onclick="toggleListElementTag(event,'jobb')">
                                                        <i class="fas fa-circle filter-jobb"></i>
                                                        Jobb
                                                    </div>
                                                    <div alt="tag skole" onclick="toggleListElementTag(event,'skole')">
                                                        <i class="fas fa-circle filter-skole"></i>
                                                        Skole
                                                    </div>
                                                </div>
                                            </div>
                                            <div alt="slett listeelement" onclick="deleteListElement(event)">Slett</div>
                                        </div>
                                    </div>
                                </li>`;
                        }
                        html += `</ul>`;
                    }
                    html += `<div class="new-list-element" onclick="addListElement(event)">
                            <i class="fas fa-plus new-list-element-icon"></i>
                        </div>
                    </div>`;

                    listContainer.innerHTML += html;
                }
            }
        }
    });
}

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

function filterListElements(listElements, newFilter) {
    let sortedListElements = [];

    if (newFilter) {
        if (newFilter == "all") {
            activeFilter = newFilter;
            return listElements;
        }
        if (newFilter == "duetoday") {
            for (let i = 0; i < listElements.length; i++) {

                let duedateString = listElements[i].duedate;
                let duedate = new Date(duedateString);
                let today = new Date();
                let daysToDuedate = findDifferenceInDays(duedate, today);

                if (daysToDuedate == 0) {
                    sortedListElements.push(listElements[i]);
                }
            }
            return sortedListElements;
        }
        activeFilter = newFilter;
    } else {
        return listElements;
    }

    for (let i = 0; i < listElements.length; i++) {
        if (listElements[i].tag == activeFilter) {
            sortedListElements.push(listElements[i]);
        }
    }
    return sortedListElements;

}

function findDifferenceInDays(duedate, today) {
    return Math.floor((Date.UTC(duedate.getFullYear(),
                duedate.getMonth(),
                duedate.getDate()) -
            Date.UTC(today.getFullYear(),
                today.getMonth(),
                today.getDate())) /
        (1000 * 60 * 60 * 24));
}

// ===========================================
// INIT ======================================
// ===========================================

(function () { // Start point for our litle demo.
    let token = localStorage.getItem("token");
    let userId = localStorage.getItem("id");
    if (token && userId) {
        showLists();

    } else {
        window.location = "index.html";
    }
})()

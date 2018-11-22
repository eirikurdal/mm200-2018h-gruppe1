// Endpoints =================================
const GET_PUBLIC_LISTS_ENDPOINT = '/lists/getpublic';

// ADD new list elements --------
const INPUT_LIST_TITLE = "listTitle";

// OUTPUT elements ----------------------
const OUTPUT_LIST_CONTAINER = "listContainer";

// VARIABLES -----------------------------
let activeFilter = "all";


// ===========================================
// FUNCTIONS =================================
// ===========================================

// Utilities ---------------------------------
function showPublicLists(newFilter) {
    getPublicListsFromDB().then(response => {
        console.log(response);
        if (response.status !== 200) {
            let lists = response.lists;
            let listContainer = document.getElementById("listContainer");
            listContainer.innerHTML = "";

            // Rapportere antall lister i meny
            let userGreeting = document.querySelector(".user-greeting");
            let numberOfLists = lists.length;
            userGreeting.innerHTML = `Hei! Det er totalt ${numberOfLists} offentlige lister.`;

            for (let i = 0; i < lists.length; i++) {
                let listContent = lists[i].content;
                let listElements = listContent.listElements;
                let sortedListElements = filterListElements(listElements, newFilter);
                let listId = lists[i].id;
                let html = "";

                // Sjekke om listen har innhold med aktivt filter
                let listContainsElements = function (newFilter) {
                    if (activeFilter == "all") {
                        return true;
                    } else if (activeFilter == "duetoday") {
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
                            <h3>${lists[i].title}</h3>`;
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
                                    </div>
                                </li>`;
                        }
                        html += `</ul></div>`;
                    }
                    listContainer.innerHTML += html;
                }
            }
        }
    });
}

function getPublicListsFromDB() {

    return fetch(GET_PUBLIC_LISTS_ENDPOINT, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
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
    showPublicLists();
})()

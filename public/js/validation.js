const validation = {};

validation.isAllFieldsOK = function (name, mail, password) {

    let fieldStatus = false;
    console.log(name, mail, password);

    let regexName = /\S/;
    let regexMail = /\S/;
    let regexPassword = /\S/;

    let testName = regexName.test(name);
    let testMail = regexName.test(mail);
    let testPassword = regexName.test(password);

    if (testName === true && testMail === true && testPassword === true) {
        fieldStatus = true;
    } else {
        document.getElementById(INPUT_NAME_ELEMENT).classList.add("redBorder");
    }

    return fieldStatus;
}

// -----------------------------------

module.exports = validation;

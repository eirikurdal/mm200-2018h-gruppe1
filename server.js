const express = require('express');
const bodyParser = require('body-parser');
const db = require('./js/dbconnect').db; //database
const bcrypt = require('bcryptjs');
const users = require("./js/users.js");
const lists = require("./js/lists.js");
const utilities = require("./js/utilities.js");

const app = express();
const port = (process.env.PORT || 8080);

app.set('port', port);
app.use(express.static('public'));
app.use(bodyParser.json());


app.use(function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next(); //go to the specified route
});

app.use('/users/', users);
app.use('/lists/', lists);


//------------------------------
// INIT ------------------------------
app.listen(app.get('port'), function () {
    console.log('server running', app.get('port'));
})

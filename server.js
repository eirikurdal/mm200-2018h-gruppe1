const express = require('express');
const bodyParser = require('body-parser');
const db = require('./js/dbconnect').db; //database
const bcrypt = require('bcryptjs');
const users = require("./js/users.js");

const app = express();
const port = (process.env.PORT || 8080);

app.set('port', port);
app.use(express.static('public'));
app.use(bodyParser.json());

app.use('/todolist/users/', users);

//------------------------------

// INIT ------------------------------
app.listen(app.get('port'), function () {
    console.log('server running', app.get('port'));
})

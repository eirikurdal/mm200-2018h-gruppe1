const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = (process.env.PORT || 8080);

app.set('port', port);
app.use(express.static('public'));
app.use(bodyParser.json());

//------------------------------

const users = [];

app.post('/api/user', function (req, res, next) {

    let userName = req.body.userName;

    let isUnique = !isNameInList(users, userName);

    if (isUnique && userName) {
        users.push(req.body);
        res.status(200).json(users).end();
    } else {
        res.status(400).json(users).end();
    }
});

function isNameInList(list, name) {
    let searchName = name.toString().toLowerCase();
    let result = false;
    for (let user in list) {
        if (list[user].userName.toLowerCase() === searchName) {
            result = true;
            break;
        }
    }
    return result;
}


/*
user.id = users.length +1;
    users.push(user);
    
    res.json(user).end();
*/

//----------------------------------

app.listen(app.get('port'), function () {
    console.log('server running', app.get('port'));
})

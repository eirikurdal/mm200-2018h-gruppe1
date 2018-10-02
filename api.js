/*

Create user:
METHOD: Post
ENDPOINT: api/user
BODY (json):
    {"userName":"Eirik Urdal",
    "userMail":"eirik@uia.no",
    "userPassword":"12345678"}
RESPONSE (json):
    {"id":"1",
    "userName":"Eirik Urdal",
    "userMail":"eirik@uia.no",
    "userPassword":"12345678"}

*/


/*

Log in:
METHOD: Post
ENDPOINT: api/login
BODY (json):
    {"userMail":"eirik@uia.no",
    "userPassword":"12345678"}
RESPONSE (json):
    {"userName":"Eirik Urdal",}

*/
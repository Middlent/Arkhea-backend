const express = require("express");
const session = require("express-session");
const connection = require("./connection")
const app = express();

const sess = {
    secret: 'the ultra secret 98767876',
    resave: false,
    saveUninitialized: true
};

app.use(session(sess))
app.use(express.json())

const PORT = process.env.PORT || 8080;

app.listen(PORT,
    console.log(`Server started on port ${PORT}`)
);
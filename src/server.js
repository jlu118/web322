const express = require("express");
const hbs = require("hbs").__express;
const path = require("path");
const router = require("./router");

const app = express();

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views/"));
app.engine("hbs", hbs);

app.use(express.static(path.join(__dirname, "./public")));

app.use(express.urlencoded({ extends: false }));

app.use(router);

module.exports = app;

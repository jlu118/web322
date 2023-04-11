const express = require("express");
const hbs = require("hbs").__express;
const Handlebars = require("hbs");
const path = require("path");
const router = require("./router");

const app = express();

Handlebars.registerHelper("compare", function (v1, op, v2, options) {

    var c = {
        "eq": function (v1, v2) {
            return v1 == v2;
        },
        "neq": function (v1, v2) {
            return v1 != v2;
        }
    }

    if (Object.prototype.hasOwnProperty.call(c, op)) {
        return c[op].call(this, v1, v2) ? options.fn(this) : options.inverse(this);
    }
    return options.inverse(this);
});

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views/"));
app.engine("hbs", hbs);

app.use(express.static(path.join(__dirname, "./public")));

app.use(express.urlencoded({ extends: false }));

app.use(router);

module.exports = app;

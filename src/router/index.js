const express = require("express");
const readline = require("linebyline");
const path = require("path");
const router = express.Router();
const { readFileSync, writeFileSync } = require('fs');
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const reader = () => {
  return new Promise((resolve, reject) => {
    const lines = [];
    const rl = readline(path.join(__dirname, "../public/txt/image.txt"));
    rl.on("line", function (line, lineCount, byteCount) {
      lines.push(line.trim());
    })
      .on("end", function () {
        resolve(lines);
      })
      .on("error", function (e) {
        reject(e);
      });
  });
};

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie('sessionGallery');
    return res.render("login", { form: {}, lblMessage: '' });
  } catch (err) {
    console.error(err);
    res.render("error");
  }
});

router.post("/gallery", async (req, res) => {
  const cookies = req.cookies || {};
  let form = cookies['sessionGallery'];
  try {
    const data = await reader();
    if (!cookies['sessionGallery']) {
      debugger
      return res.render("login", { form: {}, lblMessage: '' });
    } else {
      return res.render("index", {
        data,
        photo: req.body.image ? `/image/${req.body.image}.jpg` : "/image/demo.jpg",
        form
      });
    }

  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});

router.get("/", async (req, res) => {
  const cookies = req.cookies || {};
  let form = cookies['sessionGallery'];
  try {
    if (cookies['sessionGallery']) {
      const data = await reader();
      return res.render("index", { data, photo: "/image/demo.jpg", form });
    } else {
      return res.render("login", { form: {}, lblMessage: '' });
    }
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});
const checkLoginForm = (form) => {
  let lblMessage = 'Not a registered username';

  const user = JSON.parse(readFileSync(path.join(__dirname, './user.json')));
  Object.keys(user).forEach(key => {
    if (key == form.txtUserName) {
      if (user[key] = form.txtPassword) {
        lblMessage = "Success";
      } else {
        lblMessage = "Invalid password";
      }
    }
  })

  return lblMessage;
}
router.post("/", async (req, res) => {
  const cookies = req.cookies || {};
  let form = req.body || cookies['sessionGallery'];
  try {
    const lblMessage = checkLoginForm(form);
    if (lblMessage == "Success") {
      res.cookie('sessionGallery', form);
      const data = await reader();
      return res.render("index", { data, photo: "/image/demo.jpg", form });
    } else {

      return res.render("login", {
        form,
        lblMessage,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});

router.get("/register", async (req, res) => {
  try {
    return res.render("register", { form: {}, lblMessage: '' });
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});

const checkRegisterForm = (form) => {
  let lblMessage = '';
  const user = JSON.parse(readFileSync(path.join(__dirname, './user.json')));
  if (!form.txtUserName || !form.txtPassword || !form.txtConfirmPassword) {
    lblMessage = 'Please enter username, password and confirm password'
    return lblMessage;
  }

  Object.keys(user).forEach(key => {
    if (key == form.txtUserName) {
      lblMessage = 'Username is registered';
    }
  })
  if (lblMessage) {
    return lblMessage;
  }

  if (form.txtPassword != form.txtConfirmPassword) {
    lblMessage = 'Invalid password for confirm password'
    return lblMessage;
  }

  user[form.txtUserName] = form.txtPassword;
  try {
    writeFileSync(path.join(__dirname, './user.json'), JSON.stringify(user), 'utf8');
    console.log(`${form.txtUserName} register success!`);

    return 'Success';
  } catch (error) {
    console.log(`${form.txtUserName} register error!`, error);

    return error;
  }

}
router.post("/register", async (req, res) => {
  try {
    const form = req.body;
    const lblMessage = checkRegisterForm(form);
    if (lblMessage == "Success") {

      return res.render("login", {
        form,
        lblMessage: `${form.txtUserName} register success!`,
      });
    } else {
      return res.render("register", {
        form,
        lblMessage,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});

module.exports = router;

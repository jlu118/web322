const express = require("express");
const readline = require("linebyline");
const path = require("path");
const router = express.Router();
const { readFileSync, writeFileSync } = require('fs');
const cookieParser = require('cookie-parser');
router.use(cookieParser());


const fs = require('fs')
  , mongoose = require('mongoose')
  , mongoUri = "mongodb+srv://cluster0.mvk4aqq.mongodb.net/gallery?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority"
  , mongoOpt = {
    "tls": true,
    "tlsCertificateKeyFile": path.join(__dirname, './X509-cert-3603432176044776251.pem'),

  }
  ;
// 数据库表
const model = async () => {

  await mongoose.connect(mongoUri, mongoOpt);

  //3.操作数据库集合Users    定义一个Schema  里面的的对象和数据库表里边的字段需要一一对应
  const Web322Schema = mongoose.Schema({
    _id: String,
    filename: String,
    description: String,
    price: Number,
    status: String,
  })

  //4.定义数据库模型  
  //第一个参数 1:首字母大写 2.和数据库里面的表名字对应起来    第二个参数就是UserSchema  第三个参数进行指定
  //这个模型会和数据相同名称复数的表相连接
  return await mongoose.model('web322', Web322Schema);


};

// const Web322 = async (model) => {
//   return await model.find();
// }
let models ;
model().then(mode=>{
  models=mode;
})

// 提取数据
const reader =async () => {
  // return new Promise((resolve, reject) => {
  //   const lines = [];
  //   const rl = readline(path.join(__dirname, "../public/txt/image.txt"));
  //   rl.on("line", function (line, lineCount, byteCount) {
  //     lines.push(line.trim());
  //   })
  //     .on("end", function () {
  //       resolve(lines);
  //     })
  //     .on("error", function (e) {
  //       reject(e);
  //     });
  // });
  const data =await models.find();
  const filter = data.filter(item=>item.status=='A');
  return await filter.map(item=>item.filename.split('.')[0]);
};
// 退出登陆接口
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie('sessionGallery');
    return res.render("login", { form: {}, lblMessage: '' });
  } catch (err) {
    console.error(err);
    res.render("error");
  }
});
// 相册变换接口
router.post("/gallery", async (req, res) => {
  const cookies = req.cookies || {};
  let form = cookies['sessionGallery'];
  try {
    const data = await reader();
    if (!cookies['sessionGallery']) {
      return res.render("login", { form: {}, lblMessage: '' });
    } else {
      return res.render("index", {
        data,
        photo: req.body.image ? `/image/${req.body.image}.jpg` : `/image/${data[0]}.jpg`,
        photo_name: req.body.image ? req.body.image : data[0],
        form
      });
    }

  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});

// 相册查询接口
router.post("/photo", async (req, res) => {
  const cookies = req.cookies || {};
  let form = cookies['sessionGallery'];
  try {
    const data = await reader();
    if (!cookies['sessionGallery']) {
      return res.render("login", { form: {}, lblMessage: '' });
    } else {
      // const models = await model();
      const search =await models.findOne({filename:req.body.image+'.jpg'});
      console.log(req.body,search);
      if(search == null || Object.toString(search) == '{}'){
        return res.render("index", {
          data,
          photo: req.body.image ? `/image/${req.body.image}.jpg` : `/image/${data[0]}.jpg`,
          photo_name: req.body.image ? req.body.image : data[0],
          form
        });
        
      }else{
        return res.render("index", {
          data,
          photo: req.body.image ? `/image/${req.body.image}.jpg` : `/image/${data[0]}.jpg`,
          photo_name: req.body.image ? req.body.image : data[0],
          photo_class:'photoactive',
          photo_detail:search,
          form
        });
      }

    }

  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});
// 相册购买接口
router.post("/photobuy", async (req, res) => {
  const cookies = req.cookies || {};
  let form = cookies['sessionGallery'];
  try {
    const data = await reader();
    if (!cookies['sessionGallery']) {
      return res.render("login", { form: {}, lblMessage: '' });
    } else {

      // const models = await model();
      const update =await models.findOneAndUpdate({filename:req.body.image+'.jpg'},{status:'S'});
      console.log(req.body,update);


      return res.render("index", {
        data,
        photo: req.body.image ? `/image/${req.body.image}.jpg` : `/image/${data[0]}.jpg`,
        photo_name: req.body.image ? req.body.image : data[0],
        photo_class:'photoactive',
        photo_buy:true,
        form
      });
    }

  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});
// 主页
router.get("/", async (req, res) => {
  const cookies = req.cookies || {};
  let form = cookies['sessionGallery'];
  try {
    if (cookies['sessionGallery']) {
      const data = await reader();
      return res.render("index", { data, photo: `/image/${data[0]}.jpg`,photo_name:data[0], form });
    } else {
      return res.render("login", { form: {}, lblMessage: '' });
    }
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});
// 校验登陆
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
// 主页提交或登录接口
router.post("/", async (req, res) => {
  const cookies = req.cookies || {};
  let form = req.body || cookies['sessionGallery'];
  try {
    const lblMessage = checkLoginForm(form);
    if (lblMessage == "Success") {
      res.cookie('sessionGallery', form);
      const data = await reader();
      return res.render("index", { data, photo: `/image/${data[0]}.jpg`,photo_name:data[0], form });
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
// 注册页
router.get("/register", async (req, res) => {
  try {
    return res.render("register", { form: {}, lblMessage: '' });
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});
// 注册验证
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
// 注册接口
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

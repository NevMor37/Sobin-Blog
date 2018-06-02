const sha1 = require('sha1');
const express = require('express');
const router = express.Router();

const checkNotLogin = require('../middlewares/check').checkNotLogin;
const UserModel = require('../models/users')

router.get('/', checkNotLogin, function(req, res, next){
  res.render('signin');
});

router.post('/', checkNotLogin, function(req, res, next){
  //res.send('Login in ing!');
  const name = req.fields.name;
  const password = req.fields.password;

  try{
    if(!name.length){
      throw new Error('Please fill out your user name! ');
    }
    if(!password.length){
      throw new Error('Please fill out your password! ');
    }
  }catch(e){
    req.flash('error', e.message);
    return res.redirect('back');
  }

  UserModel.getUserByName(name)
  .then(function(user){
    console.log("***********************************"+"</br>"+JSON.stringify(user));
    if(!user){
      req.flash('error', 'User not exists! ');
      return res.redirect('back');
    }
    if(sha1(password) !== user.password){
      req.flash('error', 'Invalid User name or password! ');
      return res.redirect('back');
    }
    req.flash('success', 'Login Successfully! ');
    delete user.password;
    req.session.user = user;
    res.redirect('/posts');
  })
  .catch(next);
});

module.exports = router;

// 这里我们在 POST /signin 的路由处理函数中，
// 通过传上来的 name 去数据库中找到对应用户，
// 校验传上来的密码是否跟数据库中的一致。
// 不一致则返回上一页（即登录页）并显示『用户名或密码错误』的通知，
// 一致则将用户信息写入 session，
// 跳转到主页并显示『登录成功』的通知。

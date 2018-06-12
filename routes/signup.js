const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');
const express = require('express');
const router = express.Router();

const checkNotLogin = require('../middlewares/check').checkNotLogin;
const UserModel = require('../models/users');

router.get('/', checkNotLogin,function(req, res, next){
  res.render('signup');
  //res.send('signup page');
});

router.post('/', checkNotLogin, function(req, res, next){
  //res.send('signup ing!');
  const name = req.fields.name;
  const gender = req.fields.gender;
  const bio = req.fields.bio;
  const avatar = req.files.avatar.path.split(path.sep).pop();
  let password = req.fields.password;
  const repassword = req.fields.repassword;

  try{
    if (!(name.length >= 1 && name.length <= 20)) {
      throw new Error('Please restric user name to 1-20 characters')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('You can only set gender to male, female or unknown =.=')
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('Bio length from 1 to 30 characters')
    }
    if (!req.files.avatar.name) {
      throw new Error('I need an icon of you!')
    }
    if (password.length < 6) {
      throw new Error('Password is going to be more than 6 characters long~')
    }
    if (password !== repassword) {
      throw new Error('Not consistant for password two-time input~')
    }
  }catch(e){
    fs.unlink(req.files.avatar.path);
    req.flash('error', e.message);
    return res.redirect('/signup');
  }
  password = sha1(password);

  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  }
  UserModel.create(user)
  .then(function(result){
    console.log("~~~~~~~~~~~"+result.ops);
    user = result.ops[0];
    delete user.password;
    req.session.user = user;
    req.flash('success', "Successfully signup! ");
    res.redirect('/posts');
  })
  .catch(function(e){
      fs.unlink(req.files.avatar.path);
      if (e.message.match('duplicate key')) {
        req.flash('error', 'User name already taken! ')
        return res.redirect('/signup');
      }
      next(e);
  });
});

module.exports = router;


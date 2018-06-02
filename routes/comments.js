const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/check').checkLogin;

router.post('/', checkLogin, function(req, res, next){
  res.send('leave comments');
});

router.get('/:commentId/remove', checkLogin, function(req, res, next){
  res.send('Delete comment');
});

module.exports = router;

const express = require('express');
const router = express.Router();

const PostModel = require('../models/posts');
const checkLogin = require('../middlewares/check').checkLogin;

router.get('/', function(req, res, next){
  const author = req.query.author;

  PostModel.getPosts(author)
    .then(function (posts) {
      res.render('posts', {
        posts: posts
      })
    })
    .catch(next);
});

router.post('/create', checkLogin, function(req, res, next){
    //res.send('post an articles');
    const author = req.session.user._id;
    const title = req.fields.title;
    const content = req.fields.content;
    //console.log("lfhafhsfhlfha;fsah;hf;fhao;blabf;b;fbbf;b" + title);
    //console.log(content);
    try {
      if(!title.length){
         throw Error('Please fill out the title! ');
      }
      if(!content.length){
        throw Error('Please fill out the title! ');
      }
    }catch(e){
      req.flash('error', 'e.message');
      res.redirect('back');
    }
    let post = {
      author : author,
      title : title,
      content : content
    };
    PostModel.create(post)
    .then(function(result){
       console.log("创建文章后如果成功返回的文章信息： "+JSON.stringify(result.ops));
       post = result.ops[0];
       req.flash('success','Post article successfully');

       res.redirect(`/posts/${post._id}`);
    })
    .catch(next);
});

router.get('/create', checkLogin, function(req, res, next){
  res.render('create');
  //res.send('post article page');
});

router.get('/:postId', function(req, res, next){
  //res.send('a single article detail page');
  const postId = req.params.postId;

  Promise.all([
    PostModel.getPostById(postId), // 获取文章信息
    PostModel.incPv(postId)// pv 加 1
    ])
  .then(function(result){
    console.log("根据文章Id查找文章后返回的具体某一篇文章的信息： "+JSON.stringify(result));
    const post = result[0];
    if(!post){
      throw new Error("The article doesn't exists ! ");
    }
    res.render('post', {post:post});
  })
  .catch(next);
});

router.get('/:postId/edit', checkLogin, function(req, res, next){
  res.send('update an article page');
});

router.post('/:postId/edit', checkLogin, function(req, res, next){
  res.send('update an article');
});

router.get('/:postId/remove', checkLogin, function(req, res, next){
  res.send('delete an article');
});

module.exports = router;


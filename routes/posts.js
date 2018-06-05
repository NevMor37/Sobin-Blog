const express = require('express');
const router = express.Router();

const PostModel = require('../models/posts');
const CommentModel = require('../models/comments');
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

router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId

  Promise.all([
    PostModel.getPostById(postId), // 获取文章信息
    CommentModel.getComments(postId), // 获取该文章所有留言
    PostModel.incPv(postId)// pv 加 1
  ])
    .then(function (result) {
      const post = result[0]
      const comments = result[1]
      if (!post) {
        throw new Error('该文章不存在')
      }

      res.render('post', {
        post: post,
        comments: comments
      })
    })
    .catch(next)
})

router.get('/:postId/edit', checkLogin, function(req, res, next){
  //res.send('update an article page');
  const postId = req.params.postId;
  const author = req.session.user._id;
  PostModel.getRawPostById(postId)
            .then(function(post){
              if(!post){
                throw new Error("The article doesn't exist! ");
              }
              if(author.toString() !== post.author._id.toString()){
                throw new Error("You don't have correct permision! ");
              }
              res.render('edit', {
                post:post
              });
            })
            .catch(next);
});

router.post('/:postId/edit', checkLogin, function(req, res, next){
  //res.send('update an article');
  const postId = req.params.postId;
  const author = req.session.user._id;
  const title = req.fields.title;
  const content = req.fields.content;
  try{
    if(!title.length){
      throw new Error("Please fill out the title. ");
    }
    if(!content.length){
      throw new Error("Please fill out the content. ");
    }
  }catch(e){
    req.flash('error', e.message);
    return res.redirect('back');
  }
  PostModel.getRawPostById(postId)
            .then(function(post){
              if(!post){
                throw Error("The article doesn't exist! ");
              }
              if(post.author._id.toString() !== author.toString()){
                throw new error('You are not authenticated to edit this article! ');
              }
            });
  PostModel.updatePostById(postId, {title: title, content: content })
          .then(function(){
            req.flash('sucess', 'successfully update the article ' + title + '.');
            res.redirect(`/posts/${postId}`);
          })
          .catch(next);
});

router.get('/:postId/remove', checkLogin, function(req, res, next){
  const postId = req.params.postId;
  const author = req.session.user._id;
  PostModel.getRawPostById(postId)
          .then(function(post){
            if(!post){
                throw Error("The article doesn't exist! ");
              }
              if(post.author._id.toString() !== author.toString()){
                throw new error('You are not authenticated to delete this article! ');
              }
          });
  PostModel.delPostById(postId)
            .then(function(){
              req.flash('success', 'You have successsfully delete the article. ');
              res.redirect('/posts');
            })
            .catch(next);
});

module.exports = router;


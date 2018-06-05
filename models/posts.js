const Posts = require('../lib/mongo').Posts;
const marked = require('marked');
const CommentModel = require('./comments');

Posts.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne: function (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function (count) {
        post.commentsCount = count
        return post
      })
    }
    return post
  }
})




Posts.plugin('contentToHtml', {
  afterFind: function afterFind(posts){
    return posts.map(function(post){
      post.content = marked(post.content);
      return post;
    });
  },
  afterFindOne: function afterFindOne(post){
    if(post){
      post.content = marked(post.content);
    }
    return post;
  }
});

module.exports = {
  create: function create(post){
    return Posts.create(post).exec();
  },
  getPostById: function getPostById(postId){
    return Posts
          .findOne({ _id: postId })
          .populate({ path: 'author', model: 'User' })
          .addCreatedAt()
          .addCommentsCount()
          .contentToHtml()
          .exec();
  },
  getPosts: function getPosts (author) {
    const query = {}
    if (author) {
      query.author = author
    }
    return Posts
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },
   incPv: function incPv (postId) {
    return Posts
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  },

  // 通过文章 id 获取一篇原生文章（编辑文章）
  getRawPostById: function getRawPostById(postId){
    return Posts
          .findOne({_id: postId})
          .populate({path: 'author', model: 'User'})
          .exec();
  },

  //通过文章Id更新文章
  updatePostById: function updatePostById(postId, data){
      return Posts.update({_id: postId}, {$set: data}).exec();
  },

  //通过文章Id删除文章, 同时删除留言
  delPostById: function delPostById (postId, author){
    return Posts.deleteOne({author: author, _id: postId})
    .exec()
    .then(function(res){
      if(res.result.ok && res.result.n >0){
        return CommentModel.delCommentByPostId(postId);
      }
    });
  }
}



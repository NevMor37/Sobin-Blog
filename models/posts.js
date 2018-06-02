const Posts = require('../lib/mongo').Posts;
const marked = require('marked')

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
      .contentToHtml()
      .exec()
  },
   incPv: function incPv (postId) {
    return Posts
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  }
}



const config = require('config-lite')(__dirname);
const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');
const Mongolass = require('mongolass');
const mongolass = new Mongolass();
mongolass.connect(config.mongodb);

exports.User = mongolass.model('User', {
  name: {type:'string', required:true},
  password:{type:'string', required:true},
  avatar:{type:'string', required:true},
  gender:{type:'string', required:true},
  bio:{type:'string', required:true}
});

exports.Posts = mongolass.model('Post', {
  author: {type: Mongolass.Types.ObjectId, required:true},
  title: {type:'string', required:true},
  content: {type: 'string', required:true},
  pv:{type:'number', default: 0}
});

exports.Comment = mongolass.model('Comment', {
  author: {type: Mongolass.Types.ObjectId, required: true},
  content: { type: 'string', required: true },
  postId: { type: Mongolass.Types.ObjectId, required: true }
});

//全局plugin
mongolass.plugin('addCreatedAt', {
  afterFind: function afterFind(result){
    result.forEach(function(item){
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
    })
    return result;
  },
  afterFindOne: function afterFindOne(result){
    if(result){
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
    }
    return result;
  }
});

// 根据用户名找到用户，用户名全局唯一
exports.User.index({name:1}, {unique:true}).exec();
exports.Comment.index({ postId: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序

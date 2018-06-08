module.exports = {
  port: 3000,
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: 2592000000
  },
  //mongodb: 'mongodb://localhost:27017/myblog'
  mongodb:'mongodb://myblog:myblog1@ds016058.mlab.com:16058/myblog'
}
//myblog 为db名

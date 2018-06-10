module.exports = {
  port: 3000,
  //port: 80,
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: 2592000000
  },
  mongodb: process.env.MONGODB_URI
  //mongodb: 'mongodb://localhost:27017/myblog'
  //mongodb:'mongodb://myblog:myblog1@ds016058.mlab.com:16058/myblog'
  //mongodb : 'mongodb://babesnotebook:UKhgSCbrzt1yiEazNBnIozih976AURS6074y7t0rBpQ7xzgEmr8zLvFAR9kioMlOppemzu8JC0507Q4KcCdjew==.documents.azure.com:10250/mean?ssl=true&sslverifycertificate=false'
}
//myblog 为db名

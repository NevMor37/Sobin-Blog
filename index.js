const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const routes = require('./routes');
const pkg = require('./package');
const winston = require('winston');
const expressWinston = require('express-winston');


const app = express();

//设置模版目录
app.set('views', path.join(__dirname, 'views'));
//设置模版引擎
app.set('view engine', 'ejs');

//设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

//配置session中间件
app.use(session({
  name:config.session.key,
  secret:config.session.secret,
  resave:true,
  saveUninitialized:false,
  cookie: {
    maxAge: config.session.maxAge
  },
  store: new MongoStore({
      url:config.mongodb
  })
}));

app.use(flash());

app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),//上传文件目录
  keepExtensions: true//保留后缀
}));



// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});
//之后可以在模版中直接使用这几个变量， 而不用在render的时候传入变量
//app.local为静态数据 res.local为变量数据

app.use(expressWinston.logger({
  transports: [
    new(winston.transports.Console)({
      json:true,
      colorize:true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));

routes(app);

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));


// 处理表单及文件上传的中间件

app.use(function (err, req, res, next) {
  console.error(err);
  req.flash('error', err.message);
  res.redirect('/posts');
});

if(module.parent) {
  module.export = app;
}else{
 const PORT = process.env.PORT || config.port;


  app.listen(PORT, function(){
    console.log(`${pkg.name} listening on port number ${config.port}`);
  });
}

module.exports = {
  checkLogin: function checkLogin(req, res, next){
    if(!req.session.user){
      req.flash('error', 'Not loggedin');
      return res.redirect('/signin');
    }
    next();
  },

  checkNotLogin: function checkNotLogin(req, res, next){
    if(req.session.user){
      req.flash('error', 'Have already loggedin');
      return res.redirect('back');//go back to previous page
    }
    next();
  }
}

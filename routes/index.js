const express = require('express');
const router = express.Router();
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy

const {userModel} = require("../models/user")


/* GET home page. */
router.get('/',async function(req, res, next) {
  if(!req.session.passport){
    return res.redirect("/login")
  }
  const user = await userModel.findOne({id:req.session.passport.user.id})
  // console.log(user)
  res.render('index', { user});
});
router.get("/login",(req,res)=>{
  res.render("login")
})
router.get("/login/federated/google",passport.authenticate('google'))

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SEC,
  callbackURL: '/oauth2/redirect/google',
  scope: [,'openid','profile','email','https://www.googleapis.com/auth/userinfo.profile']
}, async function (accessToken,refreshToken,profile, cb) {
  const userFind = await userModel.findOne({id:profile.id})
  if(!userFind){
    const userData = await userModel.create({
      id:profile.id,
      name:profile.displayName,
      email:profile.emails[0].value,
      picture:profile.photos[0].value
    })
    return cb(null,userData)
  }else{
    return cb(null,userFind)
  }
}));
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, user);
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

module.exports = router;

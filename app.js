require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const res = require('express/lib/response');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
//collect all the static file
app.use(express.static("public"));

//enable session
app.use(session({
    secret: 'Our little secret.', //this can be any string
    resave: false,
    saveUninitialized: false
  }));

//enable passport
app.use(passport.initialize());
app.use(passport.session());

//connect to mongoDB server on port 27017 in blogDB
main().catch(err => console.log(err));

async function main() {
    //connect to mongoDB 
    await mongoose.connect("mongodb://localhost:27017/userDB");

    //create schema
    const userSchema = new mongoose.Schema({
        email : String,
        pwd: String
    });

    // userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['pwd']});

    //enable passport-local-mongoose
    userSchema.plugin(passportLocalMongoose);
    
    //create model
    const User = new mongoose.model("User", userSchema);

    //use passport too create a log-in strategy
    passport.use(User.createStrategy());

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.get("/",(req,res)=>{
        res.render("home");
    });
    
    app.get("/login",(req,res)=>{
        res.render("login");
    });
    
    app.get("/register",(req,res)=>{
        res.render("register");
    });

    app.get("/secrets",(req,res)=>{
        if(req.isAuthenticated()){
            res.render("secrets");
        }else{
            res.redirect("/login");
        }
    });

    app.get("/logout",(req,res)=>{
        req.logout();
        res.redirect('/');
    });

    app.post("/register", (req,res)=>{
        // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        //     const newUser = User({
        //         email: req.body.username,
        //         pwd: hash
        //         //pwd: md5(req.body.password)
        //     });
    
        //     newUser.save((err)=>{
        //         if(err){
        //             console.log(err);
        //         }else{
        //             //go to secrets page after login
        //             res.render("secrets");
        //         }
        //     });
        // });
        User.register({username:req.body.username}, req.body.password, function(err, user) {
            if (err) { 
                console.log(err);
                res.redirect("/register");
             }else{
                 passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");   
                 });
             }
          });
    });

    app.post("/login", (req,res)=>{
        // const userName = req.body.username;
        // const pwd = req.body.password;

        // User.findOne({email: userName}, (err,foundUser)=>{
        //     if(err){
        //         console.log(err);
        //     }else{
        //         if(foundUser){
        //             bcrypt.compare(pwd, foundUser.pwd, function(err, result) {
        //                 if(result === true){
        //                     res.render("secrets");
        //                 }
        //             });
        //         }
        //     }
        // })

        const user = new User({
            username : req.body.username,
            pwd : req.body.password
        });

        req.login(user, function(err) {
            if (err) { 
                console.log(err); 
            }else{
                passport.authenticate("local")(req,res, function(){
                    res.redirect("/secrets");
                });
            }
          });
    });
    
    app.listen(3000, function() {
        console.log("Server started on port 3000");
      });

}



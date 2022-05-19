require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
//collect all the static file
app.use(express.static("public"));


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

    //create model
    const User = new mongoose.model("User", userSchema);

    app.get("/",(req,res)=>{
        res.render("home");
    })
    
    app.get("/login",(req,res)=>{
        res.render("login");
    })
    
    app.get("/register",(req,res)=>{
        res.render("register");
    })

    app.post("/register", (req,res)=>{
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            const newUser = User({
                email: req.body.username,
                pwd: hash
                //pwd: md5(req.body.password)
            });
    
            newUser.save((err)=>{
                if(err){
                    console.log(err);
                }else{
                    //go to secrets page after login
                    res.render("secrets");
                }
            });
        });
    });

    app.post("/login", (req,res)=>{
        const userName = req.body.username;
        const pwd = req.body.password;

        User.findOne({email: userName}, (err,foundUser)=>{
            if(err){
                console.log(err);
            }else{
                if(foundUser){
                    bcrypt.compare(pwd, foundUser.pwd, function(err, result) {
                        if(result === true){
                            res.render("secrets");
                        }
                    });
                }
            }
        })
    });
    
    app.listen(3000, function() {
        console.log("Server started on port 3000");
      });

}



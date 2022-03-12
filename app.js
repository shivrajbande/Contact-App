const express = require('express');
const mongoose = require("mongoose");
const path =require('path');
const session = require("express-session");
const MongoDBSession = require('connect-mongodb-session')(session);
const { stringify } = require('querystring');
const app = express(); 
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
//connection to data base
const uri = 'mongodb+srv://Shrishanth:qwerty123@cluster0.ywfol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(uri,{//change database
    useNewUrlParser:true,
    }).then(()=>{
        console.log("success")
    
    }).catch((err)=> console.log("not"));

//schema for database

const UserSchema = mongoose.Schema({
    Email :String,
    Password:String,
    Secret:String,
    Contacts:[{
        name:String,
        PhoneNumber:Number,
        Email:String
    }]

})


const User = mongoose.model('Users',UserSchema);

//set views before use
app.set("view engine","ejs");


//sessions

//first need to specify where to store session
const store = new MongoDBSession({
    uri:uri,
    collection:'users'
})
//connect express to mongodb
app.use(session({
    secret: 'keyboard  new cat',
    resave: true,
    saveUninitialized: false,
    store:store,
}))





app.get("/",(req,res)=>{
   // console.log(__dirname);
    res.sendFile(__dirname+'/public/SignUp.html');
})
app.post("/",async(req,res)=>{
    const users = new User({
        Email:req.body.email,
        Password:req.body.password,
        Secret:req.body.Secret
    })
   

    const data = await users.save();
   // console.log(data);
    req.session.name = (data._id).toString();
    //console.log(req.session.name);

    res.redirect('/contacts');
})
app.get("/signin",(req,res)=>{
    res.sendFile(__dirname+'/public/SignIn.html');

})


app.post("/signin",async(req,res)=>{
    
    const data = await User.find({Email:req.body.email,Password:req.body.password});
    //console.log(data);

    if(data.length>0)
     {
        req.session.name = (data[0]._id).toString();
      //  console.log(req.session.name);
        res.redirect("/contacts");
     }
     else
     {
         res.redirect("/")
     } 
})
var id;
app.get("/contacts",async(req,res)=>{
    //get contacts from database
     id = req.session.name;
    // console.log(id);
   const data = await User.findById(id);
       
 //  console.log(data);

    res.render("ContactForm",{records:data})
      
})
app.post("/contacts",async(req,res)=>{
    
    const data = {

        name:req.body.name,
        PhoneNumber:req.body.number,
        Email:req.body.email

    }
  var  id = req.session.name;

       const users = await User.findById(id);
    //inserting into the array
       const k =  await users.updateOne({$push: { Contacts:data}});

       users.save();
       res.redirect("/contacts");

   // const data = User.findById()
})





app.listen(3000,()=>{
    console.log('connected to the server!!');
})
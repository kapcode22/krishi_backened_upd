const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const connectDb = require("./config/dbConnection");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//random number 
const JWT_SECRET = "qwertyuiopasdfghjklzxcvbnm1234567890(){}";

//const connectDb =require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
app.use(cors());
app.use(express.json());
app.use(errorHandler);
const PORT = process.env.PORT || 8080;

// mongodb connection
connectDb();



//schema
const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  number:String,
  password: {
    type: String,
    required: true,
    min: 3,
    max: 12,
  },
  confirmPassword: String,
});


const wagerSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  address: String,
  District: String,
  state: String,
  pinocde: String,
  NumberofWager: String,
  work: String,
  contactNo:String ,
});


const agriSchema = mongoose.Schema({
  firstname: String,
  lastname: String,

  email: {
    type: String,
    unique: true,
  },
  contactNo:String,
  address:String,
  District: String,
  state: String,
  pinocde: String,
  machine:String,
});

const userModel = mongoose.model("user", userSchema);
const wagerModel = mongoose.model("wager", wagerSchema);
const agriModel = mongoose.model("agri", agriSchema);
//api signup

app.post("/signup", async (req, res) => {
  const { firstname, lastname, email,number, password, confirmPassword } = req.body;
  const hashedPassword =await bcrypt.hash(password,10);
  const hashedconfirmPassword =await bcrypt.hash(confirmPassword,10);
  try {
    const oldUser = await userModel.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await userModel.create({
      firstname,
      lastname,
      email,
      number,
      password:hashedPassword,
      confirmPassword:hashedconfirmPassword,
    });
    res.send({ status: "ok" });
  }
  catch (error) {
    res.send({ status: "error" });
  }

});


//api login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
try{
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.json({ error: "User not found" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({}, JWT_SECRET);

    if (res.status(201)) {
      return res.json({ status: "Ok",data:token});
    } else {
      return res.json({ error: "error" });
    }
  }
}
 catch{
  res.json({ status: "error", error: "Invalid Password" });
 }
 
});


// api wagers
app.post("/wagers",  async (req, res) =>{
  const{ firstname, lastname ,email, contactNo, address,District,state,pincode,Wagers,work } = req.body;

  try {
    const oldUser = await wagerModel.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User request already Exists" });
    }
    await wagerModel.create({
      firstname,
      lastname,
      email,
      address,
      District,
      state,
      Wagers,
      work,
      pincode,
      contactNo,
  });
    res.send({ status: "request created successfully" });
  }catch (error) {
    res.send({ status: "error" });
  }
});

// api agris
app.post("/agris",  async (req, res) =>{
  const { firstname, lastname, email, contactNo, address, District, state, pincode,machine } = req.body;

  try {
    const oldUser = await agriModel.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User request already Exists" });
    }
    await agriModel.create({
      firstname,
      lastname,
      email,
      contactNo,
      address,
      District,
      state,
      pincode,
      machine,
  });
    res.send({ status: "request created successfully" });
  }catch (error) {
    res.send({ status: "error" });
  }
});

app.post("/profile", async(req,res)=>{
  const {token}=req.body;
  try{
     const user=jwt.verify(token.JWT_SECRET);
     const useremail = user.email;
     user.findOne({email:useremail})
     .then((data)=>{
      res.send({status:"ok",data:data});
     })
     .catch((error)=>{
      res.send({status:"error",data:error});
     })
  }catch(error){}
})

// get api agris -- working 
app.get("/getagriuser", async(req,res)=>{
  try {
    const allagriuser= await agriModel.find({});
    res.send({status:"ok",data:allagriuser});
  } catch (error) {
    console.log(error);
  }
  
});

// get api wager --working
app.get("/getwageruser", async(req,res)=>{
  try {
    const allwageruser= await wagerModel.find({});
    res.send({status:"ok",data:allwageruser});
  } catch (error) {
    console.log(error);
  }
  
});


app.listen(PORT, () => console.log("server is running at port: " + PORT));

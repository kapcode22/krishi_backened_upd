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
const stripe= require("stripe")(process.env.SECRET_STRIPE_KEY)

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
  firstname:{
    type:String,
    required:true,
    trime:true,
  },
  lastname: {
    type:String,
    required:true,
    trime:true,
  },
  email: {
    type: String,
    unique: true,
  },
  number:{
    type:String,
    required:true,
  },
  password: {
    type: String,
    required: true,
    min: 3,
    max: 12,
  },
  confirmPassword: String,
  userType:String,
});


const wagerSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  contactNo: String,
  address: String,
  District: String,
  state: String,
  pincode: String,
  work: String,
  NumberofWagers: String, // Corrected field name to match the request
  amount: String,
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
  amount:String,
});

const userModel = mongoose.model("user", userSchema);
const wagerModel = mongoose.model("wager", wagerSchema);
const agriModel = mongoose.model("agri", agriSchema);
//api signup

app.post("/signup", async (req, res) => {
  const { firstname, lastname, email,number, password, confirmPassword,userType } = req.body;
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
      userType,
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
  const{ firstname, lastname ,email, contactNo, address,District,state,pincode,NumberofWagers,work,amount} = req.body;

  try {
    const oldUser = await wagerModel.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User request already Exists" });
    }
    await wagerModel.create({
      firstname,
      lastname,
      email,
      contactNo,
      address,
      District,
      state,
      pincode,
      work,
      NumberofWagers,
      amount
  });
    res.send({ status: "request created successfully" });
  }catch (error) {
    res.send({ status: "error" });
  }
});

// api agris
app.post("/agris",  async (req, res) =>{
  const { firstname, lastname, email, contactNo, address, District, state, pincode,machine,amount } = req.body;

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
      amount,
  });
    res.send({ status: "request created successfully" });
  }catch (error) {
    res.send({ status: "error" });
  }
});


// app.post("/payment",async(req,res)=>{
//   const {firstname, lastname,address,contactNo, amount } = req.body;
//   const session =await stripe.checkout.session.create({
//     payment_method_types:["card"],
//     totalamount:amount,
//     mode:"payment",
//     success_url:"http://localhost:3000/success",
//     cancel_url:"http://localhost:3000/cancel"
//   })

//   res.json({id:session.id})
   
// });


// get api agris -- working 
app.get("/getagriuser", async (req, res) => {
  const search = req.query.search || "";
  const machine = req.query.machine || "All";
  console.log("Received search query:", search);

  const query = {
    address: { $regex: search, $options: "i" }
  }
  if (machine !== "All") {
    query.machine = machine; // Only include the machine in the query if it's not "All"
  }


  try {
    const allAgriUsers = await agriModel.find(query);
    console.log("Query result:", allAgriUsers);
    res.send({ status: "ok", data: allAgriUsers });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});


app.get("/getsingleagri", async(req,res)=>{
  const {id}=req.params;
  try {
    const agriuser= await agriModel.find({_id:id});
    res.send({status:"ok",data:agriuser});
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


app.post("/payment", async (req, res) => {
  const { firstname, lastname, address, contactNo, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "firstname+lastname",
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Unable to process payment" });
  }
});

// Handle webhook events for payment success/failure
app.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  const sig = req.headers["stripe-signature"];

  try {
    data = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    eventType = data.type;
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (eventType) {
    case "checkout.session.completed":
      const session = data.object;
      // Handle successful payment event
      console.log("Payment successful:", session);
      break;
    case "checkout.session.async_payment_failed":
      // Handle failed payment event
      console.log("Payment failed:", data.object);
      break;
    // Add other event types if necessary
    default:
      console.log(`Unhandled event type ${eventType}`);
  }

  res.status(200).json({ received: true });
});



app.listen(PORT, () => console.log("server is running at port: " + PORT));

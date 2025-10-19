const express = require('express');
const dotenv = require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectMongoDB } = require('./connection');

const app = express();
const authRouter = require("./Routes/auth");
const categoryRouter = require('./Routes/category');
const ItemRouter = require('./Routes/item');
const userRouter = require('./Routes/user');
const claimItemRouter = require('./Routes/claimItem');
const storeRouter = require('./Routes/store');
const personRouter = require('./Routes/person');
const recentActivitiesRouter = require('./Routes/recentActivities');

app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


const PORT = process.env.PORT || 8001;
app.listen(PORT,()=> console.log(`Server Running at ${PORT}`));


connectMongoDB(process.env.MONGODB_URL)
  .then(()=> console.log("MongoDb connected Successfully"))
  .catch((error)=> console.error("Error Connecting MongoDb",error));


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use("/api/auth/",authRouter);
app.use("/api/user/",userRouter);
app.use("/api/category/",categoryRouter);
app.use("/api/item/",ItemRouter);
app.use("/api/claim/",claimItemRouter);
app.use("/api/store/",storeRouter);
app.use("/api/person/",personRouter);
app.use("/api/activities/",recentActivitiesRouter);

app.get('/',(req,res)=>{
    return res.send("Server is  Running");
})
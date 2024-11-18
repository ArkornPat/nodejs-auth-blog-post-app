import { Router } from "express";
import bcrypt  from "bcrypt"
import { db } from "../utils/db.js";
import 'dotenv/config'
import jwt from "jsonwebtoken"
const authRouter = Router();

authRouter.post("/register",async(req,res)=>{
   
    const user = {
        username:req.body.username,
        password:req.body.password,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
    }
    const salt = await bcrypt.genSalt(10)
    // console.log(salt);
    user.password = await bcrypt.hash(user.password,salt)
    //  console.log(user.password);
    const collection = db.collection("user");
    await collection.insertOne(user) ;
    return res.json({
        message:"User has been create  sucecessfully"
    })
})

authRouter.post("/login",async(req,res)=>{
    const SECRET_KEY = process.env.SECRET_KEY;
    // console.log(SECRET_KEY);
    
    const user = await db.collection("users").findOne({
        username:req.body.username
    })
    // console.log(user);
    // console.log(req.body.password);
    
    if(!user){
        return res.status(404).json({message:"user not found"})
    }
    const isVaildPassword = await bcrypt.compare(req.body.password,user.password)
    // console.log(isVaildPassword);
    if(!isVaildPassword){
        return res.status(400).json({message:"password not valid"})
    }
 
    const token = jwt.sign({
        id:user._id,firstName:user.firstName,lastName:user.lastName
    }, 
    SECRET_KEY,
    {
        expiresIn:"400000"
    })
    
    console.log(token);
    
    return res.json({
        message:"login successfully",
        token,
    })
})



export default authRouter;

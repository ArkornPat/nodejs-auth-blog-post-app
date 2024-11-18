import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
  try {
    const user = {
      ...req.body,
    };

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const collection = db.collection("users");
    await collection.insertOne(user);

    return res.json({
      message: "User has been created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while creating the user.",
    });
  }
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
  try {
    const user = await db.collection("users").findOne({
      username: req.body.username,
    });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    //bcrypt.compare รับพารามิเตอร์สองตัว คือ รหัสผ่านแบบข้อความธรรมดา และ รหัสผ่านที่ถูกแฮชแล้ว.
    //ค่าที่คืนกลับ: true false
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        message: "password not valid",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "900000",
      }
    );

    return res.json({
      message: "login successfully",
      token: `${token}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred during login."
    });
  }
});

export default authRouter;

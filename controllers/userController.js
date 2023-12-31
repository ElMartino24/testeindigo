import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

export const createAccount = async (req, res, next) => {
  const { username, email, password } = req.body;

  const user = await UserModel.findOne({ username });

  if (user) {
    return res.status(422).json({
      message: "Account existiert bereits",
      content: user,
      isSuccess: false,
    });
  }

  let hashedPassword;
  
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    res.status(500).json({
      message: "Account kann nicht gespeichert werden",
      content: null,
      isSuccess: false,
    });
  }

  const newUser = new UserModel({ username, email, password: hashedPassword });

  try {
    const user = await newUser.save();

    const id = user.id;

    let accessToken = jwt.sign({ userId: id }, process.env.jwt);

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,  
      sameSite: "None",
    });

    res.status(201).json({
      message: "Account erfolgreich gespeichert",
      content: user.id,
      isSuccess: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      content: null,
      isSuccess: false,
    });
  }
};

export const loginAction = async (req, res, next) => {
  try {
    cookieParser()(req, res, () => {});
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(422).json({
        message: "Username existiert nicht!",
        content: null,
        isSuccess: false,
      });
    }

    let hashedPassword = await bcrypt.compare(password, user.password);

    if (!hashedPassword) {
      return res.status(401).json({
        message: "Falsches Password",
        content: null,
        isSuccess: false,
      });
    }

    const id = user.id;

    let accessToken = jwt.sign({ userId: id }, process.env.jwt);

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,  
      sameSite: "None",
    });

    if (req.cookies.token) {
      console.log("Token-Cookie wurde gesetzt:", req.cookies.token);
    } else {
      console.log("Token-Cookie wurde nicht gesetzt");
    }

    res.status(201).json({
      message: "Erfolgreich eingellogged",
      content: user.id,
      isSuccess: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      content: null,
      isSuccess: false,
    });
  }
};

export const logoutAction = async (req, res, next) => {
  

  console.log("test")
};
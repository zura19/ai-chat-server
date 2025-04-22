import bcrtpy from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { signJwtAndSetCookies } from "../lib/generateJWTAndSetCookies.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const salt = await bcrtpy.genSalt(10);
    const hashedPassword = await bcrtpy.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    const token = signJwtAndSetCookies(res, user.id);
    res.status(201).json({ success: true, user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrtpy.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = signJwtAndSetCookies(res, user.id);
    res
      .status(200)
      .json({ success: true, user: { ...user, password: undefined }, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .json({ success: true, message: "Logout successful" });
};

export const protect = async (req, res, next) => {
  try {
    const token = req?.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authorize to access this." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findFirst({ where: { id: decoded.id } });
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401);
  }
};

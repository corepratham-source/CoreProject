import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

console.log("[AuthController] INFO: Auth controller loaded");

// SIGNUP
export const signup = async (req, res) => {
  console.log("[AuthController] INFO: signup called with email:", req.body?.email);
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      console.warn("[AuthController] WARNING: Missing required fields");
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.warn("[AuthController] WARNING: User already exists:", email);
      return res.status(400).json({ error: "User already exists" });
    }
    console.log("[AuthController] INFO: Hashing password");
    const hashed = await bcrypt.hash(password, 10);
    console.log("[AuthController] INFO: Creating user in database");
    const user = await User.create({
      name,
      email,
      password: hashed
    });
    console.log("[AuthController] INFO: User created successfully, ID:", user._id);
    res.json({ message: "User created" });
  } catch (err) {
    console.error("[AuthController] ERROR: Signup failed:", err.message);
    console.error("[AuthController] STACK:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  console.log("[AuthController] INFO: login called with email:", req.body?.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn("[AuthController] WARNING: Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("[AuthController] WARNING: User not found:", email);
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.warn("[AuthController] WARNING: Invalid password for user:", email);
      return res.status(400).json({ error: "Invalid password" });
    }
    console.log("[AuthController] INFO: Generating JWT token");
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("[AuthController] INFO: Setting cookie");
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,          // 🔥 MUST (Railway = HTTPS)
      sameSite: "none",      // 🔥 CRITICAL FIX
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    console.log("[AuthController] INFO: Login successful for user:", email);
    res.json({ message: "Logged in" });
  } catch (err) {
    console.error("[AuthController] ERROR: Login failed:", err.message);
    console.error("[AuthController] STACK:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

// ADMIN LOGIN
export const adminLogin = async (req, res) => {
    console.log("[AuthController] INFO: adminLogin called with email:", req.body?.email);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("[AuthController] WARNING: User not found:", email);
      return res.status(400).json({ error: "User not found" });
    }

    if (user.role !== "admin") {
      console.warn("[AuthController] WARNING: User is not an admin:", email);
      return res.status(403).json({ error: "Not an admin" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.warn("[AuthController] WARNING: Invalid password for user:", email);
      return res.status(400).json({ error: "Invalid password" });
    }
    console.log("[AuthController] INFO: Generating JWT token");


    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    console.log("[AuthController] INFO: Admin login successful for user:", email);
    res.json({ message: "Admin logged in" });

  } catch (err) {
    console.error("[AuthController] ERROR: Admin login failed:", err.message);
    console.error("[AuthController] STACK:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

// LOGOUT
export const logout = (req, res) => {
  console.log("[AuthController] INFO: logout called");
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  console.log("[AuthController] INFO: Logout successful");
  res.json({ message: "Logged out" });
};

// GET CURRENT USER
export const me = (req, res) => {
  console.log("[AuthController] INFO: me called, user:", req.user?.id);
  res.json({ user: req.user });
};
const express = require("express");
const authRouter = express.Router();

const { login, register, loadUser, logout } = require("../controllers/authController");
const { verifyToken, canAdd } = require("../middlewares/verifyToken");

authRouter.post("/login", login);
authRouter.post("/register", verifyToken, canAdd, register);
authRouter.get("/me", verifyToken, loadUser);
authRouter.post("/logout", verifyToken, logout);

module.exports = authRouter;

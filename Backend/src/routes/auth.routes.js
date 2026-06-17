import { Router } from "express";
import * as authController from "../controllers/auth.controller.js"
import authMiddleware from "../MIddlewares/auth.middleware.js";

const authRouter = Router();

// POST /api/auth/register
authRouter.post("/register", authController.register)

// POST /api/auth/login-password
authRouter.post("/login", authController.loginUser)

// POST /api/auth/refresh
authRouter.post("/refresh", authController.refreshToken)

// POST /api/auth.logout
authRouter.post("/logout", authMiddleware, authController.logout)

// POST /api/auth/send-otp
// POST /api/auth/verify-otp
// GET  /api/auth/me
authRouter.get("/me", authMiddleware, authController.getMe);

export default authRouter;
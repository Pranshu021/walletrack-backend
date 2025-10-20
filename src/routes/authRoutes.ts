import { Router } from "express";
import { login, logout, refreshToken, googleLoginController } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.post("/logout", logout);
router.post("/googleAuth", googleLoginController);

export default router;
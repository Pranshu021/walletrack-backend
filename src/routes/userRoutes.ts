import { Router } from "express";
import { getUserController, createUserController, deleteUserController} from "../controllers/userController"
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth , getUserController);
router.get("/user/:id", requireAuth, getUserController);
router.post("/user", createUserController);
router.delete("/user/:id", requireAuth, deleteUserController);

export default router;


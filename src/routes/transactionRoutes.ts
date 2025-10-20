import { Router } from "express";
import { fetchTransactionController, createTransactionController } from "../controllers/transactionController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get('/', requireAuth , fetchTransactionController);
router.post('/', requireAuth, createTransactionController);

export default router;
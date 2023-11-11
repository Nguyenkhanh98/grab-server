import { Router } from "express";
import {
  checkUser,
  onBoardUser,
} from "../../controllers/authController.js";

const router = Router();

router.post("/check-user", checkUser);
router.post("/on-board-user", onBoardUser);

export default router;

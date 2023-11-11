import { Router } from "express";

import { book, cancel, accept, complete, getCurrentRides, pick, getHistories } from "../../controllers/rideController.js";
const router = Router();


router.post("/", book);
router.post("/cancel", cancel);
router.post("/accept", accept);
router.post("/complete", complete);
router.post("/pick", pick);
router.get("/current", getCurrentRides);
router.get("/", getHistories);

export default router;

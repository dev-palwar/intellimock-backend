import { Router } from "express";
import { initiateConvo, tempCont } from "../controllers/resumeController";
import { setupSocket } from "../socket";

const router = Router();

router.post("/extract-resume-text", tempCont);

// Resume processing route
// router.post("/process-resume", processResume);

// Conversation initialization route
router.post("/initiate-convo", initiateConvo);

export { router as apiRoutes };
export { setupSocket };

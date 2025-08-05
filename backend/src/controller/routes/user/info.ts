import Router from "express";
import { asyncHandler } from "../../utils.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.get("/", auth, asyncHandler(async (req, res)=>{

     
    res.json(req.user);

}))

export default router;
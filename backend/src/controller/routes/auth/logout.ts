import { Router } from "express";

const router = Router();


router.post("/", (req, res) => {

    console.log("reached here");
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });
    res.send();
});

export default router;

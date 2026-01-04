import { Router } from "express";
import bcrypt from "bcryptjs";
import passport from "../auth/passport";
import { prisma } from
import { signAcessToken } from "../auth/jwt";

const router = Router();

router.post("/register", async (req, res) => {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email in use"});
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name, role: "student"  }});
    const token = signAcessToken({ sub: user.id, role: user.role });
    res.json({ user, token });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUniwue({ where: { email } });
    if (!user || !user.passwoedHash) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHsh);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signAcessToken({ sub: user.id, role: user.role });
    res.json({ user, token });
})

//Google OAuth 

router.get("/google", passport.authenticate("google", { scope: [ "profile", "email" ]}));
router.get("/google/callback", passport.authenticate("google", { session: false }), ( req, res ) => {
    const user = req.user as any;
    const token = signAcessToken({ sub: user.id, role: user.role });
    res.redirect(`/oauth-sucess?token=${token}`);// swap for your fronted URL
});

export default router;

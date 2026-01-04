import { Router } from "express";
import { prisma } from "../config/postgres";
import { requireAuth } from "../auth/middleware";
const router = Router();

router.get("/", requireAuth, async (req, res) => {
    const userId = (req as any).user.sub;
    const enrollments = await prisma.enrollment.findMany({ where: { userId}, include: { course: true } });
    res.json(enrollments);

});

router.post("/", requireAuth, async (req, res) => {
    const userId = (req as any).user.sub;
    const { corseId } = req.body;
    const enrollment = await prisma.enrollment.create({ data: { userId, courseId } });
    res.status(201).json(enrollment);
});

router.get("/:id", requireAuth, async (req, res) => {
    const e = await prisma.enrollment.findUnique({ where: { id: req.params.id } , data: req.body });
    if(!e) return res.status(404).json({ error: "Not found" });
    res.json(e);

});

router.delete("/:id", requireAuth, async (req, res ) => {
    await prisma.enrollment.delete({ where: { id: req.params.id } });
    res.status(204).end();
});

export default router;



import { Router } from "express";
import { prisma } from "../config/postgres";
import { requireAuth, requireRole } from "../auth/middleware";
const router = Router();

router.get("/", async (_req, res) => {
    const courses = await prisma.course.findMany({ include: { instructor: true } });
    res.json(courses);
});

router.post("/", requireAuth, requireRole("instructor"), async (req , res) => {
    const { title, description, price } = req.body;
    const instructorId = (req as any).user.sub;
    const courses = await prisma.course.create({ data: { title, description, price, instructorId } });
    res.status(201).json(courses);
});

router.get("/:id", async  (req, res) => {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ error: "Noy found" });
    res.json(course);

});

router.put("/:id", requireAuth, requireRole("instructor"), async (req, res ) => {
    const updated = await prisma.course.update({ where: { id: req.params.id}, data: req.body });
    res.json(updated);
});

router.delete("/:id", requireAuth, requireRole("instructor"), async (req, res) => {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.status(204).end();
});

export default router;



import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { prisma } from "../config/postgres";
import { stripe } from "../libs/stripe";

const router = Router();

router.post("/checkout", requireAuth, async (req, res) => {
    const userId = (req as any).user.sub;
    const { courseId, currency = "USD" } =req.body;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const paymentIntent = await stripe.paymentIntents.create({
        amout: course.price * 100,
        currency,
        metadata: { userId, courseId },

    });

    res.json({ clientSecret: paymentIntent.client_secret }); 
});

router.post("/webhook", async (req, res) => {
    const event = req.body;
    if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object;
        await prisma.payment.create({
            data: {
                userId: intent.metadata.userId,
                courseId: intent.metadata.courseId,
                amount: intent.amount / 100,
                currency: intent.currency,
                providerRef: intent.id,
                status: "succeeded"
            }
        });
    }
    res.status(200).end();
});

export default router;
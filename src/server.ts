import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "./auth/passport";
import { env } from "./config/env";
import { prisma } from "./config/postgres";
import { connectMongo } from "./config/mangos";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routers";
import courseRoutes from "./routes/courses.routers";
import enrollmentRoutes from "./routes/enrollments.routes";
import paymentRoutes from "./routes/payments.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());


//Routes
app.use("/api/auth", authRoutes );
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

(async () => {
    await connectMongo();
    await prisma.$connect();
    app.listen(env.port, () => console.log(`API running on ${env.port}`));
})();


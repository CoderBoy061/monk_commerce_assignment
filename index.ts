import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./database/database";
import couponRoutes, { couponApplyRouter } from "./routes/coupon-routes";
import { logger } from "./utils/logger";

dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.get("/hello-world", (_: Request, res: Response) => {
  res.send("Hello World from Monk Commerce, healthy Backend");
});

// just to check the system info, not for production use
app.get("/system-info", (_: Request, res: Response) => {
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  };

  if(process.env.NODE_ENV === "development") {
    logger.info("System info requested", { systemInfo });
    res.json(systemInfo);
  }
  else {
    res.json({ message: "System info is only available in development mode" });
    logger.warn("System info request blocked in production", { systemInfo });
    return;
  }

  
});

app.use("/coupons", couponRoutes);
app.use("/", couponApplyRouter);

// db then start server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`${process.env.NODE_ENV} server started on http://localhost:${port}`);
      
      logger.info("Server started", { port, env: process.env.NODE_ENV || "development" });
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection failed, exiting", { error: String(err) });
    process.exit(1);
  });

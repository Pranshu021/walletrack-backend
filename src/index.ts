import express, { application } from "express";
import { ApolloServer } from "@apollo/server"; 
import { connectMongoDB } from "./config/mongo";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser  from "body-parser";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import logger from "./utils/logger";
import cookieParser = require("cookie-parser");

dotenv.config();

const startServer = async() => {
    const app = express();
    await connectMongoDB();
    
    app.use(cors());
    app.use(cookieParser());
    app.use(bodyParser.json());

    app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
        console.log(
          `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Query: ${JSON.stringify(req.query)} | Body: ${JSON.stringify(req.body)} | Req ID: ${uuidv4()}` 
        );
        next();
      });

    app.use(requestLogger);

    app.use("/api/users", userRoutes);
    app.use("/api/auth", authRoutes);

    const PORT = process.env.PORT || 3001;
    // app.listen(PORT, async() => {
    //     try {
    //         await connectMongoDB();
    //         logger.info(`🚀 Server running at http://localhost:${PORT}`)
    //     } catch(error) {
    //         logger.error(`❌ Failed to connect to MongoDB: ${(error as Error).message}`);
    //         process.exit(1); // hard Exit
    //     }
    // })

    app.listen(PORT, async() => {
        logger.info(`🚀 Server running at http://localhost:${PORT}`)
    })

    app.use(errorHandler);
}

startServer();
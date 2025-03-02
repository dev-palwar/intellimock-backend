import express, { Request, Response } from "express";
import pdfParse from "pdf-parse";
import cors from "cors";
import { config } from "dotenv";
import { apiRoutes, setupSocket } from "./routes";
import { createServer } from "http";

config();

const app = express();
const PORT = process.env.PORT || 9090;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

// Create HTTP server and attach WebSocket
const httpServer = createServer(app);
setupSocket(httpServer);

// Start the HTTP server instead of Express alone
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

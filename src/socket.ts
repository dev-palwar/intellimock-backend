import { Server } from "socket.io";
import { geminiAPI } from "./lib/geminiService";
import { chatSessions } from "./lib/sessionStore";

export const setupSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`);

    socket.on("join-chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`📌 User joined chat: ${chatId}`);

      let session = chatSessions.get(chatId);

      if (!session) {
        console.warn(`⚠️ No chat session found for chatId: ${chatId}`);
        return;
      }

      console.log(
        `💬 Chat session found for ${chatId}, AI state: ${session.aiState}`
      );

      if (session.aiState === "awaiting_first_message") {
        console.log(`🤖 AI needs to start conversation for chat: ${chatId}`);

        const initialPrompt = `im a react developer looking for a job. take my interview and act like a real interviewer, keep the conversation engaging and natural. Ask technical questions only`;

        geminiAPI(initialPrompt)
          .then((aiResponse) => {
            session.history.push({ role: "ai", content: aiResponse });
            session.aiState = "active";
            console.log(`✅ AI response sent to chat ${chatId}: ${aiResponse}`);
            io.to(chatId).emit("ai-message", aiResponse);
          })
          .catch((error) => {
            console.error(`❌ Error in AI response for chat ${chatId}:`, error);
          });
      }
    });

    socket.on("user-message", async ({ chatId, message }) => {
      console.log(`📩 Received message in chat ${chatId}: ${message}`);

      let session = chatSessions.get(chatId);
      if (!session) {
        console.warn(
          `⚠️ No active session for chatId: ${chatId}, ignoring message.`
        );
        return;
      }

      session.history.push({ role: "user", content: message });

      // Prepare full conversation history for better AI context
      const conversationHistory = session.history.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const prompt = [
        {
          role: "system",
          content: "You are an interviewer at TechNova Solutions.",
        },
        ...conversationHistory,
        { role: "user", content: message },
      ];

      try {
        const aiResponse = await geminiAPI(
          JSON.stringify({ messages: prompt })
        );
        session.history.push({ role: "ai", content: aiResponse });

        console.log(`🤖 AI response for chat ${chatId}: ${aiResponse}`);
        io.to(chatId).emit("ai-message", aiResponse);
      } catch (error) {
        console.error(
          `❌ Error generating AI response for chat ${chatId}:`,
          error
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

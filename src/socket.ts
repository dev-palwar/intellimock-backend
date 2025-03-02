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

      const session = chatSessions.get(chatId);

      if (session) {
        console.log(
          `💬 Chat session found for ${chatId}, AI state: ${session.aiState}`
        );

        if (session.aiState === "awaiting_first_message") {
          console.log(`🤖 AI needs to start conversation for chat: ${chatId}`);

          const prompt = `Start a conversation with ${
            session.userDetails.text.name
          } about their experience in ${JSON.stringify(
            session.userDetails.text
          )}`;

          geminiAPI(prompt)
            .then((aiResponse) => {
              session.history.push({ role: "ai", content: aiResponse });
              session.aiState = "active";
              console.log(
                `✅ AI response sent to chat ${chatId}: ${aiResponse}`
              );
              io.to(chatId).emit("ai-message", aiResponse);
            })
            .catch((error) => {
              console.error(
                `❌ Error in AI response for chat ${chatId}:`,
                error
              );
            });
        }
      } else {
        console.warn(`⚠️ No chat session found for chatId: ${chatId}`);
      }
    });

    socket.on("user-message", async ({ chatId, message }) => {
      console.log(`📩 Received message in chat ${chatId}: ${message}`);

      const session = chatSessions.get(chatId);
      if (!session) {
        console.warn(
          `⚠️ No active session for chatId: ${chatId}, ignoring message.`
        );
        return;
      }

      session.history.push({ role: "user", content: message });

      const prompt = `User response: ${message}\n\nContext: ${JSON.stringify(
        session.userDetails
      )}`;

      try {
        const aiResponse = await geminiAPI(prompt); // Replace deepSeekAPI with geminiAPI
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

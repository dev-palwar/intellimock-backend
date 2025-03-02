interface ChatSession {
  userDetails: {
    text: { name: string; skills: string[]; experience: string };
  };
  history: Array<{ role: "user" | "ai"; content: string }>;
  aiState: "awaiting_first_message" | "active" | "completed";
}

// In-memory store for chat sessions
export const chatSessions = new Map<string, ChatSession>();

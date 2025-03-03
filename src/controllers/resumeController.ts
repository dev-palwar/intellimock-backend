import { Request, Response } from "express";
import axios from "axios";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { v4 as uuidv4 } from "uuid";
import { chatSessions } from "../lib/sessionStore";

// Hardcoded resume URL for testing
const HARDCODED_RESUME_URL = "https://your-firebase-storage-url/resume.pdf";

interface UserDetails {
  text: {
    name: string;
    skills: string[];
    experience: string;
  };
}

// export const processResume = async (req: Request, res: Response) => {
//   try {
//     // Security check - replace with actual validation
//     if (!HARDCODED_RESUME_URL.startsWith("https://")) {
//       return res.status(400).json({ error: "Invalid URL protocol" });
//     }

//     // Download and process resume
//     const response = await axios.get(HARDCODED_RESUME_URL, {
//       responseType: "arraybuffer",
//     });

//     const buffer = Buffer.from(response.data);
//     let text = "";

//     if (HARDCODED_RESUME_URL.endsWith(".pdf")) {
//       const pdfData = await pdf(buffer);
//       text = pdfData.text;
//     } else if (HARDCODED_RESUME_URL.endsWith(".docx")) {
//       const result = await mammoth.extractRawText({ buffer });
//       text = result.value;
//     }

//     // Extract user details (simplified parsing)
//     const userDetails: UserDetails = {
//       name: text.match(/Name:\s*(.+)/)?.[1]?.trim() || "Candidate",
//       skills:
//         text
//           .match(/Skills:\s*(.+)/)?.[1]
//           ?.split(",")
//           .map((s) => s.trim()) || [],
//       experience:
//         text.match(/Experience:\s*([\s\S]+?)(?=\n\w+:|$)/)?.[1]?.trim() || "",
//     };

//     res.json(userDetails);
//   } catch (error) {
//     console.error("Resume processing error:", error);
//     res.status(500).json({ error: "Failed to process resume" });
//   }
// };

export const initiateConvo = async (req: Request, res: Response) => {
  try {
    const userDetails = req.body as UserDetails;
    const chatId = uuidv4();

    // Initializes chat session
    chatSessions.set(chatId, {
      userDetails,
      history: [],
      aiState: "awaiting_first_message",
    });

    res.json({ chatId });
  } catch (error) {
    console.error("Convo initiation error:", error);
    res.status(500).json({ error: "Failed to initialize conversation" });
  }
};

export const processResume = async (req: Request, res: Response) => {
  //   const { resumeUrl } = req.body;
  //   console.log("Received URL:", resumeUrl);

  //   if (!resumeUrl) {
  //     return res.status(400).json({ error: "Resume URL is required" });
  //   }

  try {
    // const response = await axios.get(resumeUrl, {
    //   responseType: "arraybuffer",
    // });
    // const fileBuffer = Buffer.from(response.data, "binary");
    // const contentType = response.headers["content-type"];
    // let extractedText = "";

    // if (contentType === "application/pdf") {
    //   extractedText = await extractTextFromPdf(fileBuffer);
    // } else if (
    //   contentType ===
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    // ) {
    //   const result = await mammoth.extractRawText({ buffer: fileBuffer });
    //   extractedText = result.value.trim();
    // } else {
    //   return res.status(400).json({
    //     error: "Unsupported file type. Only PDF and DOCX are supported.",
    //   });
    // }

    res.json({
      text: {
        name: "Amit Verma",
        email: "amit.verma@example.com",
        company: "TechNova Solutions",
        role: "Hiring Manager",
        location: "Bangalore, India",
        looking_for: "React Developer Intern",
        requirements: {
          skills: [
            "React.js",
            "JavaScript",
            "HTML",
            "CSS",
            "TypeScript",
            "Redux",
            "Next.js",
          ],
          experience: "0-1 year",
          education: "Pursuing or completed Bachelor's in CS or related field",
          availability: "Full-time Internship (3-6 months)",
          stipend: "INR 10,000 - 15,000 per month",
        },
        contact: {
          linkedin: "https://www.linkedin.com/in/amitverma",
          website: "https://technova.example.com",
          phone: "+91 9876543210",
        },
        job_description:
          "We are looking for a React Developer Intern to join our team. The ideal candidate should have a good understanding of React.js and frontend technologies. Responsibilities include developing UI components, integrating APIs, and collaborating with designers and backend developers.",
      },
    });
  } catch (error) {
    console.error("Error extracting text:", error);
    res.status(500).json({ error: "Failed to extract text from the resume" });
  }
};

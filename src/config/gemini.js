import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
const TEXT_MODEL = "gemini-1.5-flash";
const VISION_MODEL = "gemini-1.5-pro"; 
const API_KEY = "AIzaSyBzy-BKov6CAYUI7FlE9almAcM4em5jfdw";

async function fileToGenerativePart(imageData) {
  if (!imageData) return null;

  if (imageData.url.startsWith("data:")) {
    const base64Data = imageData.url.split(",")[1];
    return {
      inlineData: {
        data: base64Data,
        mimeType: imageData.type,
      },
    };
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: imageData.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageData.file);
  });
}

async function runChat(prompt, imageData = null) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);

    const modelName = imageData ? VISION_MODEL : TEXT_MODEL;
    const model = genAI.getGenerativeModel({ model: modelName });

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 1024,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    try {
      let contents = [];

      if (imageData) {
        const imagePart = await fileToGenerativePart(imageData);

        contents = [
          {
            role: "user",
            parts: [{ text: prompt }, imagePart],
          },
        ];
      } else {
        contents = [{ role: "user", parts: [{ text: prompt }] }];
      }

      const result = await model.generateContent({
        contents,
        generationConfig,
        safetySettings,
      });

      const response = await result.response;
      const text = response.text();

      console.log(text);
      return text;
    } catch (error) {
      console.error("Error generating content:", error.message);
      return `Sorry, I encountered an error: ${error.message}`;
    }
  } catch (error) {
    if (error.message.includes("quota") || error.message.includes("429")) {
      console.error(
        "Quota exceeded. Please try again later or upgrade your API plan."
      );
      return "I'm currently experiencing high demand. Please try again in a few minutes.";
    }

    console.error("Error in Gemini API call:", error.message);
    return `Error: ${error.message}. Please check console for details.`;
  }
}

export default runChat;
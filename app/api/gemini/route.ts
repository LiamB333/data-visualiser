import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDcg7Gsnws3etfqQTnNS259GBY1j9nNQAE"); // Store API Key securely
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    const prompt = `Create a step-by-step plan to achieve this goal: "${goal}".
    Format response as a **valid** JSON array:
    [
      {
        "id": 1,
        "title": "Step Title",
        "description": "Step description",
        "dependsOn": []
      },
      {
        "id": 2,
        "title": "Next Step",
        "description": "Step description",
        "dependsOn": [1]
      }
    ]
    Only return a valid JSON array, no markdown, no text explanation.`;

    const result = await model.generateContent(prompt);

    // Ensure response is only JSON
    let responseText = await result.response.text();

    // Clean response (remove markdown formatting if present)
    responseText = responseText.replace(/```json\n?|```\n?/g, "").trim();

    try {
      const steps = JSON.parse(responseText);

      if (!Array.isArray(steps)) {
        throw new Error("AI did not return a JSON array");
      }

      return NextResponse.json({ steps });
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", responseText);
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "Failed to generate steps" },
      { status: 500 }
    );
  }
}

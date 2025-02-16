// app/api/gemini/route.ts
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define a type for the expected data structure from the Excel file
interface FinancialData {
  [key: string]: string | number; // This will allow any column names (keys) and values to be string or number
}

// Parse Excel file to JSON
const parseExcelToJson = (fileBuffer: Buffer): FinancialData[] => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0]; // Assuming the first sheet is what we want
  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet); // Converts the sheet to JSON (array of objects)
};

// Generate insights using Gemini AI
const getGeminiAIInsights = async (data: FinancialData[]): Promise<string> => {
  const genAI = new GoogleGenerativeAI(
    "AIzaSyDcg7Gsnws3etfqQTnNS259GBY1j9nNQAE"
  ); // Replace with your API key
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Provide insights about this financial data:\n\n${JSON.stringify(
    data
  )}`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return "Failed to generate insights.";
  }
};

// API Route Handler
export async function POST(req: Request) {
  try {
    const formData = await req.formData(); // Get the file from the form data
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File not provided or invalid" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer()); // Convert file to buffer
    const data = parseExcelToJson(fileBuffer); // Parse the file to JSON
    const insights = await getGeminiAIInsights(data); // Get AI insights

    return NextResponse.json({ insights }); // Send back insights as JSON
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

"use client";
import { useState } from "react";

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files ? e.target.files[0] : null;
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null); // Reset error if file is selected again
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null); // Reset previous error

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const data = await response.json();
      if (data.insights) {
        setInsights(data.insights);
      } else {
        throw new Error("No insights returned from AI.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".xlsx,.xls" />
        <button type="submit" disabled={loading}>
          Generate Insights
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {insights && (
        <div>
          <h3>Generated Insights:</h3>
          <p>{insights}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

AIzaSyDcg7Gsnws3etfqQTnNS259GBY1j9nNQAE
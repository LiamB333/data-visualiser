"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GoalForm() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      if (!Array.isArray(data.steps)) {
        throw new Error("Invalid response format");
      }

      localStorage.setItem("goalSteps", JSON.stringify(data.steps)); 
      router.push("/flowchart"); // Redirect to FlowChartPage
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Goal Planning Assistant
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-3 border rounded text-gray-800 text-lg"
            placeholder="Enter your goal (e.g., Learn Guitar in 3 Months)"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Generating Plan..." : "Create Step-by-Step Plan"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

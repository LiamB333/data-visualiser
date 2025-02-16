"use client";
import { useEffect, useState } from "react";
import FlowChart from "../../Components/FlowChart";
import { Step } from "../types";
import { useRouter } from "next/navigation";

export default function FlowChartPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedSteps = localStorage.getItem("goalSteps");
    if (storedSteps) {
      setSteps(JSON.parse(storedSteps));
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex flex-col h-screen p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Your Goal Achievement Plan
        </h1>
      </div>
      <div className="flex-1 bg-white shadow-lg rounded-lg p-6">
        {steps.length > 0 ? (
          <FlowChart steps={steps} />
        ) : (
          <p className="text-gray-600">Loading plan...</p>
        )}
      </div>
    </div>
  );
}

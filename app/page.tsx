import GoalForm from "../Components/GoalForm";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen py-10 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        AI-Powered Goal Flowchart
      </h1>
      <GoalForm />
    </div>
  );
}

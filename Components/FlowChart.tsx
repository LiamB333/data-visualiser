"use client";
import { useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Position,
  MarkerType,
  NodeProps,
  Handle,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { Step } from "../app/types";

const CustomNode = ({ data }: NodeProps) => (
  <div className="relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
    <Handle
      type="target"
      position={Position.Top}
      className="w-4 h-4 bg-blue-500"
    />
    <div className="font-bold">{data.title}</div>
    <div className="text-sm text-gray-500">{data.description}</div>
    <Handle
      type="source"
      position={Position.Bottom}
      className="w-4 h-4 bg-blue-500"
    />
  </div>
);

const nodeTypes = {
  custom: CustomNode,
};

export default function FlowChart({ steps }: { steps: Step[] }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!steps || steps.length === 0) return;

    // Create nodes for each step
    const newNodes: Node[] = steps.map((step, index) => ({
      id: step.id.toString(),
      type: "custom",
      data: {
        title: step.title,
        description: step.description,
      },
      position: {
        x: 200, // Keep all nodes in a vertical line
        y: index * 150, // Spaced evenly downward
      },
      style: {
        width: 250,
        padding: "10px",
      },
    }));

    // Create SEQUENTIAL edges (each step to the next)
    const newEdges: Edge[] = steps
      .slice(0, -1) // Exclude the last step (it has no next step)
      .map((step, index) => ({
        id: `${steps[index].id}-${steps[index + 1].id}`,
        source: steps[index].id.toString(),
        target: steps[index + 1].id.toString(),
        type: "smoothstep",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#2563eb", strokeWidth: 2 },
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [steps]);

  return (
    <div className="w-full h-full">
      {steps.length > 0 ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Strict}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="bg-gray-50"
        />
      ) : (
        <p className="text-gray-600">No steps available</p>
      )}
    </div>
  );
}

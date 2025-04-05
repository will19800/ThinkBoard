"use client";

import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Lightbulb } from "lucide-react";

// Our Board now optionally stores finalized data.
interface Board {
  id: number;
  finalQuestion?: string;
  answer?: string;
  // For branch boards, we store them in the parent's "branches" array.
  branches?: Board[];
}

// The Whiteboard component renders either an active board with an input
// (if no finalized data exists) or an inactive board showing the Q&A.
interface WhiteboardProps {
  id: number;
  showAsk: boolean;
  showBranch: boolean;
  onAsk: (finalQuestion: string, answer: string) => void;
  onBranch: (finalQuestion: string, answer: string) => void;
  finalQuestion?: string;
  answer?: string;
}

function Whiteboard({
  id,
  showAsk,
  showBranch,
  onAsk,
  onBranch,
  finalQuestion,
  answer,
}: WhiteboardProps) {
  const [question, setQuestion] = useState("");

  // If finalized data exists, render an inactive board.
  if (finalQuestion !== undefined) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 w-[420px] min-h-[280px] border border-gray-100">
        <div className="mb-4">
          <span className="font-bold">Question: </span>
          <span className="text-gray-800">{finalQuestion}</span>
        </div>
        <div>
          <span className="font-bold">Answer: </span>
          <span className="text-gray-600">
            {answer || "(info about the topic that the user requested)"}
          </span>
        </div>
      </div>
    );
  }

  // Otherwise, render an active board.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const simulatedAnswer = `Placeholder answer for board ${id}`;
    if (showAsk) {
      onAsk(question, simulatedAnswer);
    } else if (showBranch) {
      onBranch(question, simulatedAnswer);
    }
    setQuestion("");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-[420px] border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        What do you want to learn today?
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a Question"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400 text-black"
        />
        <button
          type="submit"
          className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-colors font-medium"
        >
          {showAsk ? "Ask" : showBranch ? "Branch" : ""}
        </button>
      </form>
    </div>
  );
}

// ------------------ Home Component ------------------
export default function Home() {
  const [zoom, setZoom] = useState(1);
  // The grid is modeled as an array of columns (each column is an array of boards).
  const [columns, setColumns] = useState<Board[][]>([[{ id: 1 }]]);
  const nextId = useRef(2);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);

  // In our grid, for each column the active board is the bottom-most one.
  // For the rightmost column, the active board shows the Ask button.
  // For other columns, the active board shows the Branch button.

  // Handle Ask (rightmost column).
  const handleAsk = (finalQuestion: string, answer: string) => {
    setAutoZoomEnabled(true);
    setColumns((prev) => {
      const lastColIndex = prev.length - 1;
      const lastCol = prev[lastColIndex];
      // The active board is the last board in the rightmost column.
      // Replace it: finalize it and then add a new active board.
      const finalizedBoard: Board = { id: nextId.current++, finalQuestion, answer };
      const newActiveBoard: Board = { id: nextId.current++ };
      const newLastCol = [
        ...lastCol.slice(0, lastCol.length - 1),
        finalizedBoard,
        newActiveBoard,
      ];
      // Also add a new column (to the right) with a new active board.
      const newColumn: Board[] = [{ id: nextId.current++ }];
      return [...prev.slice(0, lastColIndex), newLastCol, newColumn];
    });
  };

  // Handle Branch (non-rightmost columns).
  const handleBranch = (finalQuestion: string, answer: string, colIndex: number) => {
    setAutoZoomEnabled(false);
    setColumns((prev) => {
      const newColumns = [...prev];
      const col = newColumns[colIndex];
      // The active board is the last board in this column.
      // Replace it: finalize it and add a new active board.
      const finalizedBoard: Board = { id: nextId.current++, finalQuestion, answer };
      const newActiveBoard: Board = { id: nextId.current++ };
      newColumns[colIndex] = [...col.slice(0, col.length - 1), finalizedBoard, newActiveBoard];
      return newColumns;
    });
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const newZoom = direction === "in" ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(newZoom, 0.2), 2);
    });
  };

  // Auto-fit zoom effect: recalculate zoom only when autoZoomEnabled is true.
  useEffect(() => {
    if (autoZoomEnabled) {
      const boardWidth = 420;
      const boardHeight = 500; // estimated height per whiteboard
      const gap = 50;
      const totalWidth = columns.length * boardWidth + (columns.length - 1) * gap;
      const columnHeights = columns.map(
        (col) => col.length * boardHeight + (col.length - 1) * gap
      );
      const totalHeight = Math.max(...columnHeights);
      const availableWidth = window.innerWidth - 32;
      const availableHeight = window.innerHeight - 32;
      const fitZoom = Math.min(availableWidth / totalWidth, availableHeight / totalHeight);
      setZoom(fitZoom < 1 ? fitZoom : 1);
      setAutoZoomEnabled(false);
    }
  }, [columns, autoZoomEnabled]);

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThlYyIgb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl p-2.5 flex items-center relative group">
                <Lightbulb className="w-6 h-6 text-white absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Lightbulb className="w-6 h-6 text-white group-hover:opacity-0 transition-opacity duration-300" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 bg-clip-text text-transparent">
                  ThinkBoard
                </span>
                <div className="text-xs text-gray-500 -mt-1">
                  AI-Powered Learning
                </div>
              </div>
            </div>
            <button className="text-gray-600 hover:text-blue-500 transition-colors">
              Load board
            </button>
            <button className="text-gray-600 hover:text-blue-500 transition-colors">
              Save board
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-500 transition-colors">
              Log in
            </button>
            <button className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Zoom Controls */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-20">
        <button
          onClick={() => handleZoom("in")}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-6 h-6 text-gray-600" />
        </button>
        <button
          onClick={() => handleZoom("out")}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Main Content – Grid of Whiteboards */}
      <div className="overflow-auto min-h-[calc(100vh-4rem)]">
      <main
        className="p-8 flex justify-start items-start mt-12 relative gap-[50px]"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "left top",
          transition: "transform 0.2s ease-out",
        }}
      >
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="relative">
            {/* Horizontal connector for the first row boards:
                For every column except the first, connect the first board's center to the previous column's first board's center.
                Here we assume the center of the top board is at 140px from the top; adjust as needed. */}
            {colIndex > 0 && column[0] && (
              <div
                className="absolute"
                style={{
                  width: "50px",
                  height: "1px",
                  backgroundColor: "#3B82F6",
                  left: "-50px",
                  top: "140px", // fixed value; adjust this so that the connector is centered on the top board
                }}
              />
            )}
            <div className="flex flex-col gap-[50px]">
              {column.map((board, rowIndex) => (
                <div key={board.id} className="relative">
                  {/* Vertical connector for boards in the same column (except the first) */}
                  {rowIndex > 0 && (
                    <div
                      className="absolute"
                      style={{
                        width: "1px",
                        height: "50px",
                        backgroundColor: "#3B82F6",
                        top: "-50px",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    />
                  )}
                  <Whiteboard
                    id={board.id}
                    onAsk={handleAsk}
                    onBranch={(finalQ, ans) => handleBranch(finalQ, ans, colIndex)}
                    showAsk={colIndex === columns.length - 1 && rowIndex === column.length - 1}
                    showBranch={!(colIndex === columns.length - 1 && rowIndex === column.length - 1)}
                    finalQuestion={board.finalQuestion}
                    answer={board.answer}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
      </div>
    </div>
  );
}
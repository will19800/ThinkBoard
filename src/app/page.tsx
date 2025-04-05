"use client";

import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Lightbulb } from "lucide-react";

// -------------------------------------------------------------------
// Board Data Model
// Each board may store a finalized question and answer.
interface Board {
  id: number;
  finalQuestion?: string;
  answer?: string;
}

// -------------------------------------------------------------------
// Whiteboard Component Props
interface WhiteboardProps {
  id: number;
  showAsk: boolean;
  showBranch: boolean;
  // Callbacks: both receive the finalized question and answer from GPT.
  onAsk: (finalQuestion: string, answer: string) => void;
  onBranch: (finalQuestion: string, answer: string) => void;
  // If provided, this board is inactive and displays finalized data.
  finalQuestion?: string;
  answer?: string;
}

// -------------------------------------------------------------------
// Whiteboard Component
// For active boards, we call the GPT API to fetch an answer.
// For inactive boards (where finalQuestion is set), we simply display the Q&A.
function Whiteboard({
  id,
  showAsk,
  showBranch,
  onAsk,
  onBranch,
  finalQuestion,
  answer,
}: WhiteboardProps) {
  // For active boards, maintain input state and conversation history.
  const [userInput, setUserInput] = useState("");
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  
  // Context for GPT prompt (unchanged from your provided backend code).
  const context =
    "You are a warm, encouraging STEM tutor for middle school students, helping them understand science, technology, engineering, and math through a whiteboard app that supports branching conversations. If the student asks a general, conceptual, or exploratory question (like “What is electricity?”), respond with three labeled branches (e.g., Theory, Real-life Example, What-if Scenario) with a brief summary to spark curiosity, and ask “Which branch would you like to explore?” without going into detail until the student chooses. Make sure to take into account the context. If the student asks a specific or problem-solving question (like “How do I solve this equation?”), provide one clear, step-by-step explanation using simple language, real-world examples, checks for understanding, and positive encouragement to build confidence. Don’t ask “Which branch would you like to explore?,” instead ask a guiding question related to your response that provokes insight. Throughout all interactions, keep a friendly, supportive tone, use short headers when offering branches, treat each selected branch as its own context, and never mix general and specific response styles in the same reply. Make sure to take into account the context.";
  
  // Utility: join the conversation history.
  // const getConversationHistoryString = () => conversationHistory.join(" ");

  // Handle input changes.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  // For active boards, on form submission, call the GPT backend.
  const handleSubmitWithGPT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === "") return;

    // Update conversation history.
    const newHistory = [...conversationHistory, userInput];
    setConversationHistory(newHistory);
    const conversationHistoryString = newHistory.join(" ");
    
    // Build the prompt.
    const prompt =
      context +
      "\n\nThis is all the previous context from your lesson with this student:\n\n" +
      conversationHistoryString +
      "\n\nThis is the question the student is asking now: " +
      userInput;
    
    const currentQuestion = userInput;
    setUserInput("");
    console.log(prompt);

    try {
      const response = await fetch("http://localhost:3001/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      const aiAnswer = data.reply;
      
      // Depending on which button is active, call the corresponding callback.
      if (showAsk) {
        onAsk(currentQuestion, aiAnswer);
      } else if (showBranch) {
        onBranch(currentQuestion, aiAnswer);
      }
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      if (showAsk) {
        onAsk(currentQuestion, "Something went wrong. Please try again later.");
      } else if (showBranch) {
        onBranch(currentQuestion, "Something went wrong. Please try again later.");
      }
    }
  };

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

  // Otherwise, render an active board with an input form.
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-[420px] border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        What do you want to learn today?
      </h2>
      <form onSubmit={handleSubmitWithGPT}>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
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

// -------------------------------------------------------------------
// Home Component
// The grid is represented as an array of columns, where each column is an array of boards.
// The active board in each column is the bottom-most one.
// For the rightmost column, the active board uses Ask; for others, Branch.
export default function Home() {
  const [zoom, setZoom] = useState(1);
  // Grid: an array of columns, each column is an array of Board objects.
  const [columns, setColumns] = useState<Board[][]>([[{ id: 1 }]]);
  const nextId = useRef(2);
  // Control auto-zoom recalculation (only triggered by Ask actions).
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);

  // Handle Ask (rightmost column).
  // This finalizes the active board's Q&A, inserts an inactive board above it in the same column, and adds a new column.
  const handleAsk = (finalQuestion: string, answer: string) => {
    setAutoZoomEnabled(true);
    setColumns((prev) => {
      const lastColIndex = prev.length - 1;
      const lastCol = prev[lastColIndex];
      // Replace the active board (last board) with two boards:
      // - The finalized board (inactive) that shows the Q&A.
      // - A new active board (empty) for further input.
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
  // This finalizes the active board's Q&A and inserts a new inactive board above it in the same column.
  const handleBranch = (finalQuestion: string, answer: string, colIndex: number) => {
    setAutoZoomEnabled(false);
    setColumns((prev) => {
      const newColumns = [...prev];
      const col = newColumns[colIndex];
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

  // Auto-fit zoom recalculation only when autoZoomEnabled is true (i.e. when Ask is pressed).
  useEffect(() => {
    if (autoZoomEnabled) {
      const boardWidth = 420;
      const boardHeight = 500;
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
                <div className="text-xs text-gray-500 -mt-1">AI-Powered Learning</div>
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
            <div key={colIndex} className="flex flex-col gap-[50px]">
              {column.map((board, rowIndex) => {
                // The active board is the last board in each column.
                const isActive = rowIndex === column.length - 1;
                // For the rightmost column, the active board uses Ask.
                const showAsk = colIndex === columns.length - 1 && isActive;
                // For all other columns, the active board uses Branch.
                const showBranch = isActive && !(colIndex === columns.length - 1 && isActive);
                return (
                  <div key={board.id}>
                    <Whiteboard
                      id={board.id}
                      finalQuestion={board.finalQuestion}
                      answer={board.answer}
                      showAsk={showAsk}
                      showBranch={showBranch}
                      onAsk={handleAsk}
                      onBranch={(finalQ, ans) => handleBranch(finalQ, ans, colIndex)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
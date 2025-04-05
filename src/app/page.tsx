"use client";

import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Lightbulb } from "lucide-react";
import { useRouter } from 'next/navigation'

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
  // Add selectedTutor prop
  selectedTutor: string;
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
  selectedTutor,
}: WhiteboardProps) {
  // For active boards, maintain input state and conversation history.
  const [userInput, setUserInput] = useState("");
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  

  const getContext = () => {
    switch(selectedTutor) {
      case 'elementary':
        return "You are a warm, encouraging STEM tutor for elementary school students, helping them understand science, technology, engineering, and math through a whiteboard app that supports branching conversations. Don't use technical terms. Make it very simplistic and natural for a kid. Explain concepts in a way that children aged 5-10 can understand. If the student asks a general, conceptual, or exploratory question (like `What is electricity?`), respond with three labeled branches with a brief summary to spark curiosity. Ask 'Which branch would you like to explore?' without going into detail until the student chooses. If the student asks a specific or problem-solving question (like 'How do I solve this equation?'), provide one clear, step-by-step explanation using simple language, real-world examples, and positive encouragement to build confidence. Don't ask 'Which branch would you like to explore?' Instead, ask a guiding question that helps the student gain insight. Keep a friendly, supportive tone throughout, and use short headers when offering branches. Treat each selected branch as its own context and avoid mixing general and specific response styles.";
      case 'high':
        return "You are a warm, encouraging STEM tutor for high school students, helping them understand science, technology, engineering, and math through a whiteboard app that supports branching conversations. Explain concepts in a way that students aged 14-18 can understand. If the student asks a general, conceptual, or exploratory question (like `What is electricity?`), respond with three labeled branches with a brief summary to spark curiosity. Ask 'Which branch would you like to explore?' without going into detail until the student chooses. If the student asks a specific or problem-solving question (like 'How do I solve this equation?'), provide one clear, step-by-step explanation using simple language, real-world examples, and positive encouragement to build confidence. Don't ask 'Which branch would you like to explore?' Instead, ask a guiding question that helps the student gain insight. Keep a friendly, supportive tone throughout, and use short headers when offering branches. Treat each selected branch as its own context and avoid mixing general and specific response styles.";
      case 'college':
        return "You are a warm, encouraging STEM tutor for college, master's, and PhD students, helping them understand science, technology, engineering, and math through a whiteboard app that supports branching conversations. Explain concepts in a way that advanced students can understand, making it in-depth. If the student asks a general, conceptual, or exploratory question (like `What is electricity?`), respond with three labeled branches with a brief summary to spark curiosity. Ask 'Which branch would you like to explore?' without going into detail until the student chooses. If the student asks a specific or problem-solving question (like 'How do I solve this equation?'), provide one clear, step-by-step explanation with real-world examples and positive encouragement to build confidence. Don't ask 'Which branch would you like to explore?' Instead, ask a guiding question that provokes insight. Maintain a friendly, supportive tone and use short headers when offering branches. Treat each selected branch as its own context, and never mix general and specific response styles.";
      case 'middle':
      default:
        return "You are a warm, encouraging STEM tutor for middle school students, helping them understand science, technology, engineering, and math through a whiteboard app that supports branching conversations. Explain concepts in a way that students aged 10-14 can understand. If the student asks a general, conceptual, or exploratory question (like `What is electricity?`), respond with three labeled branches with a brief summary to spark curiosity. Ask 'Which branch would you like to explore?' without going into detail until the student chooses. If the student asks a specific or problem-solving question (like 'How do I solve this equation?'), provide one clear, step-by-step explanation with real-world examples and positive encouragement to build confidence. Don't ask 'Which branch would you like to explore?' Instead, ask a guiding question that helps the student gain insight. Keep a friendly, supportive tone, and use short headers when offering branches. Treat each selected branch as its own context and avoid mixing general and specific response styles.";
    }
  };

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
    
    // Get the appropriate context based on the selected tutor
    const contextPrompt = getContext();
    
    // Build the prompt.
    const prompt =
      contextPrompt +
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
      <div className="flex-col">
          <img
            src="/alpaca.png"
            alt="Custom"
            className="ml-auto"
            height="70"
            width="70"
          />
        <div className="bg-white relative rounded-xl shadow-lg p-8 w-[420px] min-h-[280px] border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-black">{finalQuestion}</h2>
          <div>
            <span className="text-gray-600">
              {answer || "(info about the topic that the user requested)"}
            </span>
          </div>
          {/* Custom image in bottom right. Change the src to your custom image URL */}
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
  const router = useRouter();
  const [zoom, setZoom] = useState(1);
  // Grid: an array of columns, each column is an array of Board objects.
  const [columns, setColumns] = useState<Board[][]>([[{ id: 1 }]]);
  const nextId = useRef(2);
  // Control auto-zoom recalculation (only triggered by Ask actions).
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);

  // Handle Tutor chosen
  const [selectedTutor, setSelectedTutor] = useState('middle'); // Default to middle school
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Fixed tutorOptions array with proper ID to label mapping
  const tutorOptions = [
    { id: 'elementary', label: 'Elementary School' },
    { id: 'middle', label: 'Middle School' },
    { id: 'high', label: 'High School' },
    { id: 'college', label: 'College' }
  ];
  
  // Simplified handler that just uses the ID
  const handleTutorSelect = (id: React.SetStateAction<string>) => {
    setSelectedTutor(id);
    setDropdownOpen(false);
  };

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
            
            {/* Dropdown Navigation */}
            <div className="relative">
              <button 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>
                  {selectedTutor ? tutorOptions.find(option => option.id === selectedTutor)?.label : 'Select Tutor'}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100">
                  {tutorOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedTutor === option.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      onClick={() => handleTutorSelect(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button className="text-gray-600 hover:text-blue-500 transition-colors" onClick={() => router.push('/gallery')}> 
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
                      selectedTutor={selectedTutor}
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
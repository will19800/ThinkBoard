"use client";

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Lightbulb } from 'lucide-react';

interface WhiteboardProps {
  id: number;
  onAsk: (question: string, answer: string) => void;
  initialQuestion?: string;
  initialAnswer?: string;
}

function Whiteboard({ id, onAsk, initialQuestion, initialAnswer }: WhiteboardProps) {
  const [userInput, setUserInput] = useState('');
  const [answer, setAnswer] = useState(initialAnswer || '');
  const [conversationHistories, setConversationHistories] = useState<string[][]>([[]]);
  
  const context: string =
  "You are a warm, encouraging STEM tutor for middle school students, helping them understand science, technology, engineering, and math through a whiteboard app that supports branching conversations. If the student asks a general, conceptual, or exploratory question (like “What is electricity?”), respond with three labeled branches (e.g., Theory, Real-life Example, What-if Scenario) with a brief summary to spark curiosity, and ask “Which branch would you like to explore?” without going into detail until the student chooses. Make sure to take into account the context. If the student asks a specific or problem-solving question (like “How do I solve this equation?”), provide one clear, step-by-step explanation using simple language, real-world examples, checks for understanding, and positive encouragement to build confidence. Don’t ask “Which branch would you like to explore?,” instead ask a guiding question related to your response that provokes insight.  Throughout all interactions, keep a friendly, supportive tone, use short headers when offering branches, treat each selected branch as its own context, and never mix general and specific response styles in the same reply. Make sure to take into account the context.";

  const getConversationHistoryString = (history: string[]): string => {
    return history.join(" ");
  };

  const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setUserInput(e.target.value);
  };

  const handleSubmitWithGPT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '') return;
  
    const newHistories = [...conversationHistories];

    // Ensure the selected branch (id) exists, otherwise initialize it
    if (!newHistories[id]) {
      newHistories[id] = [];
    }

    newHistories[id].push(userInput);
    setConversationHistories(newHistories);
  
    const conversationHistoryString = getConversationHistoryString(newHistories[id]);
    const prompt =
      context +
      "\n\nThis is all the previous context from your lesson with this student\n\n" +
      conversationHistoryString +
      "\n\nThis is the question the student is asking now: " +
      userInput;
    
    const currentQuestion = userInput;
    setUserInput('');
  
    try {
      const response = await fetch('http://localhost:3001/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
  
      const data = await response.json();
      const aiAnswer = data.reply;

      console.log(aiAnswer)
      
      // Pass the question and answer to the parent component to create a new whiteboard
      onAsk(currentQuestion, aiAnswer);
      
    } catch (error) {
      console.error('Error fetching response:', error);
      onAsk(currentQuestion, 'Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 w-[420px] border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {initialQuestion || "What do you want to learn today?"}
        </h2>
        <form onSubmit={handleSubmitWithGPT}>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Ask a Question"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
          />
          <button
            type="submit"
            className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-colors font-medium"
          >
            Ask
          </button>
        </form>
      </div>

      {/* Answer Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 w-[420px] min-h-[280px] border border-gray-100">
        <p className="text-gray-600">
          {answer || "(info about the topic that the user requested)"}
        </p>
      </div>
    </div>
  );
}

// Define a proper interface for the board items
interface BoardItem {
  id: number;
  question?: string;
  answer?: string;
}

export default function Home() {
  const [zoom, setZoom] = useState(1);
  // Start with one whiteboard with no initial question or answer
  const [boards, setBoards] = useState<BoardItem[]>([{ 
    id: 1, 
    question: undefined, 
    answer: undefined 
  }]);

  // Add a new whiteboard with the provided question and answer
  const addBoard = (question: string, answer: string) => {
    const newId = boards.length ? boards[boards.length - 1].id + 1 : 1;
    setBoards((prev) => [...prev, { 
      id: newId, 
      question: question, 
      answer: answer 
    }]);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) => {
      const newZoom = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(newZoom, 0.5), 2); // Limit zoom between 0.5x and 2x
    });
  };

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
          onClick={() => handleZoom('in')}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-6 h-6 text-gray-600" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Main Content - Render all whiteboards side by side */}
      <div className="overflow-auto min-h-[calc(100vh-4rem)]">
        <main
          className="max-w-7xl mx-auto p-8 flex items-center mt-12 relative min-h-[calc(100vh-8rem)] gap-[50px]"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center top',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {boards.map((board, index) => (
            <div key={board.id} className="relative">
              {/* Render a connector for boards after the first */}
              {index > 0 && (
                <div
                  className="absolute"
                  style={{
                    width: '50px',
                    height: '1px',
                    backgroundColor: '#3B82F6',
                    left: `-${50}px`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
              )}
              <Whiteboard 
                id={board.id} 
                onAsk={addBoard} 
                initialQuestion={board.question} 
                initialAnswer={board.answer}
              />
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Lightbulb } from 'lucide-react';

interface WhiteboardProps {
  id: number;
  onAsk: () => void;
}

function Whiteboard({ id, onAsk }: WhiteboardProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate a response with placeholder text
    setAnswer(`Placeholder answer for board ${id}`);
    // Create a new whiteboard (only the first board shows the Ask button)
    onAsk();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Question Card */}
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

export default function Home() {
  const [zoom, setZoom] = useState(1);
  // Start with one whiteboard
  const [boards, setBoards] = useState([{ id: 1 }]);

  // Function to add a new whiteboard
  const addBoard = () => {
    const newId = boards.length ? boards[boards.length - 1].id + 1 : 1;
    setBoards((prev) => [...prev, { id: newId }]);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) => {
      const newZoom = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(newZoom, 0.2), 2); // Allow manual zoom between 0.2x and 2x
    });
  };

  // Auto-fit effect: recalculate zoom to ensure the entire chain fits
  useEffect(() => {
    const boardWidth = 420;
    const gap = 50;
    const chainWidth = boards.length * boardWidth + (boards.length - 1) * gap;
    const availableWidth = window.innerWidth - 32; // subtract some margin
    const fitZoom = availableWidth / chainWidth;
    // If the chain fits at 1x, use 1; otherwise, use the fitZoom value.
    if (fitZoom < 1) {
      setZoom(fitZoom);
    } else {
      setZoom(1);
    }
  }, [boards]);

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

      {/* Main Content - Render whiteboards side by side with connectors */}
      <div className="overflow-auto min-h-[calc(100vh-4rem)]">
        <main
          className="max-w-7xl mx-auto p-8 flex justify-center items-center mt-12 relative min-h-[calc(100vh-8rem)] gap-[50px]"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center top',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {boards.map((board, index) => (
            <div key={board.id} className="relative">
              {/* For boards after the first, render a connector line */}
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
              <Whiteboard id={board.id} onAsk={addBoard} />
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
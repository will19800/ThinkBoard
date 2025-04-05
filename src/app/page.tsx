"use client";

"use client";

import React, { SetStateAction, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Lightbulb } from 'lucide-react';

interface WhiteboardProps {
  id: number;
  onAsk: () => void;
}

function Whiteboard({ id, onAsk }: WhiteboardProps) {
  const [userInput, setUserInput] = useState('');
  const [answer, setAnswer] = useState('');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]); // List to track conversation

  // Start of every Chat GPT message
  const context : String = "You are a warm, encouraging STEM tutor for middle school students, helping them understand science, technology, engineering, and math through a whiteboard app that supports branching conversations. If the student asks a general, conceptual, or exploratory question (like “What is electricity?”), respond with three clearly labeled branches (e.g., Theory, Real-life Example, What-if Scenario), each as a brief summary to spark curiosity, and ask “Which branch would you like to explore?” without going into detail until the student chooses. Make sure to take into account the context. If the student asks a specific or problem-solving question (like “How do I solve this equation?”), provide one clear, step-by-step explanation using simple language, real-world examples, checks for understanding, and positive encouragement to build confidence. Don’t ask “Which branch would you like to explore?,” instead ask a guidiing question related to your response that provokes insight.  Throughout all interactions, keep a friendly, supportive tone, use short headers when offering branches, treat each selected branch as its own context, and never mix general and specific response styles in the same reply. Make sure to take into account the context. "

  const getConversationHistoryString = (): string => {
    return conversationHistory.join(" "); // Joins the conversation history with a space between each message
  };

    // Handle user input change
    const handleInputChange = (e: { target: { value: SetStateAction<string>; }; }) => {
      setUserInput(e.target.value);
      // setConversationHistory([])
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '') return;

    // Append the user's input to the conversation history as a string
    const newConversation = [...conversationHistory, userInput];

    setConversationHistory(newConversation);

    console.log(conversationHistory)

    // Concatenate conversation history into one string
    const conversationHistoryString = getConversationHistoryString();
    const question = userInput

    const prompt: string = context + 
    "\n\n" +  // Adds a line break between context and the next part
    "This is all the previous context from your lesson with this student" + 
    "\n\n" +  // Adds a line break before conversation history
    conversationHistoryString + 
    "\n\n" +  // Adds a line break before user input
    "This is the question the student is asking now: "  + question
    question;

    console.log(prompt)

    // Clear the input box after submission
    setUserInput('');

    try {
      const response = await fetch('http://localhost:3001/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      const data = await response.json();
      setAnswer(data.reply); 
      console.log(answer)
    } catch (error) {
      console.error('Error fetching response:', error);
      setAnswer('Something went wrong. Please try again later.');
    }

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
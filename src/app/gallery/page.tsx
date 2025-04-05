"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCategory {
  title: string;
  description: string;
  images: string[];
}

const categories: ImageCategory[] = [
  {
    title: "🧠 Saved",
    description: "Collection of whiteboards from past learning sessions.",
    images: [
      "Example1.png",
      "Example2.png",
      "Example3.png",
      "Example1.png",
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=500&h=400&fit=crop"
    ]
  },
  {
    title: "🕒 Recent",
    description: "Whiteboards you accessed or created most recently for quick reference.",
    images: [
      "Example3.png",
      "Example2.png",
      "Example1.png",
      "Example1.png",
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=500&h=400&fit=crop"
    ]
  },
  {
    title: "🌐 Public",
    description: "Browse whiteboards shared by other users and explore diverse learning topics.",
    images: [
      "Example2.png",
      "Example1.png",
      "Example3.png",
      "Example2.png",
      "https://images.unsplash.com/photo-1636466498184-d1c5276c9e85?w=500&h=400&fit=crop"
    ]
  },
  {
    title: "⭐ Suggested for You",
    description: "Whiteboards recommended based on your recent activity and interests.",
    images: [
      "Example1.png",
      "Example2.png",
      "Example1.png",
      "Example2.png",
      "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=500&h=400&fit=crop"
    ]
  },
  {
    title: "📈 Trending",
    description: "Popular whiteboards that are currently being viewed or saved the most.",
    images: [
      "Example2.png",
      "Example1.png",
      "Example3.png",
      "Example1.png",
      "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=500&h=400&fit=crop"
    ]
  }
];

function Gallery({ router }: { router: ReturnType<typeof useRouter> }) {
  const scroll = (direction: 'left' | 'right', categoryIndex: number) => {
    const container = document.getElementById(`scroll-container-${categoryIndex}`);
    if (container) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThlYyIgb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-white pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2" />
          Back to Home
          </button>

        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Whiteboard Gallery</h1>
        
        <div className="space-y-16">
          {categories.map((category, index) => (
            <div key={index} className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">{category.title}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
              <div className="relative group">
                <button 
                  onClick={() => scroll('left', index)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div
                  id={`scroll-container-${index}`}
                  className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide scroll-smooth"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {category.images.map((image, imageIndex) => (
                    <div 
                      key={imageIndex}
                      className="flex-none w-[400px] overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105 bg-white"
                    >
                      <img
                        src={image}
                        alt={`${category.title} whiteboard ${imageIndex + 1}`}
                        className="w-full h-64 object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => scroll('right', index)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const router = useRouter();

  return <Gallery router={router} />;
}
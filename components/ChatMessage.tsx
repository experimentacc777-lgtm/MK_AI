
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { downloadImage } from '../services/imageService';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-6 px-2 md:px-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[90%] md:max-w-[80%] flex gap-3 ${!isModel && 'flex-row-reverse'}`}>
        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
          isModel ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-200'
        }`}>
          {isModel ? 'AI' : 'U'}
        </div>
        
        <div className={`flex flex-col gap-2 ${!isModel && 'items-end'}`}>
          <div className={`rounded-2xl px-4 py-3 shadow-sm ${
            isModel 
              ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' 
              : 'bg-blue-600 text-white'
          }`}>
            {message.imageUrl && (
              <div className="relative group mb-2">
                <img 
                  src={message.imageUrl} 
                  alt="Generated" 
                  className="rounded-xl max-w-full h-auto border border-zinc-700/50"
                />
                <button 
                  onClick={() => downloadImage(message.imageUrl!)}
                  className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save to device
                </button>
              </div>
            )}
            
            {message.text && (
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {message.text}
              </div>
            )}

            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">Sources Found</p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors border border-zinc-700"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-[10px] text-zinc-600 px-1 font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

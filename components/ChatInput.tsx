
import React, { useState, useRef } from 'react';
import { fileToBase64 } from '../services/imageService';

interface ChatInputProps {
  onSendMessage: (text: string, imageUri?: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!text.trim() && !preview) || isLoading) return;
    onSendMessage(text, preview || undefined);
    setText('');
    setPreview(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPreview(base64);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800">
      <div className="max-w-4xl mx-auto relative">
        {preview && (
          <div className="mb-3 relative inline-block animate-in zoom-in duration-200">
            <img 
              src={preview} 
              alt="Preview" 
              className="h-24 w-auto rounded-xl border border-zinc-700 shadow-xl" 
            />
            <button 
              onClick={() => setPreview(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-1 p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all border border-zinc-700 shadow-lg group"
            title="Upload image or take photo"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything or request an image..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none max-h-48 custom-scrollbar text-sm md:text-base pr-12 transition-all"
              rows={1}
              style={{ minHeight: '52px' }}
            />
            <button 
              type="submit"
              disabled={isLoading || (!text.trim() && !preview)}
              className={`absolute right-2 bottom-2 p-2.5 rounded-xl transition-all ${
                isLoading || (!text.trim() && !preview)
                  ? 'text-zinc-600 bg-transparent' 
                  : 'text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 scale-100 active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;

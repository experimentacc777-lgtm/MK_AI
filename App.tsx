
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Auth from './components/Auth';
import { User, ChatSession, ChatMessage as ChatMessageType } from './types';
import { detectIntent, processUserRequest } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load state from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('mk_user');
    const savedSessions = localStorage.getItem('mk_sessions');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    }
  }, []);

  // Sync sessions to storage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('mk_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, isLoading]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('mk_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mk_user');
    // We keep sessions in local storage for guests too, as per requirements
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id && filtered.length > 0) {
      setCurrentSessionId(filtered[0].id);
    } else if (filtered.length === 0) {
      setCurrentSessionId('');
    }
  };

  const onSendMessage = async (text: string, imageUri?: string) => {
    let activeSessionId = currentSessionId;
    
    // If no session exists, create one
    if (!activeSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: text.slice(0, 30) || 'Image Search',
        messages: [],
        updatedAt: Date.now()
      };
      setSessions([newSession, ...sessions]);
      activeSessionId = newSession.id;
      setCurrentSessionId(activeSessionId);
    }

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      imageUrl: imageUri,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { 
            ...s, 
            messages: [...s.messages, userMsg],
            title: s.messages.length === 0 ? (text.slice(0, 30) || 'Image Query') : s.title,
            updatedAt: Date.now() 
          } 
        : s
    ));

    setIsLoading(true);

    try {
      const intent = await detectIntent(text, !!imageUri);
      const result = await processUserRequest(text, intent, imageUri);

      const aiMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        imageUrl: result.imageUrl,
        sources: result.sources,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, aiMsg], updatedAt: Date.now() } 
          : s
      ));
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, errorMsg] } 
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#0b0b0b] text-zinc-100 overflow-hidden">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto px-2 md:px-0 py-4 custom-scrollbar">
          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            {currentSession && currentSession.messages.length > 0 ? (
              currentSession.messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/30">
                  <span className="text-2xl font-black italic">MK</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 tracking-tight">How can I help you today?</h2>
                <p className="text-zinc-500 max-w-sm text-sm leading-relaxed">
                  I can generate stunning images, perform deep research, analyze photos, or just chat.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "Generate a futuristic city at night",
                    "Deep research on quantum computing",
                    "Analyze latest news on AI",
                    "Who created this app?"
                  ].map((tip, idx) => (
                    <button 
                      key={idx}
                      onClick={() => onSendMessage(tip)}
                      className="p-4 text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-xs text-zinc-400 transition-all hover:border-zinc-700"
                    >
                      {tip}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start mb-6 px-4">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-zinc-500 text-sm animate-pulse">
                     Thinking...
                   </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;

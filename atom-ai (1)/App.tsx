import React, { useState, useEffect, useRef } from 'react';
import { Menu, PanelLeft } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import CameraModal from './components/CameraModal';
import InstallGuide from './components/InstallGuide';
import { generateResponse, speakText } from './services/geminiService';
import { Message, Role, AppMode, AppSettings, Attachment } from './types';
import { DEFAULT_SYSTEM_INSTRUCTION, MODE_CONFIG } from './constants';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Hi! I'm Atom. I'm connected to the web and your location. How can I help you study or explore today?",
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.GENERAL);
  const [settings, setSettings] = useState<AppSettings>({
    useTTS: false,
    themeColor: 'cyan',
    userName: 'Student',
    voice: 'Zephyr'
  });
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    
    // Check for API Key presence
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (error) => console.log("Location access denied:", error)
      );
    }

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text, attachments, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const modePrompt = MODE_CONFIG[mode].prompt;
      const combinedSystemPrompt = `${DEFAULT_SYSTEM_INSTRUCTION}\n\nCURRENT MODE: ${modePrompt}\n\nNote: You have access to Google Search and Google Maps.`;

      const response = await generateResponse(text, attachments, combinedSystemPrompt, userLocation);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: response.text,
        webSources: response.webSources,
        mapSources: response.mapSources,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

      if (settings.useTTS) speakText(response.text, settings.voice);

    } catch (error: any) {
      console.error(error);
      const errorText = error?.message?.includes('API Key') 
        ? "API Key is missing. Please add it in your Vercel Project Settings." 
        : "I encountered an error connecting to my neural core. Please try again.";
        
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: errorText,
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCapture = (base64Data: string) => {
    handleSendMessage("Analyze this visual data and explain what you see.", [{
      data: base64Data,
      mimeType: 'image/png',
      name: 'Vision Capture'
    }]);
  };

  const handleLocatorClick = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    if (!userLocation) {
      alert("Location permission needed for Locator.");
      return;
    }
    handleSendMessage("Find interesting places near me right now using Maps.", []);
  };

  const handleInstallClick = async () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstallPrompt(null);
    } else {
      setIsInstallGuideOpen(true);
    }
  };

  const getThemeColorClass = () => {
    switch(settings.themeColor) {
      case 'purple': return 'text-purple-500';
      case 'emerald': return 'text-emerald-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-atom-500';
    }
  };

  const getBgThemeClass = () => {
    switch(settings.themeColor) {
      case 'purple': return 'bg-purple-500';
      case 'emerald': return 'bg-emerald-500';
      case 'rose': return 'bg-rose-500';
      default: return 'bg-atom-500';
    }
  };

  if (apiKeyMissing) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg text-white p-6">
        <div className="max-w-md text-center space-y-4 border border-red-500/30 p-8 rounded-2xl bg-dark-surface shadow-2xl">
          <h1 className="text-2xl font-bold text-red-400">Setup Required</h1>
          <p className="text-gray-300">Atom AI needs a brain (API Key) to function.</p>
          <div className="bg-black/30 p-4 rounded text-left text-sm text-gray-400 font-mono border border-white/5">
            1. Go to Vercel Dashboard<br/>
            2. Settings &gt; Environment Variables<br/>
            3. Add key: <span className="text-white">API_KEY</span><br/>
            4. Add value: (Your Google API Key)
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.location.reload()} className="flex-1 py-2 bg-atom-600 rounded-lg hover:bg-atom-500 transition-colors font-semibold">
              I added it, Refresh
            </button>
             <button 
              onClick={() => setIsInstallGuideOpen(true)} 
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Where do I get a Key?
            </button>
          </div>
        </div>
        <InstallGuide isOpen={isInstallGuideOpen} onClose={() => setIsInstallGuideOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-bg text-white overflow-hidden font-sans">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentMode={mode}
        onModeChange={(m) => { setMode(m); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
        settings={settings}
        onSettingsChange={setSettings}
        onClearHistory={() => setMessages([])}
        onLocatorClick={handleLocatorClick}
        onCameraClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); setIsCameraOpen(true); }}
        onInstallClick={handleInstallClick} 
      />

      <main className={`flex-1 flex flex-col h-full relative w-full transition-[margin] duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-72' : ''}`}>
        <header className="h-16 border-b border-dark-border flex items-center justify-between px-4 md:px-8 bg-dark-bg/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 active:scale-95 transition-all"
            >
              {isSidebarOpen ? <Menu className="w-6 h-6" /> : <PanelLeft className="w-6 h-6 text-atom-400" />}
            </button>
            <div className="flex flex-col">
              <span className="font-semibold text-white tracking-wide">{mode}</span>
              <div className="flex items-center gap-1.5">
                 <span className={`w-1.5 h-1.5 rounded-full ${getBgThemeClass()} animate-pulse`}></span>
                 <span className={`text-[10px] uppercase tracking-widest font-bold opacity-80 ${getThemeColorClass()}`}>Atom Online</span>
              </div>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] ${getThemeColorClass()} ${getBgThemeClass()}`}></div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-32 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} accentColor={settings.themeColor} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 ml-12 text-sm animate-pulse mb-8">
                <span className="opacity-70">Processing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-bg via-dark-bg to-transparent">
          <InputArea 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            onCameraClick={() => setIsCameraOpen(true)}
            accentColor={settings.themeColor}
          />
        </div>
      </main>

      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        currentVoice={settings.voice}
      />
      <InstallGuide isOpen={isInstallGuideOpen} onClose={() => setIsInstallGuideOpen(false)} />
    </div>
  );
}

export default App;
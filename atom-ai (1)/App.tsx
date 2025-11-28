import React, { useState, useEffect, useRef } from 'react';
import { Menu, PanelLeft, Key, ArrowRight, ShieldCheck } from 'lucide-react';

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
  const [manualKey, setManualKey] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    
    // Check for API Key presence (Environment OR LocalStorage)
    const envKey = process.env.API_KEY;
    const localKey = localStorage.getItem('ATOM_API_KEY');
    
    if (!envKey && !localKey) {
      setApiKeyMissing(true);
    } else {
      setApiKeyMissing(false);
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
        ? "API Key is missing or invalid. Please check your settings." 
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

  const saveManualKey = () => {
    if (manualKey.trim().length > 10) {
      localStorage.setItem('ATOM_API_KEY', manualKey.trim());
      setApiKeyMissing(false);
      window.location.reload(); // Reload to initialize client with new key
    } else {
      alert("Please enter a valid API Key (starts with AIza...)");
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
        <div className="max-w-md w-full text-center space-y-6 border border-atom-500/30 p-8 rounded-3xl bg-dark-surface shadow-[0_0_50px_rgba(14,165,233,0.1)] relative overflow-hidden">
          
          {/* Futuristic Background Element */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-atom-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-atom-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-atom-500/30">
              <Key className="w-8 h-8 text-atom-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-tight">Initialize Atom AI</h1>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              To activate the neural core, please enter your Google Gemini API Key below.
            </p>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <input 
                  type="password" 
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  placeholder="Paste Key here (AIza...)" 
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:border-atom-500 focus:outline-none focus:ring-1 focus:ring-atom-500 transition-all font-mono text-sm"
                />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>

              <button 
                onClick={saveManualKey} 
                className="w-full py-4 bg-atom-600 hover:bg-atom-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-atom-500/25 flex items-center justify-center gap-2 group"
              >
                Activate System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <button 
                onClick={() => setIsInstallGuideOpen(true)} 
                className="text-sm text-gray-500 hover:text-atom-400 transition-colors"
              >
                I don't have a key (Get one for free)
              </button>
            </div>
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
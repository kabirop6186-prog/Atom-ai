import React, { useEffect, useState } from 'react';
import { X, Share, MoreVertical, Download, Laptop, ExternalLink, FileArchive, Smartphone, Key, CreditCard, Ban, AlertTriangle } from 'lucide-react';

interface InstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallGuide: React.FC<InstallGuideProps> = ({ isOpen, onClose }) => {
  const [isIframe, setIsIframe] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'apikey'>('install');

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch(e) { setIsIframe(true); }
  }, []);

  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-atom-500/10 p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex gap-4">
             <button 
               onClick={() => setActiveTab('install')}
               className={`text-sm font-bold tracking-wide flex items-center gap-2 pb-1 border-b-2 transition-colors ${activeTab === 'install' ? 'text-atom-400 border-atom-400' : 'text-gray-400 border-transparent hover:text-white'}`}
             >
               <Smartphone className="w-4 h-4" /> INSTALL APP
             </button>
             <button 
               onClick={() => setActiveTab('apikey')}
               className={`text-sm font-bold tracking-wide flex items-center gap-2 pb-1 border-b-2 transition-colors ${activeTab === 'apikey' ? 'text-atom-400 border-atom-400' : 'text-gray-400 border-transparent hover:text-white'}`}
             >
               <Key className="w-4 h-4" /> FREE API KEY
             </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'install' && (
            <>
              {/* ZIP File Warning */}
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex gap-3">
                 <FileArchive className="w-8 h-8 text-red-400 shrink-0" />
                 <div>
                   <h3 className="text-red-400 font-bold text-sm">Did you download a ZIP file?</h3>
                   <p className="text-xs text-gray-300 mt-1">
                     If you have a ZIP file, you clicked the <strong>Editor's Download</strong> button (Source Code). You cannot run this on your phone easily.
                     <br/><br/>
                     <span className="text-white font-bold">Please ignore the ZIP file and follow the instructions below to install the actual App.</span>
                   </p>
                 </div>
              </div>
              
              {isIframe && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 mb-4">
                  <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" /> Preview Mode Detected
                  </h3>
                  <p className="text-sm text-gray-300">
                    You are viewing Atom AI inside a preview box.
                    <br/><br/>
                    <span className="font-bold text-white">To install, you must open this page in a new browser tab first (use your editor's 'Open in New Tab' button), then follow the steps below.</span>
                  </p>
                </div>
              )}

              <p className="text-gray-300 text-sm leading-relaxed text-center">
                To install Atom AI as a standalone app, follow the steps for your device below:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Desktop Instructions */}
                <div className={`p-4 rounded-xl border ${!isMobile ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-purple-400" /> Desktop (Chrome/Edge)
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="bg-white/10 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>Look at the right side of your address bar (URL bar).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-white/10 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Click the <span className="font-bold text-purple-400">Install icon</span> <Download className="w-3 h-3 inline" /> or the computer icon.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-white/10 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <span>Click <span className="font-bold text-white">Install</span> in the popup.</span>
                    </li>
                  </ol>
                </div>

                {/* Android Instructions */}
                <div className={`p-4 rounded-xl border ${isMobile && !isIOS ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-xl">🤖</span> Android (Chrome)
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="bg-white/10 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>Tap the <MoreVertical className="w-3 h-3 inline mx-0.5" /> <span className="font-bold text-white">Three Dots</span> menu.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-white/10 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Tap <span className="font-bold text-emerald-400">Install App</span> or <span className="font-bold text-emerald-400">Add to Home Screen</span>.</span>
                    </li>
                  </ol>
                </div>

                {/* iOS Instructions */}
                <div className={`p-4 rounded-xl border md:col-span-2 ${isIOS ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-xl"></span> iPhone / iPad (Safari)
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-300 md:grid md:grid-cols-3 md:gap-4">
                    <li className="flex items-start gap-2">
                      <span className="bg-white/10 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>Tap the <Share className="w-3 h-3 inline mx-1" /> <span className="font-bold text-blue-400">Share</span> button.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-white/10 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Scroll down & tap <span className="font-bold text-white">Add to Home Screen</span>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-white/10 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <span>Tap <span className="font-bold text-blue-400">Add</span> (top right).</span>
                    </li>
                  </ol>
                </div>
              </div>
            </>
          )}

          {activeTab === 'apikey' && (
            <div className="space-y-4">
               <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-xl">
                 <h3 className="text-red-400 font-bold flex items-center gap-2 text-lg">
                   <AlertTriangle className="w-6 h-6" /> STOP! READ THIS:
                 </h3>
                 <p className="text-sm text-gray-300 mt-2 font-medium">
                   Are you looking at the <strong className="text-white">"Deploy" button in the Top Right</strong> of Google AI Studio?
                 </p>
                 <div className="mt-3 p-3 bg-black/40 rounded border border-red-500/20 text-sm">
                    <p className="text-red-300 font-bold">❌ DO NOT CLICK "DEPLOY" (Top Right)</p>
                    <p className="text-gray-400 text-xs mt-1">That button is for Vertex AI (Paid Enterprise Cloud). It WILL ask for a credit card. You cannot skip it.</p>
                 </div>
                 <div className="mt-2 p-3 bg-emerald-500/10 rounded border border-emerald-500/20 text-sm">
                    <p className="text-emerald-400 font-bold">✅ USE "GET API KEY" (Top Left)</p>
                    <p className="text-gray-400 text-xs mt-1">This is the correct button. It is 100% Free and requires NO credit card.</p>
                 </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-white font-bold">How to get the Key for FREE (No Card):</h3>
                  
                  <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-atom-600 flex items-center justify-center font-bold text-white shrink-0">1</div>
                    <div>
                      <p className="text-white font-semibold">Go to AI Studio</p>
                      <p className="text-sm text-gray-400">Visit <a href="https://aistudio.google.com" target="_blank" className="text-atom-400 underline">aistudio.google.com</a></p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-atom-600 flex items-center justify-center font-bold text-white shrink-0">2</div>
                    <div>
                      <p className="text-white font-semibold">Click "Get API Key"</p>
                      <p className="text-sm text-gray-400">Usually in the top-left sidebar.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-atom-500/30">
                    <div className="w-8 h-8 rounded-full bg-atom-600 flex items-center justify-center font-bold text-white shrink-0">3</div>
                    <div>
                      <p className="text-white font-semibold">Select "Create Key in NEW Project"</p>
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-atom-400">CRITICAL:</strong> Do NOT select an existing project if it asks for billing. 
                        Always create a <strong>New Project</strong> to get the Free Tier.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-atom-600 flex items-center justify-center font-bold text-white shrink-0">4</div>
                    <div>
                      <p className="text-white font-semibold">Copy the Code</p>
                      <p className="text-sm text-gray-400">It starts with <code>AIza...</code>. Paste this into your Vercel settings.</p>
                    </div>
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 text-center shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-atom-600 hover:bg-atom-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-atom-500/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;
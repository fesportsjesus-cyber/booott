
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Post, XConnection, LiveSignal } from './types';
import { generateXPosts, generateLiveSignals } from './services/geminiService';
import PostCard from './components/PostCard';
import { ZapIcon, RefreshIcon, XIcon, LinkIcon, UserIcon, CheckIcon, CryptoIcon, TrendingIcon } from './components/Icons';

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [activeSignalTab, setActiveSignalTab] = useState<'Following' | 'For You' | 'Crypto Alpha' | 'Trending'>('Following');
  const [searchTerm, setSearchTerm] = useState('');
  const [xConnection, setXConnection] = useState<XConnection>({ 
    username: '', 
    handle: '',
    isConnected: false, 
    lastSync: 0,
    credentials: { apiKey: '', apiSecret: '', bearerToken: '', accessToken: '', accessSecret: '' }
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'connections'>('dashboard');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  const signalIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const cooldownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const savedPosts = localStorage.getItem('x-bot-posts');
    const savedConn = localStorage.getItem('x-bot-connection');
    if (savedPosts) try { setPosts(JSON.parse(savedPosts)); } catch (e) {}
    if (savedConn) try { setXConnection(prev => ({ ...prev, ...JSON.parse(savedConn) })); } catch (e) {}
  }, []);

  const triggerCooldown = () => {
    setIsCoolingDown(true);
    setCooldownTime(30);
    setErrorStatus("API Rate Limit Hit. Cool-down active.");
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    cooldownIntervalRef.current = window.setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current!);
          setIsCoolingDown(false);
          setErrorStatus(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pollSignals = useCallback(async (isManual = false) => {
    if (isCoolingDown) return;
    setIsScanning(true);
    setErrorStatus(null);
    setCountdown(60);
    if (isManual) setLiveSignals([]); 
    
    // Use the active tab to tell the AI what to prioritize
    const newBatch = await generateLiveSignals(activeSignalTab, xConnection.isConnected ? xConnection.handle : undefined);
    setIsScanning(false);
    
    if (newBatch && newBatch.length > 0) {
      if (newBatch[0].content === 'QUOTA_EXHAUSTED') {
        triggerCooldown();
        return;
      }
      setLiveSignals(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNew = newBatch.filter((s: any) => !existingIds.has(s.id)).map((s: any) => ({
          ...s,
          timestamp: Date.now(),
          isNew: true
        }));
        return [ ...uniqueNew, ...prev ].slice(0, 50);
      });
      setTimeout(() => setLiveSignals(prev => prev.map(s => ({ ...s, isNew: false }))), 4000);
      setXConnection(prev => ({ ...prev, lastSync: Date.now() }));
    }
  }, [xConnection.handle, xConnection.isConnected, isCoolingDown, activeSignalTab]);

  useEffect(() => {
    if (activeTab === 'scanner') {
      pollSignals();
      signalIntervalRef.current = window.setInterval(pollSignals, 60000);
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 60 : prev - 1));
      }, 1000);
    } else {
      if (signalIntervalRef.current) clearInterval(signalIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
    return () => { 
      if (signalIntervalRef.current) clearInterval(signalIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [activeTab, pollSignals]);

  useEffect(() => { localStorage.setItem('x-bot-posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('x-bot-connection', JSON.stringify(xConnection)); }, [xConnection]);

  const handleConnectX = () => {
    if (!xConnection.handle.trim()) return;
    setIsConnecting(true);
    setTimeout(() => {
      setXConnection(prev => ({
        ...prev,
        username: prev.handle.charAt(0).toUpperCase() + prev.handle.slice(1),
        profileImageUrl: `https://unavatar.io/twitter/${prev.handle.toLowerCase()}`,
        isConnected: true,
        lastSync: Date.now()
      }));
      setIsConnecting(false);
      setActiveTab('scanner');
    }, 1500);
  };

  const handleGenerate = async (contentToProcess: string, source: string) => {
    if (!contentToProcess.trim() || isCoolingDown) return;
    setIsGenerating(true);
    const result = await generateXPosts(contentToProcess, source, xConnection.isConnected ? xConnection.handle : undefined);
    
    if (result === "ERROR: QUOTA_EXHAUSTED") {
      triggerCooldown();
      setIsGenerating(false);
      return;
    }

    const versions = result.split(/---VERSION: [^---]+---/).filter(v => v.trim());
    const newPosts: Post[] = versions.length > 0 
      ? versions.map(v => ({ id: Math.random().toString(36).substr(2, 9), content: v.trim(), sourceType: 'article', timestamp: Date.now(), status: 'draft' }))
      : [{ id: Math.random().toString(36).substr(2, 9), content: result, sourceType: 'thought', timestamp: Date.now(), status: 'draft' }];
    setPosts(prev => [...newPosts, ...prev]);
    setIsGenerating(false);
    setInputText('');
    setActiveTab('dashboard');
  };

  const hasAllKeys = xConnection.credentials?.apiKey && xConnection.credentials?.apiSecret && xConnection.credentials?.accessToken && xConnection.credentials?.accessSecret;
  
  const filteredSignals = liveSignals
    .filter(s => s.category === activeSignalTab)
    .filter(s => {
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      return s.content.toLowerCase().includes(lower) || 
             s.author.toLowerCase().includes(lower) || 
             s.handle.toLowerCase().includes(lower);
    });

  const filteredPosts = posts
    .sort((a,b) => b.timestamp - a.timestamp)
    .filter(p => {
      if (!searchTerm) return true;
      return p.content.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const getTabLabel = (cat: string) => {
    switch (cat) {
      case 'Crypto Alpha': return 'Memecoins & KOLs';
      case 'Trending': return 'News & Politics';
      default: return cat;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#000] text-white selection:bg-[#1d9bf0]/40">
      <aside className="w-full md:w-72 bg-[#000] border-b md:border-b-0 md:border-r border-gray-800 p-8 flex flex-col sticky top-0 md:h-screen z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]">
             <XIcon className="text-black w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter italic leading-none">GHOST</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.4em]">ALPHA HUNTER active</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'dashboard', label: 'Drafts', icon: ZapIcon },
            { id: 'scanner', label: 'Hyper-Feed', icon: RefreshIcon },
            { id: 'connections', label: 'Auth Vault', icon: LinkIcon }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#1d9bf0]/10 text-[#1d9bf0] font-black shadow-[inset_0_0_20px_rgba(29,155,240,0.05)]' : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-800/50">
          <div className="bg-[#16181c]/50 p-4 rounded-2xl border border-gray-800 flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-black ${xConnection.isConnected ? 'bg-[#1d9bf0] shadow-lg shadow-[#1d9bf0]/20' : 'bg-gray-800'}`}>
              {xConnection.isConnected && xConnection.profileImageUrl ? (
                <img src={xConnection.profileImageUrl} alt={xConnection.handle} className="w-full h-full object-cover" />
              ) : <UserIcon className="w-5 h-5 text-gray-500" />}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black truncate">{xConnection.isConnected ? xConnection.username : 'Guest'}</span>
              <span className="text-[9px] font-mono text-gray-600 truncate uppercase">
                {xConnection.isConnected ? `@${xConnection.handle}` : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-[#000] min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-[#000]/80 backdrop-blur-xl border-b border-gray-800 px-8 py-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight capitalize">{activeTab}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
                   {activeTab === 'scanner' ? 'Intelligence Dashboard' : 'Ghostwriting Engine'}
                </p>
                {activeTab === 'scanner' && (
                  <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-tighter">ULTRA-FAST NICHE SCAN</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by keyword..."
                className="w-full bg-[#16181c] border border-gray-800 rounded-full px-5 py-2.5 text-xs font-medium outline-none focus:border-[#1d9bf0] transition-all placeholder-gray-700"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {activeTab === 'scanner' && (
              <div className="flex items-center gap-4">
                <div className="text-right hidden lg:block">
                  <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Next Network Scan</p>
                  <p className="text-[10px] font-mono font-black text-[#1d9bf0]">00:{countdown.toString().padStart(2, '0')}</p>
                </div>
                <button 
                  onClick={() => pollSignals(true)}
                  disabled={isScanning || isCoolingDown}
                  className="flex items-center gap-3 px-6 py-2.5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#1d9bf0] hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-lg relative overflow-hidden"
                >
                  {isCoolingDown ? (
                    <>
                      <XIcon className="w-3 h-3 text-red-500" />
                      COOLDOWN {cooldownTime}s
                    </>
                  ) : (
                    <>
                      <RefreshIcon className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                      {isScanning ? 'HUNTING...' : 'SCAN ALPHA'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-8 w-full flex-1">
          {errorStatus && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between animate-pulse">
              <span className="text-[11px] font-black text-red-500 uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {errorStatus}
              </span>
              {isCoolingDown && (
                <span className="text-[10px] font-black text-white uppercase bg-red-500 px-3 py-1 rounded-full">
                  UNLOCKING IN {cooldownTime}S
                </span>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-12">
               <section className="bg-[#16181c] rounded-[32px] p-8 border border-gray-800 shadow-2xl relative overflow-hidden group">
                <div className="flex items-start gap-6 mb-6">
                   <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center ${xConnection.isConnected ? 'bg-[#1d9bf0]' : 'bg-gray-800'}`}>
                    {xConnection.isConnected && xConnection.profileImageUrl ? (
                      <img src={xConnection.profileImageUrl} alt={xConnection.handle} className="w-full h-full object-cover" />
                    ) : <UserIcon className="w-6 h-6 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste crypto alpha or news to rewrite..."
                      className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium resize-none placeholder-gray-800 min-h-[120px] mt-2"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      Alpha Mode: Active
                    </span>
                  </div>
                  <button
                    disabled={isGenerating || !inputText.trim() || isCoolingDown}
                    onClick={() => handleGenerate(inputText, 'Manual Signal')}
                    className="bg-white text-black hover:bg-[#1d9bf0] hover:text-white disabled:opacity-20 font-black py-4 px-12 rounded-2xl transition-all flex items-center gap-3 shadow-xl active:scale-95"
                  >
                    {isGenerating ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <ZapIcon className="w-5 h-5 fill-current" />}
                    <span>{isGenerating ? 'DECODING...' : 'REWRITE SIGNAL'}</span>
                  </button>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-8">
                {filteredPosts.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-gray-800 rounded-3xl">
                    <p className="text-gray-600 font-black uppercase tracking-widest text-[10px]">No drafts match your filter</p>
                  </div>
                ) : (
                  filteredPosts.map(post => (
                    <PostCard 
                      key={post.id} post={post} userHandle={xConnection.handle}
                      userProfileUrl={xConnection.profileImageUrl} onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))} 
                      onUpdate={up => setPosts(prev => prev.map(p => p.id === up.id ? up : p))}
                    />
                  ))
                )}
              </section>
            </div>
          )}

          {activeTab === 'scanner' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <div className="flex gap-2 p-1 bg-[#16181c] border border-gray-800 rounded-2xl w-fit overflow-x-auto no-scrollbar">
                    {['Following', 'For You', 'Crypto Alpha', 'Trending'].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => { setActiveSignalTab(cat as any); }}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSignalTab === cat ? 'bg-[#1d9bf0] text-white shadow-lg shadow-[#1d9bf0]/20' : 'text-gray-600 hover:text-gray-300'}`}
                      >
                        {getTabLabel(cat)}
                      </button>
                    ))}
                  </div>
                  <div className="text-[9px] font-black text-emerald-500/80 uppercase tracking-[0.2em] flex items-center gap-3 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {activeSignalTab === 'Following' && xConnection.isConnected ? `Syncing @${xConnection.handle}'s network` : 'Real-time network sync'}
                  </div>
               </div>

               <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar">
                 {filteredSignals.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-40 bg-[#16181c]/30 border border-gray-800 rounded-[40px] border-dashed">
                      <div className="relative mb-6">
                        {searchTerm ? (
                           <XIcon className="w-12 h-12 text-gray-700 opacity-40" />
                        ) : activeSignalTab === 'Trending' ? (
                           <TrendingIcon className="w-12 h-12 text-[#1d9bf0] opacity-40 animate-pulse" />
                        ) : (
                           <CryptoIcon className="w-12 h-12 animate-pulse text-emerald-500 opacity-40" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-2 h-2 rounded-full bg-[#1d9bf0] animate-ping" />
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
                        {searchTerm ? 'No matches found' : `Hunting ${getTabLabel(activeSignalTab)} Intelligence...`}
                      </span>
                   </div>
                 ) : (
                   filteredSignals.map(signal => (
                     <div key={signal.id} className="bg-[#16181c] border border-gray-800 rounded-3xl p-6 flex gap-6 hover:border-[#1d9bf0]/40 transition-all group shadow-xl relative overflow-hidden">
                       {signal.isThread && (
                         <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[7px] font-black px-3 py-1 uppercase tracking-widest rounded-bl-xl shadow-lg">THREAD DETECTED</div>
                       )}
                       {signal.category === 'Crypto Alpha' && (
                         <div className="absolute top-0 left-0 bg-emerald-500/10 text-emerald-500 text-[6px] font-black px-3 py-1 uppercase tracking-widest rounded-br-xl">CRYPTO ALPHA</div>
                       )}
                       {signal.category === 'Trending' && (
                         <div className="absolute top-0 left-0 bg-[#1d9bf0]/10 text-[#1d9bf0] text-[6px] font-black px-3 py-1 uppercase tracking-widest rounded-br-xl">NEWS / POLITICS</div>
                       )}
                       {signal.category === 'Following' && (
                         <div className="absolute top-0 left-0 bg-purple-500/10 text-purple-500 text-[6px] font-black px-3 py-1 uppercase tracking-widest rounded-br-xl">NETWORK PICK</div>
                       )}
                       <div className="flex-none">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-900 border border-gray-800 shadow-inner">
                             <img src={`https://unavatar.io/twitter/${signal.handle}`} alt={signal.handle} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                          </div>
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white group-hover:text-[#1d9bf0] transition-colors">{signal.author}</span>
                              <span className="text-[10px] font-mono text-gray-600 uppercase">@{signal.handle}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1.5 bg-[#1d9bf0]/20 border border-[#1d9bf0]/40 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(29,155,240,0.2)] ring-1 ring-[#1d9bf0]/30">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1d9bf0] animate-pulse" />
                                <span className="text-[10px] font-mono font-black text-white uppercase whitespace-nowrap tracking-tighter">
                                  {signal.timeLabel || 'LIVE'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className={`text-gray-300 text-[15px] leading-relaxed mb-5 font-medium ${signal.isThread ? 'border-l-2 border-[#1d9bf0]/20 pl-4' : ''}`}>
                            {signal.content}
                          </p>
                          <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
                             <div className="flex gap-4">
                                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                                  Real-Time Link
                                </span>
                                {signal.sourceUrl && (
                                  <a href={signal.sourceUrl} target="_blank" className="text-[9px] font-black text-gray-700 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                                    <LinkIcon className="w-2.5 h-2.5" />
                                    Source
                                  </a>
                                )}
                             </div>
                             <button 
                                onClick={() => handleGenerate(signal.content, `@${signal.handle}'s Signal`)}
                                disabled={isCoolingDown}
                                className="bg-[#1d9bf0]/10 hover:bg-[#1d9bf0] text-[#1d9bf0] hover:text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-[#1d9bf0]/20 flex items-center gap-2"
                              >
                                <ZapIcon className="w-3 h-3 fill-current" />
                                {signal.isThread ? 'Rewrite Thread' : 'Draft Ghost-Post'}
                              </button>
                          </div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="max-w-3xl mx-auto py-12">
               <div className="bg-[#16181c] border border-gray-800 rounded-[48px] p-12 shadow-3xl flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#1d9bf0]/30 to-transparent" />
                  
                  <div className={`w-24 h-24 rounded-[32px] mb-8 flex items-center justify-center relative ${xConnection.isConnected ? 'bg-[#1d9bf0]/10 text-[#1d9bf0]' : 'bg-gray-900 text-gray-700'} shadow-inner`}>
                    {xConnection.isConnected && xConnection.profileImageUrl ? (
                      <img src={xConnection.profileImageUrl} alt={xConnection.handle} className="w-full h-full object-cover rounded-[32px]" />
                    ) : <LinkIcon className="w-10 h-10" />}
                    
                    {hasAllKeys && (
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black rounded-full p-2 shadow-lg ring-4 ring-[#16181c]">
                         <CheckIcon className="w-4 h-4 stroke-[4px]" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-3xl font-black mb-4 tracking-tighter">Identity Authorization</h3>
                  <p className="text-gray-500 mb-10 text-sm max-w-md font-medium">
                    Store your keys to enable autonomous 24/7 alpha hunting.
                  </p>
                  
                  <div className="w-full space-y-6 text-left">
                    <div>
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">X User Handle</label>
                      <input 
                        type="text" value={xConnection.handle} onChange={e => setXConnection(prev => ({...prev, handle: e.target.value}))} 
                        placeholder="@yourhandle" className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-[#1d9bf0] transition-all font-mono" 
                      />
                    </div>

                    <div className="bg-gray-900/40 rounded-3xl border border-gray-800 p-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-gray-700" />
                           Security Secrets
                        </span>
                        <button 
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="text-[#1d9bf0] text-[10px] font-black hover:underline uppercase tracking-tighter"
                        >
                          {showAdvanced ? 'Seal' : 'Configure'}
                        </button>
                      </div>

                      {showAdvanced && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                           <input 
                            type="text" value={xConnection.credentials?.apiKey} onChange={e => setXConnection(prev => ({...prev, credentials: {...prev.credentials, apiKey: e.target.value}}))} 
                            placeholder="Consumer Key" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-mono" 
                           />
                           <input 
                            type="password" value={xConnection.credentials?.apiSecret} onChange={e => setXConnection(prev => ({...prev, credentials: {...prev.credentials, apiSecret: e.target.value}}))} 
                            placeholder="Consumer Secret" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-mono" 
                           />
                           <input 
                            type="text" value={xConnection.credentials?.accessToken} onChange={e => setXConnection(prev => ({...prev, credentials: {...prev.credentials, accessToken: e.target.value}}))} 
                            placeholder="Access Token" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-mono" 
                           />
                           <input 
                            type="password" value={xConnection.credentials?.accessSecret} onChange={e => setXConnection(prev => ({...prev, credentials: {...prev.credentials, accessSecret: e.target.value}}))} 
                            placeholder="Access Token Secret" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-mono" 
                           />
                           <input 
                            type="password" value={xConnection.credentials?.bearerToken} onChange={e => setXConnection(prev => ({...prev, credentials: {...prev.credentials, bearerToken: e.target.value}}))} 
                            placeholder="Bearer Token" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-mono" 
                           />
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleConnectX} disabled={isConnecting}
                      className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-[#1d9bf0] hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                    >
                      {isConnecting ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <CheckIcon className="w-5 h-5" />}
                      {xConnection.isConnected ? 'REFRESH BRIDGE' : 'ESTABLISH NETWORK BRIDGE'}
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

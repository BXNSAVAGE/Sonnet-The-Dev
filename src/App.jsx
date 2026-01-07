import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Zap, TrendingUp, DollarSign, Activity, Satellite, BarChart3, Brain, Target, Wallet } from 'lucide-react';

const SonnetMemecoinDeployer = () => {
  const [streamData, setStreamData] = useState([]);
  const [stats, setStats] = useState({
    tokensCreated: 849,
    coinsAnalyzed: 142059,
    trainingIterations: 4.2,
    activeMeta: null,
    creatorFees: 1240592,
    nextClaim: '04:22:18'
  });
  const [deployedCoins, setDeployedCoins] = useState([
    {
      name: 'ELONAI',
      symbol: '$ELONAI',
      address: '0x71...9A2',
      marketCap: 4200000,
      volume: 1200000,
      change: 420,
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=elonai&backgroundColor=1e40af'
    },
    {
      name: 'GPTDOG',
      symbol: '$GPTDOG',
      address: '0x3B...1C4',
      marketCap: 1800000,
      volume: 850000,
      change: 112,
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=gptdog&backgroundColor=ec4899'
    },
    {
      name: 'PEPESENT',
      symbol: '$PEPESENT',
      address: '0x9F...2D1',
      marketCap: 850000,
      volume: 210000,
      change: 88,
      image: 'https://api.dicebear.com/7.x/shapes/svg?seed=pepesent&backgroundColor=3b82f6'
    }
  ]);
  
  const logsEndRef = useRef(null);

  const sampleStreamData = [
    { symbol: '$PEPEAI', action: 'MINT', chain: 'Solana', time: '10:42:05' },
    { symbol: '$GROK2', action: 'LIQ', chain: 'Base', time: '10:42:04' },
    { symbol: '$DOGE', action: 'WHALE', chain: 'Eth', time: '10:42:03', amount: '50 ETH' },
    { symbol: '$SAFE', action: 'MINT', chain: 'BSC', time: '10:42:02' },
    { symbol: '$MOON', action: 'BURN', chain: 'Eth', time: '10:42:01' },
    { symbol: '$CATGPT', action: 'MINT', chain: 'Solana', time: '10:41:59' },
    { symbol: '$ELON', action: 'SWAP', chain: 'Base', time: '10:41:58' },
    { symbol: '$PEPE', action: 'SWAP', chain: 'Eth', time: '10:41:55' },
    { symbol: '$WIF', action: 'SELL', chain: 'Solana', time: '10:41:52' }
  ];

  const fetchStreamData = async () => {
    try {
      const response = await fetch('/api/stream');
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setStreamData(data);
        setStats(prev => ({ ...prev, coinsAnalyzed: prev.coinsAnalyzed + data.length }));
      }
    } catch (error) {
      console.error('Stream fetch error:', error);
    }
  };

  useEffect(() => {
    setStreamData(sampleStreamData);
    
    setTimeout(() => {
      setStats(prev => ({ 
        ...prev, 
        activeMeta: {
          theme: 'DOG + AI',
          confidence: 94,
          keywords: ['cyber', 'bark', 'neural']
        }
      }));
    }, 1000);

    const streamInterval = setInterval(fetchStreamData, 8000);

    const timerInterval = setInterval(() => {
      setStats(prev => {
        const [h, m, s] = prev.nextClaim.split(':').map(Number);
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        if (totalSeconds < 0) totalSeconds = 4 * 3600 + 22 * 60 + 18;
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return {
          ...prev,
          nextClaim: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        };
      });
    }, 1000);

    return () => {
      clearInterval(streamInterval);
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 antialiased flex flex-col h-screen overflow-hidden">
      <header className="h-16 border-b border-[#21262d] bg-[#0d1117] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">
                Sonnet The Dev <span className="text-xs text-blue-500 font-mono ml-2">v2.4.0-OPUS</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase text-green-500 tracking-wider">System Online</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex h-6 w-[1px] bg-[#21262d] mx-2"></div>
          <div className="hidden lg:flex items-center gap-3">
            <button className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors border border-[#21262d] bg-black px-3 py-1.5 rounded hover:border-gray-700">
              <Activity size={14} />
              <span>Join Community</span>
            </button>
            <button className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors border border-[#21262d] bg-black px-3 py-1.5 rounded hover:border-gray-700">
              <Target size={14} />
              <span>Read Documentation</span>
            </button>
          </div>
        </div>
        
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
          href="https://solscan.io/account/0x8a...4B2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Wallet size={16} />
          <span>Wallet Address: 0x8a...4B2</span>
        </a>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 p-6 max-w-[1920px] mx-auto h-full">
          {/* Content goes here - I'll provide the rest in the next message due to length */}
        </div>
      </div>
    </div>
  );
};

export default SonnetMemecoinDeployer;

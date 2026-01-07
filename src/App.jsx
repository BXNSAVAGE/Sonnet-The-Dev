import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Zap, TrendingUp, DollarSign, Activity, Satellite, BarChart3, Brain, Target, Wallet } from 'lucide-react';

const SonnetMemecoinDeployer = () => {
  const [streamData, setStreamData] = useState([]);
  const [logs, setLogs] = useState([]);
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
      {/* Header */}
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
        {/* Left Sidebar */}
        <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
          {/* PumpPortal Stream */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg flex flex-col flex-1">
            <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Satellite size={14} className="text-blue-500" />
                PumpPortal Stream
              </h3>
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px]">
              {streamData.map((token, idx) => (
                <div key={idx} className={`flex gap-2 text-gray-600 border-b border-[#30363d] pb-1 ${token.action === 'WHALE' ? 'bg-yellow-500/5 -mx-3 px-3' : ''}`}>
                  <span className="text-gray-700">[{token.time}]</span>
                  {token.action === 'WHALE' && <span className="text-yellow-500 font-bold">⚠ WHALE</span>}
                  <span className="text-gray-300">{token.symbol}</span>
                  <span className={`${
                    token.action === 'MINT' ? 'text-green-500' :
                    token.action === 'BURN' ? 'text-red-400' :
                    token.action === 'SWAP' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>{token.action}</span>
                  <span className="ml-auto opacity-50">{token.amount || token.chain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Stats */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg flex flex-col flex-1">
            <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={14} className="text-blue-400" />
                System Stats
              </h3>
              <div className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[10px] text-blue-500 font-mono">LIVE</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 relative overflow-hidden hover:border-blue-900 transition-colors">
                <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Tokens Created</div>
                <div className="text-2xl font-bold text-white flex items-end gap-2">
                  {stats.tokensCreated}
                  <span className="text-[10px] text-green-400 font-mono mb-1 font-normal">+12 today</span>
                </div>
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#30363d]">
                  <div className="h-full bg-blue-600 w-[75%]"></div>
                </div>
              </div>
              <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 relative overflow-hidden hover:border-green-900 transition-colors">
                <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Coins Analyzed</div>
                <div className="text-2xl font-bold text-white flex items-end gap-2">
                  {stats.coinsAnalyzed.toLocaleString()}
                  <span className="text-[10px] text-green-400 font-mono mb-1 font-normal">99.9% scan</span>
                </div>
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#30363d]">
                  <div className="h-full bg-green-500 w-[92%]"></div>
                </div>
              </div>
              <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 relative overflow-hidden hover:border-purple-900 transition-colors">
                <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Training Iterations</div>
                <div className="text-2xl font-bold text-white flex items-end gap-2">
                  {stats.trainingIterations}M
                  <span className="text-[10px] text-purple-400 font-mono mb-1 font-normal">v2.4 active</span>
                </div>
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#30363d]">
                  <div className="h-full bg-purple-500 w-[45%] animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Meta Analysis & Logs */}
        <div className="col-span-6 flex flex-col gap-6 h-full overflow-hidden">
          {/* Meta Analysis */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="text-lg font-bold text-white">Active Meta Analysis</h2>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-blue-600/10 border border-blue-900 text-[10px] text-blue-400 font-mono">MODEL: OPUS-V3</span>
                <span className="px-2 py-1 rounded bg-[#0d1117] border border-[#30363d] text-[10px] text-gray-500 font-mono">LATENCY: 12ms</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-green-900 bg-green-950/20 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Brain size={40} className="text-green-500" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs text-green-400 font-mono mb-1">PRIMARY TREND DETECTED</div>
                  <div className="text-2xl font-bold text-white mb-2">DOG + AI</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1.5 w-24 bg-[#0d1117] rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[94%]"></div>
                    </div>
                    <span className="text-xs font-mono text-green-400">94% CONFIDENCE</span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-gray-500 font-mono flex-wrap">
                    <span className="bg-black px-1.5 py-0.5 rounded border border-[#30363d]">KEYWORDS: "cyber", "bark", "neural"</span>
                  </div>
                </div>
              </div>
              <div className="border border-[#30363d] bg-[#0d1117] rounded-lg p-4 relative overflow-hidden hover:border-gray-700 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Activity size={40} className="text-gray-600" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs text-gray-600 font-mono mb-1">EMERGING TREND</div>
                  <div className="text-xl font-bold text-gray-400 mb-2">PEPE VARIANTS</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1.5 w-24 bg-[#0d1117] rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-[45%]"></div>
                    </div>
                    <span className="text-xs font-mono text-yellow-500">45% CONFIDENCE</span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-gray-600 font-mono">
                    <span className="bg-black px-1.5 py-0.5 rounded border border-[#30363d]">KEYWORDS: "frog", "green"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Logs */}
          <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden shadow-lg min-h-0">
            <div className="h-10 bg-[#0d1117] border-b border-[#30363d] flex items-center px-4 justify-between shrink-0">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logs</h3>
              <div className="text-[10px] text-gray-600 font-mono">/var/log/autonomous_deployer.log</div>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-[#0d1117] min-h-0">
              <div className="space-y-1">
                <div className="text-gray-600">&gt; Initializing neural subprocesses... [OK]</div>
                <div className="text-gray-600">&gt; Syncing with Ethereum Mainnet node... [OK]</div>
                <div className="text-gray-600">&gt; Syncing with Solana RPC... [OK]</div>
                <div className="h-4"></div>
                <div className="flex gap-2">
                  <span className="text-blue-500">➜</span>
                  <span className="text-purple-400">~</span>
                  <span className="text-gray-400">analyze_pattern --target="twitter_stream"</span>
                </div>
                <div className="text-yellow-600 pl-4">&gt; PATTERN MATCH: "Cyber Dog" visuals increasing (Rate: +400%/hr)</div>
                <div className="text-gray-600 pl-4">&gt; Generating tokenomics... Supply: 1B, Tax: 0/0</div>
                <div className="h-4"></div>
                <div className="flex gap-2">
                  <span className="text-blue-500">➜</span>
                  <span className="text-purple-400">~</span>
                  <span className="text-gray-400">deploy_contract --name="CyberDogAI" --symbol="CDOG"</span>
                </div>
                <div className="text-gray-600 pl-4">&gt; Compiling Solidity v0.8.20...</div>
                <div className="text-gray-600 pl-4">&gt; Optimizing bytecode...</div>
                <div className="text-green-500 pl-4">&gt; TRANSACTION SENT: 0x71c...9a2</div>
                <div className="text-green-500 pl-4">&gt; CONFIRMED: Block 18293041</div>
                <div className="h-4"></div>
                <div ref={logsEndRef} />
                <div className="flex gap-2 animate-pulse">
                  <span className="text-blue-500">➜</span>
                  <span className="text-purple-400">~</span>
                  <span className="text-gray-400">awaiting_signals<span className="inline-flex h-3 w-1 bg-gray-400 ml-1 animate-ping"></span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
          {/* Creator Fees */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg shrink-0">
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <DollarSign size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Creator Fees</span>
            </div>
            <div className="flex flex-col gap-1 mb-6">
              <div className="text-3xl font-bold text-white tracking-tight">{stats.creatorFees.toLocaleString()} SOL</div>
              <div className="text-sm text-green-400 font-mono flex items-center gap-1">
                <TrendingUp size={14} />
                +12,402 SOL (24h)
              </div>
            </div>
            <div className="flex items-end gap-1 h-16 mb-2 border-b border-[#30363d] pb-2 px-1">
              <div className="w-1/6 bg-blue-600/20 hover:bg-blue-600/40 transition-colors rounded-t h-[40%]"></div>
              <div className="w-1/6 bg-blue-600/20 hover:bg-blue-600/40 transition-colors rounded-t h-[60%]"></div>
              <div className="w-1/6 bg-blue-600/20 hover:bg-blue-600/40 transition-colors rounded-t h-[30%]"></div>
              <div className="w-1/6 bg-blue-600/20 hover:bg-blue-600/40 transition-colors rounded-t h-[80%]"></div>
              <div className="w-1/6 bg-blue-600/20 hover:bg-blue-600/40 transition-colors rounded-t h-[50%]"></div>
              <div className="w-1/6 bg-blue-600 rounded-t h-[90%] relative group">
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Today</div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 font-mono mb-4">
              <span>7 Days</span>
              <span>Today</span>
            </div>
            <div className="w-full mt-2 py-3 bg-[#0d1117] border border-[#30363d] rounded flex items-center justify-between px-4 hover:border-gray-700 transition-colors cursor-wait">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-600 font-mono">Next claim in</span>
                <span className="text-sm font-bold text-white font-mono tracking-wider">{stats.nextClaim}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 animate-pulse">
                <TrendingUp size={18} />
              </div>
            </div>
          </div>

          {/* Deployed Coins */}
          <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden shadow-lg min-h-0">
            <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Rocket size={14} className="text-green-400" />
                Deployed Coins
              </h3>
              <span className="bg-[#0d1117] text-gray-400 text-[10px] px-1.5 py-0.5 rounded">89 Total</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {deployedCoins.map((coin, idx) => (
                <div key={idx} className="bg-[#0d1117] border border-[#30363d] rounded p-3 hover:border-gray-700 transition-colors shrink-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-[#0d1117] flex items-center justify-center" style={{ backgroundImage: `url(${coin.image})`, backgroundSize: 'cover' }}></div>
                      <div>
                        <div className="text-sm font-bold text-white hover:text-blue-500 transition-colors">{coin.symbol}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{coin.address}</div>
                      </div>
                    </div>
                    <span className="text-green-400 text-xs font-bold bg-green-950/20 px-1.5 py-0.5 rounded">+{coin.change}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 border-t border-[#30363d] pt-2 mt-1">
                    <div>MC: <span className="text-gray-300">{(coin.marketCap / 1000000).toFixed(1)}M SOL</span></div>
                    <div className="text-right">Vol: <span className="text-gray-300">{(coin.volume / 1000).toFixed(0)}k SOL</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SonnetMemecoinDeployer;

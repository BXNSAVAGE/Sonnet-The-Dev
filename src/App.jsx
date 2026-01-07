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
  const [deployedCoins] = useState([
    { name: 'ELONAI', symbol: '$ELONAI', address: '0x71...9A2', marketCap: 4200000, volume: 1200000, change: 420 },
    { name: 'GPTDOG', symbol: '$GPTDOG', address: '0x3B...1C4', marketCap: 1800000, volume: 850000, change: 112 },
    { name: 'PEPESENT', symbol: '$PEPESENT', address: '0x9F...2D1', marketCap: 850000, volume: 210000, change: 88 }
  ]);
  
  const logsEndRef = useRef(null);

  const fetchStreamData = async () => {
    try {
      const response = await fetch('/api/stream');
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        setStreamData(data);
        setStats(prev => ({ ...prev, coinsAnalyzed: prev.coinsAnalyzed + data.length }));
      }
    } catch (error) {
      console.error('Stream fetch error:', error);
    }
  };

  useEffect(() => {
    fetchStreamData();
    const streamInterval = setInterval(fetchStreamData, 3000);
    setTimeout(() => setStats(prev => ({ ...prev, activeMeta: { theme: 'DOG + AI', confidence: 94, keywords: ['cyber', 'bark', 'neural'] }})), 1000);
    const timer = setInterval(() => {
      setStats(prev => {
        const [h, m, s] = prev.nextClaim.split(':').map(Number);
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        if (totalSeconds < 0) totalSeconds = 4 * 3600 + 22 * 60 + 18;
        return { ...prev, nextClaim: `${String(Math.floor(totalSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}` };
      });
    }, 1000);
    return () => { clearInterval(streamInterval); clearInterval(timer); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 flex flex-col h-screen overflow-hidden">
      <header className="h-16 border-b border-[#21262d] bg-[#0d1117] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500"><Zap size={20} /></div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Sonnet The Dev <span className="text-xs text-blue-500 font-mono ml-2">v2.4.0-OPUS</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase text-green-500">System Online</span>
              </div>
            </div>
          </div>
        </div>
        <a className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white" href="https://solscan.io" target="_blank" rel="noopener noreferrer">
          <Wallet size={16} /><span>Wallet: 0x8a...4B2</span>
        </a>
      </header>
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 p-6 max-w-[1920px] mx-auto h-full">
          <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col flex-1">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Satellite size={14} className="text-blue-500" />PumpPortal Stream</h3>
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px]">
                {streamData.length === 0 ? <div className="text-gray-600 text-center py-4">Connecting...</div> : streamData.map((t, i) => (
                  <div key={i} className="flex gap-2 text-gray-600 border-b border-[#30363d] pb-1">
                    <span className="text-gray-700">[{t.time}]</span>
                    <span className="text-gray-300">{t.symbol}</span>
                    <span className="text-green-500">{t.action}</span>
                    <span className="ml-auto opacity-50">{t.chain}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col flex-1">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><BarChart3 size={14} className="text-blue-400" />System Stats</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                  <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Tokens Created</div>
                  <div className="text-2xl font-bold text-white">{stats.tokensCreated}</div>
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                  <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Coins Analyzed</div>
                  <div className="text-2xl font-bold text-white">{stats.coinsAnalyzed.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-6 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shrink-0">
              <h2 className="text-lg font-bold text-white mb-4">Active Meta Analysis</h2>
              {stats.activeMeta ? (
                <div className="border border-green-900 bg-green-950/20 rounded-lg p-4">
                  <div className="text-xs text-green-400 font-mono mb-1">PRIMARY TREND</div>
                  <div className="text-2xl font-bold text-white mb-2">{stats.activeMeta.theme}</div>
                  <div className="text-xs font-mono text-green-400">{stats.activeMeta.confidence}% CONFIDENCE</div>
                </div>
              ) : <div className="text-gray-500 text-center py-4">Analyzing...</div>}
            </div>
            <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden min-h-0">
              <div className="h-10 bg-[#0d1117] border-b border-[#30363d] px-4 flex items-center shrink-0"><h3 className="text-xs font-bold text-gray-500 uppercase">Logs</h3></div>
              <div className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-[#0d1117]">
                <div className="text-gray-600">&gt; System Online... [OK]</div>
                <div className="text-gray-600">&gt; Connected to PumpPortal WebSocket</div>
                <div className="text-green-500">&gt; Streaming live tokens...</div>
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
          <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shrink-0">
              <div className="flex items-center gap-2 mb-4 text-gray-500"><DollarSign size={14} /><span className="text-xs font-bold uppercase">Creator Fees</span></div>
              <div className="text-3xl font-bold text-white">{stats.creatorFees.toLocaleString()} SOL</div>
              <div className="text-sm text-green-400 font-mono flex items-center gap-1 mt-2"><TrendingUp size={14} />+12,402 SOL (24h)</div>
            </div>
            <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden min-h-0">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Rocket size={14} className="text-green-400" />Deployed Coins</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {deployedCoins.map((c, i) => (
                  <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-gray-800"></div>
                        <div><div className="text-sm font-bold text-white">{c.symbol}</div><div className="text-[10px] text-gray-500 font-mono">{c.address}</div></div>
                      </div>
                      <span className="text-green-400 text-xs font-bold">+{c.change}%</span>
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

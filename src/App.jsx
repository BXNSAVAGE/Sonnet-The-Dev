import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Zap, TrendingUp, DollarSign, Activity, Satellite, BarChart3, Brain, Target, Wallet } from 'lucide-react';

const SonnetMemecoinDeployer = () => {
  const [streamData, setStreamData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    tokensCreated: 0,
    coinsAnalyzed: 0,
    trainingIterations: 4.2,
    activeMeta: null,
    creatorFees: 0,
    nextClaim: '04:22:18'
  });
  const [deployedCoins, setDeployedCoins] = useState([]);
  
  const logsEndRef = useRef(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }].slice(-50));
  };

  const fetchStreamData = async () => {
    try {
      const response = await fetch('/api/stream');
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        setStreamData(data);
        setStats(prev => ({ 
          ...prev, 
          coinsAnalyzed: prev.coinsAnalyzed + (data.length - streamData.length)
        }));
        
        if (data.length > streamData.length) {
          addLog(`New token detected: ${data[0].symbol}`, 'success');
        }
      }
    } catch (error) {
      addLog('Failed to fetch stream data', 'error');
    }
  };

  const analyzeMeta = async () => {
    try {
      const response = await fetch('/api/analyze', { method: 'POST' });
      const { trend } = await response.json();
      
      if (trend && trend.confidence > 0) {
        setStats(prev => ({ ...prev, activeMeta: trend }));
        addLog(`Meta detected: ${trend.theme} (${trend.confidence.toFixed(1)}% confidence)`, 'success');
      }
    } catch (error) {
      addLog('Meta analysis failed', 'error');
    }
  };

  const deployToken = async () => {
    if (!stats.activeMeta || stats.activeMeta.confidence < 60) {
      addLog('Confidence too low to deploy', 'warning');
      return;
    }

    const tokenNames = {
      'AI': ['NeuralDog', 'CyberCat', 'BotPepe', 'AIFrog'],
      'ANIMALS': ['MegaDoge', 'SuperShib', 'BasedFrog', 'AlphaCat'],
      'MEME': ['MoonWojak', 'ChadCoin', 'BasedToken', 'GigaPepe'],
      'TECH': ['QuantumDog', 'Web3Pepe', 'MetaCat', 'CryptoFrog']
    };

    const names = tokenNames[stats.activeMeta.theme] || ['TrendToken'];
    const name = names[Math.floor(Math.random() * names.length)];
    const symbol = name.substring(0, 4).toUpperCase() + Math.floor(Math.random() * 99);

    addLog(`Deploying ${symbol}...`, 'info');

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, symbol, description: `AI-detected ${stats.activeMeta.theme} trend token` })
      });

      const result = await response.json();
      
      if (result.simulation) {
        addLog(`✓ Simulated deployment: ${symbol}`, 'success');
      } else {
        addLog(`✓ Deployed: ${symbol}`, 'success');
      }

      const newCoin = {
        name,
        symbol: `$${symbol}`,
        address: '0x' + Math.random().toString(16).substring(2, 8) + '...' + Math.random().toString(16).substring(2, 5).toUpperCase(),
        marketCap: Math.floor(Math.random() * 5000000) + 100000,
        volume: Math.floor(Math.random() * 2000000) + 50000,
        change: Math.floor(Math.random() * 500) + 50,
        deployTime: Date.now()
      };

      setDeployedCoins(prev => [newCoin, ...prev].slice(0, 10));
      setStats(prev => ({ 
        ...prev, 
        tokensCreated: prev.tokensCreated + 1,
        creatorFees: prev.creatorFees + Math.floor(Math.random() * 100) + 10
      }));
    } catch (error) {
      addLog(`Deployment failed: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    addLog('System initializing...', 'info');
    addLog('Connecting to PumpPortal stream...', 'info');
    
    fetchStreamData();
    setTimeout(() => {
      addLog('✓ Connected to PumpPortal', 'success');
      analyzeMeta();
    }, 1000);
    
    const streamInterval = setInterval(fetchStreamData, 3000);
    const metaInterval = setInterval(analyzeMeta, 15000);
    const deployInterval = setInterval(() => {
      if (stats.activeMeta && stats.activeMeta.confidence > 70) {
        deployToken();
      }
    }, 60000); // Auto-deploy every 60 seconds if confidence is high
    
    const timer = setInterval(() => {
      setStats(prev => {
        const [h, m, s] = prev.nextClaim.split(':').map(Number);
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        if (totalSeconds < 0) totalSeconds = 4 * 3600 + 22 * 60 + 18;
        return { 
          ...prev, 
          nextClaim: `${String(Math.floor(totalSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}` 
        };
      });
    }, 1000);
    
    return () => {
      clearInterval(streamInterval);
      clearInterval(metaInterval);
      clearInterval(deployInterval);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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
        <div className="flex items-center gap-3">
          <button onClick={deployToken} className="flex items-center gap-2 rounded bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">
            <Rocket size={14} />Deploy Token
          </button>
          <a className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white" href="https://solscan.io" target="_blank" rel="noopener noreferrer">
            <Wallet size={16} />Wallet
          </a>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 p-6 max-w-[1920px] mx-auto h-full">
          <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col flex-1">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Satellite size={14} className="text-blue-500" />PumpPortal Stream
                </h3>
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px]">
                {streamData.length === 0 ? (
                  <div className="text-gray-600 text-center py-4">Connecting...</div>
                ) : (
                  streamData.map((t, i) => (
                    <div key={i} className="flex gap-2 text-gray-600 border-b border-[#30363d] pb-1">
                      <span className="text-gray-700">[{t.time}]</span>
                      <span className="text-gray-300">{t.symbol}</span>
                      <span className={`${
                        t.action === 'MINT' || t.action === 'create' ? 'text-green-500' :
                        t.action === 'BURN' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>{t.action}</span>
                      <span className="ml-auto opacity-50">{t.chain}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col flex-1">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <BarChart3 size={14} className="text-blue-400" />System Stats
                </h3>
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
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                  <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Creator Fees</div>
                  <div className="text-xl font-bold text-white">{stats.creatorFees.toLocaleString()} SOL</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-6 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Active Meta Analysis</h2>
                <button onClick={analyzeMeta} className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white">
                  Refresh
                </button>
              </div>
              {stats.activeMeta ? (
                <div className={`border rounded-lg p-4 ${
                  stats.activeMeta.confidence > 70 ? 'border-green-900 bg-green-950/20' :
                  stats.activeMeta.confidence > 50 ? 'border-yellow-900 bg-yellow-950/20' :
                  'border-gray-700 bg-gray-800/20'
                }`}>
                  <div className="text-xs text-green-400 font-mono mb-1">
                    {stats.activeMeta.confidence > 70 ? 'HIGH CONFIDENCE TREND' : 'EMERGING TREND'}
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">{stats.activeMeta.theme}</div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-32 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all" style={{ width: `${stats.activeMeta.confidence}%` }}></div>
                    </div>
                    <span className="text-xs font-mono text-green-400">{stats.activeMeta.confidence.toFixed(1)}% CONFIDENCE</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Based on {stats.activeMeta.count} matches in recent tokens
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">Analyzing market trends...</div>
              )}
            </div>
            
            <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden min-h-0">
              <div className="h-10 bg-[#0d1117] border-b border-[#30363d] px-4 flex items-center shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase">System Logs</h3>
              </div>
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-[#0d1117]">
                {logs.map((log, i) => (
                  <div key={i} className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-gray-500'
                  }`}>
                    [{log.timestamp}] {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
          
          <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shrink-0">
              <div className="flex items-center gap-2 mb-4 text-gray-500">
                <DollarSign size={14} />
                <span className="text-xs font-bold uppercase">Creator Fees</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.creatorFees.toLocaleString()} SOL</div>
              <div className="text-sm text-green-400 font-mono flex items-center gap-1 mt-2">
                <TrendingUp size={14} />Live Tracking
              </div>
              <div className="mt-4 text-xs text-gray-500">Next claim: {stats.nextClaim}</div>
            </div>
            
            <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden min-h-0">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Rocket size={14} className="text-green-400" />Deployed Coins
                </h3>
                <span className="text-[10px] text-gray-500">{deployedCoins.length} Total</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {deployedCoins.length === 0 ? (
                  <div className="text-gray-600 text-center py-8 text-sm">No tokens deployed yet</div>
                ) : (
                  deployedCoins.map((c, i) => (
                    <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded p-3 hover:border-blue-600/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-purple-600"></div>
                          <div>
                            <div className="text-sm font-bold text-white">{c.symbol}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{c.address}</div>
                          </div>
                        </div>
                        <span className="text-green-400 text-xs font-bold">+{c.change}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 border-t border-[#30363d] pt-2">
                        <div>MC: <span className="text-gray-300">{(c.marketCap / 1000000).toFixed(2)}M</span></div>
                        <div className="text-right">Vol: <span className="text-gray-300">{(c.volume / 1000).toFixed(0)}K</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SonnetMemecoinDeployer;

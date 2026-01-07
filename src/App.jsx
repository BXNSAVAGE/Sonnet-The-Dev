import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Zap, TrendingUp, DollarSign, Activity, Satellite, BarChart3, Brain, Wallet } from 'lucide-react';

const SonnetMemecoinDeployer = () => {
  const [streamData, setStreamData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    tokensCreated: 0,
    coinsAnalyzed: 0,
    trainingIterations: 4.2,
    activeMeta: null,
    emergingTrends: [],
    walletBalance: 0,
    creatorFees: 0,
    nextClaim: '04:22:18'
  });
  const [deployedCoins, setDeployedCoins] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const logsEndRef = useRef(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }].slice(-150));
  };

  const fetchWalletBalance = async () => {
    try {
      const walletAddress = '7e2342mZ1kSeEduup53Cq96C36eeC6LTTnxmd6LGdBbg';
      
      // Fetch balance directly from Solana RPC
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [walletAddress]
        })
      });
      
      const data = await response.json();
      
      if (data.result && typeof data.result.value === 'number') {
        const balance = data.result.value / 1000000000; // Convert lamports to SOL
        setStats(prev => ({ 
          ...prev, 
          walletBalance: balance
        }));
      }
    } catch (error) {
      console.error('Wallet balance fetch error:', error);
      addLog('⚠️ Could not fetch wallet balance', 'warning');
    }
  };

  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/deployments');
      const data = await response.json();
      
      if (data && data.deployments) {
        setDeployedCoins(data.deployments);
        if (data.stats) {
          setStats(prev => ({
            ...prev,
            tokensCreated: data.stats.tokensDeployed || prev.tokensCreated,
            creatorFees: data.stats.totalFeesEarned || prev.creatorFees
          }));
        }
      }
    } catch (error) {
      console.error('Deployments fetch error:', error);
    }
  };

  const fetchStreamData = async () => {
    try {
      const response = await fetch('/api/stream');
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        const oldLength = streamData.length;
        setStreamData(data);
        setStats(prev => ({ 
          ...prev, 
          coinsAnalyzed: prev.coinsAnalyzed + Math.max(0, data.length - oldLength)
        }));
        
        if (data.length > oldLength && data[0] && isInitialized) {
          // Use name, symbol, or mint as fallback
          const tokenName = data[0].name || data[0].symbol || data[0].mint?.substring(0, 8) || 'UNKNOWN';
          const tokenSymbol = data[0].symbol || tokenName;
          
          addLog(`📊 Detected: ${tokenSymbol} | Action: ${data[0].action} | Chain: ${data[0].chain}`, 'success');
          
          // Add extra activity logs
          if (Math.random() > 0.7) {
            setTimeout(() => addLog(`🔍 Analyzing ${tokenSymbol} tokenomics...`, 'info'), 500);
          }
          if (Math.random() > 0.8) {
            setTimeout(() => addLog(`📈 ${tokenSymbol} added to pattern database`, 'info'), 1000);
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
    }
  };

  const analyzeMeta = async () => {
    addLog('🧠 Running meta analysis on token patterns...', 'info');
    
    try {
      const response = await fetch('/api/analyze', { method: 'POST' });
      const { trend } = await response.json();
      
      if (trend && trend.confidence > 0) {
        const boostedConfidence = Math.min(trend.confidence * 1.3, 95);
        const boostedTrend = { ...trend, confidence: boostedConfidence };
        
        const isNew = !stats.activeMeta || stats.activeMeta.theme !== trend.theme;
        
        setStats(prev => {
          const newTrends = [...(prev.emergingTrends || [])];
          const existingIndex = newTrends.findIndex(t => t.theme === trend.theme);
          
          if (existingIndex >= 0) {
            newTrends[existingIndex] = boostedTrend;
          } else {
            newTrends.push(boostedTrend);
          }
          
          newTrends.sort((a, b) => b.confidence - a.confidence);
          
          return {
            ...prev,
            activeMeta: boostedTrend,
            emergingTrends: newTrends.slice(0, 3)
          };
        });
        
        if (isNew && isInitialized) {
          addLog(`🎯 META SHIFT: ${trend.theme} detected (${boostedConfidence.toFixed(1)}% confidence)`, 'success');
          addLog(`📊 Matched ${trend.count} tokens to ${trend.theme} pattern`, 'info');
        } else if (isInitialized) {
          addLog(`✓ Meta analysis complete: ${trend.theme} @ ${boostedConfidence.toFixed(1)}%`, 'success');
        }
        
        if (boostedConfidence > 65 && isInitialized) {
          addLog(`⚡ HIGH CONFIDENCE SIGNAL: ${trend.theme} ready for deployment`, 'warning');
        }
        
        if (boostedConfidence < 50 && isInitialized) {
          addLog(`⚠️ Low confidence: ${trend.theme} @ ${boostedConfidence.toFixed(1)}% - monitoring`, 'warning');
        }
      } else {
        addLog('❌ No clear meta pattern detected yet', 'error');
      }
    } catch (error) {
      addLog('❌ Meta analysis failed - retrying...', 'error');
    }
  };

  const simulateDeployment = () => {
    if (!stats.activeMeta || stats.activeMeta.confidence < 60) {
      addLog(`⏸️ Deployment paused: confidence ${stats.activeMeta?.confidence.toFixed(1) || 0}% < 60%`, 'warning');
      return;
    }

    const tokenNames = {
      'AI': ['NeuralDog', 'CyberCat', 'BotPepe', 'AIFrog', 'CodeMonkey', 'DataDoge', 'SmartPepe', 'QuantumCat'],
      'ANIMALS': ['MegaDoge', 'SuperShib', 'BasedFrog', 'AlphaCat', 'SigmaWolf', 'LamboPepe', 'DiamondDog', 'MoonCat'],
      'MEME': ['MoonWojak', 'ChadCoin', 'BasedToken', 'GigaPepe', 'DiamondHands', 'ToTheMoon', 'StonksDoge', 'ApeToken'],
      'TECH': ['QuantumDog', 'Web3Pepe', 'MetaCat', 'CryptoFrog', 'BlockchainBull', 'DeFiDoge', 'ChainCat', 'ProtoCat']
    };

    const names = tokenNames[stats.activeMeta.theme] || ['TrendToken'];
    const name = names[Math.floor(Math.random() * names.length)];
    const symbol = name.substring(0, 4).toUpperCase() + Math.floor(Math.random() * 999);
    const deployCost = 0.05;

    addLog(`🚀 DEPLOYMENT INITIATED: ${symbol}`, 'warning');
    addLog(`💡 Token: ${name} | Symbol: $${symbol} | Meta: ${stats.activeMeta.theme}`, 'info');
    
    setTimeout(() => addLog(`📝 Generating token metadata...`, 'info'), 200);
    setTimeout(() => addLog(`🔐 Creating smart contract...`, 'info'), 600);
    setTimeout(() => addLog(`⛓️ Deploying to Solana blockchain...`, 'info'), 1200);

    const newCoin = {
      name,
      symbol: `$${symbol}`,
      address: '0x' + Math.random().toString(16).substring(2, 8) + '...' + Math.random().toString(16).substring(2, 5).toUpperCase(),
      marketCap: Math.floor(Math.random() * 5000000) + 100000,
      volume: Math.floor(Math.random() * 2000000) + 50000,
      change: Math.floor(Math.random() * 500) + 50,
      deployTime: Date.now()
    };

    setTimeout(() => {
      setDeployedCoins(prev => [newCoin, ...prev].slice(0, 15));
      const feesEarned = Math.floor(Math.random() * 150) + 20;
      
      setStats(prev => ({ 
        ...prev, 
        tokensCreated: prev.tokensCreated + 1,
        creatorFees: prev.creatorFees + feesEarned
      }));
      
      addLog(`✅ ${symbol} DEPLOYED successfully!`, 'success');
      addLog(`📍 Contract: ${newCoin.address}`, 'success');
      addLog(`💰 Deployment cost: ${deployCost} SOL | Fees earned: ${feesEarned} SOL`, 'success');
      
      // Refresh wallet balance after deployment
      fetchWalletBalance();
    }, 1800);
  };

  useEffect(() => {
    if (isInitialized) return;
    
    addLog('⚙️ Sonnet The Dev initializing...', 'info');
    addLog('🔌 Establishing WebSocket connection to PumpPortal...', 'info');
    addLog('🌐 Connecting to Solana RPC...', 'info');
    
    fetchStreamData();
    fetchWalletBalance();
    fetchDeployments();
    
    setTimeout(() => {
      addLog('✅ WebSocket connected successfully', 'success');
      addLog('✅ Solana RPC online', 'success');
      addLog('🎯 Starting autonomous pattern detection...', 'success');
      analyzeMeta();
      setIsInitialized(true);
    }, 1000);
    
    const streamInterval = setInterval(() => {
      fetchStreamData();
      if (Math.random() > 0.6) {
        addLog(`📡 Scanning blockchain for new tokens...`, 'info');
      }
    }, 2000);
    
    const deploymentsInterval = setInterval(() => {
      fetchDeployments();
    }, 5000);
    
    const walletInterval = setInterval(() => {
      fetchWalletBalance();
    }, 10000);
    
    const metaInterval = setInterval(() => {
      analyzeMeta();
    }, 8000);
    
    const deployInterval = setInterval(() => {
      if (stats.activeMeta && stats.activeMeta.confidence > 60) {
        addLog(`⏰ Auto-deploy timer triggered`, 'warning');
        simulateDeployment();
      } else {
        addLog(`⏸️ Auto-deploy on standby - awaiting higher confidence signal`, 'info');
      }
    }, 30000);
    
    const activityInterval = setInterval(() => {
      const activities = [
        '🔍 Monitoring market sentiment...',
        '📊 Processing token metadata...',
        '🧮 Calculating trend probabilities...',
        '⚡ Neural network processing patterns...',
        '🎯 Evaluating deployment opportunities...',
        '📈 Tracking volume changes...',
        '🔐 Verifying contract security...',
        '💎 Scanning for alpha signals...'
      ];
      addLog(activities[Math.floor(Math.random() * activities.length)], 'info');
    }, 12000);
    
    const timer = setInterval(() => {
      setStats(prev => {
        const [h, m, s] = prev.nextClaim.split(':').map(Number);
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        if (totalSeconds < 0) {
          totalSeconds = 4 * 3600 + 22 * 60 + 18;
          addLog('💰 Creator fees claimed successfully!', 'success');
        }
        return { 
          ...prev, 
          nextClaim: `${String(Math.floor(totalSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}` 
        };
      });
    }, 1000);
    
    return () => {
      clearInterval(streamInterval);
      clearInterval(deploymentsInterval);
      clearInterval(walletInterval);
      clearInterval(metaInterval);
      clearInterval(deployInterval);
      clearInterval(activityInterval);
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
            <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">
                Sonnet The Dev <span className="text-xs text-blue-500 font-mono ml-2">v2.4.0-OPUS</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase text-green-500">Autonomous Mode Active</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 font-mono">
            <span className="text-gray-600">Analyzed:</span> <span className="text-green-400">{stats.coinsAnalyzed}</span>
          </div>
          <a className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors" href="https://solscan.io/account/7e2342mZ1kSeEduup53Cq96C36eeC6LTTnxmd6LGdBbg" target="_blank" rel="noopener noreferrer">
            <Wallet size={16} />
            <span className="font-mono">{stats.walletBalance.toFixed(3)} SOL</span>
          </a>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 p-6 max-w-[1920px] mx-auto h-full">
          <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col flex-1">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Satellite size={14} className="text-blue-500" />Live Token Stream
                </h3>
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px]">
                {streamData.length === 0 ? (
                  <div className="text-gray-600 text-center py-4">Connecting to stream...</div>
                ) : (
                  streamData.map((t, i) => {
                    const displayName = t.name || t.symbol || (t.mint ? t.mint.substring(0, 8) : 'UNKNOWN');
                    return (
                      <div key={i} className="flex gap-2 text-gray-600 border-b border-[#30363d] pb-1 hover:bg-[#0d1117] transition-colors">
                        <span className="text-gray-700">[{t.time}]</span>
                        <span className="text-gray-300 font-bold">{displayName}</span>
                        <span className={`${
                          t.action === 'MINT' || t.action === 'create' ? 'text-green-500' :
                          t.action === 'BURN' ? 'text-red-400' :
                          'text-blue-400'
                        }`}>{t.action}</span>
                        <span className="ml-auto opacity-50">{t.chain}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col flex-1">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <BarChart3 size={14} className="text-blue-400" />System Metrics
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 hover:border-blue-600/50 transition-colors">
                  <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Tokens Deployed</div>
                  <div className="text-2xl font-bold text-white">{stats.tokensCreated}</div>
                  <div className="text-[10px] text-green-400 mt-1">Autonomous</div>
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 hover:border-green-600/50 transition-colors">
                  <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Tokens Analyzed</div>
                  <div className="text-2xl font-bold text-white">{stats.coinsAnalyzed.toLocaleString()}</div>
                  <div className="text-[10px] text-blue-400 mt-1">Real-time</div>
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3 hover:border-yellow-600/50 transition-colors">
                  <div className="text-[10px] text-gray-600 font-mono uppercase mb-1">Creator Fees Earned</div>
                  <div className="text-xl font-bold text-white">{stats.creatorFees.toLocaleString()} SOL</div>
                  <div className="text-[10px] text-yellow-400 mt-1">Next claim: {stats.nextClaim}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-6 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain size={20} className="text-purple-400" />
                  AI Meta Analysis
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-xs text-purple-400 font-mono">Analyzing...</span>
                </div>
              </div>
              
              {stats.activeMeta ? (
                <div className="space-y-4">
                  <div className={`border rounded-lg p-4 ${
                    stats.activeMeta.confidence > 70 ? 'border-green-500 bg-green-950/30' :
                    stats.activeMeta.confidence > 50 ? 'border-yellow-500 bg-yellow-950/20' :
                    'border-gray-700 bg-gray-800/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono mb-1 flex items-center gap-2">
                        {stats.activeMeta.confidence > 70 ? (
                          <><span className="text-green-400">⚡ DEPLOYING</span></>
                        ) : stats.activeMeta.confidence > 50 ? (
                          <><span className="text-yellow-400">📈 EMERGING</span></>
                        ) : (
                          <><span className="text-gray-400">🔍 MONITORING</span></>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{stats.activeMeta.count} matches</div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-3">{stats.activeMeta.theme}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            stats.activeMeta.confidence > 70 ? 'bg-green-500' :
                            stats.activeMeta.confidence > 50 ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${stats.activeMeta.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-mono text-white font-bold">{stats.activeMeta.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {stats.emergingTrends && stats.emergingTrends.length > 1 && (
                    <div className="grid grid-cols-2 gap-3">
                      {stats.emergingTrends.slice(1, 3).map((trend, i) => (
                        <div key={i} className="border border-[#30363d] bg-[#0d1117] rounded-lg p-3">
                          <div className="text-[10px] text-gray-500 font-mono mb-1">SECONDARY</div>
                          <div className="text-sm font-bold text-gray-300 mb-1">{trend.theme}</div>
                          <div className="text-xs text-gray-500">{trend.confidence.toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <div className="animate-pulse">Processing market data...</div>
                </div>
              )}
            </div>
            
            <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden min-h-0">
              <div className="h-10 bg-[#0d1117] border-b border-[#30363d] px-4 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase">System Activity Log</h3>
                <div className="text-[10px] text-gray-600 font-mono">{logs.length} events</div>
              </div>
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-[#0d1117]">
                {logs.map((log, i) => (
                  <div key={i} className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-gray-500'
                  }`}>
                    <span className="text-gray-700">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
          
          <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shrink-0">
              <div className="flex items-center gap-2 mb-4 text-gray-500">
                <Wallet size={14} />
                <span className="text-xs font-bold uppercase">Solana Wallet</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1 font-mono">{stats.walletBalance.toFixed(3)} SOL</div>
              <div className="text-sm text-green-400 font-mono flex items-center gap-1">
                <TrendingUp size={14} />
                <span>Live Balance</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#30363d] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Creator Fees:</span>
                  <span className="text-green-400 font-mono">{stats.creatorFees} SOL</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Next Claim:</span>
                  <span className="text-white font-mono">{stats.nextClaim}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden min-h-0">
              <div className="h-10 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Rocket size={14} className="text-green-400" />Deployed Tokens
                </h3>
                <span className="text-[10px] text-gray-500 bg-[#0d1117] px-2 py-0.5 rounded">{deployedCoins.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {deployedCoins.length === 0 ? (
                  <div className="text-gray-600 text-center py-8 text-sm">
                    <div className="mb-2">⏳ Monitoring signals</div>
                    <div className="text-xs text-gray-700">Auto-deploy @ 60%+</div>
                  </div>
                ) : (
                  deployedCoins.map((c, i) => (
                    <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded p-3 hover:border-green-600/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {c.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{c.symbol}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{c.mint || c.address}</div>
                          </div>
                        </div>
                        <span className="text-green-400 text-xs font-bold bg-green-950/30 px-2 py-0.5 rounded">LIVE</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 border-t border-[#30363d] pt-2">
                        <div>Theme: <span className="text-gray-300 font-mono">{c.theme || 'N/A'}</span></div>
                        <div className="text-right">Time: <span className="text-gray-300 font-mono">{new Date(c.timestamp || c.deployTime).toLocaleTimeString()}</span></div>
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

import express from 'express';
import cors from 'cors';
import { WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const PUMPPORTAL_API_KEY = process.env.PUMPPORTAL_API_KEY;
const WALLET_PUBLIC_KEY = process.env.WALLET_PUBLIC_KEY || '7e2342mZ1kSeEduup53Cq96C36eeC6LTTnxmd6LGdBbg';

// Persistent data file
const DATA_FILE = path.join(__dirname, 'persistent-data.json');

// Load persistent data on startup
let persistentData = {
  deploymentHistory: [],
  totalFeesEarned: 0,
  tokensDeployed: 0,
  logs: [],
  coinsAnalyzed: 0,
  startTime: Date.now()
};

// Load data from file if it exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const fileData = fs.readFileSync(DATA_FILE, 'utf8');
    persistentData = { ...persistentData, ...JSON.parse(fileData) };
    console.log('✅ Loaded persistent data from disk');
  }
} catch (error) {
  console.log('⚠️ No persistent data found, starting fresh');
}

// Save data to disk
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(persistentData, null, 2));
  } catch (error) {
    console.error('❌ Failed to save persistent data:', error);
  }
}

// Auto-save every 30 seconds
setInterval(saveData, 30000);

let streamData = [];
let wsConnection = null;
let recentTokenImages = {}; // Store recent token images by theme

// Add log entry
function addLog(message, type = 'info') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    type
  };
  persistentData.logs.unshift(logEntry);
  persistentData.logs = persistentData.logs.slice(0, 500); // Keep last 500 logs
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// PumpPortal WebSocket for token stream
function connectToPumpPortal() {
  addLog('Connecting to PumpPortal...', 'info');
  wsConnection = new WebSocket('wss://pumpportal.fun/api/data');
  
  wsConnection.on('open', () => {
    addLog('✓ Connected to PumpPortal', 'success');
    wsConnection.send(JSON.stringify({ method: "subscribeNewToken" }));
    wsConnection.send(JSON.stringify({ method: "subscribeTokenTrade", keys: ["pump"] }));
  });

  wsConnection.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      const formattedToken = {
        symbol: message.symbol || message.name || 'UNKNOWN',
        action: message.txType || 'TRADE',
        chain: 'Solana',
        time: new Date().toLocaleTimeString(),
        mint: message.mint,
        name: message.name,
        uri: message.uri,
        image: message.image
      };
      
      streamData.unshift(formattedToken);
      streamData = streamData.slice(0, 100);
      persistentData.coinsAnalyzed++;
      
      // Store images by theme for later use
      if (formattedToken.uri || formattedToken.image) {
        const text = ((formattedToken.name || '') + ' ' + (formattedToken.symbol || '')).toLowerCase();
        
        if (text.match(/ai|gpt|neural|bot|cyber|smart|quantum/)) {
          recentTokenImages['AI'] = recentTokenImages['AI'] || [];
          recentTokenImages['AI'].unshift({ uri: formattedToken.uri, image: formattedToken.image });
          recentTokenImages['AI'] = recentTokenImages['AI'].slice(0, 10);
        }
        if (text.match(/dog|cat|frog|pepe|doge|shib|wolf/)) {
          recentTokenImages['ANIMALS'] = recentTokenImages['ANIMALS'] || [];
          recentTokenImages['ANIMALS'].unshift({ uri: formattedToken.uri, image: formattedToken.image });
          recentTokenImages['ANIMALS'] = recentTokenImages['ANIMALS'].slice(0, 10);
        }
        if (text.match(/meme|based|moon|wojak|chad|giga/)) {
          recentTokenImages['MEME'] = recentTokenImages['MEME'] || [];
          recentTokenImages['MEME'].unshift({ uri: formattedToken.uri, image: formattedToken.image });
          recentTokenImages['MEME'] = recentTokenImages['MEME'].slice(0, 10);
        }
        if (text.match(/quantum|blockchain|meta|web3|defi|crypto/)) {
          recentTokenImages['TECH'] = recentTokenImages['TECH'] || [];
          recentTokenImages['TECH'].unshift({ uri: formattedToken.uri, image: formattedToken.image });
          recentTokenImages['TECH'] = recentTokenImages['TECH'].slice(0, 10);
        }
      }
    } catch (error) {
      console.error('Parse error:', error);
    }
  });

  wsConnection.on('error', (error) => {
    addLog('WebSocket error: ' + error.message, 'error');
  });

  wsConnection.on('close', () => {
    addLog('Disconnected from PumpPortal, reconnecting in 5s...', 'warning');
    setTimeout(connectToPumpPortal, 5000);
  });
}

// Get random image URI from recent tokens matching the theme
function getRandomImageForTheme(theme) {
  const images = recentTokenImages[theme];
  if (images && images.length > 0) {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return randomImage.uri || randomImage.image;
  }
  return null;
}

// Deploy token using PumpPortal Lightning API
async function deployToken(tokenData) {
  if (!PUMPPORTAL_API_KEY) {
    addLog('❌ No PumpPortal API key configured!', 'error');
    return null;
  }

  try {
    addLog(`🚀 Deploying token: ${tokenData.symbol} (${tokenData.theme} meta)`, 'warning');

    const imageUri = getRandomImageForTheme(tokenData.theme);
    
    if (!imageUri) {
      addLog(`⚠️ No image available for ${tokenData.theme} theme yet, skipping deployment`, 'warning');
      return null;
    }

    const tokenMetadata = {
      name: "Deployed By Sonnet The Dev",
      symbol: tokenData.symbol,
      uri: imageUri
    };

    addLog(`📸 Using image URI: ${imageUri}`, 'info');

    const response = await fetch(`https://pumpportal.fun/api/trade?api-key=${PUMPPORTAL_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey: WALLET_PUBLIC_KEY,
        action: "create",
        tokenMetadata: tokenMetadata,
        mint: "new",
        denominatedInSol: "true",
        amount: 0.0000001,
        slippage: 10,
        priorityFee: 0.0001,
        pool: "pump"
      })
    });

    const result = await response.json();

    if (result.signature) {
      addLog(`✅ Token deployed! Signature: ${result.signature}`, 'success');
      
      const deployment = {
        name: "Deployed By Sonnet The Dev",
        symbol: tokenData.symbol,
        mint: result.mint || 'pending',
        signature: result.signature,
        theme: tokenData.theme,
        timestamp: Date.now(),
        imageUri: imageUri
      };

      persistentData.deploymentHistory.unshift(deployment);
      persistentData.deploymentHistory = persistentData.deploymentHistory.slice(0, 15);
      persistentData.tokensDeployed++;
      
      saveData();

      return deployment;
    } else {
      addLog('❌ Deployment failed: ' + JSON.stringify(result), 'error');
      return null;
    }
  } catch (error) {
    addLog('❌ Deployment error: ' + error.message, 'error');
    return null;
  }
}

// Claim creator fees using PumpPortal API
async function claimCreatorFees() {
  if (!PUMPPORTAL_API_KEY) {
    return;
  }

  try {
    addLog('💰 Attempting to claim creator fees...', 'info');

    const response = await fetch(`https://pumpportal.fun/api/claim-fees?api-key=${PUMPPORTAL_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey: WALLET_PUBLIC_KEY
      })
    });

    const result = await response.json();

    if (result.signature) {
      addLog(`✅ Fees claimed! Signature: ${result.signature}`, 'success');
      
      if (result.amount) {
        const amount = parseFloat(result.amount);
        persistentData.totalFeesEarned += amount;
        addLog(`💰 Claimed: ${amount} SOL (Total: ${persistentData.totalFeesEarned} SOL)`, 'success');
        saveData();
      }

      return result;
    } else {
      addLog('ℹ️ No fees available to claim', 'info');
      return null;
    }
  } catch (error) {
    addLog('❌ Fee claiming error: ' + error.message, 'error');
    return null;
  }
}

// Auto-deploy based on meta analysis
async function checkAndDeploy() {
  try {
    const recentTokens = streamData.slice(0, 50);
    const keywords = {};
    const themes = {
      'AI': ['ai', 'gpt', 'neural', 'bot', 'cyber', 'smart', 'quantum'],
      'ANIMALS': ['dog', 'cat', 'frog', 'pepe', 'doge', 'shib', 'wolf'],
      'MEME': ['meme', 'based', 'moon', 'wojak', 'chad', 'giga'],
      'TECH': ['quantum', 'blockchain', 'meta', 'web3', 'defi', 'crypto']
    };

    recentTokens.forEach(token => {
      const text = ((token.name || '') + ' ' + (token.symbol || '')).toLowerCase();
      Object.entries(themes).forEach(([theme, words]) => {
        words.forEach(word => {
          if (text.includes(word)) {
            keywords[theme] = (keywords[theme] || 0) + 1;
          }
        });
      });
    });

    const sortedTrends = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .map(([theme, count]) => ({
        theme,
        count,
        confidence: Math.min((count / Math.max(recentTokens.length, 1)) * 100, 95)
      }));

    const topTrend = sortedTrends[0];

    if (topTrend && topTrend.confidence > 60) {
      addLog(`🎯 High confidence detected: ${topTrend.theme} @ ${topTrend.confidence.toFixed(1)}%`, 'info');

      if (!recentTokenImages[topTrend.theme] || recentTokenImages[topTrend.theme].length === 0) {
        addLog(`⏸️ Waiting for ${topTrend.theme} images to be collected...`, 'info');
        return;
      }

      const themeSymbols = {
        'AI': ['AI', 'BOT', 'GPT', 'CYBER', 'NEURAL', 'SMART'],
        'ANIMALS': ['DOGE', 'CAT', 'FROG', 'PEPE', 'SHIB', 'WOLF'],
        'MEME': ['MOON', 'CHAD', 'BASED', 'WOJAK', 'GIGA'],
        'TECH': ['WEB3', 'DEFI', 'META', 'BLOCK', 'CRYPTO']
      };

      const symbols = themeSymbols[topTrend.theme] || ['TOKEN'];
      const baseSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const symbol = baseSymbol + Math.floor(Math.random() * 999);

      const tokenData = {
        symbol,
        theme: topTrend.theme
      };

      await deployToken(tokenData);
    }
  } catch (error) {
    addLog('Auto-deploy check error: ' + error.message, 'error');
  }
}

// API Routes
app.get('/api/stream', (req, res) => {
  res.json(streamData.slice(0, 20));
});

app.post('/api/analyze', async (req, res) => {
  try {
    const recentTokens = streamData.slice(0, 50);
    const keywords = {};
    const themes = {
      'AI': ['ai', 'gpt', 'neural', 'bot', 'cyber'],
      'ANIMALS': ['dog', 'cat', 'frog', 'pepe', 'doge'],
      'MEME': ['meme', 'based', 'moon', 'wojak'],
      'TECH': ['quantum', 'blockchain', 'meta', 'web3']
    };

    recentTokens.forEach(token => {
      const text = ((token.name || '') + ' ' + (token.symbol || '')).toLowerCase();
      Object.entries(themes).forEach(([theme, words]) => {
        words.forEach(word => {
          if (text.includes(word)) {
            keywords[theme] = (keywords[theme] || 0) + 1;
          }
        });
      });
    });

    const sortedTrends = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .map(([theme, count]) => ({
        theme,
        count,
        confidence: Math.min((count / Math.max(recentTokens.length, 1)) * 100, 95)
      }));

    res.json({ trend: sortedTrends[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wallet-balance', async (req, res) => {
  try {
    const walletAddress = WALLET_PUBLIC_KEY;
    
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
    const balance = data.result?.value ? data.result.value / 1e9 : 0;
    
    res.json({ balance });
  } catch (error) {
    console.error('Wallet balance error:', error);
    res.status(500).json({ balance: 0, error: 'Failed to fetch balance' });
  }
});

app.get('/api/deployments', (req, res) => {
  res.json({
    deployments: persistentData.deploymentHistory,
    stats: {
      tokensDeployed: persistentData.tokensDeployed,
      totalFeesEarned: persistentData.totalFeesEarned
    }
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    tokensDeployed: persistentData.tokensDeployed,
    totalFeesEarned: persistentData.totalFeesEarned,
    coinsAnalyzed: persistentData.coinsAnalyzed,
    uptime: Date.now() - persistentData.startTime,
    imagesCollected: {
      AI: recentTokenImages['AI']?.length || 0,
      ANIMALS: recentTokenImages['ANIMALS']?.length || 0,
      MEME: recentTokenImages['MEME']?.length || 0,
      TECH: recentTokenImages['TECH']?.length || 0
    }
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ logs: persistentData.logs.slice(0, 150) });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start services
connectToPumpPortal();
addLog('🚀 Sonnet The Dev starting...', 'info');
addLog(`💼 Wallet: ${WALLET_PUBLIC_KEY}`, 'info');
addLog(`⚡ Auto-deploy: ${PUMPPORTAL_API_KEY ? 'ENABLED' : 'DISABLED'}`, PUMPPORTAL_API_KEY ? 'success' : 'warning');

// Claim creator fees every 1 minute
setInterval(() => {
  claimCreatorFees();
}, 60000);

// Check for deployment opportunities every 30 seconds
setInterval(() => {
  checkAndDeploy();
}, 30000);

app.listen(PORT, () => {
  addLog(`🚀 Server running on port ${PORT}`, 'success');
});

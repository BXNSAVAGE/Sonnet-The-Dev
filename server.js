import express from 'express';
import cors from 'cors';
import { WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const PUMPPORTAL_API_KEY = process.env.PUMPPORTAL_API_KEY;
const WALLET_PUBLIC_KEY = process.env.WALLET_PUBLIC_KEY || '7e2342mZ1kSeEduup53Cq96C36eeC6LTTnxmd6LGdBbg';

let streamData = [];
let wsConnection = null;
let deploymentHistory = [];
let totalFeesEarned = 0;
let tokensDeployed = 0;
let recentTokenImages = {}; // Store recent token images by theme

// PumpPortal WebSocket for token stream
function connectToPumpPortal() {
  console.log('Connecting to PumpPortal...');
  wsConnection = new WebSocket('wss://pumpportal.fun/api/data');
  
  wsConnection.on('open', () => {
    console.log('✓ Connected to PumpPortal');
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
        uri: message.uri, // Token metadata URI
        image: message.image // Direct image if available
      };
      
      streamData.unshift(formattedToken);
      streamData = streamData.slice(0, 100);
      
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
      
      console.log('New token:', formattedToken.symbol);
    } catch (error) {
      console.error('Parse error:', error);
    }
  });

  wsConnection.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  wsConnection.on('close', () => {
    console.log('Disconnected, reconnecting in 5s...');
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
    console.error('❌ No PumpPortal API key configured!');
    return null;
  }

  try {
    console.log(`🚀 Deploying token: ${tokenData.symbol} (${tokenData.theme} meta)`);

    const imageUri = getRandomImageForTheme(tokenData.theme);
    
    if (!imageUri) {
      console.log(`⚠️ No image available for ${tokenData.theme} theme yet, skipping deployment`);
      return null;
    }

    // Create token metadata
    const tokenMetadata = {
      name: "Deployed By Sonnet The Dev",
      symbol: tokenData.symbol,
      uri: imageUri // Use the image from a similar meta token
    };

    console.log(`📸 Using image URI: ${imageUri}`);

    // Send the create transaction with dev buy
    const response = await fetch(`https://pumpportal.fun/api/trade?api-key=${PUMPPORTAL_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey: WALLET_PUBLIC_KEY,
        action: "create",
        tokenMetadata: tokenMetadata,
        mint: "new", // Generate new mint
        denominatedInSol: "true",
        amount: 0.0000001, // Dev buy of 0.0000001 SOL
        slippage: 10,
        priorityFee: 0.0001,
        pool: "pump"
      })
    });

    const result = await response.json();

    if (result.signature) {
      console.log(`✅ Token deployed! Signature: ${result.signature}`);
      
      const deployment = {
        name: "Deployed By Sonnet The Dev",
        symbol: tokenData.symbol,
        mint: result.mint || 'pending',
        signature: result.signature,
        theme: tokenData.theme,
        timestamp: Date.now(),
        imageUri: imageUri
      };

      deploymentHistory.unshift(deployment);
      deploymentHistory = deploymentHistory.slice(0, 15);
      tokensDeployed++;

      return deployment;
    } else {
      console.error('❌ Deployment failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Deployment error:', error);
    return null;
  }
}

// Claim creator fees using PumpPortal API
async function claimCreatorFees() {
  if (!PUMPPORTAL_API_KEY) {
    console.error('❌ No PumpPortal API key configured!');
    return;
  }

  try {
    console.log('💰 Attempting to claim creator fees...');

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
      console.log(`✅ Fees claimed! Signature: ${result.signature}`);
      
      if (result.amount) {
        const amount = parseFloat(result.amount);
        totalFeesEarned += amount;
        console.log(`💰 Claimed: ${amount} SOL (Total: ${totalFeesEarned} SOL)`);
      }

      return result;
    } else {
      console.log('ℹ️ No fees available to claim or already claimed');
      return null;
    }
  } catch (error) {
    console.error('❌ Fee claiming error:', error);
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
      console.log(`🎯 High confidence detected: ${topTrend.theme} @ ${topTrend.confidence.toFixed(1)}%`);

      // Check if we have images for this theme
      if (!recentTokenImages[topTrend.theme] || recentTokenImages[topTrend.theme].length === 0) {
        console.log(`⏸️ Waiting for ${topTrend.theme} images to be collected...`);
        return;
      }

      // Generate ticker based on theme
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
    console.error('Auto-deploy check error:', error);
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
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

app.get('/api/deployments', (req, res) => {
  res.json({
    deployments: deploymentHistory,
    stats: {
      tokensDeployed,
      totalFeesEarned
    }
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    tokensDeployed,
    totalFeesEarned,
    coinsAnalyzed: streamData.length,
    imagesCollected: {
      AI: recentTokenImages['AI']?.length || 0,
      ANIMALS: recentTokenImages['ANIMALS']?.length || 0,
      MEME: recentTokenImages['MEME']?.length || 0,
      TECH: recentTokenImages['TECH']?.length || 0
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start services
connectToPumpPortal();

// Claim creator fees every 1 minute
setInterval(() => {
  claimCreatorFees();
}, 60000);

// Check for deployment opportunities every 30 seconds
setInterval(() => {
  checkAndDeploy();
}, 30000);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💼 Wallet: ${WALLET_PUBLIC_KEY}`);
  console.log(`⚡ Auto-deploy: ${PUMPPORTAL_API_KEY ? 'ENABLED' : 'DISABLED (set PUMPPORTAL_API_KEY)'}`);
  console.log(`💰 Auto-claim fees: Every 60 seconds`);
});

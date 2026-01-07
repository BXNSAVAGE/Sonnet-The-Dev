import express from 'express';
import cors from 'cors';
import { WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

let streamData = [];
let wsConnection = null;

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
        name: message.name
      };
      streamData.unshift(formattedToken);
      streamData = streamData.slice(0, 100);
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

connectToPumpPortal();

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

// Add this endpoint to your server.js
app.get('/api/wallet-balance', async (req, res) => {
  try {
    const walletAddress = process.env.WALLET_ADDRESS || '7e2342mZ1kSeEduup53Cq96C36eeC6LTTnxmd6LGdBbg';
    
    // Fetch balance from Solana
    const response = await fetch(`https://api.mainnet-beta.solana.com`, {
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
    const balance = data.result?.value ? data.result.value / 1e9 : 0; // Convert lamports to SOL
    
    res.json({ balance });
  } catch (error) {
    console.error('Wallet balance error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

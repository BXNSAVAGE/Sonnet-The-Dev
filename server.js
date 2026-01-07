const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// WebSocket connection to PumpPortal
let streamData = [];
let wsConnection = null;

function connectToPumpPortal() {
  wsConnection = new WebSocket('wss://pumpportal.fun/api/data');
  
  wsConnection.on('open', () => {
    console.log('Connected to PumpPortal');
    // Subscribe to new token events
    wsConnection.send(JSON.stringify({
      method: "subscribeNewToken"
    }));
  });

  wsConnection.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      streamData.unshift(message);
      streamData = streamData.slice(0, 100); // Keep last 100
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

// API Endpoints
app.get('/api/stream', (req, res) => {
  res.json(streamData.slice(0, 20));
});

app.post('/api/analyze', async (req, res) => {
  try {
    // Analyze recent tokens for meta trends
    const recentTokens = streamData.slice(0, 50);
    const keywords = {};
    const themes = {
      'AI': ['ai', 'gpt', 'neural', 'bot', 'cyber'],
      'ANIMALS': ['dog', 'cat', 'frog', 'pepe', 'doge'],
      'MEME': ['meme', 'based', 'moon', 'wojak'],
      'TECH': ['quantum', 'blockchain', 'meta', 'web3']
    };

    recentTokens.forEach(token => {
      const text = (token.name + ' ' + token.symbol).toLowerCase();
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
        confidence: Math.min((count / recentTokens.length) * 100, 95)
      }));

    res.json({ trend: sortedTrends[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deploy', async (req, res) => {
  try {
    const { name, symbol, description, twitter, telegram, website } = req.body;
    
    // Deploy to PumpPortal
    const response = await fetch('https://pumpportal.fun/api/ipfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        symbol,
        description,
        twitter: twitter || '',
        telegram: telegram || '',
        website: website || '',
        showName: true
      })
    });

    const ipfsData = await response.json();
    
    // Now deploy the token with the IPFS data
    const deployResponse = await fetch('https://pumpportal.fun/api/trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        mint: ipfsData.metadataUri,
        denominatedInSol: 'true',
        amount: 0.01, // Initial buy amount in SOL
        slippage: 10,
        priorityFee: 0.0001,
        pool: 'pump'
      })
    });

    const result = await deployResponse.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/fees/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    const response = await fetch(`https://pumpportal.fun/api/fees/${wallet}`);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/claim-fees', async (req, res) => {
  try {
    const { wallet, privateKey } = req.body;
    
    // Claim creator fees
    const response = await fetch('https://pumpportal.fun/api/claim-fees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet,
        privateKey // IMPORTANT: Store this securely in environment variables
      })
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

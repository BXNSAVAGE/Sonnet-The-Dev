const express = require('express');
const cors = require('cors');
const { WebSocket } = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// WebSocket connection to PumpPortal
let streamData = [];
let wsConnection = null;

function connectToPumpPortal() {
  wsConnection = new WebSocket('wss://pumpportal.fun/api/data');
  
  wsConnection.on('open', () => {
    console.log('Connected to PumpPortal');
    wsConnection.send(JSON.stringify({
      method: "subscribeNewToken"
    }));
  });

  wsConnection.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      streamData.unshift(message);
      streamData = streamData.slice(0, 100);
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

app.post('/api/deploy', async (req, res) => {
  try {
    const { name, symbol, description } = req.body;
    
    const response = await fetch('https://pumpportal.fun/api/ipfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        symbol,
        description,
        showName: true
      })
    });

    const ipfsData = await response.json();
    res.json(ipfsData);
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
    
    const response = await fetch('https://pumpportal.fun/api/claim-fees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet,
        privateKey
      })
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

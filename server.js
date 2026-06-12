const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JUSTTCG_KEY = process.env.JUSTTCG_KEY || 'tcg_c8c8976ae0934f569d9e521cc43d04e5';
const PC_KEY = process.env.PRICECHARTING_KEY || 'd8dc696e2a898813eac2c38083351733441290aa';

app.use(express.static(path.join(__dirname, 'public')));

// JustTCG proxy
app.get('/api/justtcg', async (req, res) => {
  try {
    const { q, cardId, game = 'pokemon' } = req.query;
    let url;
    if (cardId) {
      url = `https://api.justtcg.com/v1/cards?game=${game}&cardId=${encodeURIComponent(cardId)}`;
    } else {
      url = `https://api.justtcg.com/v1/cards?game=${game}&q=${encodeURIComponent(q)}&limit=8&include_price_history=false&include_statistics=false`;
    }
    const response = await fetch(url, {
      headers: {
        'x-api-key': JUSTTCG_KEY,
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PriceCharting proxy
app.get('/api/pricecharting', async (req, res) => {
  try {
    const { q, id } = req.query;
    let url;
    if (id) {
      url = `https://www.pricecharting.com/api/product?t=${PC_KEY}&id=${encodeURIComponent(id)}`;
    } else {
      url = `https://www.pricecharting.com/api/products?t=${PC_KEY}&q=${encodeURIComponent(q)}`;
    }
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`PokePricer running on port ${PORT}`);
});

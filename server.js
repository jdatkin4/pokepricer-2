const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const PC_KEY        = process.env.PRICECHARTING_KEY || 'd8dc696e2a898813eac2c38083351733441290aa';
const JTCG_KEY      = process.env.JUSTTCG_KEY       || 'tcg_1f6e2eceb705426da21b4590af18821e';
const POKETRACE_KEY = process.env.POKETRACE_KEY     || 'pc_c3f2b28c87b111d6bcea1ef6d2984c1ec19c28b56b1b8492';

app.use(express.static(path.join(__dirname, 'public')));

// PriceCharting proxy
app.get('/api/pricecharting', async (req, res) => {
  try {
    const { q, id } = req.query;
    const url = id
      ? `https://www.pricecharting.com/api/product?t=${PC_KEY}&id=${encodeURIComponent(id)}`
      : `https://www.pricecharting.com/api/products?t=${PC_KEY}&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    res.json(await r.json());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// JustTCG proxy (primary TCGPlayer NM source)
app.get('/api/justtcg', async (req, res) => {
  try {
    const { q, game = 'pokemon', condition } = req.query;
    let url = `https://api.justtcg.com/v1/cards?game=${game}&q=${encodeURIComponent(q)}&limit=8&include_price_history=false&include_statistics=false`;
    if (condition) url += `&condition=${encodeURIComponent(condition)}`;
    const r = await fetch(url, {
      headers: { 'x-api-key': JTCG_KEY, 'User-Agent': 'Mozilla/5.0' }
    });
    res.json(await r.json());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Poketrace proxy (fallback for TCGPlayer NM)
app.get('/api/poketrace', async (req, res) => {
  try {
    const { q } = req.query;
    const url = `https://api.poketrace.com/v1/cards?search=${encodeURIComponent(q)}&limit=8`;
    const r = await fetch(url, {
      headers: { 'X-API-Key': POKETRACE_KEY, 'User-Agent': 'Mozilla/5.0' }
    });
    res.json(await r.json());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`PokePricer running on port ${PORT}`));

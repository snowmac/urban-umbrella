// Adams Crypto Bot
//
// This script periodically checks the price of Bitcoin on multiple exchanges and
// logs any differences that might present an arbitrage opportunity. By default,
// it compares Binance and Coinbase prices, but you can extend the `exchanges`
// array below to include additional markets. The bot does **not** execute trades
// automatically—you need to implement trading logic using each exchange's API.

require('dotenv').config();
const axios = require('axios');

// Configure exchanges and their respective endpoints. Each entry should
// implement a `parsePrice` function that extracts the price from the API
// response.
const exchanges = [
  {
    name: 'Binance',
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    parsePrice: (data) => parseFloat(data.price),
  },
  {
    name: 'Coinbase',
    url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
    parsePrice: (data) => parseFloat(data.data.amount),
  },
];

// Polling interval in milliseconds. Default to one minute if not set.
const interval = parseInt(process.env.POLL_INTERVAL, 10) || 60 * 1000;

async function fetchPrice({ url, parsePrice }) {
  const response = await axios.get(url);
  return parsePrice(response.data);
}

async function checkArbitrage() {
  try {
    const prices = await Promise.all(exchanges.map(fetchPrice));
    const [binancePrice, coinbasePrice] = prices;
    const difference = binancePrice - coinbasePrice;
    const spread = ((difference) / ((binancePrice + coinbasePrice) / 2)) * 100;

    console.log(`[${new Date().toISOString()}] Binance: $${binancePrice.toFixed(2)}, Coinbase: $${coinbasePrice.toFixed(2)}, Spread: ${spread.toFixed(2)}%`);

    // Example threshold for arbitrage. Adjust as needed.
    const threshold = 0.5; // 0.5% difference
    if (Math.abs(spread) >= threshold) {
      console.log('Potential arbitrage opportunity detected!');
      // TODO: Insert trade execution logic using exchange APIs and authentication keys.
      // For example, place a buy order on the cheaper exchange and a sell order on the more expensive one.
    }
  } catch (err) {
    console.error('Error fetching prices:', err.message);
  }
}

console.log('Starting Adams Crypto Bot...');
checkArbitrage();
setInterval(checkArbitrage, interval);

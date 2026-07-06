const express = require('express');
const { paymentMiddleware } = require('./middleware');

const app = express();

app.use(paymentMiddleware({
  "GET /weather": {
    accepts: [
      { network: "ethereum", symbol: "USDC" },
      { network: "polygon", symbol: "USDC" }
    ],
    description: "Weather data",
  },
}));

app.get('/weather', (req, res) => {
  res.json({ temperature: 25, unit: 'Celsius' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

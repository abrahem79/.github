/**
 * Mock implementation of paymentMiddleware.
 */
function paymentMiddleware(config) {
  return (req, res, next) => {
    console.log('Payment middleware invoked with config:', JSON.stringify(config, null, 2));
    next();
  };
}

module.exports = { paymentMiddleware };

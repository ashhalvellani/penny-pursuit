const Groq = require('groq-sdk').default || require('groq-sdk');
const env = require('../../config/env');

let client;

function getClient() {
  if (!client) {
    client = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return client;
}

const MODELS = {
  text: 'llama-3.1-8b-instant',
};

module.exports = { getClient, MODELS };

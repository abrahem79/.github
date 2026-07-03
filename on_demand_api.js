require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("Error: Missing API_KEY in .env");
  process.exit(1);
}

/**
 * Creates a chat session for a given user.
 * @param {string} externalUserId - The ID of the external user.
 * @returns {Promise<string>} The session ID.
 */
async function createChatSession(externalUserId) {
  if (externalUserId === null || externalUserId === undefined) {
    throw new Error('externalUserId cannot be null or undefined');
  }

  const url = 'https://api.on-demand.io/chat/v1/sessions';
  const headers = { apikey: apiKey };
  const body = { agentIds: [], externalUserId };

  try {
    const { data } = await axios.post(url, body, { headers });
    if (!data || !data.data || !data.data.id) {
        throw new Error('Unexpected response format from session creation');
    }
    return data.data.id;
  } catch (error) {
    const message = error.response?.data || error.message;
    console.error('Session creation failed:', message);
    throw new Error(`Failed to create session: ${message}`);
  }
}

/**
 * Submits a query to a chat session.
 * @param {string} sessionId - The session ID.
 * @param {string} query - The query string.
 * @returns {Promise<object>} The query result.
 */
async function submitQuery(sessionId, query) {
  if (sessionId === null || sessionId === undefined) {
    throw new Error('sessionId cannot be null or undefined');
  }
  if (query === null || query === undefined) {
    throw new Error('query cannot be null or undefined');
  }

  const url = `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`;
  const headers = { apikey: apiKey };
  const body = {
    endpointId: 'predefined-openai-gpt4o',
    query,
    agentIds: ['agent-1712327325', 'agent-1713962163'],
    responseMode: 'sync',
    reasoningMode: 'medium'
  };

  try {
    const { data } = await axios.post(url, body, { headers });
    return data;
  } catch (error) {
    const message = error.response?.data || error.message;
    console.error('Query failed:', message);
    throw new Error(`Failed to submit query: ${message}`);
  }
}

if (require.main === module) {
  (async () => {
    try {
      const externalUserId = 'sample-user-123';
      const sessionId = await createChatSession(externalUserId);
      const result = await submitQuery(sessionId, 'Put your query here');
      console.log('Response:\n', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Execution error:', err.message);
    }
  })();
}

module.exports = { createChatSession, submitQuery };

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In the front end we will have the req body be split up into two things. 
// First the customization for the system, like the tone, formality, etc
// Second, it will be the actual prompt from the user. In this prompt, we 

// Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  });
  const openai = new OpenAIApi(configuration);

// Configuration
app.post('/api/gpt', async (req, res) => {
    try {
      const { prompt, customMessages } = req.body; // Get prompt and customMessages from the request body
      
      // Set up initial messages array with the user prompt
      let messages = [
        { role: 'system', content: `The following are the customization options to adjust GPT's response:
          Tone: ${customMessages.tone}
          Formality: ${customMessages.formality}
          Knowledge Level: ${customMessages.knowledgeLevel}
          Response Length: ${customMessages.length}` },
        { role: 'user', content: prompt }
      ];
  
      // Create a request to OpenAI
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages
      });
  
      // Extract the reply from OpenAI's response
      const reply = completion.data.choices[0].message.content;
  
      // Return the reply to the client
      res.json({ reply });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
    }
  });
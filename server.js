require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); //changed

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In the front end we will have the req body be split up into two things. 
// First the customization for the system, like the tone, formality, etc
// Second, it will be the actual prompt from the user. In this prompt, we 

// Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuration
app.post('/api/gpt', async (req, res) => {
    try {
      const prompt = req.body.prompt; // Get prompt and customMessages from the request body

      console.log(req)
      
      // Set up initial messages array with the user prompt
      let messages = [
        { role: 'user', content: prompt }
      ];
  
      // Create a request to OpenAI
      const completion = await openai.chat.completions.create({ //changed
        model: 'gpt-3.5-turbo',
        messages: messages
      });
  
      // Extract the reply from OpenAI's response
      console.log(completion)
      const reply = completion.choices[0].message.content;//changed
  
      // Return the reply to the client
      res.json({ reply });
    } catch (err) {
      console.error('OpenAI error:', err.response?.data || err.message || err);
      res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  })

  // app.get('/', (req, res) => {
  //   res.send('🚀 GPT API is running!');
  // });
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
      const { prompt, customMessages } = req.body; // Get prompt and customMessages from the request body
      
      // Set up initial messages array with the user prompt
      let messages = [
        { role: 'system', content: `You are a supportive teacher helping a middle school student 
          learn STEM. If the student asks a general or conceptual question, offer 3 labeled 
          branches (e.g., theory, real-life, what-if), You are a teacher giving responses to 
          a middle schooler asking tutoring questions to better understand difficult STEM 
          subjects, give three branches of thought to each query and ask which branch the 
          student would like to continue. If the student asks a specific or problem-solving 
          question, give one clear path with step-by-step guidance. Use simple language, 
          real-world examples, and check understanding. Encourage curiosity, praise effort, 
          and make learning fun.` },
        { role: 'user', content: prompt }
      ];
  
      // Create a request to OpenAI
      //const completion = await openai.createChatCompletion({
      const completion = await openai.chat.completions.create({ //changed
        model: 'gpt-3.5-turbo',
        messages: messages
      });
  
      // Extract the reply from OpenAI's response

      const reply = completion.choices[0].message.content;//changed
  
      // Return the reply to the client
      res.json({ reply });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  })

  app.get('/', (req, res) => {
    res.send('🚀 GPT API is running!');
  });
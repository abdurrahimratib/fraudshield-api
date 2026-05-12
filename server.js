const express = require('express');
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize the AI with your Secret Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', (req, res) => {
  res.send('FraudShield Factory is Online! 🛡️');
});

// THE FRAUD CHECK DOOR
app.post('/verify', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const model = ai.models.get("gemini-1.5-flash");
    
    const prompt = `Analyze this Bangladeshi e-commerce order for fraud:
    Name: ${name}
    Phone: ${phone}
    Address: ${address}
    
    Check for: random strings (like xxxx, asdf), fake addresses (hahaha, 12345), and test orders.
    Output ONLY JSON: {"score": 0-100, "reason": "why", "action": "approve/hold/reject"}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Send the AI's decision back to the website
    res.json(JSON.parse(responseText));

  } catch (error) {
    res.status(500).json({ error: "AI is sleeping. Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FraudShield active on ${PORT}`));
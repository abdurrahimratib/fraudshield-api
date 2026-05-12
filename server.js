const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Setup the AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('FraudShield Factory is Online! 🛡️');
});

app.post('/verify', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Analyze this order: Name: ${name}, Phone: ${phone}, Address: ${address}. 
    Check for fake info. Output ONLY JSON: {"score": 0-100, "reason": "why", "action": "approve/hold/reject"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // This cleans the AI response in case it adds extra symbols
    text = text.replace(/```json|```/g, "").trim();
    
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI is sleeping. Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
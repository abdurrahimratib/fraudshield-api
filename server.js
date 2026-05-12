const express = require('express');
const { GoogleGenerativeAI } = require("@google/genai");
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

    // 2. This is the fix: use 'getGenerativeModel' instead of 'models.get'
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Analyze this Bangladeshi e-commerce order for fraud:
    Name: ${name}
    Phone: ${phone}
    Address: ${address}
    Check for: random strings (xxxx, asdf), fake addresses (hahaha), and test orders.
    Output ONLY JSON: {"score": 0-100, "reason": "why", "action": "approve/hold/reject"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, ""); // Cleans the AI output
    
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("LOG ERROR:", error); // This helps you see the real error in Render logs
    res.status(500).json({ error: "AI is sleeping. Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FraudShield running on ${PORT}`));
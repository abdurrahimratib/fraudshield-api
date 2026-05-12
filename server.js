const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Use the correct Model ID for 2026
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('FraudShield Factory is Online! 🛡️');
});

app.post('/verify', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // FIX: Using the newest flash model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are FraudShield, a fraud detection bot for Bangladesh.
    Order Info: Name: ${name}, Phone: ${phone}, Address: ${address}.
    
    Task: Is this a fake order? Look for "test", "asdf", "hahaha", or random letters.
    Output ONLY JSON: {"score": 0-100, "reason": "...", "action": "approve/hold/reject"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json|```/g, "").trim();
    
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("DEBUG ERROR:", error.message);
    res.status(500).json({ error: "AI is sleeping. Check Render Logs." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FraudShield active on ${PORT}`));
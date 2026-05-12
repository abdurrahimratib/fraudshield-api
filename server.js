const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('FraudShield Factory is Online! 🛡️');
});

app.post('/verify', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a fraud detection assistant for a Bangladeshi e-commerce site. 
    Analyze this order: Name: ${name}, Phone: ${phone}, Address: ${address}. 
    Check for: Test orders, gibberish names (asdf), or fake addresses (hahaha). 
    Output ONLY valid JSON: {"score": 0-100, "reason": "short explanation", "action": "approve/hold/reject"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json|```/g, "").trim();
    
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("LOGS:", error);
    res.status(500).json({ error: "AI is sleeping. Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
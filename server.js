const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Initialize the AI with your Render Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('FraudShield Factory is Online! 🛡️');
});

// THE VERIFICATION GATE
app.post('/verify', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // Using the stable 2026 model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // UPDATED PROMPT: 10 is High (Good), 1 is Low (Fraud)
    const prompt = `You are FraudShield, an expert fraud detection agent for Bangladeshi E-commerce.
    
    Order Details:
    Name: ${name}
    Phone: ${phone}
    Address: ${address}
    
    INSTRUCTIONS:
    1. Assess if this is a real customer or a fake/test order.
    2. Give a Trust Score from 1 to 10.
       - 10: Definitely a real customer.
       - 1: Obvious fraud, gibberish (asdf, xoxo), or test data (hahaha, test123).
    3. Action Logic:
       - Score 8-10: "approve"
       - Score 4-7: "hold" (needs manual call)
       - Score 1-3: "reject"
    
    Output ONLY a raw JSON object:
    {"score": number, "reason": "short explanation in english", "action": "approve/hold/reject"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json|```/g, "").trim();
    
    // Send the decision back to your website
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("DEBUG ERROR:", error.message);
    res.status(500).json({ error: "AI is sleeping. Check Render Logs." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FraudShield Logic active on port ${PORT}`));
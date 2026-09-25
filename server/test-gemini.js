import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemini-1.5-flash-latest',
  'gemini-pro',
  'gemini-2.0-flash-001'
];

async function testAll() {
  for (const m of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Hello');
      console.log(`✅ SUCCESS with model: ${m} -> Response:`, res.response.text());
      break;
    } catch (err) {
      console.log(`❌ Failed ${m}:`, err.message);
    }
  }
}

testAll();

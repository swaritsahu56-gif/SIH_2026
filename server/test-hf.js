import 'dotenv/config';
import axios from 'axios';

async function testHuggingFace() {
  console.log("Testing HF_TOKEN from .env...");
  
  if (!process.env.HF_TOKEN) {
    console.error("❌ HF_TOKEN is missing in your .env file!");
    return;
  }

  try {
    const response = await axios.get("https://huggingface.co/api/whoami-v2", {
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` }
    });
    console.log("✅ Success! Authenticated as Hugging Face user:", response.data.name || response.data.username);
  } catch (error) {
    console.error("❌ Token failed:", error.response?.data || error.message);
  }
}

testHuggingFace();

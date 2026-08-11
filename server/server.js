import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from "axios";
import multer from "multer";
import fs from "fs";
import mongoose from 'mongoose';




const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
const upload = multer({
  storage: multer.memoryStorage() // keep uploads in memory to avoid filesystem issues on Render
});

// Diagnostic: print short prefix of GEMINI_API_KEY so you can verify Render/local env
// Remove this log once you've confirmed the correct key is loaded
console.log("Active GEMINI_API_KEY starts with:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0,5) : "KEY IS MISSING");

const dbURI = process.env.MONGO_URI;
if (dbURI) {
  mongoose.connect(dbURI)
    .then(() => console.log("Successfully connected to KisanMitra MongoDB database"))
    .catch((err) => console.error("Database connection error:", err));
} else {
  console.warn('MONGO_URI is not configured. Skipping MongoDB connection.');
}







const dashboard = {
  farm: 'North Field',
  location: 'Pune, Maharashtra',
  weather: { temperature: 28, condition: 'Partly cloudy', humidity: 68, rainChance: 10, wind: 12 },
  soilMoisture: 68,
  cropHealth: 92,
  yieldForecast: 12,
};

app.get('/api/health', (_, res) => res.json({ status: 'ok', mode: 'public demo', database: 'not required' }));
app.get('/api/dashboard', (_, res) => res.json(dashboard));
app.get('/api/weather', (_, res) => res.json(dashboard.weather));
app.get('/api/hyperlocal-weather', async (req, res) => {
  const latitude = Number(req.query.lat); const longitude = Number(req.query.lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ message: 'Latitude and longitude are required.' });
 try {
  const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
      hourly: 'temperature_2m,precipitation_probability,uv_index',
      timezone: 'auto'
    },
    timeout: 15000
  });

  const data = response.data;

  const nowIndex = data.hourly.time.reduce((closest, time, index) =>
    Math.abs(new Date(time) - new Date()) < Math.abs(new Date(data.hourly.time[closest]) - new Date()) ? index : closest, 0
  );
  const rain4h = Math.max(...data.hourly.precipitation_probability.slice(nowIndex, nowIndex + 5));
  const uv = data.hourly.uv_index[nowIndex] || 0;
  const minTemp = Math.min(...data.hourly.temperature_2m.slice(nowIndex, nowIndex + 24));
  const maxTemp = Math.max(...data.hourly.temperature_2m.slice(nowIndex, nowIndex + 24));

  const alerts = [];
  if (minTemp <= 3) alerts.push({ type: 'Frost warning', message: 'Temperatures may approach frost levels. Cover sensitive plants tonight.' });
  if (maxTemp >= 40 || data.current.temperature_2m >= 40) alerts.push({ type: 'Heatwave alert', message: 'High heat expected. Irrigate early morning and protect young plants.' });
  if (uv >= 8) alerts.push({ type: 'High UV', message: 'High UV today. Avoid spraying or transplanting at midday.' });

  const advice = rain4h >= 50
    ? `Rain probability is ${rain4h}% in the next 4 hours. Delay irrigation.`
    : data.current.relative_humidity_2m < 40
      ? 'Low humidity and no strong rain signal. Check soil moisture before irrigating.'
      : 'No immediate weather-based irrigation delay. Use your soil-moisture reading to decide.';

  res.json({
    source: 'open-meteo',
    updated: data.current.time,
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    wind: data.current.wind_speed_10m,
    rainProbability4h: rain4h,
    uvIndex: uv,
    alerts,
    advice
  });
} catch (error) {
  console.error('Hyperlocal weather failed:', error.message);
  res.status(502).json({ message: 'Live weather is unavailable right now.' });
}
});

// ---------- Satellite field view (Sentinel Hub / Copernicus Data Space Ecosystem) ----------
let sentinelToken = null;
let sentinelTokenExpiry = 0;

async function getSentinelToken() {
  if (sentinelToken && Date.now() < sentinelTokenExpiry) return sentinelToken;

  const response = await axios.post(
    'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SENTINEL_CLIENT_ID,
      client_secret: process.env.SENTINEL_CLIENT_SECRET
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  sentinelToken = response.data.access_token;
  sentinelTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000; // refresh 1 min early
  return sentinelToken;
}

app.get('/api/satellite-view', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  if (!process.env.SENTINEL_CLIENT_ID || !process.env.SENTINEL_CLIENT_SECRET) {
    return res.status(503).json({ message: 'Satellite imagery is not configured. Add SENTINEL_CLIENT_ID and SENTINEL_CLIENT_SECRET to your .env file.' });
  }

  // Small bounding box around the point (~1km per side)
  const delta = 0.005;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta];

  const mode = req.query.mode === 'ndvi' ? 'ndvi' : 'true-color';

  const trueColorEvalscript = `
//VERSION=3
function setup() {
  return { input: ["B04", "B03", "B02", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(sample) {
  // Gain + gentle gamma so the real photo isn't too dark, standard Sentinel-2 true-colour stretch
  const gain = 2.8;
  const gamma = 1.6;
  const r = Math.pow(Math.min(sample.B04 * gain, 1), 1 / gamma);
  const g = Math.pow(Math.min(sample.B03 * gain, 1), 1 / gamma);
  const b = Math.pow(Math.min(sample.B02 * gain, 1), 1 / gamma);
  return [r, g, b, sample.dataMask];
}`;

  const ndviEvalscript = `
//VERSION=3
function setup() {
  return { input: ["B04", "B08", "SCL", "dataMask"], output: { bands: 4 } };
}

// Colour ramp: bare soil / brown -> yellow -> green, matches common NDVI legends
const ramp = [
  [-0.2, [0.55, 0.42, 0.30]],
  [0.0,  [0.78, 0.64, 0.42]],
  [0.2,  [0.87, 0.80, 0.30]],
  [0.4,  [0.68, 0.80, 0.25]],
  [0.6,  [0.35, 0.68, 0.20]],
  [0.8,  [0.10, 0.45, 0.12]],
  [1.0,  [0.02, 0.28, 0.08]]
];

function ramped(ndvi) {
  for (let i = 0; i < ramp.length - 1; i++) {
    const v0 = ramp[i][0], c0 = ramp[i][1];
    const v1 = ramp[i + 1][0], c1 = ramp[i + 1][1];
    if (ndvi >= v0 && ndvi <= v1) {
      const t = (ndvi - v0) / (v1 - v0);
      return [
        c0[0] + t * (c1[0] - c0[0]),
        c0[1] + t * (c1[1] - c0[1]),
        c0[2] + t * (c1[2] - c0[2])
      ];
    }
  }
  return ndvi < ramp[0][0] ? ramp[0][1] : ramp[ramp.length - 1][1];
}

function evaluatePixel(sample) {
  // SCL scene classification: 3 = cloud shadow, 8/9 = cloud medium/high, 10 = thin cirrus, 11 = snow
  const cloudy = [3, 8, 9, 10, 11].indexOf(sample.SCL) !== -1;
  if (sample.dataMask === 0) {
    return [0.95, 0.95, 0.95, 1]; // outside coverage: light grey, fully visible so it's clearly "no data" not invisible
  }
  if (cloudy) {
    return [0.75, 0.75, 0.78, 1]; // cloud/shadow: mid-grey, fully visible so it's clearly "cloud" not invisible
  }
  const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  const rgb = ramped(ndvi);
  return [rgb[0], rgb[1], rgb[2], sample.dataMask];
}`;

  const evalscript = mode === 'ndvi' ? ndviEvalscript : trueColorEvalscript;

  try {
    const token = await getSentinelToken();

    const response = await axios.post(
      'https://sh.dataspace.copernicus.eu/api/v1/process',
      {
        input: {
          bounds: { bbox },
          data: [{
            type: 'sentinel-2-l2a',
            dataFilter: {
              timeRange: {
                from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                to: new Date().toISOString()
              },
              maxCloudCoverage: 80,
              mosaickingOrder: 'leastCC'
            }
          }]
        },
       output: {
  width: 1024,
  height: 1024,
  responses: [
    {
      identifier: 'default',
      format: {
        type: 'image/jpeg',
        quality: 95
      }
    }
  ]
},
        evalscript
      },
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'image/png' },
        responseType: 'arraybuffer',
        timeout: 20000
      }
    );

    res.set('Content-Type', 'image/png');
    res.send(response.data);
  } catch (error) {
    console.error('Satellite view failed:', error.response?.data?.toString() || error.message);
    res.status(502).json({ message: 'Satellite imagery is unavailable right now — likely no recent cloud-free pass, or free-tier quota reached.' });
  }
});

// ---------- Market prices (AGMARKNET via data.gov.in) ----------
const mandiResourceId = '9ef84268-d588-465a-a308-a864a43d0070';

const fallbackPrices = [
  
  {
    crop: 'Wheat',
    price: 2450,
    unit: '₹/quintal',
    market: 'Demo mandi',
    updated: 'Demo data'
  },
  {
    crop: 'Rice',
    price: 2180,
    unit: '₹/quintal',
    market: 'Demo mandi',
    updated: 'Demo data'
  }
];
// Market price cache
const marketPriceCache = new Map();
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes


app.get('/api/market-prices', async (req, res) => {
  const commodity = (req.query.crop || 'Wheat').trim();
  const state = (req.query.state || '').trim();

  const cacheKey = `${commodity.toLowerCase()}-${state.toLowerCase()}`;

  console.log(
    `Fetching official market prices: ${commodity} / ${state || 'All states'}`
  );

  // Check cache first
  const cached = marketPriceCache.get(cacheKey);

  if (
    cached &&
    cached.data.prices &&
    cached.data.prices.length > 0 &&
    Date.now() - cached.timestamp < CACHE_TIME
  ) {
    console.log(`Market prices served from cache: ${cacheKey}`);

    return res.json({
      ...cached.data,
      cached: true
    });
  }

  // Check API key
  if (!process.env.DATA_GOV_API_KEY) {
    console.log("DATA_GOV_API_KEY is missing");

    return res.json({
      source: "demo",
      message: "Government API key is not configured.",
      prices: fallbackPrices.filter(
        item => item.crop.toLowerCase() === commodity.toLowerCase()
      )
    });
  }

  try {
const params = {
  "api-key": process.env.DATA_GOV_API_KEY,
  format: "json",
  limit: 50,
  "filters[commodity]": commodity,
};

if (state) {
  params["filters[state]"] = state;
}

const response = await axios.get(
  `https://api.data.gov.in/resource/${mandiResourceId}`,
  {
    params,
    timeout: 15000
  }
);

  

    const records = response.data.records || [];

    const prices = records
      .map(record => ({
        crop: record.commodity || commodity,
        market:
          record.market ||
          record.market_name ||
          "Market unavailable",
        district: record.district || "",
        state: record.state || state,
        price: Number(
          record.modal_price ||
          record.modalprice ||
          0
        ),
        unit: "₹/quintal",
        updated:
          record.arrival_date ||
          record.price_date ||
          "Latest available"
      }))
      .filter(item => item.price > 0);

    const result = {
      source: "agmarknet",
      message: "Official AGMARKNET daily mandi prices",
      prices
    };

    // Save real prices
    if (prices.length > 0) {
      marketPriceCache.set(cacheKey, {
        timestamp: Date.now(),
        data: result
      });

      console.log(
        `Real market prices cached: ${cacheKey} (${prices.length} records)`
      );
    } else {
      console.log(
        `No prices returned for ${commodity} / ${state || "All states"}`
      );
    }

    return res.json(result);

  } catch (error) {
    console.error(
      "Market price API failed:",
      error.response?.data || error.message
    );

    // Rate limit
    if (error.response?.status === 429) {

      if (
        cached &&
        cached.data &&
        cached.data.prices &&
        cached.data.prices.length > 0
      ) {
        console.log(
          `Rate limit reached. Using cached prices: ${cacheKey}`
        );

        return res.json({
          ...cached.data,
          cached: true,
          message:
            "Government service is rate-limited. Showing recently cached prices."
        });
      }

      return res.json({
        source: "rate-limited",
        message:
          "Government mandi service is temporarily rate-limited. Please try again later.",
        prices: []
      });
    }

    return res.status(502).json({
      source: "unavailable",
      message:
        "Official mandi prices are temporarily unavailable.",
      prices: []
    });
  }
});






app.get('/api/recommendations', (_, res) => res.json([
  { title: 'Irrigation check', message: 'Soil moisture is optimal today. Check again tomorrow morning.' },
  { title: 'Crop health', message: 'Your wheat crop health score is good at 92/100.' },
  { title: 'Fertilizer suggestion', message: 'Consider applying nitrogen-based fertilizer for your wheat crop.' },
  { title: 'Pest management', message: 'No significant pest activity detected. Continue monitoring.' },
  { title: 'Weather alert', message: 'Rain is expected tomorrow. Adjust irrigation accordingly.' },
  { title: 'Sustainable farming tip', message: 'Consider crop rotation to maintain soil fertility and reduce pest pressure.' },
  { title: 'Market price update', message: 'Wheat prices have increased by 2.4% today. Consider selling if you have surplus.' },
  { title: 'Irrigation advice', message: 'Based on current weather conditions, it is recommended to irrigate your crops in the evening to minimize evaporation.' },
  { title: 'Fertilizer recommendation', message: 'For your wheat crop, a balanced NPK fertilizer with a ratio of 20:20:20 is suggested for optimal growth.' },
  { title: 'Pest management tip', message: 'Regularly inspect your crops for signs of pests and diseases. Early detection can prevent significant damage.' },
  {title: 'hello', message: 'hello,farmer! How can I assist you today?'},
  { title: 'Weather recommendation', message: 'Based on the current weather forecast, it is advisable to protect your crops from potential heavy rainfall by ensuring proper drainage in your fields.' },
  { title: 'should I irrigate my crops today?', message: 'Based on the current weather conditions and soil moisture levels, it is recommended to irrigate your crops today to maintain optimal growth and yield.' },
  { title: 'fertilizer suggestion for my wheat crop', message: 'For your wheat crop, it is recommended to apply a nitrogen-based fertilizer to promote healthy growth and maximize yield.' },
  { title: 'pest management advice for my tomato plants', message: 'For your tomato plants, it is advisable to regularly inspect for common pests such as aphids and whiteflies. Consider using organic insecticidal soap or neem oil for pest control.' },
  { title: 'sustainable farming practices for my farm', message: 'To promote sustainable farming practices on your farm, consider implementing crop rotation, cover cropping, and integrated pest management techniques. These practices can improve soil health and reduce environmental impact.' },
  { title: 'market price update for my crops', message: 'The current market prices for your crops are as follows: Wheat - ₹2450/quintal (up 2.4%), Rice - ₹2180/quintal (up 1.1%)' },
]));
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language = 'English' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing from environment');
    }

    // Build the prompt for Gemini
    const prompt = `You are KisanMitra AI, an agriculture assistant.\n\nReply in ${language}. Use simple farmer-friendly wording. If a diagnosis or treatment is uncertain, say so and advise contacting a local agriculture expert before using pesticides.\n\nHelp farmers with: Crop diseases, Fertilizers, Irrigation, Weather, Pest control, Sustainable farming.\n\nFarmer question: ${message}`;

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const replyText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.json({ reply: replyText });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      reply: "AI is not available right now."
    });
  }
});


app.post("/api/crop-doctor", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        result: JSON.stringify({
          disease: "Error",
          treatment: "No image uploaded. Please select a file."
        })
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing from .env file");
    }

    // When using memoryStorage, the file buffer is available at req.file.buffer
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are an expert agricultural scientist. Analyze this crop image. \
                Return ONLY JSON. Do not add any formatting (like \`\`\`json) or explanation. \
                Use exactly this format: \
                {"disease":"","confidence":"","severity":"","symptoms":"","cause":"","treatment":"","fertilizer":"","prevention":""} \
                If the crop is healthy, mention "Healthy Crop" in disease.`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json"
        }
      },
      { headers: { "Content-Type": "application/json" } }
    );


    const geminiOutput = response.data.candidates[0].content.parts[0].text;

    res.status(200).json({
      result: geminiOutput
    });

  } catch (err) {
    // no filesystem cleanup needed when using memoryStorage

    console.error("Gemini API Error:", err.response?.data?.error?.message || err.message);

    const fallbackJSON = {
      disease: "Analysis Failed",
      confidence: "0%",
      severity: "Error",
      symptoms: "N/A",
      cause: "AI Processing Error",
      treatment: "Gemini was unable to analyze this image. Make sure your GEMINI_API_KEY is valid.",
      fertilizer: "N/A",
      prevention: "Check the terminal console for detailed error logs."
    };

    res.status(200).json({
      result: JSON.stringify(fallbackJSON)
    });
  }
});



app.use((error, _, res, __) => { console.error(error); res.status(500).json({ message: 'Something went wrong. Please try again.' }); });

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Public demo API running on :${port}`);
});
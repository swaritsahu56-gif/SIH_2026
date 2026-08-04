import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

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
app.get('/api/market-prices', (_, res) => res.json([
  { crop: 'Wheat', price: 2450, unit: '₹/quintal', change: '+2.4%' },
  { crop: 'Rice', price: 2180, unit: '₹/quintal', change: '+1.1%' },
]));
app.get('/api/recommendations', (_, res) => res.json([
  { title: 'Irrigation check', message: 'Soil moisture is optimal today. Check again tomorrow morning.' },
  { title: 'Crop health', message: 'Your wheat crop health score is good at 92/100.' },
]));
app.use((error, _, res, __) => { console.error(error); res.status(500).json({ message: 'Something went wrong. Please try again.' }); });

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Public demo API running on :${port}`));

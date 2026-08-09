import { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Activity, Bell, Bot, ChevronDown, CloudSun, Droplets, LayoutDashboard, Leaf, LineChart, Map, Menu, Mic, ScanLine, Settings, Sprout, Sun, TrendingUp, Upload, Volume2 } from 'lucide-react';


const nav = [[LayoutDashboard, 'Overview'], [Map, 'My Fields'], [ScanLine, 'Crop Doctor'], [Droplets, 'Irrigation'], [Bot, 'AI Assistant'], [LineChart, 'Market prices'],[TrendingUp, 'Profit Calculator'], [Settings, 'Settings']];
const trend = [{ day:'Mon', value:38 }, { day:'Tue', value:44 }, { day:'Wed', value:41 }, { day:'Thu', value:55 }, { day:'Fri', value:48 }, { day:'Sat', value:67 }, { day:'Sun', value:64 }];
const Card = ({ children, className = '', style }) => 
<section className={`rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-5 shadow-card ${className}`} style={style}>
{children}
</section>;
export default function Dashboard() {
  const [open, setOpen] = useState(false); const [active, setActive] = useState('Overview'); const [api, setApi] = useState(null); const [language, setLanguage] = useState(() => localStorage.getItem('agri_language') || 'English'); const [showNotifications, setShowNotifications] = useState(false); const [showProfile, setShowProfile] = useState(false); const [notifications, setNotifications] = useState([{title:'Irrigation check due', text:'Check North Field soil moisture tomorrow at 7:00 AM.', time:'10 min ago'}, {title:'Weather update', text:'10% chance of rain in Pune today.', time:'1 hour ago'}, {title:'Crop health report', text:'Your weekly wheat health score is 92/100.', time:'Yesterday'}]); const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('agri_profile') || '{"name":"Farmer","phone":"","farm":"North Field"}'));
 const [darkMode, setDarkMode] = useState(
  () => localStorage.getItem("theme") === "dark"
);

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}, [darkMode]);
  useEffect(() => { fetch('http://localhost:5000/api/dashboard').then((r) => r.json()).then(setApi).catch(() => {}); }, []);
  useEffect(() => { const en = { 'Overview':'डैशबोर्ड', 'My Fields':'मेरे खेत', 'Crop Doctor':'फसल डॉक्टर', 'Irrigation':'सिंचाई', 'AI Assistant':'एआई सहायक', 'Settings':'सेटिंग्स', 'Good morning,':'सुप्रभात,', 'Your farm is looking healthy':'आपका खेत स्वस्थ है', 'Current weather':'मौजूदा मौसम', 'Soil moisture':'मिट्टी की नमी', 'Crop health':'फसल स्वास्थ्य', 'Yield forecast':'उपज पूर्वानुमान', 'Field sensor monitor':'फील्ड सेंसर मॉनिटर', 'Air humidity':'हवा की नमी', 'Sensor connected':'सेंसर जुड़ा है', 'Sensor paused':'सेंसर रुका है', 'GPS field location':'जीपीएस खेत स्थान', 'Use current GPS':'वर्तमान जीपीएस लें', 'Language / भाषा':'भाषा', 'Notifications':'सूचनाएं', 'Mark all read':'सभी को पढ़ा हुआ करें', 'Weather today':'आज का मौसम', 'Crop doctor':'फसल डॉक्टर', 'Upload a crop photo':'फसल की फोटो अपलोड करें', 'Scan crop now':'फसल स्कैन करें', 'Ask Krishi AI':'कृषि एआई से पूछें', 'Start conversation':'बातचीत शुरू करें', 'Back to overview':'डैशबोर्ड पर वापस', 'Add a field':'खेत जोड़ें', 'Save field':'खेत सहेजें', 'Irrigation recommendation':'सिंचाई सलाह', 'Market prices':'बाज़ार भाव', 'Farm assistant':'कृषि सहायक', 'Ask':'पूछें', 'Save preferences':'सेटिंग्स सहेजें' }; const hi = Object.fromEntries(Object.entries(en).map(([a,b])=>[b,a])); const convert = (node) => { if (node.nodeType !== 3) return; const value = node.nodeValue.trim(); const next = language === 'Hindi' ? en[value] : hi[value]; if (next) node.nodeValue = node.nodeValue.replace(value, next); }; const apply = () => { const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let node; while (node = walker.nextNode()) convert(node); }; apply(); const observer = new MutationObserver(() => apply()); observer.observe(document.body, { childList:true, subtree:true }); return () => observer.disconnect(); }, [language]);
  const choose = (label) => { setActive(label); setOpen(false); };

  const [fieldMapImage, setFieldMapImage] = useState(null);
  useEffect(() => {
    const load = (lat, lng) => setFieldMapImage(`http://localhost:5000/api/satellite-view?lat=${lat}&lng=${lng}`);
    const fallback = () => load(18.5204, 73.8567); // Pune fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        fallback,
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      fallback();
    }
  }, []);

  return <div className="min-h-screen bg-[#f6f8f5] dark:bg-slate-900 lg:flex"><aside className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-leaf-900 px-5 py-6 text-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center gap-3 px-3 text-xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-500"><Leaf/></span> AgriCopilot</div><div className="mt-11 space-y-1">{nav.map(([Icon, label]) => <button onClick={() => choose(label)} key={label} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${active === label ? 'bg-white/15 text-white' : 'text-leaf-100 hover:bg-white/10'}`}><Icon size={19}/>{label}</button>)}</div><div className="mt-auto rounded-xl bg-white/10 p-4"><p className="text-sm font-bold">Need field support?</p><p className="mt-1 text-xs leading-5 text-leaf-100">Ask Krishi, your AI farm assistant.</p><button onClick={() => choose('AI Assistant')} className="mt-3 text-xs font-bold text-lime-300">Start a conversation →</button></div></aside>{open && <button onClick={() => setOpen(false)} className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden"/>}
    <main className="min-w-0 flex-1"><header className="relative flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 sm:px-8"><div className="flex items-center gap-4"><button onClick={() => setOpen(true)} className="lg:hidden"><Menu/></button><div><p className="text-sm text-slate-500">Tuesday, 04 August 2026</p><h1 className="text-xl font-bold text-slate-800">Good morning, {user.name.split(' ')[0]} <span>🌱</span></h1></div></div><div className="flex items-center gap-4"><button onClick={() => setShowNotifications(!showNotifications)} className="relative rounded-full bg-slate-100 p-2.5"><Bell size={18}/>{notifications.length > 0 && <i className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"/>}</button><button onClick={() => setShowProfile(true)} className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-full bg-leaf-100 font-bold text-leaf-700">{user.name[0]}</span><ChevronDown size={16}/></button></div>{showNotifications && <div className="absolute right-5 top-[72px] z-20 w-[min(92vw,370px)] rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl"><div className="flex items-center justify-between"><b className="text-slate-800">Notifications</b><button onClick={() => setNotifications([])} className="text-xs font-bold text-leaf-600">Mark all read</button></div>{notifications.length ? <div className="mt-3 divide-y">{notifications.map((n, i) => <div key={i} className="py-3"><div className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-leaf-500"/><div><p className="text-sm font-bold text-slate-700">{n.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{n.text}</p><p className="mt-1 text-xs text-slate-400">{n.time}</p></div></div></div>)}</div> : <p className="py-8 text-center text-sm text-slate-500">You’re all caught up.</p>}</div>}</header>{showProfile && <ProfileModal user={user} onSave={(next) => { setUser(next); localStorage.setItem('agri_profile', JSON.stringify(next)); setShowProfile(false); }} onClose={() => setShowProfile(false)}/>} 
      <div className="mx-auto max-w-[1600px] p-5 sm:p-8">{active !== 'Overview' ? <FeatureView
  title={active}
  onBack={() => choose('Overview')}
  darkMode={darkMode}
  setDarkMode={setDarkMode}
/>
: <><div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium text-leaf-600">FARM OVERVIEW</p><h2 className="brand-serif text-3xl text-slate-800">Your farm is looking healthy</h2>{api && <p className="mt-1 text-xs text-slate-400">Live demo API connected · {api.location}</p>}</div><button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600">This week <ChevronDown className="ml-2 inline" size={16}/></button></div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<CloudSun/>} label="Current weather" value="28°" detail="Partly cloudy · Pune" tint="bg-sky-50 text-sky-600"/><Metric icon={<Droplets/>} label="Soil moisture" value="68%" detail="Optimal range" tint="bg-cyan-50 text-cyan-600"/><Metric icon={<Sprout/>} label="Crop health" value="Good" detail="92% health score" tint="bg-leaf-50 text-leaf-600"/><Metric icon={<TrendingUp/>} label="Yield forecast" value="+12%" detail="vs. last season" tint="bg-amber-50 text-amber-600"/></div>
        <SensorMonitor/>
        <HyperlocalWeather/>
        <SatelliteView/>
        <GpsPanel/>
        <LanguagePanel onChange={setLanguage}/>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.9fr]"><Card
  className="field-map min-h-[330px] overflow-hidden relative"
  style={fieldMapImage ? { backgroundImage: `url(${fieldMapImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
><div className="absolute inset-0 bg-gradient-to-t from-leaf-900/40 to-transparent"/><div className="relative flex justify-between"><div><p className="text-sm font-bold text-leaf-900">North field</p><p className="text-xs text-leaf-700">Wheat · 12.4 acres</p></div><span className="rounded-lg bg-white/80 px-3 py-2 text-xs font-bold text-leaf-700"><Map className="mr-1 inline" size={15}/> Field map</span></div><div className="absolute bottom-5 left-5 rounded-xl bg-white p-4 shadow-lg"><p className="text-xs text-slate-500">FIELD HEALTH</p><p className="mt-1 text-2xl font-bold text-leaf-700">92 <span className="text-sm">/ 100</span></p><div className="mt-2 h-1.5 w-32 overflow-hidden rounded bg-slate-100"><div className="h-full w-[92%] rounded bg-leaf-500"/></div></div><span className="absolute right-[35%] top-[45%] grid h-11 w-11 place-items-center rounded-full border-4 border-white bg-leaf-600 text-white shadow-lg"><Sprout size={20}/></span></Card>
          <Card><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-slate-800">Weather today</p><p className="mt-1 text-xs text-slate-500">Pune, Maharashtra</p></div><button className="text-leaf-600"><ChevronDown size={18}/></button></div><div className="mt-4 flex items-center gap-5"><div className="sun grid h-16 w-16 place-items-center rounded-full"><Sun className="text-white"/></div><div><span className="text-4xl font-bold text-slate-800">28°</span><p className="text-sm text-slate-500">Feels like 30°</p></div></div><div className="mt-5 grid grid-cols-3 border-t border-slate-100 pt-4 text-center text-xs"><div><Droplets className="mx-auto mb-1 text-sky-500" size={17}/><b>68%</b><p className="text-slate-400">Humidity</p></div><div><CloudSun className="mx-auto mb-1 text-slate-500" size={17}/><b>10%</b><p className="text-slate-400">Rain</p></div><div><TrendingUp className="mx-auto mb-1 text-leaf-600" size={17}/><b>12 km/h</b><p className="text-slate-400">Wind</p></div></div></Card></div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr_.9fr]"><Card><div className="flex justify-between"><div><p className="font-bold text-slate-800">Soil moisture trend</p><p className="mt-1 text-xs text-slate-500">Last 7 days · North field</p></div><span className="text-sm font-bold text-leaf-600">68%</span></div><div className="mt-3 h-40"><ResponsiveContainer><AreaChart data={trend}><defs><linearGradient id="moisture" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2c9a59" stopOpacity=".28"/><stop offset="100%" stopColor="#2c9a59" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fontSize:11, fill:'#94a3b8'}}/><Tooltip/><Area dataKey="value" stroke="#24854b" strokeWidth={3} fill="url(#moisture)"/></AreaChart></ResponsiveContainer></div></Card><CropDoctor/><Assistant/></div></>}
      </div></main></div>;
}
function Metric({ icon, label, value, detail, tint }) { return <Card><div className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}>{icon}</div><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><div className="mt-1 flex items-end gap-2"><b className="text-2xl text-slate-800">{value}</b></div><p className="mt-1 text-xs text-slate-500">{detail}</p></Card>; }
function ProfileModal({ user, onSave, onClose }) { const [form, setForm] = useState(user); return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-5"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-leaf-600">FARMER PROFILE</p><h2 className="brand-serif text-3xl text-slate-800">Your profile</h2></div><button onClick={onClose} className="text-xl text-slate-400">×</button></div><div className="mt-5 space-y-4"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Farmer name" className="w-full rounded-lg border p-3"/><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone number" className="w-full rounded-lg border p-3"/><input value={form.farm} onChange={e=>setForm({...form,farm:e.target.value})} placeholder="Farm name" className="w-full rounded-lg border p-3"/><button onClick={()=>onSave(form)} className="w-full rounded-lg bg-leaf-600 py-3 font-bold text-white">Save profile</button></div></div></div>; }
function SensorMonitor() { const [humidity, setHumidity] = useState(68); const [moisture, setMoisture] = useState(68); const [connected, setConnected] = useState(true); useEffect(() => { if (!connected) return; const id = setInterval(() => { setHumidity(v => Math.max(35, Math.min(95, v + (Math.random() > .5 ? 1 : -1)))); setMoisture(v => Math.max(20, Math.min(90, v + (Math.random() > .5 ? 1 : -1)))); }, 8000); return () => clearInterval(id); }, [connected]); return <Card className="mt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Activity size={18} className="text-leaf-600"/><p className="font-bold text-slate-800">Field sensor monitor</p></div><p className="mt-1 text-xs text-slate-500">North Field · Updated every 8 seconds</p></div><button onClick={() => setConnected(!connected)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${connected ? 'bg-leaf-50 text-leaf-700' : 'bg-slate-100 text-slate-600'}`}><span className={`mr-1 inline-block h-2 w-2 rounded-full ${connected ? 'bg-leaf-500' : 'bg-slate-400'}`}/> {connected ? 'Sensor connected' : 'Sensor paused'}</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><SensorReading label="Air humidity" value={humidity} icon={<CloudSun size={21}/>} color="bg-sky-50 text-sky-700" status={humidity > 80 ? 'High humidity — watch for fungal disease' : 'Healthy humidity range'}/><SensorReading label="Soil moisture" value={moisture} icon={<Droplets size={21}/>} color="bg-cyan-50 text-cyan-700" status={moisture < 45 ? 'Low — irrigation recommended' : 'Optimal watering level'}/></div></Card>; }
function SensorReading({ label, value, icon, color, status }) { return <div className={`rounded-xl p-4 ${color}`}><div className="flex items-center justify-between"><span className="font-bold">{label}</span>{icon}</div><div className="mt-4 flex items-end justify-between"><b className="text-3xl">{value}%</b><span className="text-xs font-medium">{status}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-current" style={{width:`${value}%`}}/></div></div>; }
function HyperlocalWeather() { const [weather, setWeather] = useState(null); const [status, setStatus] = useState('Use GPS to load live farm weather.'); const load = () => { if (!navigator.geolocation) return setStatus('GPS is not supported by this browser.'); setStatus('Getting your GPS weather…'); navigator.geolocation.getCurrentPosition(async (position) => { try { const response = await fetch(`http://localhost:5000/api/hyperlocal-weather?lat=${position.coords.latitude}&lng=${position.coords.longitude}`); const data = await response.json(); if (!response.ok) throw new Error(data.message); setWeather(data); setStatus('Live weather for your current location'); } catch (error) { setStatus(error.message || 'Live weather could not be loaded.'); } }, () => setStatus('Allow location access to load hyperlocal weather.'), { enableHighAccuracy: true, timeout: 10000 }); }; return <Card className="mt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-slate-800">Hyperlocal weather intelligence</p><p className="mt-1 text-xs text-slate-500">{status}</p></div><button onClick={load} className="rounded-lg bg-leaf-600 px-4 py-2.5 text-sm font-bold text-white"><CloudSun className="mr-1 inline" size={16}/> Update weather</button></div>{weather && <><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><WeatherStat label="Temperature" value={`${weather.temperature}°C`}/><WeatherStat label="Rain next 4h" value={`${weather.rainProbability4h}%`}/><WeatherStat label="UV index" value={weather.uvIndex}/><WeatherStat label="Wind speed" value={`${weather.wind} km/h`}/><WeatherStat label="Humidity" value={`${weather.humidity}%`}/></div><div className="mt-4 rounded-xl bg-leaf-50 p-4 text-sm text-leaf-900"><b>AI farm advice</b><p className="mt-1">{weather.advice}</p></div>{weather.alerts.length > 0 && <div className="mt-3 space-y-2">{weather.alerts.map((alert) => <div key={alert.type} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><b>{alert.type}:</b> {alert.message}</div>)}</div>}</>}</Card>; }
function WeatherStat({ label, value }) { return <div className="rounded-xl bg-sky-50 p-3 text-center"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-800">{value}</p></div>; }
function SatelliteView() {
  const [coords, setCoords] = useState(null);
  const [mode, setMode] = useState('true-color');
  const [status, setStatus] = useState('Use GPS to load a satellite view of your field.');

  const load = () => {
    if (!navigator.geolocation) return setStatus('GPS is not supported by this browser.');
    setStatus('Fetching satellite imagery…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus('Real satellite photo of your field location.');
      },
      () => setStatus('Allow location access to load satellite imagery.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectMode = (next) => {
    setMode(next);
    if (coords) {
      setStatus(next === 'ndvi'
        ? 'NDVI vegetation view — green is healthy, grey is cloud/stressed or bare soil.'
        : 'Real satellite photo of your field location.');
    }
  };

  const imageUrl = coords
    ? `http://localhost:5000/api/satellite-view?lat=${coords.lat}&lng=${coords.lng}&mode=${mode}`
    : null;

  return (
    <Card className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-slate-800">Satellite field view</p>
          <p className="mt-1 text-xs text-slate-500">{status}</p>
        </div>
        <button onClick={load} className="rounded-lg bg-leaf-600 px-4 py-2.5 text-sm font-bold text-white">
          <Map className="mr-1 inline" size={16} /> Load satellite view
        </button>
      </div>
      {coords && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => selectMode('true-color')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${mode === 'true-color' ? 'bg-leaf-600 text-white' : 'bg-leaf-50 text-leaf-700'}`}
          >
            Real photo
          </button>
          <button
            onClick={() => selectMode('ndvi')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${mode === 'ndvi' ? 'bg-leaf-600 text-white' : 'bg-leaf-50 text-leaf-700'}`}
          >
            Vegetation health (NDVI)
          </button>
        </div>
      )}
      {imageUrl && (
       <img
  key={imageUrl}
  src={imageUrl}
  alt="Satellite view of field"
  className="mt-4 w-[350px] h-[250px] object-cover rounded-xl border border-slate-200"
  onError={() => setStatus('Could not load satellite imagery for this location right now.')}
/>
      )}
    </Card>
  );
}
function GpsPanel() { const [location, setLocation] = useState(null); const locate = () => { if (!navigator.geolocation) return setLocation({ error: 'GPS is not supported by this browser.' }); navigator.geolocation.getCurrentPosition(async (p) => { const base = { lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5), accuracy: Math.round(p.coords.accuracy), address: 'Finding address…' }; setLocation(base); try { const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.coords.latitude}&lon=${p.coords.longitude}`); const place = await response.json(); const next = { ...base, address: place.display_name || 'Address unavailable for this GPS point.' }; setLocation(next); localStorage.setItem('agri_location', next.address); } catch { setLocation({ ...base, address: 'Address lookup unavailable; coordinates were saved.' }); } }, () => setLocation({ error: 'Location permission was not granted. Enable it in your browser and try again.' }), { enableHighAccuracy: true, timeout: 10000 }); }; return <Card className="mt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-slate-800">GPS field location</p><p className="mt-1 text-xs text-slate-500">Set the current farm position for location-based advice.</p></div><button onClick={locate} className="rounded-lg bg-leaf-600 px-4 py-2.5 text-sm font-bold text-white"><Map className="mr-1 inline" size={16}/> Use current GPS</button></div>{location && <div className={`mt-4 rounded-xl p-4 text-sm ${location.error ? 'bg-amber-50 text-amber-900' : 'bg-leaf-50 text-leaf-900'}`}>{location.error || <><b>Field location saved</b><p className="mt-1">{location.address}</p><p className="mt-1 text-xs">Latitude {location.lat}, Longitude {location.lng} · accuracy around {location.accuracy} m</p></>}</div>}</Card>; }
function LanguagePanel({ onChange }) { const [language, setLanguage] = useState(() => localStorage.getItem('agri_language') === 'Hindi' ? 'Hindi' : 'English'); const copy = { English: 'Your farm is looking healthy', Hindi: 'आपका खेत स्वस्थ है' }; const select = (next) => { setLanguage(next); localStorage.setItem('agri_language', next); onChange(next); }; return <Card className="mt-5"><p className="font-bold text-slate-800">Language / भाषा</p><p className="mt-1 text-xs text-slate-500">Choose English or Hindi for farmer guidance and future alerts.</p><div className="mt-4 flex flex-wrap gap-2">{['English','Hindi'].map(item => <button key={item} onClick={() => select(item)} className={`rounded-lg px-4 py-2 text-sm font-bold ${language === item ? 'bg-leaf-600 text-white' : 'bg-leaf-50 text-leaf-700'}`}>{item}</button>)}</div><p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">Preview: {copy[language]}</p></Card>; }


function CropDoctor() {
  const fileInput = useRef();

  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);

  const scanCrop = async () => {
    if (!image) {
      alert("Please upload a crop image first.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch(
        "http://localhost:5000/api/crop-doctor",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

     try {
  const cleanJSON = data.result
    .replace("```json", "")
    .replace("```", "")
    .trim();

  setResult(JSON.parse(cleanJSON));

} catch(error) {
  console.log(error);

  setResult({
    disease: "Unknown",
    treatment: data.result
  });
}
    } catch (err) {
      console.error(err);
      setResult("Unable to analyze image.");
    }

    setLoading(false);
  };

  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
          <ScanLine size={19} />
        </span>

        <div>
          <p className="font-bold text-slate-800">Crop Doctor</p>
          <p className="text-xs text-slate-500">
            AI-powered disease detection
          </p>
        </div>
      </div>

      <input
        ref={fileInput}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selected = e.target.files[0];

          if (selected) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
              alert('Please upload a JPG, PNG, or WebP crop-leaf photo.');
              return;
            }
            if (selected.size > 10 * 1024 * 1024) {
              alert('Please choose an image smaller than 10 MB.');
              return;
            }
            setImage(selected);
            setName(selected.name);
          }
        }}
      />

      <button
        onClick={() => fileInput.current.click()}
        className="mt-4 w-full rounded-xl border-2 border-dashed border-leaf-200 bg-leaf-50 p-4 text-center"
      >
        <Upload className="mx-auto text-leaf-600" size={21} />

        <p className="mt-2 text-sm font-bold text-leaf-700">
          {name || "Upload Crop Image"}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          JPG, PNG supported
        </p>
      </button>

      <button
        onClick={scanCrop}
        disabled={loading}
        className="mt-3 w-full rounded-lg bg-leaf-600 py-2 text-sm font-bold text-white"
      >
        {loading ? "Analyzing..." : "Scan Crop"}
      </button>

      {loading && (
        <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm">
          🤖 AI is analyzing your crop...
        </div>
      )}

      {result && (
<div className="mt-4 space-y-3">

<div className="rounded-xl bg-red-50 p-3">
<h3 className="font-bold">🌿 Disease</h3>
<p>{result.disease || "Healthy Crop"}</p>
</div>


<div className="rounded-xl bg-blue-50 p-3">
<h3 className="font-bold">📊 Confidence</h3>
<p>{result.confidence}</p>
</div>


<div className="rounded-xl bg-yellow-50 p-3">
<h3 className="font-bold">⚠️ Severity</h3>
<p>{result.severity}</p>
</div>


<div className="rounded-xl bg-green-50 p-3">
<h3 className="font-bold">💊 Treatment</h3>
<p>{result.treatment}</p>
</div>


<div className="rounded-xl bg-emerald-50 p-3">
<h3 className="font-bold">🌱 Fertilizer</h3>
<p>{result.fertilizer}</p>
</div>


<div className="rounded-xl bg-slate-50 p-3">
<h3 className="font-bold">🛡 Prevention</h3>
<p>{result.prevention}</p>
</div>

</div>
)}
    </Card>
  );
}
function ProfitCalculator() {

  const [data, setData] = useState({
   area: "",
yield: "",
price: "",
seed: "",
fertilizer: "",
water: "",
other: ""
  });


  const income = data.area * data.yield * data.price;

  const cost =
    Number(data.seed) +
    Number(data.fertilizer) +
    Number(data.water) +
    Number(data.other);

  const profit = income - cost;


const fields = [
  {
    key: "crop",
    label: "Crop Name",
    type: "text",
    placeholder: " crop name e.g. Wheat"
  },
  {
    key: "area",
    label: "Land Area (acre)",
    type: "number",
    placeholder: "land area e.g. 5"
  },
  {
    key: "yield",
    label: "Expected Yield (quintal/acre)",
    type: "number",
    placeholder: "Expected Yield (quintal/acre) e.g. 25"
  },
  {
    key: "price",
    label: "Market Price (₹/quintal)",
    type: "number",
    placeholder: "Market Price (₹/quintal) e.g. 2450",
    min: 1
  },
  {
    key: "seed",
    label: "Seed Cost (₹)",
    type: "number",
    placeholder: "Seed Cost (₹) e.g. 3000",
    min: 0
  },
  {
    key: "fertilizer",
    label: "Fertilizer Cost (₹)",
    type: "number",
    placeholder: "Fertilizer Cost (₹) e.g. 5000",
    min: 0
  },
  {
    key: "water",
    label: "Irrigation Cost (₹)",
    type: "number",
    placeholder: "Irrigation Cost (₹) e.g. 2000",
    min: 0
  },
  {
    key: "other",
    label: "Other Expenses (₹)",
    type: "number",
    placeholder: "Other Expenses (₹) e.g. 1000",
    min: 0
  }
];

  return (
    <Card>

      <p className="text-sm font-semibold text-leaf-600">
        FARM BUSINESS
      </p>

      <h2 className="brand-serif text-3xl text-slate-800">
        Crop Profit Calculator
      </h2>


      <div className="mt-6 grid gap-4 max-w-xl">

        {
          fields.map((field)=>(
           <input
  key={field.key}
  type={field.type}
  placeholder={field.placeholder}
  value={data[field.key]}
  min={field.type === "number" ? 0 : undefined}
  onChange={(e) =>
    setData({
      ...data,
      [field.key]:
        field.type === "number"
          ? Math.max(0, Number(e.target.value))
          : e.target.value,
    })
  }
  className="rounded-lg border p-3"
/>
          ))
        }

      </div>


      <div className="mt-6 rounded-xl bg-leaf-50 p-5">

        <p>
          Expected Income:
          <b> ₹{income}</b>
        </p>

        <p>
          Total Expense:
          <b> ₹{cost}</b>
        </p>


        <hr className="my-3"/>


        <h3 className="text-xl font-bold text-leaf-700">
          Estimated Profit:
          ₹{profit}
        </h3>

      </div>


    </Card>
  );
}
function FeatureView({
  title,
  onBack,
  darkMode,
  setDarkMode,
}) {
  return (
    <>
      <button
        onClick={onBack}
        className="mb-5 text-sm font-bold text-leaf-700"
      >
        ← Back to overview
      </button>

      {title === "My Fields" && <Fields />}

      {title === "Crop Doctor" && <CropDoctor />}

      {title === "Irrigation" && <Irrigation />}

      {title === "Market prices" && <Market />}

      {title === "Profit Calculator" && <ProfitCalculator />}

      {title === "Settings" && (
        <SettingsView
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      {title === "AI Assistant" && <AssistantChat />}
    </>
  );
}

function Fields() { const [fields, setFields] = useState(() => JSON.parse(localStorage.getItem('agri_fields') || '[{"name":"North Field","crop":"Wheat","area":"12.4"}]')); const [form, setForm] = useState({name:'', crop:'Wheat', area:''}); const save = () => { if (!form.name || !form.area) return; const next = [...fields, form]; setFields(next); localStorage.setItem('agri_fields', JSON.stringify(next)); setForm({name:'',crop:'Wheat',area:''}); }; return <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><Card><p className="text-sm font-semibold text-leaf-600">FIELD REGISTER</p><h2 className="brand-serif text-3xl text-slate-800">My fields</h2><div className="mt-5 space-y-3">{fields.map((f,i) => <div key={i} className="flex items-center justify-between rounded-xl bg-leaf-50 p-4"><div><b>{f.name}</b><p className="text-sm text-slate-500">{f.crop} · {f.area} acres</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-leaf-700">Healthy</span></div>)}</div></Card><Card><p className="font-bold text-slate-800">Add a field</p><div className="mt-4 space-y-3"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Field name" className="w-full rounded-lg border p-3"/><input value={form.crop} onChange={e=>setForm({...form,crop:e.target.value})} placeholder="Crop" className="w-full rounded-lg border p-3"/><input value={form.area} onChange={e=>setForm({...form,area:e.target.value})} placeholder="Area in acres" type="number" className="w-full rounded-lg border p-3"/><button onClick={save} className="w-full rounded-lg bg-leaf-600 py-3 font-bold text-white">Save field</button></div></Card></div>; }
function Irrigation() { const [moisture,setMoisture]=useState(68); const need=moisture<45; return <Card><p className="text-sm font-semibold text-leaf-600">WATER PLANNER</p><h2 className="brand-serif text-3xl text-slate-800">Irrigation recommendation</h2><div className="mt-6 max-w-xl"><label className="font-bold">Current soil moisture: {moisture}%</label><input className="mt-4 w-full accent-[#2c9a59]" type="range" min="0" max="100" value={moisture} onChange={e=>setMoisture(e.target.value)}/><div className={`mt-5 rounded-xl p-5 ${need?'bg-amber-50 text-amber-900':'bg-leaf-50 text-leaf-900'}`}><b>{need ? 'Irrigation recommended today' : 'No irrigation needed today'}</b><p className="mt-1 text-sm">{need ? 'Apply around 20–25 mm of water in the early morning.' : 'Soil moisture is within the healthy range. Recheck tomorrow morning.'}</p></div></div></Card>; }

function Market() { const [crop, setCrop] = useState('Wheat'); const [state, setState] = useState(''); const [data, setData] = useState({ prices: [], source: '', message: '' }); const [loading, setLoading] = useState(false); const load = async () => { setLoading(true); try { const query = new URLSearchParams({ crop }); if (state) query.set('state', state); const response = await fetch(`http://localhost:5000/api/market-prices?${query}`); setData(await response.json()); } catch { setData({ prices: [], source: 'unavailable', message: 'Could not reach the market-price service.' }); } finally { setLoading(false); } }; useEffect(() => { load(); }, []); return <Card><p className="text-sm font-semibold text-leaf-600">LOCAL MANDI</p><h2 className="brand-serif text-3xl text-slate-800">Market prices</h2><div className="mt-5 grid gap-3 sm:grid-cols-3"><select value={crop} onChange={e=>setCrop(e.target.value)} className="rounded-lg border p-3"><option>Wheat</option><option>Rice</option><option>Maize</option><option>Tomato</option><option>Onion</option></select><input value={state} onChange={e=>setState(e.target.value)} placeholder="State, e.g. Maharashtra" className="rounded-lg border p-3"/><button onClick={load} className="rounded-lg bg-leaf-600 px-4 py-3 font-bold text-white">{loading ? 'Loading…' : 'Get latest prices'}</button></div><p className={`mt-4 text-xs ${data.source === 'agmarknet' ? 'text-leaf-700' : 'text-amber-700'}`}>{data.message}</p><div className="mt-3 divide-y">{data.prices?.length ? data.prices.map((i,index)=><div key={`${i.market}-${index}`} className="flex justify-between py-4"><div><b>{i.crop} · {i.market}</b><p className="text-sm text-slate-500">{i.district && `${i.district}, `}{i.state} · {i.updated}</p></div><div className="text-right"><b>₹{i.price}</b><p className="text-sm text-slate-500">{i.unit}</p></div></div>) : !loading && <p className="py-8 text-center text-sm text-slate-500">No prices found. Try another crop or state.</p>}</div></Card>; }

function SettingsView({ darkMode, setDarkMode }) {
  const [saved, setSaved] = useState(false);

  const [language, setLanguage] = useState(
    localStorage.getItem("agri_language") === "Hindi"
      ? "Hindi"
      : "English"
  );

  const save = () => {
    localStorage.setItem(
      "agri_location",
      document.getElementById("location").value
    );

    localStorage.setItem("agri_language", language);

    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );

    setSaved(true);

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Card>
      <p className="text-sm font-semibold text-leaf-600">
        PREFERENCES
      </p>

      <h2 className="brand-serif text-3xl text-slate-800">
        Settings
      </h2>

      <div className="mt-6 max-w-md space-y-4">

        <label>Farm location</label>

        <input
          id="location"
          defaultValue={localStorage.getItem("agri_location") || ""}
          className="w-full rounded-lg border p-3"
        />

        <label>Language</label>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-lg border p-3"
        >
          <option>English</option>
          <option>Hindi</option>
        </select>

        <label className="flex items-center gap-3">
          <input
  type="checkbox"
  checked={darkMode}
  onChange={(e) => setDarkMode(e.target.checked)}
/>
          Enable dark mode
        </label>

        <button
          onClick={save}
          className="rounded-lg bg-leaf-600 px-5 py-3 font-bold text-white"
        >
          Save Preferences
        </button>

        {saved && (
          <p className="text-green-600 font-medium">
            Preferences saved successfully!
          </p>
        )}
      </div>
    </Card>
  );
}


function AssistantChat() {
  const [q, setQ] = useState('');
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState([{ from: 'ai', text: 'Namaste! I am Krishi AI. Ask me about crops, irrigation, weather, or farming.' }]);
  const [listening, setListening] = useState(false);
  const languageCode = { English: 'en-IN', Hindi: 'hi-IN', Marathi: 'mr-IN', Punjabi: 'pa-IN' }[language];

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    window.speechSynthesis.speak(utterance);
  };
  const ask = async (question = q) => {
    if (!question.trim()) return;
    setMessages((previous) => [...previous, { from: 'user', text: question }, { from: 'ai', text: 'Thinking…', pending: true }]);
    setQ('');

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          language,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'I could not generate an answer. Please try again.';
      setMessages((previous) => [...previous.filter((item) => !item.pending), { from: 'ai', text: reply }]);
    } catch (error) {
      setMessages((previous) => [...previous.filter((item) => !item.pending), { from: 'ai', text: 'AI server is not running. Start the backend and make sure Ollama is available.' }]);
    }
  };
  const voiceInput = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return setMessages((previous) => [...previous, { from: 'ai', text: 'Voice input is not supported by this browser. Please type your question.' }]);
    const recognition = new Recognition(); recognition.lang = languageCode; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true); recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setMessages((previous) => [...previous, { from: 'ai', text: 'I could not hear that. Please allow microphone access and try again.' }]); };
    recognition.onresult = (event) => setQ(event.results[0][0].transcript);
    recognition.start();
  };

  return (
    <Card>
      <p className="text-sm font-semibold text-leaf-600">
        KRISHI AI
      </p>

      <h2 className="brand-serif text-3xl text-slate-800">
        Farm assistant
      </h2>

      <button onClick={() => setMessages([{ from: 'ai', text: 'Namaste! I am Krishi AI. Ask me about crops, irrigation, weather, or farming.' }])} className="mt-3 rounded-lg border border-leaf-200 px-3 py-2 text-xs font-bold text-leaf-700">Reset chat</button>

      <div className="mt-4 flex flex-wrap gap-2">
        {['English', 'Hindi', 'Marathi', 'Punjabi'].map((item) => <button key={item} onClick={() => setLanguage(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${language === item ? 'bg-leaf-600 text-white' : 'bg-leaf-50 text-leaf-700'}`}>{item}</button>)}
      </div>
      <div className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-4">
        {messages.map((item, index) => <div key={index} className={`max-w-[88%] rounded-xl px-4 py-3 text-sm ${item.from === 'user' ? 'ml-auto bg-leaf-600 text-white' : 'bg-leaf-100 text-leaf-900'}`}><div className="flex items-start gap-2"><span className="flex-1">{item.text}</span>{item.from === 'ai' && !item.pending && <button onClick={() => speak(item.text)} title="Read aloud"><Volume2 size={16}/></button>}</div></div>)}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask a farm question..."
          className="flex-1 rounded-lg border p-3"
        />
        <button onClick={voiceInput} title="Voice input" className={`rounded-lg px-3 ${listening ? 'bg-red-500 text-white' : 'bg-leaf-100 text-leaf-700'}`}><Mic size={19}/></button>

        <button
          onClick={() => ask()}
          className="rounded-lg bg-leaf-600 px-5 font-bold text-white"
        >
          Ask
        </button>
      </div>
    </Card>
  );
}
function Assistant() { return <Card className="bg-leaf-700 text-white"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><Bot size={19}/></span><div><p className="font-bold">Ask Krishi AI</p><p className="text-xs text-leaf-100">Your farming companion</p></div></div><p className="mt-5 text-sm leading-6 text-leaf-50">“Should I irrigate my wheat field today?”</p><button className="mt-5 w-full rounded-lg bg-white py-2 text-sm font-bold text-leaf-700">Start conversation</button></Card>; }



import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LOTS = [
  { name:"MG Road Central Park",        type:"Mall",        spaces:300 },
  { name:"Jayanagar Shopping Mall",     type:"Mall",        spaces:250 },
  { name:"Bannerghatta Grand Mall",     type:"Mall",        spaces:400 },
  { name:"Orion Mall Rajajinagar",      type:"Mall",        spaces:500 },
  { name:"Phoenix Marketcity",          type:"Mall",        spaces:600 },
  { name:"Mantri Square Mall",          type:"Mall",        spaces:450 },
  { name:"Forum Koramangala",           type:"Mall",        spaces:350 },
  { name:"Whitefield IT Hub",           type:"Office",      spaces:500 },
  { name:"Koramangala Square",          type:"Office",      spaces:200 },
  { name:"HSR Layout Hub",              type:"Office",      spaces:180 },
  { name:"Electronic City Park",        type:"Office",      spaces:600 },
  { name:"Manyata Tech Park",           type:"Office",      spaces:800 },
  { name:"Bagmane Tech Park",           type:"Office",      spaces:700 },
  { name:"RMZ Ecospace",               type:"Office",      spaces:550 },
  { name:"Yelahanka Township Office",   type:"Office",      spaces:220 },
  { name:"Manipal Hospital Parking",    type:"Hospital",    spaces:200 },
  { name:"Fortis Cunningham Road",      type:"Hospital",    spaces:150 },
  { name:"Narayana Health City",        type:"Hospital",    spaces:300 },
  { name:"Indiranagar Metro Park",      type:"Street",      spaces:120 },
  { name:"Hebbal Flyover Park",         type:"Street",      spaces:100 },
  { name:"Marathahalli Bridge Park",    type:"Street",      spaces:150 },
  { name:"Yeshwanthpur Circle Park",    type:"Street",      spaces:130 },
  { name:"Basavanagudi Street Park",    type:"Street",      spaces:90  },
  { name:"Shivajinagar Bus Stand",      type:"Street",      spaces:110 },
  { name:"Kempegowda Airport P1",       type:"Airport",     spaces:1000},
  { name:"Kempegowda Airport P2",       type:"Airport",     spaces:800 },
  { name:"Majestic Bus Terminal",       type:"Transit",     spaces:200 },
  { name:"KSR Railway Station Park",    type:"Transit",     spaces:250 },
  { name:"Sarjapur Road Apts",          type:"Residential", spaces:160 },
  { name:"JP Nagar Society Park",       type:"Residential", spaces:140 },
];

const DURATIONS = [
  { label:'30 min', hrs:0.5 },
  { label:'1 hr',   hrs:1   },
  { label:'2 hr',   hrs:2   },
  { label:'4 hr+',  hrs:4   },
];


const PURPOSES = ['Shopping','Office','Event','Hospital','Restaurant','Other'];

const API = 'http://localhost:8000/api';

// Circular gauge SVG
const Gauge = ({ pct, color }) => {
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="128" height="128" style={{ transform:'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition:'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}/>
    </svg>
  );
};

export default function ParkingPredictor() {
  const [lot,      setLot]      = useState(LOTS[0].name);
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [time,     setTime]     = useState('10:00');
  const [vehNum,   setVehNum]   = useState('');
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [purpose,  setPurpose]  = useState('Shopping');
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [modelInfo,setModelInfo]= useState(null);

  useEffect(() => {
    axios.get(`${API}/model-info/`).then(r => setModelInfo(r.data)).catch(()=>{});
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const hour = parseInt(time.split(':')[0], 10);
      const d    = new Date(date);
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const lotObj = LOTS.find(l => l.name === lot) || LOTS[0];
      const nearbyEvent = purpose === 'Event' ? 1 : 0;
      const lotType = purpose === 'Shopping' ? 'Mall'
                    : purpose === 'Office'   ? 'Office'
                    : purpose === 'Hospital' ? 'Hospital'
                    : lotObj.type;
      let base = 40;
      if ((hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 19)) base = 75;
      if (nearbyEvent) base += 20;
      const finalOcc = Math.min(95, Math.max(5, base + (lotObj.name.length % 15) - 7));
      const booked   = Math.floor(lotObj.spaces * (finalOcc / 100));
      const payload = {
        place_area: lot, lot_type: lotType, hour_slot: hour,
        day_of_week: days[d.getDay()], month: d.getMonth() + 1,
        season: 'Summer', is_weekend: [0,6].includes(d.getDay()) ? 1 : 0,
        is_holiday: 0, temperature_c: 26.0, total_spaces: lotObj.spaces,
        booked_spaces: booked, checkins_done: Math.floor(booked * 0.9),
        no_show_count: 3, cancellation_count: 2, avg_duration_hrs: duration.hrs,
        advance_booking_hrs: 12, user_search_count: 100,
        booking_percent: finalOcc + 2, actual_occupancy_pct: finalOcc,
        no_show_rate_pct: 6.5, nearby_event: nearbyEvent,
        weather_condition: 'Sunny', vehicle_number: vehNum,
        price_per_hour: 50 // Added default to avoid backend error
      };
      const res = await axios.post(`${API}/predict/v2/`, payload);
      if (res.data.success) setResult(res.data);
      else setError(res.data.error || 'Prediction failed');
    } catch(err) {
      setError(err.response?.data?.error || 'Cannot reach backend. Is Django running?');
    } finally { setLoading(false); }
  };

  const scoreColor = (p) => p >= 70 ? '#10b981' : p >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight:'calc(100vh - 72px)', background:'var(--bg-primary)', padding:'40px 32px 80px' }}>
      <style>{``}</style>

      <div style={{ width:'100%' }}>

        {/* ── HEADER ─────────────────────────────── */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:99, padding:'5px 18px', fontSize:12, fontWeight:700, color:'#a78bfa', letterSpacing:1.2, textTransform:'uppercase', marginBottom:20 }}>
            🤖 AI Prediction Engine
          </div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(32px,5vw,56px)', fontWeight:900, letterSpacing:-2, marginBottom:12, lineHeight:1.05 }}>
            Smart <span style={{ background:'linear-gradient(135deg,#00d4ff,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Parking</span> Predictor
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:16, maxWidth:540, margin:'0 auto 28px' }}>
            ML-powered availability forecast across 30 Bangalore lots — trained on 600K records
          </p>

          {/* Model info pills */}
          <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:10 }}>
            {[
              { label:'RandomForestClassifier', bg:'rgba(99,102,241,0.15)',  c:'#a78bfa', border:'rgba(99,102,241,0.3)'  },
              { label: modelInfo ? `${modelInfo.feature_count} Features` : '22 Features', bg:'rgba(14,165,233,0.12)', c:'#38bdf8', border:'rgba(14,165,233,0.3)' },
              { label: modelInfo ? `${modelInfo.n_estimators} Estimators`  : '100 Estimators', bg:'rgba(16,185,129,0.12)', c:'#34d399', border:'rgba(16,185,129,0.3)' },
              { label:'600K Records', bg:'rgba(245,158,11,0.12)', c:'#fbbf24', border:'rgba(245,158,11,0.3)'  },
              { label:'30 Bangalore Lots', bg:'rgba(239,68,68,0.1)',   c:'#f87171', border:'rgba(239,68,68,0.25)' },
            ].map(p => (
              <span key={p.label} style={{ padding:'5px 16px', borderRadius:99, fontSize:12, fontWeight:700, background:p.bg, color:p.c, border:`1px solid ${p.border}`, letterSpacing:0.3 }}>{p.label}</span>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap:28, width:'100%' }}>

          {/* ── FORM CARD ── */}
          <div className="sp-card" style={{ padding:'36px 32px' }}>

            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, marginBottom:6 }}>Predict Availability</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:28 }}>Fill in your parking details below</p>

            <form onSubmit={handlePredict}>

              {/* Place & Date */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                <div className="sp-input-group" style={{ margin:0 }}>
                  <label>📍 Place / Area</label>
                  <select className="sp-input sp-select" value={lot} onChange={e => setLot(e.target.value)} required>
                    {LOTS.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
                <div className="sp-input-group" style={{ margin:0 }}>
                  <label>📅 Date</label>
                  <input type="date" className="sp-input" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>

              {/* Time & Vehicle no */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
                <div className="sp-input-group" style={{ margin:0 }}>
                  <label>⏰ Arrival Time</label>
                  <input type="time" className="sp-input" value={time} onChange={e => setTime(e.target.value)} required />
                </div>
                <div className="sp-input-group" style={{ margin:0 }}>
                  <label>🚘 Vehicle No. (Optional)</label>
                  <input type="text" className="sp-input" placeholder="e.g. KA-01-AB-1234" value={vehNum} onChange={e => setVehNum(e.target.value)} />
                </div>
              </div>

              {/* Duration */}
              <div style={{ marginBottom:26 }}>
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:12 }}>⏱ Parking Duration</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {DURATIONS.map(d => (
                    <button key={d.label} type="button" className="pill-chip" onClick={() => setDuration(d)} style={{
                      padding:'8px 22px', borderRadius:99, fontSize:13, fontWeight:700,
                      background: duration.label === d.label ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.04)',
                      color: duration.label === d.label ? '#fff' : 'var(--text-secondary)',
                      border: duration.label === d.label ? '2px solid transparent' : '2px solid var(--border)',
                      boxShadow: duration.label === d.label ? '0 4px 18px rgba(99,102,241,0.35)' : 'none',
                    }}>{d.label}</button>
                  ))}
                </div>
              </div>


              {/* Purpose */}
              <div style={{ marginBottom:32 }}>
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:12 }}>🎯 Purpose of Visit</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:9 }}>
                  {PURPOSES.map(p => (
                    <button key={p} type="button" className="pill-chip" onClick={() => setPurpose(p)} style={{
                      padding:'7px 18px', borderRadius:99, fontSize:13, fontWeight:600,
                      background: purpose === p ? 'linear-gradient(135deg,#00d4ff,#0ea5e9)' : 'rgba(255,255,255,0.04)',
                      color: purpose === p ? '#fff' : 'var(--text-secondary)',
                      border: purpose === p ? '2px solid transparent' : '2px solid var(--border)',
                      boxShadow: purpose === p ? '0 4px 14px rgba(0,212,255,0.3)' : 'none',
                    }}>{p}</button>
                  ))}
                </div>
              </div>

              {error && <div className="sp-alert error" style={{ marginBottom:16 }}>⚠️ {error}</div>}

              <div style={{ display:'flex', gap:12 }}>
                <button type="submit" disabled={loading} style={{
                  flex:2, padding:'15px', borderRadius:14, fontSize:16, fontWeight:800, cursor: loading ? 'not-allowed' : 'pointer',
                  background:'linear-gradient(135deg,#6366f1,#00d4ff)', color:'#fff', border:'none',
                  boxShadow:'0 8px 24px rgba(99,102,241,0.4)', opacity: loading ? 0.75 : 1, transition:'all .2s',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                }}>
                  {loading ? <><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span> Predicting...</> : '🔮 Predict Availability'}
                </button>
                <button type="button" onClick={() => { setResult(null); setError(null); setDuration(DURATIONS[1]); setPurpose('Shopping'); setVehNum(''); }} style={{
                  flex:1, padding:'15px', borderRadius:14, fontSize:14, fontWeight:700, cursor:'pointer',
                  background:'rgba(255,255,255,0.05)', color:'var(--text-secondary)', border:'1px solid var(--border)', transition:'all .2s',
                }}>Reset</button>
              </div>
            </form>
          </div>

          {/* ── RESULT CARD ── */}
          {result && (() => {
            const lot2 = LOTS.find(l => l.name === lot) || LOTS[0];
            const prob = Math.round((result.availability_probability ?? 0) * 100);
            const conf = result.confidence ?? 0;
            const avail = Math.round(lot2.spaces * (prob / 100));
            const occ   = lot2.spaces - avail;
            const color = scoreColor(prob);
            const isAvail = result.is_available;
            return (
              <div className="sp-card" style={{ padding:'36px 32px', border:`1px solid ${isAvail ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, background: isAvail ? 'rgba(16,185,129,0.03)' : 'rgba(239,68,68,0.03)' }}>

                <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:24 }}>🎯 Prediction Result</div>

                {/* Gauge + label */}
                <div style={{ display:'flex', alignItems:'center', gap:24, marginBottom:28, padding:20, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <Gauge pct={prob} color={color} />
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:900, color }}>{prob}%</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>AVAIL.</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:900, color, marginBottom:4 }}>
                      {result.prediction_label}
                    </div>
                    <div style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>
                      <strong style={{ color:'var(--text-primary)' }}>{lot}</strong><br/>
                      {duration.label} · {purpose}
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:24 }}>
                  {[
                    { label:'Total Spaces',  value: lot2.spaces, icon:'🅿️', color:'#3b82f6' },
                    { label:'Available',     value: avail,       icon:'✅', color:'#10b981' },
                    { label:'Occupied',      value: occ,         icon:'🔴', color:'#ef4444' },
                    { label:'Lot Type',      value: lot2.type,   icon:'🏢', color:'#a78bfa' },
                  ].map(s => (
                    <div key={s.label} style={{ padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                      <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 }}>{s.icon} {s.label}</div>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Confidence bar */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:8 }}>
                    <span>Model Confidence</span><span style={{ color: conf>=80?'#10b981':conf>=60?'#f59e0b':'#ef4444' }}>{conf}%</span>
                  </div>
                  <div style={{ height:8, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${conf}%`, background: conf>=80?'#10b981':conf>=60?'linear-gradient(90deg,#f59e0b,#fbbf24)':'#ef4444', borderRadius:99, transition:'width 1.2s ease' }}/>
                  </div>
                </div>

                {/* Advice */}
                <div style={{ padding:'14px 18px', borderRadius:12, background: isAvail ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border:`1px solid ${isAvail ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>
                  {isAvail
                    ? `✅ Good chance of parking! Arrive by ${time} for best results. ${prob >= 80 ? 'Spaces are very likely available.' : 'Some spaces should be open.'}`
                    : `⚠️ Parking may be tight at ${time}. Consider arriving earlier or choosing a different time slot.`}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

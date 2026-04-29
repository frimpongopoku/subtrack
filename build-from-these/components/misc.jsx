// components/misc.jsx
const { useState } = React;

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onLogin }) {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:`
        radial-gradient(ellipse 60% 60% at 18% 50%, rgba(124,110,247,0.13) 0%, transparent 100%),
        radial-gradient(ellipse 50% 45% at 85% 18%, rgba(79,172,254,0.10) 0%, transparent 100%),
        radial-gradient(ellipse 30% 30% at 50% 90%, rgba(244,63,94,0.05) 0%, transparent 100%)
      `
    }}>
      <div style={{ display:'flex', gap:80, alignItems:'center', maxWidth:1040, padding:'0 48px', width:'100%' }}>

        {/* Left — hero */}
        <div style={{ flex:1 }}>
          <div style={{ marginBottom:28 }}>
            <window.Logo size="lg" />
          </div>

          <h1 style={{ fontSize:52, fontWeight:800, lineHeight:1.06, letterSpacing:'-2px', marginBottom:18 }}>
            Every subscription.<br />
            <span className="grad-text">One dashboard.</span>
          </h1>

          <p style={{ fontSize:16, color:'var(--text2)', lineHeight:1.65, maxWidth:400, marginBottom:36 }}>
            Replace scattered emails and forgotten charges with a premium hub. Know exactly what you spend, when it renews, and where to cut.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:11, maxWidth:340 }}>
            {[
              { icon:'subscriptions', text:'Track unlimited recurring services' },
              { icon:'insights',      text:'Spot waste with AI-powered insights' },
              { icon:'activity',      text:'Full audit trail — every renewal logged' },
              { icon:'bell',          text:'Renewal alerts before you get charged' },
              { icon:'groups',        text:'Organize by team, project or category'  },
            ].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:11 }}>
                <div style={{
                  width:30, height:30, borderRadius:9, flexShrink:0,
                  background:'var(--accentbg)',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <window.Icon name={f.icon} size={13} color="var(--accent)" />
                </div>
                <span style={{ fontSize:13.5, color:'var(--text2)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — login card */}
        <div style={{ width:390, flexShrink:0 }}>
          {/* Glow */}
          <div style={{
            position:'absolute', width:320, height:320, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(124,110,247,0.15) 0%, transparent 70%)',
            pointerEvents:'none', transform:'translate(-40px,-40px)'
          }} />

          <div className="glass" style={{ padding:38, borderRadius:22, position:'relative', zIndex:1 }}>
            <div style={{ textAlign:'center', marginBottom:30 }}>
              <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.4px' }}>Get started free</div>
              <div style={{ fontSize:13.5, color:'var(--text3)', marginTop:6 }}>Sign in to manage your subscriptions</div>
            </div>

            <button className="google-btn" onClick={onLogin}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'18px 0' }}>
              <div style={{ flex:1, height:1, background:'var(--border)' }} />
              <span style={{ fontSize:11.5, color:'var(--text3)' }}>or</span>
              <div style={{ flex:1, height:1, background:'var(--border)' }} />
            </div>

            <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', padding:'11px 20px', fontSize:13.5 }} onClick={onLogin}>
              Continue with Email
            </button>

            <div style={{ marginTop:18, textAlign:'center', fontSize:11, color:'var(--text3)', lineHeight:1.6 }}>
              By continuing you agree to our Terms of Service<br />and Privacy Policy
            </div>

            {/* Demo stat bar */}
            <div style={{
              marginTop:22, padding:'14px 16px',
              background:'rgba(124,110,247,0.07)', border:'1px solid rgba(124,110,247,0.16)',
              borderRadius:12
            }}>
              <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:10 }}>Demo preview</div>
              <div style={{ display:'flex', gap:0 }}>
                {[
                  { val:'12',   label:'Subscriptions', color:'var(--accent)' },
                  { val:'$271', label:'Monthly spend',  color:'var(--text)'  },
                  { val:'$27',  label:'Potential save', color:'var(--amber)' },
                ].map((s,i) => (
                  <div key={i} style={{ flex:1, padding:'0 8px', borderRight: i<2 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:10.5, color:'var(--text3)', marginTop:1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ACTIVITY PAGE ─────────────────────────────────────────────────────────────
function ActivityPage() {
  const [filter, setFilter] = useState('all');
  const { logs } = window.MOCK;

  const typeColor = { renewed:'var(--green)', paused:'var(--amber)', cancelled:'var(--red)', edited:'var(--blue)', added:'var(--accent)' };
  const typeBg    = { renewed:'var(--greenbg)', paused:'var(--amberbg)', cancelled:'var(--redbg)', edited:'var(--bluebg)', added:'var(--accentbg)' };
  const typeIcon  = { renewed:'repeat', paused:'pause', cancelled:'x', edited:'edit', added:'plus' };
  const typeLabel = { renewed:'Renewed', paused:'Paused', cancelled:'Cancelled', edited:'Edited', added:'Added' };

  const types  = ['all','renewed','paused','cancelled','edited','added'];
  const shown  = logs.filter(l => filter==='all' || l.type===filter);

  const counts = {};
  logs.forEach(l => { counts[l.type] = (counts[l.type]||0)+1; });

  return (
    <div className="ani" style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Summary chips */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        {Object.entries(counts).map(([type, count]) => (
          <div key={type} style={{
            display:'flex', alignItems:'center', gap:7, padding:'7px 14px',
            background: typeBg[type], border:`1px solid ${typeColor[type]}28`,
            borderRadius:10
          }}>
            <window.Icon name={typeIcon[type]} size={13} color={typeColor[type]} />
            <span style={{ fontSize:12.5, fontWeight:700, color:typeColor[type] }}>{count}</span>
            <span style={{ fontSize:12, color:'var(--text3)' }}>{typeLabel[type]}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="seg-control" style={{ alignSelf:'flex-start' }}>
        {types.map(t => (
          <button key={t} className={`seg-btn${filter===t?' on':''}`} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t !== 'all' && counts[t] && (
              <span style={{ marginLeft:4, fontSize:10, background:'rgba(255,255,255,0.07)', borderRadius:8, padding:'1px 5px' }}>{counts[t]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="glass" style={{ padding:24 }}>
        <div style={{ position:'relative' }}>
          <div className="timeline-line" />
          {shown.map((log, i) => (
            <div key={log.id} style={{
              display:'flex', gap:16, paddingBottom:22,
              animation:`fadeInUp 0.26s ease ${i*0.05}s both`
            }}>
              <div style={{
                width:36, height:36, borderRadius:'50%', flexShrink:0,
                background: typeBg[log.type],
                border:`2px solid ${typeColor[log.type]}38`,
                display:'flex', alignItems:'center', justifyContent:'center',
                position:'relative', zIndex:1
              }}>
                <window.Icon name={typeIcon[log.type]} size={14} color={typeColor[log.type]} />
              </div>
              <div style={{ flex:1, paddingTop:6 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, flexWrap:'wrap' }}>
                  <span style={{ fontSize:14, fontWeight:700 }}>{log.subName}</span>
                  <span style={{
                    fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:100,
                    background: typeBg[log.type], color:typeColor[log.type]
                  }}>{typeLabel[log.type]}</span>
                </div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
                  {log.date} · {log.note}
                </div>
              </div>
            </div>
          ))}
          {shown.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text3)' }}>
              <window.Icon name="activity" size={28} color="var(--text3)" />
              <div style={{ marginTop:10, fontSize:14, fontWeight:600, color:'var(--text2)' }}>No activity yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ─────────────────────────────────────────────────────────────
function SettingsPage() {
  const [notifs, setNotifs] = useState({ renewal:true, weekly:true, monthly:false, digest:true });
  const [currency, setCurrency] = useState('USD');
  const [sort, setSort] = useState('nearest');

  const toggleNotif = key => setNotifs(n => ({ ...n, [key]: !n[key] }));

  function Section({ title, children }) {
    return (
      <div className="glass" style={{ padding:24 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:18 }}>{title}</div>
        {children}
      </div>
    );
  }

  function Row({ label, desc, control }) {
    return (
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13.5, fontWeight:600 }}>{label}</div>
          {desc && <div style={{ fontSize:12, color:'var(--text3)', marginTop:1 }}>{desc}</div>}
        </div>
        {control}
      </div>
    );
  }

  function Divider() {
    return <div style={{ height:1, background:'var(--border)', margin:'14px 0' }} />;
  }

  function Toggle({ on, onClick }) {
    return (
      <div className={`toggle-wrap${on?' on':''}`} onClick={onClick} style={{ flexShrink:0 }}>
        <div className="toggle-knob" />
      </div>
    );
  }

  return (
    <div className="ani" style={{ maxWidth:640, display:'flex', flexDirection:'column', gap:18 }}>

      {/* Profile */}
      <Section title="Profile">
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <div style={{
            width:56, height:56, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg, var(--accent), var(--accent2))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, fontWeight:800, color:'white',
            boxShadow:'0 4px 16px rgba(124,110,247,0.35)'
          }}>AJ</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:16 }}>Alex Johnson</div>
            <div style={{ fontSize:13, color:'var(--text3)', marginTop:2 }}>alex@example.com · Google Account</div>
          </div>
          <button className="btn btn-ghost btn-sm"><window.Icon name="edit" size={13} />Edit</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Display Name</label>
            <input className="input" defaultValue="Alex Johnson" style={{ width:'100%' }} />
          </div>
          <div>
            <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Email</label>
            <input className="input" defaultValue="alex@example.com" style={{ width:'100%' }} readOnly />
          </div>
        </div>
        <div style={{ marginTop:14 }}>
          <button className="btn btn-primary" style={{ justifyContent:'center' }}>Save Profile</button>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <Row label="Default Currency" desc="Used across all spend summaries"
          control={
            <select className="input" value={currency} onChange={e => setCurrency(e.target.value)} style={{ width:110 }}>
              <option>USD</option><option>GHS</option><option>EUR</option><option>GBP</option>
            </select>
          }
        />
        <Divider />
        <Row label="Default Sort Order" desc="How subscriptions are ordered by default"
          control={
            <select className="input" value={sort} onChange={e => setSort(e.target.value)} style={{ width:168 }}>
              <option value="nearest">Nearest Due First</option>
              <option value="price">By Price (High–Low)</option>
              <option value="name">Alphabetical</option>
              <option value="created">Date Added</option>
            </select>
          }
        />
        <Divider />
        <Row label="Fiscal Year Start" desc="For annual projection calculations"
          control={
            <select className="input" style={{ width:130 }}>
              <option>January</option><option>April</option><option>July</option><option>October</option>
            </select>
          }
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        {[
          { key:'renewal', label:'Renewal Reminders',  desc:'Notify 3 days before a subscription renews' },
          { key:'weekly',  label:'Weekly Digest',       desc:'Summary of upcoming renewals every Sunday'  },
          { key:'monthly', label:'Monthly Report',      desc:'Full spending breakdown on the 1st'         },
          { key:'digest',  label:'Wasted Spend Alerts', desc:'Alert when paused services are still billing'},
        ].map((n, i) => (
          <React.Fragment key={n.key}>
            {i > 0 && <Divider />}
            <Row label={n.label} desc={n.desc}
              control={<Toggle on={notifs[n.key]} onClick={() => toggleNotif(n.key)} />}
            />
          </React.Fragment>
        ))}
      </Section>

      {/* Data */}
      <Section title="Data & Privacy">
        <Row label="Export Data" desc="Download all your subscription data as CSV"
          control={<button className="btn btn-ghost btn-sm"><window.Icon name="log" size={13} />Export CSV</button>}
        />
        <Divider />
        <Row label="Connected Accounts" desc="Google — alex@example.com"
          control={<span style={{ fontSize:12, color:'var(--green)', fontWeight:600 }}>● Connected</span>}
        />
      </Section>

      {/* Danger zone */}
      <div className="glass" style={{ padding:24, borderColor:'rgba(239,68,68,0.25)' }}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--red)', marginBottom:14 }}>Danger Zone</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
          <div>
            <div style={{ fontSize:13.5, fontWeight:600 }}>Delete Account</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:1 }}>Permanently delete all data. This cannot be undone.</div>
          </div>
          <button className="btn btn-danger"><window.Icon name="trash" size={14} />Delete Account</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LandingPage, ActivityPage, SettingsPage });

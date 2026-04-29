// components/dashboard.jsx

function StatCard({ label, value, sub, icon, accent, change }) {
  return (
    <div className="stat-card" style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{
          width:38, height:38, borderRadius:11, flexShrink:0,
          background: accent + '1a',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <window.Icon name={icon} size={17} color={accent} />
        </div>
        {change !== undefined && (
          <div style={{
            fontSize:10.5, fontWeight:700, padding:'3px 8px', borderRadius:100,
            background: change > 0 ? 'var(--redbg)' : 'var(--greenbg)',
            color:       change > 0 ? 'var(--red)'   : 'var(--green)'
          }}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.6px', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:12, color:'var(--text2)', marginTop:5 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function UpcomingRow({ sub, index }) {
  const today = Date.now() / 1000;
  const days  = Math.max(0, Math.ceil((sub.dueTs - today) / 86400));
  const urgent = days <= 7 && sub.status !== 'cancelled';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:13,
      padding:'12px 0',
      borderBottom:'1px solid var(--border)',
      animation:`fadeInUp 0.28s ease ${index*0.05}s both`
    }}>
      <div style={{
        width:38, height:38, borderRadius:10, flexShrink:0,
        background: sub.lc + '20',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, fontWeight:800, color:sub.lc, letterSpacing:'-0.3px'
      }}>{sub.li}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13.5, fontWeight:600 }}>{sub.name}</div>
        <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{sub.desc}</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:14, fontWeight:700 }}>${sub.amount.toFixed(2)}</div>
        <div style={{
          fontSize:11, marginTop:2, fontWeight: urgent ? 600 : 400,
          color: urgent ? 'var(--amber)' : 'var(--text3)'
        }}>
          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days}d`}
        </div>
      </div>
    </div>
  );
}

function SpendChart({ subs, groups }) {
  const totals = groups.map(g => ({
    ...g,
    total: subs.filter(s => s.groupId===g.id && s.status==='subscribed').reduce((a,s)=>a+s.amount,0)
  })).filter(g => g.total > 0).sort((a,b) => b.total - a.total);
  const max = Math.max(...totals.map(g => g.total), 1);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
      {totals.map(g => (
        <div key={g.id}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:g.color }} />
              <span style={{ fontSize:12.5, fontWeight:500 }}>{g.name}</span>
            </div>
            <span style={{ fontSize:12.5, fontWeight:700, color:'var(--text2)' }}>${g.total.toFixed(2)}</span>
          </div>
          <div className="pbar">
            <div className="pbar-fill" style={{ width:`${(g.total/max)*100}%`, background:g.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusDonut({ subs }) {
  const active    = subs.filter(s=>s.status==='subscribed').length;
  const paused    = subs.filter(s=>s.status==='paused').length;
  const cancelled = subs.filter(s=>s.status==='cancelled').length;
  const total     = subs.length;
  const ap = (active/total)*100, pp = (paused/total)*100;
  const gradient = `conic-gradient(#22c55e 0% ${ap}%, #f59e0b ${ap}% ${ap+pp}%, #ef4444 ${ap+pp}% 100%)`;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <div style={{ position:'relative', width:88, height:88, flexShrink:0 }}>
        <div style={{ width:88, height:88, borderRadius:'50%', background:gradient }} />
        <div style={{
          position:'absolute', inset:14, borderRadius:'50%', background:'var(--bg2)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20, fontWeight:800
        }}>{total}</div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:9 }}>
        {[
          { label:'Active',    count:active,    color:'#22c55e' },
          { label:'Paused',    count:paused,    color:'#f59e0b' },
          { label:'Cancelled', count:cancelled, color:'#ef4444' },
        ].map(row => (
          <div key={row.label} style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:row.color, flexShrink:0 }} />
            <span style={{ fontSize:12.5, flex:1 }}>{row.label}</span>
            <span style={{ fontSize:13.5, fontWeight:800 }}>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPage({ onNavigate }) {
  const { subs, groups, logs } = window.MOCK;
  const active  = subs.filter(s=>s.status==='subscribed');
  const paused  = subs.filter(s=>s.status==='paused');
  const total   = active.reduce((a,s)=>a+s.amount,0);
  const annual  = total * 12;
  const today   = Date.now() / 1000;
  const dueSoon = subs.filter(s=>s.status!=='cancelled' && (s.dueTs-today)/86400<=7).length;
  const pausedSavings = paused.reduce((a,s)=>a+s.amount,0);
  const upcoming = [...subs].filter(s=>s.status!=='cancelled').sort((a,b)=>a.dueTs-b.dueTs).slice(0,7);

  const logColors = { renewed:'var(--green)', paused:'var(--amber)', cancelled:'var(--red)', edited:'var(--blue)', added:'var(--accent)' };
  const logIcons  = { renewed:'repeat', paused:'pause', cancelled:'x', edited:'edit', added:'plus' };

  return (
    <div className="ani" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <StatCard label="Monthly Spend"    value={`$${total.toFixed(2)}`}   sub={`${active.length} active services`} icon="dollar"        accent="var(--accent)" change={8} />
        <StatCard label="Annual Projected" value={`$${annual.toFixed(0)}`}  sub="At current rate"                   icon="trending"      accent="var(--blue)"   />
        <StatCard label="Active Services"  value={active.length}            sub={`${paused.length} paused`}          icon="subscriptions" accent="var(--green)"  />
        <StatCard label="Due This Week"    value={dueSoon}                  sub="Needs attention"                    icon="activity"      accent={dueSoon>2?'var(--amber)':'var(--blue)'} />
      </div>

      {/* Alert */}
      {pausedSavings > 0 && (
        <div style={{
          background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)',
          borderRadius:12, padding:'13px 18px',
          display:'flex', alignItems:'center', gap:12
        }}>
          <window.Icon name="alert" size={18} color="var(--amber)" />
          <div style={{ flex:1, fontSize:13.5 }}>
            <span style={{ fontWeight:700, color:'var(--amber)' }}>Save ${pausedSavings.toFixed(2)}/mo</span>
            <span style={{ color:'var(--text2)' }}> · {paused.length} paused subscriptions still billing</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('insights')}>
            View Insights <window.Icon name="chevRight" size={12} />
          </button>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 348px', gap:18 }}>

        {/* Upcoming renewals */}
        <div className="glass" style={{ padding:22 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15 }}>Upcoming Renewals</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>Sorted by nearest due date</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('subscriptions')}>
              View all <window.Icon name="chevRight" size={12} />
            </button>
          </div>
          {upcoming.map((s,i) => (
            <UpcomingRow key={s.id} sub={s} index={i} />
          ))}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="glass" style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14.5, marginBottom:16 }}>Status Overview</div>
            <StatusDonut subs={subs} />
          </div>
          <div className="glass" style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14.5, marginBottom:16 }}>Spend by Group</div>
            <SpendChart subs={subs} groups={groups} />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass" style={{ padding:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Recent Activity</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('activity')}>
            View all <window.Icon name="chevRight" size={12} />
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
          {logs.slice(0,3).map((log, i) => (
            <div key={log.id} style={{
              display:'flex', gap:12, padding:'4px 18px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{
                width:34, height:34, borderRadius:9, flexShrink:0,
                background: logColors[log.type] + '1a',
                display:'flex', alignItems:'center', justifyContent:'center'
              }}>
                <window.Icon name={logIcons[log.type]} size={14} color={logColors[log.type]} />
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>
                  {log.subName} <span style={{ color:logColors[log.type] }}>{log.type}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{log.date} · {log.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { DashboardPage, StatCard });

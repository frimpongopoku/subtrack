// components/insights.jsx

function KPICard({ title, value, sub, icon, accent, type }) {
  const borders = { warning:'var(--amber)', danger:'var(--red)', success:'var(--green)', info:'var(--blue)' };
  const border  = borders[type];
  return (
    <div className="glass" style={{
      padding:'18px 20px',
      borderLeft: border ? `3px solid ${border}` : undefined,
      borderRadius: border ? '0 14px 14px 0' : 14
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{
          width:38, height:38, borderRadius:11, flexShrink:0,
          background: accent + '1a',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <window.Icon name={icon} size={17} color={accent} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11.5, color:'var(--text3)', marginBottom:5, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>{title}</div>
          <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:12, color:'var(--text3)', marginTop:5 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function InsightsPage({ onNavigate }) {
  const { subs, groups } = window.MOCK;

  const active    = subs.filter(s=>s.status==='subscribed');
  const paused    = subs.filter(s=>s.status==='paused');
  const cancelled = subs.filter(s=>s.status==='cancelled');

  const monthly   = active.reduce((a,s)=>a+s.amount,0);
  const annual    = monthly * 12;
  const pausedAmt = paused.reduce((a,s)=>a+s.amount,0);

  const today  = Date.now()/1000;
  const next30 = subs.filter(s => s.status!=='cancelled' && (s.dueTs-today)/86400 <= 30);
  const next30total = next30.reduce((a,s)=>a+s.amount,0);

  const top5 = [...active].sort((a,b)=>b.amount-a.amount).slice(0,5);

  const groupBreakdown = groups.map(g => ({
    ...g,
    subs: active.filter(s=>s.groupId===g.id),
    total: active.filter(s=>s.groupId===g.id).reduce((a,s)=>a+s.amount,0)
  })).filter(g=>g.total>0).sort((a,b)=>b.total-a.total);

  return (
    <div className="ani" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <KPICard title="Monthly Recurring" value={`$${monthly.toFixed(2)}`}  sub={`${active.length} active services`}       icon="dollar"   accent="var(--accent)"  />
        <KPICard title="Annual Projected"  value={`$${annual.toFixed(0)}`}   sub="At current rate"                          icon="trending" accent="var(--blue)"    />
        <KPICard title="Due Next 30 Days"  value={`$${next30total.toFixed(2)}`} sub={`${next30.length} renewals upcoming`}   icon="activity" accent="var(--amber)"   type="warning" />
        <KPICard title="Potential Savings" value={`$${pausedAmt.toFixed(2)}/mo`} sub="Cancel all paused services"           icon="zap"      accent="var(--green)"   type="success" />
      </div>

      {/* Two-col section */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

        {/* Top expenses */}
        <div className="glass" style={{ padding:22 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Top Expenses</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:18 }}>Highest-cost active subscriptions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {top5.map((sub, i) => {
              const pct = (sub.amount / monthly) * 100;
              const rankColors = ['#ef4444','#f97316','#f59e0b','var(--accent)','var(--blue)'];
              return (
                <div key={sub.id}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <div style={{
                      width:22, height:22, borderRadius:6, flexShrink:0,
                      background: sub.lc+'20',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:8, fontWeight:800, color:sub.lc
                    }}>{sub.li.slice(0,2)}</div>
                    <span style={{ fontSize:13, fontWeight:600, flex:1 }}>{sub.name}</span>
                    <span style={{ fontSize:13, fontWeight:800 }}>${sub.amount.toFixed(2)}</span>
                    <span style={{ fontSize:11, color:'var(--text3)', minWidth:34, textAlign:'right' }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="pbar">
                    <div className="pbar-fill" style={{ width:`${pct}%`, background:rankColors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waste detection */}
        <div className="glass" style={{ padding:22 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Waste Detection</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:18 }}>Services you might not be using</div>

          {paused.map(sub => (
            <div key={sub.id} style={{
              display:'flex', alignItems:'center', gap:12, marginBottom:10,
              padding:'12px 14px',
              background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)',
              borderRadius:11
            }}>
              <window.Icon name="alert" size={15} color="var(--amber)" />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{sub.name}
                  <span style={{ fontSize:11, background:'var(--amberbg)', color:'var(--amber)', borderRadius:6, padding:'2px 7px', marginLeft:7, fontWeight:700 }}>Paused</span>
                </div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>${sub.amount}/mo still billing</div>
              </div>
              <button className="btn btn-danger btn-sm">Cancel</button>
            </div>
          ))}

          <div style={{
            display:'flex', alignItems:'flex-start', gap:12, marginTop:2,
            padding:'12px 14px',
            background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)',
            borderRadius:11
          }}>
            <window.Icon name="alert" size={15} color="var(--red)" />
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>Multiple Streaming Services</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>
                Netflix, Disney+, YouTube Premium overlap · Save up to $27.98/mo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group breakdown */}
      <div className="glass" style={{ padding:22 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Spend by Category</div>
        <div style={{ fontSize:12, color:'var(--text3)', marginBottom:20 }}>Monthly cost breakdown across your groups</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
          {groupBreakdown.map(g => (
            <div key={g.id} style={{
              padding:'14px 16px', borderRadius:12,
              background: g.color+'10', border:`1px solid ${g.color}28`
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:g.color }} />
                <span style={{ fontSize:12, fontWeight:600 }}>{g.name}</span>
              </div>
              <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.4px', color:g.color }}>${g.total.toFixed(2)}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>
                {g.subs.length} services · {((g.total/monthly)*100).toFixed(0)}% of total
              </div>
            </div>
          ))}
        </div>
        {/* Stacked bar */}
        <div style={{ height:10, borderRadius:100, overflow:'hidden', display:'flex' }}>
          {groupBreakdown.map(g => (
            <div key={g.id} style={{
              height:'100%', background:g.color,
              width:`${(g.total/monthly)*100}%`,
              transition:'width 0.8s ease'
            }} />
          ))}
        </div>
        <div style={{ display:'flex', gap:16, marginTop:10 }}>
          {groupBreakdown.map(g => (
            <div key={g.id} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:g.color }} />
              <span style={{ fontSize:11, color:'var(--text3)' }}>{g.name} {((g.total/monthly)*100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {[
          { label:'Active',    items:active,    amt:monthly,    color:'var(--green)', bg:'var(--greenbg)' },
          { label:'Paused',    items:paused,    amt:pausedAmt,  color:'var(--amber)', bg:'var(--amberbg)' },
          { label:'Cancelled', items:cancelled, amt:cancelled.reduce((a,s)=>a+s.amount,0), color:'var(--red)', bg:'var(--redbg)' },
        ].map(row => (
          <div key={row.label} style={{ padding:'18px 20px', borderRadius:14, background:row.bg, border:`1px solid ${row.color}28` }}>
            <div style={{ fontSize:36, fontWeight:800, color:row.color, letterSpacing:'-1px', lineHeight:1 }}>{row.items.length}</div>
            <div style={{ fontSize:13, fontWeight:700, color:row.color, marginTop:4 }}>{row.label} Services</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>${row.amt.toFixed(2)}/mo</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>${(row.amt*12).toFixed(0)}/year</div>
          </div>
        ))}
      </div>

    </div>
  );
}

Object.assign(window, { InsightsPage, KPICard });

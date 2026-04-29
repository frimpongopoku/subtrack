// components/groups.jsx
const { useState } = React;

function GroupCard({ group, subs, expanded, onToggle }) {
  const groupSubs  = subs.filter(s => s.groupId === group.id);
  const activeSubs = groupSubs.filter(s => s.status === 'subscribed');
  const monthly    = activeSubs.reduce((a, s) => a + s.amount, 0);
  const pct        = groupSubs.length > 0 ? (activeSubs.length / groupSubs.length) * 100 : 0;

  return (
    <div className="glass" style={{ overflow:'hidden', transition:'all 0.2s ease' }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 22px', cursor:'pointer' }} onClick={onToggle}>
        <div style={{
          width:46, height:46, borderRadius:13, flexShrink:0,
          background: group.color + '1a',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <div style={{ width:16, height:16, borderRadius:'50%', background:group.color }} />
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:15.5 }}>{group.name}</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>
            {groupSubs.length} services · {activeSubs.length} active · {groupSubs.length - activeSubs.length} inactive
          </div>
        </div>

        <div style={{ textAlign:'right', marginRight:14 }}>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.5px' }}>
            ${monthly.toFixed(2)}
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>per month</div>
        </div>

        <div style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:8, background: group.color+'1a', color:group.color }}>
          ${(monthly*12).toFixed(0)}/yr
        </div>

        <div style={{
          width:30, height:30, borderRadius:8, flexShrink:0,
          background:'var(--surface)', border:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'center',
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition:'transform 0.22s ease'
        }}>
          <window.Icon name="chevDown" size={14} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ margin:'0 22px' }}>
        <div className="pbar">
          <div className="pbar-fill" style={{ width:`${pct}%`, background:group.color }} />
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div style={{ padding:'14px 22px 20px', animation:'fadeInUp 0.2s ease both' }}>
          <div style={{ height:1, background:'var(--border)', marginBottom:14 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {groupSubs.sort((a,b) => a.dueTs - b.dueTs).map(sub => {
              const today = Date.now()/1000;
              const days  = Math.ceil((sub.dueTs - today)/86400);
              const urgent = days <= 7 && sub.status !== 'cancelled';
              return (
                <div key={sub.id} style={{
                  display:'flex', alignItems:'center', gap:13,
                  padding:'11px 14px', borderRadius:11,
                  background:'var(--surface)', border:'1px solid var(--border)',
                  transition:'all 0.15s ease'
                }}>
                  <div style={{
                    width:34, height:34, borderRadius:9,
                    background: sub.lc+'20', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:800, color:sub.lc
                  }}>{sub.li}</div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13.5, fontWeight:600 }}>{sub.name}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{sub.desc}</div>
                  </div>

                  <div style={{ fontSize:11, color: urgent ? 'var(--amber)' : 'var(--text3)', fontWeight: urgent ? 600 : 400, marginRight:12 }}>
                    Due {sub.due}
                  </div>

                  <span className={`badge badge-${sub.status==='subscribed'?'active':sub.status}`}>
                    {sub.status==='subscribed'?'Active':sub.status==='paused'?'Paused':'Cancelled'}
                  </span>

                  <div style={{ fontWeight:800, fontSize:15, minWidth:60, textAlign:'right' }}>
                    ${sub.amount.toFixed(2)}
                  </div>

                  <div style={{ display:'flex', gap:5 }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding:'4px 8px' }}>
                      <window.Icon name="edit" size={12} />
                    </button>
                    {sub.status !== 'cancelled' && (
                      <button className="btn btn-danger btn-sm" style={{ padding:'4px 8px' }}>
                        <window.Icon name="x" size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Group actions */}
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            <button className="btn btn-ghost btn-sm">
              <window.Icon name="plus" size={12} />Add to Group
            </button>
            <button className="btn btn-ghost btn-sm">
              <window.Icon name="repeat" size={12} />Renew All
            </button>
            <button className="btn btn-ghost btn-sm">
              <window.Icon name="pause" size={12} />Pause All
            </button>
            <button className="btn btn-danger btn-sm" style={{ marginLeft:'auto' }}>
              <window.Icon name="trash" size={12} />Delete Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupsPage() {
  const [expanded, setExpanded] = useState('g2'); // Work & SaaS open by default
  const { groups, subs } = window.MOCK;

  const grandTotal = subs.filter(s=>s.status==='subscribed').reduce((a,s)=>a+s.amount,0);

  return (
    <div className="ani" style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Overview strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {groups.map(g => {
          const gSubs  = subs.filter(s => s.groupId===g.id && s.status==='subscribed');
          const total  = gSubs.reduce((a,s)=>a+s.amount,0);
          const share  = grandTotal > 0 ? ((total/grandTotal)*100).toFixed(0) : 0;
          return (
            <div key={g.id} className="stat-card"
              style={{ borderLeft:`3px solid ${g.color}`, borderRadius:'0 14px 14px 0', cursor:'pointer' }}
              onClick={() => setExpanded(g.id)}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:g.color }} />
                <span style={{ fontSize:12, color:'var(--text3)', fontWeight:600 }}>{g.name}</span>
              </div>
              <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.4px' }}>${total.toFixed(2)}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>
                {gSubs.length} active · {share}% of total
              </div>
              <div className="pbar" style={{ marginTop:10 }}>
                <div className="pbar-fill" style={{ width:`${share}%`, background:g.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Group cards */}
      {groups.map(group => (
        <GroupCard
          key={group.id}
          group={group}
          subs={subs}
          expanded={expanded === group.id}
          onToggle={() => setExpanded(expanded===group.id ? null : group.id)}
        />
      ))}

      {/* Add group */}
      <button className="btn btn-ghost" style={{
        width:'100%', justifyContent:'center',
        padding:'14px', border:'1px dashed rgba(255,255,255,0.12)',
        borderRadius:14, fontSize:13
      }}>
        <window.Icon name="plus" size={16} />Create New Group
      </button>
    </div>
  );
}

Object.assign(window, { GroupsPage });

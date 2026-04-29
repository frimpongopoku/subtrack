// components/subscriptions.jsx
const { useState } = React;

function SubCard({ sub, groups, onEdit }) {
  const group = groups.find(g => g.id === sub.groupId);
  const today = Date.now() / 1000;
  const days  = Math.ceil((sub.dueTs - today) / 86400);
  const urgent = days <= 7 && sub.status !== 'cancelled';

  return (
    <div className="sub-card" style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{
          width:46, height:46, borderRadius:13, flexShrink:0,
          background: sub.lc + '20',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:11, fontWeight:800, color:sub.lc, letterSpacing:'-0.3px'
        }}>{sub.li}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:14.5 }}>{sub.name}</span>
            <span className={`badge badge-${sub.status==='subscribed'?'active':sub.status}`}>
              {sub.status==='subscribed'?'● Active': sub.status==='paused'?'⏸ Paused':'✕ Cancelled'}
            </span>
          </div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{sub.desc}</div>
        </div>
        {group && (
          <div style={{
            fontSize:10.5, fontWeight:700, padding:'3px 9px', borderRadius:6, flexShrink:0,
            background: group.color + '1a', color:group.color
          }}>{group.name}</div>
        )}
      </div>

      {/* Price block */}
      <div style={{
        display:'flex', alignItems:'baseline', gap:4,
        padding:'10px 14px', background:'rgba(255,255,255,0.03)',
        borderRadius:10, border:'1px solid var(--border)'
      }}>
        <span style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px' }}>${sub.amount.toFixed(2)}</span>
        <span style={{ fontSize:12, color:'var(--text3)' }}>/ {sub.period}</span>
        <div style={{ flex:1 }} />
        {sub.recurring && (
          <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text3)', fontSize:11 }}>
            <window.Icon name="repeat" size={11} />Recurring
          </div>
        )}
      </div>

      {/* Dates */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ background:'rgba(255,255,255,0.025)', borderRadius:9, padding:'9px 12px' }}>
          <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:700, marginBottom:4 }}>Next Due</div>
          <div style={{ fontSize:13, fontWeight:700, color: urgent ? 'var(--amber)' : 'var(--text)' }}>
            {sub.due}
            {urgent && <span style={{ fontSize:10, marginLeft:5, fontWeight:500 }}>({days}d)</span>}
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.025)', borderRadius:9, padding:'9px 12px' }}>
          <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:700, marginBottom:4 }}>Since</div>
          <div style={{ fontSize:13, fontWeight:700 }}>{sub.start}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:6, borderTop:'1px solid var(--border)', paddingTop:13 }}>
        {sub.status !== 'cancelled' && (
          <button className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}>
            <window.Icon name="repeat" size={12} />Renew
          </button>
        )}
        {sub.status === 'subscribed' && (
          <button className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}>
            <window.Icon name="pause" size={12} />Pause
          </button>
        )}
        {sub.status === 'paused' && (
          <button className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center', color:'var(--green)', borderColor:'rgba(34,197,94,0.25)' }}>
            <window.Icon name="play" size={12} />Resume
          </button>
        )}
        <button className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}
          onClick={e => { e.stopPropagation(); onEdit(sub); }}>
          <window.Icon name="edit" size={12} />Edit
        </button>
        {sub.status !== 'cancelled' && (
          <button className="btn btn-danger btn-sm" style={{ flex:1, justifyContent:'center' }}>
            <window.Icon name="x" size={12} />Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function SubscriptionsPage({ onNavigate }) {
  const [filter, setFilter]    = useState('all');
  const [group,  setGroup]     = useState('all');
  const [editing, setEditing]  = useState(null);
  const { subs, groups } = window.MOCK;

  const tabs = [
    { id:'all',        label:'All',       count: subs.length },
    { id:'subscribed', label:'Active',    count: subs.filter(s=>s.status==='subscribed').length },
    { id:'paused',     label:'Paused',    count: subs.filter(s=>s.status==='paused').length },
    { id:'cancelled',  label:'Cancelled', count: subs.filter(s=>s.status==='cancelled').length },
  ];

  const shown = subs
    .filter(s => filter==='all' || s.status===filter)
    .filter(s => group==='all'  || s.groupId===group)
    .sort((a,b) => a.dueTs - b.dueTs);

  return (
    <div className="ani" style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* Filters */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div className="seg-control">
          {tabs.map(t => (
            <button key={t.id} className={`seg-btn${filter===t.id?' on':''}`} onClick={() => setFilter(t.id)}>
              {t.label}
              <span style={{ marginLeft:5, fontSize:10, background:'rgba(255,255,255,0.07)', borderRadius:10, padding:'1px 6px' }}>{t.count}</span>
            </button>
          ))}
        </div>
        <div className="seg-control" style={{ marginLeft:'auto' }}>
          <button className={`seg-btn${group==='all'?' on':''}`} onClick={() => setGroup('all')}>All Groups</button>
          {groups.map(g => (
            <button key={g.id} className={`seg-btn${group===g.id?' on':''}`} onClick={() => setGroup(g.id)}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display:'flex', gap:12 }}>
        {[
          { label:'Total monthly', value:`$${shown.filter(s=>s.status==='subscribed').reduce((a,s)=>a+s.amount,0).toFixed(2)}`, color:'var(--accent)' },
          { label:'Showing',       value:`${shown.length} subscriptions`, color:'var(--text2)' },
          { label:'Annual cost',   value:`$${(shown.filter(s=>s.status==='subscribed').reduce((a,s)=>a+s.amount,0)*12).toFixed(0)}/yr`, color:'var(--blue)' },
        ].map(s => (
          <div key={s.label} style={{
            padding:'9px 16px', background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:10, display:'flex', gap:8, alignItems:'center'
          }}>
            <span style={{ fontSize:13.5, fontWeight:700, color:s.color }}>{s.value}</span>
            <span style={{ fontSize:11.5, color:'var(--text3)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      {shown.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {shown.map((s, i) => (
            <div key={s.id} style={{ animation:`fadeInUp 0.28s ease ${i*0.04}s both` }}>
              <SubCard sub={s} groups={groups} onEdit={setEditing} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text3)' }}>
          <window.Icon name="subscriptions" size={36} color="var(--text3)" />
          <div style={{ marginTop:14, fontSize:15, fontWeight:600, color:'var(--text2)' }}>No subscriptions found</div>
          <div style={{ fontSize:13, marginTop:4 }}>Try adjusting your filters</div>
        </div>
      )}

      {/* Edit drawer */}
      <div className={`drawer${editing?' open':''}`}>
        {editing && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>Edit Subscription</div>
              <button className="btn btn-ghost" style={{ padding:'6px 10px' }} onClick={() => setEditing(null)}>
                <window.Icon name="x" size={15} />
              </button>
            </div>

            {/* Mini card */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, marginBottom:22 }}>
              <div style={{ width:40, height:40, borderRadius:11, background:editing.lc+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:editing.lc }}>
                {editing.li}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>{editing.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{editing.desc}</div>
              </div>
              <div style={{ marginLeft:'auto', fontWeight:800, fontSize:18 }}>${editing.amount.toFixed(2)}</div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'Service Name', val:editing.name    },
                { label:'Description',  val:editing.desc    },
                { label:'Amount (USD)', val:editing.amount  },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>{f.label}</label>
                  <input className="input" defaultValue={f.val} style={{ width:'100%' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>Renewal Period</label>
                <select className="input" style={{ width:'100%' }} defaultValue={editing.period}>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:6 }}>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>Save Changes</button>
                <button className="btn btn-ghost"   style={{ flex:1, justifyContent:'center' }} onClick={() => setEditing(null)}>Cancel</button>
              </div>
              <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
                <window.Icon name="trash" size={14} />Delete Subscription
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SubscriptionModal({ onClose }) {
  const { groups } = window.MOCK;
  const [recurring, setRecurring] = useState(true);
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17 }}>Add Subscription</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>Track a new recurring service</div>
          </div>
          <button className="btn btn-ghost" style={{ padding:'6px 10px' }} onClick={onClose}>
            <window.Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase' }}>Service Name</label>
              <input className="input" placeholder="e.g. Netflix" style={{ width:'100%' }} />
            </div>
            <div>
              <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase' }}>Group</label>
              <select className="input" style={{ width:'100%' }}>
                {groups.map(g => <option key={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase' }}>Description</label>
            <input className="input" placeholder="e.g. Standard plan with ads" style={{ width:'100%' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase' }}>Amount</label>
              <input className="input" placeholder="0.00" style={{ width:'100%' }} />
            </div>
            <div>
              <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase' }}>Currency</label>
              <select className="input" style={{ width:'100%' }}>
                <option>USD</option><option>GHS</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase' }}>Period</label>
              <select className="input" style={{ width:'100%' }}>
                <option>Monthly</option><option>Annual</option><option>Weekly</option><option>Quarterly</option>
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase' }}>Start Date</label>
              <input type="date" className="input" style={{ width:'100%', colorScheme:'dark' }} />
            </div>
            <div>
              <label style={{ fontSize:11.5, color:'var(--text3)', display:'block', marginBottom:5, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase' }}>Next Due Date</label>
              <input type="date" className="input" style={{ width:'100%', colorScheme:'dark' }} />
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <window.Icon name="repeat" size={14} color="var(--accent)" />
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>Recurring subscription</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>Auto-renews on due date</div>
              </div>
            </div>
            <div className={`toggle-wrap${recurring?' on':''}`} onClick={() => setRecurring(r=>!r)}>
              <div className="toggle-knob" />
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>
              <window.Icon name="plus" size={14} color="white" />Add Subscription
            </button>
            <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SubscriptionsPage, SubCard, SubscriptionModal });

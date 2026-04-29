// components/layout.jsx
const { useState } = React;

// ─── ICON SYSTEM ──────────────────────────────────────────────────────────────
const PATHS = {
  dashboard:     ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  subscriptions: ["M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z","M2 11h20"],
  groups:        ["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"],
  insights:      ["M18 20V10","M12 20V4","M6 20v-6"],
  activity:      ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 6v6l4 2"],
  settings:      ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  search:        ["M21 21l-4.35-4.35","M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"],
  plus:          ["M12 5v14","M5 12h14"],
  bell:          ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  x:             ["M18 6L6 18","M6 6l12 12"],
  check:         ["M20 6L9 17 4 12"],
  chevDown:      ["M6 9l6 6 6-6"],
  chevRight:     ["M9 18l6-6-6-6"],
  trending:      ["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"],
  alert:         ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  dollar:        ["M12 1v22","M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  zap:           ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  pause:         ["M10 4H6v16h4z","M18 4h-4v16h4z"],
  play:          ["M5 3l14 9-14 9z"],
  edit:          ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  trash:         ["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6","M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"],
  repeat:        ["M17 1l4 4-4 4","M3 11V9a4 4 0 0 1 4-4h14","M7 23l-4-4 4-4","M21 13v2a4 4 0 0 1-4 4H3"],
  eye:           ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  added:         ["M12 5v14","M5 12h14"],
  tag:           ["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z","M7 7h.01"],
  log:           ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  logout:        ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
};

function Icon({ name, size = 18, color = "currentColor" }) {
  const ps = PATHS[name];
  if (!ps) return <span style={{ display:'inline-block', width:size, height:size }} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
         style={{ display:'block', flexShrink:0 }}>
      {ps.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({ size = 'md' }) {
  const s = size === 'lg' ? 44 : 32;
  const f = size === 'lg' ? 18 : 15;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{
        width:s, height:s, borderRadius: size==='lg' ? 14 : 10, flexShrink:0,
        background:'linear-gradient(135deg, var(--accent), var(--accent2))',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 4px 14px rgba(124,110,247,0.35)'
      }}>
        <Icon name="repeat" size={f} color="white" />
      </div>
      <span style={{ fontWeight:800, fontSize: size==='lg' ? 22 : 16, letterSpacing:'-0.3px' }}>
        Sub<span className="grad-text">Track</span>
      </span>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ currentPage, onNavigate }) {
  const { groups } = window.MOCK;
  const navItems = [
    { id:'dashboard',     label:'Dashboard',     icon:'dashboard'     },
    { id:'subscriptions', label:'Subscriptions', icon:'subscriptions' },
    { id:'groups',        label:'Groups',        icon:'groups'        },
    { id:'insights',      label:'Insights',      icon:'insights'      },
    { id:'activity',      label:'Activity',      icon:'activity'      },
  ];
  return (
    <div className="sidebar">
      <div style={{ padding:'4px 12px 20px' }}>
        <Logo />
      </div>

      <nav style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {navItems.map(item => (
          <div key={item.id}
            className={`nav-item${currentPage===item.id?' active':''}`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
            {item.id==='subscriptions' && (
              <span style={{
                marginLeft:'auto', fontSize:10, fontWeight:700,
                background:'rgba(255,255,255,0.07)', borderRadius:100,
                padding:'1px 7px', color:'var(--text3)'
              }}>{window.MOCK.subs.length}</span>
            )}
          </div>
        ))}
      </nav>

      <div style={{ height:1, background:'var(--border)', margin:'14px 4px' }} />

      <div style={{ padding:'0 4px' }}>
        <div style={{
          fontSize:10, fontWeight:700, letterSpacing:'0.8px',
          textTransform:'uppercase', color:'var(--text3)',
          padding:'0 8px', marginBottom:8
        }}>Groups</div>
        {groups.map(g => (
          <div key={g.id} className="nav-item" style={{ fontSize:13 }}
               onClick={() => onNavigate('groups')}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:g.color, flexShrink:0 }} />
            {g.name}
          </div>
        ))}
      </div>

      <div style={{ flex:1 }} />
      <div style={{ height:1, background:'var(--border)', margin:'10px 4px 8px' }} />

      <div className={`nav-item${currentPage==='settings'?' active':''}`}
           onClick={() => onNavigate('settings')}>
        <Icon name="settings" size={16} />Settings
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginTop:4 }}>
        <div style={{
          width:32, height:32, borderRadius:'50%', flexShrink:0,
          background:'linear-gradient(135deg, var(--accent), var(--accent2))',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:11, fontWeight:800, color:'white'
        }}>AJ</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Alex Johnson</div>
          <div style={{ fontSize:11, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>alex@example.com</div>
        </div>
        <Icon name="logout" size={14} color="var(--text3)" />
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ currentPage, onAddNew }) {
  const [search, setSearch] = useState('');
  const titles = { dashboard:'Dashboard', subscriptions:'Subscriptions', groups:'Groups', insights:'Insights', activity:'Activity', settings:'Settings' };
  const total = window.MOCK.subs.filter(s => s.status==='subscribed').reduce((a,s) => a+s.amount, 0);
  return (
    <div className="topbar">
      <div style={{ fontWeight:700, fontSize:15.5, letterSpacing:'-0.3px', minWidth:140 }}>
        {titles[currentPage] || ''}
      </div>

      <div style={{ flex:1, maxWidth:340, position:'relative', marginLeft:12 }}>
        <div style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--text3)' }}>
          <Icon name="search" size={14} />
        </div>
        <input className="input" style={{ width:'100%', paddingLeft:34, fontSize:13 }}
          placeholder="Search subscriptions…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ flex:1 }} />

      <div style={{
        display:'flex', alignItems:'center', gap:5,
        background:'var(--accentbg)', border:'1px solid rgba(124,110,247,0.22)',
        borderRadius:10, padding:'6px 13px', marginRight:8
      }}>
        <Icon name="dollar" size={13} color="var(--accent)" />
        <span style={{ fontSize:13.5, fontWeight:800, color:'var(--accent)' }}>${total.toFixed(2)}</span>
        <span style={{ fontSize:11, color:'var(--text3)' }}>/mo</span>
      </div>

      <button className="btn btn-ghost" style={{ padding:'7px 10px', marginRight:8 }}>
        <Icon name="bell" size={16} />
      </button>

      <button className="btn btn-primary" style={{ padding:'7px 15px' }} onClick={onAddNew}>
        <Icon name="plus" size={14} color="white" />Add New
      </button>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell({ currentPage, onNavigate }) {
  const [showModal, setShowModal] = useState(false);

  const renderPage = () => {
    const map = {
      dashboard:     window.DashboardPage,
      subscriptions: window.SubscriptionsPage,
      groups:        window.GroupsPage,
      insights:      window.InsightsPage,
      activity:      window.ActivityPage,
      settings:      window.SettingsPage,
    };
    const P = map[currentPage];
    return P ? <P onNavigate={onNavigate} /> : null;
  };

  const Modal = window.SubscriptionModal;

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="main-area">
        <Topbar currentPage={currentPage} onNavigate={onNavigate} onAddNew={() => setShowModal(true)} />
        <div className="page-content">{renderPage()}</div>
      </div>
      {showModal && Modal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
}

Object.assign(window, { Icon, Logo, Sidebar, Topbar, AppShell });

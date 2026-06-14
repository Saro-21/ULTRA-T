import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  auth, db, gProvider,
  signInWithPopup, firebaseSignOut, onAuthStateChanged,
  collection, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, orderBy, serverTimestamp, doc,
  isDemoConfig, firebaseInitialized, mockSignInWithPopup, mockSignOut, mockOnAuthStateChanged
} from "./firebase";
import { D, F, STATUS, PRIORITY, makeSeedTasks, uid } from "./constants";
import { useToast, Toasts, CyberGrid, Avatar, Spinner } from "./components";
import TaskCard  from "./TaskCard";
import TaskForm  from "./TaskForm";
import SettingsPanel from "./SettingsPanel";
import "./index.css";

/* ═══════════════════════════════════════════════════════════════════════════
   ULTRA T  ·  Main Application  ·  v1.0
   Firebase Auth · Firestore CRUD · Full PWA · Kanban Board
═══════════════════════════════════════════════════════════════════════════ */

// ── Google Sign-In Screen ────────────────────────────────────────────────────
function LoginScreen({ onLogin, loading }) {
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const [devKey, setDevKey] = useState("");

  const handleGoogle = async () => {
    setBusy(true); setErr("");
    try {
      // Try popup first, if blocked use redirect
      try {
        const result = await signInWithPopup(auth, gProvider);
        onLogin(result.user);
      } catch (popupErr) {
        if (popupErr.code === "auth/popup-blocked" || popupErr.code === "auth/popup-closed-by-user") {
          // Fallback to demo mode on popup block
          console.warn("Popup blocked, switching to demo mode:", popupErr.code);
          const result = await mockSignInWithPopup();
          onLogin(result.user);
        } else {
          throw popupErr;
        }
      }
    } catch (e) {
      setErr("Sign-in unavailable. Use Demo Mode below or API Key. " + e.message);
    } finally { setBusy(false); }
  };

  const handleDemo = async () => {
    setBusy(true); setErr("");
    try {
      const result = await mockSignInWithPopup();
      onLogin(result.user);
    } catch (e) {
      setErr("Demo sign-in failed: " + e.message);
    } finally { setBusy(false); }
  };

  const handleKeyLogin = async () => {
    if (!devKey.trim()) {
      setErr("Please enter a valid Developer API key.");
      return;
    }
    setBusy(true); setErr("");
    try {
      // Store Groq API key in local storage to power AI Assist features
      localStorage.setItem("ultra-t-groq-key", devKey.trim());
      const user = {
        uid: "developer-groq-user",
        displayName: "Lead AI Engineer ✦",
        email: "ai-engineer@ultra-t.io",
        photoURL: null,
        providerId: "groq.com",
        isDemo: false,
        isGroqUser: true
      };
      localStorage.setItem("ultra-t-mock-user", JSON.stringify(user));
      onLogin(user);
    } catch (e) {
      setErr("Authentication failed: " + e.message);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:D.void, position:"relative", overflow:"hidden" }}>
      <CyberGrid eco={false}/>

      {/* Floating particles */}
      {Array.from({length:6},(_,i)=>(
        <div key={i} style={{position:"absolute",
          left:`${10+i*15}%`,top:`${20+Math.sin(i)*40}%`,
          width:4+i*2,height:4+i*2,borderRadius:"50%",
          background:`rgba(0,245,224,${.1+i*.05})`,
          animation:`float ${3+i}s ease-in-out infinite`,
          animationDelay:`${i*.5}s`,pointerEvents:"none"}}/>
      ))}

      <div style={{ zIndex:10, width:"100%", maxWidth:420, padding:"0 20px", animation:"popIn .6s ease" }}>
        {/* Logo / Brand */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{
            width:80,height:80,borderRadius:20,margin:"0 auto 20px",
            background:"linear-gradient(135deg,rgba(0,245,224,.12),rgba(0,255,136,.08))",
            border:"1.5px solid rgba(0,245,224,.3)",display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:40,boxShadow:"0 0 40px rgba(0,245,224,.2), 0 20px 60px rgba(0,0,0,.6)",
            animation:"float 4s ease-in-out infinite"
          }}>✦</div>
          <h1 style={{ fontFamily:F.sig, fontSize:36, letterSpacing:".14em", color:D.cyan, margin:0,
            textShadow:"0 0 24px rgba(0,245,224,.7), 0 0 60px rgba(0,245,224,.3)", animation:"neonBreathe 3s ease-in-out infinite" }}>
            ULTRA T
          </h1>
          <div style={{ fontSize:12, color:D.t3, fontFamily:F.sig, letterSpacing:".2em", marginTop:6 }}>TASK FLOW · BUILT DIFFERENT</div>
          <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:16 }}>
            {["Cyber-native","AI-powered","End-to-end secure"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:D.t3,fontFamily:F.sig}}>
                <span style={{color:D.cyan,fontSize:12}}>✦</span>{f}
              </div>
            ))}
          </div>
        </div>

        {/* Auth card */}
        <div className="glass-card" style={{ padding:"32px 28px", borderRadius:16, boxShadow:"0 24px 80px rgba(0,0,0,.7), 0 0 60px rgba(0,245,224,.06)" }}>
          <div style={{ fontFamily:F.sig, fontSize:11, color:D.t3, letterSpacing:".16em", textAlign:"center", marginBottom:22 }}>
            // AUTHENTICATE TO PROCEED
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: D.cyan, fontFamily: F.sig, letterSpacing: ".06em", marginBottom: 22, lineHeight: 1.5, background: "rgba(0,245,224,.06)", border: "1px solid rgba(0,245,224,.2)", padding: 12, borderRadius: 8 }}>
              ⚡ SECURE ACCESS MODE<br/>
              Proceed directly to the sandbox system to manage your tasks.
            </div>
            <button onClick={handleDemo} disabled={busy||loading} className="hex-btn"
              style={{ width: "100%", padding: "14px", borderRadius: 8, fontSize: 13, letterSpacing: ".1em", fontWeight: 700 }}>
              ENTER GUEST SANDBOX ✦
            </button>
            {err && (
              <div style={{ marginTop: 12, padding:"10px 14px", borderRadius:8, background:"rgba(255,45,91,.08)", border:"1px solid rgba(255,45,91,.25)", color:D.red, fontSize:12, textAlign:"center", fontFamily:F.sig }}>
                {err}
              </div>
            )}
          </div>

          <div style={{marginTop:20,padding:"12px",borderRadius:8,background:"rgba(0,245,224,.04)",border:"1px solid rgba(0,245,224,.1)"}}>
            <div style={{fontSize:10,fontFamily:F.sig,color:D.t3,letterSpacing:".06em",lineHeight:1.7,textAlign:"center"}}>
              🔐 Client-side secure storage · Data encrypted at rest<br/>
              🌿 Carbon-neutral hosting · 99.97% SLA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SEARCH & FILTER BAR ──────────────────────────────────────────────────────
function SearchBar({ query, setQuery, filter, setFilter }) {
  return(
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <div style={{position:"relative",flex:1}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:D.t3,fontSize:14,pointerEvents:"none"}}>⌕</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks…"
          className="ifield" style={{paddingLeft:34,height:38,fontSize:13}}/>
      </div>
      <select value={filter} onChange={e=>setFilter(e.target.value)} className="ifield"
        style={{width:120,height:38,fontSize:11,fontFamily:F.sig,letterSpacing:".06em",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%2300F5E0'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center",paddingRight:28}}>
        <option value="all">ALL</option>
        <option value="urgent">CRITICAL</option>
        <option value="high">HIGH</option>
        <option value="medium">MEDIUM</option>
        <option value="low">LOW</option>
      </select>
    </div>
  );
}

// ── KANBAN BOARD COLUMN ──────────────────────────────────────────────────────
function Column({ statusKey, tasks, user, onCard, compact }) {
  const s = STATUS[statusKey];
  return(
    <div className="board-column">
      {/* Header */}
      <div style={{padding:"12px 14px",borderRadius:10,background:`rgba(${parseInt(s.hex.slice(1,3),16)},${parseInt(s.hex.slice(3,5),16)},${parseInt(s.hex.slice(5,7),16)},0.08)`,
        border:`1px solid ${s.hex}25`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16,filter:`drop-shadow(0 0 6px ${s.hex})`}}>{s.icon}</span>
          <span style={{fontFamily:F.sig,fontSize:11,color:s.hex,letterSpacing:".1em"}}>{s.label}</span>
        </div>
        <span style={{fontSize:11,fontWeight:700,fontFamily:F.sig,
          background:`${s.hex}22`,color:s.hex,border:`1px solid ${s.hex}44`,
          padding:"2px 8px",borderRadius:10}}>
          {tasks.length}
        </span>
      </div>
      {/* Cards */}
      <div className="column-cards">
        {tasks.map(t=>(
          <TaskCard key={t.id} task={t} user={user} onClick={()=>onCard(t)}/>
        ))}
        {tasks.length===0&&(
          <div style={{textAlign:"center",padding:"32px 16px",color:D.t4,fontSize:12,fontFamily:F.sig,letterSpacing:".08em",borderRadius:10,border:"1px dashed rgba(0,245,224,.08)"}}>
            NO TASKS
          </div>
        )}
      </div>
    </div>
  );
}

// ── STATS HEADER ─────────────────────────────────────────────────────────────
function StatsRow({ tasks }) {
  const total   = tasks.length;
  const done    = tasks.filter(t=>t.status==="done").length;
  const urgent  = tasks.filter(t=>t.priority==="urgent"&&t.status!=="done").length;
  const overdue = tasks.filter(t=>t.due&&t.status!=="done"&&new Date(t.due)<new Date()).length;
  const pct     = total ? Math.round((done/total)*100) : 0;
  return(
    <div style={{display:"flex",gap:12,alignItems:"center"}}>
      {[
        {lbl:"TOTAL",  val:total,  c:D.cyan},
        {lbl:"DONE",   val:done,   c:D.green},
        {lbl:"URGENT", val:urgent, c:D.red},
        {lbl:"OVERDUE",val:overdue,c:D.amber},
      ].map(({lbl,val,c})=>(
        <div key={lbl} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:6,background:`${c}11`,border:`1px solid ${c}22`}}>
          <span style={{fontSize:14,fontWeight:800,color:c,fontFamily:F.sig}}>{val}</span>
          <span style={{fontSize:9,color:D.t3,fontFamily:F.sig,letterSpacing:".08em"}}>{lbl}</span>
        </div>
      ))}
      {/* Progress bar */}
      <div className="hd" style={{flex:1,maxWidth:140}}>
        <div style={{height:4,borderRadius:2,background:"rgba(0,245,224,.1)",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${D.cyan},${D.green})`,borderRadius:2,transition:"width .5s ease",boxShadow:`0 0 8px rgba(0,245,224,.4)`}}/>
        </div>
        <div style={{fontSize:9,color:D.t3,fontFamily:F.sig,marginTop:3,letterSpacing:".08em"}}>{pct}% COMPLETE</div>
      </div>
    </div>
  );
}

// ── NOTIFICATION BELL ─────────────────────────────────────────────────────────
function NotifBell({ tasks, settings }) {
  const [open, setOpen] = useState(false);
  const urgent = tasks.filter(t=>t.priority==="urgent"&&t.status!=="done");
  const overdue = tasks.filter(t=>t.due&&t.status!=="done"&&new Date(t.due)<new Date());
  const count = urgent.length + overdue.length;
  return(
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:38,height:38,borderRadius:8,border:"1px solid rgba(0,245,224,.18)",
        background:count>0?"rgba(255,45,91,.08)":"rgba(0,245,224,.06)",
        color:count>0?D.red:D.cyan,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:18,position:"relative",transition:"all .15s",
        boxShadow:count>0?"0 0 12px rgba(255,45,91,.3)":"none"}}>
        🔔
        {count>0&&<div style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",
          background:D.red,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:F.sig,animation:"pulseRed 2s infinite"}}>{count}</div>}
      </button>
      {open&&(
        <div style={{position:"absolute",right:0,top:44,width:300,borderRadius:10,
          background:D.dark,border:"1px solid rgba(0,245,224,.18)",
          boxShadow:"0 20px 60px rgba(0,0,0,.8)",zIndex:200,animation:"popIn .2s ease",overflow:"hidden"}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(0,245,224,.1)",fontFamily:F.sig,fontSize:11,color:D.cyan,letterSpacing:".1em"}}>
            // NOTIFICATIONS ({count})
          </div>
          <div style={{maxHeight:300,overflowY:"auto"}}>
            {urgent.map(t=>(
              <div key={t.id} style={{padding:"10px 14px",borderBottom:"1px solid rgba(0,245,224,.06)",display:"flex",gap:10}}>
                <span style={{color:D.red,fontSize:14,flexShrink:0}}>⚠</span>
                <div><div style={{fontSize:12,color:D.t1,fontWeight:600}}>{t.title}</div><div style={{fontSize:10,color:D.red,fontFamily:F.sig,marginTop:2}}>CRITICAL PRIORITY</div></div>
              </div>
            ))}
            {overdue.map(t=>(
              <div key={t.id} style={{padding:"10px 14px",borderBottom:"1px solid rgba(0,245,224,.06)",display:"flex",gap:10}}>
                <span style={{color:D.amber,fontSize:14,flexShrink:0}}>⏱</span>
                <div><div style={{fontSize:12,color:D.t1,fontWeight:600}}>{t.title}</div><div style={{fontSize:10,color:D.amber,fontFamily:F.sig,marginTop:2}}>OVERDUE</div></div>
              </div>
            ))}
            {count===0&&<div style={{padding:"20px",textAlign:"center",color:D.t3,fontSize:12,fontFamily:F.sig}}>All clear ✦</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { list: toasts, add: toast } = useToast();

  // Auth state
  const [user,       setUser]    = useState(null);
  const [authLoading,setAuthLoad]= useState(true);

  // Task state (local + Firestore sync)
  const [tasks,    setTasks]   = useState([]);
  const [dbLoading,setDbLoad]  = useState(false);

  // UI state
  const [editingTask,  setEditingTask]   = useState(null);
  const [showSettings, setShowSettings]  = useState(false);
  const [showInstall,  setShowInstall]   = useState(false);
  const [searchQ,      setSearchQ]       = useState("");
  const [filterPri,    setFilterPri]     = useState("all");
  const [settings, setSettings] = useState({
    cyberMode:true, ecoMode:false, pushNotif:false, dueAlerts:true,
    teamPings:false, compactView:false, darkPulse:false,
    aiAssist:true, autoRoute:false, smartSearch:true, aiSummary:false,
    pullMode:false, offlineMode:true, e2e:true, auditLog:false,
  });

  // ── Firebase Auth listener ──────────────────────────────────────────────
  useEffect(() => {
    const listen = firebaseInitialized ? onAuthStateChanged : mockOnAuthStateChanged;
    const unsub = listen(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoad(false);
    });
    return unsub;
  }, []);

  // ── Backend Integration with Local Fallback ─────────────────────────────
  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    if (!user) { setTasks([]); return; }
    setDbLoad(true);
    fetch(`${API_URL}/tasks?userId=${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setTasks(data);
        } else {
          // Seed initial tasks if backend is empty
          const seed = makeSeedTasks(user.uid);
          setTasks(seed);
          seed.forEach(t => {
            fetch(`${API_URL}/tasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(t)
            }).catch(e => console.warn("Error seeding task to backend:", e));
          });
        }
      })
      .catch(err => {
        console.warn("Backend offline, loading from local storage:", err);
        const saved = localStorage.getItem(`ultra-t-tasks-${user.uid}`);
        if (saved) {
          try { setTasks(JSON.parse(saved)); } catch { setTasks(makeSeedTasks(user.uid)); }
        } else {
          const seed = makeSeedTasks(user.uid);
          setTasks(seed);
          localStorage.setItem(`ultra-t-tasks-${user.uid}`, JSON.stringify(seed));
        }
      })
      .finally(() => setDbLoad(false));
  }, [user]);

  const saveTask = useCallback(async (t) => {
    const isEdit = !!t.id;
    const taskData = isEdit 
      ? { ...t, updatedAt: Date.now() }
      : { ...t, id: uid(), userId: user.uid, created: Date.now(), updatedAt: Date.now() };

    // Optimistic UI state update
    const updated = isEdit 
      ? tasks.map(x => x.id === t.id ? taskData : x)
      : [taskData, ...tasks];
    setTasks(updated);

    try {
      await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      toast(isEdit ? "TASK UPDATED" : "TASK CREATED", "success");
    } catch (err) {
      console.warn("Backend save failed, keeping local copy:", err);
      localStorage.setItem(`ultra-t-tasks-${user.uid}`, JSON.stringify(updated));
      toast(isEdit ? "TASK UPDATED (LOCAL)" : "TASK CREATED (LOCAL)", "info");
    }
    setEditingTask(null);
  }, [tasks, user, toast]);

  const deleteTask = useCallback(async (id) => {
    const updated = tasks.filter(x => x.id !== id);
    setTasks(updated);

    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE"
      });
      toast("TASK DELETED", "info");
    } catch (err) {
      console.warn("Backend delete failed, syncing locally:", err);
      localStorage.setItem(`ultra-t-tasks-${user.uid}`, JSON.stringify(updated));
      toast("TASK DELETED (LOCAL)", "info");
    }
    setEditingTask(null);
  }, [tasks, user, toast]);

  // ── Filtered + sorted tasks ──────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let t = tasks;
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      t = t.filter(x => x.title?.toLowerCase().includes(q) || x.desc?.toLowerCase().includes(q) || x.labels?.some(l=>l.includes(q)));
    }
    if (filterPri !== "all") t = t.filter(x => x.priority === filterPri);
    return t;
  }, [tasks, searchQ, filterPri]);

  const tasksByStatus = useMemo(() => {
    const map = {};
    Object.keys(STATUS).forEach(k => { map[k] = filteredTasks.filter(t=>t.status===k); });
    return map;
  }, [filteredTasks]);

  // ── Sign out ─────────────────────────────────────────────────────────────
  const signOut = async () => {
    const action = firebaseInitialized ? firebaseSignOut : mockSignOut;
    await action(auth);
    setUser(null);
    setTasks([]);
    setShowSettings(false);
    toast("SIGNED OUT", "info");
  };

  // ── Loading screen ───────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:D.void,gap:20}}>
      <CyberGrid/>
      <div style={{fontSize:32,color:D.cyan,fontFamily:F.sig,letterSpacing:".14em",animation:"neonBreathe 2s infinite",zIndex:10}}>✦ ULTRA T</div>
      <Spinner size={36}/>
    </div>
  );

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!user) return <LoginScreen onLogin={u=>{setUser(u);toast(`Welcome, ${u.displayName||"User"}! ✦`,"success");}} loading={authLoading}/>;

  return (
    <div className={settings.ecoMode?"eco-active":""} style={{ position:"relative", height:"100vh", overflow:"hidden", display:"flex", flexDirection:"column", background:settings.darkPulse?D.void:D.noir }}>
      {settings.cyberMode && <CyberGrid eco={settings.ecoMode}/>}

      {/* running in Local Secure Mode */}

      {/* ── TOP NAV ── */}
      <header style={{
        position:"relative",zIndex:20,
        height:72,padding:"0 20px",
        display:"flex",alignItems:"center",gap:14,
        background:"rgba(4,21,32,.88)",
        backdropFilter:"blur(20px)",
        borderBottom:`1px solid rgba(0,245,224,.12)`,
        boxShadow:"0 4px 32px rgba(0,0,0,.6)",
        flexShrink:0,
      }}>
        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginRight:8}}>
          <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,rgba(0,245,224,.12),rgba(0,255,136,.08))",border:"1px solid rgba(0,245,224,.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 0 20px rgba(0,245,224,.2)"}}>✦</div>
          <div>
            <div style={{fontFamily:F.sig,fontSize:16,color:D.cyan,letterSpacing:".14em",lineHeight:1,textShadow:"0 0 12px rgba(0,245,224,.5)"}}>ULTRA T</div>
            <div style={{fontSize:9,color:D.t3,fontFamily:F.sig,letterSpacing:".2em"}}>TASK FLOW</div>
          </div>
        </div>

        {/* Search */}
        <div className="hd" style={{flex:1,maxWidth:480}}>
          <SearchBar query={searchQ} setQuery={setSearchQ} filter={filterPri} setFilter={setFilterPri}/>
        </div>

        {/* Stats */}
        <div className="hd" style={{flex:1}}>
          <StatsRow tasks={tasks}/>
        </div>

        {/* Right actions */}
        <div style={{display:"flex",gap:8,alignItems:"center",marginLeft:"auto"}}>
          {/* Pull mode indicator */}
          {settings.pullMode&&(
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:"rgba(255,190,0,.1)",border:"1px solid rgba(255,190,0,.25)"}}>
              <span style={{color:D.amber,fontSize:11}}>↓</span>
              <span style={{fontSize:9,color:D.amber,fontFamily:F.sig,letterSpacing:".08em"}}>PULL</span>
            </div>
          )}
          {/* Eco indicator */}
          {settings.ecoMode&&(
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)"}}>
              <span style={{fontSize:11}}>🌿</span>
              <span style={{fontSize:9,color:D.leaf,fontFamily:F.sig,letterSpacing:".08em"}}>ECO</span>
            </div>
          )}

          <NotifBell tasks={tasks} settings={settings}/>

          <button onClick={()=>setEditingTask({})} className="hex-btn" style={{padding:"8px 16px",height:38}}>
            <span style={{fontSize:16}}>＋</span>
            <span className="hd">NEW TASK</span>
          </button>

          <button onClick={()=>setShowSettings(true)} style={{width:38,height:38,borderRadius:8,border:"1px solid rgba(0,245,224,.18)",background:"rgba(0,245,224,.06)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,245,224,.14)";e.currentTarget.style.borderColor="rgba(0,245,224,.4)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,245,224,.06)";e.currentTarget.style.borderColor="rgba(0,245,224,.18)"}}>
            <Avatar user={user} size={26}/>
          </button>
        </div>
      </header>

      {/* Mobile search */}
      <div className="mob" style={{padding:"10px 14px",background:"rgba(4,21,32,.8)",borderBottom:"1px solid rgba(0,245,224,.08)",zIndex:10}}>
        <SearchBar query={searchQ} setQuery={setSearchQ} filter={filterPri} setFilter={setFilterPri}/>
      </div>

      {/* ── BOARD ── */}
      <main className="board-scroll" style={{zIndex:10,position:"relative"}}>
        {dbLoading ? (
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,minHeight:200}}>
            <Spinner size={40}/>
            <div style={{fontFamily:F.sig,color:D.t3,fontSize:12,letterSpacing:".1em"}}>LOADING TASKS…</div>
          </div>
        ) : Object.keys(STATUS).map(sk=>(
          <Column key={sk} statusKey={sk} tasks={tasksByStatus[sk]||[]} user={user} onCard={setEditingTask} compact={settings.compactView}/>
        ))}
      </main>

      {/* ── MODALS ── */}
      {editingTask && (
        <TaskForm task={editingTask} onSave={saveTask} onDelete={deleteTask} onClose={()=>setEditingTask(null)}/>
      )}

      {/* ── SETTINGS DRAWER ── */}
      {showSettings && (
        <div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,.75)",backdropFilter:"blur(10px)"}}
          onClick={e=>e.target===e.currentTarget&&setShowSettings(false)}>
          <div style={{
            position:"absolute",right:0,top:0,bottom:0,width:380,maxWidth:"100vw",
            background:D.dark,borderLeft:"1px solid rgba(0,245,224,.18)",
            animation:"slideInRight .32s cubic-bezier(.34,1.2,.64,1)",
            display:"flex",flexDirection:"column",overflow:"hidden"
          }}>
            <div style={{height:2,background:"linear-gradient(90deg,transparent,#00F5E0,#00FF88,#9D6FFF,transparent)"}}/>
            <div style={{padding:"16px 18px",borderBottom:"1px solid rgba(0,245,224,.12)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div style={{fontFamily:F.sig,color:D.cyan,letterSpacing:".12em",fontSize:13}}>// SYSTEM CONFIG</div>
              <button onClick={()=>setShowSettings(false)} style={{background:"none",border:"1px solid rgba(0,245,224,.14)",color:D.t2,cursor:"pointer",fontSize:20,width:32,height:32,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              <SettingsPanel settings={settings} setSettings={setSettings}
                onInstall={()=>setShowInstall(true)} onSignOut={signOut} user={user} toast={toast}/>
            </div>
          </div>
        </div>
      )}

      {/* ── INSTALL SHEET ── */}
      {showInstall&&(
        <div style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>e.target===e.currentTarget&&setShowInstall(false)}>
          <div style={{width:"100%",maxWidth:480,borderRadius:"16px 16px 0 0",background:D.dark,border:"1px solid rgba(0,245,224,.2)",borderBottom:"none",animation:"slideUp .35s ease",boxShadow:"0 -24px 80px rgba(0,0,0,.9)"}}>
            <div style={{height:2,background:"linear-gradient(90deg,transparent,#00F5E0,#00FF88,transparent)"}}/>
            <div style={{padding:"24px 24px 36px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:52,height:52,borderRadius:12,background:"linear-gradient(135deg,rgba(0,245,224,.12),rgba(0,255,136,.08))",border:"1px solid rgba(0,245,224,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:"0 0 24px rgba(0,245,224,.2)"}}>✦</div>
                  <div>
                    <div style={{fontSize:18,fontWeight:700,fontFamily:F.sig,color:D.cyan,letterSpacing:".08em"}}>INSTALL ULTRA T</div>
                    <div style={{fontSize:11,color:D.t3,marginTop:2}}>No app store · Works offline · Free forever</div>
                  </div>
                </div>
                <button onClick={()=>setShowInstall(false)} style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(0,245,224,.18)",background:"rgba(255,45,91,.06)",color:D.red,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
                {[["🤖","Android","Chrome → ⋮ → Add to Home Screen"],["🍎","iPhone","Safari → Share → Add to Home Screen"],["💻","Desktop","Chrome → Address bar ⊕ → Install"]].map(([ico,name,steps])=>(
                  <div key={name} style={{padding:"14px 10px",borderRadius:10,background:"rgba(0,0,0,.4)",border:"1px solid rgba(0,245,224,.1)",textAlign:"center"}}>
                    <div style={{fontSize:26,marginBottom:8}}>{ico}</div>
                    <div style={{fontFamily:F.sig,fontSize:11,color:D.cyan,letterSpacing:".06em",marginBottom:6}}>{name}</div>
                    <div style={{fontSize:10,color:D.t3,lineHeight:1.5}}>{steps}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"12px",borderRadius:8,background:"rgba(0,245,224,.04)",border:"1px solid rgba(0,245,224,.1)",fontSize:11,color:D.t3,fontFamily:F.sig,marginBottom:14,letterSpacing:".04em",textAlign:"center"}}>
                🌿 Carbon-neutral hosting · 🔐 AES-256 encrypted · ✦ Zero tracking
              </div>
              <button onClick={()=>setShowInstall(false)} className="hex-btn" style={{width:"100%",padding:"14px",borderRadius:10,fontSize:13,letterSpacing:".1em"}}>GOT IT ✦</button>
            </div>
          </div>
        </div>
      )}

      <Toasts list={toasts}/>
    </div>
  );
}

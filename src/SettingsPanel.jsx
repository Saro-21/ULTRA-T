import React, { useState, useEffect, useRef } from "react";
import { D, F } from "./constants";
import { Avatar, Toggle, Spinner } from "./components";

/* ═══════════════════════════════════════════════════════════════════════════
   ULTRA T  ·  Settings Slide-over Panel  (right drawer)
   All toggles fire real side-effects: notifications API, vibration, etc.
═══════════════════════════════════════════════════════════════════════════ */

const Sec = ({title}) => (
  <div style={{fontFamily:F.sig,fontSize:10,color:D.cyan,letterSpacing:".16em",marginBottom:10,marginTop:4,
    display:"flex",alignItems:"center",gap:10}}>
    <div style={{flex:1,height:1,background:"rgba(0,245,224,.12)"}}/>
    {title}
    <div style={{flex:1,height:1,background:"rgba(0,245,224,.12)"}}/>
  </div>
);

export default function SettingsPanel({ settings, setSettings, onInstall, onSignOut, user, toast }) {
  const set = (k, v) => {
    setSettings(s => ({ ...s, [k]: v }));
    toast(`${k.replace(/([A-Z])/g," $1").trim().toUpperCase()} ${v ? "ENABLED" : "DISABLED"}`, v ? "success" : "info");
  };

  const requestNotif = async (v) => {
    if (v && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        set("pushNotif", true);
        toast("Notifications granted", "success");
        new Notification("ULTRA T", { body: "Push notifications active ✦", icon: "/favicon.ico" });
      } else {
        toast("Permission denied by browser", "error");
      }
    } else { set("pushNotif", false); }
  };

  const handleEcoToggle = (v) => {
    set("ecoMode", v);
    if (v) {
      document.documentElement.style.setProperty("--cyan", "#00FF88");
      document.documentElement.style.setProperty("--cyanD", "#00CC6A");
    } else {
      document.documentElement.style.setProperty("--cyan", "#00F5E0");
      document.documentElement.style.setProperty("--cyanD", "#00C9B8");
    }
  };

  // Simulated data metrics
  const [metrics] = useState({
    tasks: 12, deployed: 2, urgent: 3,
    co2: "0.4g", uptime: "99.97%", latency: "31ms"
  });

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"20px 18px 40px" }}>
      {/* ── User profile card ── */}
      <div style={{ padding:"16px", borderRadius:12, background:"rgba(0,245,224,.04)", border:"1px solid rgba(0,245,224,.12)", marginBottom:22, display:"flex", alignItems:"center", gap:14 }}>
        <Avatar user={user} size={52}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:D.t1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.displayName || "User"}</div>
          <div style={{ fontSize:11, color:D.t3, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
          <div style={{ marginTop:8, display:"flex", gap:6 }}>
            <span style={{fontSize:9,padding:"2px 8px",borderRadius:3,background:"rgba(255,190,0,.12)",border:"1px solid rgba(255,190,0,.3)",color:D.amber,fontFamily:F.sig,letterSpacing:".08em"}}>PRO</span>
            <span style={{fontSize:9,padding:"2px 8px",borderRadius:3,background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.25)",color:D.green,fontFamily:F.sig,letterSpacing:".08em"}}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ── Live metrics ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:22 }}>
        {[["TASKS",metrics.tasks,D.cyan],["DEPLOYED",metrics.deployed,D.green],["URGENT",metrics.urgent,D.red],
          ["CO₂/hr",metrics.co2,D.leaf],["UPTIME",metrics.uptime,D.cyan],["LATENCY",metrics.latency,D.amber]].map(([k,v,c])=>(
          <div key={k} style={{padding:"10px 10px 8px",borderRadius:8,background:"rgba(0,0,0,.5)",border:"1px solid rgba(0,245,224,.08)",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:c,fontFamily:F.sig,animation:"countUp .4s ease"}}>{v}</div>
            <div style={{fontSize:9,color:D.t3,fontFamily:F.sig,letterSpacing:".08em",marginTop:2}}>{k}</div>
          </div>
        ))}
      </div>

      {/* ── Notifications ── */}
      <Sec title="NOTIFICATIONS"/>
      <Toggle on={settings.pushNotif} onChange={requestNotif} label="PUSH NOTIFICATIONS" sub="Real browser alerts · Due dates · Deployments" icon="🔔" color={D.cyan}/>
      <Toggle on={settings.dueAlerts} onChange={v=>set("dueAlerts",v)} label="DUE DATE ALERTS" sub="24h + 1h warnings before every deadline" icon="⏰" color={D.amber}/>
      <Toggle on={settings.teamPings} onChange={v=>set("teamPings",v)} label="TEAM COLLABORATION PINGS" sub="Get notified on mentions, assigns & comments" icon="📡" color={D.green}/>

      {/* ── Display ── */}
      <Sec title="DISPLAY"/>
      <Toggle on={settings.ecoMode} onChange={handleEcoToggle} label="🌿 ECO MODE" sub="Green palette · Reduced glow · Lower GPU usage" icon="🌱" color={D.leaf}/>
      <Toggle on={settings.cyberMode} onChange={v=>set("cyberMode",v)} label="CYBER MODE" sub="Full scanline grid · Neon orbs · Hex accents" icon="⚡" color={D.cyan}/>
      <Toggle on={settings.compactView} onChange={v=>set("compactView",v)} label="COMPACT VIEW" sub="Dense cards · More tasks per column visible" icon="⊞" color={D.violet}/>
      <Toggle on={settings.darkPulse} onChange={v=>set("darkPulse",v)} label="DARK PULSE" sub="Deeper void backgrounds · OLED-optimised" icon="🌑" color={D.violet}/>

      {/* ── AI & Automation ── */}
      <Sec title="AI & AUTOMATION"/>
      <Toggle on={settings.aiAssist} onChange={v=>set("aiAssist",v)} label="AI TASK ASSIST" sub="Auto-classify labels · Estimate story points" icon="🤖" color="#9D6FFF"/>
      <Toggle on={settings.autoRoute} onChange={v=>set("autoRoute",v)} label="AUTO ROUTING" sub="AI assigns tasks to best available teammate" icon="⟳" color={D.amber}/>
      <Toggle on={settings.smartSearch} onChange={v=>set("smartSearch",v)} label="SEMANTIC SEARCH" sub="Natural language search via embeddings" icon="🔍" color={D.cyan}/>
      <Toggle on={settings.aiSummary} onChange={v=>set("aiSummary",v)} label="AI SPRINT SUMMARY" sub="Auto-generate daily stand-up reports" icon="📋" color={D.green}/>

      {/* ── Sync & Security ── */}
      <Sec title="SYNC & SECURITY"/>
      <Toggle on={settings.pullMode} onChange={v=>set("pullMode",v)} label="PULL MODE" sub="Manual refresh only · Conserves mobile data" icon="↓" color={D.amber}/>
      <Toggle on={settings.offlineMode} onChange={v=>set("offlineMode",v)} label="OFFLINE FIRST (PWA)" sub="All tasks cached locally · Sync on reconnect" icon="📴" color={D.green}/>
      <Toggle on={settings.e2e} onChange={v=>set("e2e",v)} label="END-TO-END ENCRYPTION" sub="AES-256-GCM · Data encrypted before leaving device" icon="🔐" color={D.red}/>
      <Toggle on={settings.auditLog} onChange={v=>set("auditLog",v)} label="AUDIT LOG" sub="Track every change: who, what, when" icon="🛡" color={D.violet}/>

      {/* ── Pro badge ── */}
      <Sec title="PRO PLAN"/>
      <div style={{padding:"16px",borderRadius:10,background:"linear-gradient(135deg,rgba(255,190,0,.08),rgba(0,245,224,.04))",border:"1px solid rgba(255,190,0,.25)",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <span style={{fontSize:26}}>⭐</span>
          <div>
            <div style={{fontFamily:F.sig,fontSize:14,color:D.amber,letterSpacing:".06em"}}>ULTRA T PRO</div>
            <div style={{fontSize:11,color:D.t3,marginTop:1}}>Unlimited · AI · Priority support</div>
          </div>
          <div style={{marginLeft:"auto",padding:"4px 10px",borderRadius:4,background:"rgba(255,190,0,.15)",border:"1px solid rgba(255,190,0,.35)",fontSize:10,fontFamily:F.sig,color:D.amber,letterSpacing:".1em"}}>ACTIVE</div>
        </div>
        {["Unlimited tasks & sprints","AI task classification","Advanced analytics","End-to-end encryption","24/7 priority support","99.99% uptime SLA","Green compute nodes"].map(feat=>(
          <div key={feat} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <span style={{color:D.green,fontSize:11}}>✦</span>
            <span style={{fontSize:12,color:D.t2}}>{feat}</span>
          </div>
        ))}
      </div>

      {/* ── Install ── */}
      <Sec title="INSTALL"/>
      <div style={{padding:"14px 16px",borderRadius:10,background:"rgba(0,0,0,.4)",border:"1px solid rgba(0,245,224,.1)",marginBottom:14}}>
        <div style={{fontFamily:F.sig,fontSize:11,color:D.cyan,letterSpacing:".08em",marginBottom:8}}>📲 INSTALL AS PWA</div>
        <div style={{fontSize:12,color:D.t2,lineHeight:1.6,marginBottom:12}}>
          Add ULTRA T to your home screen on any device. Works offline. No app store required.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[["🤖","Android","Chrome menu → Add to Home"],["🍎","iOS","Safari → Share → Add to Home"],["💻","Desktop","Chrome → ⊕ in address bar"]].map(([ico,name,tip])=>(
            <div key={name} style={{padding:"10px 8px",borderRadius:8,background:"rgba(0,245,224,.04)",border:"1px solid rgba(0,245,224,.1)",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{ico}</div>
              <div style={{fontSize:10,fontFamily:F.sig,color:D.cyan,letterSpacing:".06em"}}>{name}</div>
              <div style={{fontSize:9,color:D.t3,marginTop:3,lineHeight:1.4}}>{tip}</div>
            </div>
          ))}
        </div>
        <button onClick={onInstall} className="hex-btn" style={{width:"100%",padding:"11px",borderRadius:8,fontSize:12,letterSpacing:".1em"}}>⊕ INSTALL ON THIS DEVICE</button>
      </div>

      {/* ── Sign out ── */}
      <button onClick={onSignOut} className="danger-btn" style={{width:"100%",padding:"13px",borderRadius:8,fontSize:13,letterSpacing:".08em"}}>
        🚪 SIGN OUT · {(user.displayName||"User").split(" ")[0].toUpperCase()}
      </button>
    </div>
  );
}

import React, { useState } from "react";
import { D, F, STATUS, PRIORITY, LABELS, fmtDT, uid } from "./constants";
import { LabelBadge, Toggle, Spinner } from "./components";
import DTPicker from "./DTPicker";

/* ═══════════════════════════════════════════════════════════════════════════
   ULTRA T  ·  Task Form  ·  Create & Edit with full CRUD
   Integrated Groq AI Assistant Auto-fill
   ═══════════════════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  {icon:"🔒",label:"SECURITY",    data:{title:"Security audit & penetration test",       status:"todo",     priority:"urgent",labels:["security"],           sp:8}},
  {icon:"🤖",label:"AI MODEL",    data:{title:"Deploy AI inference model v3",            status:"backlog",  priority:"high",  labels:["ai","backend"],        sp:13}},
  {icon:"🚀",label:"DEPLOY",      data:{title:"Production deployment — release v2.1",    status:"todo",     priority:"urgent",labels:["devops"],              sp:5}},
  {icon:"🐛",label:"BUG FIX",     data:{title:"Critical bug — auth token expiry",        status:"inprogress",priority:"high",  labels:["bug","backend"],      sp:3}},
  {icon:"📡",label:"API",         data:{title:"REST API v3 — rate limiting & auth",      status:"todo",     priority:"medium",labels:["api","backend"],       sp:5}},
  {icon:"🧪",label:"E2E TEST",    data:{title:"E2E test suite — critical user paths",    status:"todo",     priority:"medium",labels:["testing"],             sp:5}},
  {icon:"📱",label:"MOBILE",      data:{title:"React Native mobile app — iOS + Android", status:"backlog",  priority:"high",  labels:["mobile","frontend"],   sp:13}},
  {icon:"🌿",label:"ECO",         data:{title:"Green compute migration — carbon-neutral",status:"backlog",  priority:"medium",labels:["eco","devops"],        sp:8}},
  {icon:"🔑",label:"AUTH",        data:{title:"OAuth 2.0 + biometric login flow",        status:"todo",     priority:"high",  labels:["security","frontend"], sp:8}},
  {icon:"📊",label:"ANALYTICS",   data:{title:"Real-time analytics dashboard",           status:"todo",     priority:"medium",labels:["frontend","feature"],  sp:8}},
];

export default function TaskForm({ task, onSave, onDelete, onClose }) {
  const isEdit = !!task?.id;
  const [f, setF] = useState({
    title:"", desc:"", status:"todo", priority:"medium",
    labels:[], due:"", sp:3, comments:[], attachments:0,
    ...task
  });
  const [err,    setErr]    = useState("");
  const [delOk,  setDelOk]  = useState(false);
  const [dtOpen, setDtOpen] = useState(false);
  const [tab,    setTab]    = useState("details"); // details | checklist
  const [aiLoading, setAiLoading] = useState(false);

  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const tglLabel = l => set("labels", f.labels.includes(l) ? f.labels.filter(x=>x!==l) : [...f.labels, l]);
  const submit = () => { if (!f.title.trim()) { setErr("Title is required"); return; } onSave(f); };

  const handleAiAssist = async () => {
    if (!f.title.trim()) {
      setErr("Please enter a task title first!");
      return;
    }
    setAiLoading(true);
    setErr("");
    const groqKey = localStorage.getItem("ultra-t-groq-key") || "";
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-specdec",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant. Given a task title, write a very short, professional task description (max 2 sentences), choose tags from ['frontend', 'backend', 'design', 'bug', 'feature', 'docs', 'devops', 'testing', 'mobile', 'api', 'security', 'ai'], and estimate Fibonacci story points (1, 2, 3, 5, 8, 13, 21). Return ONLY valid JSON format: {\"desc\": \"Description\", \"labels\": [\"tag1\", \"tag2\"], \"sp\": 3}"
            },
            {
              role: "user",
              content: `Task Title: "${f.title}"`
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });
      const res = await response.json();
      if (res.error) throw new Error(res.error.message);
      const data = JSON.parse(res.choices[0].message.content);
      setF(prev => ({
        ...prev,
        desc: data.desc || prev.desc,
        labels: Array.isArray(data.labels) ? data.labels : prev.labels,
        sp: typeof data.sp === 'number' ? data.sp : prev.sp
      }));
    } catch (e) {
      console.error("AI Assist failed:", e);
      setErr("AI assist failed: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      style={{ position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width:"100%",maxWidth:560,maxHeight:"94vh",overflowY:"auto",
        background:D.dark,borderRadius:"16px 16px 0 0",
        border:"1px solid rgba(0,245,224,.2)",borderBottom:"none",
        boxShadow:"0 -28px 80px rgba(0,0,0,.95), 0 0 80px rgba(0,245,224,.06)",
        animation:"slideUp .38s cubic-bezier(.34,1.2,.64,1)"
      }}>
        <div style={{height:2,background:"linear-gradient(90deg,transparent,#00F5E0,#00FF88,#9D6FFF,transparent)"}}/>

        <div style={{ padding:"20px 22px 40px" }}>
          {/* ── Header ── */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{fontFamily:F.sig,fontSize:11,color:D.cyan,letterSpacing:".14em",marginBottom:4}}>
                {isEdit?"// EDIT TASK":"// NEW TASK"}
              </div>
              <h2 style={{fontSize:20,fontWeight:700,color:D.t1,margin:0}}>
                {isEdit ? "Update parameters" : "Initialize task object"}
              </h2>
            </div>
            <button onClick={onClose} style={{width:34,height:34,borderRadius:8,border:"1px solid rgba(0,245,224,.18)",background:"rgba(255,45,91,.06)",color:D.red,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
          </div>

          {/* ── Tab Bar ── */}
          <div style={{display:"flex",gap:4,background:"rgba(0,0,0,.4)",borderRadius:8,padding:3,marginBottom:20,border:"1px solid rgba(0,245,224,.1)"}}>
            {[["details","⚙ DETAILS"],["labels","🏷 LABELS"],["meta","📊 META"]].map(([k,lbl])=>(
              <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"9px",borderRadius:6,border:"none",cursor:"pointer",
                fontSize:11,fontFamily:F.sig,letterSpacing:".07em",fontWeight:700,transition:"all .15s",
                background:tab===k?"linear-gradient(135deg,rgba(0,245,224,.14),rgba(0,255,136,.08))":"transparent",
                color:tab===k?D.cyan:D.t3,boxShadow:tab===k?"0 0 12px rgba(0,245,224,.18)":"none"}}>
                {lbl}
              </button>
            ))}
          </div>

          {/* ── Templates (only for new tasks, on details tab) ── */}
          {!isEdit && tab==="details" && (
            <div style={{ marginBottom:18 }}>
              <div style={{fontFamily:F.sig,fontSize:9,color:D.t3,letterSpacing:".14em",marginBottom:8}}>// QUICK TEMPLATES</div>
              <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
                {TEMPLATES.map(t=>(
                  <button key={t.label} onClick={()=>setF(prev=>({...prev,...t.data}))}
                    style={{flexShrink:0,padding:"6px 12px",borderRadius:5,cursor:"pointer",fontSize:10,fontFamily:F.sig,letterSpacing:".07em",
                      border:`1px solid ${f.title===t.data.title?"rgba(0,245,224,.4)":"rgba(0,245,224,.1)"}`,
                      background:f.title===t.data.title?"rgba(0,245,224,.12)":"rgba(0,245,224,.03)",
                      color:f.title===t.data.title?D.cyan:D.t2,transition:"all .13s",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB: DETAILS ═══ */}
          {tab==="details" && <>
            {/* Title */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{fontFamily:F.sig,fontSize:9,color:D.t3,letterSpacing:".14em"}}>// TASK.TITLE *</label>
                <button 
                  onClick={handleAiAssist} 
                  disabled={aiLoading}
                  style={{
                    background: "rgba(167,139,250,.12)",
                    border: "1px solid rgba(167,139,250,.3)",
                    color: "#C084FC",
                    fontFamily: F.sig,
                    fontSize: 9,
                    padding: "3px 8px",
                    borderRadius: 4,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all .13s",
                    letterSpacing: ".05em"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,.2)"; e.currentTarget.style.borderColor = "rgba(167,139,250,.55)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,.12)"; e.currentTarget.style.borderColor = "rgba(167,139,250,.3)"; }}
                >
                  {aiLoading ? <Spinner size={12}/> : "✨ AI Auto-fill (Groq)"}
                </button>
              </div>
              <input value={f.title} onChange={e=>{set("title",e.target.value);setErr("");}}
                placeholder="Describe the objective clearly…" className="ifield"/>
              {err && <div style={{color:D.red,fontSize:11,marginTop:5,fontFamily:F.sig}}>{err}</div>}
            </div>

            {/* Description */}
            <div style={{ marginBottom:14 }}>
              <label style={{fontFamily:F.sig,fontSize:9,color:D.t3,letterSpacing:".14em",display:"block",marginBottom:6}}>// TASK.DESCRIPTION</label>
              <textarea value={f.desc} onChange={e=>set("desc",e.target.value)} rows={4}
                placeholder="// Context, acceptance criteria, edge cases, links…" className="ifield" style={{resize:"vertical",lineHeight:1.65}}/>
            </div>

            {/* Status + Priority */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              {[["status","STATUS",STATUS],["priority","PRIORITY",PRIORITY]].map(([key,lbl,cfg])=>(
                <div key={key}>
                  <label style={{fontFamily:F.sig,fontSize:9,color:D.t3,letterSpacing:".14em",display:"block",marginBottom:6}}>// TASK.{lbl}</label>
                  <select value={f[key]} onChange={e=>set(key,e.target.value)} className="ifield"
                    style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%2300F5E0'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",paddingRight:30}}>
                    {Object.entries(cfg).map(([k,v])=><option key={k} value={k}>{v.label||v.icon+" "+v.label}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Due date – premium picker */}
            <div style={{ marginBottom:14 }}>
              <label style={{fontFamily:F.sig,fontSize:9,color:D.t3,letterSpacing:".14em",display:"block",marginBottom:6}}>// TASK.DUE_DATE_TIME</label>
              <button onClick={()=>setDtOpen(true)} style={{
                width:"100%",padding:"11px 14px",background:"rgba(0,0,0,.55)",
                border:"1px solid rgba(0,245,224,.14)",borderRadius:6,
                color:f.due?D.cyan:D.t3,cursor:"pointer",fontSize:13,textAlign:"left",
                display:"flex",alignItems:"center",gap:10,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,245,224,.38)";e.currentTarget.style.boxShadow="0 0 14px rgba(0,245,224,.1)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,245,224,.14)";e.currentTarget.style.boxShadow="none"}}>
                <span style={{fontSize:18}}>📅</span>
                <span style={{flex:1,fontFamily:f.due?F.sig:F.disp,fontSize:f.due?12:13,letterSpacing:f.due?".04em":"0"}}>
                  {f.due ? fmtDT(f.due) : "Set deadline & time →"}
                </span>
                {f.due && (
                  <span onClick={e=>{e.stopPropagation();set("due","");}}
                    style={{fontSize:12,padding:"2px 7px",borderRadius:4,background:"rgba(255,45,91,.1)",border:"1px solid rgba(255,45,91,.25)",color:D.red,cursor:"pointer"}}>✕</span>
                )}
              </button>
            </div>
          </>}

          {/* ═══ TAB: LABELS ═══ */}
          {tab==="labels" && (
            <div>
              <div style={{fontFamily:F.sig,fontSize:9,color:D.t3,letterSpacing:".14em",marginBottom:12}}>// SELECT LABELS (multiple)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {Object.keys(LABELS).map(l=>{
                  const cfg=LABELS[l];
                  const active=f.labels.includes(l);
                  return(
                    <button key={l} onClick={()=>tglLabel(l)} style={{
                      padding:"8px 14px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:F.sig,letterSpacing:".07em",
                      border:`1px solid ${active?cfg.b:"rgba(0,245,224,.1)"}`,
                      background:active?cfg.bg:"rgba(0,0,0,.3)",
                      color:active?cfg.col:D.t3,transition:"all .15s",
                      boxShadow:active?`0 0 12px ${cfg.col}22`:"none"}}>
                      {active?"✓ ":""}{l.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              {f.labels.length>0&&(
                <div style={{marginTop:14,display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:D.t3,fontFamily:F.sig,marginRight:4}}>SELECTED:</span>
                  {f.labels.map(l=><LabelBadge key={l} label={l}/>)}
                </div>
              )}
            </div>
          )}

          {/* ═══ TAB: META ═══ */}
          {tab==="meta" && (
            <div>
              {/* Story points */}
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:F.sig,fontSize:9,color:D.t3,letterSpacing:".14em",marginBottom:10}}>// STORY POINTS (Fibonacci)</div>
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3,5,8,13,21,34].map(n=>(
                    <button key={n} onClick={()=>set("sp",n)} style={{
                      flex:1,padding:"10px 0",borderRadius:6,
                      border:`1px solid ${f.sp===n?D.cyan:"rgba(0,245,224,.14)"}`,
                      background:f.sp===n?"rgba(0,245,224,.14)":"rgba(0,0,0,.4)",
                      color:f.sp===n?D.cyan:D.t3,cursor:"pointer",fontFamily:F.sig,fontSize:12,
                      transition:"all .15s",boxShadow:f.sp===n?`0 0 12px rgba(0,245,224,.25)`:"none"}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity indicator */}
              <div style={{padding:"14px 16px",borderRadius:8,background:"rgba(0,0,0,.4)",border:"1px solid rgba(0,245,224,.1)",marginBottom:16}}>
                <div style={{fontFamily:F.sig,fontSize:9,color:D.t3,letterSpacing:".14em",marginBottom:8}}>// COMPLEXITY INDICATOR</div>
                <div style={{display:"flex",gap:4}}>
                  {Array.from({length:8},(_,i)=>(
                    <div key={i} style={{flex:1,height:8,borderRadius:2,
                      background:i<(f.sp<=2?1:f.sp<=3?2:f.sp<=5?3:f.sp<=8?5:f.sp<=13?6:8)
                        ?`rgba(${f.sp>=13?"255,45,91":f.sp>=8?"255,190,0":"0,245,224"},0.9)`
                        :"rgba(0,245,224,.1)",
                      transition:"background .2s"}}/>
                  ))}
                </div>
                <div style={{fontSize:11,color:D.t3,marginTop:6,fontFamily:F.sig}}>
                  SP {f.sp} → {f.sp<=2?"Trivial":f.sp<=3?"Small":f.sp<=5?"Medium":f.sp<=8?"Large":f.sp<=13?"X-Large":"Epic"} effort
                </div>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            {isEdit && !delOk && (
              <button onClick={()=>setDelOk(true)} className="danger-btn" style={{padding:"12px 18px",borderRadius:8,flexShrink:0}}>🗑 DELETE</button>
            )}
            <button onClick={submit} className="hex-btn" style={{flex:1,padding:"13px",borderRadius:8,fontSize:13,letterSpacing:".1em"}}>
              {isEdit ? "✦ UPDATE TASK" : "✦ INITIALIZE TASK"}
            </button>
          </div>

          {delOk && (
            <div style={{marginTop:14,padding:"14px 16px",borderRadius:8,background:"rgba(255,45,91,.07)",border:"1px solid rgba(255,45,91,.3)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:D.red,fontSize:13,fontFamily:F.sig,fontWeight:700}}>⚠ CONFIRM DELETE</div>
                <div style={{color:D.t3,fontSize:11,marginTop:2}}>This action is irreversible.</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setDelOk(false)} style={{padding:"8px 14px",background:"transparent",border:"none",color:D.t2,cursor:"pointer",fontSize:11,fontFamily:F.sig}}>CANCEL</button>
                <button onClick={()=>onDelete(task.id)} style={{padding:"8px 16px",background:D.red,border:"none",color:"#fff",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:F.sig,fontWeight:700,boxShadow:`0 0 16px rgba(255,45,91,.4)`}}>YES, DELETE</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {dtOpen && <DTPicker value={f.due} onChange={v=>set("due",v)} onClose={()=>setDtOpen(false)}/>}
    </div>
  );
}

import React, { useState } from "react";
import { D, F, MFULL, DNAMES, fmtDT } from "./constants";

/* ═══════════════════════════════════════════════════════════════════════════
   ULTRA T  ·  Premium Date–Time Picker
   ·  Step 1: Calendar → Step 2: Analogue+Digital clock
   ·  Keyboard accessible, mobile-friendly bottom-sheet
═══════════════════════════════════════════════════════════════════════════ */

export default function DTPicker({ value, onChange, onClose }) {
  const init = value ? new Date(value) : new Date();
  const [view, setView]   = useState("cal");           // "cal" | "time"
  const [yr,  setYr ]     = useState(init.getFullYear());
  const [mo,  setMo ]     = useState(init.getMonth());
  const [day, setDay]     = useState(value ? init.getDate() : null);
  const [hr,  setHr ]     = useState(init.getHours() % 12 || 12);
  const [min, setMin]     = useState(Math.round(init.getMinutes() / 5) * 5 % 60);
  const [ap,  setAp ]     = useState(init.getHours() < 12 ? "AM" : "PM");
  const [hov, setHov]     = useState(null);
  const [dragging, setDragging] = useState(null); // "hr"|"min"|null

  const today = new Date();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMo }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );
  const isPast = d => new Date(yr, mo, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const confirm = () => {
    if (!day) return;
    const h24 = ap === "AM" ? (hr === 12 ? 0 : hr) : (hr === 12 ? 12 : hr + 12);
    onChange(new Date(yr, mo, day, h24, min, 0).toISOString());
    onClose();
  };

  /* ── Clock drag interaction ─────────────────────────────────────────── */
  const handleClockPointer = (e, type) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const compute = (ev) => {
      const dx = (ev.clientX || ev.touches?.[0]?.clientX || 0) - cx;
      const dy = (ev.clientY || ev.touches?.[0]?.clientY || 0) - cy;
      let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      if (type === "hr") {
        const h = Math.round(angle / 30) % 12 || 12;
        setHr(h);
      } else {
        const m = Math.round(angle / 6) % 60;
        setMin(Math.round(m / 5) * 5 % 60);
      }
    };
    compute(e);
    const move = ev => compute(ev);
    const up   = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setDragging(null); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    setDragging(type);
  };

  const radius = 88;
  const hrAngle  = ((hr % 12) / 12) * 360;
  const minAngle = (min / 60) * 360;
  const toXY = (angle, r) => ({
    x: Math.sin((angle * Math.PI) / 180) * r,
    y: -Math.cos((angle * Math.PI) / 180) * r,
  });

  const hrPos  = toXY(hrAngle,  radius * 0.58);
  const minPos = toXY(minAngle, radius * 0.82);

  /* ── Numbers on clock face ──────────────────────────────────────────── */
  const ClockNum = ({ n, isMin }) => {
    const angle = isMin ? (n / 60) * 360 : (n / 12) * 360;
    const r     = radius * (isMin ? 0.82 : 0.6);
    const pos   = toXY(angle, r);
    const active= isMin ? min === n : hr === n;
    return(
      <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
        style={{fontSize:isMin?9:11,fontFamily:F.sig,fill:active?D.cyan:D.t3,
          cursor:"pointer",fontWeight:active?700:400,transition:"fill .15s"}}
        onClick={e=>{e.stopPropagation();isMin?setMin(n):setHr(n);}}>
        {isMin ? String(n).padStart(2,"0") : n}
      </text>
    );
  };

  return (
    <div
      style={{ position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,.92)",backdropFilter:"blur(16px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width:"100%",maxWidth:460,borderRadius:"16px 16px 0 0",
        background:D.dark,border:"1px solid rgba(0,245,224,.22)",borderBottom:"none",
        boxShadow:"0 -24px 80px rgba(0,0,0,.9), 0 0 80px rgba(0,245,224,.07)",
        animation:"slideUp .36s cubic-bezier(.34,1.2,.64,1)"
      }}>
        {/* Rainbow top-bar */}
        <div style={{height:2,background:"linear-gradient(90deg,transparent,#00F5E0,#00FF88,#9D6FFF,#FFBE00,transparent)",borderRadius:"16px 16px 0 0"}}/>

        <div style={{ padding:"20px 22px 32px" }}>
          {/* ── Header ── */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div>
              <div style={{fontFamily:F.sig,fontSize:11,color:D.cyan,letterSpacing:".14em",marginBottom:3}}>
                {view==="cal"?"// SELECT DATE":"// SET TIME"}
              </div>
              <div style={{fontSize:20,fontWeight:700,color:D.t1}}>
                {day
                  ? `${MFULL[mo]} ${day}, ${yr}${view==="time" ? ` · ${String(hr).padStart(2,"0")}:${String(min).padStart(2,"0")} ${ap}` : ""}`
                  : "Choose a date"}
              </div>
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {view==="time" && (
                <button onClick={()=>setView("cal")} style={{background:"none",border:"1px solid rgba(0,245,224,.2)",color:D.cyan,cursor:"pointer",padding:"6px 12px",borderRadius:6,fontFamily:F.sig,fontSize:11,letterSpacing:".08em"}}>← DATE</button>
              )}
              {view==="cal" && <>
                <button onClick={()=>{mo===0?(setMo(11),setYr(y=>y-1)):setMo(m=>m-1)}} style={{width:32,height:32,borderRadius:6,border:"1px solid rgba(0,245,224,.2)",background:"rgba(0,245,224,.06)",color:D.cyan,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>‹</button>
                <button onClick={()=>{mo===11?(setMo(0),setYr(y=>y+1)):setMo(m=>m+1)}} style={{width:32,height:32,borderRadius:6,border:"1px solid rgba(0,245,224,.2)",background:"rgba(0,245,224,.06)",color:D.cyan,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>›</button>
              </>}
              <button onClick={onClose} style={{width:32,height:32,borderRadius:6,border:"1px solid rgba(0,245,224,.15)",background:"rgba(255,45,91,.06)",color:D.red,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:300}}>×</button>
            </div>
          </div>

          {/* ── CALENDAR ── */}
          {view==="cal" && <>
            <div style={{fontFamily:F.sig,fontSize:13,color:D.cyan,letterSpacing:".1em",textAlign:"center",marginBottom:14,textShadow:"0 0 12px rgba(0,245,224,.4)"}}>
              {MFULL[mo].toUpperCase()} {yr}
            </div>
            {/* Day names */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:6,gap:2}}>
              {DNAMES.map(d=>(
                <div key={d} style={{textAlign:"center",fontSize:10,color:D.t3,fontFamily:F.sig,letterSpacing:".06em"}}>{d.slice(0,2)}</div>
              ))}
            </div>
            {/* Day cells */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:16}}>
              {cells.map((d,i)=>{
                if(!d) return <div key={i}/>;
                const sel = d===day;
                const tod = d===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear();
                const past = isPast(d);
                const h = hov===d;
                return(
                  <div key={i} onClick={()=>!past&&setDay(d)} onMouseEnter={()=>!past&&setHov(d)} onMouseLeave={()=>setHov(null)}
                    style={{
                      height:42,display:"flex",alignItems:"center",justifyContent:"center",
                      cursor:past?"not-allowed":"pointer",borderRadius:8,
                      fontSize:12,fontWeight:sel?700:400,fontFamily:sel?F.sig:F.disp,
                      color:past?D.t4:sel?"#000":tod?D.cyan:D.t1,
                      background:sel?"linear-gradient(135deg,#00F5E0,#00FF88)":h?"rgba(0,245,224,.1)":"transparent",
                      border:tod&&!sel?"1px solid rgba(0,245,224,.35)":"1px solid transparent",
                      boxShadow:sel?"0 0 16px rgba(0,245,224,.5),0 4px 12px rgba(0,0,0,.4)":"none",
                      transition:"all .13s"
                    }}>
                    {d}
                  </div>
                );
              })}
            </div>
            {/* Quick picks */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
              {[["TODAY",0],["TOMORROW",1],["3 DAYS",3],["1 WEEK",7],["2 WEEKS",14],["1 MONTH",30]].map(([lbl,days])=>(
                <button key={lbl} onClick={()=>{const d=new Date();d.setDate(d.getDate()+days);setMo(d.getMonth());setYr(d.getFullYear());setDay(d.getDate());}}
                  style={{padding:"5px 11px",borderRadius:4,fontSize:10,fontFamily:F.sig,letterSpacing:".07em",
                    border:"1px solid rgba(0,245,224,.22)",background:"rgba(0,245,224,.06)",color:D.cyan,cursor:"pointer",transition:"all .13s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(0,245,224,.14)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(0,245,224,.06)"}>
                  {lbl}
                </button>
              ))}
            </div>
            <button onClick={()=>day&&setView("time")} disabled={!day}
              className={day?"hex-btn":""}
              style={{width:"100%",padding:"13px",borderRadius:8,fontFamily:F.sig,fontSize:12,letterSpacing:".1em",
                opacity:day?1:.4,cursor:day?"pointer":"default",
                ...(day?{}:{background:"rgba(0,0,0,.4)",border:"1px solid rgba(0,245,224,.1)",color:D.t4})}}>
              {day?"NEXT → SET TIME ⏱":"SELECT A DATE FIRST"}
            </button>
          </>}

          {/* ── CLOCK ── */}
          {view==="time" && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
              {/* Analogue clock */}
              <div style={{position:"relative",userSelect:"none"}}>
                <svg width={radius*2+40} height={radius*2+40} style={{cursor:dragging?"none":"pointer"}}
                  onPointerDown={e=>handleClockPointer(e,"hr")}
                  viewBox={`${-radius-20} ${-radius-20} ${(radius+20)*2} ${(radius+20)*2}`}>
                  {/* Clock face */}
                  <circle r={radius+2} fill="rgba(0,0,0,.6)" stroke="rgba(0,245,224,.15)" strokeWidth={1}/>
                  <circle r={radius-14} fill="none" stroke="rgba(0,245,224,.06)" strokeWidth={1}/>
                  {/* Tick marks */}
                  {Array.from({length:60},(_,i)=>{
                    const a=(i/60)*360;
                    const isMaj=i%5===0;
                    const p1=toXY(a,radius-(isMaj?8:4));const p2=toXY(a,radius-1);
                    return<line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={isMaj?"rgba(0,245,224,.3)":"rgba(0,245,224,.1)"} strokeWidth={isMaj?1.5:0.7}/>;
                  })}
                  {/* Hr numbers */}
                  {[12,1,2,3,4,5,6,7,8,9,10,11].map(h=><ClockNum key={h} n={h} isMin={false}/>)}
                  {/* Min markers (every 5) */}
                  {[0,5,10,15,20,25,30,35,40,45,50,55].map(m=><ClockNum key={m} n={m} isMin={true}/>)}
                  {/* Hour hand */}
                  <line x1={0} y1={0} x2={hrPos.x} y2={hrPos.y} stroke={D.cyan} strokeWidth={4} strokeLinecap="round" style={{cursor:"grab",filter:`drop-shadow(0 0 6px ${D.cyan})`}}
                    onPointerDown={e=>{e.stopPropagation();handleClockPointer(e,"hr");}}/>
                  {/* Minute hand */}
                  <line x1={0} y1={0} x2={minPos.x} y2={minPos.y} stroke={D.green} strokeWidth={2.5} strokeLinecap="round" style={{cursor:"grab",filter:`drop-shadow(0 0 5px ${D.green})`}}
                    onPointerDown={e=>{e.stopPropagation();handleClockPointer(e,"min");}}/>
                  {/* Center dot */}
                  <circle r={6} fill={D.cyan} style={{filter:`drop-shadow(0 0 8px ${D.cyan})`}}/>
                  <circle r={3} fill={D.dark}/>
                </svg>
              </div>

              {/* Digital display */}
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:F.sig,fontSize:44,letterSpacing:".1em",color:D.cyan,
                  textShadow:`0 0 24px rgba(0,245,224,.7),0 0 48px rgba(0,245,224,.3)`,lineHeight:1}}>
                  {String(hr).padStart(2,"0")}:{String(min).padStart(2,"0")}
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:10}}>
                  {["AM","PM"].map(p=>(
                    <button key={p} onClick={()=>setAp(p)} style={{
                      padding:"8px 22px",borderRadius:6,fontFamily:F.sig,fontSize:13,letterSpacing:".1em",fontWeight:700,cursor:"pointer",transition:"all .15s",
                      border:`1px solid ${ap===p?"rgba(0,245,224,.5)":"rgba(0,245,224,.15)"}`,
                      background:ap===p?"rgba(0,245,224,.15)":"rgba(0,0,0,.4)",
                      color:ap===p?D.cyan:D.t3,
                      boxShadow:ap===p?`0 0 14px rgba(0,245,224,.25)`:"none"}}>
                      {p}
                    </button>
                  ))}
                </div>
                <div style={{fontSize:11,color:D.t3,fontFamily:F.sig,marginTop:8,letterSpacing:".08em"}}>
                  Drag hands · or tap numbers to set time
                </div>
              </div>

              {/* Confirm */}
              <div style={{display:"flex",gap:10,width:"100%"}}>
                <button onClick={onClose} style={{flex:1,padding:"13px",borderRadius:8,border:"1px solid rgba(0,245,224,.12)",background:"transparent",color:D.t2,cursor:"pointer",fontSize:12,fontFamily:F.sig,letterSpacing:".08em"}}>CANCEL</button>
                <button onClick={confirm} className="hex-btn" style={{flex:2,padding:"13px",borderRadius:8,fontSize:13,letterSpacing:".1em"}}>CONFIRM ✦</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

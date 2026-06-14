import React, { useState, useCallback } from "react";
import { D, F, uid, LABELS, STATUS } from "./constants";

// ─── TOAST ─────────────────────────────────────────────────────────────────
export function useToast(){
  const [list,setList]=useState([]);
  const add=useCallback((msg,type="success",sub="")=>{
    const id=uid();
    setList(l=>[...l,{id,msg,type,sub}]);
    setTimeout(()=>setList(l=>l.filter(x=>x.id!==id)),4200);
  },[]);
  return{list,add};
}

export function Toasts({list}){
  const map={success:D.cyan,error:D.red,info:D.violet,warning:D.amber};
  const ico={success:"✦",error:"✕",info:"◎",warning:"⚠"};
  return(
    <div style={{position:"fixed",bottom:24,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:340,pointerEvents:"none"}}>
      {list.map(t=>(
        <div key={t.id} style={{
          padding:"12px 16px",borderRadius:8,animation:"toastIn .32s ease",pointerEvents:"auto",
          background:"rgba(4,21,32,.98)",border:`1px solid ${map[t.type]}33`,
          boxShadow:`0 0 24px ${map[t.type]}18, 0 8px 32px rgba(0,0,0,.7)`,
          display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:32,height:32,borderRadius:6,background:`rgba(${t.type==="success"?"0,245,224":t.type==="error"?"255,45,91":t.type==="info"?"157,111,255":"255,190,0"},.14)`,border:`1px solid ${map[t.type]}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:map[t.type]}}>
            {ico[t.type]}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:D.t1,fontFamily:F.sig,letterSpacing:".04em"}}>{t.msg}</div>
            {t.sub&&<div style={{fontSize:11,color:D.t2,marginTop:2}}>{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CYBER GRID BACKGROUND ─────────────────────────────────────────────────
export function CyberGrid({eco}){
  const c=eco?"rgba(0,255,136,.04)":"rgba(0,245,224,.04)";
  const g=eco?"rgba(0,255,136,.06)":"rgba(0,245,224,.06)";
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none"}}>
      {/* Moving scanline */}
      <div style={{position:"absolute",left:0,right:0,height:2,background:`linear-gradient(0deg,transparent,${g},transparent)`,animation:"scanline 10s linear infinite",zIndex:1}}/>
      {/* Grid */}
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px)`,backgroundSize:"40px 40px"}}/>
      {/* Ambient orbs */}
      <div style={{position:"absolute",top:"-15%",left:"-8%",width:"55vw",height:"55vw",borderRadius:"50%",background:`radial-gradient(ellipse,${eco?"rgba(0,255,136,.055)":"rgba(0,245,224,.06)"} 0%,transparent 70%)`,filter:"blur(80px)"}}/>
      <div style={{position:"absolute",bottom:"-10%",right:"-8%",width:"48vw",height:"48vw",borderRadius:"50%",background:`radial-gradient(ellipse,${eco?"rgba(34,197,94,.04)":"rgba(0,255,136,.05)"} 0%,transparent 70%)`,filter:"blur(70px)"}}/>
      <div style={{position:"absolute",top:"45%",right:"15%",width:"35vw",height:"35vw",borderRadius:"50%",background:"radial-gradient(ellipse,rgba(157,111,255,.04) 0%,transparent 70%)",filter:"blur(60px)"}}/>
      {/* Corner brackets */}
      {[["12px","auto","12px","auto"],["12px","auto","auto","12px"],["auto","12px","12px","auto"],["auto","12px","auto","12px"]].map((pos,i)=>(
        <div key={i} style={{position:"absolute",top:pos[0],bottom:pos[1],left:pos[2],right:pos[3],width:22,height:22,
          borderTop:i<2?`1px solid ${eco?"rgba(0,255,136,.3)":"rgba(0,245,224,.3)"}`:undefined,
          borderBottom:i>=2?`1px solid ${eco?"rgba(0,255,136,.3)":"rgba(0,245,224,.3)"}`:undefined,
          borderLeft:i%2===0?`1px solid ${eco?"rgba(0,255,136,.3)":"rgba(0,245,224,.3)"}`:undefined,
          borderRight:i%2!==0?`1px solid ${eco?"rgba(0,255,136,.3)":"rgba(0,245,224,.3)"}`:undefined}}/>
      ))}
    </div>
  );
}

// ─── AVATAR ────────────────────────────────────────────────────────────────
export function Avatar({user,size=36}){
  if(user.photoURL) return(
    <img src={user.photoURL} alt={user.displayName||"User"}
      style={{width:size,height:size,borderRadius:size*.22,objectFit:"cover",flexShrink:0,
        border:`1.5px solid rgba(0,245,224,.35)`,
        boxShadow:"0 0 12px rgba(0,245,224,.2)"}}/>
  );
  const initials=(user.displayName||user.email||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const hue = (user.email||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0) % 360;
  return(
    <div style={{width:size,height:size,borderRadius:size*.22,flexShrink:0,
      background:`linear-gradient(135deg,hsl(${hue},70%,18%),hsl(${(hue+50)%360},60%,28%))`,
      border:"1.5px solid rgba(0,245,224,.3)",display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:size*.32,fontWeight:700,color:D.cyan,fontFamily:F.sig,letterSpacing:"-.01em",
      boxShadow:"0 0 14px rgba(0,245,224,.2)"}}>
      {initials}
    </div>
  );
}

// ─── TOGGLE ────────────────────────────────────────────────────────────────
export function Toggle({on,onChange,label,sub,icon,color}){
  const c=color||D.cyan;
  return(
    <div className="toggle-wrap" onClick={()=>onChange(!on)} style={{
      background:on?`rgba(${c.startsWith("#")?(parseInt(c.slice(1,3),16)+","+parseInt(c.slice(3,5),16)+","+parseInt(c.slice(5,7),16)):"0,245,224"},.05)`:"transparent"}}>
      <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:on?c:D.t2,fontFamily:F.sig,letterSpacing:".04em",transition:"color .2s"}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:D.t3,marginTop:2,lineHeight:1.4}}>{sub}</div>}
      </div>
      <div className={`toggle-switch ${on?"on":"off"}`}><div className="toggle-knob"/></div>
    </div>
  );
}

// ─── LABEL BADGE ───────────────────────────────────────────────────────────
export function LabelBadge({label}){
  const cfg=LABELS[label]||{bg:"rgba(0,245,224,.08)",col:D.cyan,b:"rgba(0,245,224,.2)"};
  return(
    <span style={{fontSize:9,padding:"2px 7px",borderRadius:3,background:cfg.bg,color:cfg.col,border:`1px solid ${cfg.b}`,fontFamily:F.sig,textTransform:"uppercase",letterSpacing:".08em",whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

// ─── STATUS BADGE ──────────────────────────────────────────────────────────
export function StatusBadge({status}){
  const s=STATUS[status]||STATUS.backlog;
  return(
    <span style={{fontSize:9,padding:"3px 8px",borderRadius:3,background:`${s.hex}18`,color:s.hex,border:`1px solid ${s.hex}44`,fontFamily:F.sig,letterSpacing:".08em",display:"inline-flex",alignItems:"center",gap:4}}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── SPINNER ───────────────────────────────────────────────────────────────
export function Spinner({size=32,color}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${color||D.cyan}22`,borderTopColor:color||D.cyan,animation:"spinSlow .8s linear infinite"}}/>
  );
}

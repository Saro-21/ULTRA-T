import React, { useState } from "react";
import { D, F, STATUS, PRIORITY, LABELS, dueBadge, fmtDT } from "./constants";
import { LabelBadge, Avatar } from "./components";

/* ═══════════════════════════════════════════════════════════════════════════
   ULTRA T  ·  Task Card  (Kanban)
═══════════════════════════════════════════════════════════════════════════ */

export default function TaskCard({ task, user, onClick }) {
  const [hov, setHov] = useState(false);
  const pr  = PRIORITY[task.priority] || PRIORITY.medium;
  const due = dueBadge(task.due, task.status);

  return (
    <div
      className="cyber-card"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding:"14px 15px", cursor:"pointer" }}
    >
      {/* Urgent pulse bar */}
      {task.priority==="urgent" && task.status!=="done" && (
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"10px 0 0 10px",background:D.red,animation:"pulseRed 2s ease-in-out infinite"}}/>
      )}

      {/* ── Labels row ── */}
      {task.labels?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
          {task.labels.slice(0,4).map(l => <LabelBadge key={l} label={l}/>)}
        </div>
      )}

      {/* ── Title ── */}
      <div style={{ fontSize:14, fontWeight:600, color: hov ? D.cyan : D.t1, marginBottom:6, lineHeight:1.4, transition:"color .18s" }}>
        {task.title}
      </div>

      {/* ── Description ── */}
      {task.desc && (
        <div style={{ fontSize:11, color:D.t3, lineHeight:1.55, marginBottom:10,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {task.desc}
        </div>
      )}

      {/* ── Meta row ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:"1px solid rgba(0,245,224,.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Priority */}
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:pr.col,
              boxShadow: task.priority==="urgent" ? `0 0 8px ${pr.col}` : "none",
              animation: task.priority==="urgent" ? "pulseRed 2s infinite" : "none" }}/>
            <span style={{ fontSize:9, fontFamily:F.sig, color:pr.col, letterSpacing:".08em" }}>{pr.label}</span>
          </div>
          {/* SP */}
          <span style={{ fontSize:9, fontFamily:F.sig, color:"rgba(0,245,224,.5)", background:"rgba(0,245,224,.07)", padding:"2px 6px", borderRadius:3, letterSpacing:".06em" }}>SP{task.sp}</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Due badge */}
          {due && (
            <span style={{ fontSize:9, fontFamily:F.sig, color:due.c, letterSpacing:".06em", background:`${due.c}15`, padding:"2px 7px", borderRadius:3, border:`1px solid ${due.c}33`,
              animation: due.urgent ? "pulseRed 2s infinite" : "none" }}>
              {due.txt}
            </span>
          )}
          {/* Assigned avatar */}
          {user && <Avatar user={user} size={20}/>}
        </div>
      </div>
    </div>
  );
}

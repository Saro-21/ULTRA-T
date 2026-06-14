// ─── ULTRA T · Design Tokens & Constants ────────────────────────────────────
export const D = {
  void:"#000508",noir:"#010A0F",abyss:"#021018",dark:"#041520",deep:"#062035",
  mid:"#0A2840",surf:"#0E3050",raise:"#133860",high:"#1A4575",
  cyan:"#00F5E0",cyanD:"#00C9B8",cyanX:"#00FFFF",
  green:"#00FF88",greenD:"#00CC6A",greenX:"#39FF14",
  red:"#FF2D5B",redD:"#CC1A40",amber:"#FFBE00",amberD:"#CC9800",
  violet:"#9D6FFF",violetL:"#C084FC",
  eco1:"#0D6B5E",eco2:"#147A65",leaf:"#22C55E",
  t1:"#E8FFF8",t2:"#88B8AE",t3:"#3D7068",t4:"#1A3830",
};

export const F = {
  disp:"'Outfit','system-ui',sans-serif",
  mono:"'JetBrains Mono','Fira Code',monospace",
  sig:"'Share Tech Mono',monospace",
};

export const STATUS = {
  backlog:    {label:"BACKLOG",    icon:"○", hex:"#3D7068", glow:"rgba(61,112,104,.5)",  order:0},
  todo:       {label:"QUEUED",     icon:"◎", hex:"#00F5E0", glow:"rgba(0,245,224,.4)",   order:1},
  inprogress: {label:"EXECUTING",  icon:"◑", hex:"#FFBE00", glow:"rgba(255,190,0,.4)",   order:2},
  review:     {label:"VALIDATING", icon:"◈", hex:"#9D6FFF", glow:"rgba(157,111,255,.4)", order:3},
  done:       {label:"DEPLOYED",   icon:"✦", hex:"#00FF88", glow:"rgba(0,255,136,.4)",   order:4},
};

export const PRIORITY = {
  low:    {label:"LOW",  col:"#3D7068",dot:"#3D7068"},
  medium: {label:"MED",  col:"#FFBE00",dot:"#FFBE00"},
  high:   {label:"HIGH", col:"#FF2D5B",dot:"#FF2D5B"},
  urgent: {label:"CRIT", col:"#FF2D5B",dot:"#FF2D5B",pulse:true},
};

export const LABELS = {
  frontend:{bg:"rgba(0,245,224,.1)",col:"#00F5E0",b:"rgba(0,245,224,.25)"},
  backend: {bg:"rgba(0,255,136,.1)",col:"#00FF88",b:"rgba(0,255,136,.25)"},
  design:  {bg:"rgba(157,111,255,.1)",col:"#9D6FFF",b:"rgba(157,111,255,.25)"},
  bug:     {bg:"rgba(255,45,91,.1)", col:"#FF2D5B",b:"rgba(255,45,91,.3)"},
  feature: {bg:"rgba(0,255,255,.1)", col:"#00FFFF",b:"rgba(0,255,255,.25)"},
  docs:    {bg:"rgba(255,190,0,.1)", col:"#FFBE00",b:"rgba(255,190,0,.25)"},
  devops:  {bg:"rgba(57,255,20,.1)", col:"#39FF14",b:"rgba(57,255,20,.25)"},
  testing: {bg:"rgba(255,45,91,.08)",col:"#FF6B9D",b:"rgba(255,107,157,.25)"},
  mobile:  {bg:"rgba(0,245,224,.07)",col:"#67E8F9",b:"rgba(103,232,249,.2)"},
  api:     {bg:"rgba(255,190,0,.1)", col:"#FDB27A",b:"rgba(253,178,122,.25)"},
  security:{bg:"rgba(255,45,91,.08)",col:"#FCA5A5",b:"rgba(252,165,165,.25)"},
  ai:      {bg:"rgba(157,111,255,.1)",col:"#C084FC",b:"rgba(192,132,252,.25)"},
  eco:     {bg:"rgba(34,197,94,.1)", col:"#22C55E",b:"rgba(34,197,94,.25)"},
  cloud:   {bg:"rgba(0,245,224,.07)",col:"#38BDF8",b:"rgba(56,189,248,.2)"},
};

export const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const MFULL=["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DNAMES=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export const uid = () => Math.random().toString(36).slice(2,10);
export const ago = d => Date.now() - d * 86400000;

export function fmtDT(iso){
  if(!iso)return null;
  const d=new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}`;
}

export function dueBadge(iso, status){
  if(!iso||status==="done") return null;
  const diff = Math.floor((new Date(iso)-new Date())/86400000);
  if(diff<0)  return {txt:`${Math.abs(diff)}D OVERDUE`, c:"#FF2D5B", urgent:true};
  if(diff===0) return {txt:"DUE TODAY",                 c:"#FFBE00", urgent:true};
  if(diff===1) return {txt:"TOMORROW",                  c:"#FFBE00", urgent:false};
  if(diff<=3)  return {txt:`${diff}D LEFT`,              c:"#FFBE00", urgent:false};
  return {txt: new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric"}), c:"#3D7068", urgent:false};
}

export function hexToRgb(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// Seed tasks for a new user (stored to Firestore on first login)
export function makeSeedTasks(userId){
  return [
    {title:"Zero-day vulnerability patch",   desc:"Critical CVE-2026-1337 — RCE in auth middleware. Hotfix + penetration retest.",  status:"done",      priority:"urgent",labels:["security","backend"],  due:new Date(ago(2)).toISOString(),sp:13,userId,created:ago(8),comments:[],attachments:0},
    {title:"Neural inference engine v2",     desc:"Deploy updated LLM routing layer with 40% latency reduction via quantization.", status:"done",      priority:"high",  labels:["ai","backend"],       due:new Date(ago(1)).toISOString(),sp:8, userId,created:ago(7),comments:[],attachments:0},
    {title:"End-to-end encryption layer",    desc:"AES-256-GCM + ECDH key exchange for all task payloads in transit and at rest.", status:"inprogress",priority:"urgent",labels:["security","backend"],  due:new Date(Date.now()+86400e3*3).toISOString(),sp:13,userId,created:ago(4),comments:[],attachments:1},
    {title:"AI task auto-classification",    desc:"GPT-4o fine-tune model to auto-tag, prioritize, and estimate story points.",    status:"inprogress",priority:"high",  labels:["ai","feature"],       due:new Date(Date.now()+86400e3*4).toISOString(),sp:8, userId,created:ago(3),comments:[],attachments:0},
    {title:"Real-time WebSocket mesh",       desc:"Multi-region Socket.io cluster with CRDT sync. <50ms p99 latency target.",     status:"inprogress",priority:"high",  labels:["backend","feature"],  due:new Date(Date.now()+86400e3*5).toISOString(),sp:13,userId,created:ago(3),comments:[],attachments:0},
    {title:"Cyber threat dashboard",         desc:"Live SIEM feed integration, anomaly detection alerts, IP reputation scoring.",  status:"review",    priority:"high",  labels:["security","frontend"],due:new Date(Date.now()+86400e3*7).toISOString(),sp:8, userId,created:ago(2),comments:[],attachments:2},
    {title:"PWA offline-first shell",        desc:"Workbox v7 service worker, IndexedDB sync queue, background delta fetch.",     status:"review",    priority:"medium",labels:["frontend","mobile"],  due:new Date(Date.now()+86400e3*8).toISOString(),sp:5, userId,created:ago(2),comments:[],attachments:0},
    {title:"Multi-tenant RBAC system",       desc:"Org/team/user hierarchy, permission matrix, just-in-time access provisioning.",status:"todo",      priority:"high",  labels:["backend","security"],  due:new Date(Date.now()+86400e3*12).toISOString(),sp:8,userId,created:ago(1),comments:[],attachments:0},
    {title:"Playwright E2E test matrix",     desc:"800+ test cases: auth, CRUD, real-time, offline, mobile, a11y, security.",     status:"todo",      priority:"medium",labels:["testing","devops"],    due:new Date(Date.now()+86400e3*15).toISOString(),sp:5,userId,created:ago(0),comments:[],attachments:0},
    {title:"Stripe + crypto billing",        desc:"USD + USDC payments. Subscription tiers, usage metering, dunning automation.", status:"backlog",   priority:"high",  labels:["backend","feature"],   due:new Date(Date.now()+86400e3*22).toISOString(),sp:8,userId,created:ago(0),comments:[],attachments:0},
    {title:"Eco-compute green hosting",      desc:"Carbon-neutral CDN routing + serverless functions on renewable energy nodes.", status:"backlog",   priority:"medium",labels:["devops","eco"],        due:new Date(Date.now()+86400e3*25).toISOString(),sp:5,userId,created:ago(0),comments:[],attachments:0},
    {title:"Edge deployment — 40 regions",  desc:"Cloudflare Workers + Durable Objects. Cold start <5ms globally.",              status:"backlog",   priority:"medium",labels:["devops","cloud"],       due:new Date(Date.now()+86400e3*28).toISOString(),sp:13,userId,created:ago(0),comments:[],attachments:0},
  ];
}

import { useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════
   DATA SCHEMA — מוכן ל-Supabase
   כל ישות: id, createdAt, updatedAt, title, tags, status, meta
   ═══════════════════════════════════════════════════════════════════ */
const KEY = "ai-learn-v6";
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();
const short = (d) => { try { return new Date(d).toLocaleDateString("he-IL"); } catch { return ""; } };

/* ─── Types ─── */
const CARD_TYPES = {
  learning: { label: "למידה", tone: "#7ba4d9" },
  demo: { label: "הדגמה", tone: "#a78bdb" },
  example: { label: "דוגמה", tone: "#6dbf8b" },
  tip: { label: "טיפ", tone: "#d4a55b" },
  workshop: { label: "סדנה", tone: "#d47b7b" },
  homework: { label: "תרגיל בית", tone: "#d47baf" },
  link: { label: "קישור", tone: "#5bbfd4" },
  note: { label: "הערה", tone: "#8a8d95" },
  image: { label: "תמונה", tone: "#7b7bd4" },
};
const STATUSES = {
  planned: { label: "מתוכנן", tone: "#5a5d65" },
  active: { label: "בתהליך", tone: "#5b8fd4" },
  done: { label: "הושלם", tone: "#5dba7d" },
  needs_more: { label: "דורש המשך", tone: "#d4a55b" },
  skipped: { label: "דולג", tone: "#d47b7b" },
};
const SCYCLE = ["planned", "active", "done", "needs_more", "skipped"];
const PRIORITIES = { high: { label: "גבוהה", tone: "#d47b7b" }, medium: { label: "בינונית", tone: "#d4a55b" }, low: { label: "נמוכה", tone: "#5a5d65" } };
const TOOL_CATS = ["AI", "קוד", "אוטומציה", "דאטה", "עיצוב", "תשתית", "אחר"];
const PAGES = { dashboard: "דשבורד", sessions: "מפגשים", tools: "כלים", tasks: "משימות" };

/* ─── Factories ─── */
const mkCard = (type = "note") => ({ id: uid(), type, title: "", content: "", url: "", status: "planned", priority: "high", minutes: 5, note: "", tags: [] });
const mkBlock = (t) => ({ id: uid(), title: t || "חלק חדש", cards: [] });
const mkSession = (n) => ({
  id: uid(), createdAt: now(), updatedAt: now(), number: n,
  title: `מפגש ${n}`, date: "", purpose: "", summary: "",
  toolIds: [], tags: [], status: "planned", priority: "high",
  complexity: "medium", estimatedMinutes: 120,
  insights: "", problems: "", solutions: "", outcomes: "",
  blocks: [mkBlock("פתיחה"), mkBlock("תוכן מרכזי"), mkBlock("תרגול"), mkBlock("סיכום")],
});
const mkTool = () => ({
  id: uid(), createdAt: now(), updatedAt: now(),
  name: "", category: "AI", purpose: "", whenToUse: "",
  input: "", output: "", connections: "", examples: "",
  limitations: "", url: "", notes: "", tags: [],
  sessionIds: [],
});
const mkTask = () => ({
  id: uid(), createdAt: now(), updatedAt: now(),
  title: "", description: "", status: "planned",
  priority: "medium", sessionId: "", toolId: "",
  dueDate: "", tags: [], notes: "",
});

/* ─── Seed ─── */
const SEED = {
  sessions: [
    { ...mkSession(1), title: "AI ככלי ו-AI כשותפה", purpose: "רמות התערבות, מנגנון אימון, Skills ועוזרים.",
      status: "planned", toolIds: [], tags: ["AI", "Claude", "Skills"],
      blocks: [
        { ...mkBlock("פתיחה — פסיביות לאקטיביות"), cards: [
          { ...mkCard("learning"), title: "AI פסיבי מול אקטיבי", content: "4 רמות: מענה, הצעה, שדרוג, ייעול", minutes: 10 },
          { ...mkCard("example"), title: "שיחה עם Claude", content: "AI שמציע שינויים בלי שביקשנו", minutes: 10, url: "https://claude.ai" },
        ]},
        { ...mkBlock("מנגנון אימון"), cards: [
          { ...mkCard("learning"), title: "Settings, Projects, Memory", content: "שלוש שכבות הגדרה", minutes: 10 },
          { ...mkCard("demo"), title: "בניית Project", content: "הנחיות, קבצים, מומחיות", minutes: 15, url: "https://claude.ai" },
          { ...mkCard("tip"), title: "זיכרון מצטבר", content: "כל שיחה מחזקת את המומחיות", minutes: 5 },
        ]},
        { ...mkBlock("Skills ועוזרים"), cards: [
          { ...mkCard("learning"), title: "מה זה Skill", content: "יכולת מותאמת אישית", minutes: 10 },
          { ...mkCard("workshop"), title: "בנו מומחה", content: "20 דק׳ עבודה + 5 שיתוף", minutes: 20 },
        ]},
        { ...mkBlock("סיכום"), cards: [
          { ...mkCard("note"), title: "סיכום", content: "AI שותפה, אימון מצטבר, Skills", minutes: 5 },
          { ...mkCard("homework"), title: "בנו זיכרון", content: "Project + 5 הנחיות + שיחה 10 דק׳", minutes: 0 },
        ]},
      ],
    },
    { ...mkSession(2), title: "Chat, Cowork, Code", purpose: "שלושת המצבים — מתי מה, תרגול.",
      status: "planned", tags: ["Claude", "Workflow"],
      blocks: [
        { ...mkBlock("מתי מה"), cards: [{ ...mkCard("learning"), title: "שלושת המצבים", content: "Chat → Cowork → Code", minutes: 10 }]},
        { ...mkBlock("Chat"), cards: [{ ...mkCard("demo"), title: "אפיון ב-Chat", content: "מתכנון לאפיון בשיחה אחת", minutes: 15, url: "https://claude.ai" }]},
        { ...mkBlock("Cowork"), cards: [{ ...mkCard("workshop"), title: "רעיון למסמך", content: "15 דק׳ + 5 שיתוף", minutes: 20 }]},
        { ...mkBlock("Code"), cards: [
          { ...mkCard("demo"), title: "כלי ב-Code", content: "מאפיון לאפליקציה", minutes: 15 },
          { ...mkCard("homework"), title: "בנו משהו", content: "מחשבון שטחים, בודק תקנות...", minutes: 0 },
        ]},
      ],
    },
  ],
  tools: [
    { ...mkTool(), name: "Claude", category: "AI", purpose: "חשיבה, אפיון, כתיבה, תכנון", whenToUse: "כל שלב ראשוני", url: "https://claude.ai", tags: ["AI", "שיחה"] },
    { ...mkTool(), name: "Claude Code", category: "קוד", purpose: "בנייה, תיקון, דיבוג, פריסה", whenToUse: "כשצריך לבנות", url: "https://claude.ai", tags: ["קוד", "בנייה"] },
    { ...mkTool(), name: "Lovable", category: "קוד", purpose: "בניית אפליקציות מהירה", url: "https://lovable.dev", tags: ["אפליקציות"] },
    { ...mkTool(), name: "Base44", category: "קוד", purpose: "בניית מערכות ואפליקציות", url: "https://base44.com", tags: ["אפליקציות"] },
    { ...mkTool(), name: "n8n", category: "אוטומציה", purpose: "אוטומציה, טריגרים, חיבורים", url: "https://n8n.io", tags: ["אוטומציה"] },
    { ...mkTool(), name: "Supabase", category: "דאטה", purpose: "בסיס נתונים, Auth, Storage", url: "https://supabase.com", tags: ["דאטה"] },
    { ...mkTool(), name: "GitHub", category: "תשתית", purpose: "גרסאות, שיתוף, Pull Requests", url: "https://github.com", tags: ["קוד", "תשתית"] },
    { ...mkTool(), name: "Midjourney", category: "עיצוב", purpose: "יצירת תמונות", url: "https://midjourney.com", tags: ["עיצוב", "יצירה"] },
  ],
  tasks: [
    { ...mkTask(), title: "להכין Project אדריכלי לדוגמה", status: "planned", priority: "high", tags: ["הכנה"] },
    { ...mkTask(), title: "לאסוף דוגמאות Skills", status: "planned", priority: "medium", tags: ["הכנה", "Skills"] },
  ],
  tags: ["AI", "Claude", "Skills", "Workflow", "קוד", "בנייה", "אוטומציה", "עיצוב", "הכנה", "דאטה"],
};

/* ═══════════════════════════════════════════════════════════════════
   DESIGN — Forged Metal (inherited from V5 + light refinements)
   ═══════════════════════════════════════════════════════════════════ */
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg0:#1a1c22;--bg:#22252d;--bg2:#282b33;
  --sf:#2f323a;--sf2:#363940;--sf3:#3d4048;--sf4:#454850;
  --t1:#e8e9ed;--t2:#b0b3ba;--t3:#7a7d85;--t4:#55585f;
  --blue:#5b8fd4;--blue-g:rgba(91,143,212,.25);--blue-s:rgba(91,143,212,.08);
  --gold:#c4a55a;--gold-g:rgba(196,165,90,.2);--gold-s:rgba(196,165,90,.06);
  --green:#5dba7d;--green-g:rgba(93,186,125,.2);
  --amber:#d4a55b;--red:#d47b7b;
  --edge:rgba(255,255,255,.05);--edge2:rgba(255,255,255,.08);--edge3:rgba(255,255,255,.12);
  --inset:inset 0 2px 4px rgba(0,0,0,.35);
  --sh1:0 1px 3px rgba(0,0,0,.4);--sh2:0 4px 16px rgba(0,0,0,.45);--sh3:0 12px 32px rgba(0,0,0,.5);
  --font:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --r1:4px;--r2:8px;--r3:12px;--r4:16px;
  --sp1:4px;--sp2:8px;--sp3:16px;--sp4:24px;--sp5:32px;--sp6:48px;
  --bw1:0.5px;--bw2:1px;--bw3:1.5px;
  --icon-sm:14px;--icon-md:18px;--icon-lg:22px;
}
body{font-family:var(--font);background:var(--bg0);color:var(--t1);direction:rtl;line-height:1.5}
.frame{margin:6px;height:calc(100vh - 12px);border-radius:14px;overflow:hidden;border:1.5px solid var(--edge2);
  background:linear-gradient(145deg,#2a2d35,#22252d,#1e2128);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 0 0 1px rgba(0,0,0,.5),0 8px 32px rgba(0,0,0,.6)}
.shell{display:flex;height:100%;overflow:hidden}

/* Sidebar */
.sb{width:220px;min-width:220px;background:linear-gradient(180deg,var(--bg2),var(--bg));display:flex;flex-direction:column;overflow-y:auto;scrollbar-width:thin;border-left:1px solid var(--edge)}
.sb-head{padding:18px 14px 14px;border-bottom:1px solid var(--edge)}
.sb-head h1{font-size:13px;font-weight:600;color:var(--t1)}
.sb-head p{font-size:8px;color:var(--t4);margin-top:2px}
.sb-lbl{padding:14px 14px 4px;font-size:7px;text-transform:uppercase;letter-spacing:2.5px;color:var(--t4);font-weight:800}
.sb-btn{display:block;width:100%;padding:8px 14px;border:none;background:none;color:var(--t2);font-size:11px;cursor:pointer;text-align:right;direction:rtl;transition:all .15s;border-right:2px solid transparent}
.sb-btn:hover{background:var(--gold-s);color:var(--gold);border-right-color:var(--gold)}
.sb-btn:active{background:var(--bg);box-shadow:var(--inset)}
.sb-btn.on{background:var(--blue-s);color:var(--blue);border-right-color:var(--blue)}
.sb-sub{display:block;width:100%;padding:3px 14px 3px 26px;border:none;background:none;color:var(--t4);font-size:9px;cursor:pointer;text-align:right;transition:color .1s}
.sb-sub:hover{color:var(--gold)}.sb-sub.on{color:var(--blue)}

/* Page nav pills */
.sb-nav{padding:8px;border-bottom:1px solid var(--edge);display:flex;flex-wrap:wrap;gap:4px}
.pnav{flex:1;min-width:60px;padding:6px 4px;border:1px solid var(--edge2);border-radius:16px;background:linear-gradient(180deg,var(--sf2),var(--sf));color:var(--t3);font-size:9px;cursor:pointer;text-align:center;transition:all .15s;box-shadow:var(--sh1)}
.pnav:hover{color:var(--t1);border-color:rgba(196,165,90,.15);box-shadow:var(--sh1),0 0 6px var(--gold-g)}
.pnav:active{transform:translateY(1px);box-shadow:var(--inset);transition-duration:.05s}
.pnav.on{background:linear-gradient(180deg,#4a7ec8,#3a6eb8);color:#fff;border-color:rgba(91,143,212,.4);box-shadow:0 0 14px var(--blue-g)}

/* Main */
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden}
.bar{display:flex;align-items:center;justify-content:space-between;padding:7px 18px;background:linear-gradient(180deg,var(--bg2),var(--bg));border-bottom:1px solid var(--edge);min-height:40px;gap:8px}
.crumb{font-size:10px;color:var(--t3)}.crumb b{color:var(--t1)}.crumb .vw{color:var(--blue)}
.acts{display:flex;gap:5px;align-items:center}
.meta{font-size:8px;color:var(--t4)}
.cnt{flex:1;overflow-y:auto;padding:14px 18px 50px}

/* Pills */
.pill{padding:5px 14px;border:1px solid var(--edge2);border-radius:18px;background:linear-gradient(180deg,var(--sf3),var(--sf));font-size:10px;cursor:pointer;color:var(--t2);transition:all .15s;box-shadow:var(--sh1);white-space:nowrap;font-family:var(--font)}
.pill:hover{color:var(--t1);border-color:rgba(196,165,90,.2);background:linear-gradient(180deg,var(--sf4),var(--sf2));box-shadow:var(--sh1),0 0 8px var(--gold-g)}
.pill:active:not(:disabled){transform:translateY(1px);box-shadow:var(--inset);transition-duration:.05s}
.pill:disabled,.pill[disabled]{opacity:.4;cursor:not-allowed;box-shadow:none;pointer-events:none;border-color:var(--edge)}
.pill.loading{position:relative;color:transparent;pointer-events:none}
.pill.loading::after{content:"";position:absolute;inset:0;margin:auto;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}
.pill.bl{background:linear-gradient(180deg,#6a9ad8,#4a7ec8);color:#fff;border-color:rgba(91,143,212,.4);box-shadow:0 0 12px var(--blue-g)}
.pill.gn{background:linear-gradient(180deg,#68c488,#4daa6d);color:#fff;border-color:rgba(93,186,125,.3)}
.pill.gld{color:var(--gold);border-color:rgba(196,165,90,.2)}
.pill.rd{color:var(--red);border-color:rgba(212,123,123,.2)}
.pill.xs{padding:3px 8px;font-size:8px;border-radius:12px}
.pill.sm{padding:4px 10px;font-size:9px}

/* Inputs */
.inp{padding:6px 10px;border:1px solid var(--edge);border-radius:10px;font-size:10px;direction:rtl;background:var(--bg);color:var(--t2);font-family:var(--font);box-shadow:var(--inset);transition:all .15s;width:100%}
.inp:focus{outline:none;border-color:rgba(91,143,212,.3);color:var(--t1);box-shadow:var(--inset),0 0 0 2px var(--blue-g)}
.inp.ta{resize:vertical;min-height:34px;border-radius:8px;line-height:1.6}
.inp.warm{background:rgba(30,28,24,.6);border-color:rgba(196,165,90,.1)}
.inp.ltr{direction:ltr}.inp.num{width:44px;text-align:center;padding:4px}
.inp.sm{padding:4px 8px;font-size:9px;border-radius:8px}

/* Hint */
.hint{padding:10px 14px;background:linear-gradient(135deg,rgba(91,143,212,.05),rgba(91,143,212,.02));border:1px solid rgba(91,143,212,.1);border-radius:10px;margin-bottom:14px;font-size:9px;color:var(--t2);line-height:1.6;box-shadow:var(--sh1);position:relative;overflow:hidden}
.hint::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(91,143,212,.12),transparent)}
.hint b{color:var(--t1)}

/* Panel */
.panel{background:linear-gradient(180deg,var(--sf2),var(--sf));border:1px solid var(--edge2);border-radius:12px;margin-bottom:12px;box-shadow:var(--sh2);overflow:hidden;position:relative}
.panel::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 10%,rgba(255,255,255,.07) 50%,transparent 90%)}
.panel-h{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--edge)}
.panel-h .title{flex:1;border:none;background:none;font-size:13px;font-weight:600;color:var(--t1);direction:rtl;text-align:right;font-family:var(--font)}
.panel-h .title:focus{outline:none;background:var(--sf3);padding:2px 6px;border-radius:6px}
.panel-body{padding:6px}
.panel-body.hide{display:none}

/* Card */
.cd{background:linear-gradient(180deg,var(--sf3),var(--sf));border:1px solid var(--edge2);border-radius:8px;margin:4px;transition:all .15s;position:relative;overflow:hidden;box-shadow:var(--sh1),inset 0 -1px 3px rgba(0,0,0,.1)}
.cd::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 20%,rgba(255,255,255,.05) 50%,transparent 80%)}
.cd::after{content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.03),transparent);transition:left .5s ease;pointer-events:none}
.cd:hover{border-color:rgba(196,165,90,.12);box-shadow:var(--sh2),0 0 10px var(--gold-g)}
.cd:hover::after{left:100%}
.cd.drag-over{border-color:var(--blue);box-shadow:0 0 16px var(--blue-g)}
.ch{display:flex;align-items:center;gap:5px;padding:7px 10px}
.c-grip{cursor:grab;color:var(--t4);font-size:9px;user-select:none;letter-spacing:-1px}.c-grip:hover{color:var(--gold)}.c-grip:active{cursor:grabbing}
.c-tag{font-size:7px;font-weight:600;padding:2px 8px;border-radius:16px;color:#fff;white-space:nowrap;flex-shrink:0;box-shadow:0 1px 2px rgba(0,0,0,.3)}
.c-ti{flex:1;border:none;background:none;font-size:10px;font-weight:500;color:var(--t1);direction:rtl;text-align:right;font-family:var(--font)}
.c-ti:focus{outline:none;background:var(--bg2);padding:1px 5px;border-radius:4px}
.c-ti::placeholder{color:var(--t4)}
.c-mn{font-size:7px;color:var(--t4);flex-shrink:0}
.toggle{width:34px;height:18px;border-radius:18px;cursor:pointer;flex-shrink:0;position:relative;transition:all .2s;border:1.5px solid;box-shadow:var(--inset)}
.toggle .thumb{position:absolute;top:2px;width:12px;height:12px;border-radius:50%;transition:all .2s;background:linear-gradient(180deg,#ddd,#aaa);box-shadow:0 1px 2px rgba(0,0,0,.4)}
.toggle.planned{background:var(--bg);border-color:var(--t4)}.toggle.planned .thumb{right:2px}
.toggle.done,.toggle.said{background:linear-gradient(180deg,#4daa6d,#3d9a5d);border-color:rgba(93,186,125,.4);box-shadow:var(--inset),0 0 8px var(--green-g)}.toggle.done .thumb,.toggle.said .thumb{right:calc(100% - 14px)}
.toggle.active{background:linear-gradient(180deg,#4a7ec8,#3a6eb8);border-color:rgba(91,143,212,.4);box-shadow:var(--inset),0 0 8px var(--blue-g)}.toggle.active .thumb{right:8px}
.toggle.skipped,.toggle.needs_more{background:linear-gradient(180deg,#c49550,#a48040);border-color:rgba(196,165,90,.4);box-shadow:var(--inset),0 0 8px var(--gold-g)}.toggle.skipped .thumb,.toggle.needs_more .thumb{right:8px}
.c-tgl{border:none;background:none;font-size:8px;color:var(--t4);cursor:pointer;padding:2px 5px;border-radius:4px;transition:all .1s}
.c-tgl:hover{color:var(--gold);background:var(--gold-s)}
.c-tgl:active{transform:scale(.92)}
.c-bd{padding:3px 10px 10px;display:none}.c-bd.open{display:block}
.c-f{margin-bottom:5px}
.c-f label{display:block;font-size:7px;font-weight:700;color:var(--t4);margin-bottom:2px;letter-spacing:.4px;text-transform:uppercase}
.c-row{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:5px}
.c-sel{padding:2px 6px;border:1px solid var(--edge2);border-radius:8px;font-size:8px;background:var(--sf);color:var(--t2);direction:rtl;box-shadow:var(--sh1)}
.add-bar{display:flex;flex-wrap:wrap;gap:3px;padding:6px;border-top:1px solid var(--edge)}
.ab{padding:3px 9px;border:1px dashed var(--t4);border-radius:16px;font-size:7px;cursor:pointer;background:none;color:var(--t4);transition:all .15s}
.ab:hover{border-color:var(--blue);border-style:solid;color:var(--blue);background:var(--blue-s);box-shadow:0 0 10px var(--blue-g)}
.ab:active{transform:translateY(1px);box-shadow:var(--inset)}

/* Seg progress */
.seg-bar{height:3px;background:var(--bg);display:flex;gap:1px;padding:0 1px}
.seg{height:100%;flex:1;border-radius:1px;transition:background .3s}

/* Dashboard grid */
.dash{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dash-full{grid-column:1/-1}
.dcard{background:linear-gradient(180deg,var(--sf2),var(--sf));border:1px solid var(--edge2);border-radius:12px;padding:16px;box-shadow:var(--sh2);position:relative;overflow:hidden}
.dcard::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 10%,rgba(255,255,255,.06) 50%,transparent 90%)}
.dcard::after,.tool-card::after{content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.02),transparent);transition:left .6s ease;pointer-events:none}
.dcard:hover::after,.tool-card:hover::after{left:100%}
.dcard h3{font-size:12px;font-weight:600;color:var(--t1);margin-bottom:3px}
.dcard p{font-size:9px;color:var(--t3);line-height:1.4}
.d-stats{display:flex;gap:16px;margin-top:10px}
.d-stat{text-align:center}.d-stat .n{font-size:26px;font-weight:700}.d-stat .l{font-size:7px;color:var(--t4);margin-top:2px;text-transform:uppercase;letter-spacing:.8px}
.d-prog{height:6px;background:var(--bg);border-radius:3px;margin-top:8px;overflow:hidden;display:flex;gap:1px;padding:1px;box-shadow:var(--inset)}
.d-prog div{height:100%;border-radius:2px;animation:pulse 2.5s ease-in-out infinite}

/* List items — gold hover */
.li{display:flex;align-items:center;gap:8px;padding:7px 8px;border-bottom:1px solid var(--edge);font-size:10px;color:var(--t2);cursor:pointer;transition:all .15s;border-radius:6px;margin-bottom:1px}
.li:last-child{border-bottom:none}
.li:hover{background:var(--gold-s);color:var(--gold)}
.li:active{box-shadow:var(--inset)}
.li .bp{width:50px;height:4px;background:var(--bg);border-radius:2px;overflow:hidden;flex-shrink:0;box-shadow:var(--inset)}
.li .bp div{height:100%;border-radius:2px}

/* Tags */
.tags{display:flex;flex-wrap:wrap;gap:3px;margin-top:4px}
.tag{padding:2px 7px;border-radius:10px;font-size:7px;background:var(--sf3);color:var(--t3);border:1px solid var(--edge2);cursor:default}
.tag.on{background:var(--blue-s);color:var(--blue);border-color:rgba(91,143,212,.2)}

/* Teach */
.teach{max-width:680px;margin:0 auto}
.t-prog{height:4px;background:var(--bg);border-radius:2px;margin-bottom:14px;overflow:hidden;box-shadow:var(--inset)}
.t-prog div{height:100%;background:linear-gradient(90deg,var(--blue),#7aace0);box-shadow:0 0 10px var(--blue-g);transition:width .3s;animation:pulse 2s ease-in-out infinite}
.t-card{background:linear-gradient(180deg,var(--sf3),var(--sf));border:1px solid var(--edge2);border-radius:14px;padding:28px;box-shadow:var(--sh3);position:relative;overflow:hidden}
.t-card::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,rgba(255,255,255,.08) 50%,transparent 95%)}
.t-card h2{font-size:20px;font-weight:600;margin-bottom:6px;line-height:1.4}
.t-card .t-body{font-size:13px;line-height:1.8;color:var(--t2);white-space:pre-wrap}
.t-note{margin-top:12px;padding:10px 14px;background:linear-gradient(135deg,rgba(196,165,90,.05),rgba(196,165,90,.02));border:1px solid rgba(196,165,90,.1);border-radius:8px;font-size:10px;color:var(--gold);line-height:1.5}
.t-url{display:inline-block;margin-top:8px;font-size:10px;color:var(--blue);text-decoration:none;padding:3px 12px;border:1px solid rgba(91,143,212,.15);border-radius:16px;background:var(--blue-s)}
.t-url:hover{box-shadow:0 0 10px var(--blue-g)}
.t-nav{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid var(--edge)}

/* Tool card */
.tool-card{background:linear-gradient(180deg,var(--sf2),var(--sf));border:1px solid var(--edge2);border-radius:10px;padding:14px;margin-bottom:8px;box-shadow:var(--sh1);transition:all .15s;cursor:pointer;position:relative;overflow:hidden}
.tool-card::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent)}
.tool-card:hover{border-color:rgba(196,165,90,.12);box-shadow:var(--sh2),0 0 10px var(--gold-g)}
.tool-card:active{transform:translateY(1px);box-shadow:var(--inset)}
.tool-card h4{font-size:12px;font-weight:600;color:var(--t1);margin-bottom:2px}
.tool-card p{font-size:9px;color:var(--t3);line-height:1.4}
.tool-ed{padding:12px;background:var(--bg2);border-radius:8px;margin-top:6px}
.tool-ed .c-f{margin-bottom:6px}

/* Task row */
.task-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:linear-gradient(180deg,var(--sf2),var(--sf));border:1px solid var(--edge2);border-radius:8px;margin-bottom:5px;box-shadow:var(--sh1);transition:all .15s}
.task-row:hover{border-color:rgba(196,165,90,.12);box-shadow:0 0 8px var(--gold-g)}
.task-row:active{box-shadow:var(--inset)}
.task-row .task-title{flex:1;border:none;background:none;font-size:10px;color:var(--t1);direction:rtl;text-align:right;font-family:var(--font)}
.task-row .task-title:focus{outline:none;background:var(--sf3);padding:1px 5px;border-radius:4px}

/* Links bar */
.lnk{background:linear-gradient(180deg,var(--bg2),var(--bg));border-top:1px solid var(--edge)}
.lnk-h{display:flex;align-items:center;justify-content:space-between;padding:6px 18px;cursor:pointer}
.lnk-h h3{font-size:9px;color:var(--t3)}
.lnk-b{padding:0 18px 8px;display:flex;flex-wrap:wrap;gap:4px}
.chip{display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border:1px solid var(--edge2);border-radius:16px;font-size:8px;color:var(--blue);background:linear-gradient(180deg,var(--sf2),var(--sf));transition:all .15s;box-shadow:var(--sh1)}
.chip:hover{border-color:rgba(196,165,90,.15);box-shadow:0 0 10px var(--gold-g)}.chip:active{transform:translateY(1px);box-shadow:var(--inset)}
.chip a{color:inherit;text-decoration:none}
.chip .x{color:var(--red);cursor:pointer;background:none;border:none;font-size:9px;opacity:.4}.chip .x:hover{opacity:1}

/* Modal */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(6px);animation:fadeIn .2s ease-out}
.mdl{background:linear-gradient(180deg,var(--sf3),var(--sf));border:var(--bw3) solid var(--edge3);border-radius:var(--r4);padding:20px;width:90%;max-width:400px;direction:rtl;box-shadow:var(--sh3),0 0 60px rgba(0,0,0,.4);max-height:80vh;overflow-y:auto;animation:fadeIn .25s ease-out;position:relative;overflow:hidden}
.mdl::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,rgba(255,255,255,.08) 50%,transparent 95%)}
.mdl h3{font-size:13px;font-weight:600;margin-bottom:8px;color:var(--t1)}
.mdl .inp{margin-bottom:5px}
.mr{display:flex;gap:6px;margin-top:8px}

.empty{text-align:center;padding:24px;color:var(--t4);font-size:10px}
.toast{position:fixed;bottom:12px;left:12px;padding:5px 14px;background:linear-gradient(180deg,#68c488,#4daa6d);color:#fff;font-size:8px;border-radius:var(--r4);transform:translateY(20px);opacity:0;transition:all .25s ease-out;z-index:50;font-weight:600;box-shadow:0 0 14px var(--green-g);display:flex;align-items:center;gap:var(--sp2)}
.toast.on{opacity:1;transform:translateY(0)}
.search-global{width:100%;margin-bottom:12px}
/* Focus-visible rings */
:focus-visible{outline:none}
.pill:focus-visible,.pnav:focus-visible,.sb-btn:focus-visible,.ab:focus-visible,.c-tgl:focus-visible,.chip:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg0),0 0 0 4px var(--blue)!important}
.inp:focus-visible{outline:none;box-shadow:var(--inset),0 0 0 2px var(--blue-g)!important;border-color:rgba(91,143,212,.4)}
.c-sel:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg0),0 0 0 4px var(--blue)}
.toggle:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg0),0 0 0 4px var(--blue)!important}

/* Animations */
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}

@media(max-width:768px){.sb{width:52px;min-width:52px}.sb .sb-head,.sb-lbl,.sb-btn,.sb-sub{display:none}.sb-nav{flex-direction:column}.dash{grid-template-columns:1fr}.frame{margin:0;border-radius:0;height:100vh}}
`;

/* ═══════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [data, setData] = useState(() => { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : SEED; } catch { return SEED; } });
  const [page, setPage] = useState("dashboard");
  const [si, setSi] = useState(0);
  const [view, setView] = useState("prep"); // prep|teach|summary
  const [openC, setOpenC] = useState({});
  const [colB, setColB] = useState({});
  const [toast, setToast] = useState(false);
  const [ti, setTi] = useState(0);
  const [drag, setDrag] = useState(null);
  const [focus, setFocus] = useState(null);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [editTool, setEditTool] = useState(null);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => { const t = setTimeout(() => { localStorage.setItem(KEY, JSON.stringify(data)); setToast(true); setTimeout(() => setToast(false), 800); }, 500); return () => clearTimeout(t); }, [data]);
  useEffect(() => { if (page !== "sessions" || view !== "teach") return;
    const h = (e) => {
      const ac = allCards;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setTi(p => Math.min(p + 1, ac.length - 1)); }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setTi(p => Math.max(p - 1, 0)); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const c = ac[ti]; if (c) { up(d => { d.sessions[si].blocks[c.bi].cards[c.ci].status = "done"; }); setTi(p => Math.min(p + 1, ac.length - 1)); } }
    }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });

  const up = (fn) => setData(p => { const d = JSON.parse(JSON.stringify(p)); fn(d); return d; });
  const sess = data.sessions[si];
  const allCards = sess?.blocks.flatMap((b, bi) => b.cards.map((c, ci) => ({ ...c, bi, ci, bTitle: b.title }))) || [];
  const byStat = (s) => allCards.filter(c => c.status === s);
  const pct = (s) => allCards.length ? Math.round(byStat(s).length / allCards.length * 100) : 0;
  const bPct = (bl) => bl.cards.length ? Math.round(bl.cards.filter(c => c.status === "done").length / bl.cards.length * 100) : 0;

  // Global search
  const searchResults = useMemo(() => {
    if (!q || q.length < 2) return null;
    const results = [];
    data.sessions.forEach((s, i) => { if ((s.title + s.purpose + s.insights + s.problems).includes(q)) results.push({ type: "session", label: s.title, idx: i }); });
    data.tools.forEach((t, i) => { if ((t.name + t.purpose + t.notes).includes(q)) results.push({ type: "tool", label: t.name, idx: i }); });
    data.tasks.forEach((t, i) => { if ((t.title + t.description).includes(q)) results.push({ type: "task", label: t.title, idx: i }); });
    data.sessions.forEach((s, si2) => s.blocks.forEach(b => b.cards.forEach(c => { if ((c.title + c.content).includes(q) && !results.find(r => r.type === "session" && r.idx === si2)) results.push({ type: "session", label: `${s.title}: ${c.title}`, idx: si2 }); })));
    return results;
  }, [q, data]);

  const cloneSession = (idx) => { up(d => { const clone = JSON.parse(JSON.stringify(d.sessions[idx])); clone.id = uid(); clone.title += " (עותק)"; clone.number = d.sessions.length + 1; clone.status = "planned"; clone.createdAt = now(); clone.blocks.forEach(b => { b.id = uid(); b.cards.forEach(c => { c.id = uid(); c.status = "planned"; }); }); d.sessions.push(clone); }); };

  return (<>
    <style>{CSS}</style>
    <div className="frame"><div className="shell">

      {/* SIDEBAR */}
      <div className="sb">
        <div className="sb-head"><h1>מרכז למידה</h1><p>AI, אפליקציות, אוטומציות</p></div>
        <div className="sb-nav">{Object.entries(PAGES).map(([k, v]) => (<button key={k} className={`pnav ${page === k ? "on" : ""}`} onClick={() => { setPage(k); setEditTool(null); setEditTask(null); }}>{v}</button>))}</div>

        {page === "sessions" && (<>
          <div className="sb-lbl">מפגשים</div>
          {data.sessions.map((s, i) => (<div key={s.id}>
            <button className={`sb-btn ${si === i ? "on" : ""}`} onClick={() => { setSi(i); setFocus(null); setTi(0); setView("prep"); }}>{s.title}</button>
            {si === i && s.blocks.map((b, bi) => (<button key={b.id} className={`sb-sub ${focus === bi ? "on" : ""}`} onClick={() => setFocus(focus === bi ? null : bi)}>{b.title || "..."}</button>))}
          </div>))}
          <button className="sb-btn" style={{ color: "var(--t4)", fontSize: 9 }} onClick={() => up(d => d.sessions.push(mkSession(d.sessions.length + 1)))}>+ מפגש</button>
          <div style={{ padding: "8px 10px", borderTop: "1px solid var(--edge)", display: "flex", gap: 3, flexWrap: "wrap" }}>
            {["prep", "teach", "summary"].map(v => (<button key={v} className={`pill xs ${view === v ? "bl" : ""}`} onClick={() => { setView(v); setTi(0); }}>{{ prep: "הכנה", teach: "הוראה", summary: "סיכום" }[v]}</button>))}
          </div>
        </>)}

        {page === "tools" && (<><div className="sb-lbl">כלים</div>
          {data.tools.map((t, i) => (<button key={t.id} className={`sb-btn ${editTool === i ? "on" : ""}`} onClick={() => setEditTool(i)}>{t.name || "כלי חדש"}</button>))}
          <button className="sb-btn" style={{ color: "var(--t4)", fontSize: 9 }} onClick={() => { up(d => d.tools.push(mkTool())); setEditTool(data.tools.length); }}>+ כלי</button>
        </>)}

        {page === "tasks" && (<><div className="sb-lbl">משימות</div>
          {data.tasks.map((t, i) => (<button key={t.id} className={`sb-btn ${editTask === i ? "on" : ""}`} onClick={() => setEditTask(i)}>{t.title || "משימה חדשה"}</button>))}
          <button className="sb-btn" style={{ color: "var(--t4)", fontSize: 9 }} onClick={() => { up(d => d.tasks.push(mkTask())); setEditTask(data.tasks.length); }}>+ משימה</button>
        </>)}
      </div>

      {/* MAIN */}
      <div className="mn">
        <div className="bar">
          <span className="crumb"><b>{PAGES[page]}</b> {page === "sessions" && sess && <> / {sess.title} <span className="vw">{{ prep: "הכנה", teach: "הוראה", summary: "סיכום" }[view]}</span></>}</span>
          <div className="acts"><span className="meta">{data.sessions.length} מפגשים / {data.tools.length} כלים / {data.tasks.filter(t => t.status !== "done").length} משימות פתוחות</span></div>
        </div>
        <div className="cnt">

          {/* Global search */}
          <input className="inp search-global" placeholder="חיפוש בכל המידע..." value={q} onChange={e => setQ(e.target.value)} />
          {searchResults && searchResults.length > 0 && (
            <div className="panel" style={{ marginBottom: 14 }}>
              <div className="panel-h"><span className="title" style={{ fontSize: 11 }}>תוצאות ({searchResults.length})</span></div>
              <div className="panel-body">{searchResults.slice(0, 10).map((r, i) => (
                <div key={i} className="li" onClick={() => { setQ(""); if (r.type === "session") { setPage("sessions"); setSi(r.idx); } if (r.type === "tool") { setPage("tools"); setEditTool(r.idx); } if (r.type === "task") { setPage("tasks"); setEditTask(r.idx); } }}>
                  <span className="c-tag" style={{ background: r.type === "session" ? "var(--blue)" : r.type === "tool" ? "var(--green)" : "var(--amber)", fontSize: 7 }}>{{ session: "מפגש", tool: "כלי", task: "משימה" }[r.type]}</span>
                  <span style={{ flex: 1 }}>{r.label}</span>
                </div>
              ))}</div>
            </div>
          )}

          {/* ═══ DASHBOARD ═══ */}
          {page === "dashboard" && (<div>
            <div className="hint"><b>דשבורד</b> — מבט על: מפגשים, כלים, משימות פתוחות, גישה מהירה.</div>
            <div className="dash">
              <div className="dcard">
                <h3>מפגשים</h3><p>{data.sessions.length} סה״כ</p>
                <div className="d-stats">
                  {Object.entries(STATUSES).map(([k, v]) => { const c = data.sessions.filter(s => s.status === k).length; if (!c) return null; return <div key={k} className="d-stat"><div className="n" style={{ color: v.tone }}>{c}</div><div className="l">{v.label}</div></div>; })}
                </div>
                {data.sessions.map((s, i) => (<div key={s.id} className="li" onClick={() => { setPage("sessions"); setSi(i); setView("prep"); }}>
                  <span style={{ flex: 1, fontWeight: 500 }}>{s.title}</span>
                  <span className="tag" style={{ color: STATUSES[s.status]?.tone }}>{STATUSES[s.status]?.label}</span>
                </div>))}
                <button className="pill sm" style={{ marginTop: 8 }} onClick={() => { up(d => d.sessions.push(mkSession(d.sessions.length + 1))); setPage("sessions"); setSi(data.sessions.length); }}>+ מפגש חדש</button>
              </div>

              <div className="dcard">
                <h3>משימות פתוחות</h3><p>{data.tasks.filter(t => t.status !== "done").length} משימות</p>
                {data.tasks.filter(t => t.status !== "done").slice(0, 6).map((t, i) => (<div key={t.id} className="li" onClick={() => { setPage("tasks"); setEditTask(data.tasks.indexOf(t)); }}>
                  <span style={{ flex: 1 }}>{t.title || "(ללא כותרת)"}</span>
                  <span className="tag" style={{ color: PRIORITIES[t.priority]?.tone }}>{PRIORITIES[t.priority]?.label}</span>
                </div>))}
                <button className="pill sm" style={{ marginTop: 8 }} onClick={() => { up(d => d.tasks.push(mkTask())); setPage("tasks"); setEditTask(data.tasks.length); }}>+ משימה</button>
              </div>

              <div className="dcard dash-full">
                <h3>כלים ({data.tools.length})</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                  {data.tools.map((t, i) => (<span key={t.id} className="chip" onClick={() => { setPage("tools"); setEditTool(i); }}><a>{t.name}</a><span style={{ fontSize: 7, color: "var(--t4)" }}>{t.category}</span></span>))}
                </div>
              </div>
            </div>
          </div>)}

          {/* ═══ SESSIONS — PREP ═══ */}
          {page === "sessions" && view === "prep" && sess && (<div>
            {/* Session meta */}
            <div className="panel">
              <div className="panel-h">
                <input className="title" value={sess.title} onChange={e => up(d => { d.sessions[si].title = e.target.value; d.sessions[si].updatedAt = now(); })} placeholder="שם מפגש..." />
                <button className="pill xs" onClick={() => cloneSession(si)}>שכפל</button>
                <button className="pill xs rd" onClick={() => { if (data.sessions.length > 1 && confirm("למחוק?")) { up(d => d.sessions.splice(si, 1)); setSi(0); } }}>מחק</button>
              </div>
              <div className="panel-body" style={{ padding: "8px 12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div className="c-f"><label>מטרה</label><textarea className="inp ta" value={sess.purpose} onChange={e => up(d => { d.sessions[si].purpose = e.target.value; })} placeholder="מטרת המפגש..." /></div>
                  <div className="c-f"><label>תובנות</label><textarea className="inp ta" value={sess.insights || ""} onChange={e => up(d => { d.sessions[si].insights = e.target.value; })} placeholder="מה למדנו..." /></div>
                  <div className="c-f"><label>בעיות</label><textarea className="inp ta" value={sess.problems || ""} onChange={e => up(d => { d.sessions[si].problems = e.target.value; })} placeholder="מה לא עבד..." /></div>
                  <div className="c-f"><label>פתרונות / תוצאות</label><textarea className="inp ta" value={sess.solutions || ""} onChange={e => up(d => { d.sessions[si].solutions = e.target.value; })} placeholder="מה פתרנו..." /></div>
                </div>
                <div className="c-row" style={{ marginTop: 6 }}>
                  <select className="c-sel" value={sess.status} onChange={e => up(d => { d.sessions[si].status = e.target.value; })}>{Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                  <select className="c-sel" value={sess.priority} onChange={e => up(d => { d.sessions[si].priority = e.target.value; })}>{Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                  <input className="inp sm" style={{ width: 90 }} type="date" value={sess.date || ""} onChange={e => up(d => { d.sessions[si].date = e.target.value; })} />
                  <span className="meta">{allCards.length} כרטיסים / {allCards.reduce((s, c) => s + (c.minutes || 0), 0)}׳ / {pct("done")}%</span>
                </div>
                <div className="tags" style={{ marginTop: 4 }}>
                  {(sess.tags || []).map((t, i) => (<span key={i} className="tag on">{t} <span style={{ cursor: "pointer", marginRight: 3 }} onClick={() => up(d => { d.sessions[si].tags.splice(i, 1); })}>x</span></span>))}
                  <button className="pill xs" onClick={() => { const t = prompt("תגית חדשה:"); if (t) up(d => { d.sessions[si].tags.push(t); if (!d.tags.includes(t)) d.tags.push(t); }); }}>+ תגית</button>
                </div>
              </div>
            </div>

            {/* Blocks + Cards */}
            {sess.blocks.map((block, bi) => {
              if (focus !== null && focus !== bi) return null;
              const hid = colB[block.id]; const cards = block.cards; const bp = bPct(block);
              return (<div key={block.id} className="panel">
                <div className="seg-bar">{block.cards.map((c, i) => (<div key={i} className="seg" style={{ background: c.status === "done" ? "var(--green)" : c.status === "skipped" ? "var(--amber)" : c.status === "active" ? "var(--blue)" : "var(--bg)" }} />))}{block.cards.length === 0 && <div className="seg" style={{ background: "var(--bg)" }} />}</div>
                <div className="bh">
                  <input className="title" value={block.title} onChange={e => up(d => { d.sessions[si].blocks[bi].title = e.target.value; })} placeholder="כותרת..." />
                  <span className="meta">{block.cards.length} / {block.cards.reduce((s, c) => s + (c.minutes || 0), 0)}׳</span>
                  <button className="pill xs" onClick={() => setColB(p => ({ ...p, [block.id]: !p[block.id] }))}>{hid ? "פתח" : "סגור"}</button>
                  <button className="pill xs rd" onClick={() => { if (confirm("למחוק?")) up(d => d.sessions[si].blocks.splice(bi, 1)); }}>מחק</button>
                </div>
                <div className={`panel-body ${hid ? "hide" : ""}`}>
                  {cards.length === 0 && <div className="empty">חלק ריק — הוסיפו כרטיס למטה</div>}
                  {cards.map((card, ci) => { const tp = CARD_TYPES[card.type] || CARD_TYPES.note; const isOpen = openC[card.id];
                    return (<div key={card.id} className="cd" draggable onDragStart={() => setDrag({ si, bi, ci })} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }} onDragLeave={e => e.currentTarget.classList.remove("drag-over")} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("drag-over"); if (drag) { up(d => { const [c] = d.sessions[drag.si].blocks[drag.bi].cards.splice(drag.ci, 1); d.sessions[si].blocks[bi].cards.splice(ci, 0, c); }); setDrag(null); } }} onDragEnd={() => setDrag(null)}>
                      <div className="ch">
                        <span className="c-grip">:::</span>
                        <span className="c-tag" style={{ background: tp.tone }}>{tp.label}</span>
                        <input className="c-ti" value={card.title} onChange={e => up(d => { d.sessions[si].blocks[bi].cards[ci].title = e.target.value; })} placeholder="כותרת..." />
                        <span className="c-mn">{card.minutes > 0 ? `${card.minutes}׳` : ""}</span>
                        <div className={`toggle ${card.status}`} tabIndex={0} role="switch" onClick={() => up(d => { const cur = SCYCLE.indexOf(d.sessions[si].blocks[bi].cards[ci].status); d.sessions[si].blocks[bi].cards[ci].status = SCYCLE[(cur + 1) % SCYCLE.length]; })}><div className="thumb" /></div>
                        <button className="c-tgl" onClick={() => setOpenC(p => ({ ...p, [card.id]: !p[card.id] }))}>{isOpen ? "סגור" : "עוד"}</button>
                      </div>
                      <div className={`c-bd ${isOpen ? "open" : ""}`}>
                        <div className="c-f"><label>תוכן</label><textarea className="inp ta" value={card.content} onChange={e => up(d => { d.sessions[si].blocks[bi].cards[ci].content = e.target.value; })} placeholder="תיאור..." /></div>
                        <div className="c-f"><label>הערה למרצה</label><textarea className="inp ta warm" value={card.note} style={{ minHeight: 24 }} onChange={e => up(d => { d.sessions[si].blocks[bi].cards[ci].note = e.target.value; })} placeholder="תזכורת..." /></div>
                        {["link", "demo", "example", "image"].includes(card.type) && (<div className="c-f"><label>קישור</label><input className="inp ltr" value={card.url} onChange={e => up(d => { d.sessions[si].blocks[bi].cards[ci].url = e.target.value; })} placeholder="https://..." />{card.url && <a href={card.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, color: "var(--blue)", marginTop: 2, display: "inline-block" }}>פתח</a>}{card.type === "image" && card.url && <img src={card.url} alt="" style={{ maxWidth: "100%", maxHeight: 100, marginTop: 4, borderRadius: 8 }} />}</div>)}
                        <div className="c-row">
                          <select className="c-sel" value={card.status} onChange={e => up(d => { d.sessions[si].blocks[bi].cards[ci].status = e.target.value; })}>{Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                          <select className="c-sel" value={card.type} onChange={e => up(d => { d.sessions[si].blocks[bi].cards[ci].type = e.target.value; })}>{Object.entries(CARD_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                          <input className="inp num" type="number" value={card.minutes} min={0} onChange={e => up(d => { d.sessions[si].blocks[bi].cards[ci].minutes = parseInt(e.target.value) || 0; })} />
                          <button className="pill xs rd" style={{ marginRight: "auto" }} onClick={() => up(d => d.sessions[si].blocks[bi].cards.splice(ci, 1))}>מחק</button>
                        </div>
                      </div>
                    </div>); })}
                  <div className="add-bar">{Object.entries(CARD_TYPES).map(([k, v]) => (<button key={k} className="ab" onClick={() => up(d => d.sessions[si].blocks[bi].cards.push(mkCard(k)))}>+ {v.label}</button>))}</div>
                </div>
              </div>); })}
            {focus === null && <button className="pill" onClick={() => up(d => d.sessions[si].blocks.push(mkBlock()))}>+ חלק חדש</button>}
          </div>)}

          {/* ═══ SESSIONS — TEACH ═══ */}
          {page === "sessions" && view === "teach" && sess && (<div className="teach">
            <div className="hint"><b>הוראה</b> — חיצים = ניווט / רווח = נאמר.</div>
            <div className="t-prog"><div style={{ width: `${allCards.length ? ((ti + 1) / allCards.length * 100) : 0}%` }} /></div>
            {allCards.length === 0 && <div className="empty">אין כרטיסים</div>}
            {allCards.length > 0 && (() => { const c = allCards[ti]; if (!c) return null; const tp = CARD_TYPES[c.type] || CARD_TYPES.note; const st = STATUSES[c.status];
              return (<><div className="t-card">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span className="c-tag" style={{ background: tp.tone, fontSize: 9, padding: "3px 10px" }}>{tp.label}</span>
                  <div className={`toggle ${c.status}`} tabIndex={0} role="switch" style={{ width: 30, height: 16 }} onClick={() => up(d => { const cur = SCYCLE.indexOf(d.sessions[si].blocks[c.bi].cards[c.ci].status); d.sessions[si].blocks[c.bi].cards[c.ci].status = SCYCLE[(cur + 1) % SCYCLE.length]; })}><div className="thumb" style={{ width: 10, height: 10, top: 2 }} /></div>
                  <span style={{ fontSize: 8, color: st?.tone }}>{st?.label}</span>
                </div>
                <div className="t-block" style={{ fontSize: 8, color: "var(--t4)" }}>{c.bTitle}</div>
                <h2>{c.title || "(ללא כותרת)"}</h2>
                <div className="t-body">{c.content}</div>
                {c.note && <div className="t-note"><b>הערה:</b> {c.note}</div>}
                {c.url && c.type === "image" && <img src={c.url} alt="" style={{ maxWidth: "100%", marginTop: 12, borderRadius: 10 }} />}
                {c.url && c.type !== "image" && <a className="t-url" href={c.url} target="_blank" rel="noopener noreferrer">פתח קישור</a>}
                <div className="t-nav">
                  <div style={{ display: "flex", gap: 5 }}><button className="pill" disabled={ti === 0} onClick={() => setTi(ti - 1)}>הקודם</button><button className="pill" disabled={ti >= allCards.length - 1} onClick={() => setTi(ti + 1)}>הבא</button></div>
                  <span style={{ fontSize: 9, color: "var(--t4)" }}>{ti + 1}/{allCards.length}</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button className="pill gld" onClick={() => { up(d => { d.sessions[si].blocks[c.bi].cards[c.ci].status = "skipped"; }); if (ti < allCards.length - 1) setTi(ti + 1); }}>דלג</button>
                    <button className="pill gn" onClick={() => { up(d => { d.sessions[si].blocks[c.bi].cards[c.ci].status = "done"; }); if (ti < allCards.length - 1) setTi(ti + 1); }}>נאמר</button>
                  </div>
                </div>
              </div><div style={{ fontSize: 7, color: "var(--t4)", textAlign: "center", marginTop: 6 }}>חיצים = ניווט / רווח = נאמר</div></>); })()}
          </div>)}

          {/* ═══ SESSIONS — SUMMARY ═══ */}
          {page === "sessions" && view === "summary" && sess && (<div>
            <div className="hint"><b>סיכום</b> — מה הספקנו ומה נשאר.</div>
            <div className="dash">
              {Object.entries(STATUSES).map(([k, v]) => { const c = byStat(k).length; if (!c) return null; return <div key={k} className="dcard" style={{ textAlign: "center" }}><div className="d-stat"><div className="n" style={{ color: v.tone, textShadow: `0 0 14px ${v.tone}30` }}>{c}</div><div className="l">{v.label}</div></div></div>; })}
            </div>
            {Object.entries(STATUSES).map(([k, v]) => { const cards = byStat(k); if (!cards.length) return null;
              return (<div key={k} className="panel" style={{ marginTop: 10 }}><div className="panel-h"><span className="title" style={{ color: v.tone, fontSize: 11 }}>{v.label} ({cards.length})</span></div>
                <div className="panel-body">{cards.map((c, i) => (<div key={i} className="li"><span className="c-tag" style={{ background: (CARD_TYPES[c.type] || CARD_TYPES.note).tone }}>{(CARD_TYPES[c.type] || CARD_TYPES.note).label}</span><span style={{ flex: 1, fontWeight: 500 }}>{c.title}</span><span className="meta">{c.bTitle}</span></div>))}</div>
              </div>); })}
          </div>)}

          {/* ═══ TOOLS ═══ */}
          {page === "tools" && (<div>
            <div className="hint"><b>ספריית כלים</b> — כל הכלים, האינטגרציות והאפליקציות. לחצו על כלי לעריכה.</div>
            {editTool !== null && data.tools[editTool] ? (() => { const t = data.tools[editTool]; const ti2 = editTool;
              return (<div className="panel"><div className="panel-h"><input className="title" value={t.name} onChange={e => up(d => { d.tools[ti2].name = e.target.value; })} placeholder="שם כלי..." /><button className="pill xs rd" onClick={() => { if (confirm("למחוק?")) { up(d => d.tools.splice(ti2, 1)); setEditTool(null); } }}>מחק</button></div>
                <div className="panel-body" style={{ padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div className="c-f"><label>קטגוריה</label><select className="c-sel" style={{ width: "100%" }} value={t.category} onChange={e => up(d => { d.tools[ti2].category = e.target.value; })}>{TOOL_CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div className="c-f"><label>URL</label><input className="inp ltr" value={t.url} onChange={e => up(d => { d.tools[ti2].url = e.target.value; })} placeholder="https://..." /></div>
                    <div className="c-f"><label>למה משמש</label><textarea className="inp ta" value={t.purpose} onChange={e => up(d => { d.tools[ti2].purpose = e.target.value; })} /></div>
                    <div className="c-f"><label>מתי משתמשים</label><textarea className="inp ta" value={t.whenToUse} onChange={e => up(d => { d.tools[ti2].whenToUse = e.target.value; })} /></div>
                    <div className="c-f"><label>קלט</label><textarea className="inp ta" value={t.input} onChange={e => up(d => { d.tools[ti2].input = e.target.value; })} /></div>
                    <div className="c-f"><label>פלט</label><textarea className="inp ta" value={t.output} onChange={e => up(d => { d.tools[ti2].output = e.target.value; })} /></div>
                    <div className="c-f"><label>חיבורים לכלים אחרים</label><textarea className="inp ta" value={t.connections} onChange={e => up(d => { d.tools[ti2].connections = e.target.value; })} /></div>
                    <div className="c-f"><label>מגבלות</label><textarea className="inp ta" value={t.limitations} onChange={e => up(d => { d.tools[ti2].limitations = e.target.value; })} /></div>
                    <div className="c-f" style={{ gridColumn: "1/-1" }}><label>דוגמאות שימוש</label><textarea className="inp ta" value={t.examples} onChange={e => up(d => { d.tools[ti2].examples = e.target.value; })} /></div>
                    <div className="c-f" style={{ gridColumn: "1/-1" }}><label>הערות</label><textarea className="inp ta warm" value={t.notes} onChange={e => up(d => { d.tools[ti2].notes = e.target.value; })} /></div>
                  </div>
                  <div className="tags" style={{ marginTop: 6 }}>
                    {(t.tags || []).map((tg, i) => (<span key={i} className="tag on">{tg} <span style={{ cursor: "pointer" }} onClick={() => up(d => { d.tools[ti2].tags.splice(i, 1); })}>x</span></span>))}
                    <button className="pill xs" onClick={() => { const tg = prompt("תגית:"); if (tg) up(d => { d.tools[ti2].tags.push(tg); if (!d.tags.includes(tg)) d.tags.push(tg); }); }}>+ תגית</button>
                  </div>
                </div>
              </div>);
            })() : (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {data.tools.map((t, i) => (<div key={t.id} className="tool-card" onClick={() => setEditTool(i)}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><h4>{t.name || "ללא שם"}</h4><span className="tag">{t.category}</span></div>
                <p>{t.purpose}</p>{t.url && <a href={t.url} target="_blank" rel="noopener noreferrer" className="t-url" style={{ marginTop: 6, fontSize: 8 }} onClick={e => e.stopPropagation()}>{t.url}</a>}
                <div className="tags" style={{ marginTop: 4 }}>{(t.tags || []).map((tg, j) => <span key={j} className="tag">{tg}</span>)}</div>
              </div>))}
            </div>)}
          </div>)}

          {/* ═══ TASKS ═══ */}
          {page === "tasks" && (<div>
            <div className="hint"><b>משימות</b> — מעקב אחרי מה צריך לעשות. לחצו על משימה לעריכה.</div>
            {editTask !== null && data.tasks[editTask] ? (() => { const t = data.tasks[editTask]; const idx = editTask;
              return (<div className="panel"><div className="panel-h"><input className="title" value={t.title} onChange={e => up(d => { d.tasks[idx].title = e.target.value; })} placeholder="שם משימה..." /><button className="pill xs" onClick={() => setEditTask(null)}>סגור</button><button className="pill xs rd" onClick={() => { up(d => d.tasks.splice(idx, 1)); setEditTask(null); }}>מחק</button></div>
                <div className="panel-body" style={{ padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div className="c-f"><label>תיאור</label><textarea className="inp ta" value={t.description} onChange={e => up(d => { d.tasks[idx].description = e.target.value; })} /></div>
                    <div className="c-f"><label>הערות</label><textarea className="inp ta warm" value={t.notes} onChange={e => up(d => { d.tasks[idx].notes = e.target.value; })} /></div>
                  </div>
                  <div className="c-row">
                    <select className="c-sel" value={t.status} onChange={e => up(d => { d.tasks[idx].status = e.target.value; })}>{Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                    <select className="c-sel" value={t.priority} onChange={e => up(d => { d.tasks[idx].priority = e.target.value; })}>{Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                    <input className="inp sm" style={{ width: 100 }} type="date" value={t.dueDate || ""} onChange={e => up(d => { d.tasks[idx].dueDate = e.target.value; })} />
                  </div>
                  <div className="tags" style={{ marginTop: 6 }}>
                    {(t.tags || []).map((tg, i) => (<span key={i} className="tag on">{tg} <span style={{ cursor: "pointer" }} onClick={() => up(d => { d.tasks[idx].tags.splice(i, 1); })}>x</span></span>))}
                    <button className="pill xs" onClick={() => { const tg = prompt("תגית:"); if (tg) up(d => { d.tasks[idx].tags.push(tg); if (!d.tags.includes(tg)) d.tags.push(tg); }); }}>+ תגית</button>
                  </div>
                </div>
              </div>);
            })() : (<div>
              {data.tasks.map((t, i) => (<div key={t.id} className="task-row">
                <div className={`toggle ${t.status}`} tabIndex={0} role="switch" style={{ width: 30, height: 16 }} onClick={() => up(d => { const cur = SCYCLE.indexOf(d.tasks[i].status); d.tasks[i].status = SCYCLE[(cur + 1) % SCYCLE.length]; })}><div className="thumb" style={{ width: 10, height: 10, top: 2 }} /></div>
                <input className="task-title" value={t.title} onChange={e => up(d => { d.tasks[i].title = e.target.value; })} placeholder="משימה..." />
                <span className="tag" style={{ color: PRIORITIES[t.priority]?.tone }}>{PRIORITIES[t.priority]?.label}</span>
                <span className="meta">{STATUSES[t.status]?.label}</span>
                <button className="c-tgl" onClick={() => setEditTask(i)}>עוד</button>
              </div>))}
              <button className="pill" style={{ marginTop: 8 }} onClick={() => up(d => d.tasks.push(mkTask()))}>+ משימה</button>
            </div>)}
          </div>)}

        </div>
      </div>
    </div></div>
    <div className={`toast ${toast ? "on" : ""}`}>&#10003; נשמר</div>
  </>);
}

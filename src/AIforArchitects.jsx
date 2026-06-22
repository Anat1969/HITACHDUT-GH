import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── DATA ─── */
const LINKS_INIT = [
  { label: "Claude Chat", url: "https://claude.ai", desc: "שיחה וחקירה" },
  { label: "Claude Code", url: "https://docs.anthropic.com/en/docs/claude-code", desc: "בנייה וקוד" },
  { label: "Cowork", url: "https://claude.ai", desc: "עבודה מתמשכת" },
  { label: "n8n", url: "https://n8n.io", desc: "אוטומציה וזרימות" },
  { label: "Midjourney", url: "https://midjourney.com", desc: "המחשה ויזואלית" },
];

const PROMPTS = [
  { id:"twin", title:"תאום דיגיטלי", hook:"אדריכל עומד בין מודל פיזי להשתקפות דיגיטלית שלו — רגע ההכרה שהכלי מבין אותך", prompt:"Documentary realism, Professional architecture photography, 16:9, an architect standing between a physical scale model and its holographic digital twin reflecting back at them, dark studio with amber highlights on reflective metallic surfaces, the model transforms from analog to digital across the frame, deep shadows, No text, No words, No writing, No frame divisions" },
  { id:"corridor", title:"מכלי לשותף", hook:"מסדרון שעובר מכלי שרטוט אנלוגיים לממשקים דיגיטליים חיים — המעבר שלא חוזר", prompt:"Documentary realism, Professional architecture photography, 16:9, a long concrete corridor where one side shows traditional drafting tools and rolled blueprints progressively transforming into luminous floating digital interfaces on the other side, the transition is gradual and organic, dark brutalist walls with golden light seeping through cracks, No text, No words, No writing, No frame divisions" },
  { id:"layers", title:"שלוש שכבות", hook:"שולחן עבודה מחולק לשלוש — סקיצה, מסך, רשת מחוברת", prompt:"Documentary realism, Professional architecture photography, 16:9, birds eye view of an architects desk split into three distinct zones, left shows hand sketches and trace paper, center shows a glowing AI interface with building forms, right shows an interconnected network of flowing data streams between multiple screens, dark moody lighting with selective warm amber highlights on each zone, No text, No words, No writing, No frame divisions" },
  { id:"judgment", title:"שיפוט", hook:"ידיים של אדריכל מרחפות מעל עשרות וריאציות — הרגע שבו בוחרים אחת", prompt:"Documentary realism, Professional architecture photography, 16:9, close up of an architects weathered hands hovering over a dark translucent surface displaying dozens of building variation thumbnails, one variation glows amber while the rest fade to shadow, the gesture suggests deliberate selection and professional judgment, dark metallic workspace, No text, No words, No writing, No frame divisions" },
  { id:"integration", title:"אינטגרציה", hook:"מבט-על על עיר שבה זרימות נתונים זורמות בין מבנים כמו תשתית בלתי נראית", prompt:"Documentary realism, Professional architecture photography, 16:9, aerial view of a city at dusk where subtle luminous data streams flow between buildings like invisible infrastructure, the streams follow the urban grid organically connecting structures to each other, warm amber light traces against deep blue twilight, architectural scale, No text, No words, No writing, No frame divisions" },
];

const SECTIONS_INIT = [
  { id:"opening", tab:"פתיחה", headline:"הכלי השתנה. התהליך השתנה.\nהמוצר השתנה. ואתם?", body:"הטכנולוגיה משתפרת מעצמה — תרתי משמע. המודלים מתעדכנים, הכלים מתחדדים. אבל האדם לא משתפר אוטומטית. שינוי תפיסה דורש אימון, כוונה, ואומץ לחשוב אדריכלות בצורה אחרת.", accent:"פחות טכני, יותר רעיוני. השראה ומחקר מצד אחד — ניהול, בדיקה ובקרה מהצד השני." },
  { id:"layers", tab:"שלוש שכבות", headline:"להשתמש בכלי. לייצר כלי.\nלחבר כלים למערכת.", body:"שלב ראשון — שימוש. לשאול שאלה, לקבל תשובה. רוב האנשים נמצאים פה.\n\nשלב שני — ייצור. לאמן, לאפיין, לשייף. כשאת מייצרת כלי, את חייבת לפרק את הידע שלך ליחידות, לנסח, לאמן. זו חשיבה אדריכלית.\n\nשלב שלישי — אינטגרציה. הכלי מפסיק להיות אובייקט בודד ומתחיל להיות חלק מרשת. טריגר נכנס, מפעיל תהליך, יוצר תוצר. זו תכנון עירוני.", accent:"הרצון להמשיך לשייף את הכלים — זו הבנה עמוקה של הצורך. שיוף נובע מכאב או מאמץ. כל איטרציה חושפת שכבה של מה שבאמת חסר." },
  { id:"spectrum", tab:"כלי או שותף", headline:"לא ׳או׳. מתי.", body:"ככלי — כשהמשימה טכנית, חוזרת, מוגדרת. רינדור, ניתוח תקציב, הפקת טבלאות.\n\nכשותף — כשאת חוקרת, מזקקת תובנות, מחפשת כיוון שלא ידעת שקיים. כשצריך לזהות דפוסים שאת לא רואה.", accent:"הגישה הישנה: AI עושה מה שאני אומרת לו.\nהגישה החדשה: AI עוזר לי לחשוב מה אני צריכה לומר." },
  { id:"twin", tab:"תאום דיגיטלי", headline:"שיבין אותך יותר\nממה שאת מבינה את עצמך.", body:"תיאום ציפיות — שיענה בדיוק למה שחסר, לא למה שהוא חושב שצריך.\n\nהפרדה בין ארכיטייפ ל-DNA — בין הנחיות כלליות (סגנון, שפה, גישה) לבין הנחיות ספציפיות (פרויקט, משימה, הקשר).\n\nשלוש שכבות אימון: Setting — מי אני. Project — מה אני עושה עכשיו. Chat — מה אני צריכה ברגע הזה.", accent:"מודל תאום שלך — ככל שהאימון מדויק יותר, ה-AI מגיב מדויק יותר, ומהתגובה שלו את מבינה מה את באמת צריכה." },
  { id:"modes", tab:"Chat · Cowork · Code", headline:"לחקור. ליצור. לבנות.", body:"Chat — שיחה, חשיבה, הכוונה. את שואלת, הוא מחדד. מרחב חקירה.\n\nCowork — עבודה מתמשכת על מסמכים, תוכן, ידע. שיתוף פעולה אמיתי.\n\nCode — ביצוע, קוד, מערכות. הוא עושה, את מכוונת.", accent:"ספקטרום בין פסיביות לאקטיביות — לא שלוש תוכנות, שלושה מצבי עבודה." },
  { id:"intuition", tab:"אינטואיציה", headline:"מי אמר שאין לו אינטואיציה?", body:"אם אינטואיציה היא זיהוי דפוסים מתוך ניסיון מצטבר — ל-AI יש את זה בכמויות שאף אדריכל לא יצבור בחיים שלמים.\n\nההבדל — לא אינטואיציה. כוונה.\n\nAI מזהה דפוסים ומציע. אבל הוא לא רוצה שום דבר. אין לו עמדה על מה צריך להיות. אין לו את ה׳משהו פה מפריע לי׳ שגורם להתחיל מחדש.", accent:"אנחנו לא מלמדים מה AI לא יכול. אנחנו מלמדים מה הוא לא יכול עכשיו. ההבחנות זזות." },
  { id:"role", tab:"התפקיד", headline:"לדעת מה צריך להיות.", body:"AI מג׳נגל — מגלה דפוסים, מסדר, מסנתז, מוצא קורלציות, מזקק, אורג.\n\nאת מכוונת את הג׳ינגול.\n\nשלוש פעולות שרק את עושה: לשאול את השאלה הנכונה. לשפוט רלוונטיות. להחליט.\n\nלא ייצור, לא עיבוד, לא סינתוז. שיפוט — מי שיש לו רק מיומנות, AI יחליף אותו. מי שיש לו שיפוט, AI יגביר אותו.", accent:"המעבר הוא לא טכנולוגי. הוא אפיסטמולוגי — משנה את מה שאת חושבת ש׳לדעת אדריכלות׳ אומר." },
];

/* ─── STYLES ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
  .afa-root * { margin:0; padding:0; box-sizing:border-box; }
  .afa-root ::-webkit-scrollbar { width:4px; }
  .afa-root ::-webkit-scrollbar-track { background:transparent; }
  .afa-root ::-webkit-scrollbar-thumb { background:rgba(200,150,60,0.15); border-radius:2px; }

  .flip-card { perspective:800px; cursor:pointer; }
  .flip-inner { position:relative; width:100%; height:100%; transition:transform 0.7s cubic-bezier(0.4,0,0.2,1); transform-style:preserve-3d; }
  .flip-card.flipped .flip-inner { transform:rotateY(180deg); }
  .flip-front,.flip-back { position:absolute; inset:0; backface-visibility:hidden; border-radius:16px; padding:24px; display:flex; flex-direction:column; justify-content:center; }
  .flip-back { transform:rotateY(180deg); }

  .afa-glass { background:rgba(12,16,20,0.55); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(200,150,60,0.06); }
  .afa-glass-hover:hover { border-color:rgba(200,150,60,0.15); box-shadow:0 4px 30px rgba(180,120,40,0.06), inset 0 1px 0 rgba(200,150,60,0.05); }

  .afa-slide-in { animation: afaSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes afaSlideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

  .afa-pulse-glow { animation: afaPulseGlow 3s ease-in-out infinite; }
  @keyframes afaPulseGlow { 0%,100% { box-shadow:0 0 20px rgba(200,140,50,0.04); } 50% { box-shadow:0 0 30px rgba(200,140,50,0.1); } }

  .afa-link-pill { display:inline-flex; align-items:center; gap:6px; padding:6px 16px; border-radius:20px; font-size:11px; font-weight:300; letter-spacing:0.8px; text-decoration:none; transition:all 0.3s; border:1px solid rgba(200,150,60,0.08); color:rgba(220,180,100,0.5); background:rgba(12,16,20,0.5); backdrop-filter:blur(10px); }
  .afa-link-pill:hover { border-color:rgba(200,150,60,0.25); color:rgba(220,180,100,0.85); background:rgba(180,120,40,0.08); }

  .afa-nav-btn { display:block; width:100%; padding:12px 22px; font-size:13px; text-align:right; background:transparent; border:none; cursor:pointer; font-family:inherit; transition:all 0.3s; letter-spacing:0.3px; position:relative; }
  .afa-nav-btn::before { content:''; position:absolute; right:0; top:20%; bottom:20%; width:2px; background:transparent; transition:all 0.3s; border-radius:1px; }
  .afa-nav-btn.active { background:rgba(180,120,40,0.05); color:rgba(220,180,100,0.85); font-weight:400; }
  .afa-nav-btn.active::before { background:rgba(200,140,50,0.5); box-shadow:0 0 8px rgba(200,140,50,0.15); }
  .afa-nav-btn:not(.active) { color:rgba(220,200,170,0.22); font-weight:300; }
  .afa-nav-btn:not(.active):hover { color:rgba(220,200,170,0.45); background:rgba(180,120,40,0.02); }

  .afa-mode-pill { padding:7px 20px; font-size:11px; font-weight:300; letter-spacing:1px; border-radius:24px; border:1px solid rgba(200,140,50,0.1); cursor:pointer; font-family:inherit; transition:all 0.35s; }
  .afa-mode-pill.off { background:rgba(12,16,20,0.5); color:rgba(220,180,100,0.45); }
  .afa-mode-pill.on { background:rgba(180,120,40,0.15); color:rgba(220,180,100,0.85); box-shadow:0 0 20px rgba(180,120,40,0.06); border-color:rgba(200,140,50,0.2); }

  textarea.afa-edit-area { width:100%; font-family:inherit; direction:rtl; resize:vertical; background:rgba(12,16,20,0.5); backdrop-filter:blur(12px); border:1px solid rgba(200,140,50,0.1); border-radius:12px; padding:18px 20px; color:rgba(220,200,170,0.85); font-weight:300; line-height:1.9; outline:none; transition:border-color 0.3s; }
  textarea.afa-edit-area:focus { border-color:rgba(200,140,50,0.25); }
`;

/* ─── COMPONENTS ─── */
const CopyBtn = ({ text }) => {
  const [c, setC] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setC(true); setTimeout(() => setC(false), 2000); }); }}
      className={`afa-mode-pill ${c ? "on" : "off"}`} style={{ fontSize:10 }}>
      {c ? "הועתק" : "העתק פרומפט"}
    </button>
  );
};

const FlipCards = () => {
  const [flipped, setFlipped] = useState({});
  const cards = [
    { id:"setting", front:"Setting", frontSub:"מי אני", back:"הנחיות קבועות — סגנון כתיבה, שפה מקצועית, גישה. הארכיטייפ שלך. נשאר זהה בין פרויקטים.", color:"rgba(180,140,60,0.12)" },
    { id:"project", front:"Project", frontSub:"מה אני עושה עכשיו", back:"הקשר ספציפי — סוג הפרויקט, לקוח, אילוצים, מטרות. ה-DNA של המשימה הנוכחית. משתנה בין פרויקטים.", color:"rgba(160,120,50,0.12)" },
    { id:"chat", front:"Chat", frontSub:"מה אני צריכה ברגע הזה", back:"הנחיה רגעית — שאלה ספציפית, בקשה מדויקת, כיוון חקירה. משתנה בכל שיחה. הרובד הדינמי ביותר.", color:"rgba(140,100,40,0.12)" },
  ];

  return (
    <div style={{ display:"flex", gap:12, margin:"32px 0" }}>
      {cards.map(c => (
        <div key={c.id} className={`flip-card ${flipped[c.id] ? "flipped" : ""}`}
          onClick={() => setFlipped(p => ({...p, [c.id]:!p[c.id]}))}
          style={{ flex:1, height:160 }}>
          <div className="flip-inner">
            <div className="flip-front afa-glass" style={{ background:c.color, alignItems:"center", textAlign:"center", border:"1px solid rgba(200,150,60,0.1)" }}>
              <div style={{ fontSize:11, color:"rgba(200,160,80,0.4)", letterSpacing:2.5, fontWeight:300, marginBottom:10, textTransform:"uppercase" }}>{c.front}</div>
              <div style={{ fontSize:16, color:"rgba(220,180,100,0.85)", fontWeight:400, letterSpacing:0.5 }}>{c.frontSub}</div>
              <div style={{ fontSize:10, color:"rgba(200,160,80,0.25)", marginTop:14, fontWeight:300 }}>לחצי להפוך</div>
            </div>
            <div className="flip-back afa-glass" style={{ background:"rgba(10,14,18,0.85)", border:"1px solid rgba(200,150,60,0.12)" }}>
              <div style={{ fontSize:13, color:"rgba(220,200,170,0.65)", lineHeight:1.8, fontWeight:300 }}>{c.back}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SpectrumSlider = () => {
  const [pos, setPos] = useState(50);
  const tool = ["רינדור","ניתוח תקציב","טבלאות","בדיקת תקנים"];
  const partner = ["חקירת כיוון","זיקוק תובנות","זיהוי דפוסים","אתגור הנחות"];
  return (
    <div className="afa-glass" style={{ margin:"32px 0", padding:28, borderRadius:16, boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20, fontSize:11, color:"rgba(200,160,80,0.4)", fontWeight:300, letterSpacing:2 }}>
        <span>שותף</span><span>כלי</span>
      </div>
      <div style={{ position:"relative", height:6, borderRadius:3, background:"rgba(200,160,80,0.06)", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:0, top:0, height:"100%", borderRadius:3, width:`${pos}%`, background:"linear-gradient(to left, rgba(200,140,50,0.55), rgba(180,100,30,0.1))", transition:"width 0.15s", boxShadow:"0 0 16px rgba(200,140,50,0.15)" }}/>
      </div>
      <input type="range" min="0" max="100" value={pos} onChange={e=>setPos(+e.target.value)}
        style={{ width:"100%", direction:"ltr", opacity:0, height:24, cursor:"pointer", marginTop:-15, position:"relative", zIndex:2 }}/>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, gap:32 }}>
        <div style={{ flex:1, opacity:Math.max(0.12, pos/100), transition:"opacity 0.3s" }}>
          <div style={{ fontSize:10, color:"rgba(200,160,80,0.35)", marginBottom:10, fontWeight:300, letterSpacing:1.5 }}>מצב שותף</div>
          {partner.map((t,i) => <div key={i} style={{ fontSize:13, color:"rgba(220,200,170,0.7)", padding:"5px 12px 5px 0", borderRight:"1px solid rgba(200,140,50,0.15)", marginBottom:3, fontWeight:300 }}>{t}</div>)}
        </div>
        <div style={{ flex:1, opacity:Math.max(0.12, 1-pos/100), transition:"opacity 0.3s", textAlign:"left" }}>
          <div style={{ fontSize:10, color:"rgba(200,160,80,0.35)", marginBottom:10, fontWeight:300, letterSpacing:1.5 }}>מצב כלי</div>
          {tool.map((t,i) => <div key={i} style={{ fontSize:13, color:"rgba(220,200,170,0.7)", padding:"5px 0 5px 12px", borderLeft:"1px solid rgba(200,140,50,0.15)", marginBottom:3, fontWeight:300 }}>{t}</div>)}
        </div>
      </div>
    </div>
  );
};

const LayersDiagram = () => {
  const [a, setA] = useState(null);
  const L = [
    { id:0, label:"להשתמש", sub:"לשאול שאלה, לקבל תשובה", analogy:"דירה שכורה", w:"30%" },
    { id:1, label:"לייצר", sub:"לאמן, לאפיין, לשייף כלים משלך", analogy:"בניין", w:"60%" },
    { id:2, label:"לחבר", sub:"טריגרים, זרימות, אינטגרציה בין מערכות", analogy:"תשתית עירונית", w:"100%" },
  ];
  return (
    <div style={{ margin:"32px 0", display:"flex", flexDirection:"column", gap:4 }}>
      {L.map(l => (
        <div key={l.id} onClick={()=>setA(a===l.id?null:l.id)}
          className="afa-glass afa-glass-hover" style={{
            padding: a===l.id ? "22px 24px":"16px 24px", borderRadius:12, cursor:"pointer",
            transition:"all 0.4s ease", background: a===l.id ? `rgba(180,120,40,${0.04+l.id*0.04})` : undefined,
            borderColor: a===l.id ? "rgba(200,140,50,0.2)" : undefined
          }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:15, fontWeight: a===l.id?500:300, color: a===l.id?"rgba(220,180,100,0.95)":"rgba(220,200,170,0.45)", transition:"all 0.3s" }}>{l.label}</span>
            <span style={{ fontSize:10, color:"rgba(200,160,80,0.25)", fontWeight:300, letterSpacing:1 }}>{l.analogy}</span>
          </div>
          {a===l.id && (
            <div className="afa-slide-in">
              <div style={{ marginTop:12, fontSize:13, color:"rgba(220,200,170,0.6)", lineHeight:1.8, fontWeight:300 }}>{l.sub}</div>
              <div style={{ marginTop:10, height:3, borderRadius:2, background:"rgba(200,160,80,0.06)", overflow:"hidden" }}>
                <div style={{ height:"100%", width:l.w, background:"linear-gradient(90deg, rgba(200,140,50,0.4), rgba(200,140,50,0.1))", borderRadius:2, transition:"width 0.6s ease" }}/>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ModeCircles = () => {
  const [m, setM] = useState(null);
  const M = [
    { id:"chat", label:"Chat", action:"לחקור", desc:"שיחה, חשיבה, הכוונה", level:"פסיבי", link:"https://claude.ai" },
    { id:"cowork", label:"Cowork", action:"ליצור", desc:"מסמכים, ידע, שיתוף פעולה", level:"הדדי", link:"https://claude.ai" },
    { id:"code", label:"Code", action:"לבנות", desc:"קוד, מערכות, ביצוע", level:"אקטיבי", link:"https://docs.anthropic.com/en/docs/claude-code" },
  ];
  return (
    <div style={{ margin:"32px 0", display:"flex", gap:12 }}>
      {M.map(x => {
        const on = m===x.id;
        return (
          <div key={x.id} onClick={()=>setM(on?null:x.id)}
            className={`afa-glass afa-glass-hover ${on?"afa-pulse-glow":""}`}
            style={{ flex:1, padding:"28px 16px", textAlign:"center", borderRadius:16, cursor:"pointer",
              transition:"all 0.4s", background: on?"rgba(180,120,40,0.08)":undefined,
              borderColor: on?"rgba(200,140,50,0.2)":undefined }}>
            <div style={{ fontSize:10, color:"rgba(200,160,80,0.3)", marginBottom:8, fontWeight:300, letterSpacing:2.5 }}>{x.label}</div>
            <div style={{ fontSize:18, fontWeight:on?500:300, color:on?"rgba(220,180,100,0.95)":"rgba(220,200,170,0.4)", transition:"all 0.3s", letterSpacing:1 }}>{x.action}</div>
            {on && (
              <div className="afa-slide-in">
                <div style={{ fontSize:12, color:"rgba(220,200,170,0.5)", marginTop:10, fontWeight:300, lineHeight:1.7 }}>{x.desc}</div>
                <div style={{ fontSize:10, color:"rgba(200,140,50,0.3)", marginTop:6, letterSpacing:1.5, fontWeight:300 }}>{x.level}</div>
                <a href={x.link} target="_blank" rel="noreferrer" className="afa-link-pill" style={{ marginTop:14, display:"inline-flex", fontSize:10 }}>
                  נסו עכשיו
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const IntuitionWidget = () => {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="afa-glass" style={{ margin:"32px 0", padding:0, borderRadius:16, overflow:"hidden", cursor:"pointer" }}
      onClick={()=>setRevealed(!revealed)}>
      <div style={{ padding:"28px 28px 20px", borderBottom: revealed ? "1px solid rgba(200,150,60,0.06)" : "none" }}>
        <div style={{ fontSize:13, color:"rgba(220,200,170,0.5)", fontWeight:300, lineHeight:1.8, marginBottom:12 }}>
          אם אינטואיציה = זיהוי דפוסים + ניסיון מצטבר...
        </div>
        <div style={{ fontSize:20, fontWeight:500, color:"rgba(220,180,100,0.9)", letterSpacing:0.5 }}>
          ...אז ל-AI יש יותר ניסיון מכל אדריכל שחי אי פעם.
        </div>
      </div>
      {revealed && (
        <div className="afa-slide-in" style={{ padding:"20px 28px 28px", background:"rgba(180,120,40,0.04)" }}>
          <div style={{ fontSize:14, color:"rgba(220,200,170,0.55)", fontWeight:300, lineHeight:1.9 }}>
            אז מה נשאר לנו? לא אינטואיציה — <span style={{ color:"rgba(220,180,100,0.8)", fontWeight:400 }}>כוונה</span>.
            {"\n"}AI לא רוצה שום דבר. אין לו עמדה. אין לו את ה"משהו פה לא נכון" שגורם להתחיל מחדש.
            {"\n\n"}ההבדל הוא לא מי יודע יותר. ההבדל הוא מי מחליט מה צריך להיות.
          </div>
        </div>
      )}
      <div style={{ padding:"8px 28px 14px", textAlign:"center" }}>
        <span style={{ fontSize:10, color:"rgba(200,160,80,0.2)", fontWeight:300 }}>{revealed ? "לחצי לסגור" : "לחצי לחשוף"}</span>
      </div>
    </div>
  );
};

const RoleCards = () => {
  const roles = [
    { title:"לשאול", desc:"את השאלה הנכונה. AI לא יודע מה הוא לא יודע." },
    { title:"לשפוט", desc:"רלוונטיות. מתוך עשרים תובנות — אחת שווה זהב." },
    { title:"להחליט", desc:"זה הכיוון. עם האחריות שלה." },
  ];
  return (
    <div style={{ display:"flex", gap:12, margin:"32px 0" }}>
      {roles.map((r,i) => (
        <div key={i} className="afa-glass afa-glass-hover" style={{
          flex:1, padding:"24px 20px", borderRadius:14, textAlign:"center",
          transition:"all 0.3s"
        }}>
          <div style={{ fontSize:22, fontWeight:500, color:"rgba(220,180,100,0.85)", marginBottom:10, letterSpacing:0.5 }}>{r.title}</div>
          <div style={{ fontSize:12, color:"rgba(220,200,170,0.45)", fontWeight:300, lineHeight:1.7 }}>{r.desc}</div>
        </div>
      ))}
    </div>
  );
};

/* ─── MAIN APP ─── */
export default function AIforArchitects() {
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const [tab, setTab] = useState(0);
  const [sections, setSections] = useState(SECTIONS_INIT);
  const [view, setView] = useState("content");
  const [links, setLinks] = useState(LINKS_INIT);
  const [showLinks, setShowLinks] = useState(false);
  const mainRef = useRef(null);

  const upd = useCallback((i, f, v) => {
    setSections(p => p.map((s, idx) => idx===i ? {...s, [f]:v} : s));
  }, []);

  useEffect(() => {
    const h = e => {
      if (view !== "content") return;
      if (e.key === "ArrowLeft" && tab < sections.length-1) { setTab(t=>t+1); }
      if (e.key === "ArrowRight" && tab > 0) { setTab(t=>t-1); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tab, view, sections.length]);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  const sec = sections[tab];
  const interactive = {
    spectrum: <SpectrumSlider/>,
    layers: <LayersDiagram/>,
    twin: <FlipCards/>,
    modes: <ModeCircles/>,
    intuition: <IntuitionWidget/>,
    role: <RoleCards/>,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="afa-root" dir="rtl" style={{
        height:"100vh", overflow:"hidden", display:"flex", flexDirection:"column",
        background:"#0a0d10", color:"rgba(220,200,170,0.85)",
        fontFamily:"'Inter', 'Segoe UI', sans-serif", position:"relative"
      }}>
        {/* Atmospheric BG */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 130% 80% at 50% -10%, rgba(25,40,50,0.7) 0%, transparent 55%)" }}/>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 90% 50% at 20% 25%, rgba(20,35,45,0.5) 0%, transparent 45%)" }}/>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 45% at 80% 20%, rgba(18,32,42,0.4) 0%, transparent 40%)" }}/>
          <div style={{ position:"absolute", bottom:-80, left:"20%", right:"20%", height:280, background:"radial-gradient(ellipse at 50% 100%, rgba(180,100,30,0.1) 0%, rgba(160,80,20,0.03) 40%, transparent 65%)", filter:"blur(35px)" }}/>
          <div style={{ position:"absolute", top:"40%", right:-80, width:250, height:350, background:"radial-gradient(ellipse at center, rgba(180,140,50,0.04) 0%, transparent 70%)", filter:"blur(45px)" }}/>
        </div>

        {/* Header */}
        <header style={{ position:"relative", zIndex:10, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 24px", borderBottom:"1px solid rgba(200,150,60,0.05)", background:"rgba(8,11,14,0.6)", backdropFilter:"blur(24px)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <button onClick={() => navigate("/")} className="afa-mode-pill off" style={{ fontSize:10, padding:"5px 14px" }}>
              &larr; מרכז למידה
            </button>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"rgba(220,180,100,0.85)", letterSpacing:1 }}>AI לאדריכלים</div>
              <div style={{ fontSize:10, color:"rgba(200,160,80,0.22)", marginTop:2, fontWeight:300, letterSpacing:0.5 }}>מכלי לשותף — שינוי תפיסה</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button onClick={()=>setShowLinks(!showLinks)} className={`afa-mode-pill ${showLinks?"on":"off"}`}>קישורים</button>
            <button onClick={()=>setView(view==="prompts"?"content":"prompts")} className={`afa-mode-pill ${view==="prompts"?"on":"off"}`}>
              {view==="prompts"?"תוכן":"פרומפטים"}
            </button>
            <button onClick={()=>setIsEdit(!isEdit)} className={`afa-mode-pill ${isEdit?"on":"off"}`}>
              {isEdit?"תצוגה":"עריכה"}
            </button>
          </div>
        </header>

        {/* Links Bar */}
        {showLinks && (
          <div className="afa-slide-in" style={{ position:"relative", zIndex:9, display:"flex", gap:8, padding:"10px 24px", borderBottom:"1px solid rgba(200,150,60,0.04)", background:"rgba(8,11,14,0.4)", backdropFilter:"blur(16px)", flexWrap:"wrap", alignItems:"center" }}>
            {links.map((l,i) => (
              isEdit ? (
                <div key={i} style={{ display:"flex", gap:4, alignItems:"center" }}>
                  <input value={l.label} onChange={e=>{const n=[...links]; n[i]={...n[i], label:e.target.value}; setLinks(n);}}
                    style={{ width:80, padding:"4px 8px", fontSize:11, background:"rgba(12,16,20,0.5)", border:"1px solid rgba(200,140,50,0.1)", borderRadius:8, color:"rgba(220,200,170,0.7)", fontFamily:"inherit" }}/>
                  <input value={l.url} onChange={e=>{const n=[...links]; n[i]={...n[i], url:e.target.value}; setLinks(n);}}
                    style={{ width:160, padding:"4px 8px", fontSize:10, background:"rgba(12,16,20,0.5)", border:"1px solid rgba(200,140,50,0.1)", borderRadius:8, color:"rgba(220,200,170,0.5)", fontFamily:"monospace", direction:"ltr" }}/>
                </div>
              ) : (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" className="afa-link-pill" title={l.desc}>{l.label}</a>
              )
            ))}
            {isEdit && (
              <button onClick={()=>setLinks([...links, {label:"חדש", url:"https://", desc:""}])}
                className="afa-mode-pill off" style={{ fontSize:10, padding:"4px 12px" }}>+</button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative", zIndex:1 }}>
          {view === "prompts" ? (
            <div ref={mainRef} style={{ flex:1, overflow:"auto", padding:"40px 48px", maxWidth:760, margin:"0 auto" }}>
              <div style={{ fontSize:17, fontWeight:400, color:"rgba(220,180,100,0.85)", marginBottom:4, letterSpacing:1 }}>פרומפטים להמחשה</div>
              <div style={{ fontSize:11, color:"rgba(200,160,80,0.25)", marginBottom:36, fontWeight:300 }}>Midjourney — העתיקי והדביקי</div>
              {PROMPTS.map((p,i) => (
                <div key={p.id} className="afa-glass afa-slide-in" style={{ marginBottom:16, padding:28, borderRadius:16, animationDelay:`${i*80}ms`, boxShadow:"0 4px 30px rgba(0,0,0,0.25)" }}>
                  <div style={{ fontSize:14, fontWeight:400, color:"rgba(220,180,100,0.8)", marginBottom:6 }}>{p.title}</div>
                  <div style={{ fontSize:12, color:"rgba(220,200,170,0.45)", marginBottom:18, lineHeight:1.7, fontWeight:300 }}>{p.hook}</div>
                  <div style={{ fontSize:10.5, color:"rgba(220,200,170,0.3)", background:"rgba(0,0,0,0.25)", padding:"14px 16px", borderRadius:10, lineHeight:1.9, direction:"ltr", textAlign:"left", fontFamily:"'SF Mono','Fira Code',monospace", border:"1px solid rgba(200,150,60,0.03)", marginBottom:14, fontWeight:300 }}>{p.prompt}</div>
                  <CopyBtn text={p.prompt}/>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Side Nav */}
              <nav style={{ width:170, flexShrink:0, padding:"24px 0", borderLeft:"1px solid rgba(200,150,60,0.03)", background:"rgba(8,11,14,0.25)", backdropFilter:"blur(12px)", overflow:"auto" }}>
                {sections.map((s,i) => (
                  <button key={s.id} onClick={()=>setTab(i)} className={`afa-nav-btn ${i===tab?"active":""}`}>{s.tab}</button>
                ))}
              </nav>

              {/* Main */}
              <main ref={mainRef} style={{ flex:1, overflow:"auto", padding:"44px 52px 80px", maxWidth:700 }}>
                {/* Progress */}
                <div style={{ display:"flex", gap:5, marginBottom:44 }}>
                  {sections.map((_,i) => (
                    <div key={i} onClick={()=>setTab(i)} style={{
                      flex:1, height:2, borderRadius:1, cursor:"pointer", transition:"all 0.5s",
                      background: i<=tab ? "linear-gradient(90deg, rgba(200,140,50,0.45), rgba(180,100,30,0.15))" : "rgba(200,160,80,0.04)",
                      boxShadow: i<=tab ? "0 0 6px rgba(200,140,50,0.08)" : "none"
                    }}/>
                  ))}
                </div>

                <div key={sec.id} className="afa-slide-in">
                  {isEdit ? (
                    <textarea className="afa-edit-area" value={sec.headline} onChange={e=>upd(tab,"headline",e.target.value)}
                      style={{ fontSize:22, fontWeight:400, color:"rgba(220,180,100,0.9)", lineHeight:1.6, minHeight:90, letterSpacing:0.5 }}/>
                  ) : (
                    <h1 style={{ fontSize:22, fontWeight:400, color:"rgba(220,180,100,0.9)", lineHeight:1.6, whiteSpace:"pre-line", letterSpacing:0.5, textShadow:"0 0 40px rgba(200,140,50,0.06)" }}>{sec.headline}</h1>
                  )}

                  <div style={{ width:45, height:1, margin:"28px 0", background:"linear-gradient(90deg, rgba(200,140,50,0.35), transparent)", boxShadow:"0 0 10px rgba(200,140,50,0.06)" }}/>

                  {isEdit ? (
                    <textarea className="afa-edit-area" value={sec.body} onChange={e=>upd(tab,"body",e.target.value)}
                      style={{ fontSize:14, minHeight:180 }}/>
                  ) : (
                    <div style={{ fontSize:14, lineHeight:2, color:"rgba(220,200,170,0.6)", whiteSpace:"pre-line", fontWeight:300, letterSpacing:0.2 }}>{sec.body}</div>
                  )}

                  {!isEdit && interactive[sec.id]}

                  {isEdit ? (
                    <textarea className="afa-edit-area" value={sec.accent} onChange={e=>upd(tab,"accent",e.target.value)}
                      style={{ fontSize:13, minHeight:70, marginTop:24, color:"rgba(200,160,80,0.55)" }}/>
                  ) : (
                    <div style={{ marginTop:32, padding:"22px 24px", background:"rgba(12,16,20,0.35)", backdropFilter:"blur(14px)", borderRadius:12, borderRight:"2px solid rgba(200,140,50,0.12)", fontSize:13, lineHeight:1.9, color:"rgba(200,160,80,0.45)", whiteSpace:"pre-line", fontWeight:300, fontStyle:"italic", letterSpacing:0.3 }}>{sec.accent}</div>
                  )}

                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:48, paddingTop:20, borderTop:"1px solid rgba(200,150,60,0.03)" }}>
                    <button disabled={tab===0} onClick={()=>setTab(tab-1)}
                      className="afa-mode-pill off"
                      style={{ opacity:tab===0?0.3:1, cursor:tab===0?"default":"pointer" }}>הקודם</button>
                    <span style={{ fontSize:10, color:"rgba(200,160,80,0.12)", alignSelf:"center", fontWeight:300, letterSpacing:3 }}>{tab+1} / {sections.length}</span>
                    <button disabled={tab===sections.length-1} onClick={()=>setTab(tab+1)}
                      className="afa-mode-pill off"
                      style={{ opacity:tab===sections.length-1?0.3:1, cursor:tab===sections.length-1?"default":"pointer" }}>הבא</button>
                  </div>
                </div>
              </main>
            </>
          )}
        </div>
      </div>
    </>
  );
}

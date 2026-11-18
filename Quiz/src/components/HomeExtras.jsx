import { Link } from "react-router-dom";
import "./HomeExtras.css";

const TIPS = [
  { tag: "MS Excel", title: "Turant save", text: "Ctrl + S dabao. Kaam karte waqt har kuch der mein save karne ki aadat daalo." },
  { tag: "MS Excel", title: "AutoSum ka shortcut", text: "Number wale cells ke neeche Alt + = dabane par SUM ka formula apne aap lag jata hai." },
  { tag: "MS Excel", title: "Formula = se shuru", text: "Excel mein har formula barabar (=) ke chinh se shuru hota hai, jaise =SUM(A1:A5)." },
  { tag: "MS Excel", title: "Dollar sign ka matlab", text: "$A$1 absolute reference hai, yaani formula copy karne par bhi A1 nahi badalta. Formula likhte waqt F4 dabake dollar lag jata hai." },
  { tag: "MS Excel", title: "Filter jaldi lagao", text: "Header wali row chuno aur Ctrl + Shift + L dabao, filter chalu ya band ho jata hai." },
  { tag: "MS Excel", title: "Aaj ki date aur abhi ka time", text: "Ctrl + ; (semicolon) aaj ki date daalta hai, aur Ctrl + Shift + ; abhi ka time." },
  { tag: "MS Excel", title: "Data ke aakhir tak", text: "Ctrl + Arrow key dabane par cursor data ke kinare tak kood jata hai." },
  { tag: "MS Word", title: "Bold, Italic, Underline", text: "Ctrl + B (bold), Ctrl + I (italic), Ctrl + U (underline)." },
  { tag: "MS Word", title: "Alignment ke shortcut", text: "Ctrl + L (left), Ctrl + E (center), Ctrl + R (right), Ctrl + J (justify)." },
  { tag: "MS Word", title: "Naya page", text: "Ctrl + Enter dabane par wahin se naya page shuru ho jata hai (page break)." },
  { tag: "MS Word", title: "Spelling check", text: "F7 dabake spelling aur grammar ki jaanch chalu karo." },
  { tag: "MS Word", title: "Link lagao", text: "Text chuno aur Ctrl + K dabao, hyperlink ka box khulta hai." },
  { tag: "PowerPoint", title: "Slideshow shuru", text: "F5 se pehli slide se, aur Shift + F5 se jis slide par ho wahin se slideshow shuru hota hai." },
  { tag: "PowerPoint", title: "Nayi slide aur copy", text: "Ctrl + M se nayi slide judti hai, aur Ctrl + D se chuni hui slide ya object ki copy ban jati hai." },
  { tag: "PowerPoint", title: "Screen ko kala karo", text: "Slideshow ke dauran B dabane par screen kali ho jati hai. Dobara B dabane par wapas aa jati hai." },
  { tag: "Windows", title: "Window badlo", text: "Alt + Tab se khuli hui windows ke beech jaldi badal sakte ho." },
  { tag: "Windows", title: "Screen lock", text: "Windows key + L dabake computer turant lock ho jata hai." },
  { tag: "Windows", title: "Task Manager", text: "Ctrl + Shift + Esc se Task Manager khulta hai, jahan se atke hue program band kar sakte ho." },
  { tag: "Windows", title: "Screenshot ka area", text: "Windows key + Shift + S se screen ka koi bhi hissa kaatke screenshot le sakte ho." },
  { tag: "Basics", title: "Copy, Cut, Paste", text: "Ctrl + C (copy), Ctrl + X (cut), Ctrl + V (paste), aur galti ho jaye to Ctrl + Z (undo)." },
  { tag: "Basics", title: "Kuch bhi dhoondho", text: "Ctrl + F dabake kisi bhi page ya document mein shabd dhoondh sakte ho." },
  { tag: "Python", title: "Ginti 0 se shuru", text: "Python mein list ka pehla item index 0 par hota hai, 1 par nahi. range(5) mein 0 se 4 tak ke number aate hain." },
  { tag: "Python", title: "List ya tuple", text: "List ko badal sakte ho (mutable), tuple ko nahi (immutable). Question mein yeh fark aksar puchha jata hai." },
  { tag: "HTML aur CSS", title: "Full form yaad rakho", text: "HTML = HyperText Markup Language, CSS = Cascading Style Sheets. HTML dhancha banata hai, CSS use sajata hai." },
  { tag: "HTML aur CSS", title: "Image ke saath alt", text: "<img> tag mein alt likhna achhi aadat hai. Image na khule to wahi text dikhta hai, aur screen reader bhi use padhta hai." },
];

const STEPS = [
  { n: "1", title: "Free account banao", text: "Email verify karo, bas 1 minute lagta hai." },
  { n: "2", title: "Apna exam chuno", text: "Test 1 har exam ka free hai. Timer ke saath real test jaisa anubhav lo." },
  { n: "3", title: "Result se seekho", text: "Explanation padho, galat question Mistakes Notebook mein jama karo, aur roz Daily Quiz do." },
];

const STUDY_TIPS = [
  { icon: "📖", title: "Pehle syllabus, phir test", text: "Exam ki official notification se syllabus aur pattern dekho. Jo padhna hi nahi hai uske test mat do." },
  { icon: "🔍", title: "1 test, 1 ghanta analysis", text: "Test dene se zyada kaam ka hai uska analysis. Har galat question ko samjho, phir aage badho." },
  { icon: "📒", title: "Roz 15 minute galtiyan", text: "Mistakes Notebook ka revision test roz do. Ek hi galti baar-baar karna sabse mehenga padta hai." },
  { icon: "⏱️", title: "Pehle aasan question", text: "Jo aata hai pehle karo, atke hue question par mark for review lagao aur aage badho." },
  { icon: "⚖️", title: "Negative marking ka dhyan", text: "Jahan negative marking hai, wahan andaza tabhi lagao jab kam se kam do option saaf galat lag rahe hon." },
  { icon: "🔥", title: "Roz thoda, par roz", text: "3 ghante ek din se achha hai 30 minute roz. Daily Quiz se streak banao." },
];

const dayNumber = () => Math.floor(Date.now() / 86400000);

export function HowItWorks() {
  return (
    <section className="section">
      <div className="sec-head">
        <h2>Kaise shuru karein</h2>
        <p>3 aasan step.</p>
      </div>
      <div className="hx-steps">
        {STEPS.map((s) => (
          <div key={s.n} className="hx-step">
            <span className="hx-num">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
      <p style={{ marginTop: "18px" }}>
        <Link to="/signup" className="card-btn">Free account banao</Link>
      </p>
    </section>
  );
}

export function ComputerTip() {
  const tip = TIPS[dayNumber() % TIPS.length];
  return (
    <section className="section">
      <div className="hx-tip">
        <div className="hx-tip-icon">💡</div>
        <div className="hx-tip-body">
          <span className="hx-tip-tag">Aaj ka Computer Tip | {tip.tag}</span>
          <h3>{tip.title}</h3>
          <p>{tip.text}</p>
        </div>
        <Link to="/exams?category=Computer" className="hx-tip-btn">
          Computer test do
        </Link>
      </div>
    </section>
  );
}

export function StudyTips() {
  return (
    <section className="section">
      <div className="sec-head">
        <h2>Taiyari ke 6 kaam ke tips</h2>
        <p>Chhoti aadatein, bade nateeje.</p>
      </div>
      <div className="hx-tips">
        {STUDY_TIPS.map((t) => (
          <div key={t.title} className="hx-card">
            <span className="hx-icon">{t.icon}</span>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
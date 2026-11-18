import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  Feather,
  FileText,
  Lightbulb,
  LockKeyhole,
  Menu,
  PenLine,
  RefreshCw,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { startLogin } from "@/const";

type Tone = "Clear" | "Warm" | "Direct" | "Playful";
type WorkMode = "Draft" | "Polish" | "Summarize";

const tones: Tone[] = ["Clear", "Warm", "Direct", "Playful"];
const workModes: WorkMode[] = ["Draft", "Polish", "Summarize"];

const baseDraft =
  "A calmer way to move from a half-formed thought to writing people can actually use. Quillspark helps you find the shape, sharpen the language, and keep your voice in the room.";

const modeCopy: Record<WorkMode, string> = {
  Draft: baseDraft,
  Polish:
    "Turn a rough note into crisp, confident writing without sanding off the point of view that makes it yours.",
  Summarize:
    "A concise version that keeps the main idea, the useful detail, and the momentum—without the extra noise.",
};

const capabilityCards = [
  { icon: Lightbulb, label: "Brainstorm", text: "Find the angle, hook, or next idea when the page is still blank." },
  { icon: RefreshCw, label: "Rewrite", text: "Keep the meaning. Give the sentence a cleaner, stronger shape." },
  { icon: FileText, label: "Summarize", text: "Pull the signal from notes, meetings, and long-winded drafts." },
  { icon: ArrowUpRight, label: "Expand", text: "Add context, examples, and useful detail without the bloat." },
  { icon: Check, label: "Proofread", text: "Catch the rough edges so your best thinking comes through." },
  { icon: WandSparkles, label: "Shift tone", text: "Make it warmer, sharper, more playful, or more persuasive." },
];

const useCases = [
  { tag: "01", title: "For marketers", text: "From campaign brief to copy that earns the click.", sample: "A launch note with a little more lift." },
  { tag: "02", title: "For students", text: "Turn scattered notes into an explanation you understand.", sample: "A clearer path through the hard part." },
  { tag: "03", title: "For professionals", text: "Make the important email sound as considered as the work.", sample: "Direct, thoughtful, ready to send." },
  { tag: "04", title: "For creative writers", text: "A patient collaborator for scenes, lines, and strange little sparks.", sample: "Follow the thread a little further." },
];

function Mark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "brand-mark brand-mark--small" : "brand-mark"} aria-hidden="true">
      <Feather size={small ? 16 : 19} strokeWidth={2.5} />
      <span className="brand-star">✦</span>
    </span>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<WorkMode>("Draft");
  const [tone, setTone] = useState<Tone>("Clear");
  const [prompt, setPrompt] = useState("Help me explain a complex idea without making it sound complicated.");
  const [copied, setCopied] = useState(false);
  const [showBefore, setShowBefore] = useState(true);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  useEffect(() => {
    if (showModal) document.getElementById("signup-close")?.focus();
  }, [showModal]);

  const draft = useMemo(() => {
    const tonePrefix: Record<Tone, string> = {
      Clear: "Here’s a clear starting point: ",
      Warm: "Here’s a warmer way in: ",
      Direct: "Here’s the point, plainly: ",
      Playful: "Here’s a lighter take: ",
    };
    return tonePrefix[tone] + modeCopy[mode];
  }, [mode, tone]);

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" onClick={closeMobile}>
          <Mark />
          <span>quillspark</span>
        </a>
        <nav id="main-nav" className={mobileOpen ? "main-nav main-nav--open" : "main-nav"} aria-label="Main navigation">
          <button onClick={() => { scrollToId("how-it-works"); closeMobile(); }}>How it works</button>
          <button onClick={() => { scrollToId("capabilities"); closeMobile(); }}>Capabilities</button>
          <button onClick={() => { scrollToId("use-cases"); closeMobile(); }}>Who it’s for</button>
          <button onClick={() => { scrollToId("trust"); closeMobile(); }}>Our approach</button>
        </nav>
        <div className="header-actions">
          <button className="text-button" onClick={() => startLogin()}>Sign in</button>
          <button className="button button--cobalt button--small" onClick={() => { window.location.href = "/dashboard"; }}>Open workspace <ArrowUpRight size={15} /></button>
        </div>
        <button className="mobile-menu" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="main-nav" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Your thoughts, with a little more spark.</div>
            <h1>Write what<br /><em>you mean.</em></h1>
            <p className="hero-lede">Quillspark is the AI writing partner for the messy middle between a rough thought and something worth sharing.</p>
            <div className="hero-actions">
              <button className="button button--cobalt" onClick={() => { window.location.href = "/dashboard"; }}>Start writing free <ArrowRight size={17} /></button>
              <button className="button button--paper" onClick={() => scrollToId("demo")}><span className="play-glyph">▶</span> See how it works</button>
            </div>
            <div className="hero-note"><span className="scribble-arrow">↳</span> No blank-page rituals required.</div>
          </div>
          <div className="hero-art" aria-label="Quillspark writing workspace preview">
            <div className="margin-note margin-note--top">start<br />somewhere<br /><span>✦</span></div>
            <div className="paper-card paper-card--hero">
              <div className="paper-topline"><span className="paper-dots"><i /><i /><i /></span><span>new spark / 01</span><span className="paper-status"><span /> saved</span></div>
              <div className="paper-body">
                <div className="paper-kicker">A note to self</div>
                <p className="paper-heading">The idea is there.<br /><span>The words are catching up.</span></p>
                <div className="paper-lines"><i /><i /><i /><i /><i /></div>
                <div className="paper-suggestion"><Sparkles size={15} /><span>Quillspark found 3 ways in</span><ArrowRight size={14} /></div>
              </div>
            </div>
            <div className="hero-sticker">keep<br />your<br /><b>voice</b></div>
          </div>
        </section>

        <section className="proof-strip">
          <p>Made for the moments when the words matter</p>
          <div className="proof-logos"><span>northstar</span><span>COMMON ROOM</span><span>paper/plane</span><span>field notes</span><span>ARC &amp; CO.</span></div>
        </section>

        <section className="demo section-pad" id="demo">
          <div className="section-intro section-intro--split">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> A writing room, not a robot</div><h2>Find your way<br /><em>through the draft.</em></h2></div>
            <p>Bring the half-sentence, the messy notes, the “I know what I mean” feeling. Quillspark helps you make the next useful move—then gets out of the way.</p>
          </div>
          <div className="workspace-card">
            <div className="workspace-sidebar">
              <div className="workspace-brand"><Mark small /><span>quillspark</span></div>
              <div className="workspace-nav-label">Workspace</div>
              <button className="workspace-nav workspace-nav--active"><PenLine size={15} /> New draft <span>⌘ N</span></button>
              <button className="workspace-nav"><FileText size={15} /> My writing</button>
              <div className="workspace-sidebar-bottom"><div className="avatar">AS</div><span>Alex’s space</span><ChevronDown size={14} /></div>
            </div>
            <div className="workspace-main">
              <div className="workspace-toolbar"><span className="workspace-title">Untitled draft</span><span className="workspace-saved"><span /> Auto-saved</span><button aria-label="More options">•••</button></div>
              <div className="workspace-content">
                <div className="mode-switcher" role="tablist" aria-label="Writing mode">
                  {workModes.map((item) => <button key={item} className={mode === item ? "mode-tab mode-tab--active" : "mode-tab"} onClick={() => setMode(item)} role="tab" aria-selected={mode === item}>{item}</button>)}
                </div>
                <label className="prompt-label" htmlFor="prompt">What are you working on?</label>
                <textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
                <div className="prompt-footer"><span className="prompt-context"><span className="context-dot" /> Context on</span><button className="generate-button" onClick={() => setMode(mode)}><Sparkles size={15} /> Spark a draft <span>↵</span></button></div>
                <div className="generated-divider"><span>Quillspark’s take</span><span className="generated-time">just now</span></div>
                <div className="generated-copy"><p>{draft}</p><div className="generated-actions"><div className="tone-picker"><span>tone</span>{tones.map((item) => <button key={item} className={tone === item ? "tone-pill tone-pill--active" : "tone-pill"} onClick={() => setTone(item)}>{item}</button>)}</div><button className="copy-button" onClick={copyDraft}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? "Copied" : "Copy"}</button></div></div>
              </div>
            </div>
          </div>
          <div className="demo-caption"><span className="caption-mark">✦</span> The best version is usually hiding one good question away.</div>
        </section>

        <section className="benefits section-pad" id="benefits">
          <div className="section-intro section-intro--center"><div className="eyebrow"><span className="eyebrow-dot" /> Less wrestling. More writing.</div><h2>Useful in the <em>messy middle.</em></h2><p>Quillspark brings structure to the parts of writing that usually slow you down.</p></div>
          <div className="benefit-grid">
            <article><div className="benefit-number">01</div><h3>Draft faster</h3><p>Start with momentum, not a blinking cursor. Turn a loose thought into a shape you can work with.</p><span className="benefit-doodle">→ from spark to start</span></article>
            <article><div className="benefit-number">02</div><h3>Say it clearer</h3><p>Find the sentence underneath the sentence. Make the important part easier to understand.</p><span className="benefit-doodle">✎ sharpen the point</span></article>
            <article><div className="benefit-number">03</div><h3>Shift the tone</h3><p>Keep your meaning, change the feeling. Move from formal to friendly without starting over.</p><span className="benefit-doodle">↗ make it sound like you</span></article>
            <article><div className="benefit-number">04</div><h3>Get unstuck</h3><p>When the words won’t come, ask for a way in. A few good options can change the whole page.</p><span className="benefit-doodle">✦ follow the thread</span></article>
          </div>
        </section>

        <section className="capabilities section-pad" id="capabilities">
          <div className="section-intro section-intro--split"><div><div className="eyebrow"><span className="eyebrow-dot" /> A toolbox for the in-between</div><h2>One thought.<br /><em>Many ways forward.</em></h2></div><p>Not a hundred buttons. Just the right ones, close to the words, when you need them.</p></div>
          <div className="capability-grid">{capabilityCards.map(({ icon: Icon, label, text }) => <article className="capability-card" key={label}><div className="capability-icon"><Icon size={20} /></div><h3>{label}</h3><p>{text}</p><ArrowUpRight className="capability-arrow" size={17} /></article>)}</div>
        </section>

        <section className="how section-pad" id="how-it-works">
          <div className="section-intro section-intro--center"><div className="eyebrow"><span className="eyebrow-dot" /> Three small steps</div><h2>Make the next<br /><em>useful move.</em></h2></div>
          <div className="steps"><article><span className="step-index">01</span><div className="step-illustration step-illustration--one"><span>your context</span><span>your goal</span><span>your voice</span><b>+</b></div><h3>Bring the context</h3><p>Paste the note, name the audience, or simply say what you’re trying to do.</p></article><article><span className="step-index">02</span><div className="step-illustration step-illustration--two"><span>make it clearer</span><span>make it warmer</span><b>✦</b></div><h3>Shape it together</h3><p>Choose a direction, compare options, and keep the parts that feel like you.</p></article><article><span className="step-index">03</span><div className="step-illustration step-illustration--three"><span>copy</span><span>export</span><span>share</span><b>↗</b></div><h3>Send with confidence</h3><p>Polish the edges, check the details, and take your words where they need to go.</p></article></div>
        </section>

        <section className="use-cases section-pad" id="use-cases">
          <div className="section-intro section-intro--split"><div><div className="eyebrow"><span className="eyebrow-dot" /> Different work. Same spark.</div><h2>For the work<br /><em>you care about.</em></h2></div><p>Quillspark adapts to the writer, not the other way around.</p></div>
          <div className="use-case-list">{useCases.map((item) => <article key={item.tag} className="use-case-row"><span className="use-case-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.text}</p><span className="use-case-sample">“{item.sample}”</span><ArrowUpRight size={19} /></article>)}</div>
        </section>

        <section className="comparison section-pad"><div className="comparison-header"><div className="eyebrow"><span className="eyebrow-dot" /> A little proof, in plain sight</div><h2>Same thought.<br /><em>Better shape.</em></h2><div className="comparison-toggle"><button className={showBefore ? "toggle-active" : ""} aria-pressed={showBefore} onClick={() => setShowBefore(true)}>Before</button><button className={!showBefore ? "toggle-active" : ""} aria-pressed={!showBefore} onClick={() => setShowBefore(false)}>After</button></div></div><div className="comparison-card"><div className="comparison-label">{showBefore ? "The rough note" : "The Quillspark version"}</div><p className={showBefore ? "comparison-text comparison-text--before" : "comparison-text"}>{showBefore ? "I think maybe the main thing is that people want tools that help them write better but not make them feel like the writing isn't theirs?" : "People want help writing better—not a machine that writes over them. Quillspark gives you momentum while keeping the words recognizably yours."}</p><div className="comparison-footer"><span>{showBefore ? "one thought, still finding its shape" : "clearer, without losing the point of view"}</span><button onClick={() => setShowBefore(!showBefore)}>{showBefore ? "See the shift →" : "See the rough note →"}</button></div></div></section>

        <section className="trust section-pad" id="trust"><div className="trust-copy"><div className="eyebrow"><span className="eyebrow-dot" /> A collaborator, not a replacement</div><h2>Your voice<br /><em>stays yours.</em></h2><p>Quillspark is built to help you think, not think for you. Every suggestion is an invitation. You decide what stays, what changes, and what leaves the page.</p><div className="trust-points"><div><LockKeyhole size={18} /><span><b>Private by default.</b><br />Your work is yours to manage.</span></div><div><Check size={18} /><span><b>Always in control.</b><br />Review, revise, or ignore every suggestion.</span></div></div></div><div className="trust-card"><div className="trust-card-note">a note from the margin</div><div className="trust-quote">“The useful thing about AI isn’t that it has the words. It’s that it can help you find yours.”</div><div className="trust-signature">— the Quillspark team <span>✦</span></div></div></section>

        <section className="testimonial section-pad"><div className="testimonial-mark">“</div><blockquote>Quillspark feels less like handing your work to a machine and more like inviting a really good editor into the room.</blockquote><div className="testimonial-byline"><span className="avatar avatar--large">MR</span><span><b>Maya R.</b><br />Content strategist · prototype quote</span></div></section>

        <section className="final-cta section-pad"><div className="final-cta-star">✦</div><div className="eyebrow"><span className="eyebrow-dot" /> The page is waiting</div><h2>Make something<br /><em>worth reading.</em></h2><p>Start with the thought you already have. We’ll help you find the words around it.</p><button className="button button--ink" onClick={() => setShowModal(true)}>Try Quillspark free <ArrowRight size={17} /></button><div className="cta-note">No credit card. No blank-page rituals.</div></section>
      </main>

      <footer className="site-footer"><a className="wordmark wordmark--footer" href="#top"><Mark small /><span>quillspark</span></a><p>From rough thought to right words.</p><div className="footer-links"><button onClick={() => scrollToId("how-it-works")}>How it works</button><button onClick={() => scrollToId("capabilities")}>Capabilities</button><button onClick={() => scrollToId("trust")}>Privacy</button><button onClick={() => setShowModal(true)}>Contact</button></div><span className="footer-copy">© 2026 Quillspark</span></footer>

      {showModal && <div className="modal-backdrop" role="presentation" onClick={() => setShowModal(false)}><div className="signup-modal" role="dialog" aria-modal="true" aria-labelledby="signup-title" aria-describedby="signup-description" onClick={(event) => event.stopPropagation()}><button id="signup-close" type="button" className="modal-close" aria-label="Close sign-up dialog" onClick={() => setShowModal(false)}><X size={18} /></button><Mark /><div className="eyebrow"><span className="eyebrow-dot" /> Early access</div><h2 id="signup-title">A little more spark<br /><em>is on the way.</em></h2><p id="signup-description">Quillspark is in prototype. Leave your email and we’ll let you know when the writing room opens.</p><label className="sr-only" htmlFor="signup-email">Email address</label><input id="signup-email" type="email" placeholder="you@example.com" /><button type="button" className="button button--cobalt" onClick={() => setShowModal(false)}>Join the list <ArrowRight size={17} /></button><span className="modal-fineprint">Prototype experience · No spam, ever.</span></div></div>}
    </div>
  );
}

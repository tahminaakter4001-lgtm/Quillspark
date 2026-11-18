import { useEffect, useMemo, useState } from "react";
import ThreadlineAutomation from "@/components/ThreadlineAutomation";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  Clock3,
  FileCheck2,
  FileText,
  Flag,
  Layers3,
  Link2,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Network,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type View = "Decisions" | "Owners" | "Next steps";
const views: View[] = ["Decisions", "Owners", "Next steps"];

const viewContent: Record<View, { label: string; title: string; body: string; meta: string }[]> = {
  Decisions: [
    { label: "Decision 01", title: "Pilot the new onboarding flow with 12 customers.", body: "The team agreed to test the shorter path before investing in a full rebuild.", meta: "confirmed · 9 min ago" },
    { label: "Decision 02", title: "Keep the weekly review on Thursdays.", body: "Thursday gives support and product one shared window to bring fresh signals.", meta: "needs review · 14 min ago" },
  ],
  Owners: [
    { label: "Suggested owner", title: "Mina to draft the pilot brief.", body: "Threadline found a clear commitment in the closing five minutes of the conversation.", meta: "confirm owner · due Fri" },
    { label: "Suggested owner", title: "Jon to pull support themes.", body: "The source mentions the handoff, but the deadline still needs a human check.", meta: "needs review · due next week" },
  ],
  "Next steps": [
    { label: "Next step 01", title: "Share the pilot brief with customer success.", body: "A clean handoff gives the pilot a place to start and a person to ask questions.", meta: "ready to share · 2 tasks" },
    { label: "Next step 02", title: "Bring the top three objections to Thursday’s review.", body: "Capture the open thread so the next meeting starts with evidence, not a recap.", meta: "open · 1 source" },
  ],
};

const useCases = [
  { tag: "01", title: "Project leads", text: "Keep the decision log current without becoming the team’s full-time note taker.", icon: Flag },
  { tag: "02", title: "Product + design", text: "Hold onto the why behind a choice, not just the final answer.", icon: Network },
  { tag: "03", title: "Operations teams", text: "Make handoffs, recurring reviews, and dependencies easier to follow.", icon: Layers3 },
  { tag: "04", title: "Founders + managers", text: "Turn a room full of context into the few moves that matter next.", icon: UsersRound },
];

function ThreadlineMark() {
  return <span className="threadline-mark" aria-hidden="true"><span /><span /><span /></span>;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Threadline() {
  const [view, setView] = useState<View>("Decisions");
  const [hasRun, setHasRun] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBefore, setShowBefore] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [trendRefreshes, setTrendRefreshes] = useState(0);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  useEffect(() => {
    if (showModal) document.getElementById("threadline-modal-close")?.focus();
  }, [showModal]);

  const output = useMemo(() => viewContent[view], [view]);

  const copyRecord = async () => {
    try {
      await navigator.clipboard.writeText("Pilot the new onboarding flow with 12 customers. Mina to draft the pilot brief.");
    } catch {
      // Prototype fallback still gives visible feedback.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="threadline-shell">
      <header className="threadline-header">
        <a href="/threadline" className="threadline-wordmark"><ThreadlineMark /><span>threadline</span></a>
        <nav id="threadline-nav" className={mobileOpen ? "threadline-nav threadline-nav--open" : "threadline-nav"} aria-label="Threadline navigation">
          <button onClick={() => { scrollToId("workspace"); setMobileOpen(false); }}>See the workspace</button>
          <button onClick={() => { scrollToId("how-threadline-works"); setMobileOpen(false); }}>How it works</button>
          <button onClick={() => { scrollToId("use-cases-threadline"); setMobileOpen(false); }}>Who it’s for</button>
          <button onClick={() => { scrollToId("trust-threadline"); setMobileOpen(false); }}>Our approach</button>
        </nav>
        <div className="threadline-header-actions"><button className="threadline-text-button" onClick={() => setShowModal(true)}>Sign in</button><button className="threadline-button threadline-button--orange threadline-button--small" onClick={() => setShowModal(true)}>Join early access <ArrowUpRight size={14} /></button></div>
        <button className="threadline-mobile-menu" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="threadline-nav" onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <main>
        <section className="threadline-hero">
          <div className="threadline-hero-copy"><div className="threadline-eyebrow"><span /> A better memory for the work</div><h1>Turn the talk<br />into a <em>thread.</em></h1><p>Threadline turns meeting notes, transcripts, and follow-ups into the decisions, owners, and next steps your team can actually use.</p><div className="threadline-actions"><button className="threadline-button threadline-button--orange" onClick={() => setShowModal(true)}>Join the early list <ArrowRight size={16} /></button><button className="threadline-button threadline-button--quiet" onClick={() => scrollToId("workspace")}><span className="threadline-play">▶</span> See the workspace</button></div><div className="threadline-hero-note"><ArrowDownRight size={18} /> No more “what did we decide?”</div></div>
          <div className="threadline-hero-visual"><div className="threadline-hero-label">meeting / 042</div><div className="threadline-note-stack"><div className="threadline-note threadline-note--back"><span>raw notes</span><i /><i /><i /><i /></div><div className="threadline-note threadline-note--front"><div className="threadline-note-top"><span><span className="threadline-live-dot" /> sorted thread</span><span>09:42</span></div><h3>Q3 onboarding review</h3><div className="threadline-note-row"><span className="threadline-note-icon threadline-note-icon--orange"><Check size={13} /></span><span><b>2 decisions</b><br /><small>ready to share</small></span></div><div className="threadline-note-row"><span className="threadline-note-icon threadline-note-icon--mint"><UserRound size={13} /></span><span><b>2 owners</b><br /><small>awaiting confirmation</small></span></div><div className="threadline-note-row"><span className="threadline-note-icon threadline-note-icon--ink"><Clock3 size={13} /></span><span><b>3 next steps</b><br /><small>kept in view</small></span></div><div className="threadline-note-footer"><span>source context attached</span><Link2 size={13} /></div></div></div><div className="threadline-hero-scribble">keep<br /><strong>the thread</strong><br />moving <span>✦</span></div></div>
        </section>

        <section className="threadline-signal-strip"><p>Less recap. More follow-through.</p><div><span>DECISIONS</span><span>OWNERS</span><span>NEXT STEPS</span><span>CONTEXT</span></div></section>

        <section className="threadline-workspace-section" id="workspace"><div className="threadline-section-intro threadline-section-intro--split"><div><div className="threadline-eyebrow"><span /> A decision workspace</div><h2>Give the meeting<br />a <em>second life.</em></h2></div><p>Threadline finds the signal in the conversation and lays it out where the team can review, confirm, and move.</p></div><div className="threadline-workspace-card"><aside className="threadline-sidebar"><div className="threadline-sidebar-brand"><ThreadlineMark /><span>threadline</span></div><span className="threadline-sidebar-label">Current project</span><button className="threadline-project"><span className="threadline-project-dot" /> Atlas onboarding <ChevronDown size={14} /></button><span className="threadline-sidebar-label threadline-sidebar-label--spaced">This week</span><button className="threadline-sidebar-link threadline-sidebar-link--active"><FileCheck2 size={15} /> Q3 onboarding review <span>3</span></button><button className="threadline-sidebar-link"><MessageSquareText size={15} /> Open threads <span>4</span></button><button className="threadline-sidebar-link"><Search size={15} /> Decision log</button><div className="threadline-sidebar-bottom"><span className="threadline-avatar">AS</span><span>Alex’s workspace</span><ChevronDown size={13} /></div></aside><div className="threadline-workspace-main"><div className="threadline-workspace-toolbar"><div><span className="threadline-toolbar-kicker">Tuesday, October 14 · 45 min</span><h3>Q3 onboarding review</h3></div><div className="threadline-toolbar-actions"><span className="threadline-saved"><span /> Saved</span><button aria-label="More options">•••</button></div></div><div className="threadline-workspace-body"><div className="threadline-input-bar"><div><span className="threadline-input-label"><Sparkles size={14} /> Threadline is ready</span><p>{hasRun ? "Your conversation has been sorted into a reviewable thread." : "Paste notes or a transcript to see the thread take shape."}</p></div><button className="threadline-run-button" onClick={() => setHasRun(true)}>{hasRun ? <Check size={14} /> : <Sparkles size={14} />}{hasRun ? "Sorted" : "Sort this meeting"}<span>↵</span></button></div><div className="threadline-tabs" role="tablist" aria-label="Threadline outputs">{views.map((item) => <button key={item} className={view === item ? "threadline-tab threadline-tab--active" : "threadline-tab"} onClick={() => setView(item)} role="tab" aria-selected={view === item} aria-controls="threadline-output-list">{item}<span>{item === "Decisions" ? 2 : item === "Owners" ? 2 : 3}</span></button>)}</div><div className="threadline-output-list" id="threadline-output-list" role="tabpanel">{output.map((item, index) => <article className="threadline-output-card" key={item.title}><div className="threadline-output-index">0{index + 1}</div><div className="threadline-output-content"><span className="threadline-output-label">{item.label}</span><h4>{item.title}</h4><p>{item.body}</p><div className="threadline-output-meta"><span className={item.meta.includes("needs") ? "threadline-status threadline-status--review" : "threadline-status"}>{item.meta.includes("needs") ? <Flag size={11} /> : <Check size={11} />}{item.meta}</span><button><Link2 size={12} /> source</button></div></div><button className="threadline-output-more" aria-label="Open output item"><ArrowUpRight size={16} /></button></article>)}</div><div className="threadline-workspace-footer"><span><span className="threadline-source-count">4</span> source moments attached</span><button onClick={copyRecord}>{copied ? <Check size={13} /> : <Clipboard size={13} />}{copied ? "Copied" : "Copy decision record"}</button></div></div></div></div><div className="threadline-caption"><span>✦</span> AI suggestions stay suggestions until someone on the team says “yes.”</div></section>

        <section className="threadline-benefits"><div className="threadline-section-intro threadline-section-intro--center"><div className="threadline-eyebrow"><span /> The useful part after the useful part</div><h2>Keep the work<br /><em>in motion.</em></h2><p>The meeting ending should not be the same thing as the thread ending.</p></div><div className="threadline-benefit-grid"><article><span>01</span><h3>See the decision.</h3><p>Separate what the room chose from everything it considered on the way there.</p><small>make the why findable</small></article><article><span>02</span><h3>Confirm the owner.</h3><p>Suggest the next person, then make the human confirmation unmistakable.</p><small>accountability, without ambush</small></article><article><span>03</span><h3>Keep the next move.</h3><p>Turn a closing promise into a visible step the team can pick up tomorrow.</p><small>less recap, more follow-through</small></article></div></section>

        <section className="threadline-capabilities"><div className="threadline-section-intro threadline-section-intro--split"><div><div className="threadline-eyebrow"><span /> A calmer kind of AI</div><h2>Signal, not<br /><em>more noise.</em></h2></div><p>Threadline is built around the structure teams need after a meeting—not every word that happened inside it.</p></div><div className="threadline-capability-grid"><article><div className="threadline-capability-icon"><Layers3 size={19} /></div><h3>Sort the signal</h3><p>Find decisions, questions, owners, and next steps without asking everyone to read the whole transcript.</p><ArrowUpRight size={16} /></article><article><div className="threadline-capability-icon"><Link2 size={19} /></div><h3>Trace the source</h3><p>Keep a path back to the moment that supports the suggestion, so context is never a dead end.</p><ArrowUpRight size={16} /></article><article><div className="threadline-capability-icon"><UserRound size={19} /></div><h3>Confirm the human</h3><p>Make it clear who owns the next move and let the right person edit, confirm, or dismiss it.</p><ArrowUpRight size={16} /></article><article><div className="threadline-capability-icon"><FileText size={19} /></div><h3>Share the record</h3><p>Turn the reviewed thread into a clean update for the people who were not in the room.</p><ArrowUpRight size={16} /></article></div></section>

        <section className="threadline-how" id="how-threadline-works"><div className="threadline-section-intro threadline-section-intro--center"><div className="threadline-eyebrow"><span /> Three moves</div><h2>From room<br /><em>to rhythm.</em></h2></div><div className="threadline-steps"><article><span>01</span><div className="threadline-step-art threadline-step-art--one"><span>transcript</span><span>notes</span><span>chat</span><b>+</b></div><h3>Bring the thread.</h3><p>Paste notes, add context, or start from a transcript.</p></article><article><span>02</span><div className="threadline-step-art threadline-step-art--two"><span>decisions</span><span>owners</span><b>✦</b></div><h3>Review the signal.</h3><p>Edit the language, inspect the source, and confirm the humans.</p></article><article><span>03</span><div className="threadline-step-art threadline-step-art--three"><span>share</span><span>move</span><b>↗</b></div><h3>Keep it moving.</h3><p>Share the clean record and give tomorrow a better starting point.</p></article></div></section>

        <section className="threadline-use-cases" id="use-cases-threadline"><div className="threadline-section-intro threadline-section-intro--split"><div><div className="threadline-eyebrow"><span /> Different rooms. Same thread.</div><h2>For the work<br /><em>after the work.</em></h2></div><p>Threadline fits the way teams already meet, decide, and hand things off.</p></div><div className="threadline-use-case-list">{useCases.map(({ tag, title, text, icon: Icon }) => <article key={tag}><span className="threadline-use-case-tag">{tag}</span><div className="threadline-use-case-icon"><Icon size={17} /></div><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={17} /></article>)}</div></section>

        <ThreadlineAutomation scheduleSaved={scheduleSaved} autoRefresh={autoRefresh} trendRefreshes={trendRefreshes} onSaveSchedule={() => setScheduleSaved(true)} onToggleAutoRefresh={() => setAutoRefresh((value) => !value)} onRefreshTrends={() => setTrendRefreshes((value) => value + 1)} />

        <section className="threadline-comparison"><div className="threadline-comparison-copy"><div className="threadline-eyebrow"><span /> A little proof, in plain sight</div><h2>Same meeting.<br /><em>Different morning.</em></h2><div className="threadline-toggle"><button className={showBefore ? "threadline-toggle--active" : ""} onClick={() => setShowBefore(true)}>Raw notes</button><button className={!showBefore ? "threadline-toggle--active" : ""} onClick={() => setShowBefore(false)}>Threadline</button></div></div><div className="threadline-comparison-card"><span className="threadline-comparison-label">{showBefore ? "The shared doc" : "The decision record"}</span><p>{showBefore ? "talked about shorter onboarding, Mina maybe owns brief, need to ask CS about objections, keep Thursday review?" : "Pilot the shorter onboarding flow with 12 customers. Mina to draft the pilot brief. Bring the top three objections to Thursday’s review."}</p><div><span>{showBefore ? "one thread, still tangled" : "clear enough to pick up"}</span><button onClick={() => setShowBefore(!showBefore)}>{showBefore ? "See the shift →" : "See the raw notes →"}</button></div></div></section>

        <section className="threadline-trust" id="trust-threadline"><div><div className="threadline-eyebrow"><span /> A collaborator, not an authority</div><h2>The record stays<br /><em>in your hands.</em></h2><p>Threadline can help organize the conversation. Your team decides what becomes official, who owns it, and what needs another look.</p><div className="threadline-trust-points"><div><LockKeyhole size={17} /><span><b>Private-minded by design.</b><br />Plain-language choices about your work.</span></div><div><Check size={17} /><span><b>Human-confirmed.</b><br />Suggestions do not become commitments on their own.</span></div><div><Link2 size={17} /><span><b>Context stays close.</b><br />Trace a takeaway back to its source moment.</span></div></div></div><div className="threadline-trust-card"><span>a note from the margin</span><blockquote>“The useful meeting note is not a shorter transcript. It is a better next step.”</blockquote><small>— the Threadline team <b>✦</b></small></div></section>

        <section className="threadline-testimonial"><span className="threadline-quote-mark">“</span><blockquote>Threadline makes the space between ‘we talked about it’ and ‘it’s moving’ much smaller.</blockquote><div><span className="threadline-testimonial-avatar">JR</span><span><b>Jordan R.</b><br />prototype quote · operations lead</span></div></section>

        <section className="threadline-final-cta"><div className="threadline-final-spark">✦</div><div className="threadline-eyebrow"><span /> The thread is waiting</div><h2>Make the next<br /><em>move visible.</em></h2><p>Bring the notes you already have. Threadline will help you find what the room meant to carry forward.</p><button className="threadline-button threadline-button--ink" onClick={() => setShowModal(true)}>Join Threadline early access <ArrowRight size={16} /></button><small>No claims of magic. Just a clearer way forward.</small></section>
      </main>

      <footer className="threadline-footer"><a href="/threadline" className="threadline-wordmark"><ThreadlineMark /><span>threadline</span></a><p>Turn the talk into a thread worth following.</p><div><button onClick={() => scrollToId("how-threadline-works")}>How it works</button><button onClick={() => scrollToId("trust-threadline")}>Our approach</button><button onClick={() => setShowModal(true)}>Contact</button></div><small>© 2026 Threadline · prototype</small></footer>

      {showModal && <div className="threadline-modal-backdrop" role="presentation" onClick={() => setShowModal(false)}><div className="threadline-modal" role="dialog" aria-modal="true" aria-labelledby="threadline-modal-title" aria-describedby="threadline-modal-description" onClick={(event) => event.stopPropagation()}><button id="threadline-modal-close" type="button" className="threadline-modal-close" aria-label="Close Threadline sign-up dialog" onClick={() => setShowModal(false)}><X size={18} /></button><ThreadlineMark /><div className="threadline-eyebrow"><span /> Early access</div><h2 id="threadline-modal-title">Keep the thread<br /><em>close.</em></h2><p id="threadline-modal-description">Threadline is in prototype. Leave your email and we’ll let you know when the decision workspace opens.</p><label className="sr-only" htmlFor="threadline-signup-email">Email address</label><input id="threadline-signup-email" type="email" placeholder="you@example.com" /><button type="button" className="threadline-button threadline-button--orange" onClick={() => setShowModal(false)}>Join the list <ArrowRight size={16} /></button><small>Prototype experience · No spam, ever.</small></div></div>}
    </div>
  );
}

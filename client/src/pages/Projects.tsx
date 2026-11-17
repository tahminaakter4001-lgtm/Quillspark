import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Feather,
  Layers3,
  Menu,
  Sparkles,
  Target,
  X,
} from "lucide-react";

type Category = "All" | "Product" | "Strategy" | "Brand";

type Project = {
  number: string;
  title: string;
  category: Exclude<Category, "All">;
  year: string;
  summary: string;
  outcome: string;
  tags: string[];
  accent: string;
  metric: string;
};

const categories: Category[] = ["All", "Product", "Strategy", "Brand"];

const projects: Project[] = [
  {
    number: "01",
    title: "Quillspark",
    category: "Product",
    year: "2026",
    summary: "An AI writing partner that helps people move from half-formed thoughts to language worth sharing.",
    outcome: "A clearer product story for the messy middle of writing.",
    tags: ["Product direction", "UX writing", "Prototype"],
    accent: "cobalt",
    metric: "From rough thought → right words",
  },
  {
    number: "02",
    title: "Threadline",
    category: "Product",
    year: "2026",
    summary: "A decision workspace that turns meeting notes into decisions, owners, and next steps teams can use.",
    outcome: "A calmer bridge between conversation and follow-through.",
    tags: ["Product strategy", "Systems thinking", "Launch narrative"],
    accent: "orange",
    metric: "Talk → thread → next move",
  },
  {
    number: "03",
    title: "Signal / 04",
    category: "Strategy",
    year: "2025",
    summary: "A positioning sprint for a growing team that needed one sharp point of view across product and marketing.",
    outcome: "A shared language for making better decisions faster.",
    tags: ["Positioning", "Messaging", "Workshop"],
    accent: "yellow",
    metric: "One point of view, many useful moves",
  },
  {
    number: "04",
    title: "Field Notes",
    category: "Brand",
    year: "2025",
    summary: "A flexible editorial identity for a research-led studio that wanted to feel rigorous without feeling remote.",
    outcome: "A warmer, more recognizable system for thoughtful work.",
    tags: ["Brand voice", "Identity system", "Editorial"],
    accent: "mint",
    metric: "Rigorous, with room to breathe",
  },
];

function ProjectMark() {
  return (
    <span className="projects-mark" aria-hidden="true">
      <Feather size={18} strokeWidth={2.5} />
      <span>✦</span>
    </span>
  );
}

export default function Projects() {
  const [category, setCategory] = useState<Category>("All");
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredProjects = useMemo(
    () => category === "All" ? projects : projects.filter((project) => project.category === category),
    [category],
  );

  return (
    <div className="projects-shell">
      <header className="projects-header">
        <a className="projects-wordmark" href="/" onClick={() => setMobileOpen(false)}>
          <ProjectMark />
          <span>quillspark</span>
        </a>
        <nav className={mobileOpen ? "projects-nav projects-nav--open" : "projects-nav"} aria-label="Projects navigation">
          <a href="/">Home</a>
          <a href="#selected-work" onClick={() => setMobileOpen(false)}>Selected work</a>
          <a href="#approach" onClick={() => setMobileOpen(false)}>Approach</a>
        </nav>
        <a className="projects-header-link" href="#contact">Let’s work together <ArrowUpRight size={15} /></a>
        <button className="projects-mobile-menu" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main>
        <section className="projects-hero section-pad">
          <div className="projects-hero-copy">
            <div className="projects-eyebrow"><span /> Professional projects / selected work</div>
            <h1>Good work leaves<br /><em>a useful trace.</em></h1>
            <p>Selected projects across product, strategy, and brand—built to make the important idea clearer, more useful, and easier to carry forward.</p>
            <div className="projects-hero-actions">
              <a className="projects-button projects-button--cobalt" href="#selected-work">Explore the work <ArrowRight size={16} /></a>
              <a className="projects-text-link" href="#contact">Start a conversation <ArrowUpRight size={15} /></a>
            </div>
          </div>
          <div className="projects-hero-card" aria-label="Professional projects overview">
            <div className="projects-hero-card-top"><span>selected / 2025—26</span><span className="projects-live-dot" /> <span>in motion</span></div>
            <div className="projects-hero-card-body">
              <span className="projects-card-kicker">A working principle</span>
              <p>Make the next<br /><em>useful move.</em></p>
              <div className="projects-card-lines"><i /><i /><i /><i /></div>
              <div className="projects-card-footer"><span><CheckCircle2 size={14} /> context attached</span><ArrowUpRight size={15} /></div>
            </div>
            <span className="projects-hero-note">work worth<br /><strong>following</strong> ✦</span>
          </div>
        </section>

        <section className="projects-signal-strip"><p>Work that makes the signal easier to see</p><div><span>PRODUCT</span><span>STRATEGY</span><span>BRAND</span><span>CLARITY</span></div></section>

        <section className="projects-work section-pad" id="selected-work">
          <div className="projects-section-intro">
            <div><div className="projects-eyebrow"><span /> A few things in motion</div><h2>Selected<br /><em>projects.</em></h2></div>
            <p>Each project starts with a question, finds the shape underneath it, and leaves behind something people can actually use.</p>
          </div>
          <div className="projects-filter-bar" role="tablist" aria-label="Filter projects by category">
            <span><Layers3 size={15} /> Filter by</span>
            <div>{categories.map((item) => <button key={item} className={category === item ? "projects-filter projects-filter--active" : "projects-filter"} onClick={() => setCategory(item)} role="tab" aria-selected={category === item}>{item}</button>)}</div>
            <small>{filteredProjects.length} projects</small>
          </div>
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <article className={`project-card project-card--${project.accent}`} key={project.title}>
                <div className="project-card-top"><span>{project.number}</span><span>{project.year} · {project.category}</span><ArrowUpRight size={17} /></div>
                <div className="project-card-art"><div className="project-art-orbit" /><div className="project-art-note"><span>{project.metric}</span><b>✦</b></div><div className="project-art-index">{project.number}</div></div>
                <div className="project-card-copy"><h3>{project.title}</h3><p>{project.summary}</p><div className="project-card-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="project-card-outcome"><span>Outcome</span><strong>{project.outcome}</strong></div></div>
                <button className="project-card-link">View project <ArrowRight size={15} /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="projects-approach section-pad" id="approach">
          <div className="projects-section-intro projects-section-intro--center"><div><div className="projects-eyebrow"><span /> How the work gets made</div><h2>Thoughtful in.<br /><em>Useful out.</em></h2></div><p>The best professional work is not only polished at the end. It gets clearer at every step along the way.</p></div>
          <div className="projects-process-grid"><article><span>01</span><div className="projects-process-icon"><Target size={19} /></div><h3>Find the signal</h3><p>Clarify the real question, the audience, and what a useful answer needs to change.</p></article><article><span>02</span><div className="projects-process-icon"><Sparkles size={19} /></div><h3>Shape the system</h3><p>Turn the point of view into language, structure, and decisions people can keep using.</p></article><article><span>03</span><div className="projects-process-icon"><BriefcaseBusiness size={19} /></div><h3>Make it travel</h3><p>Leave the team with a clear story, a confident artifact, and a next step that survives the meeting.</p></article></div>
        </section>

        <section className="projects-note section-pad"><div className="projects-note-mark">“</div><blockquote>Professional work should not just look finished. It should make the next decision easier.</blockquote><span>— a working note from the margin</span></section>

        <section className="projects-contact section-pad" id="contact"><div className="projects-contact-star">✦</div><div className="projects-eyebrow"><span /> Have a project in mind?</div><h2>Let’s make the<br /><em>important part clear.</em></h2><p>Bring the brief, the messy middle, or just the question you keep circling. We can start there.</p><a className="projects-button projects-button--ink" href="mailto:hello@quillspark.example">Start a conversation <ArrowUpRight size={16} /></a><small>hello@quillspark.example · selected work / 2025—26</small></section>
      </main>

      <footer className="projects-footer"><a className="projects-wordmark" href="/"><ProjectMark /><span>quillspark</span></a><p>From rough thought to right words.</p><div><a href="/">Home</a><a href="#selected-work">Projects</a><a href="#contact">Contact</a></div><small>© 2026 Quillspark</small></footer>
    </div>
  );
}

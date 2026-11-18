import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Check, Clock3, Feather, FileText, FolderKanban, MessageSquareText, Plus, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import "../dashboard.css";

const recentWork = [
  { icon: Feather, eyebrow: "Writing desk", title: "Q4 launch note", detail: "Polish · saved 18 min ago", accent: "bg-[#e7edff] text-[#2447f9]" },
  { icon: MessageSquareText, eyebrow: "Threadline", title: "Q3 onboarding review", detail: "2 decisions · 3 next steps", accent: "bg-[#dff3e7] text-[#37684c]" },
  { icon: FolderKanban, eyebrow: "Projects", title: "Professional projects", detail: "4 case studies · updated today", accent: "bg-[#fff1a8] text-[#8b6910]" },
];

const activity = [
  { label: "Decision record ready", text: "Q3 onboarding review has 2 items ready to share.", time: "9 min ago", color: "bg-[#6db486]" },
  { label: "Draft refined", text: "Your Q4 launch note is ready for one more look.", time: "18 min ago", color: "bg-[#2447f9]" },
  { label: "Workspace synced", text: "Your latest project context is available across Quillspark.", time: "Today", color: "bg-[#c4511f]" },
];

function initials(name: string | null | undefined) {
  return (name || "You").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-topbar">
          <div>
            <span className="dashboard-kicker"><span /> Your workspace</span>
            <h1>Good morning, {firstName}.</h1>
            <p>Here’s the useful shape of your work today.</p>
            <small className="dashboard-preview-note">Illustrative workspace snapshot · connect your sources to make it yours.</small>
          </div>
          <div className="dashboard-topbar-actions">
            <span className="dashboard-prototype-pill">Private workspace</span>
            <Link href="/"><Button variant="outline" size="sm">Public site <ArrowUpRight size={14} /></Button></Link>
          </div>
        </div>

        <section className="dashboard-metric-grid" aria-label="Workspace overview">
          <article className="dashboard-metric-card dashboard-metric-card--cobalt"><div className="dashboard-metric-icon"><FileText size={18} /></div><span>Drafts in motion</span><strong>12</strong><small>3 need your attention</small></article>
          <article className="dashboard-metric-card dashboard-metric-card--mint"><div className="dashboard-metric-icon"><MessageSquareText size={18} /></div><span>Threads clarified</span><strong>08</strong><small>since your last review</small></article>
          <article className="dashboard-metric-card dashboard-metric-card--yellow"><div className="dashboard-metric-icon"><TrendingUp size={18} /></div><span>Useful momentum</span><strong>+24%</strong><small>sample workspace signal</small></article>
        </section>

        <div className="dashboard-main-grid">
          <section className="dashboard-panel dashboard-panel--work"><div className="dashboard-panel-heading"><div><span className="dashboard-panel-kicker">Pick up a thread</span><h2>Recent work</h2></div><Link href="/projects" className="dashboard-panel-link">See all <ArrowUpRight size={14} /></Link></div><div className="dashboard-work-list">{recentWork.map(({ icon: Icon, eyebrow, title, detail, accent }) => <Link href={eyebrow === "Threadline" ? "/threadline" : eyebrow === "Projects" ? "/projects" : "/dashboard"} className="dashboard-work-item" key={title}><span className={`dashboard-work-icon ${accent}`}><Icon size={18} /></span><span className="dashboard-work-copy"><small>{eyebrow}</small><strong>{title}</strong><span>{detail}</span></span><ArrowUpRight size={16} className="dashboard-work-arrow" /></Link>)}</div><button className="dashboard-new-button"><Plus size={15} /> Start something new</button></section>

          <section className="dashboard-panel dashboard-panel--activity"><div className="dashboard-panel-heading"><div><span className="dashboard-panel-kicker">A little context</span><h2>Activity</h2></div><Clock3 size={17} className="dashboard-muted-icon" /></div><div className="dashboard-activity-list">{activity.map((item) => <div className="dashboard-activity-item" key={item.label}><span className={`dashboard-activity-dot ${item.color}`} /><div><strong>{item.label}</strong><p>{item.text}</p><small>{item.time}</small></div></div>)}</div></section>
        </div>

        <section className="dashboard-focus-card"><div className="dashboard-focus-mark"><Sparkles size={20} /></div><div><span className="dashboard-panel-kicker">Today’s small move</span><h2>Turn one rough idea into a useful first draft.</h2><p>Quillspark works best when you bring the half-sentence, the context, or the “I know what I mean” feeling.</p></div><Link href="/"><Button className="dashboard-focus-button">Open writing desk <ArrowUpRight size={15} /></Button></Link></section>

        <footer className="dashboard-footer"><span><span className="dashboard-user-avatar">{initials(user?.name)}</span>{user?.email || "Signed-in workspace"}</span><span className="dashboard-footer-note"><Check size={13} /> Authenticated with Manus OAuth</span></footer>
      </div>
    </DashboardLayout>
  );
}

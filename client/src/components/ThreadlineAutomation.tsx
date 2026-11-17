import { BarChart3, CalendarClock, Check, Clock3, RefreshCw, Send, Zap } from "lucide-react";

type Props = {
  scheduleSaved: boolean;
  autoRefresh: boolean;
  trendRefreshes: number;
  onSaveSchedule: () => void;
  onToggleAutoRefresh: () => void;
  onRefreshTrends: () => void;
};

export default function ThreadlineAutomation({ scheduleSaved, autoRefresh, trendRefreshes, onSaveSchedule, onToggleAutoRefresh, onRefreshTrends }: Props) {
  return (
    <section className="threadline-automation" id="automations-threadline">
      <div className="threadline-section-intro threadline-section-intro--split">
        <div>
          <div className="threadline-eyebrow"><span /> Make the thread repeatable</div>
          <h2>Set it once.<br /><em>Stay ahead.</em></h2>
        </div>
        <p>When the work has a rhythm, Threadline can keep watch between meetings—following the signals you care about and sending the right summary to the right place.</p>
      </div>
      <div className="threadline-automation-grid">
        <article className="threadline-automation-builder">
          <div className="threadline-automation-card-head"><span className="threadline-automation-icon"><Zap size={17} /></span><div><span className="threadline-automation-kicker">Automation builder</span><h3>Write the job in your own words.</h3></div><span className="threadline-prototype-tag">prototype</span></div>
          <label className="threadline-field-label" htmlFor="automation-spec">Automation specification</label>
          <textarea id="automation-spec" defaultValue="Watch onboarding keywords, summarize the meaningful shifts, and send the update to our team every morning." />
          <div className="threadline-builder-row"><label><span>Schedule</span><select defaultValue="Every morning"><option>Every morning</option><option>Every weekday</option><option>Every Monday</option></select></label><label><span>Time zone</span><select defaultValue="Dhaka · GMT+6"><option>Dhaka · GMT+6</option><option>London · GMT+0</option><option>New York · GMT-5</option></select></label></div>
          <button className="threadline-automation-save" onClick={onSaveSchedule}>{scheduleSaved ? <><Check size={14} /> Schedule saved</> : <><CalendarClock size={14} /> Build this schedule</>}</button>
          <small className="threadline-automation-footnote">Prototype only · Production would ask for connected sources and destinations before enabling.</small>
        </article>
        <article className="threadline-trends-card">
          <div className="threadline-automation-card-head"><span className="threadline-automation-icon threadline-automation-icon--mint"><BarChart3 size={17} /></span><div><span className="threadline-automation-kicker">Signal watch</span><h3>Onboarding keyword trends</h3></div><button className="threadline-refresh-button" onClick={onRefreshTrends} aria-label="Refresh keyword trends"><RefreshCw size={14} className={trendRefreshes > 0 ? "threadline-refresh-spin" : ""} /></button></div>
          <div className="threadline-trend-status"><span className="threadline-trend-live"><span /> Live watch</span><span>updated {trendRefreshes > 0 ? "just now" : "2 min ago"}</span></div>
          <div className="threadline-trend-list"><div><span>activation</span><b>+28%</b><i><em style={{ width: "78%" }} /></i></div><div><span>import flow</span><b>+16%</b><i><em style={{ width: "57%" }} /></i></div><div><span>setup time</span><b>+09%</b><i><em style={{ width: "38%" }} /></i></div></div>
          <div className="threadline-trend-footer"><label><input type="checkbox" checked={autoRefresh} onChange={onToggleAutoRefresh} /> Auto-refresh every 15 min</label><span>{autoRefresh ? "watching" : "paused"}</span></div>
        </article>
        <article className="threadline-slack-card"><div className="threadline-slack-copy"><span className="threadline-automation-icon threadline-automation-icon--orange"><Send size={17} /></span><div><span className="threadline-automation-kicker">Daily delivery</span><h3>Morning Slack summary</h3></div></div><div className="threadline-slack-preview"><div><span className="threadline-slack-avatar">T</span><span><b>Threadline bot</b><small>today at 8:00 AM</small></span></div><p><strong>Keyword watch · Oct 15</strong><br />Activation is up 28%. Three themes need a human look before the next review.</p><span className="threadline-slack-channel">#product-signals <span>↗</span></span></div><div className="threadline-slack-controls"><span><Clock3 size={13} /> Every morning · 8:00 AM</span><span className="threadline-connected"><span /> Slack connected</span></div></article>
      </div>
    </section>
  );
}

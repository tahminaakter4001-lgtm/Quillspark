import { ArrowUpRight, Bell, CheckCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "../notifications.css";

const STORAGE_KEY = "quillspark:read-notifications";

const notifications = [
  {
    id: "threadline-preview",
    label: "NEW PREVIEW",
    title: "Threadline automations are ready to explore.",
    copy: "Build a schedule in your own words and keep the useful signal moving.",
    href: "/threadline#automations-threadline",
    tone: "cobalt",
  },
  {
    id: "workspace-ready",
    label: "YOUR WORKSPACE",
    title: "Your private workspace is ready.",
    copy: "Sign in to pick up a draft, review a thread, or start something new.",
    href: "/dashboard",
    tone: "yellow",
  },
] as const;

function readStoredIds() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(readStoredIds);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const markRead = (id: string) => {
    setReadIds((current) => {
      const next = Array.from(new Set([...current, id]));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markAllRead = () => {
    const next = notifications.map((notification) => notification.id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setReadIds(next);
  };

  return (
    <div className="notification-center">
      <button
        ref={triggerRef}
        type="button"
        className="notification-trigger"
        aria-label={unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : "Open notifications"}
        aria-expanded={open}
        aria-controls="notification-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={17} aria-hidden="true" />
        <span>Signals</span>
        {unreadCount > 0 && <b aria-hidden="true">{unreadCount}</b>}
      </button>

      {open && (
        <div ref={panelRef} id="notification-panel" className="notification-panel" role="dialog" aria-label="Quillspark notifications">
          <div className="notification-panel-header">
            <div><span className="notification-kicker"><span /> Quillspark signals</span><h2>Worth a look</h2></div>
            <button type="button" className="notification-close" aria-label="Close notifications" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}><X size={16} aria-hidden="true" /></button>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => {
              const isRead = readIds.includes(notification.id);
              return (
                <a key={notification.id} href={notification.href} className={`notification-item notification-item--${notification.tone}${isRead ? " notification-item--read" : ""}`} onClick={() => markRead(notification.id)}>
                  <span className="notification-item-mark"><Bell size={14} aria-hidden="true" /></span>
                  <span className="notification-item-copy"><small>{notification.label}{!isRead && <i>unread</i>}</small><strong>{notification.title}</strong><span>{notification.copy}</span><em>Open <ArrowUpRight size={12} aria-hidden="true" /></em></span>
                </a>
              );
            })}
          </div>
          <div className="notification-panel-footer">
            <span>{unreadCount ? `${unreadCount} unread signal${unreadCount === 1 ? "" : "s"}` : "All caught up"}</span>
            {unreadCount > 0 && <button type="button" onClick={markAllRead}><CheckCheck size={13} aria-hidden="true" /> Mark all read</button>}
          </div>
          <p className="notification-note">Custom in-app notifications · saved on this browser.</p>
        </div>
      )}
    </div>
  );
}

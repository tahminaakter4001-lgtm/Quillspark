import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, FilePlus2, Play, RotateCcw, Save, Trash2, Code2, Eye, TerminalSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type WorkspaceFile = { id: string; name: string; language: "html" | "css" | "javascript"; content: string };
type WorkspaceProject = { name: string; files: WorkspaceFile[]; updatedAt: string };

const STORAGE_KEY = "quillspark-sandbox-project-v1";
const starterFiles: WorkspaceFile[] = [
  { id: "html", name: "index.html", language: "html", content: '<main class="card">\n  <p class="eyebrow">QUILLSPARK SANDBOX</p>\n  <h1>Hello, creator.</h1>\n  <p>Edit the files, then select Run preview.</p>\n  <button id="demo-button">Try it</button>\n  <p id="message" aria-live="polite"></p>\n</main>' },
  { id: "css", name: "styles.css", language: "css", content: 'body { font-family: Inter, system-ui, sans-serif; background: #f4f6fb; padding: 48px; color: #17213b; }\n.card { max-width: 560px; margin: auto; padding: 36px; border-radius: 20px; background: white; box-shadow: 0 16px 48px #17213b12; }\n.eyebrow { color: #5268d8; letter-spacing: .16em; font-size: 12px; font-weight: 700; }\nbutton { border: 0; border-radius: 10px; padding: 12px 18px; color: white; background: #4259d5; cursor: pointer; }' },
  { id: "js", name: "script.js", language: "javascript", content: 'document.querySelector("#demo-button")?.addEventListener("click", () => {\n  document.querySelector("#message").textContent = "Your preview is running.";\n});' },
];

function buildPreview(files: WorkspaceFile[]) {
  const html = files.find((file) => file.language === "html")?.content ?? "";
  const css = files.filter((file) => file.language === "css").map((file) => file.content).join("\n");
  const js = files.filter((file) => file.language === "javascript").map((file) => file.content).join("\n");
  const safeCss = css.replace(/<\\/style/gi, "<\\\\/style");
  const safeJs = js.replace(/<\\/script/gi, "<\\\\/script");
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; img-src data: blob:; font-src data:"><style>' + safeCss + '</style></head><body>' + html + '<script>' + safeJs + '<\\/script></body></html>';
}

export default function SandboxWorkspace() {
  const [projectName, setProjectName] = useState("My first sandbox");
  const [files, setFiles] = useState<WorkspaceFile[]>(starterFiles);
  const [activeId, setActiveId] = useState("html");
  const [previewKey, setPreviewKey] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const activeFile = files.find((file) => file.id === activeId) ?? files[0];
  const preview = useMemo(() => buildPreview(files), [files, previewKey]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const project = JSON.parse(saved) as WorkspaceProject;
      if (Array.isArray(project.files) && project.files.length) {
        setProjectName(project.name || "My sandbox");
        setFiles(project.files);
        setActiveId(project.files[0].id);
      }
    } catch { /* Ignore an invalid local draft and keep the starter project. */ }
  }, []);

  const updateActiveFile = (content: string) => {
    setFiles((current) => current.map((file) => file.id === activeId ? { ...file, content } : file));
  };

  const saveProject = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: projectName, files, updatedAt: new Date().toISOString() }));
      toast.success("Project saved in this browser.");
    } catch {
      toast.error("Could not save this project. Browser storage may be full.");
    }
  };

  const runPreview = () => {
    setHasRun(true);
    setPreviewKey((value) => value + 1);
    toast.success("Preview refreshed.");
  };

  const addFile = () => {
    const name = newFileName.trim();
    if (!name || files.some((file) => file.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Enter a unique file name.");
      return;
    }
    const extension = name.split(".").pop()?.toLowerCase();
    const language = extension === "css" ? "css" : ["js", "mjs"].includes(extension ?? "") ? "javascript" : extension === "html" || extension === "htm" ? "html" : null;
    if (!language) { toast.error("MVP supports .html, .css and .js files."); return; }
    const file = { id: crypto.randomUUID(), name, language, content: "" } satisfies WorkspaceFile;
    setFiles((current) => [...current, file]);
    setActiveId(file.id);
    setNewFileName("");
  };

  const deleteActiveFile = () => {
    if (files.length === 1) { toast.error("A project must keep at least one file."); return; }
    const next = files.filter((file) => file.id !== activeId);
    setFiles(next);
    setActiveId(next[0].id);
  };

  const exportProject = () => {
    const payload = { name: projectName, files, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = (projectName.trim().replace(/[^a-z0-9-_]+/gi, "-") || "quillspark-project") + ".json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Project source exported.");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-primary"><Code2 size={15} /> QuillSpark Studio</div>
            <h1 className="text-3xl font-semibold tracking-tight">Sandbox Workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Write, run and preview a small web project in an isolated browser frame.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveProject}><Save size={15} className="mr-2" />Save</Button>
            <Button variant="outline" onClick={exportProject}><Download size={15} className="mr-2" />Export source</Button>
            <Button onClick={runPreview}><Play size={15} className="mr-2" />Run preview</Button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3">
          <label className="text-sm font-medium" htmlFor="sandbox-project-name">Project</label>
          <Input id="sandbox-project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} className="max-w-xs" />
          <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Browser workspace</span>
        </div>

        <div className="grid min-h-[680px] gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="flex min-h-[560px] flex-col overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><Code2 size={16} /> Files & editor</div>
              <div className="flex items-center gap-2">
                <Input aria-label="New file name" placeholder="new-file.js" value={newFileName} onChange={(event) => setNewFileName(event.target.value)} className="h-8 w-36 text-xs" onKeyDown={(event) => { if (event.key === "Enter") addFile(); }} />
                <Button size="sm" variant="outline" onClick={addFile}><FilePlus2 size={14} className="mr-1" />Add</Button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1">
              <aside className="w-40 shrink-0 border-r bg-muted/20 p-2">
                <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Project files</p>
                {files.map((file) => (
                  <button key={file.id} onClick={() => setActiveId(file.id)} className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs ${activeId === file.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <span className="font-mono">{file.language === "html" ? "◇" : file.language === "css" ? "#" : "JS"}</span><span className="truncate">{file.name}</span>
                  </button>
                ))}
              </aside>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b px-4 py-2 text-xs">
                  <span className="font-mono text-muted-foreground">{activeFile?.name}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-muted-foreground" onClick={deleteActiveFile}><Trash2 size={13} className="mr-1" />Remove</Button>
                </div>
                <Textarea aria-label={`Edit ${activeFile?.name}`} value={activeFile?.content ?? ""} onChange={(event) => updateActiveFile(event.target.value)} spellCheck={false} className="min-h-[480px] flex-1 resize-none rounded-none border-0 bg-[#101827] p-4 font-mono text-[13px] leading-6 text-slate-100 focus-visible:ring-0" />
                <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">MVP editor · HTML, CSS and JavaScript</div>
              </div>
            </div>
          </section>

          <section className="flex min-h-[560px] flex-col overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b p-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><Eye size={16} /> Live preview</div>
              <Button variant="outline" size="sm" onClick={runPreview}><RotateCcw size={13} className="mr-2" />Refresh</Button>
            </div>
            <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Preview frame · scripts isolated from dashboard</div>
            <iframe key={previewKey} ref={frameRef} title="Sandbox project preview" sandbox="allow-scripts" srcDoc={preview} className="min-h-[480px] flex-1 bg-white" />
            <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground"><TerminalSquare size={14} />{hasRun ? "Preview updated from current source." : "Select Run preview to execute your current source."}</div>
          </section>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Sandbox scope:</strong> This first release runs HTML/CSS/JavaScript inside a sandboxed iframe, saves drafts in this browser, and exports project JSON. It does not yet provide a server-side container, terminal, package installation, cloud file sync, or GitHub deployment. Do not enter secrets or sensitive data.
        </div>
      </div>
    </DashboardLayout>
  );
}

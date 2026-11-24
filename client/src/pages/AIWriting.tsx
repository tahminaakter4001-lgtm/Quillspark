import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Clipboard, Copy, FileText, Languages, PenLine, RefreshCw, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const tasks = [
  { id: "paraphrase", label: "AI Paraphraser", icon: RefreshCw },
  { id: "translate", label: "Bengali–English Translator", icon: Languages },
  { id: "grammar", label: "Grammar Checker", icon: Clipboard },
  { id: "summarize", label: "Summarizer", icon: FileText },
  { id: "expand", label: "Expand writing", icon: PenLine },
  { id: "draft", label: "Draft assistant", icon: WandSparkles },
  { id: "seo", label: "SEO optimizer", icon: Sparkles },
  { id: "headline", label: "Headline generator", icon: FileText },
  { id: "terminology-audit", label: "Terminology Audit", icon: Clipboard },
] as const;

type Task = typeof tasks[number]["id"];

export default function AIWriting() {
  const [task, setTask] = useState<Task>("paraphrase");
  const [source, setSource] = useState("");
  const [output, setOutput] = useState("");
  const [outputTask, setOutputTask] = useState<Task | null>(null);
  const [outputTruncated, setOutputTruncated] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<"auto" | "bn" | "en">("auto");
  const [targetLanguage, setTargetLanguage] = useState<"bn" | "en" | "both">("both");
  const [tone, setTone] = useState<"neutral" | "professional" | "academic" | "creative" | "journalistic" | "friendly">("professional");
  const [instructions, setInstructions] = useState("");
  const mutation = trpc.writing.process.useMutation({
    onSuccess: (result) => {
      setOutput(result.output);
      setOutputTask(result.task);
      setOutputTruncated(result.truncated);
      toast.success(result.truncated ? "Result may be incomplete. Please review and retry with shorter text." : "Your writing is ready.");
    },
    onError: (error) => toast.error(error.message || "Could not process your writing."),
  });

  const run = () => {
    if (!source.trim()) { toast.error("Add text to get started."); return; }
    mutation.mutate({ task, text: source, sourceLanguage, targetLanguage, tone, instructions: instructions.trim() || undefined });
  };

  const copyOutput = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); toast.success("Copied to clipboard."); }
    catch { toast.error("Clipboard access is unavailable in this browser."); }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6 py-4">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><Sparkles size={14} /> QUILLSPARK WRITING STUDIO</div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Writing Assistant</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Shape rough ideas into clear writing. Work in Bengali and English while keeping your meaning and voice intact.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tasks.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" disabled={mutation.isPending} onClick={() => setTask(id)} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-60 ${task === id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"}`}>
              <span className="rounded-lg bg-muted p-2"><Icon size={18} /></span><span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
            <div><h2 className="font-semibold">Your source text</h2><p className="text-sm text-muted-foreground">Paste a paragraph, draft, or notes to work on.</p></div>
            <Textarea value={source} onChange={(event) => setSource(event.target.value)} placeholder="এখানে বাংলা বা English লেখা পেস্ট করুন..." className="min-h-[260px] resize-y" maxLength={12000} />
            <div className="flex justify-between text-xs text-muted-foreground"><span>Up to 12,000 characters</span><span>{source.length.toLocaleString()} / 12,000</span></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm"><span className="font-medium">Source language</span><select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value as typeof sourceLanguage)} className="h-10 w-full rounded-md border bg-background px-3"><option value="auto">Auto detect</option><option value="bn">Bengali</option><option value="en">English</option></select></label>
              <label className="space-y-1 text-sm"><span className="font-medium">Output language</span><select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value as typeof targetLanguage)} className="h-10 w-full rounded-md border bg-background px-3"><option value="both">Preserve / Both</option><option value="bn">Bengali</option><option value="en">English</option></select></label>
              <label className="space-y-1 text-sm"><span className="font-medium">Writing tone</span><select value={tone} onChange={(e) => setTone(e.target.value as typeof tone)} className="h-10 w-full rounded-md border bg-background px-3"><option value="neutral">Neutral</option><option value="professional">Professional</option><option value="academic">Academic</option><option value="creative">Creative</option><option value="journalistic">Journalistic</option><option value="friendly">Friendly</option></select></label>
              <label className="space-y-1 text-sm"><span className="font-medium">Extra instructions</span><input value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={2000} placeholder="Paste glossary terms and audit rules here" className="h-10 w-full rounded-md border bg-background px-3 text-sm" /></label>
            </div>
            <Button onClick={run} disabled={mutation.isPending || !source.trim()} className="w-full gap-2"><WandSparkles size={16} />{mutation.isPending ? "Working..." : "Generate writing"}</Button>
          </section>

          <section className="flex min-h-[440px] flex-col rounded-2xl border bg-card p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Your result</h2><p className="text-sm text-muted-foreground">{outputTask ? `Generated by: ${tasks.find((item) => item.id === outputTask)?.label ?? outputTask}` : "Review the output before using it."}</p></div><Button variant="outline" size="sm" onClick={copyOutput} disabled={!output} className="gap-2"><Copy size={14} /> Copy</Button></div>
            <div className="mt-4 flex-1 whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-7">{output || <span className="text-muted-foreground">Your improved writing will appear here.</span>}</div>
            {outputTruncated && <p role="status" className="mt-3 text-sm text-amber-600">The AI response may have been truncated. Consider processing a shorter passage.</p>}
            <p className="mt-3 text-xs text-muted-foreground">AI can make mistakes. Verify facts, names, dates, citations, and important claims before publishing.</p>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

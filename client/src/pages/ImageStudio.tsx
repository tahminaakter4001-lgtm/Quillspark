import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, WandSparkles, Pencil, PanelsTopLeft, Shapes, ChartNoAxesCombined, Package, Sparkles, Upload, Download, Settings2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const tools = [
  { id: "text-to-image", label: "Text to image", description: "Create an image from a prompt.", icon: WandSparkles },
  { id: "image-editing", label: "Image editing", description: "Refine or transform an image.", icon: Pencil },
  { id: "logo", label: "Logo generator", description: "Explore a visual identity.", icon: Shapes },
  { id: "social", label: "Social graphics", description: "Create posts and campaign assets.", icon: PanelsTopLeft },
  { id: "infographic", label: "Infographic", description: "Turn information into visuals.", icon: ChartNoAxesCombined },
  { id: "product", label: "Product image", description: "Prepare polished product visuals.", icon: Package },
] as const;

type ToolId = typeof tools[number]["id"];

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not read the selected image."));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

export default function ImageStudio() {
  const [activeTool, setActiveTool] = useState<ToolId>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Premium");
  const [ratio, setRatio] = useState("1:1");
  const [referenceName, setReferenceName] = useState("");
  const [referenceImage, setReferenceImage] = useState<string>();
  const [generatedImage, setGeneratedImage] = useState<string>();
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const generateImage = trpc.imageStudio.generate.useMutation({
    onSuccess: (result) => {
      setGeneratedImage(result.imageDataUrl);
      toast.success("Your image is ready.");
    },
    onError: (error) => toast.error(error.message || "The image request could not be completed."),
  });

  const selectedTool = tools.find((tool) => tool.id === activeTool)!;
  const needsReference = activeTool === "image-editing" || activeTool === "product";

  async function handleReferenceChange(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Reference images must be 10 MB or smaller.");
      return;
    }
    setIsReadingFile(true);
    try {
      setReferenceImage(await readImageAsDataUrl(file));
      setReferenceName(file.name);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read the image.");
    } finally {
      setIsReadingFile(false);
    }
  }

  function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Add a prompt before continuing.");
      return;
    }
    if (needsReference && !referenceImage) {
      toast.error("Upload a reference image before continuing.");
      return;
    }
    setGeneratedImage(undefined);
    generateImage.mutate({
      tool: activeTool,
      prompt: prompt.trim(),
      style: style as "Premium" | "Modern minimalist" | "Creative & artistic" | "Photorealistic" | "Editorial" | "Illustration",
      aspectRatio: ratio as "1:1" | "4:5" | "16:9",
      imageDataUrl: needsReference ? referenceImage : undefined,
    });
  }

  function handleToolChange(tool: ToolId) {
    setActiveTool(tool);
    setGeneratedImage(undefined);
    if (tool !== "image-editing" && tool !== "product") {
      setReferenceImage(undefined);
      setReferenceName("");
    }
  }

  function downloadImage() {
    if (!generatedImage) return;
    const anchor = document.createElement("a");
    anchor.href = generatedImage;
    anchor.download = `quillspark-${activeTool}-image.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen -m-4 bg-[#f7f5ef] px-5 py-8 text-[#20232b] md:px-9">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#9a7627]">
                <Sparkles size={14} /> QuillSpark creative tools
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Image Creation Studio</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#69707c] md:text-base">Bring ideas to life with a focused workspace for images, brand assets, and visual storytelling.</p>
            </div>
            <Badge className="border border-[#e8d9b3] bg-[#fff8e8] px-3 py-1.5 text-[#87651d] hover:bg-[#fff8e8]">AI image studio</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-[#e6e1d5] bg-white p-3 shadow-sm">
              <div className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[#85817a]">Choose a creation tool</div>
              <div className="space-y-1">
                {tools.map(({ id, label, description, icon: Icon }) => (
                  <button key={id} onClick={() => handleToolChange(id)} className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${activeTool === id ? "bg-[#202b4b] text-white shadow-sm" : "text-[#343944] hover:bg-[#f5f2eb]"}`}>
                    <span className={`mt-0.5 rounded-lg p-2 ${activeTool === id ? "bg-white/10 text-[#f0cf83]" : "bg-[#f4f0e6] text-[#92702c]"}`}><Icon size={17} /></span>
                    <span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className={`mt-1 block text-xs leading-5 ${activeTool === id ? "text-white/65" : "text-[#858b95]"}`}>{description}</span></span>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-[#f8f5ed] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#66501f]"><Settings2 size={15} /> Creative controls</div>
                <p className="mt-1 text-xs leading-5 text-[#827b6d]">Choose a style and canvas ratio in the studio.</p>
              </div>
            </aside>

            <section className="rounded-2xl border border-[#e6e1d5] bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eeeae1] pb-5">
                <div><div className="text-xs font-semibold uppercase tracking-wider text-[#a17c2d]">Workspace / {selectedTool.label}</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedTool.label}</h2><p className="mt-1 text-sm text-[#818792]">{selectedTool.description}</p></div>
                <span className="rounded-full bg-[#f7f1e3] px-3 py-1 text-xs font-medium text-[#92702c]">QuillSpark Studio</span>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Describe your idea</label>
                    <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe the image you want to create. Include subject, mood, composition, colors, and important details..." className="min-h-36 resize-y rounded-xl border-[#dedbd2] bg-[#fdfcf9] text-sm leading-6 focus-visible:ring-[#b18b3e]" />
                    <div className="mt-2 text-right text-xs text-[#9a9da4]">{prompt.length} characters</div>
                  </div>

                  {needsReference && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Reference image</label>
                      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => void handleReferenceChange(event.target.files?.[0])} />
                      <button onClick={() => fileRef.current?.click()} disabled={isReadingFile} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#cfc8b8] bg-[#fcfbf7] p-4 text-left hover:border-[#aa873d] disabled:opacity-60">
                        <span className="rounded-lg bg-[#f3eddf] p-2 text-[#92702c]"><Upload size={18} /></span>
                        <span><span className="block text-sm font-medium">{isReadingFile ? "Reading image..." : referenceName || "Upload a reference image"}</span><span className="mt-1 block text-xs text-[#92959c]">PNG, JPG, or WebP · up to 10 MB</span></span>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button onClick={handleGenerate} disabled={generateImage.isPending || isReadingFile} className="h-11 rounded-xl bg-[#202b4b] px-5 text-white hover:bg-[#2d3d68]"><WandSparkles size={16} className="mr-2" />{generateImage.isPending ? "Generating..." : "Generate image"}</Button>
                    <span className="text-xs text-[#9699a0]">Your image is generated securely through the server.</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div><label className="mb-2 block text-sm font-semibold">Visual style</label><select value={style} onChange={(event) => setStyle(event.target.value)} className="h-11 w-full rounded-xl border border-[#dedbd2] bg-white px-3 text-sm outline-none focus:border-[#aa873d]"><option>Premium</option><option>Modern minimalist</option><option>Creative & artistic</option><option>Photorealistic</option><option>Editorial</option><option>Illustration</option></select></div>
                  <div><label className="mb-2 block text-sm font-semibold">Aspect ratio</label><div className="grid grid-cols-3 gap-2">{["1:1", "4:5", "16:9"].map((value) => <button key={value} onClick={() => setRatio(value)} className={`rounded-lg border px-2 py-2.5 text-xs font-semibold ${ratio === value ? "border-[#9b782e] bg-[#fbf5e7] text-[#80601f]" : "border-[#e3dfd6] text-[#737985] hover:bg-[#faf9f5]"}`}>{value}</button>)}</div></div>
                  <div className="rounded-xl border border-[#eee8da] bg-[#fcfaf5] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ImagePlus size={16} className="text-[#9b782e]" /> Preview area</div>
                    <div className="flex min-h-44 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#d8d0bd] bg-white px-4 text-center">
                      {generatedImage ? (
                        <img src={generatedImage} alt={`Generated ${selectedTool.label.toLowerCase()}`} className="h-auto max-h-[420px] w-full rounded-md object-contain" />
                      ) : generateImage.isPending ? (
                        <div className="py-8"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#e8dfca] border-t-[#9b782e]" /><p className="text-sm font-medium text-[#5b606a]">Creating your image...</p><p className="mt-1 text-xs text-[#9a9da4]">This can take a little while.</p></div>
                      ) : (
                        <div className="py-8"><div className="mb-3 inline-flex rounded-full bg-[#f5f0e4] p-3 text-[#9b782e]"><ImagePlus size={22} /></div><p className="text-sm font-medium text-[#5b606a]">Your creation will appear here</p><p className="mt-1 text-xs leading-5 text-[#9a9da4]">Generated images and editing results will be shown in this space.</p></div>
                      )}
                    </div>
                    {generatedImage && <Button onClick={downloadImage} variant="outline" className="mt-3 w-full rounded-lg border-[#ded6c5] text-[#66501f]"><Download size={15} className="mr-2" /> Download PNG</Button>}
                  </div>
                  <div className="flex items-start gap-2 text-xs leading-5 text-[#92959c]"><Download size={14} className="mt-0.5 shrink-0" /> Images are returned to this workspace and can be downloaded as PNG files.</div>
                </div>
              </div>
            </section>
          </div>
          <p className="mt-5 text-center text-xs text-[#9a9da4]">Your creative workspace · Navy &amp; gold edition</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

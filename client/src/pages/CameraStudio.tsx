import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, RotateCcw, Download, ShieldCheck, X } from "lucide-react";

export default function CameraStudio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState("");
  const [active, setActive] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  };

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is unavailable. Use a supported browser or upload an image.");
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      setCameraError(name === "NotAllowedError"
        ? "Camera permission was denied. Allow camera access in your browser settings or upload a photo."
        : "The camera could not be opened. Check that it is connected and not being used by another app.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
  };

  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCameraError("Please choose an image file.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setCameraError("Please choose an image smaller than 12 MB.");
      return;
    }
    setCameraError("");
    setPhoto(URL.createObjectURL(file));
    stopCamera();
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const downloadPhoto = () => {
    if (!photo) return;
    const link = document.createElement("a");
    link.href = photo;
    link.download = "quillspark-camera-photo.jpg";
    link.click();
  };

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">QuillSpark Camera</p>
          <h1 className="text-3xl font-semibold tracking-tight">Capture a thought. Start creating.</h1>
          <p className="max-w-2xl text-muted-foreground">Take a photo or upload an image to use as the starting point for your QuillSpark workflow.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="relative flex min-h-[300px] items-center justify-center bg-slate-950">
              {photo ? (
                <img src={photo} alt="Selected camera capture" className="max-h-[560px] w-full object-contain" />
              ) : (
                <video ref={videoRef} autoPlay muted playsInline className={active ? "max-h-[560px] w-full object-contain" : "hidden"} />
              )}
              {!active && !photo && (
                <div className="px-6 text-center text-white">
                  <Camera className="mx-auto mb-3 h-12 w-12 opacity-80" />
                  <p className="font-medium">Camera preview</p>
                  <p className="mt-1 text-sm text-white/65">Your camera stays off until you choose Start camera.</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 border-t p-4">
              {photo ? (
                <>
                  <Button onClick={() => { setPhoto(null); setCameraError(""); }}> <RotateCcw className="mr-2 h-4 w-4" /> Retake / Choose another</Button>
                  <Button variant="outline" onClick={downloadPhoto}><Download className="mr-2 h-4 w-4" /> Download photo</Button>
                </>
              ) : (
                <>
                  <Button onClick={active ? capturePhoto : startCamera}><Camera className="mr-2 h-4 w-4" /> {active ? "Capture photo" : "Start camera"}</Button>
                  <Button variant="outline" onClick={() => fileRef.current?.click()}><ImagePlus className="mr-2 h-4 w-4" /> Upload photo</Button>
                  {active && <Button variant="ghost" onClick={stopCamera}><X className="mr-2 h-4 w-4" /> Turn off</Button>}
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-primary" /> Privacy first</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Camera permission is requested only after you press Start camera.</li>
                <li>• Video is stopped when you capture a photo or leave this page.</li>
                <li>• Captured images stay in this browser view unless you choose to share or upload them.</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold">What you can do next</h2>
              <p className="mt-2 text-sm text-muted-foreground">Use your image as source material for OCR, image description, caption writing, or a content brief.</p>
              <Button className="mt-4 w-full" disabled={!photo || busy} onClick={() => setBusy(true)}>
                {busy ? "Image ready for the next workflow" : "Prepare image for AI"}
              </Button>
              {busy && <p className="mt-2 text-xs text-muted-foreground">Image captured locally. Connect an image-analysis endpoint to enable automated OCR and AI analysis.</p>}
            </div>
            {cameraError && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{cameraError}</div>}
          </aside>
        </section>
      </main>
    </DashboardLayout>
  );
}

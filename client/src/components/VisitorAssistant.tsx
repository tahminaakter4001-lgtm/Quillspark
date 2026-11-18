import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = [
  "What is Quillspark?",
  "How does Threadline help teams?",
  "Who is this work for?",
];

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I can answer questions about Quillspark, Threadline, and the work on this site. Ask me about what they do, who they’re for, or how the approach works.",
};

export default function VisitorAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [error, setError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const askMutation = trpc.assistant.ask.useMutation({
    onSuccess: (answer) => {
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", content: answer },
      ]);
      setError("");
    },
    onError: () => {
      setError("I couldn’t reach the assistant right now. Please try again.");
    },
  });

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const submitQuestion = (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || askMutation.isPending) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: trimmedQuestion },
    ]);
    setInput("");
    setError("");
    askMutation.mutate({
      messages: [
        ...messages
          .filter((message) => message.id !== "welcome")
          .slice(-6)
          .map(({ role, content }) => ({ role, content })),
        { role: "user", content: trimmedQuestion },
      ],
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuestion(input);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitQuestion(input);
    }
  };

  return (
    <div className="visitor-assistant">
      <button
        ref={triggerRef}
        type="button"
        className="visitor-assistant-trigger"
        aria-expanded={open}
        aria-controls="visitor-assistant-panel"
        aria-label={open ? "Close site assistant" : "Open site assistant"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={19} aria-hidden="true" /> : <MessageCircle size={19} aria-hidden="true" />}
        <span>{open ? "Close" : "Ask the site"}</span>
      </button>

      {open && (
        <section
          ref={panelRef}
          id="visitor-assistant-panel"
          className="visitor-assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="visitor-assistant-title"
        >
          <div className="visitor-assistant-header">
            <div>
              <span className="visitor-assistant-kicker"><Sparkles size={13} aria-hidden="true" /> Site guide</span>
              <h2 id="visitor-assistant-title">Ask about the work</h2>
            </div>
            <button
              type="button"
              className="visitor-assistant-close"
              aria-label="Close site assistant"
              onClick={() => setOpen(false)}
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="visitor-assistant-messages" role="log" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => (
              <div key={message.id} className={`visitor-assistant-message visitor-assistant-message--${message.role}`}>
                <span className="visitor-assistant-message-label">{message.role === "assistant" ? "Quillspark guide" : "You"}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {askMutation.isPending && (
              <div className="visitor-assistant-message visitor-assistant-message--assistant" aria-label="Assistant is thinking">
                <span className="visitor-assistant-message-label">Quillspark guide</span>
                <p className="visitor-assistant-thinking">Thinking<span aria-hidden="true">…</span></p>
              </div>
            )}
            {error && <p className="visitor-assistant-error" role="alert">{error}</p>}
          </div>

          <div className="visitor-assistant-suggestions" aria-label="Suggested questions">
            {suggestedQuestions.map((question) => (
              <button key={question} type="button" onClick={() => submitQuestion(question)} disabled={askMutation.isPending}>
                {question}
              </button>
            ))}
          </div>

          <form className="visitor-assistant-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="visitor-assistant-input">Ask a question about this site</label>
            <textarea
              ref={inputRef}
              id="visitor-assistant-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask a question…"
              rows={2}
              maxLength={600}
              disabled={askMutation.isPending}
            />
            <button type="submit" className="visitor-assistant-send" disabled={!input.trim() || askMutation.isPending} aria-label="Send question">
              <Send size={17} aria-hidden="true" />
            </button>
          </form>
          <p className="visitor-assistant-note">Answers are based on the content published on this site.</p>
        </section>
      )}
    </div>
  );
}

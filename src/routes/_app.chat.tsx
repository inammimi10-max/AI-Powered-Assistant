import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Send, Trash2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateAI } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — Nexus AI" }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = "You are an intelligent workplace productivity assistant that helps professionals with emails, planning, meetings, research, communication, and productivity. Be concise, warm, and helpful.";

const SUGGESTIONS = [
  "Summarize this week's priorities",
  "Draft a follow-up email after a client call",
  "Break down launching a new product in 30 days",
  "Give me 5 questions to ask in a 1:1",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { content: reply } = await generateAI({
        data: { messages: [{ role: "system", content: SYSTEM }, ...next] },
      });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reply");
      setMessages(next);
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-4xl flex-col">
      <div className="flex items-start justify-between">
        <PageHeader icon={MessageSquare} title="AI Chatbot" description="Conversational assistant for everyday workplace tasks." />
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}><Trash2 className="mr-1 h-4 w-4" />Clear</Button>
        )}
      </div>

      <Card className="glass-card flex min-h-0 flex-1 flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">How can I help today?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try one of these prompts:</p>
                <div className="mt-4 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-xl border bg-card p-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={
                        "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm " +
                        (m.role === "user"
                          ? "gradient-brand text-white"
                          : "bg-muted text-foreground")
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="border-t bg-background/50 p-3 sm:p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Ask anything…  (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="max-h-40 min-h-[44px] resize-none"
              />
              <Button onClick={() => send()} disabled={loading || !input.trim()} className="gradient-brand h-11 w-11 shrink-0 p-0 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              AI-generated content may contain inaccuracies. Please verify important information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

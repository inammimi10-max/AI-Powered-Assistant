import { createFileRoute } from "@tanstack/react-router";
import { Mail, Wand2, Save, Trash2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAI } from "@/lib/ai.functions";
import { addEmail, deleteEmail, loadEmails, type SavedEmail } from "@/lib/email-history";

export const Route = createFileRoute("/_app/email")({
  head: () => ({ meta: [{ title: "Email Generator — Nexus AI" }] }),
  component: EmailPage,
});

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [extra, setExtra] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SavedEmail[]>([]);

  useEffect(() => { setHistory(loadEmails()); }, []);

  const run = async () => {
    if (!purpose.trim()) return toast.error("Please describe the email purpose.");
    setLoading(true);
    try {
      const system = "You are an expert workplace communication assistant. Write polished professional emails with a subject line and signature.";
      const user = `Write a professional email using the following:\n\nPurpose: ${purpose}\nRecipient: ${recipient || "colleague"}\nTone: ${tone}\nLength: ${length}\nAdditional instructions: ${extra || "none"}\n\nInclude a clear Subject line at the top, then the email body, then a signature placeholder.`;
      const { content } = await generateAI({ data: { messages: [{ role: "system", content: system }, { role: "user", content: user }] } });
      setOutput(content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally { setLoading(false); }
  };

  const save = () => {
    if (!output.trim()) return toast.error("Nothing to save yet — generate an email first.");
    const title = (purpose.trim().slice(0, 60) || "Untitled email");
    const next = addEmail({ title, purpose, recipient, tone, length, extra, output });
    setHistory(next);
    toast.success("Saved to history");
  };

  const load = (item: SavedEmail) => {
    setPurpose(item.purpose);
    setRecipient(item.recipient);
    setTone(item.tone);
    setLength(item.length);
    setExtra(item.extra);
    setOutput(item.output);
    toast.success("Loaded from history");
  };

  const remove = (id: string) => {
    setHistory(deleteEmail(id));
    toast.success("Deleted");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={Mail} title="Smart Email Generator" description="Generate polished professional emails in seconds." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-2">
              <Label>Email purpose</Label>
              <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Request a project update from the design team" rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>Recipient</Label>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Design Lead, Sarah" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Professional", "Friendly", "Formal", "Casual"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Short", "Medium", "Long"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Additional instructions</Label>
              <Textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="e.g. mention Friday deadline, include a friendly closing" rows={3} />
            </div>
            <div className="flex gap-2">
              <Button onClick={run} disabled={loading} className="flex-1 gradient-brand text-white">
                <Wand2 className="mr-2 h-4 w-4" />
                {loading ? "Generating…" : "Generate email"}
              </Button>
              <Button onClick={save} variant="outline" disabled={!output.trim()}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          </CardContent>
        </Card>
        <AIOutput value={output} onChange={setOutput} onRegenerate={run} loading={loading} filename="email.txt" />
      </div>

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle className="text-base">Saved emails ({history.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved emails yet. Generate one and click Save to keep it here.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.tone} · {h.length} · {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => load(h)}>
                      <RotateCcw className="h-4 w-4" /><span className="ml-1">Load</span>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(h.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

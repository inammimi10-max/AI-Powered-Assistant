import { createFileRoute } from "@tanstack/react-router";
import { FileText, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateAI } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/summarize")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — Nexus AI" }] }),
  component: SummarizePage,
});

function SummarizePage() {
  const [transcript, setTranscript] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!transcript.trim()) return toast.error("Paste a transcript or notes first.");
    setLoading(true);
    try {
      const system = "You are an executive meeting assistant. Summarize meeting transcripts into clean, well-structured markdown.";
      const user = `Summarize the following meeting into these sections with markdown headings:\n\n## Executive Summary\n## Key Discussion Points\n## Decisions Made\n## Action Items (with owners if mentioned)\n## Next Steps\n\nTranscript:\n${transcript}`;
      const { content } = await generateAI({ data: { messages: [{ role: "system", content: system }, { role: "user", content: user }] } });
      setOutput(content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" description="Turn raw transcripts into executive-ready summaries and action items." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="space-y-4 p-6">
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript or notes here…"
              className="min-h-[380px] font-mono text-sm"
            />
            <Button onClick={run} disabled={loading} className="w-full gradient-brand text-white">
              <Wand2 className="mr-2 h-4 w-4" />
              {loading ? "Summarizing…" : "Summarize meeting"}
            </Button>
          </CardContent>
        </Card>
        <AIOutput value={output} onChange={setOutput} onRegenerate={run} loading={loading} filename="meeting-summary.md" minHeight={380} />
      </div>
    </div>
  );
}

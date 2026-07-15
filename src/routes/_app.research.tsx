import { createFileRoute } from "@tanstack/react-router";
import { Search, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateAI } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/research")({
  head: () => ({ meta: [{ title: "Research Assistant — Nexus AI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!topic.trim()) return toast.error("Enter a topic to research.");
    setLoading(true);
    try {
      const system = "You are an expert research analyst. Produce clear structured briefings in markdown.";
      const user = `Research topic: ${topic}\n\nGenerate a briefing with these markdown sections:\n## Overview\n## Key Concepts\n## Important Facts\n## Advantages\n## Challenges\n## Latest Trends\n## Conclusion`;
      const { content } = await generateAI({ data: { messages: [{ role: "system", content: system }, { role: "user", content: user }] } });
      setOutput(content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to research");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={Search} title="AI Research Assistant" description="Get an executive briefing on any topic in seconds." />
      <Card className="glass-card mb-6">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="e.g. Impact of generative AI on customer support"
            className="flex-1"
          />
          <Button onClick={run} disabled={loading} className="gradient-brand text-white">
            <Wand2 className="mr-2 h-4 w-4" />
            {loading ? "Researching…" : "Research"}
          </Button>
        </CardContent>
      </Card>
      <AIOutput value={output} onChange={setOutput} onRegenerate={run} loading={loading} filename="research.md" minHeight={480} />
    </div>
  );
}

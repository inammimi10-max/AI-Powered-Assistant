import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAI } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/planner")({
  head: () => ({ meta: [{ title: "Task Planner — Nexus AI" }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [teamSize, setTeamSize] = useState("3");
  const [output, setOutput] = useState("");
  const [tasks, setTasks] = useState<{ text: string; done: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  }, [tasks]);

  const run = async () => {
    if (!name.trim() || !goal.trim()) return toast.error("Add a project name and goal.");
    setLoading(true);
    try {
      const system = "You are a professional project manager. Produce clear, structured plans in markdown.";
      const user = `Create a detailed project plan for:\nProject: ${name}\nGoal: ${goal}\nDeadline: ${deadline || "flexible"}\nPriority: ${priority}\nTeam size: ${teamSize}\n\nInclude these markdown sections:\n## Daily Tasks (list 6-10 concrete tasks as bullets prefixed with "- [ ]")\n## Weekly Milestones\n## Estimated Timeline\n## Risks\n## Recommendations`;
      const { content } = await generateAI({ data: { messages: [{ role: "system", content: system }, { role: "user", content: user }] } });
      setOutput(content);
      const parsed = Array.from(content.matchAll(/- \[ \]\s*(.+)/g)).map((m) => ({ text: m[1].trim(), done: false }));
      setTasks(parsed);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={ListChecks} title="AI Task Planner" description="Generate a full project plan with tasks, milestones and risks." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-2"><Label>Project name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website redesign" /></div>
            <div className="grid gap-2"><Label>Goal</Label><Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What outcome do you want?" rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High", "Critical"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Team size</Label><Input type="number" min={1} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} /></div>
            <Button onClick={run} disabled={loading} className="w-full gradient-brand text-white">
              <Wand2 className="mr-2 h-4 w-4" />
              {loading ? "Planning…" : "Generate plan"}
            </Button>

            {tasks.length > 0 && (
              <div className="rounded-xl border p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="mb-3" />
                <ul className="space-y-2">
                  {tasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Checkbox
                        checked={t.done}
                        onCheckedChange={(v) => setTasks((prev) => prev.map((x, j) => j === i ? { ...x, done: !!v } : x))}
                        className="mt-0.5"
                      />
                      <span className={"text-sm " + (t.done ? "text-muted-foreground line-through" : "")}>{t.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        <AIOutput value={output} onChange={setOutput} onRegenerate={run} loading={loading} filename="project-plan.md" minHeight={420} />
      </div>
    </div>
  );
}

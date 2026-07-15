import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Mail, FileText, ListChecks, Search, MessageSquare,
  TrendingUp, Clock, Sparkles, Zap, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

const tools = [
  { to: "/email", title: "Email Generator", desc: "Draft polished emails in seconds.", icon: Mail },
  { to: "/summarize", title: "Meeting Summarizer", desc: "Turn transcripts into action items.", icon: FileText },
  { to: "/planner", title: "Task Planner", desc: "Generate project plans and milestones.", icon: ListChecks },
  { to: "/research", title: "Research Assistant", desc: "Get structured briefings on any topic.", icon: Search },
  { to: "/chat", title: "AI Chatbot", desc: "Ask anything, get instant answers.", icon: MessageSquare },
] as const;

const stats = [
  { label: "AI Requests", value: "1,284", change: "+12%", icon: Zap },
  { label: "Hours Saved", value: "48.5", change: "+8%", icon: Clock },
  { label: "Productivity", value: "92%", change: "+4%", icon: TrendingUp },
  { label: "Streak", value: "14 days", change: "🔥", icon: Sparkles },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-8 overflow-hidden rounded-3xl gradient-brand p-6 text-white shadow-xl sm:p-10">
        <Badge className="mb-3 border-white/30 bg-white/15 text-white hover:bg-white/25">Welcome back</Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your AI workplace, ready to go.</h1>
        <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
          Draft emails, summarize meetings, plan projects and research topics — all from one dashboard.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Link to="/chat">Start chatting <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
            <Link to="/email">Draft an email</Link>
          </Button>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 text-2xl font-bold">{s.value}</div>
              <div className="mt-1 text-xs text-success">{s.change}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">AI Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="group">
              <Card className="glass-card h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:gradient-brand group-hover:text-white">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                  <div className="mt-3 flex items-center text-xs font-medium text-primary">
                    Open <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {[
                { t: "Email to marketing team drafted", ago: "2m ago", icon: Mail },
                { t: "Q4 kickoff meeting summarized", ago: "1h ago", icon: FileText },
                { t: "Website redesign plan generated", ago: "3h ago", icon: ListChecks },
                { t: "Research: LLM evaluation methods", ago: "yesterday", icon: Search },
              ].map((r, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <r.icon className="h-4 w-4" />
                  </div>
                  <span className="min-w-0 flex-1 truncate">{r.t}</span>
                  <span className="text-xs text-muted-foreground">{r.ago}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {tools.slice(0, 4).map((t) => (
              <Button key={t.to} asChild variant="outline" className="justify-start">
                <Link to={t.to}><t.icon className="mr-2 h-4 w-4" />{t.title}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

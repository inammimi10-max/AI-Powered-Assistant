import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Nexus AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dark, setDark] = useState(false);
  const [autosave, setAutosave] = useState(true);

  useEffect(() => {
    setName(localStorage.getItem("profile_name") ?? "");
    setEmail(localStorage.getItem("profile_email") ?? "");
    setDark(document.documentElement.classList.contains("dark"));
    setAutosave(localStorage.getItem("autosave") !== "false");
  }, []);

  const save = () => {
    localStorage.setItem("profile_name", name);
    localStorage.setItem("profile_email", email);
    localStorage.setItem("autosave", String(autosave));
    toast.success("Settings saved");
  };

  const toggleDark = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("theme", v ? "dark" : "light");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader icon={SettingsIcon} title="Settings" description="Manage your profile and app preferences." />
      <div className="space-y-4">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></div>
            <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Dark mode</Label><p className="text-xs text-muted-foreground">Reduce glare in low light.</p></div>
              <Switch checked={dark} onCheckedChange={toggleDark} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Autosave drafts</Label><p className="text-xs text-muted-foreground">Keep working copies of AI outputs.</p></div>
              <Switch checked={autosave} onCheckedChange={setAutosave} />
            </div>
          </CardContent>
        </Card>
        <Button onClick={save} className="gradient-brand text-white">Save changes</Button>
      </div>
    </div>
  );
}

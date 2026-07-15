import { Copy, Download, RefreshCw, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  loading?: boolean;
  filename?: string;
  minHeight?: number;
}

export function AIOutput({ value, onChange, onRegenerate, loading, filename = "output.txt", minHeight = 320 }: Props) {
  const [editing, setEditing] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };
  const download = () => {
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          {value.length.toLocaleString()} chars · {value.split(/\s+/).filter(Boolean).length.toLocaleString()} words
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setEditing((e) => !e)}>
            {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            <span className="ml-1">{editing ? "Done" : "Edit"}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={copy}><Copy className="h-4 w-4" /><span className="ml-1">Copy</span></Button>
          <Button variant="ghost" size="sm" onClick={download}><Download className="h-4 w-4" /><span className="ml-1">Download</span></Button>
          {onRegenerate && (
            <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={loading}>
              <RefreshCw className={"h-4 w-4 " + (loading ? "animate-spin" : "")} />
              <span className="ml-1">Regenerate</span>
            </Button>
          )}
        </div>
      </div>
      {editing ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight }}
          className="font-mono text-sm"
        />
      ) : (
        <div
          className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm leading-relaxed"
          style={{ minHeight }}
        >
          {value || <span className="text-muted-foreground">Your AI output will appear here.</span>}
        </div>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground">
        AI-generated content may contain inaccuracies. Please review, verify, and edit outputs before using them for professional, legal, financial, or business purposes.
      </p>
    </div>
  );
}

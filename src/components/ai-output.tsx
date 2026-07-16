import { Copy, Download, RefreshCw, Pencil, Check, FileText, FileType } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  loading?: boolean;
  filename?: string;
  minHeight?: number;
}

function baseName(filename: string) {
  return filename.replace(/\.[^.]+$/, "") || "output";
}

export function AIOutput({ value, onChange, onRegenerate, loading, filename = "output.txt", minHeight = 320 }: Props) {
  const [editing, setEditing] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const saveBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    saveBlob(new Blob([value], { type: "text/plain" }), `${baseName(filename)}.txt`);
    toast.success("Downloaded .txt");
  };

  const downloadPdf = async () => {
    if (!value.trim()) return toast.error("Nothing to export yet.");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 54;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      let y = margin;
      const lineHeight = 15;
      const paragraphs = value.split(/\n/);
      for (const para of paragraphs) {
        const isH1 = /^#\s+/.test(para);
        const isH2 = /^##\s+/.test(para);
        const isH3 = /^###\s+/.test(para);
        const clean = para.replace(/^#+\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1");
        if (isH1) { doc.setFont("helvetica", "bold"); doc.setFontSize(18); }
        else if (isH2) { doc.setFont("helvetica", "bold"); doc.setFontSize(14); }
        else if (isH3) { doc.setFont("helvetica", "bold"); doc.setFontSize(12); }
        else { doc.setFont("helvetica", "normal"); doc.setFontSize(11); }
        const lines = clean.length ? doc.splitTextToSize(clean, maxWidth) : [""];
        for (const line of lines) {
          if (y > pageHeight - margin) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += (isH1 ? 22 : isH2 ? 18 : lineHeight);
        }
        if (isH1 || isH2 || isH3) y += 4;
      }
      doc.save(`${baseName(filename)}.pdf`);
      toast.success("Downloaded .pdf");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF export failed");
    }
  };

  const downloadDocx = async () => {
    if (!value.trim()) return toast.error("Nothing to export yet.");
    try {
      const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import("docx");
      const paragraphs = value.split(/\n/).map((line) => {
        if (/^#\s+/.test(line)) return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(line.replace(/^#\s+/, ""))] });
        if (/^##\s+/.test(line)) return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(line.replace(/^##\s+/, ""))] });
        if (/^###\s+/.test(line)) return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(line.replace(/^###\s+/, ""))] });
        if (/^[-*]\s+/.test(line)) return new Paragraph({ bullet: { level: 0 }, children: [new TextRun(line.replace(/^[-*]\s+(?:\[[ x]\]\s*)?/, ""))] });
        // bold **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        const runs = parts.map((p) =>
          /^\*\*[^*]+\*\*$/.test(p)
            ? new TextRun({ text: p.slice(2, -2), bold: true })
            : new TextRun(p)
        );
        return new Paragraph({ children: runs.length ? runs : [new TextRun("")] });
      });
      const doc = new Document({ sections: [{ children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      saveBlob(blob, `${baseName(filename)}.docx`);
      toast.success("Downloaded .docx");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "DOCX export failed");
    }
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /><span className="ml-1">Export</span></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadPdf}><FileType className="mr-2 h-4 w-4" />PDF (.pdf)</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadDocx}><FileText className="mr-2 h-4 w-4" />Word (.docx)</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadTxt}><FileText className="mr-2 h-4 w-4" />Plain text (.txt)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

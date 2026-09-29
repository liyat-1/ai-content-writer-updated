import { useRef, useState } from "react";
import { Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calendar, fmtRange, useCalendar, type CalendarEvent, type EventType } from "@/lib/calendar";

const empty = (): CalendarEvent => ({ id: `m-${Date.now()}`, name: "", start: "2026-10-15", end: "2026-10-15", type: "Local event", source: "Added manually" });
const monthOf = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });

function parseCsv(text: string): CalendarEvent[] {
  return text.split(/\r?\n/).slice(1).map((line, i) => line.split(",").map((c) => c.trim())).filter((c) => c[0] && /^\d{4}-\d{2}-\d{2}$/.test(c[1] ?? ""))
    .map(([name, start, end, type, location], i) => ({ id: `csv-${Date.now()}-${i}`, name, start, end: end || start, type: (["Holiday", "Local event", "Seasonal"].includes(type) ? type : "Local event") as EventType, source: "Hotel calendar", location }));
}

export function EventsPage() {
  const { events, hasHotelCalendar } = useCalendar();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<CalendarEvent | null>(null);
  const [note, setNote] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const list = events.filter((e) => `${e.name} ${e.location ?? ""} ${e.source}`.toLowerCase().includes(q.toLowerCase()));
  const groups = list.reduce<Record<string, CalendarEvent[]>>((acc, e) => { const k = monthOf.format(Date.parse(e.start)); (acc[k] ??= []).push(e); return acc; }, {});

  const onFile = async (f?: File) => {
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) { setNote(`${f.name}: Excel files are read as CSV in this demo — export as CSV with columns name,start,end,type,location.`); return; }
    const rows = parseCsv(await f.text());
    calendar.importRows(rows);
    setNote(rows.length ? `Added ${rows.length} events from ${f.name}.` : `No rows found in ${f.name}. Use columns name,start,end,type,location.`);
  };

  return (
    <MarketingShell title="Events & Holidays">
      <main className="mx-auto max-w-[1100px] px-4 pb-16 pt-6 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4 pb-5">
          <div><p className="text-[10.5px] font-semibold uppercase text-brand">Content / Events & Holidays</p><h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">Events & Holidays</h1><p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">The shared calendar Directful AI uses to decide where your content should change.</p></div>
          <div className="flex gap-2">
            <input ref={file} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            <Button variant="outline" onClick={() => file.current?.click()}><Upload size={14} />Upload calendar</Button>
            <Button variant="brand" onClick={() => setDraft(empty())}><Plus size={14} />Add event</Button>
          </div>
        </header>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events" className="pl-8" /></div>
          <label className="flex items-center gap-2 text-[12px] text-muted-foreground"><input type="checkbox" checked={hasHotelCalendar} onChange={(e) => calendar.setHotelCalendar(e.target.checked)} />Hotel calendar connected</label>
        </div>
        {note && <p className="mb-4 rounded-md border border-brand/20 bg-brand-soft/35 px-3 py-2 text-[12px] text-card-foreground">{note}</p>}
        {draft && (
          <form className="mb-5 grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card sm:grid-cols-[2fr_1fr_1fr_1fr_1.3fr_auto]" onSubmit={(e) => { e.preventDefault(); if (!draft.name.trim()) return; calendar.upsert({ ...draft, end: draft.end < draft.start ? draft.start : draft.end }); setDraft(null); }}>
            <Input aria-label="Name" placeholder="Event name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Input aria-label="Start" type="date" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
            <Input aria-label="End" type="date" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
            <select aria-label="Type" className="h-9 rounded-md border border-input bg-background px-2 text-[13px]" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as EventType })}><option>Holiday</option><option>Local event</option><option>Seasonal</option></select>
            <Input aria-label="Location" placeholder="Location (optional)" value={draft.location ?? ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
            <div className="flex gap-2"><Button type="submit" variant="brand">Save</Button><Button type="button" variant="ghost" onClick={() => setDraft(null)}>Cancel</Button></div>
          </form>
        )}
        <div className="space-y-5">
          {Object.entries(groups).map(([month, items]) => (
            <section key={month}>
              <h2 className="mb-2 text-[13px] font-semibold text-card-foreground">{month}</h2>
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-card">
                {items.map((e) => (
                  <article key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-card-foreground">{e.name}</p><p className="text-[11.5px] text-muted-foreground">{fmtRange(e.start, e.end)} · {e.type}{e.location ? ` · ${e.location}` : ""}</p></div>
                    <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${e.source === "Directful" ? "bg-muted text-muted-foreground" : "bg-brand-soft text-brand"}`}>{e.source}</span>
                    <Button size="icon" variant="ghost" aria-label={`Edit ${e.name}`} onClick={() => setDraft(e)}><Pencil size={14} /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Remove ${e.name}`} onClick={() => calendar.remove(e.id)}><Trash2 size={14} /></Button>
                  </article>
                ))}
              </div>
            </section>
          ))}
          {!list.length && <p className="text-[13px] text-muted-foreground">No events match your search.</p>}
        </div>
      </main>
    </MarketingShell>
  );
}

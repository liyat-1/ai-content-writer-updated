import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarRange, Check, ChevronDown, Mail, MessageSquare, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { MONTHS } from "@/lib/contentLibrary";
import { useMarketing } from "@/lib/marketing";
import { toast } from "sonner";
import { ACTIVE_RELEASE_ID, CAMPAIGN_INSIGHTS, RELEASE_RESULTS, RELEASES, TOTAL_PROPERTIES, campaignProperties, useSelectedRelease, type Release } from "@/lib/releases";

const panel = "rounded-lg border border-border bg-card shadow-card";

function statusStyle(release: Release) {
  if (release.id === ACTIVE_RELEASE_ID) return "bg-brand text-brand-foreground";
  if (release.status === "Scheduled") return "bg-brand-soft text-brand";
  return "bg-muted text-muted-foreground";
}

function statusLabel(release: Release) {
  if (release.id === ACTIVE_RELEASE_ID) return "Live seasonal";
  if (release.id === "default") return "Live fallback";
  return release.status;
}

function PublicationPicker({ release, onSelect }: { release: Release; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const years = Array.from(new Set(RELEASES.map((item) => item.year))).sort((a, b) => b - a);
  return (
    <section className={`${panel} relative`} aria-label="Selected publication">
      <button type="button" onClick={() => setOpen((value) => !value)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4 text-left sm:p-5">
        <span className="grid size-10 place-items-center rounded-md bg-brand-soft text-brand"><CalendarRange size={18} /></span>
        <span className="min-w-0"><span className="block text-[10px] font-semibold uppercase text-muted-foreground">Selected publication</span><span className="mt-1 block truncate text-[17px] font-semibold text-card-foreground">{release.name}</span><span className="mt-0.5 block text-[11px] text-muted-foreground">{MONTHS[release.from]}–{MONTHS[release.to]} {release.year} · {release.id === "default" ? "Used outside seasonal periods" : release.status === "Scheduled" ? "Scheduled" : `Published ${release.created}`}</span></span>
        <span className="flex items-center gap-3"><span className={`hidden rounded-sm px-2 py-1 text-[10px] font-semibold sm:inline ${statusStyle(release)}`}>{statusLabel(release)}</span><ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} /></span>
      </button>
      {open && <div className="border-t border-border p-3 sm:p-4"><div className="mb-4 rounded-md border border-brand/15 bg-brand-soft/35 px-3 py-2 text-[11px] leading-5 text-card-foreground"><strong>The year-round foundation never switches off.</strong> Seasonal publications replace it only for their stated months; uncovered months automatically fall back to it.</div>{years.map((year) => <div key={year} className="mb-4 last:mb-0"><p className="mb-2 px-2 text-[10px] font-bold text-muted-foreground">{year}</p><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{RELEASES.filter((item) => item.year === year).map((item) => <Button type="button" variant="ghost" key={item.id} onClick={() => { onSelect(item.id); setOpen(false); }} className={`h-auto min-w-0 justify-start rounded-md border p-3 text-left transition-colors ${item.id === release.id ? "border-brand bg-brand-soft/45" : "border-border hover:border-brand/40"}`}><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[12.5px] font-semibold text-card-foreground">{item.name}</span>{item.id === release.id && <Check size={14} className="shrink-0 text-brand" />}</span><span className="mt-1 block text-[10.5px] font-normal text-muted-foreground">{MONTHS[item.from]}–{MONTHS[item.to]} · {statusLabel(item)}</span></span></Button>)}</div></div>)}</div>}
    </section>
  );
}

function PageHeader({ page }: { page: "Releases" | "Results" }) {
  return <header className="pb-5"><p className="text-[10.5px] font-semibold uppercase text-brand">Content / {page}</p><h1 className="mt-2 font-display text-[30px] font-semibold text-card-foreground sm:text-[36px]">{page}</h1><p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">Release history and performance together — compared only with equivalent periods.</p></header>;
}

function ReleaseSummary({ release }: { release: Release }) {
  return <section className={`${panel} overflow-hidden`}><div className="h-1 bg-brand" /><div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-2xl"><p className="text-[10.5px] font-semibold uppercase text-muted-foreground">{release.source} · {release.publishedAt}</p><h2 className="mt-2 text-[24px] font-semibold text-card-foreground">{release.name}</h2><p className="mt-2 text-[13px] leading-5 text-muted-foreground">{release.summary}</p></div><span className={`rounded-sm px-2 py-1 text-[10.5px] font-semibold ${statusStyle(release)}`}>{release.id === ACTIVE_RELEASE_ID ? "Live now" : release.status}</span></div><div className="mt-5 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"><Info label="Runs" value={`${MONTHS[release.from]}–${MONTHS[release.to]} ${release.year}`} /><Info label="Campaigns" value={`${release.campaignCount} campaigns`} /><Info label="Coverage" value={`${release.properties} of ${TOTAL_PROPERTIES} properties`} /></div></div></section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="bg-card px-4 py-3"><p className="text-[9.5px] font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-1 text-[12.5px] font-semibold text-card-foreground">{value}</p></div>;
}

function Changes({ release }: { release: Release }) {
  return <section className={`${panel} p-5 sm:p-6`}><div className="flex items-center gap-2"><Sparkles size={16} className="text-brand" /><h3 className="text-[15px] font-semibold text-card-foreground">What changed and why</h3></div><div className="mt-4 grid gap-3 md:grid-cols-3">{release.changes.map((change, index) => <article key={change} className="rounded-md bg-muted/55 p-4"><span className="grid size-6 place-items-center rounded-sm bg-brand-soft text-[10px] font-bold text-brand">{index + 1}</span><p className="mt-3 text-[12.5px] font-medium leading-5 text-card-foreground">{change}</p></article>)}</div><div className="mt-4 border-l-2 border-brand bg-brand-soft/35 px-4 py-3"><p className="text-[10px] font-semibold uppercase text-brand">Why this direction</p><p className="mt-1 text-[12.5px] leading-5 text-card-foreground">{release.expectedEffect}</p></div></section>;
}

function IncludedCampaigns({ release }: { release: Release }) {
  const { campaigns } = useMarketing();
  return <section><div className="mb-3"><h3 className="text-[15px] font-semibold text-card-foreground">Campaigns in this publication</h3><p className="mt-1 text-[11px] text-muted-foreground">Content included for {MONTHS[release.from]}–{MONTHS[release.to]} {release.year}, with property usage shown plainly.</p></div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{campaigns.slice(0, release.campaignCount).map((campaign) => { const used = campaignProperties(release.id, campaign.id); return <article key={campaign.id} className={`${panel} p-4`}><div className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-brand">{campaign.strategy === "text" ? <MessageSquare size={14} /> : <Mail size={14} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-semibold text-card-foreground">{campaign.name}</span><span className="mt-0.5 block text-[10.5px] text-muted-foreground">{campaign.timing} · {campaign.strategy === "text" ? "Text" : "Email + Text"}</span></span></div><p className={`mt-3 border-t border-border pt-3 text-[11.5px] font-medium ${used === 0 ? "text-muted-foreground" : "text-card-foreground"}`}>{used === 0 ? `No properties use this publication for this campaign.` : `${used} of ${TOTAL_PROPERTIES} properties use this publication for this campaign.`}</p></article>; })}</div></section>;
}

function ResultSummary({ release }: { release: Release }) {
  const result = RELEASE_RESULTS[release.id] ?? RELEASE_RESULTS.default;
  return <><section className={`${panel} overflow-hidden`}><div className="h-1 bg-brand" /><div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10.5px] font-semibold uppercase text-brand">{release.name}</p><h2 className="mt-1 text-[23px] font-semibold text-card-foreground">Compared with {release.comparison}</h2><p className="mt-1 text-[11.5px] text-muted-foreground">{result.sampleNote} · Measured through {result.measuredThrough}</p></div><span className={`rounded-sm px-2 py-1 text-[10.5px] font-semibold ${statusStyle(release)}`}>{release.id === ACTIVE_RELEASE_ID ? "Live now" : release.status}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{result.metrics.map((metric) => <article key={metric.label} className="rounded-md border border-border p-4"><p className="text-[10.5px] font-medium text-muted-foreground">{metric.label}</p><div className="mt-2 flex items-end gap-2"><span className="text-[25px] font-semibold text-card-foreground">{metric.value}</span><span className="pb-1 text-[10.5px] text-muted-foreground">was {metric.previous}</span></div><p className="mt-2 text-[11px] font-semibold text-brand">{metric.delta} vs {release.comparison}</p></article>)}</div></div></section><AiResultInsight release={release} /></>;
}

function AiResultInsight({ release }: { release: Release }) {
  const result = RELEASE_RESULTS[release.id] ?? RELEASE_RESULTS.default;
  return <section className={`${panel} p-5 sm:p-6`}><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-md bg-brand-soft text-brand"><Sparkles size={15} /></span><div><h3 className="text-[14px] font-semibold text-card-foreground">AI review of this timeframe</h3><p className="text-[10.5px] text-muted-foreground">Content impact is considered alongside seasonality and external conditions.</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{result.insights.map((insight) => <article key={insight.id} className="rounded-md bg-muted/50 p-4"><p className="text-[12.5px] font-semibold leading-5 text-card-foreground">{insight.text}</p><p className="mt-2 text-[11.5px] leading-5 text-muted-foreground">{insight.evidence}</p></article>)}<article className="rounded-md bg-muted/50 p-4"><p className="text-[12.5px] font-semibold text-card-foreground">Other factors considered</p><p className="mt-2 text-[11.5px] leading-5 text-muted-foreground">Seasonal travel demand and local events likely influenced the overall change. The content may have added lift, but the results do not attribute the full movement to messaging alone.</p></article></div></section>;
}

function MonthlyResults({ release }: { release: Release }) {
  const result = RELEASE_RESULTS[release.id] ?? RELEASE_RESULTS.default;
  return <section><div className="mb-3"><h3 className="text-[15px] font-semibold text-card-foreground">Monthly breakdown</h3><p className="mt-1 text-[11px] text-muted-foreground">Only months inside {release.name} are included.</p></div><div className="grid gap-3 lg:grid-cols-3">{result.months.map((item) => { const pending = item.clickRate === 0; const delta = item.clickRate - item.priorClickRate; return <article key={item.month} className={`${panel} p-4`}><div className="flex items-start justify-between gap-3"><h4 className="text-[17px] font-semibold text-card-foreground">{MONTHS[item.month]} {release.year}</h4><span className={`text-[10.5px] font-semibold ${pending ? "text-muted-foreground" : delta >= 0 ? "text-brand" : "text-destructive"}`}>{pending ? "Not live" : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts`}</span></div><div className="mt-4 grid grid-cols-3 gap-2"><Metric label="Click rate" value={pending ? "—" : `${item.clickRate.toFixed(1)}%`} /><Metric label="Click-to-book" value={pending ? "—" : `${item.clickToBook.toFixed(1)}%`} /><Metric label="Spam rate" value={pending ? "—" : `${item.spamRate.toFixed(2)}%`} /></div><p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">{pending ? "Results will appear after messages begin sending." : delta >= 0 ? `Click rate improved from ${item.priorClickRate.toFixed(1)}%. Timely seasonal language likely helped, alongside normal demand for this month.` : `Click rate was below ${item.priorClickRate.toFixed(1)}%. External demand and message relevance should both be reviewed.`}</p></article>; })}</div></section>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-[9.5px] text-muted-foreground">{label}</p><p className="mt-1 text-[15px] font-semibold text-card-foreground">{value}</p></div>; }

function CampaignResults({ release }: { release: Release }) {
  const { campaigns } = useMarketing();
  const result = RELEASE_RESULTS[release.id] ?? RELEASE_RESULTS.default;
  return <section><div className="mb-3"><h3 className="text-[15px] font-semibold text-card-foreground">Campaign performance</h3><p className="mt-1 text-[11px] text-muted-foreground">Each campaign in this publication, compared only with the same campaign in {release.comparison}.</p></div>
    {result.campaigns.length ? <div className="grid gap-3 lg:grid-cols-2">{result.campaigns.map((item) => { const campaign = campaigns.find((candidate) => candidate.id === item.campaignId); const delta = item.clickRate - item.priorClickRate; const used = campaignProperties(release.id, item.campaignId); const insight = CAMPAIGN_INSIGHTS[item.campaignId]; const priorBetter = delta < 0;
      return <article key={item.campaignId} className={`${panel} p-4`}>
        <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-brand">{campaign?.strategy === "text" ? <MessageSquare size={14} /> : <Mail size={14} />}</span><div className="min-w-0"><p className="truncate text-[12.5px] font-semibold text-card-foreground">{campaign?.name ?? item.campaignId}</p><p className="text-[10.5px] text-muted-foreground">{campaign?.timing ?? "Scheduled"}</p></div></div><span className={`shrink-0 rounded-sm px-2 py-1 text-[10.5px] font-semibold ${delta >= 0 ? "bg-brand-soft text-brand" : "bg-muted text-destructive"}`}>{delta >= 0 ? "+" : ""}{delta.toFixed(1)} pts</span></div>
        <div className="mt-4 grid grid-cols-3 gap-2"><Metric label="Click rate" value={`${item.clickRate.toFixed(1)}%`} /><Metric label="Click-to-book" value={`${item.clickToBook.toFixed(1)}%`} /><Metric label="Spam rate" value={`${item.spamRate.toFixed(2)}%`} /></div>
        <p className="mt-3 border-t border-border pt-3 text-[11.5px] font-medium text-card-foreground">{used === 0 ? "No properties use this publication for this campaign." : `${used} of ${TOTAL_PROPERTIES} properties use this publication for this campaign.`}</p>
        {insight && <div className="mt-3 flex gap-2 rounded-md bg-brand-soft/40 p-3"><Sparkles size={14} className="mt-0.5 shrink-0 text-brand" /><p className="text-[11.5px] leading-5 text-card-foreground"><strong>AI insight:</strong> {insight}</p></div>}
        <div className="mt-3 border-t border-border pt-3">{priorBetter ? <><p className="text-[11.5px] leading-5 text-muted-foreground">The previous version reached <strong className="text-card-foreground">{item.priorClickRate.toFixed(1)}% click rate</strong> — better than this one.</p><div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="brand" onClick={() => toast.success(`${campaign?.name ?? item.campaignId}: a new version with the previous content was created and sent to Review.`)}>Use previous version</Button><Button size="sm" variant="outline" onClick={() => toast.success("Current content kept.")}>Keep current</Button><Button size="sm" variant="ghost" asChild><Link to="/content"><Sparkles size={13} />Edit with AI</Link></Button></div></>
          : <p className="text-[11px] text-muted-foreground">Outperforms the comparison version ({item.priorClickRate.toFixed(1)}% click rate) — keep this one.</p>}</div>
      </article>; })}</div> : <div className={`${panel} p-6`}><p className="text-[12px] text-muted-foreground">Campaign results will appear after this publication starts.</p></div>}</section>;
}

type Tab = "overview" | "releases" | "campaigns";
function VersionActions({ release }: { release: Release }) {
  const [msg, setMsg] = useState("");
  if (release.id === ACTIVE_RELEASE_ID) return null;
  return <section className={`${panel} flex flex-wrap items-center gap-3 p-4`}><p className="min-w-0 flex-1 text-[12.5px] text-card-foreground">{msg || <><strong>Previous version.</strong> Using it creates a new current version — history is kept.</>}</p><Button variant="brand" size="sm" onClick={() => setMsg(`${release.name} will be published as a new current version after review.`)}>Use this version</Button><Button variant="outline" size="sm" onClick={() => setMsg("Current content kept.")}>Keep current</Button><Button variant="ghost" size="sm" asChild><Link to="/content"><Sparkles size={13} />Edit with AI</Link></Button></section>;
}

function PublicationWorkspace({ page }: { page: "releases" | "results" }) {
  const [selectedId, setSelectedId] = useSelectedRelease();
  const [tab, setTab] = useState<Tab>(page === "releases" ? "releases" : "overview");
  const release = RELEASES.find((item) => item.id === selectedId) ?? RELEASES[0];
  return <MarketingShell title="Results"><main className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-6"><PageHeader page="Results" /><div role="tablist" className="mb-5 flex gap-1 border-b border-border">{(["overview", "releases", "campaigns"] as Tab[]).map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-3 py-2 text-[13px] font-semibold capitalize ${tab === t ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-card-foreground"}`}>{t}</button>)}</div><div className="space-y-5"><PublicationPicker release={release} onSelect={setSelectedId} />{tab === "overview" && <><ResultSummary release={release} /><MonthlyResults release={release} /></>}{tab === "releases" && <><ReleaseSummary release={release} /><VersionActions release={release} /><Changes release={release} /><IncludedCampaigns release={release} /></>}{tab === "campaigns" && <CampaignResults release={release} />}</div></main></MarketingShell>;
}

export function ReleasesPage() { return <PublicationWorkspace page="releases" />; }
export function ResultsPage() { return <PublicationWorkspace page="results" />; }
import { useMemo } from "react";
import { Clover, Flag, Heart, PartyPopper, TreePine, Trophy, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ai/Sparkle";
import marathonImg from "@/assets/events/nyc-marathon.jpg";
import paradeImg from "@/assets/events/thanksgiving-parade.jpg";
import treeImg from "@/assets/events/rockefeller-tree.jpg";
import christmasImg from "@/assets/events/christmas-day.jpg";

type HorizonEvent = { name: string; at: number; note: string; tag: string; icon: LucideIcon; image?: string };

const DAY = 86_400_000;

const HORIZON: HorizonEvent[] = [
  { name: "NYC Marathon", at: Date.UTC(2026, 10, 1), note: "Five boroughs, 50,000 runners — the city's biggest watch weekend.", tag: "Sports", icon: Trophy, image: marathonImg },
  { name: "Macy's Thanksgiving Parade", at: Date.UTC(2026, 10, 26), note: "Balloons over Central Park West as families fill the city.", tag: "Holiday", icon: Flag, image: paradeImg },
  { name: "Rockefeller Tree Lighting", at: Date.UTC(2026, 11, 2), note: "Midtown lights up — a short walk from your front door.", tag: "Tradition", icon: TreePine, image: treeImg },
  { name: "Christmas Day", at: Date.UTC(2026, 11, 25), note: "A quiet, glowing city — made for a memorable stay.", tag: "Holiday", icon: Heart, image: christmasImg },
  { name: "New Year's Eve Ball Drop", at: Date.UTC(2026, 11, 31), note: "Times Square at your doorstep — the world watches from your rooms.", tag: "Holiday", icon: PartyPopper },
  { name: "Valentine's Day", at: Date.UTC(2027, 1, 14), note: "Romantic escapes and skyline dinners book out early.", tag: "Holiday", icon: Heart },
  { name: "St. Patrick's Day", at: Date.UTC(2027, 2, 17), note: "Fifth Avenue turns green for the city's oldest parade.", tag: "Tradition", icon: Clover },
];

function upcoming(count: number): HorizonEvent[] {
  const sorted = [...HORIZON].sort((a, b) => a.at - b.at);
  const future = sorted.filter((event) => event.at >= Date.now() - DAY);
  return (future.length >= count ? future : sorted.slice(-count)).slice(0, count);
}

const FAN = ["-rotate-6 translate-y-3", "-rotate-2 -translate-y-1", "rotate-2 -translate-y-1", "rotate-6 translate-y-3"];

const shortDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

function daysLabel(at: number): string {
  const diff = Math.ceil((at - Date.now()) / DAY);
  if (diff <= 0) return "Now";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export function StarterScreen({ onLocalize, onKeep }: { onLocalize: () => void; onKeep: () => void }) {
  const events = useMemo(() => upcoming(4), []);
  return (
    <section aria-label="Plan with AI" className="ai-surface relative -mx-4 overflow-hidden px-4 pb-16 pt-12 text-center sm:-mx-6 sm:px-6">
      <div aria-hidden className="ai-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]" />
      <div className="relative mx-auto max-w-4xl">
        <p className="starter-rise text-[11px] font-semibold uppercase tracking-wide text-brand">Holiday Inn Times Square · New York City</p>
        <h1 className="starter-rise mt-3 font-display text-[34px] font-semibold leading-tight text-card-foreground sm:text-[46px]" style={{ animationDelay: "60ms" }}>
          Events and holidays
          <br />
          on the <span className="ai-text">horizon</span>
        </h1>
        <p className="starter-rise mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground" style={{ animationDelay: "120ms" }}>
          The moments your guests will be talking about next — turned into timely text and email content, localized for the city outside your door.
        </p>
        <div className="mt-8 flex items-start justify-center py-6">
          {events.map((event, i) => {
            const Icon = event.icon;
            return (
              <div key={event.name} className="starter-rise -mx-2 sm:-mx-3" style={{ animationDelay: `${180 + i * 90}ms`, zIndex: i === 1 || i === 2 ? 10 : 5 }}>
                <article className={`group w-40 rounded-lg p-3 text-left shadow-lift transition-all duration-200 hover:z-20 hover:-translate-y-2 hover:rotate-0 sm:w-48 sm:p-4 ai-edge ${FAN[i]}`}>
                  <div className="relative h-24 overflow-hidden rounded-md sm:h-28">
                    {event.image ? (
                      <img src={event.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center bg-brand-soft/70 text-brand">
                        <Icon size={26} strokeWidth={1.75} />
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded-sm bg-card/90 px-1.5 py-0.5 text-[9.5px] font-semibold text-card-foreground shadow-sm backdrop-blur-sm">{shortDate.format(event.at)}</span>
                  </div>
                  <h2 className="mt-3 text-[13px] font-semibold leading-snug text-card-foreground sm:text-[14px]">{event.name}</h2>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{event.note}</p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide">
                    <span className="text-brand">{event.tag}</span>
                    <span className="text-muted-foreground">{daysLabel(event.at)}</span>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
        <div className="starter-rise mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "560ms" }}>
          <Button variant="brand" size="lg" className="ai-button" onClick={onLocalize}>
            <Sparkle size={15} />
            Localize with AI
          </Button>
          <Button variant="outline" size="lg" className="bg-card/70 backdrop-blur-sm" onClick={onKeep}>
            Keep current content
          </Button>
        </div>
        <p className="starter-rise mt-5 text-[10.5px] uppercase tracking-widest text-muted-foreground" style={{ animationDelay: "640ms" }}>
          Powered by Directful AI
        </p>
      </div>
    </section>
  );
}

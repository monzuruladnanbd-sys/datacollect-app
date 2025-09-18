import { CATALOG } from "@/lib/catalog";
import type { IndicatorSpec } from "@/lib/catalog.types";

const groups = [
  { title:"FISHERIES MANAGEMENT • Process", sector:"Fisheries Management", level:"process" },
  { title:"FISHERIES MANAGEMENT • Output",  sector:"Fisheries Management", level:"output" },
  { title:"FISHERIES MANAGEMENT • Outcome", sector:"Fisheries Management", level:"outcome" },
  { title:"CLIMATE ADAPTATION • Process", sector:"Climate Adaptation", level:"process" },
  { title:"CLIMATE ADAPTATION • Output",  sector:"Climate Adaptation", level:"output" },
  { title:"CLIMATE ADAPTATION • Outcome", sector:"Climate Adaptation", level:"outcome" },
  { title:"LIVELIHOODS • Process", sector:"Livelihoods", level:"process" },
  { title:"LIVELIHOODS • Output",  sector:"Livelihoods", level:"output" },
  { title:"LIVELIHOODS • Outcome", sector:"Livelihoods", level:"outcome" },
] as const;

export default function Dashboard() {
  return (
    <div className="space-y-10">
      {/* Add toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <a href="/api/export" className="border rounded px-3 py-2 bg-white">Download Excel</a>
      </div>
      {groups.map((g) => {
        const items = CATALOG.filter(i => i.sector===g.sector && i.level===g.level);
        return (
          <section key={g.title}>
            <h2 className="text-lg font-semibold mb-3">{g.title} <span className="text-gray-500 text-sm">({items.length} indicators)</span></h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(i => <IndicatorCard key={i.id} ind={i} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function IndicatorCard({ ind }: { ind: IndicatorSpec }) {
  return (
    <div className="bg-white border rounded p-4 flex flex-col gap-3">
      <div className="text-sm text-gray-500">{ind.id}</div>
      <div className="font-medium">{ind.title}</div>
      <div className="text-xs text-gray-500">Unit: {ind.unitOptions[0]} • Frequency: {ind.frequencyOptions[0]}</div>
      <div className="text-xs text-gray-400 line-clamp-2">{ind.description}</div>
      <a href={`/entry?focus=${encodeURIComponent(ind.id)}`} className="mt-2 inline-flex items-center justify-center border rounded px-3 py-2 hover:bg-gray-50">
        Open in Data Entry
      </a>
    </div>
  );
}
"use client";
export default function CheckList({
  options, value = [], onChange,
}: { options: string[]; value?: string[]; onChange: (v:string[])=>void }) {
  const safeValue = value || [];
  
  function toggle(opt: string) {
    onChange(safeValue.includes(opt) ? safeValue.filter(v=>v!==opt) : [...safeValue, opt]);
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(opt => (
        <label key={opt} className="inline-flex items-center gap-2">
          <input type="checkbox" checked={safeValue.includes(opt)} onChange={()=>toggle(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}



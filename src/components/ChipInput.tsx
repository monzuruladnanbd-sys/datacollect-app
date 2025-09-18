"use client";
import { useState } from "react";

export default function ChipInput({
  value = [], onChange, placeholder
}: { value?: string[]; onChange: (v:string[])=>void; placeholder?: string; }) {
  const [txt,setTxt] = useState("");
  const safeValue = value || [];
  
  function add(v?: string) {
    const t = (v ?? txt).trim();
    if (!t) return;
    if (!safeValue.includes(t)) onChange([...safeValue, t]);
    setTxt("");
  }
  function remove(item: string) { onChange(safeValue.filter(v => v !== item)); }
  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {safeValue.map(v => (
          <span key={v} className="px-2 py-1 rounded bg-gray-200 text-sm">
            {v} <button onClick={()=>remove(v)} className="ml-1 text-gray-600">×</button>
          </span>
        ))}
      </div>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder={placeholder ?? "Type and press Enter"}
        value={txt}
        onChange={e=>setTxt(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); add(); } }}
      />
    </div>
  );
}



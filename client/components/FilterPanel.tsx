import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface Filters {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  gender: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(filters);

  const apply = () => { onChange(local); setOpen(false); };
  const reset = () => {
    const def = { minAge: 18, maxAge: 50, maxDistance: 50, gender: "all" };
    setLocal(def); onChange(def);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-rose-400 hover:text-rose-500 transition shadow-sm">
        <SlidersHorizontal className="w-4 h-4"/>
        Filters
        {(filters.minAge !== 18 || filters.maxAge !== 50 || filters.maxDistance !== 50 || filters.gender !== "all") && (
          <span className="w-2 h-2 bg-rose-500 rounded-full"/>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">🎯 Filters</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Age Range */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Age Range: <span className="text-rose-500">{local.minAge} – {local.maxAge}</span>
              </label>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Min Age</span><span>{local.minAge}</span></div>
                  <input type="range" min="18" max="60" value={local.minAge}
                    onChange={e => setLocal({...local, minAge: Math.min(parseInt(e.target.value), local.maxAge - 1)})}
                    className="w-full accent-rose-500"/>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Max Age</span><span>{local.maxAge}</span></div>
                  <input type="range" min="18" max="70" value={local.maxAge}
                    onChange={e => setLocal({...local, maxAge: Math.max(parseInt(e.target.value), local.minAge + 1)})}
                    className="w-full accent-rose-500"/>
                </div>
              </div>
            </div>

            {/* Distance */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Max Distance: <span className="text-rose-500">{local.maxDistance} km</span>
              </label>
              <input type="range" min="5" max="200" step="5" value={local.maxDistance}
                onChange={e => setLocal({...local, maxDistance: parseInt(e.target.value)})}
                className="w-full accent-rose-500"/>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 km</span><span>50 km</span><span>200 km</span>
              </div>
            </div>

            {/* Gender */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">Show Me</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "all", label: "Everyone" },
                  { value: "female", label: "Women" },
                  { value: "male", label: "Men" },
                ].map(g => (
                  <button key={g.value} onClick={() => setLocal({...local, gender: g.value})}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                      local.gender === g.value
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition">
                Reset
              </button>
              <button onClick={apply} className="flex-1 py-3 text-white font-bold rounded-xl hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

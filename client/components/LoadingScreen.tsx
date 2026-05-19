import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("Finding your spark...");

  const messages = [
    "Finding your spark... 🔥",
    "Loading profiles nearby... 📍",
    "Almost ready... ✨",
  ];

  useEffect(() => {
    let p = 0;
    let msgIdx = 0;
    const interval = setInterval(() => {
      p += Math.random() * 25;
      if (p > 100) p = 100;
      setProgress(Math.round(p));
      if (p > 33 && msgIdx === 0) { msgIdx = 1; setText(messages[1]); }
      if (p > 66 && msgIdx === 1) { msgIdx = 2; setText(messages[2]); }
      if (p >= 100) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg,#f43f5e 0%,#fb923c 100%)" }}>
      <style>{`
        @keyframes logoBounce { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0);} 50%{opacity:1;transform:scale(1);} }
        .logo-bounce { animation: logoBounce 1.5s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .sparkle { animation: sparkle 2s ease-in-out infinite; }
      `}</style>

      {/* Sparkles */}
      {["top-20 left-[20%]","top-32 right-[15%]","bottom-40 left-[10%]","bottom-32 right-[20%]"].map((pos,i) => (
        <div key={i} className="sparkle absolute text-white/30 text-3xl"
          style={{ top: pos.includes("top") ? pos.split(" ")[0].replace("top-","") : "auto",
                   bottom: pos.includes("bottom") ? pos.split(" ")[0].replace("bottom-","") : "auto",
                   left: pos.includes("left") ? pos.split("left-")[1] : "auto",
                   right: pos.includes("right") ? pos.split("right-")[1] : "auto",
                   animationDelay: `${i * 0.4}s` }}>
          ✨
        </div>
      ))}

      {/* Logo */}
      <div className="logo-bounce mb-6">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-6xl shadow-2xl">
          🔥
        </div>
      </div>

      {/* App name */}
      <div className="fade-up text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-1">Spark</h1>
        <p className="text-white/70 text-sm">Find real connections nearby</p>
      </div>

      {/* Progress bar */}
      <div className="fade-up w-48">
        <div className="w-full bg-white/20 rounded-full h-1.5 mb-3">
          <div className="h-1.5 rounded-full bg-white transition-all duration-500"
            style={{ width: `${progress}%` }}/>
        </div>
        <p className="text-white/70 text-xs text-center">{text}</p>
      </div>
    </div>
  );
}

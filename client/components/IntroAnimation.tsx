import { useEffect, useState } from "react";

const INTRO_KEY = "spark_intro_seen";

export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

// Keep old name as alias for compatibility
export const useIntroSeen = hasSeenIntro;

export function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_KEY, "1");
  } catch {}
}

// ── SVG Characters ──────────────────────────────────────────────────────────

function Girl() {
  return (
    <svg width="120" height="220" viewBox="0 0 120 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hair */}
      <ellipse cx="60" cy="38" rx="28" ry="30" fill="#4a2c0a"/>
      <path d="M32 38 Q28 70 30 90" stroke="#4a2c0a" strokeWidth="8" strokeLinecap="round"/>
      <path d="M88 38 Q92 70 90 90" stroke="#4a2c0a" strokeWidth="8" strokeLinecap="round"/>
      {/* Face */}
      <ellipse cx="60" cy="45" rx="22" ry="24" fill="#f4c5a0"/>
      {/* Eyes */}
      <ellipse cx="52" cy="41" rx="4" ry="4.5" fill="#fff"/>
      <ellipse cx="68" cy="41" rx="4" ry="4.5" fill="#fff"/>
      <circle cx="53" cy="42" r="2.5" fill="#3d2314"/>
      <circle cx="69" cy="42" r="2.5" fill="#3d2314"/>
      <circle cx="54" cy="41" r="1" fill="#fff"/>
      <circle cx="70" cy="41" r="1" fill="#fff"/>
      {/* Eyelashes */}
      <path d="M48 37 Q50 35 52 36" stroke="#3d2314" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M64 36 Q66 34 68 36" stroke="#3d2314" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="46" cy="48" rx="5" ry="3" fill="#f9a8b0" fillOpacity="0.5"/>
      <ellipse cx="74" cy="48" rx="5" ry="3" fill="#f9a8b0" fillOpacity="0.5"/>
      {/* Nose */}
      <path d="M59 50 Q57 54 60 55 Q63 54 61 50" stroke="#c8956c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M53 59 Q60 65 67 59" stroke="#d4756a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Lips */}
      <path d="M54 59 Q60 63 66 59" fill="#e8836e" fillOpacity="0.6"/>
      {/* Neck */}
      <rect x="54" y="67" width="12" height="14" fill="#f4c5a0"/>
      {/* Dress - pink/rose */}
      <path d="M38 81 Q60 75 82 81 L90 160 Q60 170 30 160 Z" fill="#f472b6"/>
      <path d="M38 81 Q60 78 82 81 L78 110 Q60 115 42 110 Z" fill="#fb7185"/>
      {/* White collar */}
      <path d="M50 78 Q60 85 70 78 L66 90 Q60 95 54 90 Z" fill="white" fillOpacity="0.6"/>
      {/* Arms */}
      <path d="M38 85 Q20 110 22 130" stroke="#f4c5a0" strokeWidth="10" strokeLinecap="round"/>
      <path d="M82 85 Q100 110 98 130" stroke="#f4c5a0" strokeWidth="10" strokeLinecap="round"/>
      {/* Hands */}
      <ellipse cx="22" cy="133" rx="7" ry="6" fill="#f4c5a0"/>
      <ellipse cx="98" cy="133" rx="7" ry="6" fill="#f4c5a0"/>
      {/* Legs */}
      <rect x="44" y="158" width="14" height="45" rx="7" fill="#f4c5a0"/>
      <rect x="62" y="158" width="14" height="45" rx="7" fill="#f4c5a0"/>
      {/* Shoes */}
      <ellipse cx="51" cy="205" rx="11" ry="6" fill="#be185d"/>
      <ellipse cx="69" cy="205" rx="11" ry="6" fill="#be185d"/>
      {/* Hair bow */}
      <path d="M55 18 Q60 10 65 18 Q60 22 55 18Z" fill="#fb7185"/>
      <path d="M65 18 Q70 10 75 18 Q65 24 65 18Z" fill="#fb7185"/>
      <circle cx="65" cy="18" r="4" fill="#f43f5e"/>
    </svg>
  );
}

function Boy() {
  return (
    <svg width="120" height="220" viewBox="0 0 120 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hair */}
      <ellipse cx="60" cy="36" rx="24" ry="22" fill="#2d1b00"/>
      <path d="M36 36 Q37 20 60 16 Q83 20 84 36" fill="#2d1b00"/>
      {/* Face */}
      <ellipse cx="60" cy="48" rx="22" ry="23" fill="#d4956a"/>
      {/* Jaw shadow */}
      <path d="M42 58 Q60 72 78 58 Q74 68 60 70 Q46 68 42 58Z" fill="#c07d52" fillOpacity="0.4"/>
      {/* Eyes */}
      <ellipse cx="52" cy="43" rx="4" ry="4" fill="#fff"/>
      <ellipse cx="68" cy="43" rx="4" ry="4" fill="#fff"/>
      <circle cx="53" cy="44" r="2.5" fill="#1a0f00"/>
      <circle cx="69" cy="44" r="2.5" fill="#1a0f00"/>
      <circle cx="54" cy="43" r="1" fill="#fff"/>
      <circle cx="70" cy="43" r="1" fill="#fff"/>
      {/* Eyebrows */}
      <path d="M46 37 Q52 34 57 36" stroke="#2d1b00" strokeWidth="2" strokeLinecap="round"/>
      <path d="M63 36 Q68 34 74 37" stroke="#2d1b00" strokeWidth="2" strokeLinecap="round"/>
      {/* Nose */}
      <path d="M58 50 Q56 55 60 57 Q64 55 62 50" stroke="#b07244" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M52 62 Q60 68 68 62" stroke="#c07052" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Stubble */}
      <ellipse cx="60" cy="65" rx="14" ry="6" fill="#c07d52" fillOpacity="0.2"/>
      {/* Neck */}
      <rect x="53" y="68" width="14" height="14" fill="#d4956a"/>
      {/* Shirt - navy blue */}
      <path d="M35 82 Q60 76 85 82 L92 165 Q60 172 28 165 Z" fill="#1e40af"/>
      <path d="M35 82 Q60 78 85 82 L80 108 Q60 113 40 108 Z" fill="#1d4ed8"/>
      {/* Collar */}
      <path d="M50 79 L60 92 L70 79 L66 79 L60 87 L54 79Z" fill="white" fillOpacity="0.5"/>
      {/* Arms */}
      <path d="M35 88 Q16 115 18 138" stroke="#d4956a" strokeWidth="12" strokeLinecap="round"/>
      <path d="M85 88 Q104 115 102 138" stroke="#d4956a" strokeWidth="12" strokeLinecap="round"/>
      {/* Shirt sleeves */}
      <path d="M35 88 Q20 108 20 125" stroke="#1e40af" strokeWidth="10" strokeLinecap="round"/>
      <path d="M85 88 Q100 108 100 125" stroke="#1e40af" strokeWidth="10" strokeLinecap="round"/>
      {/* Hands */}
      <ellipse cx="18" cy="140" rx="8" ry="7" fill="#d4956a"/>
      <ellipse cx="102" cy="140" rx="8" ry="7" fill="#d4956a"/>
      {/* Pants */}
      <rect x="37" y="163" width="20" height="48" rx="8" fill="#1e293b"/>
      <rect x="63" y="163" width="20" height="48" rx="8" fill="#1e293b"/>
      {/* Shoes */}
      <ellipse cx="47" cy="213" rx="14" ry="6" fill="#0f172a"/>
      <ellipse cx="73" cy="213" rx="14" ry="6" fill="#0f172a"/>
      {/* Belt */}
      <rect x="37" y="160" width="46" height="7" rx="3" fill="#78350f"/>
      <rect x="55" y="161" width="10" height="5" rx="2" fill="#d4af37"/>
    </svg>
  );
}

function Heart({ size = 32, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ opacity }}>
      <path d="M16 28 C16 28 4 20 4 11 C4 7 7 4 11 4 C13.5 4 15.5 5.5 16 7 C16.5 5.5 18.5 4 21 4 C25 4 28 7 28 11 C28 20 16 28 16 28Z" fill="#f43f5e"/>
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<"walking"|"meeting"|"hearts"|"fadeout">("walking");

  useEffect(() => {
    // Phase timeline
    const t1 = setTimeout(() => setPhase("meeting"), 2200);
    const t2 = setTimeout(() => setPhase("hearts"), 3200);
    const t3 = setTimeout(() => setPhase("fadeout"), 4800);
    const t4 = setTimeout(() => {
      markIntroSeen();
      onComplete();
    }, 5600);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fff0f3 0%, #ffe4f0 40%, #ffd6e8 70%, #ffc2dd 100%)",
        animation: phase === "fadeout" ? "introFadeOut 0.8s ease forwards" : undefined,
      }}
    >
      <style>{`
        @keyframes introFadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(1.04); }
        }
        @keyframes walkInLeft {
          from { transform: translateX(-300px); }
          to { transform: translateX(0); }
        }
        @keyframes walkInRight {
          from { transform: translateX(300px); }
          to { transform: translateX(0); }
        }
        @keyframes meetBounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.06); }
          70% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        @keyframes floatHeart1 {
          0% { opacity:0; transform: translate(0,0) scale(0.4); }
          30% { opacity:1; }
          100% { opacity:0; transform: translate(-30px,-90px) scale(1.1); }
        }
        @keyframes floatHeart2 {
          0% { opacity:0; transform: translate(0,0) scale(0.3); }
          30% { opacity:1; }
          100% { opacity:0; transform: translate(20px,-110px) scale(1.3); }
        }
        @keyframes floatHeart3 {
          0% { opacity:0; transform: translate(0,0) scale(0.5); }
          30% { opacity:1; }
          100% { opacity:0; transform: translate(40px,-75px) scale(0.9); }
        }
        @keyframes floatHeart4 {
          0% { opacity:0; transform: translate(0,0) scale(0.2); }
          30% { opacity:1; }
          100% { opacity:0; transform: translate(-50px,-60px) scale(0.7); }
        }
        @keyframes sparkleIn {
          0% { opacity:0; transform: scale(0) rotate(0deg); }
          60% { opacity:1; transform: scale(1.2) rotate(15deg); }
          100% { opacity:1; transform: scale(1) rotate(0deg); }
        }
        @keyframes textReveal {
          from { opacity:0; transform: translateY(12px); }
          to { opacity:1; transform: translateY(0); }
        }
        @keyframes walkBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .girl-walk {
          animation: walkInLeft 2s cubic-bezier(0.25,0.46,0.45,0.94) forwards,
                     walkBob 0.5s ease-in-out infinite;
        }
        .boy-walk {
          animation: walkInRight 2s cubic-bezier(0.25,0.46,0.45,0.94) forwards,
                     walkBob 0.5s ease-in-out 0.25s infinite;
        }
        .meet-bounce {
          animation: meetBounce 0.6s ease forwards;
        }
        .heart-float-1 { animation: floatHeart1 1.4s ease forwards; }
        .heart-float-2 { animation: floatHeart2 1.6s ease 0.15s forwards; }
        .heart-float-3 { animation: floatHeart3 1.3s ease 0.3s forwards; }
        .heart-float-4 { animation: floatHeart4 1.5s ease 0.08s forwards; }
        .sparkle-in { animation: sparkleIn 0.5s ease forwards; }
        .text-reveal { animation: textReveal 0.6s ease 0.2s both; }
        .text-reveal-2 { animation: textReveal 0.6s ease 0.5s both; }
      `}</style>

      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{position:"absolute",top:"10%",left:"5%",width:200,height:200,borderRadius:"50%",background:"rgba(251,113,133,0.08)"}}/>
        <div style={{position:"absolute",bottom:"15%",right:"8%",width:280,height:280,borderRadius:"50%",background:"rgba(244,63,94,0.06)"}}/>
        <div style={{position:"absolute",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"rgba(255,255,255,0.4)"}}/>
        {/* Ground line */}
        <div style={{position:"absolute",bottom:"22%",left:0,right:0,height:3,background:"rgba(244,63,94,0.15)",borderRadius:2}}/>
      </div>

      {/* Main scene */}
      <div className="relative flex flex-col items-center">

        {/* Characters row */}
        <div className="flex items-end gap-0" style={{ minHeight: 230, position: "relative" }}>

          {/* Girl */}
          <div
            className={phase === "walking" ? "girl-walk" : phase === "meeting" ? "meet-bounce" : ""}
            style={{
              transformOrigin: "bottom center",
              marginRight: phase === "meeting" || phase === "hearts" || phase === "fadeout" ? -18 : 40,
              transition: phase !== "walking" ? "margin 0.5s ease" : undefined,
              zIndex: 2,
            }}
          >
            <Girl />
          </div>

          {/* Hearts burst (center between them) */}
          {(phase === "hearts" || phase === "fadeout") && (
            <div style={{ position: "absolute", left: "50%", bottom: 120, transform: "translateX(-50%)", zIndex: 10 }}>
              <div className="heart-float-1" style={{ position: "absolute", left: -10, bottom: 0 }}><Heart size={28}/></div>
              <div className="heart-float-2" style={{ position: "absolute", left: 5, bottom: 0 }}><Heart size={38}/></div>
              <div className="heart-float-3" style={{ position: "absolute", left: 20, bottom: 0 }}><Heart size={22}/></div>
              <div className="heart-float-4" style={{ position: "absolute", left: -25, bottom: 0 }}><Heart size={18}/></div>
            </div>
          )}

          {/* Meeting sparkle */}
          {(phase === "meeting" || phase === "hearts" || phase === "fadeout") && (
            <div className="sparkle-in" style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", fontSize: 36, zIndex: 5 }}>
              ✨
            </div>
          )}

          {/* Boy */}
          <div
            className={phase === "walking" ? "boy-walk" : phase === "meeting" ? "meet-bounce" : ""}
            style={{
              transformOrigin: "bottom center",
              marginLeft: phase === "meeting" || phase === "hearts" || phase === "fadeout" ? -18 : 40,
              transition: phase !== "walking" ? "margin 0.5s ease" : undefined,
              zIndex: 2,
            }}
          >
            {/* Mirror boy horizontally */}
            <div style={{ transform: "scaleX(-1)" }}>
              <Boy />
            </div>
          </div>
        </div>

        {/* Logo and tagline */}
        {(phase === "hearts" || phase === "fadeout") && (
          <div className="text-center mt-6">
            <div className="text-reveal flex items-center justify-center gap-2 mb-2">
              <span style={{ fontSize: 38 }}>🔥</span>
              <span style={{
                fontSize: 42,
                fontWeight: 900,
                background: "linear-gradient(135deg, #f43f5e, #fb923c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
                fontFamily: "system-ui, sans-serif",
              }}>Spark</span>
            </div>
            <p className="text-reveal-2" style={{ color: "#9f1239", fontSize: 16, fontWeight: 500 }}>
              Where real connections begin ❤️
            </p>
          </div>
        )}

        {/* Skip button */}
        <button
          onClick={() => { markIntroSeen(); onComplete(); }}
          className="absolute text-xs text-rose-300 hover:text-rose-500 transition-colors"
          style={{ bottom: -60, right: -80 }}
        >
          Skip intro →
        </button>
      </div>
    </div>
  );
}

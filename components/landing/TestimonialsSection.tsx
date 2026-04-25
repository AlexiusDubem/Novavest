"use client";

import { useState } from "react";
import { TestimonialCard } from "@/components/ui/testimonial-cards";

const testimonials = [
  {
    id: 1,
    testimonial: "The precision of BOLDWAVE's algorithmic grid is unmatched. Our portfolio ROI expanded by 22% in the first quarter alone.",
    author: "Marcello G. - Asset Manager @ FinTech Global"
  },
  {
    id: 2,
    testimonial: "Integrating our treasury with BOLDWAVE was the best strategic move this year. The 24/7 liquidity pulse is game-changing.", 
    author: "Elena S. - Risk Analyst @ Credit Suisse"
  },
  {
    id: 3,
    testimonial: "Institutional security meets radical transparency. I've never seen a trading terminal this polished and reliable.",
    author: "David R. - Lead Trader @ Sovereign Wealth"
  }
];

export function TestimonialsSection() {
  const [positions, setPositions] = useState(["front", "middle", "back"]);

  const handleShuffle = () => {
    setPositions((prev) => {
      const newPositions = [...prev];
      newPositions.unshift(newPositions.pop()!);
      return newPositions;
    });
  };

  return (
    <section className="relative overflow-hidden landing-section-dark py-24 sm:py-32">
       {/* Background decorative elements */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
       
       <div className="container relative z-10 mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-20 lg:flex-row">
             <div className="max-w-xl space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 shadow-sm">
                   <ShieldCheck size={14} />
                   Institutional Trust
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-white sm:text-6xl leading-tight">
                   Validated by the <br />
                   <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent italic">World's Best.</span>
                </h2>
                <p className="text-lg font-medium leading-relaxed text-slate-400">
                   Join 45,000+ institutional traders who rely on BOLDWAVE for high-frequency asset management and secure treasury growth.
                </p>
                <div className="flex items-center gap-8 pt-4">
                   <div>
                      <p className="text-3xl font-black text-white">45k+</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Terminals</p>
                   </div>
                   <div className="h-10 w-px bg-white/10" />
                   <div>
                      <p className="text-3xl font-black text-white">$2.4B</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assets Managed</p>
                   </div>
                </div>
             </div>

             <div className="relative h-[450px] w-full max-w-[400px] flex justify-center">
                <div className="relative h-[450px] w-[350px]">
                  {testimonials.map((testimonial, index) => (
                    <TestimonialCard
                      key={testimonial.id}
                      {...testimonial}
                      handleShuffle={handleShuffle}
                      position={positions[index]}
                    />
                  ))}
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

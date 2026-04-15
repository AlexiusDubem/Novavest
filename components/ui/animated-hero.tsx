"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["INSTITUTIONAL", "RELIABLE", "REVOLUTIONARY", "AUTHENTIC", "DECENTRALIZED"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4 rounded-full px-6 font-black uppercase tracking-widest text-[10px] border border-slate-200 shadow-sm">
              Read our mission statement <MoveRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-black text-slate-900 leading-[1.1]">
              <span className="block text-slate-500/80">BOLDWAVE is</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                <AnimatePresence mode="wait">
                  {titles.map((title, index) => (
                    titleNumber === index && (
                      <motion.span
                        key={index}
                        className="absolute font-black text-slate-950"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      >
                        {title}
                      </motion.span>
                    )
                  ))}
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-slate-500 max-w-2xl text-center font-bold">
              Secure your financial future with our enterprise-grade algorithmic trading platform. 
              Built for precision, transparency, and high-frequency growth.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" className="gap-4 rounded-2xl h-16 px-10 border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs" variant="outline">
              Explore Mandates <TrendingUp className="w-4 h-4 text-emerald-500" />
            </Button>
            <Button size="lg" className="gap-4 rounded-2xl h-16 px-10 bg-slate-950 text-white font-black uppercase tracking-widest text-xs shadow-2xl">
              Get Started <MoveRight className="w-4 h-4 text-emerald-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };

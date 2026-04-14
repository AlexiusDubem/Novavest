"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TestimonialCard ({ handleShuffle, testimonial, position, id, author }) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? "10" : position === "middle" ? "5" : "0"
      }}
      animate={{
        rotate: position === "front" ? "-4deg" : position === "middle" ? "0deg" : "4deg",
        x: position === "front" ? "0%" : position === "middle" ? "35%" : "70%",
        scale: position === "front" ? 1 : position === "middle" ? 0.95 : 0.9,
        opacity: position === "back" ? 0.5 : 1
      }}
      drag={isFront ? "x" : false}
      dragElastic={0.4}
      dragConstraints={{
        left: -100,
        right: 100
      }}
      onDragStart={(e, info) => {
        dragRef.current = info.point.x;
      }}
      onDragEnd={(e, info) => {
        const distance = dragRef.current - info.point.x;
        if (Math.abs(distance) > 100) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`absolute left-0 top-0 grid h-[420px] w-[320px] sm:h-[450px] sm:w-[350px] select-none place-content-center space-y-8 rounded-[40px] border border-slate-200 bg-white p-8 shadow-2xl transition-shadow ${
        isFront ? "cursor-grab active:cursor-grabbing hover:shadow-emerald-500/10" : ""
      }`}
    >
      <div className="relative mx-auto">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 blur opacity-25" />
        <img
          src={`https://i.pravatar.cc/128?img=${id}`}
          alt={`Avatar of ${author}`}
          className="relative h-24 w-24 rounded-full border-4 border-white bg-slate-100 object-cover shadow-xl"
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-center gap-1">
           {[...Array(5)].map((_, i) => (
             <svg key={i} className="h-4 w-4 text-emerald-500 fill-current" viewBox="0 0 20 20">
               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
             </svg>
           ))}
        </div>
        <p className="text-center text-lg font-bold italic leading-relaxed text-slate-900 tracking-tight px-2">
          "{testimonial}"
        </p>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Authenticated Pulse</p>
        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{author}</p>
      </div>
    </motion.div>
  );
};

"use client";

import React, { CSSProperties, useEffect, useRef } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  lightWidth?: number;
  duration?: number;
  lightColor?: string;
  borderWidth?: number;
  className?: string;
  [key: string]: unknown;
}

export function BorderBeam({
  lightWidth = 200,
  duration = 10,
  lightColor = "#FAFAFA",
  borderWidth = 1,
  className,
  ...props
}: BorderBeamProps) {
  const pathRef = useRef<HTMLDivElement>(null);

  const updatePath = () => {
    if (pathRef.current) {
      const div = pathRef.current;
      div.style.setProperty(
        "--path",
        `path("M 0 0 H ${div.offsetWidth} V ${div.offsetHeight} H 0 V 0")`
      );
    }
  };

  useEffect(() => {
    updatePath();
    window.addEventListener("resize", updatePath);

    return () => {
      window.removeEventListener("resize", updatePath);
    };
  }, []);

  return (
    <div
      style={
        {
          "--duration": duration,
          "--border-width": `${borderWidth}px`,
        } as CSSProperties
      }
      ref={pathRef}
      className={cn(
        `absolute z-0 h-full w-full rounded-[inherit]`,
        `after:absolute after:inset-[var(--border-width)] after:rounded-[inherit] after:content-['']`,
        "border-[length:var(--border-width)] ![mask-clip:padding-box,border-box]",
        "![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(red,red)]",
        `before:absolute before:inset-0 before:z-[-1] before:rounded-[inherit] before:border-[length:var(--border-width)] before:border-black/10 dark:before:border-white/10`,
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 aspect-square bg-[radial-gradient(ellipse_at_center,var(--light-color),transparent,transparent)]"
        style={
          {
            "--light-color": lightColor,
            "--light-width": `${lightWidth}px`,
            width: "var(--light-width)",
            offsetPath: "var(--path)",
          } as CSSProperties
        }
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

export function EmailTemplatePlaceholderBox() {
  return (
    <div className="relative h-full w-full rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800  overflow-hidden">
      <BorderBeam
        lightWidth={300}
        duration={12}
        lightColor="#3b82f6"
        borderWidth={2}
        className="rounded-lg"
      />
      <div className="relative p-4 z-10 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Placeholders
        </h3>
        <div className="space-y-3">
          <div className="rounded-md bg-white/50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Person Name
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
              {"{name}"}
            </div>
          </div>
          <div className="rounded-md bg-white/50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Company Name
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
              {"{company}"}
            </div>
          </div>
          <div className="rounded-md bg-white/50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              App Name
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
              {"{appname}"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

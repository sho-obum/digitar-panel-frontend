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
  const placeholders = [
    { label: "Name", value: "{name}" },
    { label: "Company", value: "{company}" },
    { label: "App Name", value: "{appname}" },
    { label: "Email", value: "{email}" },
    { label: "Phone", value: "{phone}" },
    { label: "Position", value: "{position}" },
  ];

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    // Optional: Show a toast notification
    console.log(`Copied: ${value}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Available Variables:
        </span>
        <span className="text-xs text-muted-foreground">
          (Click to copy)
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {placeholders.map((placeholder) => (
          <button
            key={placeholder.value}
            onClick={() => handleCopy(placeholder.value)}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              bg-emerald-50 dark:bg-emerald-950/30 
              text-emerald-700 dark:text-emerald-400 
              border border-emerald-200 dark:border-emerald-800
              hover:bg-emerald-100 dark:hover:bg-emerald-900/40
              hover:border-emerald-300 dark:hover:border-emerald-700
              hover:shadow-sm hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/50
              transition-all duration-200 
              active:scale-95
              cursor-pointer"
          >
            <span>{placeholder.label}</span>
            <code className="text-[10px] font-mono opacity-70 group-hover:opacity-100 transition-opacity">
              {placeholder.value}
            </code>
          </button>
        ))}
      </div>
    </div>
  );
}


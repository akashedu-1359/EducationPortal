"use client";

import type { CSSProperties } from "react";

interface BookLoaderProps {
  text?: string;
}

const PAGES = [0, 1, 2] as const;

const PAGE_COLORS = [
  "linear-gradient(to right, #f6ede0, #fdf8f3)",
  "linear-gradient(to right, #eee4d4, #f8f1e8)",
  "linear-gradient(to right, #e6dbcc, #f2ebe0)",
];

const LINE_TOPS = [18, 30, 42, 54, 66];

export function BookLoader({ text = "Loading…" }: BookLoaderProps) {
  return (
    <div
      role="status"
      aria-label={text}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      {/* ── Book ── */}
      <div style={{ position: "relative", width: 128, height: 96 }}>
        {/* Drop shadow */}
        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100,
            height: 12,
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.22) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* ── Left cover (high z-index hides flipped-page snap-back) ── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 60,
            height: 96,
            background:
              "linear-gradient(150deg, #0f2a4a 0%, #1a3f72 55%, #1e4d8c 100%)",
            borderRadius: "4px 0 0 4px",
            zIndex: 8,
            boxShadow: "inset -3px 0 6px rgba(0,0,0,0.25), 2px 0 8px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
        >
          {/* Shine sweep across cover */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "40%",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
              animation: "bookCoverShine 3s ease-in-out infinite",
            }}
          />
          {/* Gold title lines */}
          {[14, 18, 72, 76].map((top) => (
            <div
              key={top}
              style={{
                position: "absolute",
                top,
                left: 8,
                right: 8,
                height: top % 4 === 2 ? 2 : 1,
                background:
                  "linear-gradient(90deg, transparent, #c9a227 30%, #f4d03f 50%, #c9a227 70%, transparent)",
                opacity: 0.85,
              }}
            />
          ))}
          {/* Small emblem dot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "1.5px solid rgba(201,162,39,0.6)",
              boxShadow: "0 0 6px rgba(244,208,63,0.3)",
            }}
          />
        </div>

        {/* ── Spine ── */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 0,
            width: 8,
            height: 96,
            background:
              "linear-gradient(180deg, #7a5710 0%, #c9a227 18%, #f4d03f 50%, #c9a227 82%, #7a5710 100%)",
            zIndex: 9,
            boxShadow: "1px 0 4px rgba(0,0,0,0.2), -1px 0 4px rgba(0,0,0,0.2)",
          }}
        />

        {/* ── Right cover (background, z-index 0) ── */}
        <div
          style={{
            position: "absolute",
            left: 68,
            top: 0,
            width: 60,
            height: 96,
            background:
              "linear-gradient(150deg, #1e4d8c 0%, #1a3f72 55%, #0f2a4a 100%)",
            borderRadius: "0 4px 4px 0",
            zIndex: 0,
            boxShadow: "inset 2px 0 6px rgba(0,0,0,0.25)",
          }}
        />

        {/* ── Pages ── */}
        {PAGES.map((i) => (
          <div
            key={i}
            style={
              {
                position: "absolute",
                left: 68,
                top: 3,
                width: 56,
                height: 90,
                background: PAGE_COLORS[i],
                borderRadius: "0 3px 3px 0",
                transformOrigin: "0 50%",
                animationName: "bookPageTurn",
                animationDuration: "1.4s",
                animationDelay: `${i * 0.47}s`,
                animationTimingFunction: "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
                animationIterationCount: "infinite",
                animationFillMode: "both",
                boxShadow:
                  "inset -4px 0 8px rgba(0,0,0,0.07), 1px 0 3px rgba(0,0,0,0.06)",
              } as CSSProperties
            }
          >
            {/* Ruled lines */}
            {LINE_TOPS.map((top) => (
              <div
                key={top}
                style={{
                  position: "absolute",
                  left: 7,
                  right: 7,
                  top,
                  height: 1,
                  background: "rgba(99,115,190,0.13)",
                  borderRadius: 1,
                }}
              />
            ))}
            {/* Page-edge curl shadow */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 6,
                background:
                  "linear-gradient(to left, rgba(0,0,0,0.06), transparent)",
                borderRadius: "0 3px 3px 0",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Label ── */}
      {text && (
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#475569",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            animation: "bookTextPulse 1.4s ease-in-out infinite",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}

export function FullBookLoader({ text }: { text?: string }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      <BookLoader text={text} />
    </div>
  );
}

"use client";

import { useState } from "react";

interface Table {
  id: string;
  label: string;
  minCapacity: number;
  maxCapacity: number;
  tableType: string;
}

interface FloorPlanProps {
  tables: Table[];
  selectedTable: string | null;
  onSelectTable: (id: string) => void;
  guestCount: number;
}

// Predefined layout positions for tables (SVG-based)
const TABLE_POSITIONS: Record<string, { x: number; y: number; shape: "circle" | "rect" | "oval"; rotation?: number }> = {
  t1: { x: 80, y: 100, shape: "rect" },
  t2: { x: 260, y: 80, shape: "oval" },
  t3: { x: 160, y: 180, shape: "rect" },
  t4: { x: 80, y: 260, shape: "circle" },
  t5: { x: 240, y: 200, shape: "rect" },
  t6: { x: 320, y: 120, shape: "oval" },
  t7: { x: 160, y: 80, shape: "rect" },
  t8: { x: 80, y: 180, shape: "circle" },
  t9: { x: 280, y: 260, shape: "rect", rotation: 45 },
  t10: { x: 180, y: 260, shape: "circle" },
};

const TYPE_LABELS: Record<string, string> = {
  STANDARD: "Стандарт",
  VIP: "VIP",
  OUTDOOR: "Терраса",
  BAR: "Бар",
};

function getDefaultPosition(index: number) {
  const cols = 3;
  const spacingX = 130;
  const spacingY = 120;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: 80 + col * spacingX,
    y: 80 + row * spacingY,
    shape: index % 3 === 0 ? "circle" as const : index % 3 === 1 ? "rect" as const : "oval" as const,
  };
}

export function FloorPlan({ tables, selectedTable, onSelectTable, guestCount }: FloorPlanProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  const maxX = Math.max(...tables.map((_, i) => {
    const pos = TABLE_POSITIONS[tables[i].id] || getDefaultPosition(i);
    return pos.x;
  })) + 100;

  const maxY = Math.max(...tables.map((_, i) => {
    const pos = TABLE_POSITIONS[tables[i].id] || getDefaultPosition(i);
    return pos.y;
  })) + 100;

  const viewBox = `0 0 ${Math.max(maxX, 400)} ${Math.max(maxY, 340)}`;

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}>
      {/* Legend */}
      <div style={{ display: "flex", gap: 12, padding: "8px 12px", fontSize: 10, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(139,109,71,0.15)", border: "1px solid var(--color-primary)" }} /> Доступен
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--color-primary)" }} /> Выбран
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }} /> Не подходит
        </span>
      </div>

      <svg viewBox={viewBox} style={{ width: "100%", height: "auto", minHeight: 240 }}>
        {/* Floor decorations */}
        <defs>
          <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <filter id="table-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#floor-grid)" />

        {/* Entrance marker */}
        <g transform={`translate(${Math.max(maxX, 400) / 2 - 30}, ${Math.max(maxY, 340) - 30})`}>
          <rect x="0" y="0" width="60" height="20" rx="4" fill="none" stroke="var(--color-text-muted)" strokeWidth="1" strokeDasharray="4" />
          <text x="30" y="14" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontFamily="inherit">Вход</text>
        </g>

        {/* Tables */}
        {tables.map((table, idx) => {
          const pos = TABLE_POSITIONS[table.id] || getDefaultPosition(idx);
          const isSelected = selectedTable === table.id;
          const isHovered = hoveredTable === table.id;
          const canFit = table.minCapacity <= guestCount && table.maxCapacity >= guestCount;
          const isVip = table.tableType === "VIP";

          const fillColor = isSelected
            ? "var(--color-primary)"
            : canFit
              ? isHovered ? "rgba(139,109,71,0.25)" : "rgba(139,109,71,0.1)"
              : "var(--color-bg-secondary)";

          const strokeColor = isSelected
            ? "var(--color-primary)"
            : canFit
              ? "var(--color-primary)"
              : "var(--color-border)";

          const textColor = isSelected ? "#fff" : canFit ? "var(--color-text-primary)" : "var(--color-text-muted)";

          // Chair positions around table
          const chairCount = table.maxCapacity;
          const chairRadius = pos.shape === "circle" ? 32 : 38;

          return (
            <g
              key={table.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: canFit ? "pointer" : "not-allowed", transition: "all 0.2s ease" }}
              onClick={() => canFit && onSelectTable(table.id)}
              onMouseEnter={() => setHoveredTable(table.id)}
              onMouseLeave={() => setHoveredTable(null)}
            >
              {/* Chairs */}
              {Array.from({ length: Math.min(chairCount, 8) }).map((_, ci) => {
                const angle = (ci / Math.min(chairCount, 8)) * Math.PI * 2 - Math.PI / 2;
                const cx = Math.cos(angle) * chairRadius;
                const cy = Math.sin(angle) * chairRadius;
                return (
                  <circle
                    key={ci}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={isSelected ? "rgba(139,109,71,0.4)" : "var(--color-bg-secondary)"}
                    stroke={strokeColor}
                    strokeWidth="1"
                  />
                );
              })}

              {/* Table shape */}
              {pos.shape === "circle" && (
                <circle cx="0" cy="0" r="22" fill={fillColor} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} filter="url(#table-shadow)" />
              )}
              {pos.shape === "rect" && (
                <rect x="-28" y="-18" width="56" height="36" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} filter="url(#table-shadow)" />
              )}
              {pos.shape === "oval" && (
                <ellipse cx="0" cy="0" rx="30" ry="18" fill={fillColor} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} filter="url(#table-shadow)" />
              )}

              {/* VIP badge */}
              {isVip && (
                <g transform="translate(16, -18)">
                  <rect x="-10" y="-6" width="20" height="12" rx="3" fill="var(--color-primary)" />
                  <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="600" fontFamily="inherit">VIP</text>
                </g>
              )}

              {/* Table label */}
              <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="11" fontWeight="500" fontFamily="inherit">
                {table.label}
              </text>

              {/* Capacity label */}
              <text x="0" y="14" textAnchor="middle" fill={textColor} fontSize="8" opacity="0.7" fontFamily="inherit">
                {table.minCapacity}-{table.maxCapacity}
              </text>

              {/* Hover tooltip */}
              {isHovered && (
                <g transform="translate(0, -42)">
                  <rect x="-45" y="-14" width="90" height="28" rx="6" fill="var(--color-bg-card)" stroke="var(--color-border)" strokeWidth="1" filter="url(#table-shadow)" />
                  <text x="0" y="-1" textAnchor="middle" fill="var(--color-text-primary)" fontSize="9" fontWeight="500" fontFamily="inherit">
                    {TYPE_LABELS[table.tableType] || table.tableType}
                  </text>
                  <text x="0" y="9" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8" fontFamily="inherit">
                    {table.minCapacity}-{table.maxCapacity} мест
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

import React from "react";
export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}
export function SectionLabel({ children }) {
  return <h2 className="section-title">{children}</h2>;
}

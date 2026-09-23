import React, { useEffect, useRef } from "react";
import { X, ArrowLeft, ChevronRight, Check, ShieldCheck } from "lucide-react";
export function Header({ title, onBack, action }) {
  return (
    <header className="topbar">
      <button className="icon-button" aria-label="Go back" onClick={onBack}>
        <ArrowLeft size={19} />
      </button>
      <h1>{title}</h1>
      {action || <ShieldCheck size={20} className="brand-icon" />}
    </header>
  );
}
export function Modal({ title, children, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const last = document.activeElement;
    ref.current.showModal();
    return () => {
      ref.current?.close();
      last?.focus?.();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-top">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Toggle({ label, detail, value, onChange }) {
  return (
    <button
      className="setting-row"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
    >
      <span className="row-copy">
        <b>{label}</b>
        {detail && <small>{detail}</small>}
      </span>
      <span className={"toggle " + (value ? "on" : "")}>
        <span />
      </span>
    </button>
  );
}
export function Row({ icon: Icon, title, detail, onClick, danger = false }) {
  return (
    <button
      className={"setting-row " + (danger ? "danger-text" : "")}
      onClick={onClick}
    >
      {Icon && (
        <span className="row-icon">
          <Icon size={19} />
        </span>
      )}
      <span className="row-copy">
        <b>{title}</b>
        {detail && <small>{detail}</small>}
      </span>
      <ChevronRight size={17} />
    </button>
  );
}
export function Section({ title, children }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      <div className="card">{children}</div>
    </section>
  );
}
export function Empty({ title, children }) {
  return (
    <div className="empty">
      <ShieldCheck size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function CheckRow({ checked, onChange, children }) {
  return (
    <label className="check-row">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkbox-visual">{checked && <Check size={13} />}</span>
      <span>{children}</span>
    </label>
  );
}
export function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
export function TextField({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={3} {...props} />
    </label>
  );
}

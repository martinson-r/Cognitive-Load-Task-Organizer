import { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap.ts";
import { ColorPair } from "../constants/TaskOptions";

interface SelectOption {
  value: string;
  label: string;
}

interface FooterItem {
  label: string;
  onClick: () => void;
}

interface SegmentPickerProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  getOptionColor?: (value: string) => ColorPair | null;
  footerItems?: FooterItem[];
}

interface SegmentGroupProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  getOptionColor?: (value: string) => ColorPair | null;
  footerItems?: FooterItem[];
}

export function SegmentPicker({ label, options, value, onChange, onClose, getOptionColor, footerItems }: SegmentPickerProps) {
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setHasScrollableContent(el.scrollHeight > el.clientHeight);
      setIsScrolledToBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 2);
    };
    check();
    el.addEventListener("scroll", check);
    return () => el.removeEventListener("scroll", check);
  }, [options]);

  return (
    <div
      className="segment-picker-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="segment-picker" role="dialog" aria-modal="true" aria-label={`Choose ${label}`} ref={modalRef}>
        <div className="segment-picker__header">
          <span className="segment-picker__title">{label}</span>
          <button type="button" className="task-modal__close" onClick={onClose} aria-label="Close" autoFocus>✕</button>
        </div>
        <div className="segment-picker__scroll-wrap">
          <div className="segment-picker__options" ref={scrollRef}>
            {options.map((opt) => {
              const isSelected = value === opt.value;
              const color = getOptionColor ? getOptionColor(opt.value) : null;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`segment-picker__option ${isSelected ? "segment-picker__option--selected" : ""}`}
                  style={!isSelected && color ? { background: color.bg, color: color.text, borderColor: "transparent" } : undefined}
                  onClick={() => { onChange(opt.value); onClose(); }}
                >
                  {opt.label}
                  {isSelected && <span className="segment-picker__check" aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
          {hasScrollableContent && !isScrolledToBottom && (
            <div className="segment-picker__fade" aria-hidden="true" />
          )}
        </div>

        {footerItems && footerItems.length > 0 && (
          <div className="segment-picker__footer">
            {footerItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="segment-picker__footer-action"
                onClick={() => { item.onClick(); onClose(); }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SegmentGroup({ label, options, value, onChange, getOptionColor, footerItems }: SegmentGroupProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;
  const color = getOptionColor ? getOptionColor(value) : null;

  return (
    <div className="segment-group">
      <span className="segment-group__label">{label}</span>
      <button
        type="button"
        className="segment-selected"
        onClick={() => setPickerOpen(true)}
        style={color ? { background: color.bg, color: color.text, borderColor: "transparent" } : undefined}
      >
        <span className="segment-selected__text">{selectedLabel}</span>
        <span className="segment-caret" aria-hidden="true" style={color ? { color: color.text, opacity: 0.6 } : undefined}>›</span>
      </button>
      {pickerOpen && (
        <SegmentPicker
          label={label}
          options={options}
          value={value}
          onChange={onChange}
          onClose={() => setPickerOpen(false)}
          getOptionColor={getOptionColor}
          footerItems={footerItems}
        />
      )}
    </div>
  );
}
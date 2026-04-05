import { useState, useEffect, useRef } from "react";
import { EyeDropperIcon } from "@heroicons/react/24/outline";
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

export interface QuickAddProps {
  palette: ColorPair[];
  onAdd: (name: string, color?: ColorPair) => Promise<void>;
  onManage?: () => void;
  manageLabel?: string;
}

interface SegmentPickerProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  getOptionColor?: (value: string) => ColorPair | null;
  footerItems?: FooterItem[];
  quickAddProps?: QuickAddProps;
}

interface SegmentGroupProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  getOptionColor?: (value: string) => ColorPair | null;
  footerItems?: FooterItem[];
  quickAddProps?: QuickAddProps;
}

export function SegmentPicker({
  label, options, value, onChange, onClose,
  getOptionColor, footerItems, quickAddProps,
}: SegmentPickerProps) {
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddColor, setQuickAddColor] = useState<ColorPair | null>(null);
  const [palettePickerOpen, setPalettePickerOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const quickAddInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (palettePickerOpen) { setPalettePickerOpen(false); return; }
      if (quickAddOpen) { setQuickAddOpen(false); setQuickAddName(''); setQuickAddColor(null); return; }
      onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, quickAddOpen, palettePickerOpen]);

  useEffect(() => {
    if (quickAddOpen) setTimeout(() => quickAddInputRef.current?.focus(), 50);
  }, [quickAddOpen]);

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

  async function handleQuickAdd() {
    if (!quickAddName.trim() || !quickAddProps) return;
    const trimmed = quickAddName.trim().toLowerCase();
    await quickAddProps.onAdd(trimmed, quickAddColor ?? undefined);
    onChange(trimmed);
    onClose();
  }

  // Palette picker renders as a higher-z overlay within the same backdrop
  if (palettePickerOpen && quickAddProps) {
    return (
      <div className="segment-picker-backdrop" style={{ zIndex: 300 }}>
        <div className="segment-picker" role="dialog" aria-modal="true" aria-label="Pick color" ref={modalRef}>
          <div className="segment-picker__header">
            <span className="segment-picker__title">Pick a saved color</span>
            <button type="button" className="task-modal__close" onClick={() => setPalettePickerOpen(false)} aria-label="Back">✕</button>
          </div>
          {quickAddProps.palette.length === 0 ? (
            <p className="quick-add__palette-empty">
              No saved colors yet. Create one in Settings → Manage Contexts.
            </p>
          ) : (
            <div className="quick-add__palette-swatches">
              {quickAddProps.palette.map((pair, i) => (
                <button
                  key={i}
                  type="button"
                  className="quick-add__palette-swatch"
                  style={{ background: pair.bg, color: pair.text }}
                  onClick={() => { setQuickAddColor(pair); setPalettePickerOpen(false); }}
                  aria-label={`Select color ${i + 1}`}
                >
                  Aa
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

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

        {/* Generic footer items */}
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

        {/* Quick-add context footer */}
        {quickAddProps && (
          <div className="segment-picker__footer">
            {quickAddOpen ? (
              <div className="quick-add__row">
                <input
                  ref={quickAddInputRef}
                  className="quick-add__input"
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  placeholder="Context name..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleQuickAdd();
                    if (e.key === "Escape") {
                      setQuickAddOpen(false);
                      setQuickAddName('');
                      setQuickAddColor(null);
                    }
                  }}
                />
                <button
                  type="button"
                  className="quick-add__color-btn"
                  onClick={() => setPalettePickerOpen(true)}
                  aria-label="Pick color"
                  title="Pick color"
                  style={quickAddColor
                    ? { background: quickAddColor.bg, color: quickAddColor.text, borderColor: 'transparent' }
                    : undefined}
                >
                  <EyeDropperIcon style={{ width: 14, height: 14 }} />
                </button>
                <button
                  type="button"
                  className="quick-add__confirm-btn"
                  onClick={handleQuickAdd}
                  disabled={!quickAddName.trim()}
                  aria-label="Add context"
                >
                  ✓
                </button>
                <button
                  type="button"
                  className="quick-add__cancel-btn"
                  onClick={() => { setQuickAddOpen(false); setQuickAddName(''); setQuickAddColor(null); }}
                  aria-label="Cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="segment-picker__footer-action"
                onClick={() => setQuickAddOpen(true)}
              >
                + Quick-Add Context
              </button>
            )}

            {quickAddProps.onManage && !quickAddOpen && (
              <button
                type="button"
                className="segment-picker__footer-action"
                onClick={() => { quickAddProps.onManage?.(); onClose(); }}
              >
                {`↗ ${quickAddProps.manageLabel ?? "Manage and Delete"}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function SegmentGroup({ label, options, value, onChange, getOptionColor, footerItems, quickAddProps }: SegmentGroupProps) {
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
          quickAddProps={quickAddProps}
        />
      )}
    </div>
  );
}
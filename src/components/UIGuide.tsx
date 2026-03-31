import { Link } from "react-router-dom";
import "../App.css";
import "../styles/ui-guide.css";

// ── Helper Components ──────────────────────────────────────────────────────

interface ColorTokenProps {
  varName?: string;
  hex?: string;
  usage: string;
  border?: boolean;
}

function ColorToken({ varName, hex, usage, border = false }: ColorTokenProps) {
  const background = varName ? `var(${varName})` : hex;
  const label = varName ? varName : hex;

  return (
    <div className="token-card">
      <div
        className="token-card__preview"
        style={{
          background,
          borderBottom: border ? "none" : "1px solid var(--border-default)",
        }}
      />
      <div className="token-card__details">
        <code className="token-card__name">{label}</code>
        <p className="token-card__usage">{usage}</p>
      </div>
    </div>
  );
}

interface TypeTokenProps {
  name: string;
  sizeVar: string;
  lineVar: string;
  weight?: string;
  usage: string;
}

function TypeToken({ name, sizeVar, lineVar, weight = "400", usage }: TypeTokenProps) {
  return (
    <div className="type-specimen">
      <p
        className="type-specimen__demo"
        style={{ fontSize: `var(${sizeVar})`, lineHeight: `var(${lineVar})`, fontWeight: weight }}
      >
        {name} — The quick brown fox jumps over the lazy dog
      </p>
      <div className="type-specimen__meta">
        <span>Size: <code>{sizeVar}</code></span>
        <span>Line: <code>{lineVar}</code></span>
        <span>Weight: <code>{weight}</code></span>
      </div>
      <p className="token-card__usage" style={{ marginTop: "4px" }}>{usage}</p>
    </div>
  );
}

interface SpaceTokenProps {
  varName: string;
  usage: string;
}

function SpaceToken({ varName, usage }: SpaceTokenProps) {
  return (
    <div className="token-card">
      <div className="token-card__preview" style={{ background: "var(--surface-base)" }}>
        <div style={{
          background: "var(--surface-filter-active)",
          border: "1px dashed var(--priority-medium)",
          width: `var(${varName})`,
          height: `var(${varName})`
        }} />
      </div>
      <div className="token-card__details">
        <code className="token-card__name">{varName}</code>
        <p className="token-card__usage">{usage}</p>
      </div>
    </div>
  );
}

interface RadiusTokenProps {
  varName: string;
  usage: string;
}

function RadiusToken({ varName, usage }: RadiusTokenProps) {
  return (
    <div className="token-card">
      <div className="token-card__preview" style={{ background: "var(--surface-base)" }}>
        <div style={{
          background: "var(--surface-muted)",
          border: "2px solid var(--border-strong)",
          width: "60px",
          height: "60px",
          borderRadius: `var(${varName})`
        }} />
      </div>
      <div className="token-card__details">
        <code className="token-card__name">{varName}</code>
        <p className="token-card__usage">{usage}</p>
      </div>
    </div>
  );
}

interface ShadowTokenProps {
  varName: string;
  usage: string;
  borderRadius?: string;
}

function ShadowToken({ varName, usage, borderRadius = "var(--radius-card)" }: ShadowTokenProps) {
  return (
    <div className="token-card">
      <div className="token-card__preview token-card__preview--shadow">
        <div
          className="token-card__preview-box"
          style={{ boxShadow: `var(${varName})`, borderRadius }}
        />
      </div>
      <div className="token-card__details">
        <code className="token-card__name">{varName}</code>
        <p className="token-card__usage">{usage}</p>
      </div>
    </div>
  );
}

// ── Main Guide ─────────────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
}

function UIGuide() {
  const sections: Section[] = [
    { id: "typography",      label: "Typography" },
    { id: "spacing",         label: "Spacing" },
    { id: "radius",          label: "Radius" },
    { id: "surfaces",        label: "Surfaces" },
    { id: "borders",         label: "Borders" },
    { id: "text-tokens",     label: "Text" },
    { id: "icon-tokens",     label: "Icons" },
    { id: "load-tokens",     label: "Cognitive Load" },
    { id: "priority-tokens", label: "Priority" },
    { id: "context-colors",  label: "Context Colors" },
    { id: "action-tokens",   label: "Actions" },
    { id: "system-states",   label: "System States" },
    { id: "feature-tokens",  label: "Feature Tokens" },
    { id: "elevation",       label: "Elevation" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>UI Implementation Guide</h1>
        <div className="header-controls">
          <Link to="/" className="data-btn" style={{ textDecoration: "none" }}>
            ← Back to App
          </Link>
        </div>
      </header>

      <main className="ui-guide-grid">
        <nav className="ui-guide-toc">
          <p className="ui-guide-toc__label">Contents</p>
          <div className="ui-guide-toc__links">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className="ui-guide-toc__link"
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="ui-guide-content">
          <div className="info-banner">
            <p>
              <strong>Developer note:</strong> All values below are CSS custom properties defined in <code>App.css</code>. <strong>Do not use hardcoded hex values or rgba strings in components.</strong> If a value you need isn't here, add a token first.
            </p>
          </div>

          <section id="typography" className="ui-guide-section">
            <h2>Typography</h2>
            <div className="type-specimen-list">
              <TypeToken name="Title Large" sizeVar="--font-title-lg-size" lineVar="--font-title-lg-line" weight="500" usage="App header H1." />
              <TypeToken name="Title Small" sizeVar="--font-title-sm-size" lineVar="--font-title-sm-line" weight="500" usage="Section headers, modal titles." />
              <TypeToken name="Body" sizeVar="--font-body-size" lineVar="--font-body-line" usage="Task titles, descriptions, general UI copy." />
              <TypeToken name="Small" sizeVar="--font-small-size" lineVar="--font-small-line" usage="Meta labels, pill text, filter selects." />
              <TypeToken name="Micro" sizeVar="--font-micro-size" lineVar="--font-micro-line" usage="Timestamps, helper annotations." />
            </div>
          </section>

          <section id="spacing" className="ui-guide-section">
            <h2>Spacing</h2>
            <p className="ui-guide-desc">All spacing values are multiples of a 4px base. Use these tokens for padding, margin, and gap — never hardcoded px values.</p>
            <div className="token-grid">
              <SpaceToken varName="--space-1" usage="4px — tight internal padding." />
              <SpaceToken varName="--space-2" usage="8px — compact gap, small padding." />
              <SpaceToken varName="--space-3" usage="12px — standard inner padding." />
              <SpaceToken varName="--space-4" usage="16px — default component gap." />
              <SpaceToken varName="--space-5" usage="20px — section padding." />
              <SpaceToken varName="--space-6" usage="24px — modal padding, large gaps." />
              <SpaceToken varName="--space-8" usage="32px — section breaks." />
            </div>
          </section>

          <section id="radius" className="ui-guide-section">
            <h2>Border Radius</h2>
            <div className="token-grid">
              <RadiusToken varName="--radius-sm" usage="Buttons, pills, small interactive elements." />
              <RadiusToken varName="--radius-md" usage="Inputs, selects, filter chips." />
              <RadiusToken varName="--radius-card" usage="Task cards, panels." />
              <RadiusToken varName="--radius-modal" usage="Modals and bottom sheets." />
            </div>
          </section>

          <section id="surfaces" className="ui-guide-section">
            <h2>Surfaces</h2>
            <p className="ui-guide-desc">Background layers in order of visual depth. Use these instead of hardcoded whites and near-whites.</p>
            <div className="token-grid">
              <ColorToken varName="--surface-base" usage="Default component background. Cards, modals, inputs." />
              <ColorToken varName="--surface-subtle" usage="Slightly off-white panels. Task input, momentum panel." border />
              <ColorToken varName="--surface-light" usage="Hover states, done-task backgrounds." border />
              <ColorToken varName="--surface-muted" usage="Dividers, disabled fills, toggle track off." />
              <ColorToken varName="--surface-toggle-on" usage="Active toggle track. Dark filled buttons." />
              <ColorToken varName="--surface-toggle-hover" usage="Dark filled button hover — slightly lighter than toggle-on." />
            </div>
          </section>

          <section id="borders" className="ui-guide-section">
            <h2>Borders</h2>
            <div className="token-grid">
              <ColorToken varName="--border-default" usage="Card borders, dividers, section lines." />
              <ColorToken varName="--border-strong" usage="Input borders, button outlines, select wrappers." />
              <ColorToken varName="--border-input" usage="Native input and filter select borders. Slightly softer than border-strong." />
              <ColorToken varName="--border-button-subtle" usage="Subtle button outline variant." />
            </div>
          </section>

          <section id="text-tokens" className="ui-guide-section">
            <h2>Text</h2>
            <div className="token-grid">
              <ColorToken varName="--text-primary" usage="Headings, task titles, strong labels." />
              <ColorToken varName="--text-secondary" usage="Body copy, descriptions, button labels." />
              <ColorToken varName="--text-tertiary" usage="Muted text, placeholders, helper labels." />
              <ColorToken varName="--text-highlight" usage="Text on dark/filled surfaces (toggle, primary buttons)." />
              <ColorToken varName="--text-button-subtle" usage="Secondary button label." />
            </div>
          </section>

          <section id="icon-tokens" className="ui-guide-section">
            <h2>Icons</h2>
            <p className="ui-guide-desc">Move-button arrows use <code>--icon</code>. Edit and delete icons use <code>--icon-subtle</code> to read lighter against the bare (no border box) background.</p>
            <div className="token-grid">
              <ColorToken varName="--icon" usage="Move-button arrows and bordered icon buttons." />
              <ColorToken varName="--icon-hover" usage="Icon color on hover." />
              <ColorToken varName="--icon-subtle" usage="Edit and delete icons — bare, no border box." />
            </div>
          </section>

          <section id="load-tokens" className="ui-guide-section">
            <h2>Cognitive Load</h2>
            <p className="ui-guide-desc">Semantic tokens mapped to task effort levels. Always use the paired bg + text tokens together.</p>
            <div className="token-grid">
              <ColorToken varName="--load-low-bg" usage="Low load pill background." border />
              <ColorToken varName="--load-low" usage="Low load pill text / icon." />
              <ColorToken varName="--load-medium-bg" usage="Med load pill background." border />
              <ColorToken varName="--load-medium" usage="Med load pill text / icon." />
              <ColorToken varName="--load-high-bg" usage="High load pill background." border />
              <ColorToken varName="--load-high" usage="High load pill text / icon." />
            </div>
          </section>

          <section id="priority-tokens" className="ui-guide-section">
            <h2>Priority</h2>
            <p className="ui-guide-desc">Semantic tokens mapped to task urgency levels. Always use the paired bg + text tokens together.</p>
            <div className="token-grid">
              <ColorToken varName="--priority-low-bg" usage="Low priority pill background." border />
              <ColorToken varName="--priority-low" usage="Low priority pill text / icon." />
              <ColorToken varName="--priority-medium-bg" usage="Med priority pill background." border />
              <ColorToken varName="--priority-medium" usage="Med priority pill text / icon." />
              <ColorToken varName="--priority-high-bg" usage="High priority pill background." border />
              <ColorToken varName="--priority-high" usage="High priority pill text / icon." />
            </div>
          </section>

          <section id="context-colors" className="ui-guide-section">
            <h2>Context Chips</h2>
            <p className="ui-guide-desc">Preset context colors are defined in <code>TaskOptions.ts</code>, not as CSS tokens, because they are data-driven. Custom contexts are assigned from a deterministic hash pool.</p>
            <div className="token-grid">
              <ColorToken hex="#fef3c7" usage="Kitchen" border />
              <ColorToken hex="#ccfbf1" usage="Bathroom" border />
              <ColorToken hex="#f1f5f9" usage="Garage" border />
              <ColorToken hex="#dbeafe" usage="Computer" border />
              <ColorToken hex="#ede9fe" usage="Phone" border />
              <ColorToken hex="#ffedd5" usage="Errands" border />
              <ColorToken hex="#dcfce7" usage="Outside" border />
              <ColorToken hex="#e0f2fe" usage="Laundry" border />
              <ColorToken hex="#ffe4e6" usage="Admin" border />
              <ColorToken hex="#f3f4f6" usage="General (default)" border />
            </div>
          </section>

          <section id="action-tokens" className="ui-guide-section">
            <h2>Actions</h2>
            <p className="ui-guide-desc">Used exclusively for edit and delete icon hover states.</p>
            <div className="token-grid">
              <ColorToken varName="--action-edit" usage="Edit icon hover color." />
              <ColorToken varName="--action-delete" usage="Delete icon hover color." />
            </div>
          </section>

          <section id="system-states" className="ui-guide-section">
            <h2>System States</h2>
            <div className="token-grid">
              <ColorToken varName="--color-success" usage="Import success, positive feedback." />
              <ColorToken varName="--color-danger" usage="Errors, destructive action labels." />
              <ColorToken varName="--color-danger-bg" usage="Danger button/section background." border />
              <ColorToken varName="--color-danger-border" usage="Danger button borders." />
              <ColorToken varName="--color-warning" usage="Warning banners and text (FAQ)." />
              <ColorToken varName="--color-link" usage="Hyperlink text." />
              <ColorToken varName="--color-link-hover" usage="Hyperlink hover." />
            </div>
          </section>

          <section id="feature-tokens" className="ui-guide-section">
            <h2>Feature Tokens</h2>
            <p className="ui-guide-desc">Tokens tied to specific product features. Isolating them means global palette changes don't accidentally affect feature states.</p>

            <h3 className="ui-guide-subheading">Snoozed Tasks</h3>
            <div className="token-grid">
              <ColorToken varName="--surface-snoozed" usage="Snoozed task card background." border />
              <ColorToken varName="--border-snoozed" usage="Snoozed task card border." />
            </div>

            <h3 className="ui-guide-subheading">Active Filters</h3>
            <div className="token-grid">
              <ColorToken varName="--surface-filter-active" usage="Active filter select wrapper background." border />
              <ColorToken varName="--surface-filter-wrapper" usage="Filter bar wrapper background when filters active." border />
              <ColorToken varName="--color-filter-active" usage="Active filter label and caret color." />
              <ColorToken varName="--color-filter-active-hover" usage="Filter reset button hover color." />
            </div>

            <h3 className="ui-guide-subheading">Keystone Task (Momentum Mode)</h3>
            <div className="token-grid">
              <ColorToken varName="--color-keystone" usage="Keystone task card background highlight." />
            </div>
          </section>

          <section id="elevation" className="ui-guide-section">
            <h2>Shadows & Overlays</h2>
            <div className="token-grid">
              <ShadowToken varName="--shadow-sm" usage="Subtle lift. Active mode-strip pill." />
              <ShadowToken varName="--shadow-md" usage="Dropdowns, submenus." />
              <ShadowToken varName="--shadow-modal-mobile" usage="Bottom sheet modal (mobile)." borderRadius="var(--radius-modal) var(--radius-modal) 0 0" />
              <ShadowToken varName="--shadow-modal-desktop" usage="Centered modal (desktop)." borderRadius="var(--radius-modal)" />
            </div>
            <h3 className="ui-guide-subheading">Backdrop Overlays</h3>
            <div className="token-grid">
              <ColorToken varName="--backdrop-overlay" usage="Standard modal backdrop (task form, settings)." />
              <ColorToken varName="--backdrop-overlay-dark" usage="Deeper backdrop for sub-modals (segment picker)." />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default UIGuide;

import { Link } from "react-router-dom";
import "../App.css";
import "../styles/ui-guide.css";

// ── Helper Components for Documentation ──

function ColorToken({ varName, hex, usage, border = false }) {
  const background = varName ? `var(${varName})` : hex;
  const label = varName ? varName : hex;

  return (
    <div className="token-card">
      <div 
        className="token-card__preview" 
        style={{ 
          background: background,
          borderBottom: border ? "none" : "1px solid var(--border-default)"
        }} 
      />
      <div className="token-card__details">
        <code className="token-card__name">{label}</code>
        <p className="token-card__usage">{usage}</p>
      </div>
    </div>
  );
}

function TypeToken({ name, sizeVar, lineVar, weight = "400", usage }) {
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
      </div>
      <p className="token-card__usage" style={{ marginTop: "4px" }}>{usage}</p>
    </div>
  );
}

function SpaceToken({ varName, usage }) {
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

function RadiusToken({ varName, usage }) {
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

function ShadowToken({ varName, usage, borderRadius = "var(--radius-card)" }) {
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

// ── Main Guide Page ──

function UIGuide() {
  const sections = [
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing" },
    { id: "radius", label: "Radius" },
    { id: "surfaces", label: "Surfaces" },
    { id: "text-icons", label: "Text & Icons" },
    { id: "load-tokens", label: "Cognitive Load" },
    { id: "priority-tokens", label: "Priority" },
    { id: "context-colors", label: "Context Colors" },
    { id: "system-states", label: "System States" },
    { id: "elevation", label: "Elevation" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>UI Implementation Guide</h1>
        <div className="header-controls">
          <Link to="/" className="data-btn" style={{ textDecoration: 'none' }}>
            ← Back to App
          </Link>
        </div>
      </header>

      <main className="ui-guide-grid">
        {/* Table of Contents - Docks to top on mobile, Sticky on desktop */}
        <nav className="ui-guide-toc">
          <p className="ui-guide-toc__label">Contents</p>
          <div className="ui-guide-toc__links">
            {sections.map(s => (
              <button 
                key={s.id} 
                onClick={() => scrollToSection(s.id)} 
                className="ui-guide-toc__link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  cursor: 'pointer',
                  textAlign: 'left' 
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="ui-guide-content">
          <div className="info-banner">
            <p>
              <strong>Developer Note:</strong> This document outlines the CSS variables (tokens) that form the single source of truth for the application's UI. <strong>Do not use hardcoded hex values or RGBA strings in components.</strong>
            </p>
          </div>

          <section id="typography" className="ui-guide-section">
            <h2>Typography</h2>
            <div className="type-specimen-list">
              <TypeToken name="Title Large (H1)" sizeVar="--font-title-lg-size" lineVar="--font-title-lg-line" weight="500" usage="App header title." />
              <TypeToken name="Primary Body" sizeVar="--font-primary-size" lineVar="--font-primary-line" usage="Standard inputs, task titles." />
              <TypeToken name="Chip / Mobile" sizeVar="--font-chip-mobile-size" lineVar="--font-chip-mobile-line" usage="Tags, pills, meta-info." />
            </div>
          </section>

          <section id="spacing" className="ui-guide-section">
            <h2>Spacing</h2>
            <div className="token-grid">
              <SpaceToken varName="--space-1" usage="8px — Tight gaps." />
              <SpaceToken varName="--space-2" usage="16px — Standard padding." />
              <SpaceToken varName="--space-3" usage="24px — Loose padding." />
            </div>
          </section>

          <section id="radius" className="ui-guide-section">
            <h2>Border Radius</h2>
            <div className="token-grid">
              <RadiusToken varName="--radius-button" usage="6px — Buttons." />
              <RadiusToken varName="--radius-modal" usage="16px — Modals." />
              <RadiusToken varName="--radius-pill" usage="999px — Badges/Toggles." />
            </div>
          </section>

          <section id="surfaces" className="ui-guide-section">
            <h2>Surfaces</h2>
            <div className="token-grid">
              <ColorToken varName="--bg" usage="Body background." />
              <ColorToken varName="--surface-base" usage="Standard component background." />
              <ColorToken varName="--surface-subtle" usage="Secondary panels." />
            </div>
          </section>

          <section id="text-icons" className="ui-guide-section">
            <h2>Text & Icons</h2>
            <div className="token-grid">
              <ColorToken varName="--text-h" usage="Headings." />
              <ColorToken varName="--text-primary" usage="Body copy." />
              <ColorToken varName="--text-tertiary" usage="Low contrast placeholders." />
            </div>
          </section>

          <section id="load-tokens" className="ui-guide-section">
            <h2>Cognitive Load Tokens</h2>
            <p className="ui-guide-desc">Semantic tokens mapped to task effort levels.</p>
            <div className="token-grid">
              <ColorToken varName="--load-low-bg" usage="Low Load background." border />
              <ColorToken varName="--load-low" usage="Low Load text/icon." />
              <ColorToken varName="--load-medium-bg" usage="Med Load background." border />
              <ColorToken varName="--load-medium" usage="Med Load text/icon." />
              <ColorToken varName="--load-high-bg" usage="High Load background." border />
              <ColorToken varName="--load-high" usage="High Load text/icon." />
            </div>
          </section>

          <section id="priority-tokens" className="ui-guide-section">
            <h2>Priority Tokens</h2>
            <p className="ui-guide-desc">Semantic tokens mapped to task urgency levels.</p>
            <div className="token-grid">
              <ColorToken varName="--priority-low-bg" usage="Low Priority background." border />
              <ColorToken varName="--priority-low" usage="Low Priority text/icon." />
              <ColorToken varName="--priority-medium-bg" usage="Med Priority background." border />
              <ColorToken varName="--priority-medium" usage="Med Priority text/icon." />
              <ColorToken varName="--priority-high-bg" usage="High Priority background." border />
              <ColorToken varName="--priority-high" usage="High Priority text/icon." />
            </div>
          </section>

          <section id="context-colors" className="ui-guide-section">
            <h2>Context Chips (Presets)</h2>
            <p className="ui-guide-desc">Dynamic preset colors defined in <code>TaskOptions.jsx</code>.</p>
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
              <ColorToken hex="#f3f4f6" usage="General (Default)" border />
            </div>
          </section>

          <section id="system-states" className="ui-guide-section">
            <h2>System States</h2>
            <div className="token-grid">
              <ColorToken varName="--color-success" usage="Success states." />
              <ColorToken varName="--color-danger" usage="Errors/Destructive." />
              <ColorToken varName="--color-warning" usage="Warning banners." />
            </div>
          </section>

          <section id="elevation" className="ui-guide-section">
            <h2>Shadows & Overlays</h2>
            <div className="token-grid">
              <ShadowToken varName="--shadow-sm" usage="Buttons." />
              <ShadowToken varName="--shadow-md" usage="Dropdowns." />
              <ColorToken varName="--backdrop-overlay" usage="Modals." />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default UIGuide;

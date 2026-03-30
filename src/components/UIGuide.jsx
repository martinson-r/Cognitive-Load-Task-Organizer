import "../App.css";
import "../styles/ui-guide.css";

// ── Helper Components ──
function ColorToken({ varName, usage, border = false }) {
  return (
    <div className="token-card">
      <div className="token-card__preview" style={{ background: `var(${varName})`, borderBottom: border ? "none" : "1px solid var(--border-default)" }} />
      <div className="token-card__details">
        <code className="token-card__name">{varName}</code>
        <p className="token-card__usage">{usage}</p>
      </div>
    </div>
  );
}

function TypeToken({ name, sizeVar, lineVar, weight = "400", usage }) {
  return (
    <div className="type-specimen">
      <p className="type-specimen__demo" style={{ fontSize: `var(${sizeVar})`, lineHeight: `var(${lineVar})`, fontWeight: weight }}>
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
        <div style={{ background: "var(--surface-filter-active)", border: "1px dashed var(--priority-medium)", width: `var(${varName})`, height: `var(${varName})` }} />
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
        <div style={{ background: "var(--surface-muted)", border: "2px solid var(--border-strong)", width: "60px", height: "60px", borderRadius: `var(${varName})` }} />
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
        <div className="token-card__preview-box" style={{ boxShadow: `var(${varName})`, borderRadius }} />
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
    { id: "radius", label: "Border Radius" },
    { id: "surfaces", label: "Surfaces" },
    { id: "text-icons", label: "Text & Icons" },
    { id: "domain-tokens", label: "Domain Tokens" },
    { id: "system-states", label: "System States" },
    { id: "elevation", label: "Shadows & Overlays" },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>UI Implementation Guide</h1>
        <div className="header-controls">
          <a href="/" className="data-btn" style={{ textDecoration: 'none' }}>← Back to App</a>
        </div>
      </header>

      <main className="app-main" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
        
        {/* Table of Contents - Sticky Sidebar */}
        <nav style={{ position: 'sticky', top: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Contents</p>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ fontSize: 'var(--font-chip-mobile-size)', color: 'var(--color-link)', textDecoration: 'none' }}>{s.label}</a>
          ))}
        </nav>

        <div style={{ minWidth: 0 }}>
          <div className="info-banner">
            <p><strong>Developer Note:</strong> This document outlines the CSS variables (tokens) that form the single source of truth. <strong>Do not use hardcoded hex values.</strong></p>
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
            </div>
          </section>

          <section id="radius" className="ui-guide-section">
            <h2>Border Radius</h2>
            <div className="token-grid">
              <RadiusToken varName="--radius-button" usage="6px — Buttons." />
              <RadiusToken varName="--radius-modal" usage="16px — Modals." />
            </div>
          </section>

          <section id="surfaces" className="ui-guide-section">
            <h2>Surfaces</h2>
            <div className="token-grid">
              <ColorToken varName="--bg" usage="Base background." />
              <ColorToken varName="--surface-base" usage="Component background." />
            </div>
          </section>

          <section id="text-icons" className="ui-guide-section">
            <h2>Text & Icons</h2>
            <div className="token-grid">
              <ColorToken varName="--text-h" usage="Headings." />
              <ColorToken varName="--text-primary" usage="Body copy." />
            </div>
          </section>

          <section id="domain-tokens" className="ui-guide-section">
            <h2>Domain Tokens</h2>
            <div className="token-grid">
              <ColorToken varName="--load-high" usage="High Load text." />
              <ColorToken varName="--priority-high" usage="High Priority text." />
            </div>
          </section>

          <section id="system-states" className="ui-guide-section">
            <h2>System States</h2>
            <div className="token-grid">
              <ColorToken varName="--color-success" usage="Success states." />
              <ColorToken varName="--color-danger" usage="Errors/Delete." />
            </div>
          </section>

          <section id="elevation" className="ui-guide-section">
            <h2>Shadows & Overlays</h2>
            <div className="token-grid">
              <ShadowToken varName="--shadow-md" usage="Submenus." />
              <ColorToken varName="--backdrop-overlay" usage="Modal backdrop." />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default UIGuide;
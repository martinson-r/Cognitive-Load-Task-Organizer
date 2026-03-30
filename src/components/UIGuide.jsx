import "../App.css";
import "../styles/ui-guide.css";

// ── Helper Components for Documentation ──

function ColorToken({ varName, usage, border = false }) {
  return (
    <div className="token-card">
      <div 
        className="token-card__preview" 
        style={{ 
          background: `var(${varName})`,
          borderBottom: border ? "none" : "1px solid var(--border-default)"
        }} 
      />
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

function SpaceToken({ varName, usage }) {
  return (
    <div className="token-card">
      <div className="token-card__preview" style={{ background: "var(--surface-base)" }}>
        {/* We use a dashed purple box to visually represent the "invisible" space block */}
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


// ── Main Guide Page ──

function UIGuide() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>UI Implementation Guide</h1>
        <div className="header-controls">
          <a href="/" className="data-btn" style={{ textDecoration: 'none' }}>
            ← Back to App
          </a>
        </div>
      </header>

      <main className="app-main">
        <div className="info-banner">
          <p>
            <strong>Developer Note:</strong> This document outlines the CSS variables (tokens) that form the single source of truth for the application's UI. <strong>Do not use hardcoded hex values or RGBA strings in components.</strong> Always use the semantic variables listed below to ensure native Dark Mode support and future scalability.
          </p>
        </div>

        {/* ── Typography ── */}
        <section className="ui-guide-section">
          <h2>Typography</h2>
          <p className="ui-guide-desc">All font families fall back to system defaults (San Francisco, Segoe UI, Roboto) to optimize performance and feel native to the user's OS.</p>
          
          <div className="type-specimen-list">
            <TypeToken 
              name="Title Large (H1)" 
              sizeVar="--font-title-lg-size" 
              lineVar="--font-title-lg-line" 
              weight="500"
              usage="App header title." 
            />
            <TypeToken 
              name="Title Small (H2)" 
              sizeVar="--font-title-sm-size" 
              lineVar="--font-title-sm-line" 
              weight="500"
              usage="Modal titles, major section headers." 
            />
            <TypeToken 
              name="Section / Button" 
              sizeVar="--font-section-size" 
              lineVar="--font-section-line" 
              weight="600"
              usage="Primary buttons, Filter bar header." 
            />
            <TypeToken 
              name="Primary Body" 
              sizeVar="--font-primary-size" 
              lineVar="--font-primary-line" 
              usage="Standard inputs, task titles, general body text." 
            />
            <TypeToken 
              name="Chip / Mobile" 
              sizeVar="--font-chip-mobile-size" 
              lineVar="--font-chip-mobile-line" 
              usage="Tags, pills, meta-information, empty states, and tertiary buttons." 
            />
          </div>
        </section>

        {/* ── Spacing ── */}
        <section className="ui-guide-section">
          <h2>Spacing</h2>
          <p className="ui-guide-desc">
            A strict 8px-based spacing scale. Use these for all padding, margins, and gaps. Never use arbitrary pixel values to nudge elements.
          </p>
          <div className="token-grid">
            <SpaceToken varName="--space-1" usage="8px (0.5rem) — Tight gaps, small interior padding (e.g., pill interiors)." />
            <SpaceToken varName="--space-2" usage="16px (1rem) — Standard component padding, standard element gaps." />
            <SpaceToken varName="--space-3" usage="24px (1.5rem) — Loose padding, space between major layout sections." />
            <SpaceToken varName="--space-4" usage="32px (2rem) — Outer page shell padding." />
          </div>
        </section>

        {/* ── Border Radius ── */}
        <section className="ui-guide-section">
          <h2>Border Radius</h2>
          <p className="ui-guide-desc">
            Standardized corner radii to keep component shapes consistent across the app.
          </p>
          <div className="token-grid">
            <RadiusToken varName="--radius-button" usage="6px (0.375rem) — Standard interactive buttons." />
            <RadiusToken varName="--radius-input" usage="8px (0.5rem) — Text inputs, selects, secondary panels." />
            <RadiusToken varName="--radius-card" usage="8px (0.5rem) — Task cards, mode strips, momentum panels." />
            <RadiusToken varName="--radius-modal" usage="16px (1rem) — Large floating modals and bottom sheets." />
            <RadiusToken varName="--radius-pill" usage="999px — Priority/Load badges, toggle switch tracks." />
          </div>
        </section>

        {/* ── Surfaces ── */}
        <section className="ui-guide-section">
          <h2>Surfaces</h2>
          <p className="ui-guide-desc">Background colors for structural elements. These invert automatically in Dark Mode.</p>
          <div className="token-grid">
            <ColorToken varName="--bg" usage="The absolute base layer (body background)." />
            <ColorToken varName="--surface-base" usage="Standard component background (cards, modals)." />
            <ColorToken varName="--surface-subtle" usage="Slightly offset background (inputs, secondary panels)." />
            <ColorToken varName="--surface-light" usage="Hover states, mode strips, info banners." />
            <ColorToken varName="--surface-muted" usage="Disabled fills, inactive toggle tracks." />
          </div>
        </section>

        {/* ── Text Colors ── */}
        <section className="ui-guide-section">
          <h2>Text & Icons</h2>
          <p className="ui-guide-desc">Semantic text colors designed for maximum readability across themes.</p>
          <div className="token-grid">
            <ColorToken varName="--text-h" usage="Highest contrast. Use for headings and active task titles." />
            <ColorToken varName="--text-primary" usage="Strong contrast. Standard body copy." />
            <ColorToken varName="--text-secondary" usage="Medium contrast. Descriptions, inactive tabs." />
            <ColorToken varName="--text-tertiary" usage="Low contrast. Empty states, placeholders, muted hints." />
            <ColorToken varName="--text-highlight" usage="Always white. Used on top of dark filled buttons/toggles." border />
            <ColorToken varName="--icon" usage="Standard icon color." />
            <ColorToken varName="--icon-subtle" usage="Inactive or secondary icons (e.g. card actions)." />
          </div>
        </section>

        {/* ── Borders & Interactive ── */}
        <section className="ui-guide-section">
          <h2>Borders & Interactive States</h2>
          <p className="ui-guide-desc">Structural dividers and accessibility focus rings.</p>
          <div className="token-grid">
            <ColorToken varName="--border-default" usage="Standard dividers, card outlines." />
            <ColorToken varName="--border-strong" usage="Higher contrast borders (buttons)." />
            <ColorToken varName="--border-input" usage="Input field outlines." />
            <ColorToken varName="--focus-ring" usage="Universal accessibility focus ring outline (aliased to --color-link)." />
            <ColorToken varName="--focus-ring-subtle" usage="Soft box-shadow focus for inputs/selects." />
          </div>
        </section>

        {/* ── Shadows & Overlays ── */}
        <section className="ui-guide-section">
          <h2>Shadows & Overlays</h2>
          <p className="ui-guide-desc">Elevation and depth tokens. Do not use raw RGBA values in components.</p>
          <div className="token-grid">
            <ShadowToken varName="--shadow-sm" usage="Active buttons, selected mode pills." />
            <ShadowToken varName="--shadow-md" usage="Dropdown menus, submenus." />
            <ShadowToken varName="--shadow-modal-mobile" usage="Modals and bottom sheets on mobile devices." borderRadius="var(--radius-modal) var(--radius-modal) 0 0" />
            <ShadowToken varName="--shadow-modal-desktop" usage="Centered modals on desktop devices." borderRadius="var(--radius-modal)" />
            <ColorToken varName="--backdrop-overlay" usage="Base semi-transparent overlay for standard modals." />
            <ColorToken varName="--backdrop-overlay-dark" usage="Darker overlay for stacked bottom sheets (segment pickers)." />
          </div>
        </section>


{/* ── Semantic App Tokens ── */}
        <section className="ui-guide-section">
          <h2>Domain Tokens: Cognitive Load & Priority</h2>
          <p className="ui-guide-desc">
            These tokens map directly to the core data models of the application. Always use these paired variables (background + text) when rendering task attributes, rather than generic semantic colors.
          </p>
          
          <h3 style={{ fontSize: "0.9rem", marginTop: "var(--space-3)", marginBottom: "var(--space-2)", color: "var(--text-secondary)" }}>
            Cognitive Load
          </h3>
          <div className="token-grid">
            <ColorToken varName="--load-low-bg" usage="Background for Low Load pills." border />
            <ColorToken varName="--load-low" usage="Text/Icon color for Low Load." />
            
            <ColorToken varName="--load-medium-bg" usage="Background for Medium Load pills." border />
            <ColorToken varName="--load-medium" usage="Text/Icon color for Medium Load." />
            
            <ColorToken varName="--load-high-bg" usage="Background for High Load pills." border />
            <ColorToken varName="--load-high" usage="Text/Icon color for High Load." />
          </div>

          <h3 style={{ fontSize: "0.9rem", marginTop: "var(--space-4)", marginBottom: "var(--space-2)", color: "var(--text-secondary)" }}>
            Priority
          </h3>
          <div className="token-grid">
            <ColorToken varName="--priority-low-bg" usage="Background for Low Priority pills." border />
            <ColorToken varName="--priority-low" usage="Text/Icon color for Low Priority." />
            
            <ColorToken varName="--priority-medium-bg" usage="Background for Medium Priority pills." border />
            <ColorToken varName="--priority-medium" usage="Text/Icon color for Medium Priority." />
            
            <ColorToken varName="--priority-high-bg" usage="Background for High Priority pills." border />
            <ColorToken varName="--priority-high" usage="Text/Icon color for High Priority." />
          </div>
        </section>

        {/* ── Semantic System Colors ── */}
        <section className="ui-guide-section">
          <h2>System States</h2>
          <p className="ui-guide-desc">Colors reserved for global system feedback. Do not use these for task attributes.</p>
          <div className="token-grid">
            <ColorToken varName="--color-success" usage="Success messages and completed states." />
            <ColorToken varName="--color-warning" usage="Warning banners and non-destructive alerts." />
            <ColorToken varName="--color-danger" usage="Destructive actions (delete), error messages." />
            <ColorToken varName="--color-danger-bg" usage="Subtle background for error states or danger zones." border />
          </div>
        </section>
      </main>
    </div>
  );
}

export default UIGuide;
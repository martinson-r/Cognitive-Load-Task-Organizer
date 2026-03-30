import "../App.css";

function UIGuide() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>UI Implementation Guide</h1>
        <div className="header-controls">
          <a 
            href="/" 
            className="data-btn" 
            style={{ textDecoration: 'none' }}
          >
            ← Back to App
          </a>
        </div>
      </header>

      <main className="app-main">
        <div className="info-banner">
          <p>
            <strong>Design System & Tokens</strong><br/>
            This page serves as a living documentation of the application's design system, 
            CSS tokens, and accessible components.
          </p>
        </div>

        {/* You can start building out your token documentation here! */}
        <section className="task-input">
          <h2 style={{ fontSize: "var(--font-section-size)", color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
            Typography
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>Content coming soon...</p>
        </section>
      </main>
    </div>
  );
}

export default UIGuide;
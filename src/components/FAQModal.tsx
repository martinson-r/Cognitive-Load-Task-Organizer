import { useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap.ts";
import "../styles/faq-modal.css";

interface FAQModalProps {
  onClose: () => void;
}

function FAQModal({ onClose }: FAQModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="task-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="task-modal faq-modal"
        role="dialog"
        aria-modal="true"
        aria-label="FAQ"
        ref={modalRef}
      >
        <div className="task-modal__header">
          <span className="faq-modal__title">FAQ</span>
          <button
            type="button"
            className="task-modal__close"
            onClick={onClose}
            aria-label="Close FAQ"
            autoFocus
          >
            ✕
          </button>
        </div>

        <div className="faq-modal__body">
          <section className="faq-section">
            <h2 className="faq-section__title">About this app</h2>
            <div className="faq-item">
              <p className="faq-item__q">What is the Cognitive Load Task Organizer?</p>
              <p className="faq-item__a">
                Most task managers ask you to sort by priority. This one asks a different question:
                <em> what do you actually have the mental energy to do right now?</em> Tasks are
                categorized by cognitive load — the mental effort they require — so you can pick
                something that matches how you're feeling, not just what's theoretically most important.
                It's designed to be useful for anyone dealing with fatigue, ADHD, executive dysfunction,
                or just a rough day.
              </p>
            </div>
            <div className="faq-item">
              <p className="faq-item__q">What do the load levels mean?</p>
              <p className="faq-item__a">
                <strong>Low load</strong> — routine, low-effort tasks. "Reply to that email." "Put laundry in the dryer."<br />
                <strong>Medium load</strong> — moderate effort, some focus required. "Sort through the mail." "Write a shopping list."<br />
                <strong>High load</strong> — deep focus, significant mental energy. "Write the report." "Do taxes."
              </p>
            </div>
            <div className="faq-item">
              <p className="faq-item__q">What is Momentum Mode?</p>
              <p className="faq-item__a">
                Momentum Mode is an experimental feature (enable it under Advanced Features) that helps
                you build a working rhythm when starting feels hard. You pick a Keystone task — something
                meaningful you want to anchor your session around — and tell the app how much energy you
                have. It then sequences your tasks to warm you up gradually rather than throwing you
                straight into the deep end.
              </p>
            </div>
          </section>

          <section className="faq-section">
            <h2 className="faq-section__title">Your data</h2>
            <div className="faq-item">
              <p className="faq-item__q">Why don't I need to log in?</p>
              <p className="faq-item__a">
                Your tasks never leave your device. There's no account, no server, no database in the
                cloud. Everything is stored directly in your browser using IndexedDB.
              </p>
            </div>
            <div className="faq-item">
              <p className="faq-item__q">What happens if I clear my browser data?</p>
              <p className="faq-item__a">
                Your tasks will be deleted. Export a backup in Settings before clearing browser data.
              </p>
            </div>
            <div className="faq-item">
              <p className="faq-item__q">Is my data private?</p>
              <p className="faq-item__a">
                Yes — it never leaves your browser. No analytics, no tracking, no server ever sees your tasks.
              </p>
            </div>
          </section>

          <section className="faq-section">
            <h2 className="faq-section__title">Import &amp; Export</h2>
            <div className="faq-item">
              <p className="faq-item__q">How does Export work?</p>
              <p className="faq-item__a">
                Export downloads a <code>.json</code> file containing all your tasks and settings.
              </p>
            </div>
            <div className="faq-item">
              <p className="faq-item__q">How does Import work?</p>
              <p className="faq-item__a">
                Import reads a <code>.json</code> file you previously exported. You'll be asked whether
                to <strong>Replace</strong> or <strong>Merge</strong> with your existing tasks.
              </p>
            </div>
            <div className="faq-item faq-item--warning">
              <p className="faq-item__q">⚠️ Don't import files you don't recognise</p>
              <p className="faq-item__a">
                Only import <code>.json</code> files that you exported from this app yourself.
              </p>
            </div>
          </section>

          <section className="faq-section faq-section--links">
            <h2 className="faq-section__title">Further reading &amp; links</h2>
            <div className="faq-links">
              <a href="https://hanasays.myportfolio.com/cognitive-load-task-organizer" target="_blank" rel="noopener noreferrer" className="faq-link">
                Case study — design process &amp; decisions
              </a>
              <a href="https://github.com/martinson-r/Cognitive-Load-Task-Organizer" target="_blank" rel="noopener noreferrer" className="faq-link">
                Source code on GitHub
              </a>
              <a href="https://en.wikipedia.org/wiki/Cognitive_load" target="_blank" rel="noopener noreferrer" className="faq-link">
                Cognitive load — Wikipedia
              </a>
              <a href="https://www.understood.org/en/articles/cognitive-load-what-it-is-why-it-matters" target="_blank" rel="noopener noreferrer" className="faq-link">
                Cognitive load and ADHD — Understood.org
              </a>
              <a href="https://www.nngroup.com/articles/minimize-cognitive-load/" target="_blank" rel="noopener noreferrer" className="faq-link">
                Minimising cognitive load in UX — Nielsen Norman Group
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default FAQModal;
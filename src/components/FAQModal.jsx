import { useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "../styles/faq-modal.css";

function FAQModal({ onClose }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef);

  useEffect(() => {
    function handleKey(e) {
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
          {/* ... keeping all your existing FAQ content unchanged ... */}
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
                straight into the deep end. It's loosely inspired by the idea that starting small builds
                momentum toward harder things.
              </p>
            </div>
          </section>

          <section className="faq-section">
            <h2 className="faq-section__title">Your data</h2>

            <div className="faq-item">
              <p className="faq-item__q">Why don't I need to log in?</p>
              <p className="faq-item__a">
                Your tasks never leave your device. There's no account, no server, no database in the
                cloud. Everything is stored directly in your browser using IndexedDB — the same technology
                browsers use to store offline data for web apps. No login needed because there's nothing
                to authenticate against.
              </p>
            </div>

            <div className="faq-item">
              <p className="faq-item__q">What is IndexedDB, and why use it instead of just saving to a file?</p>
              <p className="faq-item__a">
                IndexedDB is a built-in browser database. Unlike localStorage (which has a small size
                limit and stores everything as plain text), IndexedDB handles structured data, is
                asynchronous so it doesn't slow the app down, and scales gracefully as your task list
                grows. Your data persists between sessions automatically — you don't have to do anything
                to save it.
              </p>
            </div>

            <div className="faq-item">
              <p className="faq-item__q">What happens if I clear my browser data?</p>
              <p className="faq-item__a">
                Your tasks will be deleted. Browser data clears (cookies, cache, site data) will wipe
                IndexedDB along with everything else. If you want a backup, use Export in Settings before
                clearing. This is also why using the app across multiple devices requires manually
                importing/exporting — there's no sync layer.
              </p>
            </div>

            <div className="faq-item">
              <p className="faq-item__q">Is my data private?</p>
              <p className="faq-item__a">
                Yes — it never leaves your browser. No analytics, no tracking, no server ever sees your
                tasks. The trade-off is that there's no backup either. Don't store anything you'd be
                devastated to lose without having exported it first. Also worth noting: IndexedDB is
                stored in plaintext, so if someone has access to your device and knows what they're
                looking for, they could read it.
              </p>
            </div>
          </section>

          <section className="faq-section">
            <h2 className="faq-section__title">Import &amp; Export</h2>

            <div className="faq-item">
              <p className="faq-item__q">How does Export work?</p>
              <p className="faq-item__a">
                Export (in Settings) downloads a <code>.json</code> file containing all your tasks and
                settings. You can use this as a backup, or to move your data to another browser or device
                by importing it there.
              </p>
            </div>

            <div className="faq-item">
              <p className="faq-item__q">How does Import work?</p>
              <p className="faq-item__a">
                Import reads a <code>.json</code> file you previously exported from this app. You'll be
                asked whether to <strong>Replace</strong> (wipe everything and start fresh from the file)
                or <strong>Merge</strong> (add the imported tasks alongside your existing ones). In merge
                mode, if an imported task has the same ID as one you've already edited locally, the
                imported version will overwrite your local edits — so only merge when you know what
                you're bringing in.
              </p>
            </div>

            <div className="faq-item faq-item--warning">
              <p className="faq-item__q">⚠️ Don't import files you don't recognise</p>
              <p className="faq-item__a">
                Only import <code>.json</code> files that you exported from this app yourself. Importing
                an unknown file could overwrite or corrupt your task data. The app validates the format
                before importing, but it can't protect you from intentionally crafted bad data. When in
                doubt, export a backup of your current tasks first, then import.
              </p>
            </div>

            <div className="faq-item">
              <p className="faq-item__q">Can I use this across multiple devices?</p>
              <p className="faq-item__a">
                Yes, but manually. Export from one device, import on the other. There's no automatic
                sync — that would require a server and an account, which this app intentionally doesn't
                have. For most people, a periodic export is enough.
              </p>
            </div>
          </section>

          <section className="faq-section faq-section--links">
            <h2 className="faq-section__title">Further reading &amp; links</h2>

            <div className="faq-links">
              <a
                href="https://hanasays.myportfolio.com/cognitive-load-task-organizer"
                target="_blank"
                rel="noopener noreferrer"
                className="faq-link"
              >
                Case study — design process &amp; decisions
              </a>
              <a
                href="https://github.com/martinson-r/Cognitive-Load-Task-Organizer"
                target="_blank"
                rel="noopener noreferrer"
                className="faq-link"
              >
                Source code on GitHub
              </a>
              <a
                href="https://en.wikipedia.org/wiki/Cognitive_load"
                target="_blank"
                rel="noopener noreferrer"
                className="faq-link"
              >
                Cognitive load — Wikipedia overview
              </a>
              <a
                href="https://www.understood.org/en/articles/cognitive-load-what-it-is-why-it-matters"
                target="_blank"
                rel="noopener noreferrer"
                className="faq-link"
              >
                Cognitive load and ADHD/executive function — Understood.org
              </a>
              <a
                href="https://www.nngroup.com/articles/minimize-cognitive-load/"
                target="_blank"
                rel="noopener noreferrer"
                className="faq-link"
              >
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
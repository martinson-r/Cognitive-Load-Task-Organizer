# Cognitive Organizer — Case Study

**React + IndexedDB · Local-first · [Live Demo](https://cognitiveorganizer.netlify.app/) · [Figma](https://figma.com) · [GitHub](https://github.com/martinson-r/Cognitive-Load-Task-Organizer)**

> Screenshots and design process visuals are available in the 
> [full case study on Adobe Portfolio](https://hanasays.myportfolio.com/cognitive-load-task-organizer).

A task system designed to reduce cognitive overload through constrained workflows and clear priorities.

---

## Table of Contents

- [Overview](#overview)
- [My Role](#my-role)
- [Impact](#impact)
- [Intent](#intent)
- [Design System & Polish Pass](#design-system--polish-pass)
  - [Phase 1 — Rapid Prototyping](#phase-1--rapid-prototyping-with-iterative-lo-fi)
  - [Design Decisions](#design-decisions)
  - [Focused Redesign](#focused-redesign-lo-fi-flow)
  - [Iterative UX Refinement](#iterative-ux-refinement)
  - [Phase 2 — High-Fidelity Figma](#phase-2--high-fidelity-figma-as-source-of-truth)
  - [Phase 3 — AI-Assisted Tokenization Audit](#phase-3--ai-assisted-tokenization-audit)
  - [Phase 4 — UI Implementation Guide](#phase-4--ui-implementation-guide)
  - [What Tokenization Enables](#what-tokenization-enables)
  - [Key Outcomes](#key-outcomes)
- [Technical Decisions / Architecture](#technical-decisions--architecture)
  - [Tradeoffs](#tradeoffs)
  - [Prioritization of Fast Iteration](#prioritization-of-fast-iteration)
  - [Refactor — Completed](#refactor--completed)
  - [What About Testing?](#what-about-testing)
- [Foundations & References](#foundations--references)

---

## Overview

Designed an offline-first task manager to reduce decision friction and support task initiation under low mental energy. Built as a local-first React app using IndexedDB.

**Links:** [Live Demo](https://cognitiveorganizer.netlify.app/) · [Live Figma](https://figma.com) · [GitHub Repo](https://github.com/martinson-r/Cognitive-Load-Task-Organizer) · [UI Implementation Guide](https://cognitiveorganizer.netlify.app/#/ui-guide)

---

## My Role

UX and UI design, front-end architecture, and implementation (React, Vite, IndexedDB).

---

## Impact

- Reduced cognitive load through simplified task flows
- Improved hierarchy, accessibility, and scannability over initial AI-generated design
- Delivered a fully functional, accessible, production-ready application

**Lighthouse scores (mobile):** 99 Performance · 100 Accessibility · 100 Best Practices · 100 SEO

---

## Intent

A lightweight task management app designed around cognitive load theory, allowing tasks to be categorized by mental effort rather than just priority. Built as a small, fully functional MVP.

**Tech Stack:** Vite + React + IndexedDB

**Key features:**
- Offline-first task storage using IndexedDB
- Full CRUD task lifecycle (create, edit, complete, delete)
- Cognitive load categorization (Low / Medium / High effort)
- Clean, minimal UI focused on usability — [Live Figma](https://figma.com)
- Deployed to Netlify with continuous deployment from GitHub — [Live demo](https://cognitiveorganizer.netlify.app/)
- Designed and implemented end-to-end, from concept to production — [GitHub repo](https://github.com/martinson-r/Cognitive-Load-Task-Organizer)

---

## Design System & Polish Pass

### From Working App to Production-Ready UI

After reaching feature completeness, I ran a structured polish pass to bring the visual implementation up to the standard of the high-fidelity Figma. This pass covered spacing consistency, typography standardization, color tokenization, and the creation of a living UI implementation guide. The goal was not just visual polish — it was to build a maintainable system that a developer (or future me) could work with confidently.

---

### Phase 1 — Rapid Prototyping with Iterative Lo-Fi

I used Figma Make as a rough baseline to get the initial UI scaffolded quickly. It's a useful tool for speed, but the output needed significant iteration — features that weren't in the original Make output, or where the generated UI created too much friction in testing, were redesigned through low-fidelity user flow sketches before being rebuilt. The priority at this stage was getting the right features working, not getting them looking right.

The result was usable but "middle-of-the-road" — it established a baseline, but surfaced several issues around hierarchy, accessibility, and interaction clarity.

Attempting to refine these issues directly through AI iteration became increasingly time-consuming and produced diminishing returns. At that point, I shifted to manual design work to address the underlying problems more directly.

The generated design surfaced useful patterns, but required significant refinement for accessibility, clarity, and real-world usability.

**Issues identified:** Visual hierarchy, contrast/accessibility, and cognitive load. These problems made the interface harder to scan and increased decision friction, particularly for users managing multiple tasks.

[Live Link to Figma Make Prototype](https://figma.com)

---

### Design Decisions

- Replace priority-first thinking with effort-based categorization (Low / Medium / High cognitive load) to reduce decision friction
- Avoid icon-only UI for critical information to improve accessibility and reduce interpretation overhead
- Minimize visible controls and defer complexity (e.g. advanced features toggle) to prevent UI clutter
- Structure task entry to reduce cognitive overhead during input rather than relying on post-creation organization
- Prioritize speed of interaction over feature richness to support task initiation

---

### Focused Redesign (Lo-Fi Flow)

Rather than attempting to fix everything at once, I focused on a key issue: cognitive and visual clutter during task creation.

I redesigned the task creation flow to make effort (cognitive load), priority, and context more explicit and easier to select, while reducing the number of competing elements on screen. The goal was to improve scannability and reduce the amount of information users need to process at once.

[Live Figma Link](https://figma.com)

---

### Iterative UX Refinement

The initial implementation prioritized core functionality. After using the app in practice, a key friction point emerged: the filter section occupied significant vertical space even when unused, pushing the task list — the app's primary focus — further down the screen.

**Key improvements:**
- Collapsed filters to reduce default UI complexity
- Added explicit filter state feedback ("X filters active")
- Improved empty states when filters hide results
- Integrated advanced features without overwhelming the core experience

I also tested replacing the "Add task" input with a '+' button, but testers found it distracting and preferred the inline input field.

---

### Iteration and Implementation

I prioritized rapid iteration in the live app over producing high-fidelity mockups. Working directly in code allowed me to quickly test and refine decisions related to typography, contrast, and interaction behavior.

Many accessibility issues (contrast, font size, hierarchy) were addressed iteratively. The redesigned task creation flow, along with several important contrast adjustments, were implemented and refined through direct code iteration rather than a sequential design-then-build process.

[Live demo](https://cognitiveorganizer.netlify.app/)

---

### Phase 2 — High-Fidelity Figma as Source of Truth

Once features felt stable, I returned to Figma to produce a high-fidelity mockup. This was where I made deliberate decisions about spacing rhythm, type scale, color meaning, and component states. Critically, I built the Figma using style variables throughout — spacing, border radius, and color styles were all named and applied consistently.

These Figma variables became the direct source of truth for the CSS token system. The high-fi wasn't just a visual reference; it was the design system specification.

---

### Phase 3 — AI-Assisted Tokenization Audit

Tokenizing an entire codebase is highly repetitive, detail-oriented work — exactly the kind of task where losing track of context is costly.

I used AI assistance to run a systematic audit across all CSS files, feeding it the Figma variables and guidelines as the source of truth. The process involved multiple cleanup passes: standardizing hardcoded values, identifying inconsistencies, consolidating near-duplicate colors, and progressively replacing raw hex values and magic numbers with named tokens.

This is a workflow I wouldn't have attempted without AI assistance. Without it, the scope of the audit would have meant either a much messier codebase or a project that never got properly cleaned up. The AI handled the systematic parts. The judgment calls — what to tokenize, how to name things, when a "close enough" rounding was acceptable and when it wasn't — stayed with me throughout.

---

### Phase 4 — UI Implementation Guide

The final step was distilling the token system into a living implementation guide, accessible at [/#/ui-guide](https://cognitiveorganizer.netlify.app/#/ui-guide) in the deployed app. Rather than a static Figma page or PDF, the guide renders directly from the actual token values — meaning it stays accurate as long as the tokens do.

It's organized for developer utility: tokens are grouped by semantic role (surfaces, borders, text, cognitive load states, feature-specific states), each with a visual preview and a plain-language description of correct usage.

The guide was written for the engineer who needs to maintain or extend the UI, not the designer who built it. A non-engineer reviewer described it as "a style guide I actually know how to use" — which was the target.

---

### What Tokenization Enables

A token-based system isn't just about visual consistency. It's about making change safe and fast.

- Updating the spacing between major sections across the entire app is a single variable change: `--space-3`
- Adding a dark mode later means overriding a defined set of surface and text tokens, not hunting through hundreds of hardcoded hex values
- Onboarding a new engineer means pointing them at the guide rather than asking them to reverse-engineer the CSS

Feature states were treated as first-class tokens — snoozed tasks, active filters, and the Momentum Mode keystone task each have their own token groups. This makes it explicit that these are intentional design decisions, not one-off color choices, and ensures they can be updated or themed without side effects.

**Next steps:** The natural companion to the token inventory is a usage guidelines document — detailing not just what the tokens are, but how they are applied: which surface token is correct for a modal vs. a panel vs. a hover state, spacing rules for specific component types, and guidance for extending the system with new tokens when needed.

---

### Key Outcomes

- Consistent spacing, typography, and color across all components
- Full CSS custom property token system covering text, surfaces, borders, load/priority semantics, actions, icons, system states, feature states, and elevation
- Living UI implementation guide deployed alongside the app
- Single-variable control over global spacing, color, and radius changes
- Accessible to engineers and non-engineers alike

[Live demo](https://cognitiveorganizer.netlify.app/) · [Live Figma](https://figma.com)

---

## Technical Decisions / Architecture

### Tradeoffs

| Decision | Rationale |
|---|---|
| No backend / auth | Prioritized offline-first simplicity over sync and multi-device support |
| IndexedDB over LocalStorage | Increased implementation complexity in exchange for scalability and structured data |
| JavaScript → TypeScript migration | Early development intentionally skipped TypeScript to move faster and validate the product idea. Once the feature set stabilized, the full migration was completed — converting all utilities, constants, stores, and components to TypeScript with strict mode enabled and zero `tsc --noEmit` errors |
| Limited feature scope | Avoided common task app features (tags, nested projects, etc.) to maintain low cognitive overhead |
| No drag-and-drop | Prioritized accessibility and precision over interaction novelty |

---

### Prioritization of Fast Iteration

Early development prioritized iteration speed over architecture. State was colocated in `App` to keep the feedback loop tight while the feature set was still fluid — momentum mode, snooze behavior, and focus mode were all added in quick succession.

Once the core feature set stabilized, the cost of that approach became clear:

- 35+ state declarations in `App`
- ~25 props drilling through `TaskCard` into `EditTaskModal`
- No TypeScript safety net (a conscious early tradeoff)

---

### Refactor — Completed

#### Why the Refactor?

The original architecture made a deliberate tradeoff: colocate everything in `App.jsx` to keep the feedback loop tight while the feature set was still fluid. That tradeoff served its purpose — momentum mode, snooze behavior, focus mode, and custom contexts were all added in quick succession without the overhead of designing a state architecture upfront.

Once the feature set stabilized, the cost of that approach became impossible to ignore. `App.jsx` had grown to 400+ lines with 35+ `useState` declarations spanning six distinct concern domains: task CRUD, filter state, edit form state, momentum run state, app settings, and transient UI state. None of these had any business living in the same component.

Components were receiving props they didn't use, just to pass them to their children. `TaskCard` had become a 25-prop wire between `App` and `EditTaskModal`. Every new feature required touching `App.jsx` regardless of what it actually affected.

The maintenance burden was real, but so was the performance impact. A 400-line component with 35+ state declarations means React is doing significantly more work on every render cycle. On mobile — already resource-constrained — this was measurable. Reducing `App.tsx` to layout and derived state, with domain logic moved into Zustand stores, eliminated unnecessary re-renders and brought the mobile Lighthouse performance score from the high 80s to 99.

The TypeScript migration happened in the same pass because the two problems were connected. The prop drilling was partly invisible for so long because there was no type safety to make it obvious.

#### Decision to Refactor and Add TypeScript Simultaneously

Adding TypeScript without fixing the architecture would have just been annotating the mess. Fixing the architecture without TypeScript would have left the next iteration as vulnerable as the first. Done together, the result is a codebase where each domain has a clear home, components subscribe only to what they need, and the type system enforces correctness at the boundaries that matter.

The architecture refactor was executed in dependency order to keep the app running at every step:

- Zustand migration across four domain slices (`useTaskStore`, `useFilterStore`, `useUIStore`, `useMomentumStore`), each owning its own IndexedDB persistence
- Prop drilling eliminated: `TaskCard` from 25 props to 4, `EditTaskModal` from 12 props to 0, `FilterBar` from 18 props to 2
- Full TypeScript migration with core types defined before any component work, utilities typed first, components last

**Post-refactor Lighthouse (mobile):** 99 Performance · 100 Accessibility · 100 Best Practices · 100 SEO

---

### What About Testing?

The utility functions — particularly the Momentum Mode algorithm — were the highest-priority testing target.

`getMomentumTasks` has enough interacting variables (energy level, keystone load, context boundaries, fallback paths) that manual testing cannot reliably cover the edge cases. Unit tests cover the core Momentum Mode algorithm and task view utilities because they are the logic most likely to fail silently under edge cases.

Testing was deprioritized during initial development in favor of speed, and during the refactor in favor of keeping scope contained. The architecture now makes it straightforward. All store actions and utility functions are isolated and side-effect-free, so the testing surface is clean.

#### Running the Unit Tests
```bash
npm test        # run tests in watch mode
npm run test:ui # visual test runner
```

Test files live in `src/utils/`. Current coverage:
- `momentum.test.ts` — `pickKeystoneForMe`, `getRunwayNeedsFallback`, 
  `hasCrossContextLowerLoadOptions`, `getMomentumTasks`
- `taskView.test.ts` — `getVisibleTasks`, `normalizeTaskPositions`

---

## Foundations & References

This work is informed by cognitive load theory and research on executive function, adapted for practical, real-world use. These references informed the design, but decisions were adapted for practical usability rather than strictly following theory.

**Cognitive Load & Working Memory**
- Sweller, J. (1988) — Cognitive Load During Problem Solving
- Nielsen Norman Group — Working Memory and External Memory

**Executive Function & ADHD**
- Russell Barkley (lecture) — ADHD and Executive Function

**Decision Fatigue & Choice Overload**
- Chernev et al. (2015) — Choice Overload Meta-analysis
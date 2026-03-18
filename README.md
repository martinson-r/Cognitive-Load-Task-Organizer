# Cognitive Load Task Organizer

A lightweight task management app designed around cognitive load. Traditional task managers optimize for priority. This app optimizes for *ability to act*.

Instead of asking “What’s most important?”, this app helps answer:

> "What do I realistically have the mental energy to do right now?"

See the **Design Rationale** section below for more information on the UX philosophy behind this app.

## Tasks are categorized into:

Low Load - simple or routine tasks ("Routine reply to email")

Medium Load - moderate focus required ("Sort clean laundry")

High Load - deep thinking or complex work ("Write 7-page report")

This approach can be helpful for people managing fatigue, executive dysfunction, ADHD, or fluctuating mental energy.

## Work in Progress

This project is currently under active development.

Core task functionality and IndexedDB persistence are implemented.  
Upcoming improvements include much-needed UI/UX polish.

## Live Demo
**[Cognitive Load Task Organizer](https://cognitiveorganizer.netlify.app/)**

## Design Mockup

Below is a UI mockup created in Figma Make as part of the design exploration phase.

**[View Figma mockup](https://www.figma.com/make/95fSiDjTXaqdFkuYqutgt8/Refine-Productivity-App-UI?t=0pci9ZAYvc3utPrX-1)**

Process:
- Provided a raw screenshot of the working app as a starting point
- Used prompting to explore a more polished layout and interaction model
- The resulting mockup helped clarify the intended direction for future UI refinement

This mockup is a design reference, not the shipped implementation.
The live application and repository code reflect the actual engineering work.

### Planned UI direction (Figma mockup)
#### Mobile UI
![Screenshot of planned final demo app mobile UI.](https://i.imgur.com/oLMjmCP.png)

#### Desktop UI
![Screenshot of planned final demo app desktop UI.](https://i.imgur.com/qxJwxs9.jpeg)

### Initial rough implementation (source for mockup)
![Screenshot of rough demo app UI.](https://i.imgur.com/10CwdLz.png)

## AI-Assisted Workflow

AI tools were used selectively during this project for:
- UI exploration and mockup generation
- brainstorming alternative layouts
- accelerating boilerplate implementation

The app's architecture, state management, IndexedDB persistence, task model, CRUD logic, and feature planning were implemented and reviewed intentionally as part of the development process.

Note: The Figma prototype is a design artifact, not the source of truth for implementation.

In particular, the Figma prototype should not be confused with the production code in this repository:
- the prototype represents a visual/design direction
- the application code handles real task persistence and interaction logic
- future UI refactors will adapt the live app toward the mockup incrementally

This workflow reflects a practical approach: using AI to accelerate iteration while maintaining ownership of system design and implementation.

# Features

## Current functionality:

- Create tasks

- Assign cognitive load level (Low / Medium / High)

- Persistent storage using IndexedDB

- Offline-first design (no backend required)

- Delete tasks

- Mark tasks complete

- Filtering by cognitive load

- Optional sorting and task organization

- "Momentum Mode" (see 'Design Rationale' below)

# Tech Stack

React

Vite

IndexedDB for local persistence

Vanilla JavaScript (no TypeScript)

## Why No TypeScript?

This project intentionally uses JavaScript.

The goal is to keep the prototype lightweight and reduce development friction while exploring the UX concept of cognitive load task management. TypeScript may be added in a future iteration as the project stabilizes.

## Why IndexedDB Instead of LocalStorage?

LocalStorage works well for very small key/value data, but this project uses IndexedDB because it provides:

- structured data storage

- significantly larger capacity

- better performance for growing datasets

- asynchronous operations

This allows the app to scale beyond a trivial demo while remaining fully offline-capable.

## Security Considerations

This app stores data locally using IndexedDB and does not implement authentication or encryption. This is intentional, as the app is designed for low-friction personal task management rather than secure data storage. **Sensitive information should not be stored in this app.**


# Design Rationale

This app is built around a simple constraint:

**Human mental energy is limited, inconsistent, and not well represented by traditional priority systems.**

Most task managers assume that users can continuously evaluate priority, urgency, and importance. In practice, that process itself requires **working memory, attention, and executive function** — the exact resources that are often constrained.

Instead of optimizing for “importance,” this app optimizes for:

> **“What can I actually do right now?”**

## Cognitive Load as a UX Model

Tasks are grouped into Low, Medium, and High cognitive load based on the *mental effort required*, not just urgency or category.

This idea is loosely informed by **Cognitive Load Theory** (Sweller, 1988), which describes how working memory has strict limits. When those limits are exceeded, performance drops — even if the task itself is “important.”

By grouping tasks by mental effort, the app reduces the need to constantly re-evaluate:

- how hard something will be

- whether you have the energy for it

- what to do next

The goal is to make task selection **faster and less mentally taxing**.

## Reducing Executive Function Overhead

Research on ADHD and executive function shows consistent challenges with:

- working memory

- task initiation

- planning and prioritization

Traditional task lists can unintentionally increase friction by requiring repeated decision-making.

This app reduces that overhead by:

- simplifying categorization (Low / Medium / High instead of complex tagging systems)

- minimizing required decisions per interaction

- supporting quick “good enough” choices instead of perfect prioritization

## Limiting Visible Tasks

Features like ‘Focus’ and ‘Momentum Mode’ only display a small subset of tasks at a time. These features are influenced by research on choice overload and decision fatigue.

While the research is nuanced, there is strong evidence that **too many options can make action harder**, especially when cognitive resources are already strained.

The goal is not to hide information permanently, but to:

1. reduce visual noise
1. lower decision friction
1. help users commit to a next action

## Snoozing and Deferring Tasks

The ability to temporarily hide tasks (“Snooze”) is designed to reduce repeated re-processing.

Without this, users may repeatedly:

- see the same task and decide “not now”
- expend precious mental energy ignoring the task each time
- continue feeling overwhelmed by the task

This aligns with research on **intention offloading**, which shows that external systems (lists, reminders) reduce cognitive burden by holding deferred intentions.

## Progressive Complexity (Advanced Features Toggle)

Some features (e.g. Snooze, Focus Mode, Momentum Sort) are selectively exposed behind an **Advanced Features toggle**. This is intentional.

A common failure mode in productivity tools is **feature creep leading to cognitive overload**.

By allowing users to opt into advanced behavior, the app can:

- stay simple by default

- support power users without overwhelming others

- maintain a low-friction core experience

### Momentum Mode (Experimental)

Momentum Mode is an optional feature that helps users build a low-friction path into completing a “keystone” task.

Instead of requiring users to decide what to do next, the app:

- selects a “keystone” task (important or effortful)
- builds a short sequence of tasks leading into it
- prioritizes staying within the same context when possible
- minimizes abrupt increases in cognitive load

The goal is to reduce task initiation friction and help users build momentum toward meaningful work.

If no suitable lower-load tasks are available, the system provides feedback rather than making hidden assumptions.

## Practical, Not Prescriptive

This app is **informed by research**, but not rigidly derived from any single framework.

Some design decisions are:

- supported by established findings (working memory limits, executive function constraints)

- guided by UX principles (reduce friction, reduce decisions)

- validated through informal user feedback

The goal is not to enforce a “correct” productivity system. It is to create a tool that **works better under real-world cognitive constraints for people with ADHD or who experience other working memory challenges**.

# Development Workflow

AI-assisted development tools were used as part of the coding workflow for this project.

These tools were primarily used for:

- accelerating boilerplate generation

- exploring alternative implementation approaches

- reviewing potential patterns for IndexedDB integration and React state handling

All code included in this repository was reviewed and validated manually and tested during development.

The project’s structure, feature design, and engineering decisions were made intentionally, and the author can walk through and explain any portion of the codebase.

# Running the Project

## Clone the repository:

```
git clone https://github.com/martinson-r/Cognitive-Load-Task-Organizer.git
cd Cognitive-Load-Task-Organizer
```

## Install dependencies and run the development server:

```
npm install
npm run dev
```

Then open:

http://localhost:5173

# Further Reading
If you're interested in the ideas behind this app:

## Cognitive Load & Working Memory

- [Sweller, J. (1988) — Cognitive Load During Problem Solving](https://andymatuschak.org/files/papers/Sweller%20-%201988%20-%20Cognitive%20load%20during%20problem%20solving.pdf)
- [Nielsen Norman Group — Working Memory and External Memory](https://www.nngroup.com/articles/working-memory-external-memory/)

## Executive Function & ADHD

- [Willcutt et al. (2005) — Executive Function Theory of ADHD (Meta-analysis)](https://pubmed.ncbi.nlm.nih.gov/15950006/)
- [Russell Barkley (lecture) — ADHD and Executive Function](https://www.youtube.com/watch?v=GR1IZJXc6d8&utm_source=chatgpt.com)
- [Dr. Tracey Marks — Executive Function Explained](https://www.youtube.com/watch?v=hiGSo8a5N44&utm_source=chatgpt.com)

## Decision Fatigue & Choice Overload

- [Chernev et al. (2015) — Choice Overload Meta-analysis](https://chernev.com/wp-content/uploads/2017/02/ChoiceOverload_JCP_2015.pdf)
- [Scheibehenne et al. (2010) — Can There Ever Be Too Many Options?](https://academic.oup.com/jcr/article-pdf/37/3/409/5173186/37-3-409.pdf)

## Intention Offloading / External Memory

- [Gilbert et al. (2023) — Outsourcing Memory to External Tools](https://pubmed.ncbi.nlm.nih.gov/35789477)

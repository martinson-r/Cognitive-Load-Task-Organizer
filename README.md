# Cognitive Load Task Organizer

A lightweight task management app designed around **cognitive load**.

Traditional task managers optimize for priority.  
This app optimizes for *ability to act*.

> "What do I realistically have the mental energy to do right now?"

## Live Demo
**[Cognitive Load Task Organizer](https://cognitiveorganizer.netlify.app/)**

No signup required. Data is stored locally in your browser.

## Case Study
**[View Case Study](https://hanasays.myportfolio.com/cognitive-load-task-organizer)**

## Status
Core feature set is stable. Currently migrating to TypeScript and Zustand for state management - replacing prop-drilled App-level state with domain-specific stores (tasks, filters, momentum, UI).

## What This Project Demonstrates

- UX-driven problem framing and solution design  
- Front-end architecture using React + IndexedDB  
- Offline-first application design  
- Accessibility-conscious UI decisions  
- Iterative design process from concept → prototype → implementation  


### Tasks are categorized into:

Low Load — routine tasks ("Reply to email")  
Medium Load — moderate effort ("Sort clean laundry")  
High Load — deep focus ("Write 7-page report")  

This model supports users dealing with fatigue, ADHD, executive dysfunction, or fluctuating mental energy.


## Features

### Core functionality

- Create, edit, and delete tasks  
- Assign cognitive load (Low / Medium / High)  
- Mark tasks complete  
- Persistent storage using IndexedDB  
- Offline-first (no backend required)  

### Additional functionality

- Filtering by cognitive load  
- Optional sorting and organization  
- Momentum Mode (experimental task sequencing)  


## Work in Progress

This project is under active development.

Core functionality and persistence are implemented.  
Ongoing work includes UI/UX refinement and accessibility improvements.


## AI-Assisted Workflow

AI tools were used selectively for:

- UI exploration and mockup generation  
- brainstorming layout variations  
- accelerating boilerplate code  

All architecture, state management, IndexedDB integration, and feature logic were implemented and reviewed manually.


## Tech Stack

- React  
- Vite  
- IndexedDB (local persistence)  
- Vanilla JavaScript  


## Why IndexedDB Instead of LocalStorage?

IndexedDB was chosen because it provides:

- structured data storage  
- larger capacity  
- better performance for growing datasets  
- asynchronous operations  

This allows the app to scale beyond a trivial demo while remaining fully offline-capable.


## Why No TypeScript?

I use TypeScript professionally (UW), but for this project I intentionally skipped it to move faster and validate the product idea. Now that the core features are finished, I am migrating to TypeScript and Zustand for state management.


## Security Considerations

This app stores data locally using IndexedDB and does not implement authentication or encryption.

It is designed for low-friction personal task management.  
**Sensitive information should not be stored in this app.**


## Running the Project

### Clone the repository
`git clone https://github.com/martinson-r/Cognitive-Load-Task-Organizer.git
cd Cognitive-Load-Task-Organizer`

### Install dependencies and run
`npm install
npm run dev`

Then open:

http://localhost:5173

## 🎨 Design System & UI Guide

This project includes a living **UI Implementation Guide** that documents the application's semantic tokens, typography scales, and accessible component patterns.

While the guide is intentionally omitted from the main application navigation to maintain a focused user experience, it can be accessed directly:

* **Live Documentation:** [View the UI Guide](https://cognitiveorganizer.netlify.app/#/ui-guide)
* **Local Development:** Navigate to `/#/ui-guide` while the dev server is running.

**Note:** The deployed URL utilizes `/#/ui-guide`. `HashRouter` was a deliberate tradeoff for zero-config portability across static hosting environments (like Netlify/GitHub Pages) without requiring server-level redirect logic.

### Why a UI Guide?
As a UX Engineer, I built this guide to serve as a pragmatic dictionary for developers. It ensures:
* **Single Source of Truth:** All styles are driven by CSS variables defined in `App.css`, preventing "magic numbers" in the codebase.
* **Theme Scalability:** By using semantic tokens instead of hardcoded hex values, the app supports native Dark Mode with zero component-level overrides.
* **Spatial Consistency:** Layouts follow a strict 8px-based spacing scale to ensure visual rhythm and predictability.
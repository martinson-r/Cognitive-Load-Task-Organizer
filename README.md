# Cognitive Load Task Organizer

A lightweight task management app that organizes tasks by cognitive load rather than traditional priority systems.

Instead of asking “What’s most important?”, this app helps answer:

> "What do I realistically have the mental energy to do right now?"

## Tasks are categorized into:

Low Load — simple or routine tasks

Medium Load — moderate focus required

High Load — deep thinking or complex work

This approach can be helpful for people managing fatigue, executive dysfunction, ADHD, or fluctuating mental energy.

## Work in Progress

This project is currently under active development.

Core task functionality and IndexedDB persistence are implemented.  
Upcoming improvements include:

- task filtering and organization by cognitive load
- task priority support
- UI/UX polish

## Live Demo
**[Cognitive Load Task Organizer](https://cognitiveorganizer.netlify.app/)**

## Design Mockup

Below is a UI mockup created in Figma Make as part of the design exploration phase.

- [View Figma mockup](https://www.figma.com/make/95fSiDjTXaqdFkuYqutgt8/Refine-Productivity-App-UI?t=0pci9ZAYvc3utPrX-1)

Process:
- Provided a raw screenshot of the working app as a starting point
- Used prompting to explore a more polished layout and interaction model
- The resulting mockup helped clarify the intended direction for future UI refinement

This mockup is a design reference, not the shipped implementation.
The live application and repository code reflect the actual engineering work.

### Planned UI direction (Figma mockup)
![Screenshot of planned final demo app mobile UI.](https://i.imgur.com/ilZ5bpL.png)
![Screenshot of planned final demo app desktop UI.](https://i.imgur.com/Qwgad72.png)

### Current implementation (source for mockup)
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

## Planned / upcoming features:

- Delete tasks

- Mark tasks complete

- Filtering by cognitive load

- Optional sorting and task organization

# Tech Stack

React

Vite

IndexedDB for local persistence

Vanilla JavaScript (no TypeScript)

## Why No TypeScript?

This project intentionally uses JavaScript.

The goal is to keep the prototype lightweight and reduce development friction while exploring the UX concept of cognitive load task management. Adding TypeScript would introduce setup overhead without much benefit

## Why IndexedDB Instead of LocalStorage?

LocalStorage works well for very small key/value data, but this project uses IndexedDB because it provides:

- structured data storage

- significantly larger capacity

- better performance for growing datasets

- asynchronous operations

This allows the app to scale beyond a trivial demo while remaining fully offline-capable.

## Security Considerations

This app stores data locally using IndexedDB and does not implement authentication or encryption. This is intentional, as the app is designed for low-friction personal task management rather than secure data storage. **Sensitive information should not be stored in this app.**

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

## Install dependencies:

```
npm install

Run the development server:

npm run dev
```

Then open:

http://localhost:5173

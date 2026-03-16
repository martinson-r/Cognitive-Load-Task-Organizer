# Cognitive Load Task Organizer

A lightweight task management app that organizes tasks by cognitive load rather than traditional priority systems.

Instead of asking “What’s most important?”, this app helps answer:

> "What do I realistically have the mental energy to do right now?"

## Tasks are categorized into:

Low Load — simple or routine tasks

Medium Load — moderate focus required

High Load — deep thinking or complex work

This approach can be helpful for people managing fatigue, executive dysfunction, ADHD, or fluctuating mental energy.

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

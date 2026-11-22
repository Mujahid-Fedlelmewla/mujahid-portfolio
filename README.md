# Mujahid Ali — Arch Workspace

An interactive desktop-inspired portfolio built with React, TypeScript, and Vite. The interface takes cues from Arch Linux and KDE Plasma, while keeping the portfolio readable, accessible, and usable on phones.

## Technologies

- React and TypeScript
- Vite
- Zustand window state
- Lucide icons
- CSS responsive layouts and window interactions

## Getting started

Requires Node.js 20.19+ or 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
```

## Build and preview

```sh
pnpm build
pnpm preview
```

## Architecture

- `src/App.tsx` assembles the desktop, launcher, taskbar, reusable window shell, and app views.
- `src/hooks/useWindowManager.ts` holds the shared window state.
- `src/data/` contains the editable profile, project, skill, and certification information.
- `src/App.css` and `src/index.css` define the desktop, application and responsive styles.

## Customize the content

- Edit `src/data/profile.ts` for your introduction and contact links.
- Edit `src/data/projects.ts` to replace sample project cards with real work. Add repository and demo URLs before publishing them.
- Edit `src/data/skills.ts` to reflect skills you can support with real experience.
- Add only verified learning and credentials to `src/data/certifications.ts`.
- The research library starts with an explicitly marked example. Replace it with your own researched articles and dates.

The terminal is a safe simulation. Its command list is fixed and does not execute operating-system commands. System tray details are visual simulations, not visitor-device readings.

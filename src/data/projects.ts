type Project = { name: string; kind: string; desc: string; tags: string[]; status: string; repository?: string }

export const projects: Project[] = [
  { name: 'Arch Workspace Portfolio', kind: 'Interactive portfolio · Built', desc: 'A responsive portfolio styled as a Linux desktop, with draggable app windows, a project explorer, and a safe simulated terminal.', tags: ['React', 'TypeScript', 'Vite'], status: 'BUILT', repository: 'https://github.com/Mujahid-Fedlelmewla/mujahid-portfolio' },
  { name: 'Linux Workstation Notes', kind: 'Systems · Planned idea', desc: 'A future writeup documenting workstation setup, hardening choices, and lessons learned from a personal Linux environment.', tags: ['Arch Linux', 'Bash'], status: 'PLANNED' },
  { name: 'Network Lab', kind: 'Networking · Planned idea', desc: 'A planned home lab for learning network fundamentals with isolated, safe practice exercises.', tags: ['TCP/IP', 'Wireshark'], status: 'PLANNED' },
]

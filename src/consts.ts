// Central site configuration. Edit these to update brand-wide details.

export const SITE = {
  name: 'Mark Thebault',
  title: 'Mark Thebault — Agentic AI & Platform Engineering',
  tagline: 'Bridging Agentic AI and platform engineering at scale',
  description:
    'Mark Thebault is a principal architect working at the intersection of ' +
    'Agentic AI and platform engineering. Essays, field notes, and project ' +
    'work on building production-grade AI on solid platform foundations.',
  url: 'https://www.mark-thebault.pro',
  role: 'Principal Architect',
  location: 'Remote · EU',
  // Drawing-style title block metadata used in the hero.
  drawingNo: 'MT—2025',
} as const;

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/markthebault', handle: 'markthebault' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mark-thebault', handle: 'mark-thebault' },
  { label: 'X', href: 'https://x.com/MarkThebault', handle: '@MarkThebault' },
  { label: 'Email', href: 'mailto:markthebaultpro@gmail.com', handle: 'markthebaultpro@gmail.com' },
] as const;

export const NAV = [
  { label: 'Writing', href: '/articles/' },
  { label: 'Work', href: '/work/' },
  { label: 'About', href: '/about/' },
] as const;

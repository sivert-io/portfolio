import type { AppType } from '../packages/signature'

export const apps: AppType[] = [
  {
    slug: 'about-sivert',
    name: 'Portfolio',
    description:
      'My personal site built with React, TypeScript, Motion, Tailwind, and MDX for project-driven storytelling.',
    image: '/person-icon.svg',
  },
  {
    slug: 'cs2-server-manager',
    name: 'CS2 Server Manager',
    description:
      'A Go-based multi-server manager for Counter-Strike 2, built to automate competitive server operations and tournament workflows.',
    image: '/csm-icon.svg',
  },
  {
    slug: 'gryt-chat',
    name: 'Gryt.chat',
    description:
      'An experimental real-time voice platform built around WebRTC, WebSockets, and a multi-service architecture for modern server-based communication.',
    image: '/gryt/icon.svg',
  },
  {
    slug: 'matchzy-auto-tournament',
    name: 'Matchzy Auto Tournament',
    description:
      'A tournament automation platform for CS2 with bracket orchestration, real-time match tracking, and automatic server allocation.',
    image: '/mat-icon.svg',
  },
  {
    slug: 'websocket-voice',
    name: 'WebSocket Voice',
    description:
      'A proof-of-concept voice communication stack combining React, TypeScript, Go, and Pion WebRTC for low-latency audio experiences.',
    image: '/webrtc-icon.svg',
  },
  {
    slug: 'steam-provider-authjs',
    name: 'Steam Provider for Auth.js',
    description:
      'A custom Steam authentication provider for Auth.js / NextAuth-style flows, aimed at game-adjacent web applications.',
    image: '/steam-icon.svg',
  },
  {
    slug: 'golf-mk4-remote-start',
    name: 'Golf MK4 Remote Start',
    description:
      'An embedded side project exploring Arduino-based remote start logic for a Volkswagen Golf GTI MK4.',
    image: '/car-icon.svg',
  },
  {
    slug: 'gameobject-sorter',
    name: 'GameObject Sorter',
    description:
      'A Unity utility for organizing scene hierarchies and improving workflow when working with larger sets of GameObjects.',
    image: '/grid-icon.svg',
  },
  {
    slug: 'game-development',
    name: 'Game Development',
    description:
      'A collection of experiments and tooling around gameplay systems, pipelines, and prototyping with engines like Godot and Unity.',
    image: '/game-icon.svg',
  },
  {
    slug: 'norsk-tipping',
    name: 'Norsk Tipping',
    description:
      'Selected professional work focused on front-end engineering, product experience, and production-grade application development.',
    image: '/nt-icon.svg',
  },
  {
    slug: 'matchzy-overtime-manager',
    name: 'Matchzy Overtime Manager',
    description:
      'An Express-based rules engine for CS2 overtime handling, built to enforce custom match logic on top of get5 / MatchZy events.',
    image: '/mat-icon.svg',
  },
  {
    slug: 'kanbn-github-sync',
    name: 'Kanbn GitHub Sync',
    description:
      'Automation tooling for syncing GitHub issues into Kanbn boards with minimal manual setup.',
    image: '/grid-icon.svg',
  },
  {
    slug: 'fbx-action-exporter',
    name: 'FBX Action Exporter',
    description:
      'A Blender add-on for exporting animation actions as separate FBX files, designed for game-development pipelines.',
    image: '/game-icon.svg',
  },
]

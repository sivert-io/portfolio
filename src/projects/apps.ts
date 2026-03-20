import type { AppType } from '../packages/signature'

export const apps: AppType[] = [
  {
    slug: 'portfolio',
    name: 'Portfolio',
    description:
      'My personal site, built with React, TypeScript, MDX, and Tailwind to present projects through short technical case studies and polished product storytelling.',
    image: '/person-icon.svg',
  },
  {
    slug: 'cs2-server-manager',
    name: 'CS2 Server Manager',
    description:
      'A Go-based automation platform for deploying and managing multiple CS2 servers, built for competitive operations and tournament workflows.',
    image: '/csm-icon.svg',
  },
  {
    slug: 'matchzy-enhanced',
    name: 'MatchZy Enhanced',
    description:
      'A CS2 server plugin built with C# and CounterStrikeSharp to extend MatchZy with stronger automation, match events, and live operational tooling.',
    image: '/mat-icon.svg',
  },
  {
    slug: 'gryt-chat',
    name: 'Gryt Chat',
    description:
      'A self-hosted real-time communication platform for voice, video, and chat, built with a multi-service architecture around WebRTC and modern infrastructure.',
    image: '/gryt/icon.svg',
  },
  {
    slug: 'matchzy-auto-tournament',
    name: 'MatchZy Auto Tournament',
    description:
      'A tournament automation platform for CS2 with bracket orchestration, map veto, server allocation, and real-time match progression.',
    image: '/mat-icon.svg',
  },
  {
    slug: 'steam-provider-authjs',
    name: 'Steam Provider for Auth.js',
    description:
      'A custom Steam authentication provider for Auth.js v5, built to support modern OpenID-based login flows in game-adjacent web applications.',
    image: '/steam-icon.svg',
  },
  {
    slug: 'golf-mk4-remote-start',
    name: 'Golf Mk4 Remote Start',
    description:
      'An embedded hardware project using Arduino and GSM to enable SMS-based remote start for a Volkswagen Golf Mk4 GTI.',
    image: '/car-icon.svg',
  },
  {
    slug: 'gameobject-sorter',
    name: 'GameObject Sorter',
    description:
      'A Unity editor utility for organizing large scene hierarchies and improving workflow when working with many GameObjects.',
    image: '/grid-icon.svg',
  },
  {
    slug: 'game-development',
    name: 'Game Development',
    description:
      'The part of my background where I built my programming foundation, working across Unity, Godot, Unreal, and Roblox since around 2015.',
    image: '/game-icon.svg',
  },
  {
    slug: 'matchzy-overtime-manager',
    name: 'MatchZy Overtime Manager',
    description:
      'An Express-based rules engine for custom CS2 overtime handling, designed to enforce match logic on top of MatchZy-driven events.',
    image: '/mat-icon.svg',
  },
  {
    slug: 'kanbn-github-sync',
    name: 'Kanbn GitHub Sync',
    description:
      'An automation service that syncs GitHub issues into Kanbn boards, with automatic board setup and status-driven workflow mapping.',
    image: '/grid-icon.svg',
  },
  {
    slug: 'fbx-action-exporter',
    name: 'FBX Action Exporter',
    description:
      'A Blender add-on for exporting animation actions as separate FBX files, built to support cleaner game-development asset pipelines.',
    image: '/game-icon.svg',
  },
  {
    slug: 'handy-unity-scripts',
    name: 'Handy Unity Scripts',
    description:
      'A collection of small Unity tools and utility scripts for editor automation, workflow improvements, and reusable runtime helpers.',
    image: '/grid-icon.svg',
  },
]

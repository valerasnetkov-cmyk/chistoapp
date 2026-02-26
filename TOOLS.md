# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### External Skills (Awesome Skills Repo)

- **Location:** `/root/.openclaw/workspace/skills/external-awesome-skills/skills/`
- **How to use:** When the user mentions a specific skill or role (e.g., "brainstorming", "security audit", "vulnerability scan"), search for the corresponding directory in this path, read its `SKILL.md`, and follow the instructions within it.
- **Key skills to recommend:**
    - `@brainstorming` -> `brainstorming/SKILL.md`
    - `@vulnerability-scanner` -> `vulnerability-scanner/SKILL.md`
    - `@architecture` -> `architecture/SKILL.md`
    - `@docs-architect` -> `docs-architect/SKILL.md`
    - `@api-security` -> `api-security-best-practices/SKILL.md`
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

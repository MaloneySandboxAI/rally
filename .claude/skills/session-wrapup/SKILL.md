---
name: session-wrapup
description: "End-of-session documentation updater for the Rally project. Use this skill when the user says things like: 'wrap up', 'update the docs', 'update project status', 'what did we do today', 'session wrapup', 'end of session', 'update CLAUDE.md', 'a Conductor build just landed', 'review what changed', 'sync the docs', or any variation of updating project documentation to reflect recent work. Also trigger when the user is about to end a session and you want to suggest a docs update."
---

# Session Wrapup

Update `CLAUDE.md` and `PROJECT-STATUS.md` to reflect work completed in this session (or via an external tool like Conductor).

## When to Run

- End of any working session
- After a Conductor build has been pushed
- When the user asks to update docs or project status
- Proactively suggest this when a session has made significant changes

## Process

### Step 1: Determine What Changed

**If this was a Cowork session** (Claude did the work):
- Review the conversation to identify what was built, fixed, or modified
- Note any new files created, files modified, or files deleted

**If a Conductor build landed** (external changes):
- Run `git log --oneline -5` to see recent commits
- Run `git diff HEAD~1 --stat` (or appropriate range) to see changed files
- Read any new files to understand what was added
- Check for new components, routes, lib files, or config changes

### Step 2: Update CLAUDE.md

Read the current `CLAUDE.md` and update these sections as needed:

1. **Tech Stack** — add any new tools, APIs, or services
2. **Key Architecture** — update if new systems were added (e.g., new game mode, new integration)
3. **App Routes** — add any new routes
4. **Key Files** — add new pages, components, and lib files to the appropriate section
5. **Design Conventions** — update if new patterns were established
6. **Pending / Roadmap** — mark completed items with [x], add new items with [ ]

**Rules:**
- Keep descriptions concise (one line per file/route)
- Preserve the existing structure — don't reorganize unless necessary
- Don't remove entries for files that still exist
- Add new entries in logical groupings near related items

### Step 3: Update PROJECT-STATUS.md

Read the current `PROJECT-STATUS.md` and update:

1. **Update the date** at the top: `*Last updated: [today's date]*`
2. **Completed Features** — move items from "In Progress" to "Completed" as appropriate. Add new completed items.
3. **In Progress / Pending** — remove completed items, add any new items discovered during the session
4. **Technical Debt** — add any new debt items noticed
5. **Key Contacts & Accounts** — update if new services were added

**Rules:**
- Use checkboxes: `- [x]` for done, `- [ ]` for pending
- Group items logically under the existing headers
- Keep the "Immediate" section focused on truly next-up items (3-5 max)
- Move completed "Immediate" items up to the "Completed" section, don't just check them off in place

### Step 4: Summary

Tell the user:
- What documentation was updated
- Key changes reflected
- Any items that need their attention (e.g., "you still need to push these changes")
- Suggest: "Push with: `cd ~/Desktop/rally && git add -A && git commit -m 'update project docs' && git push origin main`"

## Example Triggers

**End of Cowork session:**
> "We're done for today — wrap up the docs."

**After Conductor build:**
> "I just pushed a Conductor build that added X. Update the docs."

**Quick status sync:**
> "Sync the project docs with the current state of the code."

**Proactive (Claude suggests):**
> After completing significant work, Claude should say: "Want me to update the project docs before we wrap up?"

# Claude AI Assistant - Project Memory

## User Preferences

### Session Documentation
- **Auto-prompt for session summaries**: The user wants to be asked periodically during chat sessions if they want to save a summary/memory of the current work
- **Storage location**: Save session summaries in `/mnt/g/HSC/Reale/commessa-control-hub/.docs/ai_notes/`
- **Format**: Markdown files with timestamp and descriptive names
- **Frequency**: Ask when significant work is completed or at natural breakpoints

### Project Context
- **Project**: Commessa Control Hub - Gestione Commesse
- **Language**: Italian for UI and documentation
- **Tech Stack**: React, TypeScript, Prisma, PostgreSQL, Express
- **Current Status**: Post-bug fixes and layout standardization (2025-01-15)

## Important Notes
- User prefers concise responses (fewer than 4 lines unless detail requested)
- Always use TodoWrite tool for tracking multi-step tasks
- Follow established layout patterns for UI consistency
- Document significant changes and solutions
- **Testing Environment**: User must execute local curl/API tests (Claude runs on WSL, project runs on Windows)

## AI Assistant Instructions
- **Proactively ask** about saving session summaries during natural breakpoints
- **Suggest documentation** when solving complex problems
- **Maintain continuity** by referencing this file for context
- **Update this file** when user preferences change

---
*This file serves as persistent memory across Claude sessions for this project.*
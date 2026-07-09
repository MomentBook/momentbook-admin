@AGENTS.md

# Claude Code

Treat `AGENTS.md` as the durable repository contract. For every non-trivial
planning or implementation task, proactively invoke at least one suitable
helper agent when an independent bounded task exists. Prefer the global
`repository-explorer` and `test-planner` during planning and implementation,
and `code-reviewer` before finalizing a diff. Keep helpers read-only unless
disjoint, parallel-safe edits are deliberately delegated. The main agent owns
integration and final verification.

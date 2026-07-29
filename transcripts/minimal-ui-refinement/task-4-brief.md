### Task 4: Repository-local reusable agent playbooks

**Files:**
- Create: `.agent/README.md`
- Create: `.agent/backend-api-security.md`
- Create: `.agent/frontend-ui-tests.md`
- Create: `.agent/quality-review.md`
- Modify: `TASKS.md`

**Interfaces:**
- Consumes: `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, `AI_WORKFLOW.md`, and the approved design specs.
- Produces: role-selection guidance and scoped backend, frontend, and quality checklists.

- [ ] **Step 1: Write the four playbooks**

Create concise Markdown files with Purpose, Use when, Read first, Guardrails, Workflow, Commands, and Definition of done sections. The backend playbook must require validated Auth0 `sub`, owner-scoped Prisma access, `404` privacy, DTO validation, API documentation, and two-user tests. The frontend playbook must require approved brand tokens, Public Sans, Minimal-inspired MUI patterns, responsive navigation, real actions, shared states, and Vitest coverage. The review playbook must remain read-only until a finding is approved and check privacy, mobile navigation, fonts, keyboard access, inactive controls, documentation, and exact command outcomes.

- [ ] **Step 2: Verify guidance consistency**

Run:

```bash
rg -n "owner|404|Auth0|responsive|Public Sans|no-op|bun run" .agent
rg -n "PLACEHOLDER|FIXME" .agent
```

Expected: the first command finds the required guidance; the second returns no matches.

- [ ] **Step 3: Mark the reusable-agent task complete**

Change only `Add .agent/ reusable agent capability` from unchecked to checked in `TASKS.md`.

- [ ] **Step 4: Commit the playbooks**

```bash
git add .agent/README.md .agent/backend-api-security.md .agent/frontend-ui-tests.md .agent/quality-review.md TASKS.md
git commit -m "📝 docs: add reusable engineering playbooks"
```


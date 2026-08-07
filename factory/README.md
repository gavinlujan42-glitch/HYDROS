# HYDROS AI Software Factory

HYDROS is evolving from a water-intelligence portal into an AI-native software factory for water, GIS, knowledge management, cybersecurity, analytics, and government modernization.

## Phase 1: Cloudflare-native control plane

This directory contains the first deployable control plane for the HYDROS agent workforce.

### Current components

- Cloudflare Worker API
- Workers AI binding
- 30-agent registry
- Human-approval flags for consequential roles
- D1 starter schema for projects, evidence, epics, stories, agent runs, and decisions
- Explicit handoff graph between discovery, delivery, engineering, domain, and executive agents

### API

- `GET /api/health`
- `GET /api/agents`
- `GET /api/agents/:id`
- `POST /api/agents/:id/run`

Example run request:

```json
{
  "task": "Interview a district-office user about the water-right application intake process.",
  "context": "The goal is to identify the current process, exceptions, duplicate entry, and documents used.",
  "evidence": ["User currently enters applicant information in two systems."]
}
```

## Local development

```bash
cd factory
npm install
npm run dev
```

## Deploy Worker

Authenticate Wrangler to the intended Cloudflare account, then:

```bash
cd factory
npm install
npm run deploy
```

The initial Worker intentionally uses only Workers + Workers AI so it can be deployed before provisioning storage bindings.

## Free-tier expansion plan

### Workers
Use as the API gateway, agent router, policy boundary, and lightweight orchestration layer.

### Workers AI
Use for low-cost prototype inference, classification, summaries, requirement extraction, backlog preparation, and lightweight agent reasoning. More capable external models can later be routed through the same control plane for selected tasks.

### D1
Use for structured project state: projects, interviews, provenance, epics, stories, approvals, agent runs, and decision logs. `schema.sql` contains the starter schema.

Provisioning example:

```bash
npx wrangler d1 create hydros-factory
npx wrangler d1 execute hydros-factory --file=./schema.sql --remote
```

After creation, add the generated D1 binding to `wrangler.jsonc` as `DB`.

### KV
Use for configuration, agent prompt versions, feature flags, short-lived caches, and reference lookups that do not require relational queries.

### R2
Use for large artifacts such as opt-in process recordings, GIS exports, generated reports, source packages, screenshots, and document-analysis objects. Sensitive recordings should use short retention, explicit consent, and access controls.

### Queues
Use for asynchronous agent jobs, ingestion, document processing, GIS jobs, and event-driven handoffs. Keep request/response interactions synchronous only when the user is waiting for the result.

## Daily Routine Observer

The routine-observation feature is designed around explicit user consent.

Required controls:

1. User explicitly starts recording.
2. Persistent recording indicator is visible.
3. Pause and stop are always available.
4. User can exclude applications/windows.
5. Passwords, secrets, and configured sensitive regions are masked or omitted.
6. The system records business-process events, not covert employee surveillance.
7. Users can review captured evidence before it becomes a requirement source.
8. Retention is configurable and should default to the shortest useful period.

Outputs:

- task timeline
- menu/navigation path
- systems and artifacts touched
- decision points
- wait states and rework
- manual duplicate entry
- handoffs
- automation candidates
- source-linked user stories

## Human accountability

AI agents accelerate work but do not silently assume accountable professional authority. Legal conclusions, material cybersecurity risk acceptance, engineering/scientific determinations, production releases, procurement decisions, and product acceptance retain explicit human ownership.

## Next engineering milestones

1. Provision D1 and wire project state.
2. Add KV prompt/config registry.
3. Add R2 artifact storage for consented workflow evidence.
4. Add Queue-backed long-running jobs.
5. Build the operator console into the existing HYDROS UI.
6. Add auth and organization/role boundaries before handling real sensitive records.
7. Connect GitHub/Figma/GIS/document repositories through scoped service adapters.

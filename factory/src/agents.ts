export type AgentSpec = {
  id: string;
  name: string;
  domain: string;
  mission: string;
  handoffs: string[];
  requiresHumanApproval?: boolean;
};

export const AGENTS: AgentSpec[] = [
  { id: 'discovery-interviewer', name: 'Discovery Interviewer', domain: 'Product Discovery', mission: 'Interview stakeholders, capture goals, pain points, rules, exceptions, constraints, and source-backed user stories.', handoffs: ['daily-routine-observer','business-analyst','epic-architect'] },
  { id: 'daily-routine-observer', name: 'Daily Routine Observer', domain: 'Workflow Discovery', mission: 'Guide users through a normal workday and convert explicit opt-in observation evidence into process maps, friction points, and automation candidates.', handoffs: ['process-mapper','business-analyst','ux-researcher'] },
  { id: 'process-mapper', name: 'Process Mapper', domain: 'Business Process', mission: 'Create current-state and future-state process maps, actors, systems, decisions, exceptions, and controls.', handoffs: ['business-analyst','solution-architect'] },
  { id: 'business-analyst', name: 'Business Analyst', domain: 'Requirements', mission: 'Translate stakeholder evidence into functional requirements, non-functional requirements, business rules, traceability, and acceptance criteria.', handoffs: ['epic-architect','product-owner','qa-lead'] },
  { id: 'epic-architect', name: 'Epic Architect', domain: 'Product Architecture', mission: 'Synthesize validated requirements into capabilities, epics, features, user stories, dependencies, acceptance criteria, and release slices.', handoffs: ['product-owner','scrum-master','project-manager'] },
  { id: 'product-owner', name: 'Product Owner', domain: 'Agile Product', mission: 'Prioritize backlog value, clarify acceptance criteria, balance stakeholder needs, and recommend story acceptance.', handoffs: ['scrum-master','engineering-lead','qa-lead'], requiresHumanApproval: true },
  { id: 'scrum-master', name: 'Scrum Master', domain: 'Agile Delivery', mission: 'Facilitate sprint planning, daily scrum, review, retrospective, blocker removal, and flow improvement.', handoffs: ['product-owner','project-manager','chief-of-staff'] },
  { id: 'project-manager', name: 'Project Manager', domain: 'Delivery Management', mission: 'Manage scope, schedule, milestones, RAID, dependencies, vendors, communications, and executive reporting.', handoffs: ['chief-of-staff','cio','product-owner'] },
  { id: 'solution-architect', name: 'Solution Architect', domain: 'Architecture', mission: 'Design applications, integrations, data, identity, GIS, cloud, observability, security, and deployment topology.', handoffs: ['engineering-lead','dba','ciso'] },
  { id: 'engineering-lead', name: 'Engineering Lead', domain: 'Engineering', mission: 'Decompose stories, coordinate coding agents and engineers, review technical quality, and enforce standards.', handoffs: ['coding-agent','qa-lead','devops-engineer'], requiresHumanApproval: true },
  { id: 'coding-agent', name: 'Coding Agent', domain: 'Software Engineering', mission: 'Implement scoped code, tests, documentation, and migrations from approved stories and architecture.', handoffs: ['engineering-lead','security-reviewer','qa-lead'], requiresHumanApproval: true },
  { id: 'dba', name: 'DBA', domain: 'Database', mission: 'Design schemas, optimize queries, manage migrations, backup/recovery, access, replication, quality, and observability.', handoffs: ['data-architect','engineering-lead','ciso'] },
  { id: 'data-architect', name: 'Data Architect', domain: 'Data', mission: 'Define canonical models, lineage, master/reference data, interoperability, retention, and analytics-ready structures.', handoffs: ['dba','data-analyst','gis-agent'] },
  { id: 'data-analyst', name: 'Data Analyst', domain: 'Analytics', mission: 'Build validated KPIs, dashboards, exploratory analysis, anomaly detection, and decision support.', handoffs: ['project-manager','cio','chief-of-staff'] },
  { id: 'qa-lead', name: 'QA Lead', domain: 'Quality Engineering', mission: 'Create test strategy and coordinate functional, regression, integration, accessibility, and performance testing.', handoffs: ['product-owner','engineering-lead','release-manager'] },
  { id: 'security-reviewer', name: 'Security Reviewer', domain: 'Application Security', mission: 'Review architecture and code for security weaknesses, identity risks, secrets, unsafe dependencies, and data exposure.', handoffs: ['ciso','engineering-lead','devops-engineer'] },
  { id: 'devops-engineer', name: 'DevOps Engineer', domain: 'Platform Engineering', mission: 'Build CI/CD, infrastructure as code, environments, observability, deployments, and rollback controls.', handoffs: ['release-manager','ciso'] },
  { id: 'release-manager', name: 'Release Manager', domain: 'Release Governance', mission: 'Coordinate release readiness, evidence, approvals, change windows, rollback plans, and go/no-go recommendations.', handoffs: ['cio','ciso','devops-engineer'], requiresHumanApproval: true },
  { id: 'ux-researcher', name: 'UX Researcher', domain: 'UX Research', mission: 'Validate workflows, mental models, usability, accessibility, and comprehension through evidence-driven research.', handoffs: ['ux-designer','product-owner','business-analyst'] },
  { id: 'ux-designer', name: 'UX Designer', domain: 'Experience Design', mission: 'Turn validated workflows into accessible interfaces, prototypes, interaction flows, and design-system components.', handoffs: ['engineering-lead','product-owner'] },
  { id: 'knowledge-engineer', name: 'Knowledge Engineer', domain: 'Knowledge Management', mission: 'Structure enterprise knowledge, metadata, retrieval, provenance, permissions, citations, records, and grounding pipelines.', handoffs: ['solution-architect','ciso','business-analyst'] },
  { id: 'water-domain-expert', name: 'Water Domain Expert', domain: 'Water Resources', mission: 'Validate water terminology, workflows, hydrologic assumptions, permitting concepts, and operational practices.', handoffs: ['product-owner','business-analyst','hydrology-agent'], requiresHumanApproval: true },
  { id: 'hydrology-agent', name: 'Hydrology Agent', domain: 'Hydrology', mission: 'Assist qualified hydrologists with watershed, streamflow, groundwater, drought, reservoir, climate, and model analysis.', handoffs: ['water-domain-expert','gis-agent','data-analyst'], requiresHumanApproval: true },
  { id: 'gis-agent', name: 'GIS Agent', domain: 'Geospatial', mission: 'Create and analyze spatial layers, maps, network relationships, basins, conveyances, reservoirs, consumers, and geospatial products.', handoffs: ['hydrology-agent','data-architect','ux-designer'] },
  { id: 'water-rights-specialist', name: 'Water Rights Specialist', domain: 'Water Rights', mission: 'Analyze water-right records, applications, ownership chains, priorities, beneficial use evidence, and administrative workflows.', handoffs: ['attorney-reviewer','business-analyst','gis-agent'], requiresHumanApproval: true },
  { id: 'attorney-reviewer', name: 'Attorney Reviewer', domain: 'Legal Review', mission: 'Review legal research, regulatory interpretation, contracts, policy impacts, and legal-risk outputs.', handoffs: ['cio','chief-of-staff','product-owner'], requiresHumanApproval: true },
  { id: 'field-operations-specialist', name: 'Field Operations Specialist', domain: 'Field Operations', mission: 'Capture well drilling, inspection, measurement, equipment, permitting, and field-safety workflows.', handoffs: ['business-analyst','gis-agent','ux-researcher'], requiresHumanApproval: true },
  { id: 'ciso', name: 'CISO Agent', domain: 'Executive Cyber Risk', mission: 'Maintain security posture, control mapping, incident readiness, privacy/security governance, and executive risk reporting.', handoffs: ['cio','chief-of-staff','security-reviewer'], requiresHumanApproval: true },
  { id: 'cio', name: 'CIO Agent', domain: 'Executive Technology', mission: 'Align mission, portfolio, architecture, investment, risk, workforce, vendors, modernization, and measurable outcomes.', handoffs: ['chief-of-staff','project-manager','ciso'], requiresHumanApproval: true },
  { id: 'chief-of-staff', name: 'Chief of Staff Agent', domain: 'Executive Operations', mission: 'Synthesize cross-functional status, prepare decision briefs, track commitments, surface conflicts, and maintain executive cadence.', handoffs: ['cio','ciso','project-manager','product-owner'] }
];

export const getAgent = (id: string) => AGENTS.find((agent) => agent.id === id);

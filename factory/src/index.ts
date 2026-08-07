import { AGENTS, getAgent } from './agents';

type Env = {
  AI: {
    run(model: string, input: unknown): Promise<unknown>;
  };
  HYDROS_ENV: string;
  DEFAULT_MODEL: string;
  MAX_AGENT_STEPS: string;
};

type RunRequest = {
  task?: string;
  context?: string;
  evidence?: string[];
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-allow-methods': 'GET, POST, OPTIONS'
    }
  });

const systemPrompt = (agentId: string) => {
  const agent = getAgent(agentId);
  if (!agent) return null;
  return [
    `You are ${agent.name}, a member of the HYDROS AI Software Factory.`,
    `Domain: ${agent.domain}.`,
    `Mission: ${agent.mission}`,
    'Operating rules:',
    '- Separate facts, assumptions, recommendations, and unresolved questions.',
    '- Never invent stakeholder requirements or evidence.',
    '- Preserve provenance when evidence is supplied.',
    '- Prefer concise, structured outputs that another agent can consume.',
    '- Treat permissions as least privilege and do not request unrelated data.',
    '- Flag consequential decisions for qualified human review.',
    agent.requiresHumanApproval ? '- This role requires human approval before consequential decisions are treated as final.' : '',
    `Expected handoffs: ${agent.handoffs.join(', ')}.`
  ].filter(Boolean).join('\n');
};

async function runAgent(env: Env, agentId: string, body: RunRequest) {
  const agent = getAgent(agentId);
  if (!agent) return json({ error: 'agent_not_found' }, 404);
  if (!body.task?.trim()) return json({ error: 'task_required' }, 400);

  const userMessage = [
    `TASK:\n${body.task.trim()}`,
    body.context ? `CONTEXT:\n${body.context.trim()}` : '',
    body.evidence?.length ? `EVIDENCE:\n${body.evidence.map((e, i) => `${i + 1}. ${e}`).join('\n')}` : '',
    'Return: findings, assumptions, unresolved questions, recommended next actions, and handoff target(s).'
  ].filter(Boolean).join('\n\n');

  const result = await env.AI.run(env.DEFAULT_MODEL || '@cf/meta/llama-3.2-3b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt(agentId) },
      { role: 'user', content: userMessage }
    ]
  });

  return json({
    factory: 'HYDROS AI Software Factory',
    environment: env.HYDROS_ENV,
    agent: { id: agent.id, name: agent.name, domain: agent.domain },
    requiresHumanApproval: !!agent.requiresHumanApproval,
    result
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization', 'access-control-allow-methods': 'GET, POST, OPTIONS' } });

    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/api/health') {
      return json({
        name: 'HYDROS AI Software Factory',
        status: 'online',
        environment: env.HYDROS_ENV,
        agents: AGENTS.length,
        endpoints: ['/api/agents', '/api/agents/:id', '/api/agents/:id/run']
      });
    }

    if (url.pathname === '/api/agents' && request.method === 'GET') {
      return json({ agents: AGENTS });
    }

    const match = url.pathname.match(/^\/api\/agents\/([^/]+)(\/run)?$/);
    if (match) {
      const agentId = decodeURIComponent(match[1]);
      const isRun = match[2] === '/run';
      if (!isRun && request.method === 'GET') {
        const agent = getAgent(agentId);
        return agent ? json(agent) : json({ error: 'agent_not_found' }, 404);
      }
      if (isRun && request.method === 'POST') {
        let body: RunRequest;
        try {
          body = await request.json() as RunRequest;
        } catch {
          return json({ error: 'invalid_json' }, 400);
        }
        return runAgent(env, agentId, body);
      }
    }

    return json({ error: 'not_found' }, 404);
  }
};

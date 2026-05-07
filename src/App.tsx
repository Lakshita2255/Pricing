import { useEffect, useMemo, useState } from 'react';

type ToolEntry = {
  id: string;
  tool: string;
  plan: string;
  seats: number;
  spend: number;
  useCase: string;
};

const TOOL_OPTIONS = [
  { tool: 'Cursor', plans: ['Hobby', 'Pro', 'Business', 'Enterprise'] },
  { tool: 'GitHub Copilot', plans: ['Individual', 'Business', 'Enterprise'] },
  { tool: 'ChatGPT', plans: ['Plus', 'Team', 'Enterprise', 'API direct'] },
  { tool: 'Claude', plans: ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API direct'] },
  { tool: 'OpenAI', plans: ['Free', 'Pay-as-you-go', 'Enterprise'] },
];

const STORAGE_KEY = 'credex-audit-form';

const defaultEntry = (): ToolEntry => ({
  id: crypto.randomUUID?.() ?? String(Date.now()),
  tool: 'Cursor',
  plan: 'Hobby',
  seats: 1,
  spend: 0,
  useCase: '',
});

const planRecommendations: Record<string, Record<string, string>> = {
  Cursor: {
    Hobby: 'Good for solo experimentation. Check team seat usage carefully.',
    Pro: 'Mostly right for 1-3 people doing mixed lighter work.',
    Business: 'Use only if seat count is high and you are using collaboration features.',
    Enterprise: 'Reserve for large negotiated contracts only.',
  },
  'GitHub Copilot': {
    Individual: 'Best fit for one-person usage. Confirm if you need business security features.',
    Business: 'A good choice for small teams that need shared seat management.',
    Enterprise: 'Only if security, compliance or negotiated pricing are required.',
  },
};

function computeAudit(entries: ToolEntry[]) {
  const report = entries.map((entry) => {
    const toolRules = planRecommendations[entry.tool]?.[entry.plan];
    const spendScore = entry.spend > 200 ? 'likely overspending' : 'within a reasonable range';
    const savings = Math.round(entry.spend * (entry.spend > 300 ? 0.18 : 0.08));
    return {
      ...entry,
      suggestion: toolRules ?? 'Review whether this plan matches your team size and use case.',
      spendScore,
      potentialSavings: savings,
      action: entry.spend > 300 ? 'Consider a lower tier or credits-based option for this workload.' : 'Track this spend and watch for bulk discounts.',
    };
  });

  const totalSpend = entries.reduce((sum, item) => sum + item.spend, 0);
  const totalSavings = report.reduce((sum, item) => sum + item.potentialSavings, 0);

  return {
    totalSpend,
    totalSavings,
    report,
    headline:
      totalSpend > 1000
        ? 'Your current spend looks like it could be optimized further.'
        : 'Your spend is modest; focus on the largest tools first.',
  };
}

function App() {
  const [entries, setEntries] = useState<ToolEntry[]>([defaultEntry()]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch {
        setEntries([defaultEntry()]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const result = useMemo(() => computeAudit(entries), [entries]);

  const updateEntry = (id: string, changes: Partial<ToolEntry>) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)));
  };

  const addEntry = () => setEntries((prev) => [...prev, defaultEntry()]);
  const removeEntry = (id: string) => setEntries((prev) => prev.filter((entry) => entry.id !== id));

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Credex AI Spend Audit — Day 2 scope</p>
          <h1>AI spend audit starter</h1>
          <p className="subtitle">
            Capture tool spend, team size, and plan. This is a partial build for the first two days,
            with a simple audit summary and plan recommendations.
          </p>
        </div>
      </header>

      <section className="card">
        <h2>Spend input form</h2>
        <p>Enter current AI tool plans, monthly spend, seats, and primary use cases.</p>

        {entries.map((entry, index) => {
          const plans = TOOL_OPTIONS.find((option) => option.tool === entry.tool)?.plans ?? [];
          return (
            <div key={entry.id} className="entry-card">
              <div className="entry-row">
                <label>
                  Tool
                  <select
                    value={entry.tool}
                    onChange={(event) => updateEntry(entry.id, { tool: event.target.value, plan: TOOL_OPTIONS.find((option) => option.tool === event.target.value)?.plans[0] ?? 'Hobby' })}
                  >
                    {TOOL_OPTIONS.map((option) => (
                      <option key={option.tool} value={option.tool}>
                        {option.tool}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Plan
                  <select value={entry.plan} onChange={(event) => updateEntry(entry.id, { plan: event.target.value })}>
                    {plans.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="entry-row">
                <label>
                  Monthly spend ($)
                  <input
                    type="number"
                    min="0"
                    value={entry.spend}
                    onChange={(event) => updateEntry(entry.id, { spend: Number(event.target.value) })}
                  />
                </label>

                <label>
                  Seats
                  <input
                    type="number"
                    min="1"
                    value={entry.seats}
                    onChange={(event) => updateEntry(entry.id, { seats: Number(event.target.value) })}
                  />
                </label>
              </div>

              <label className="full-width">
                Primary use case
                <input
                  type="text"
                  placeholder="e.g. product writing, research, customer support"
                  value={entry.useCase}
                  onChange={(event) => updateEntry(entry.id, { useCase: event.target.value })}
                />
              </label>

              <div className="entry-actions">
                <button type="button" onClick={() => removeEntry(entry.id)} disabled={entries.length === 1}>
                  Remove tool
                </button>
                {index === entries.length - 1 && (
                  <button type="button" onClick={addEntry}>
                    Add another tool
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <button type="button" className="primary" onClick={() => setSubmitted(true)}>
          Review audit summary
        </button>
      </section>

      {submitted && (
        <section className="card result-card">
          <h2>Audit summary</h2>
          <p className="result-headline">{result.headline}</p>
          <div className="summary-meter">
            <strong>Total spend:</strong> ${result.totalSpend.toFixed(0)} / month
            <strong>Potential savings:</strong> ${result.totalSavings} / month
          </div>

          <div className="result-grid">
            {result.report.map((item) => (
              <article key={item.id} className="tool-result">
                <h3>{item.tool}</h3>
                <p>
                  <strong>{item.plan}</strong> — {item.useCase || 'Primary use case not specified'}
                </p>
                <p>{item.suggestion}</p>
                <p>
                  <strong>Status:</strong> {item.spendScore}
                </p>
                <p>
                  <strong>Action:</strong> {item.action}
                </p>
                <p>
                  <strong>Estimated savings:</strong> ${item.potentialSavings} / month
                </p>
              </article>
            ))}
          </div>
          <p className="note">
            This is an early prototype for the first two days of the project. The full audit engine,
            vendor pricing sourcing, and shareable report flow are planned for the remaining days.
          </p>
        </section>
      )}
    </div>
  );
}

export default App;

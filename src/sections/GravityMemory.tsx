const repo = 'https://github.com/SachchitBalamurugan/gravity-memory'

const views = [
  {
    image: 'run-inspector',
    label: 'Run inspector',
    title: 'See what an agent knew',
    description: 'Follow a run’s memory reads and writes, inspect the evidence it received, and replay a previous answer against current memory.',
    alt: 'Gravity Memory run inspector showing an agent run and its memory activity',
  },
  {
    image: 'context',
    label: 'Context',
    title: 'Give the next agent the right context',
    description: 'Retrieve relevant memories with their sources and carry a handoff into the next session.',
    alt: 'Gravity Memory context view with retrieved memories and supporting information',
  },
  {
    image: 'models',
    label: 'Local models',
    title: 'Keep model-assisted review local',
    description: 'Choose an installed local model for optional source review. Proposed facts are checked against the original text.',
    alt: 'Gravity Memory local model catalog and review routing',
  },
]

export default function GravityMemory() {
  return (
    <section className="gravity-story section" id="gravity-memory-details" aria-labelledby="gravity-title">
      <div className="gravity-intro">
        <div>
          <p className="eyebrow">OPEN SOURCE · AGENT MEMORY</p>
          <h2 id="gravity-title">An agent should remember <em>what changed.</em></h2>
        </div>
        <div className="gravity-intro-copy">
          <p>Most agents start a new session without the full story. Gravity Memory gives them a shared record of facts, corrections, and decisions they can use across runs.</p>
          <p>When a customer moves from Seattle to Tucson, a later agent can recall the correction. A developer can still inspect the earlier Seattle answer and the message behind it.</p>
          <div className="gravity-actions">
            <a className="btn btn-dark" href={repo} target="_blank" rel="noreferrer">Explore on GitHub ↗</a>
            <a className="btn btn-quiet" href={repo + '/releases/latest'} target="_blank" rel="noreferrer">Download for Windows ↗</a>
          </div>
        </div>
      </div>
      <figure className="gravity-hero-image">
        <img src="/work/gravity/overview.webp" alt="Gravity Memory console overview with agent runs, memory activity, and recent searches" width="1440" height="960" loading="lazy" />
        <figcaption>Gravity Memory console · Overview</figcaption>
      </figure>
      <div className="gravity-features">
        {views.map((view) => (
          <article className="gravity-feature" key={view.image}>
            <div className="gravity-feature-copy">
              <p className="eyebrow">{view.label}</p>
              <h3>{view.title}</h3>
              <p>{view.description}</p>
            </div>
            <figure>
              <img src={'/work/gravity/' + view.image + '.webp'} alt={view.alt} width="1440" height="960" loading="lazy" />
            </figure>
          </article>
        ))}
      </div>
      <div className="gravity-bottom">
        <p><strong>Made for developers.</strong> Connect agents through MCP, Python, or TypeScript. Run it on your own machine or self-host a team workspace.</p>
        <a href={repo} target="_blank" rel="noreferrer">View the project ↗</a>
      </div>
    </section>
  )
}

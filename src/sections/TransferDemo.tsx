import type { CSSProperties } from 'react'
import { transferSteps } from '../data/transferSteps'
import { clamp01 } from '../lib/gsap'
import './transfer-demo.css'

const skills = ['release-notes', 'review-diff']

export default function TransferDemo({ index, progress, onSelect }: {
  index: number
  progress: number
  onSelect: (step: number) => void
}) {
  const step = transferSteps[index]
  // Each copy starts a little later and stays in Codex once it reaches the destination.
  const positions = skills.map((_, i) => clamp01((progress - 0.08 - i * 0.17) / 0.57))
  const copying = index === 2 && positions.some(p => p < 1)
  return (
    <div className="transfer-demo" role="group" aria-label="Agent Transfer terminal walkthrough" data-phase={index}>
      <div className="transfer-nav" role="group" aria-label="Demo steps">
        {transferSteps.map((item, i) => (
          <button key={item.name} type="button" aria-pressed={i === index}
            onClick={() => onSelect(i)}>{item.name}</button>
        ))}
        <span className="transfer-scroll-hint">Scroll ↓</span>
      </div>

      <div className="transfer-console">
        <div className="transfer-context">{step.context}</div>
        <div className="transfer-prompt">
          <span aria-hidden="true">{index === 0 ? '$' : '›'}</span>
          <code data-spot="command">{step.lines.map(line => <span key={line}>{line}</span>)}</code>
        </div>
        <p className="transfer-reply"><span data-spot="reply">{copying ? 'Copying the approved skills…' : step.reply}</span></p>
      </div>

      <div className="transfer-route">
        <div className="transfer-folder" data-spot="source">
          <b>Claude Code</b><code>.claude/skills/</code>
          {skills.map(name => <span className="transfer-file" key={name}>{name}</span>)}
        </div>
        <div className="transfer-bridge" aria-hidden="true">→</div>
        <div className="transfer-folder transfer-target" data-spot="destination">
          <b>Codex</b><code>.agents/skills/</code>
          {index < 2
            ? <span className="transfer-pending">{index === 1 ? 'Awaiting approval' : 'Awaiting transfer'}</span>
            : skills.map((name, i) => (index === 3 || positions[i] === 1) &&
              <span key={name} className="transfer-file">{name}</span>)}
        </div>
        {index === 2 && <div className="transfer-flight" aria-hidden="true">
          {skills.map((name, i) => (
            <span key={name} className="transfer-file" style={{
              '--travel': positions[i],
              opacity: clamp01(Math.min(positions[i], 1 - positions[i]) * 10),
            } as CSSProperties}>{name}</span>
          ))}
        </div>}
      </div>
    </div>
  )
}

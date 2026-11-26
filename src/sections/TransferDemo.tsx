import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../lib/hooks'
import './transfer-demo.css'

const steps = [
  { name: 'Install', context: 'Shell · CLI installed', lines: ['agent-transfer install codex'], reply: 'Open a new Codex session.', duration: 2800 },
  { name: 'Preview', context: 'Codex · new session', lines: ['Use $agent-transfer to preview', 'my Claude skills for Codex.'], reply: '2 skills ready to copy.', duration: 3800 },
  { name: 'Transfer', context: 'Codex', lines: ['Apply that preview.'], reply: 'Copied 2 skills into .agents/skills/.', duration: 2900 },
  { name: 'Use skill', context: 'Codex · new session', lines: ['Use $release-notes on my last commit.'], reply: '• Add CSV export', duration: 0 },
]
const skills = ['release-notes', 'review-diff']
const last = steps.length - 1

export default function TransferDemo() {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const [auto, setAuto] = useState(!reduced)
  const step = steps[index]
  const playing = auto && index < last

  useEffect(() => {
    const element = root.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !playing) return
    const timer = window.setTimeout(() => setIndex(index + 1), step.duration)
    return () => window.clearTimeout(timer)
  }, [visible, playing, index, step.duration])

  function togglePlayback() {
    if (index === last) setIndex(0)
    setAuto(!playing)
  }

  const copied = index >= 2
  return (
    <div ref={root} className="transfer-demo" aria-label="Agent Transfer terminal walkthrough"
      data-motion={auto && !reduced ? 'on' : 'off'} data-phase={index}>
      <div className="transfer-nav" role="group" aria-label="Demo steps">
        {steps.map((item, i) => (
          <button key={item.name} type="button" aria-pressed={i === index}
            onClick={() => { setAuto(false); setIndex(i) }}>{item.name}</button>
        ))}
        <button className="transfer-play" type="button" onClick={togglePlayback}
          aria-label={index === last ? 'Replay demo' : playing ? 'Pause demo' : 'Play demo'}>
          <span aria-hidden="true">{index === last ? '↺' : playing ? 'Ⅱ' : '▶'}</span>
        </button>
      </div>

      <div key={index} className="transfer-console">
        <div className="transfer-context">{step.context}</div>
        <div className="transfer-prompt">
          <span aria-hidden="true">{index === 0 ? '$' : '›'}</span>
          <code>{step.lines.map((line, i) =>
            <span key={line} style={{ '--delay': `${i * 580}ms`, '--chars': line.length } as CSSProperties}>{line}</span>,
          )}</code>
        </div>
        <p className="transfer-reply" style={{ '--delay': index === 2 ? '1300ms' : `${step.lines.length * 580 + 150}ms` } as CSSProperties}>
          {step.reply}
        </p>
      </div>

      <div className="transfer-route">
        <div className="transfer-folder">
          <b>Claude Code</b><code>.claude/skills/</code>
          {skills.map(name => <span className="transfer-file" key={name}>{name}</span>)}
        </div>
        <div className="transfer-bridge" aria-hidden="true">→</div>
        <div className="transfer-folder transfer-target">
          <b>Codex</b><code>.agents/skills/</code>
          {copied ? skills.map(name => <span key={name} className="transfer-file">{name}</span>)
            : <span className="transfer-pending">{index === 1 ? 'Awaiting approval' : 'Awaiting transfer'}</span>}
        </div>
        {index === 2 && <div className="transfer-flight" aria-hidden="true">
          {skills.map(name => <span key={name} className="transfer-file">{name}</span>)}
        </div>}
      </div>
    </div>
  )
}

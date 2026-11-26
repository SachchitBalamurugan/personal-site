export const transferSteps = [
  {
    name: 'Install', context: 'Shell · CLI installed',
    lines: ['agent-transfer install codex'], reply: 'Open a new Codex session.',
    callouts: [
      { target: 'command', label: 'Install in Codex', explanation: 'Run this command to make Agent Transfer available in Codex, where you want to use your Claude Code skills.' },
      { target: 'reply', label: 'Start a fresh session', explanation: 'Open Codex again after installation. The new session discovers the transfer skill and can respond to it by name.' },
    ],
  },
  {
    name: 'Preview', context: 'Codex · new session',
    lines: ['Use $agent-transfer to preview', 'my Claude skills for Codex.'], reply: '2 skills ready to copy.',
    callouts: [
      { target: 'command', label: 'Ask for a preview', explanation: 'Name the source and destination in your prompt. Agent Transfer inspects your Claude Code skills before making any changes.' },
      { target: 'source', label: 'Review these two skills', explanation: 'The preview found release-notes and review-diff in Claude Code. Both are ready to copy, and Codex is waiting for your approval.' },
    ],
  },
  {
    name: 'Transfer', context: 'Codex',
    lines: ['Apply that preview.'], reply: 'Copied 2 skills into .agents/skills/.',
    callouts: [
      { target: 'command', label: 'Approve the copy', explanation: 'Once the preview looks right, tell Codex to apply it. That approval starts the copy of the two skills you just reviewed.' },
      { target: 'destination', label: 'Skills arrive in Codex', explanation: 'Each folder arrives in .agents/skills/ with its scripts and templates. The original folders stay available in Claude Code.' },
    ],
  },
  {
    name: 'Use skill', context: 'Codex · new session',
    lines: ['Use $release-notes on my last commit.'], reply: '• Add CSV export',
    callouts: [
      { target: 'command', label: 'Call the copied skill', explanation: 'In a fresh Codex session, ask for $release-notes by name and tell it which commit to summarize.' },
      { target: 'reply', label: 'Read the release note', explanation: 'The copied skill reads the last commit. “Add CSV export” is the release note it produces in this example.' },
    ],
  },
]

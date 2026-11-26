export const transferSteps = [
  {
    name: 'Install', context: 'Shell · CLI installed',
    lines: ['agent-transfer install codex'], reply: 'Open a new Codex session.',
    explanation: 'Start in the agent you want to move into. This command installs Agent Transfer in Codex. Open a fresh session so Codex can find it.',
  },
  {
    name: 'Preview', context: 'Codex · new session',
    lines: ['Use $agent-transfer to preview', 'my Claude skills for Codex.'], reply: '2 skills ready to copy.',
    explanation: 'Ask Codex what it can bring over. The preview finds two skills in Claude Code. You can review them before either one is copied.',
  },
  {
    name: 'Transfer', context: 'Codex',
    lines: ['Apply that preview.'], reply: 'Copied 2 skills into .agents/skills/.',
    explanation: 'Approve the preview to copy both skill folders, including their scripts and templates. Claude Code keeps its originals.',
  },
  {
    name: 'Use skill', context: 'Codex · new session',
    lines: ['Use $release-notes on my last commit.'], reply: '• Add CSV export',
    explanation: 'Open a new Codex session and ask for $release-notes by name. Here it reads the last commit and turns it into a release note.',
  },
]

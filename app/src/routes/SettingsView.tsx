import { useRef, useState } from 'react'
import { useProgress } from '@/store/useProgress'
import { useAllSubjects } from '@/lib/hooks'
import { Card, Notice, Pill, SubjectBadge } from '@/components/ui'
import { exportBackup, importBackup, wipeAll, type Backup } from '@/lib/db'
import { estimateCost, getUsage } from '@/lib/ai'
import { formatMinutes } from '@/lib/date'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SettingsView() {
  const settings = useProgress((s) => s.settings)
  const profile = useProgress((s) => s.profile)
  const saveSettings = useProgress((s) => s.saveSettings)
  const saveProfile = useProgress((s) => s.saveProfile)
  const reload = useProgress((s) => s.reload)
  const { subjects } = useAllSubjects()
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'info' | 'warn' | 'danger'; text: string } | null>(null)
  const [confirmWipe, setConfirmWipe] = useState(false)

  const usage = getUsage()
  const weeklyTotal = settings.weeklyCapacity.reduce((a, b) => a + b, 0)

  const setCapacity = (index: number, minutes: number) => {
    const next = [...settings.weeklyCapacity]
    next[index] = minutes
    void saveSettings({ weeklyCapacity: next })
  }

  const doExport = async () => {
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gcse-hq-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setMessage({ tone: 'info', text: 'Backup downloaded. Keep it somewhere safe — this is the only copy of the progress data.' })
  }

  const doImport = async (file: File) => {
    try {
      const backup = JSON.parse(await file.text()) as Backup
      await importBackup(backup, { merge: true })
      await reload()
      setMessage({ tone: 'info', text: `Restored from backup taken ${new Date(backup.exportedAt).toLocaleString('en-GB')}.` })
    } catch (e) {
      setMessage({ tone: 'danger', text: e instanceof Error ? e.message : 'Could not read that file.' })
    }
  }

  const doWipe = async () => {
    await wipeAll()
    await reload()
    setConfirmWipe(false)
    setMessage({ tone: 'warn', text: 'All local progress deleted.' })
  }

  return (
    <div className="stack-lg fade-up" style={{ maxWidth: 760 }}>
      <div>
        <h1>Settings</h1>
        <p className="muted small" style={{ marginTop: 2 }}>
          Everything is stored on this device. Nothing is sent anywhere unless you switch on the AI features.
        </p>
      </div>

      {message ? <Notice variant={message.tone}>{message.text}</Notice> : null}

      <Card>
        <div className="card-head"><h3>You</h3></div>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={profile.name} onChange={(e) => void saveProfile({ name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="exam">First GCSE exam</label>
          <input
            id="exam"
            type="text"
            value={profile.examStart}
            placeholder="YYYY-MM-DD"
            onChange={(e) => void saveProfile({ examStart: e.target.value })}
          />
          <div className="field-hint">Drives the countdown. Update it once the timetable is published.</div>
        </div>
      </Card>

      <Card>
        <div className="card-head">
          <h3>Study time</h3>
          <div className="spacer" />
          <Pill tone="accent">{formatMinutes(weeklyTotal)} a week</Pill>
        </div>
        <p className="small muted">
          How long you can realistically study each day. The planner never schedules more than this, and moves
          missed blocks into whatever room is left.
        </p>
        <div className="stack-sm" style={{ marginTop: 14 }}>
          {DAYS.map((day, i) => (
            <div key={day} className="row" style={{ gap: 12 }}>
              <span className="small" style={{ minWidth: 82 }}>{day}</span>
              <input
                type="range"
                min={0}
                max={180}
                step={15}
                value={settings.weeklyCapacity[i]}
                onChange={(e) => setCapacity(i, Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span className="small mono nowrap" style={{ minWidth: 52, textAlign: 'right' }}>
                {settings.weeklyCapacity[i] === 0 ? 'off' : formatMinutes(settings.weeklyCapacity[i])}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="card-head"><h3>Target grades</h3></div>
        <div className="stack-sm">
          {subjects.map((subject) => (
            <div key={subject.id} className="row" style={{ gap: 11 }}>
              <SubjectBadge icon={subject.icon} colour={subject.colour} size={28} />
              <span className="small" style={{ flex: 1, minWidth: 0 }}>{subject.name}</span>
              <select
                style={{ width: 90 }}
                value={profile.targets[subject.id] ?? ''}
                onChange={(e) => void saveProfile({
                  targets: { ...profile.targets, [subject.id]: Number(e.target.value) },
                })}
              >
                <option value="">—</option>
                {[9, 8, 7, 6, 5, 4, 3].map((g) => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="card-head">
          <h3>AI tutor</h3>
          <div className="spacer" />
          <Pill tone={settings.ai.mode === 'off' ? 'default' : 'accent'}>{settings.ai.mode}</Pill>
        </div>

        <div className="field">
          <label htmlFor="ai-mode">Mode</label>
          <select
            id="ai-mode"
            value={settings.ai.mode}
            onChange={(e) => void saveSettings({ ai: { ...settings.ai, mode: e.target.value as typeof settings.ai.mode } })}
          >
            <option value="off">Off</option>
            <option value="proxy">Proxy (recommended)</option>
            <option value="direct">Direct — key stored in this browser</option>
          </select>
          <div className="field-hint">
            Proxy mode sends requests to a small Cloudflare Worker that holds the API key, so the key never
            reaches the browser. See <code>worker/README.md</code> for the five-minute deploy.
          </div>
        </div>

        {settings.ai.mode === 'proxy' ? (
          <div className="field">
            <label htmlFor="proxy">Proxy URL</label>
            <input
              id="proxy"
              type="url"
              placeholder="https://gcse-hq-claude.your-subdomain.workers.dev"
              value={settings.ai.proxyUrl}
              onChange={(e) => void saveSettings({ ai: { ...settings.ai, proxyUrl: e.target.value.trim() } })}
            />
          </div>
        ) : null}

        {settings.ai.mode === 'direct' ? (
          <>
            <div className="field">
              <label htmlFor="key">Anthropic API key</label>
              <input
                id="key"
                type="password"
                placeholder="sk-ant-…"
                value={settings.ai.apiKey}
                onChange={(e) => void saveSettings({ ai: { ...settings.ai, apiKey: e.target.value.trim() } })}
              />
            </div>
            <Notice variant="warn">
              Direct mode puts a working API key in this browser's storage. Fine on your own machine; do not use
              it on a shared or school laptop.
            </Notice>
          </>
        ) : null}

        {settings.ai.mode !== 'off' ? (
          <>
            <div className="field">
              <label htmlFor="model">Model</label>
              <select
                id="model"
                value={settings.ai.model}
                onChange={(e) => void saveSettings({ ai: { ...settings.ai, model: e.target.value } })}
              >
                <option value="claude-haiku-4-5-20251001">Haiku 4.5 — cheapest, fine for hints</option>
                <option value="claude-sonnet-5">Sonnet 5 — best balance</option>
                <option value="claude-opus-5">Opus 5 — strongest, most expensive</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="cap">Monthly request cap</label>
              <input
                id="cap"
                type="number"
                min={0}
                max={5000}
                value={settings.ai.monthlyRequestCap}
                onChange={(e) => void saveSettings({ ai: { ...settings.ai, monthlyRequestCap: Number(e.target.value) } })}
              />
              <div className="field-hint">A hard stop, so a runaway loop cannot run up a bill.</div>
            </div>

            <hr className="divider" />
            <div className="row row-wrap" style={{ gap: 16 }}>
              <div>
                <div className="stat-label">This month</div>
                <div style={{ fontWeight: 700 }}>{usage.requests} / {settings.ai.monthlyRequestCap} requests</div>
              </div>
              <div>
                <div className="stat-label">Tokens</div>
                <div style={{ fontWeight: 700 }}>
                  {(usage.inputTokens / 1000).toFixed(1)}k in · {(usage.outputTokens / 1000).toFixed(1)}k out
                </div>
              </div>
              <div>
                <div className="stat-label">Estimated cost</div>
                <div style={{ fontWeight: 700, color: estimateCost(usage) > 5 ? 'var(--amber)' : 'var(--green)' }}>
                  £{estimateCost(usage).toFixed(2)}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </Card>

      <Card>
        <div className="card-head"><h3>Sound</h3></div>
        <label className="row" style={{ gap: 10, cursor: 'pointer', marginBottom: 0 }}>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => void saveSettings({ soundEnabled: e.target.checked })}
            style={{ width: 17, height: 17, accentColor: 'var(--accent)' }}
          />
          <span className="small" style={{ color: 'var(--text)', fontWeight: 400 }}>
            Play a chime on correct answers and at the end of a session
          </span>
        </label>
      </Card>

      <Card>
        <div className="card-head"><h3>Backup</h3></div>
        <p className="small muted">
          All progress lives in this browser. Clearing site data deletes it. Export regularly, and import the
          file on another device to move progress across.
        </p>
        <div className="btn-group" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={() => void doExport()}>⬇ Export backup</button>
          <button className="btn" onClick={() => fileInput.current?.click()}>⬆ Import backup</button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void doImport(file)
              e.target.value = ''
            }}
          />
        </div>
      </Card>

      <Card style={{ borderColor: 'rgb(255 95 109 / 0.32)' }}>
        <div className="card-head"><h3 style={{ color: 'var(--red)' }}>Danger zone</h3></div>
        <p className="small muted">
          Deletes every mastery record, review schedule, attempt and plan on this device. There is no undo —
          export a backup first.
        </p>
        {!confirmWipe ? (
          <button className="btn btn-danger" style={{ marginTop: 12 }} onClick={() => setConfirmWipe(true)}>
            Delete all progress
          </button>
        ) : (
          <div className="btn-group" style={{ marginTop: 12 }}>
            <button className="btn btn-danger" onClick={() => void doWipe()}>Yes, delete everything</button>
            <button className="btn btn-ghost" onClick={() => setConfirmWipe(false)}>Cancel</button>
          </div>
        )}
      </Card>
    </div>
  )
}

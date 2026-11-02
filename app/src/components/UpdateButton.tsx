/**
 * "Refresh" in the top bar: fetch the newest app and revision content now.
 *
 * Why it is needed: the service worker serves content JSON stale-while-
 * revalidate, so after a deploy the first visit still shows the old content
 * and the new one only appears next time. This button clears the content
 * cache, asks the service worker to pick up any new build, and reloads.
 *
 * It also checks the live content index (bypassing every cache) on open and
 * whenever the tab comes back into view, and lights up when there is a newer
 * build than the one on screen.
 */
import { useEffect, useState } from 'react'
import { useContent } from '@/store/useContent'

const indexUrl = () => `${import.meta.env.BASE_URL}content/index.json?fresh=${Date.now()}`

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function UpdateButton() {
  const builtAt = useContent((s) => s.index?.builtAt)
  const [latest, setLatest] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        // The query string keeps this out of the service worker's content cache.
        const r = await fetch(indexUrl(), { cache: 'no-store' })
        if (r.ok) setLatest(((await r.json()) as { builtAt: string }).builtAt)
      } catch {
        // Offline: nothing to compare against, the button still works as a refresh.
      }
    }
    void check()
    const onVisible = () => document.visibilityState === 'visible' && void check()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const newer = !!latest && !!builtAt && latest !== builtAt

  const refresh = async () => {
    setBusy(true)
    try {
      if ('caches' in window) await caches.delete('gcse-content')
      const reg = await navigator.serviceWorker?.getRegistration()
      if (reg) {
        await reg.update().catch(() => undefined)
        const incoming = reg.installing ?? reg.waiting
        if (incoming) {
          // autoUpdate builds skip waiting; wait for the new worker to take over, but never hang.
          await new Promise<void>((resolve) => {
            navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })
            setTimeout(resolve, 6000)
          })
        }
      }
    } finally {
      window.location.reload()
    }
  }

  const title = [
    'Get the latest version of the app and revision content',
    builtAt ? `On screen: ${fmt(builtAt)}` : null,
    newer && latest ? `Available: ${fmt(latest)}` : null,
  ].filter(Boolean).join('\n')

  return (
    <button
      type="button"
      className={`btn btn-sm update-btn${newer ? ' is-new' : ''}`}
      onClick={() => void refresh()}
      disabled={busy}
      title={title}
      aria-label={newer ? 'Update available — get the latest version' : 'Refresh — get the latest version'}
    >
      <span className={busy ? 'spin' : undefined} aria-hidden>↻</span>
      {busy ? 'Updating…' : newer ? 'Update available' : 'Refresh'}
    </button>
  )
}

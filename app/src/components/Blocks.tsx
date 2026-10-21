/** Renders authored content blocks. */
import type { ContentBlock } from '@/types/content'

const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div style={{ overflowX: 'auto', margin: '10px 0' }}>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.86rem', minWidth: 340 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{
              textAlign: 'left', padding: '8px 11px', borderBottom: '1px solid var(--border-bright)',
              color: 'var(--text-muted)', fontWeight: 650, fontSize: '0.78rem',
              textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '8px 11px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const CALLOUT = {
  tip: { icon: '💡', colour: 'var(--green)', bg: 'var(--green-dim)' },
  warning: { icon: '⚠️', colour: 'var(--amber)', bg: 'var(--amber-dim)' },
  exam: { icon: '🎯', colour: 'var(--accent-bright)', bg: 'rgb(44 63 107 / 0.5)' },
  note: { icon: '📌', colour: 'var(--text-muted)', bg: 'var(--surface-2)' },
} as const

export const Block = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case 'prose':
      return <p style={{ marginBottom: 12 }}>{block.text}</p>

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag style={{ margin: '0 0 12px', paddingLeft: 22 }}>
          {block.items.map((item, i) => <li key={i} style={{ marginBottom: 5 }}>{item}</li>)}
        </Tag>
      )
    }

    case 'table':
      return <Table headers={block.headers} rows={block.rows} />

    case 'code':
      return (
        <figure style={{ margin: '0 0 12px' }}>
          <pre style={{
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '13px 15px', overflowX: 'auto', margin: 0, lineHeight: 1.6,
          }}>
            <code>{block.code}</code>
          </pre>
          {block.caption ? (
            <figcaption className="tiny dim" style={{ marginTop: 5 }}>{block.caption}</figcaption>
          ) : null}
        </figure>
      )

    case 'callout': {
      const style = CALLOUT[block.variant]
      return (
        <div style={{
          display: 'flex', gap: 11, padding: '12px 14px', margin: '0 0 12px',
          background: style.bg, borderRadius: 'var(--radius-sm)',
          borderLeft: `3px solid ${style.colour}`,
        }}>
          <span style={{ flexShrink: 0 }}>{style.icon}</span>
          <div>
            {block.title ? (
              <div style={{ fontWeight: 650, fontSize: '0.86rem', color: style.colour, marginBottom: 3 }}>
                {block.title}
              </div>
            ) : null}
            <div className="small">{block.text}</div>
          </div>
        </div>
      )
    }

    case 'steps':
      return (
        <div style={{ margin: '0 0 12px' }}>
          {block.title ? <div style={{ fontWeight: 650, marginBottom: 9 }}>{block.title}</div> : null}
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', counterReset: 'step' }}>
            {block.steps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 11 }}>
                <span style={{
                  flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--accent-dim)', color: 'var(--accent-bright)',
                  display: 'grid', placeItems: 'center', fontSize: '0.76rem', fontWeight: 700,
                }}>{i + 1}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{step.title}</div>
                  <div className="small muted">{step.text}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )

    case 'worked-example':
      return (
        <div style={{
          margin: '0 0 12px', padding: 14, background: 'var(--bg)',
          border: '1px solid var(--border-bright)', borderRadius: 'var(--radius-sm)',
        }}>
          <div className="stat-label" style={{ marginBottom: 7 }}>Worked example</div>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>{block.question}</div>
          <ol style={{ margin: '0 0 10px', paddingLeft: 20 }}>
            {block.steps.map((s, i) => <li key={i} style={{ marginBottom: 5 }} className="small">{s}</li>)}
          </ol>
          <div style={{
            padding: '8px 12px', background: 'var(--green-dim)', borderRadius: 7,
            color: 'var(--green)', fontWeight: 650, fontSize: '0.88rem',
          }}>
            {block.answer}
          </div>
        </div>
      )

    case 'diagram':
      return (
        <figure style={{ margin: '0 0 12px', textAlign: 'center' }}>
          <div
            style={{ overflowX: 'auto' }}
            // Diagram SVG is authored in this repo and compiled by the build tool,
            // never user input or fetched from elsewhere.
            dangerouslySetInnerHTML={{ __html: block.svg }}
          />
          {block.caption ? <figcaption className="tiny dim" style={{ marginTop: 6 }}>{block.caption}</figcaption> : null}
        </figure>
      )
  }
}

export const Blocks = ({ blocks }: { blocks: ContentBlock[] }) => (
  <>{blocks.map((b, i) => <Block key={i} block={b} />)}</>
)

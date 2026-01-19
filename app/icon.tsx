import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
          borderRadius: '6px',
        }}
      >
        {/* Calendar icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Calendar body */}
          <rect x="3" y="4" width="18" height="18" rx="2" />
          {/* Top hangers */}
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
          {/* Horizontal line */}
          <line x1="3" y1="10" x2="21" y2="10" />
          {/* Checkmark */}
          <path d="M9 16l2 2 4-4" stroke="#22c55e" strokeWidth="2" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

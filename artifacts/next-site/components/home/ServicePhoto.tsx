'use client'

import { useState } from 'react'

const stripes =
  'repeating-linear-gradient(135deg, #1b1b1b 0px, #1b1b1b 14px, #202020 14px, #202020 28px)'

export default function ServicePhoto({ src, position = 'center' }: { src: string | null; position?: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className="relative h-[180px] w-full overflow-hidden border-b border-[#262626]"
      style={{ backgroundColor: '#1b1b1b', backgroundImage: stripes }}
    >
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ objectPosition: position }}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
      )}
    </div>
  )
}

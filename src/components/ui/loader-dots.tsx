import React from 'react'

export function LoaderDots () {
    return (
        <span className='inline-flex gap-1'>
      <span className='animate-bounce' style={{ animationDelay: '0ms' }}>.</span>
      <span className='animate-bounce' style={{ animationDelay: '150ms' }}>.</span>
      <span className='animate-bounce' style={{ animationDelay: '300ms' }}>.</span>
    </span>
    )
}
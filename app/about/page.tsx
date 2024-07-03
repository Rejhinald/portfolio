import React from 'react'
import { LayoutGridDemo } from '@/components/layout-grid'
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function page() {
  return (
    <div className="h-screen w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <LayoutGridDemo />
    </div>
  )
}

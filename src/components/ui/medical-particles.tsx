"use client"

import { Particles } from "@/components/ui/particles"

export function MedicalParticles() {
  return (
    <Particles
      className="absolute inset-0 z-0"
      quantity={50}
      staticity={40}
      ease={90}
      color="#black" 
      size={0.6}
      vx={0.1}
      vy={0.1}
    />
  )
}

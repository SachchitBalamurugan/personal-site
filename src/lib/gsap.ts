import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** cubic-bezier(.16,1,.3,1) is easeOutExpo: the long, soft settle used for entrances. */
export const EASE_HOP = 'expo.out'

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export { gsap, ScrollTrigger, useGSAP }

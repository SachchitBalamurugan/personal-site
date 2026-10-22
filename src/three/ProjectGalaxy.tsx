import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { categoryMeta, type Project } from '../data/projects'

interface Orbit {
  project: Project
  radius: number
  speed: number
  phase: number
  tilt: number
  size: number
}

function useOrbits(projects: Project[]): Orbit[] {
  return useMemo(() => {
    // heavier projects sit on inner orbits so the important work is easiest to find
    const sorted = [...projects].sort((a, b) => b.weight - a.weight)
    return sorted.map((project, i) => {
      const radius = 3.2 + i * 0.62
      return {
        project,
        radius,
        speed: 0.9 / Math.pow(radius, 1.1),
        phase: i * 2.399, // golden angle keeps neighbours apart
        tilt: ((i % 5) - 2) * 0.04,
        size: 0.18 + project.weight * 0.11,
      }
    })
  }, [projects])
}

function Planet({ orbit, paused, onSelect }: { orbit: Orbit; paused: boolean; onSelect: (p: Project) => void }) {
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const angle = useRef(orbit.phase)
  const [hovered, setHovered] = useState(false)
  const color = categoryMeta[orbit.project.category].color

  useFrame((_, delta) => {
    if (!paused) angle.current += delta * orbit.speed
    group.current?.position.set(Math.cos(angle.current) * orbit.radius, Math.sin(angle.current) * orbit.radius * orbit.tilt, Math.sin(angle.current) * orbit.radius)
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.6
      const target = hovered ? 1.45 : 1
      mesh.current.scale.setScalar(THREE.MathUtils.damp(mesh.current.scale.x, target, 8, delta))
    }
  })

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(orbit.project)
        }}
      >
        <icosahedronGeometry args={[orbit.size, 3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.6 : 0.7} roughness={0.35} metalness={0.2} flatShading />
      </mesh>
      {orbit.project.weight === 3 && (
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[orbit.size * 1.5, orbit.size * 1.75, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Html center zIndexRange={[5, 0]} distanceFactor={14} position={[0, orbit.size + 0.35, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`planet-label ${hovered ? 'is-hovered' : ''}`}>{orbit.project.name}</div>
      </Html>
    </group>
  )
}

function OrbitRing({ radius, tilt }: { radius: number; tilt: number }) {
  const geometry = useMemo(() => {
    const pts = Array.from({ length: 129 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2
      return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * tilt, Math.sin(a) * radius)
    })
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius, tilt])
  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.06} />
    </lineLoop>
  )
}

function Star() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 2) * 0.04)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.1, 48, 48]} />
      <meshBasicMaterial color="#ffd18a" toneMapped={false} />
      <pointLight intensity={60} distance={40} color="#ffe2b0" />
    </mesh>
  )
}

export default function ProjectGalaxy({ projects, onSelect }: { projects: Project[]; onSelect: (p: Project) => void }) {
  const orbits = useOrbits(projects)
  const [paused, setPaused] = useState(false)

  return (
    <Canvas camera={{ position: [0, 10, 20], fov: 45 }} dpr={[1, 2]} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <ambientLight intensity={0.25} />
      <Star />
      {orbits.map((o) => (
        <OrbitRing key={`r-${o.project.id}`} radius={o.radius} tilt={o.tilt} />
      ))}
      {orbits.map((o) => (
        <Planet key={o.project.id} orbit={o} paused={paused} onSelect={onSelect} />
      ))}
      <Sparkles count={260} scale={[30, 10, 30]} size={2} speed={0.2} color="#9fb7ff" opacity={0.6} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate={!paused} autoRotateSpeed={0.35} minPolarAngle={0.5} maxPolarAngle={1.35} />
      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const COUNT = 9000

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  attribute vec3 aGalaxy;
  attribute float aSize;
  attribute float aMix;
  varying float vMix;
  varying float vAlpha;

  void main() {
    // ease the morph so the helix holds briefly before unwinding
    float m = smoothstep(0.0, 1.0, uMorph);
    vec3 helix = position;
    // the helix spins around its own axis
    float a = uTime * 0.25;
    helix.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * helix.xz;

    vec3 galaxy = aGalaxy;
    float g = uTime * 0.05 + length(galaxy.xz) * 0.02;
    galaxy.xz = mat2(cos(g), -sin(g), sin(g), cos(g)) * galaxy.xz;

    // each particle travels on a slight arc so the unwind feels like a swirl
    vec3 p = mix(helix, galaxy, m);
    p.y += sin(m * 3.14159) * (aMix - 0.5) * 3.0;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;

    // push particles away from the cursor in screen space
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uMouse;
    float push = smoothstep(0.25, 0.0, length(d));
    clip.xy += normalize(d + 1e-4) * push * 0.08 * clip.w;

    gl_Position = clip;
    gl_PointSize = aSize * uPixelRatio * (28.0 / -mv.z);
    vMix = aMix;
    vAlpha = 0.55 + 0.45 * sin(uTime * 1.5 + aMix * 40.0);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uMorph;
  varying float vMix;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    glow = pow(glow, 2.2);
    vec3 col = mix(uColorA, uColorB, vMix);
    col = mix(col, uColorC, smoothstep(0.85, 1.0, vMix) * uMorph);
    gl_FragColor = vec4(col, glow * vAlpha);
  }
`

function buildAttributes() {
  const helix = new Float32Array(COUNT * 3)
  const galaxy = new Float32Array(COUNT * 3)
  const size = new Float32Array(COUNT)
  const mix = new Float32Array(COUNT)

  const turns = 4.5
  const height = 16
  const radius = 2.4
  const arms = 4

  for (let i = 0; i < COUNT; i++) {
    const t = Math.random()
    const angle = t * Math.PI * 2 * turns
    const kind = Math.random()

    let x: number, y: number, z: number
    if (kind < 0.8) {
      // two backbones, offset by PI
      const strand = kind < 0.4 ? 0 : Math.PI
      const jitter = 0.18
      x = Math.cos(angle + strand) * radius + (Math.random() - 0.5) * jitter
      z = Math.sin(angle + strand) * radius + (Math.random() - 0.5) * jitter
      y = (t - 0.5) * height
    } else {
      // base-pair rungs: points on the chord between the strands, at discrete steps
      const step = Math.round(t * turns * 10) / (turns * 10)
      const a = step * Math.PI * 2 * turns
      const u = Math.random() * 2 - 1
      x = Math.cos(a) * radius * u
      z = Math.sin(a) * radius * u
      y = (step - 0.5) * height
    }
    helix.set([x, y, z], i * 3)

    // spiral galaxy with a dense core
    const r = Math.pow(Math.random(), 1.6) * 14
    const arm = (i % arms) / arms * Math.PI * 2
    const spin = r * 0.45
    const spread = 0.4 + r * 0.06
    galaxy.set(
      [
        Math.cos(arm + spin) * r + (Math.random() - 0.5) * spread * 2,
        (Math.random() - 0.5) * (1.2 - r / 14) * 1.2,
        Math.sin(arm + spin) * r + (Math.random() - 0.5) * spread * 2,
      ],
      i * 3,
    )

    size[i] = kind >= 0.8 ? 0.6 + Math.random() * 0.6 : 0.8 + Math.random() * 1.4
    mix[i] = Math.random()
  }
  return { helix, galaxy, size, mix }
}

function Particles({ progress }: { progress: React.RefObject<number> }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const points = useRef<THREE.Points>(null)
  const { gl } = useThree()
  const mouse = useRef(new THREE.Vector2(10, 10))

  const geometry = useMemo(() => {
    const { helix, galaxy, size, mix } = buildAttributes()
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(helix, 3))
    g.setAttribute('aGalaxy', new THREE.BufferAttribute(galaxy, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aMix', new THREE.BufferAttribute(mix, 1))
    return g
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector2(10, 10) },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uColorA: { value: new THREE.Color('#3ef0c8') },
      uColorB: { value: new THREE.Color('#8b5cf6') },
      uColorC: { value: new THREE.Color('#ffb547') },
    }),
    [gl],
  )

  useFrame((state, delta) => {
    if (!material.current || !points.current) return
    const u = material.current.uniforms
    u.uTime.value += delta
    u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, progress.current ?? 0, 3, delta)
    mouse.current.lerp(state.pointer, 0.15)
    u.uMouse.value.copy(mouse.current)

    // the helix stands upright beside the hero text; the galaxy tilts toward the viewer
    const m = u.uMorph.value
    points.current.rotation.x = THREE.MathUtils.lerp(0, 0.55, m)
    points.current.rotation.z = THREE.MathUtils.lerp(-0.35, 0, m)
    // on phones the helix hugs the right edge so it doesn't sit under the hero text
    const vw = state.viewport.width
    points.current.position.x = THREE.MathUtils.lerp(vw > 14 ? 4.5 : vw * 0.5, 0, m)
    state.camera.position.z = THREE.MathUtils.lerp(16, 20, m)
  })

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function HelixGalaxy({ progress }: { progress: React.RefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 16], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      eventSource={document.body}
      eventPrefix="client"
    >
      <Particles progress={progress} />
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.05} luminanceSmoothing={0.4} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}

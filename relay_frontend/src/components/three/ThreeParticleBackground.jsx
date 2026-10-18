import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeParticleBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 28
    camera.position.y = 8
    camera.rotation.x = -0.2

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Particle Grid (Sine Wave Mesh)
    const SEPARATION = 1.6
    const AMOUNTX = 45
    const AMOUNTY = 30
    const numParticles = AMOUNTX * AMOUNTY

    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)
    const colors = new Float32Array(numParticles * 3)

    const c1 = new THREE.Color(0x6366f1) // indigo
    const c2 = new THREE.Color(0xa855f7) // purple
    const c3 = new THREE.Color(0x38bdf8) // sky

    let i = 0, j = 0
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2
        positions[i + 1] = 0 // will wave in loop
        positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2

        scales[j] = 1

        const mixRatio = ix / AMOUNTX
        const particleCol = c1.clone().lerp(c2, mixRatio).lerp(c3, Math.sin(iy * 0.2) * 0.5 + 0.5)
        colors[i] = particleCol.r
        colors[i + 1] = particleCol.g
        colors[i + 2] = particleCol.b

        i += 3
        j++
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Circular particle texture created programmatically
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.3, 'rgba(230,240,255,0.7)')
    gradient.addColorStop(0.7, 'rgba(99,102,241,0.2)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const particleTexture = new THREE.CanvasTexture(canvas)

    const material = new THREE.PointsMaterial({
      size: 0.85,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Mouse listener
    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.015
      mouseY = (e.clientY - window.innerHeight / 2) * 0.015
    }
    window.addEventListener('mousemove', onMouseMove)

    // Animation
    let count = 0
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)

      const posArray = particles.geometry.attributes.position.array
      let pIdx = 0
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          posArray[pIdx + 1] =
            Math.sin((ix + count) * 0.3) * 2.5 +
            Math.sin((iy + count) * 0.4) * 2.5 +
            Math.cos((ix + iy + count) * 0.2) * 1.5
          pIdx += 3
        }
      }
      particles.geometry.attributes.position.needsUpdate = true

      particles.rotation.y = mouseX * 0.05
      particles.rotation.x = -0.15 + mouseY * 0.05

      count += 0.04
      renderer.render(scene, camera)
    }

    animate()

    // Resize
    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      particleTexture.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden opacity-60 z-0"
    />
  )
}

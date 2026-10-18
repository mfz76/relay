import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Sparkles, Maximize2, RotateCcw, Cpu, Zap, Activity } from 'lucide-react'

export default function ThreeAutomationHero({ activeIntegrationsCount = 5, totalExecutions = 0 }) {
  const mountRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(1)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 220

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 2.5, 9)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x6366f1, 3, 20)
    pointLight1.position.set(4, 5, 4)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xa855f7, 3, 20)
    pointLight2.position.set(-4, -2, -3)
    scene.add(pointLight2)

    const pointLight3 = new THREE.PointLight(0x10b981, 2, 15)
    pointLight3.position.set(0, -4, 2)
    scene.add(pointLight3)

    // 3. Central AI Brain / Core (Gemini Nexus)
    const coreGroup = new THREE.Group()
    scene.add(coreGroup)

    // Inner glowing icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.1, 1)
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5,
      emissive: 0x312e81,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    coreGroup.add(coreMesh)

    // Wireframe cage over core
    const wireGeo = new THREE.IcosahedronGeometry(1.28, 2)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    coreGroup.add(wireMesh)

    // Orbiting rings (Quantum conduits)
    const ringGeo1 = new THREE.TorusGeometry(1.9, 0.025, 16, 100)
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.75,
    })
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    ring1.rotation.x = Math.PI / 3
    coreGroup.add(ring1)

    const ringGeo2 = new THREE.TorusGeometry(2.3, 0.02, 16, 100)
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
    })
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.y = Math.PI / 4
    ring2.rotation.x = -Math.PI / 6
    coreGroup.add(ring2)

    // 4. Satellite Integration Nodes (Slack, Gmail, Sheets, Calendar)
    const nodeConfigs = [
      { name: 'Slack', color: 0x10b981, angle: 0, dist: 3.4, size: 0.35 },
      { name: 'Gmail', color: 0xf43f5e, angle: Math.PI / 2, dist: 3.2, size: 0.35 },
      { name: 'Sheets', color: 0x10b981, angle: Math.PI, dist: 3.5, size: 0.35 },
      { name: 'Calendar', color: 0x38bdf8, angle: (3 * Math.PI) / 2, dist: 3.1, size: 0.35 },
    ]

    const satelliteMeshes = []
    const connectionLines = []

    nodeConfigs.forEach((cfg) => {
      const satGroup = new THREE.Group()

      const satGeo = new THREE.DodecahedronGeometry(cfg.size, 0)
      const satMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.6,
      })
      const satMesh = new THREE.Mesh(satGeo, satMat)
      satGroup.add(satMesh)

      // Orbiting micro ring
      const microRingGeo = new THREE.TorusGeometry(cfg.size * 1.5, 0.015, 8, 32)
      const microRingMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.5,
      })
      const microRing = new THREE.Mesh(microRingGeo, microRingMat)
      satGroup.add(microRing)

      coreGroup.add(satGroup)
      satelliteMeshes.push({ group: satGroup, config: cfg, mesh: satMesh, ring: microRing })

      // Dynamic connection line to core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(cfg.angle) * cfg.dist, Math.sin(cfg.angle) * 0.4, Math.sin(cfg.angle) * cfg.dist),
      ])
      const lineMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.4,
      })
      const line = new THREE.Line(lineGeo, lineMat)
      coreGroup.add(line)
      connectionLines.push({ line, cfg })
    })

    // 5. Star / Data-Packet Particle Cloud
    const particleCount = 450
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    const colorPalette = [
      new THREE.Color(0x6366f1),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x10b981),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xf43f5e),
    ]

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 16
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 8
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 12

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      particleColors[i * 3] = col.r
      particleColors[i * 3 + 1] = col.g
      particleColors[i * 3 + 2] = col.b
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    })
    const particleSystem = new THREE.Points(particleGeo, particleMat)
    scene.add(particleSystem)

    // 6. Mouse Interaction & Parallax
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2

      targetRotationY = mouseX * 0.6
      targetRotationX = -mouseY * 0.4
    }

    container.addEventListener('mousemove', handleMouseMove)

    // 7. Animation Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()
      const delta = clock.getDelta()

      // Core rotation
      coreMesh.rotation.y += 0.012 * rotationSpeed
      coreMesh.rotation.x += 0.007 * rotationSpeed
      wireMesh.rotation.y -= 0.015 * rotationSpeed
      wireMesh.rotation.z += 0.005 * rotationSpeed

      ring1.rotation.z += 0.018 * rotationSpeed
      ring2.rotation.z -= 0.014 * rotationSpeed

      // Satellite orbiting motion
      satelliteMeshes.forEach(({ group, config, ring }, idx) => {
        const currentAngle = config.angle + elapsedTime * 0.5 * (idx % 2 === 0 ? 1 : -0.8)
        const x = Math.cos(currentAngle) * config.dist
        const z = Math.sin(currentAngle) * (config.dist * 0.85)
        const y = Math.sin(elapsedTime * 1.5 + idx) * 0.5

        group.position.set(x, y, z)
        ring.rotation.x += 0.03
        ring.rotation.y += 0.02

        // Update line geometry to track moving satellite
        if (connectionLines[idx]) {
          const positions = connectionLines[idx].line.geometry.attributes.position.array
          positions[3] = x
          positions[4] = y
          positions[5] = z
          connectionLines[idx].line.geometry.attributes.position.needsUpdate = true
        }
      })

      // Particle subtle drifting
      particleSystem.rotation.y = elapsedTime * 0.02

      // Smooth camera interpolation towards mouse
      coreGroup.rotation.y += (targetRotationY - coreGroup.rotation.y) * 0.05
      coreGroup.rotation.x += (targetRotationX - coreGroup.rotation.x) * 0.05

      renderer.render(scene, camera)
    }

    animate()

    // 8. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight || 220
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }

      // Dispose geometries & materials
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
      renderer.dispose()
    }
  }, [rotationSpeed])

  return (
    <div 
      className="relative w-full h-[230px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B0F19] via-[#111827] to-[#0F172A] border border-slate-800 shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Futuristic Gradient Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-black/60 pointer-events-none" />

      {/* Top Left Badge & Title */}
      <div className="absolute top-4 left-5 pointer-events-none z-10 space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            3D Neural Execution Plane
          </span>
          <span className="text-[10px] font-mono text-slate-400 backdrop-blur-xs px-2 py-0.5 rounded bg-slate-900/50 border border-slate-700/50">
            WebGL / Three.js
          </span>
        </div>

        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
          Autonomous Relay Matrix
        </h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Interactive real-time visualization of Gemini AI classification & multi-channel automated dispatch.
        </p>
      </div>

      {/* Top Right Controls & Metrics */}
      <div className="absolute top-4 right-5 z-10 flex items-center gap-2">
        <button
          onClick={() => setRotationSpeed((prev) => (prev === 1 ? 2.5 : prev === 2.5 ? 0.2 : 1))}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
          title="Toggle rotation speed"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{rotationSpeed === 1 ? '1x Speed' : rotationSpeed === 2.5 ? 'Fast' : 'Slow'}</span>
        </button>
      </div>

      {/* Bottom Floating Telemetry Pills */}
      <div className="absolute bottom-3 left-5 right-5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] text-slate-400 font-medium">Core:</span>
            <span className="text-[11px] font-bold text-white">Gemini 3.5 AI</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs text-slate-300">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400 font-medium">Active Channels:</span>
            <span className="text-[11px] font-bold text-emerald-400">{activeIntegrationsCount} Live</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
          <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span>Interactive 3D: Move cursor over canvas to rotate</span>
        </div>
      </div>
    </div>
  )
}

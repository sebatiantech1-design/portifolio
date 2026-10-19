import { useEffect, useRef } from 'react'
import {
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Scene,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'

function ThreeBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const root = document.documentElement
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = motionPreference.matches
    let frameId = 0
    let avoidanceFrameId = 0
    let width = window.innerWidth
    let height = window.innerHeight
    let basePosition = { x: 0, y: 0 }
    const targetPosition = { x: 0, y: 0 }

    let renderer
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch (error) {
      console.error('Unable to initialize the 3D background.', error)
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new Scene()
    const camera = new PerspectiveCamera(42, width / height, 0.1, 100)
    camera.position.z = 7

    const composition = new Group()
    scene.add(composition)

    const coreMaterial = new MeshBasicMaterial({
      color: 0xd94f3d,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    })
    const core = new Mesh(new IcosahedronGeometry(0.92, 1), coreMaterial)
    composition.add(core)

    const orbitMaterial = new MeshBasicMaterial({
      color: 0xd94f3d,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    })
    const orbitGeometry = new TorusGeometry(1.42, 0.008, 6, 96)
    for (const index of [0, 1, 2]) {
      const orbit = new Mesh(orbitGeometry, orbitMaterial)
      orbit.rotation.set(0.72 + index * 0.44, index * 0.7, index * 0.88)
      orbit.scale.set(1, 0.78 + index * 0.12, 1)
      composition.add(orbit)
    }

    const nodeGeometry = new OctahedronGeometry(0.055, 0)
    const nodeMaterial = new MeshBasicMaterial({
      color: 0xd94f3d,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    })
    const nodes = Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2
      const node = new Mesh(nodeGeometry, nodeMaterial)
      node.position.set(Math.cos(angle) * 1.42, Math.sin(angle) * 0.98, Math.sin(angle * 2) * 0.36)
      composition.add(node)
      return node
    })

    const updateTheme = () => {
      const styles = window.getComputedStyle(root)
      const accent = styles.getPropertyValue('--accent').trim()
      if (/^#([\da-f]{3}|[\da-f]{6})$/i.test(accent)) {
        const color = new Color(accent)
        coreMaterial.color.copy(color)
        orbitMaterial.color.copy(color)
        nodeMaterial.color.copy(color)
      }
      const darkTheme = root.dataset.theme === 'dark'
      coreMaterial.opacity = darkTheme ? 0.3 : 0.18
      orbitMaterial.opacity = darkTheme ? 0.24 : 0.14
      nodeMaterial.opacity = darkTheme ? 0.38 : 0.24
      if (reducedMotion) renderer.render(scene, camera)
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      camera.aspect = width / height
      camera.position.z = width < 600 ? 7.5 : 7
      camera.updateProjectionMatrix()
      basePosition = { x: width < 600 ? 0.45 : 2.05, y: 0.15 }
      composition.position.set(basePosition.x, basePosition.y, -0.8)
      composition.scale.setScalar(width < 600 ? 1.35 : 1.8)
      renderer.setSize(width, height)
      updateAvoidance()
      if (reducedMotion) renderer.render(scene, camera)
    }

    const updateAvoidance = () => {
      if (reducedMotion) return

      const projected = new Vector3(basePosition.x, basePosition.y, composition.position.z).project(camera)
      let centerX = ((projected.x + 1) * width) / 2
      let centerY = ((1 - projected.y) * height) / 2
      const radius = Math.min(height * 0.32, width < 600 ? 205 : 225)
      const cards = [...document.querySelectorAll('.portrait-card, .project-card, .contact-section')]
        .map((element) => element.getBoundingClientRect())
        .filter((rect) => rect.width && rect.height && rect.bottom > 0 && rect.top < height)

      cards.forEach((rect) => {
        const closestX = Math.max(rect.left, Math.min(centerX, rect.right))
        const closestY = Math.max(rect.top, Math.min(centerY, rect.bottom))
        let awayX = centerX - closestX
        let awayY = centerY - closestY
        let distance = Math.hypot(awayX, awayY)

        if (distance >= radius) return
        if (distance < 1) {
          awayX = centerX - (rect.left + rect.right) / 2
          awayY = centerY - (rect.top + rect.bottom) / 2
          if (Math.hypot(awayX, awayY) < 1) awayX = centerX < width / 2 ? -1 : 1
          distance = Math.hypot(awayX, awayY)
        }

        const displacement = radius - distance + 28
        centerX += (awayX / distance) * displacement
        centerY += (awayY / distance) * displacement
      })

      centerX = Math.max(width * 0.06, Math.min(centerX, width * 0.94))
      centerY = Math.max(height * 0.08, Math.min(centerY, height * 0.92))
      const worldPerPixel = (
        (camera.position.z - composition.position.z)
        * Math.tan((camera.fov * Math.PI) / 360)
        * 2
      ) / height
      targetPosition.x = basePosition.x + (centerX - ((projected.x + 1) * width) / 2) * worldPerPixel
      targetPosition.y = basePosition.y - (centerY - ((1 - projected.y) * height) / 2) * worldPerPixel
    }

    const scheduleAvoidance = () => {
      if (reducedMotion || avoidanceFrameId) return
      avoidanceFrameId = window.requestAnimationFrame(() => {
        avoidanceFrameId = 0
        updateAvoidance()
      })
    }

    let previousTime = 0
    const animate = (time) => {
      if (document.hidden) return
      if (!reducedMotion) {
        const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0
        previousTime = time
        composition.position.x += (targetPosition.x - composition.position.x) * 0.045
        composition.position.y += (targetPosition.y - composition.position.y) * 0.045
        composition.rotation.y += delta * 0.12
        composition.rotation.x += delta * 0.035
        core.rotation.y += delta * 0.16
        nodes.forEach((node, index) => {
          node.rotation.x += delta * (0.12 + index * 0.008)
        })
      }
      renderer.render(scene, camera)
      if (!reducedMotion) frameId = window.requestAnimationFrame(animate)
    }

    const startAnimation = () => {
      window.cancelAnimationFrame(frameId)
      previousTime = 0
      frameId = window.requestAnimationFrame(animate)
    }

    const handleMotionPreferenceChange = (event) => {
      reducedMotion = event.matches
      startAnimation()
    }
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId)
      } else {
        startAnimation()
        scheduleAvoidance()
      }
    }

    updateTheme()
    resize()
    const themeObserver = new MutationObserver(updateTheme)
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme', 'style'] })
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', scheduleAvoidance, { passive: true })
    motionPreference.addEventListener('change', handleMotionPreferenceChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    startAnimation()

    return () => {
      window.cancelAnimationFrame(frameId)
      window.cancelAnimationFrame(avoidanceFrameId)
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', scheduleAvoidance)
      motionPreference.removeEventListener('change', handleMotionPreferenceChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      scene.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose()
      })
      coreMaterial.dispose()
      orbitMaterial.dispose()
      nodeMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={containerRef} className="three-background" aria-hidden="true" />
}

export default ThreeBackground

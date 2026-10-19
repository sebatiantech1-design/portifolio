import { useEffect, useRef } from 'react'

function StarfieldBackground({ density }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const root = document.documentElement
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let pixelRatio = 1
    let frameId = 0
    let stars = []
    let starColor = [49, 87, 213]
    let targetStarColor = [49, 87, 213]
    let reducedMotion = motionPreference.matches
    let hasPointer = false
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }

    const refreshColors = () => {
      const styles = window.getComputedStyle(root)
      const accent = styles.getPropertyValue('--accent').trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)
      if (accent) {
        const hex = accent[1].length === 3
          ? accent[1].split('').map((digit) => digit + digit).join('')
          : accent[1]
        const isDark = root.dataset.theme === 'dark'
        const lift = isDark ? 0.72 : 0
        targetStarColor = hex.match(/.{2}/g)
          .map((channel) => Number.parseInt(channel, 16))
          .map((channel) => Math.round(channel + (255 - channel) * lift))
      }
      if (reducedMotion && width && height) draw(performance.now())
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      const baseStarCount = Math.min(180, Math.max(70, Math.floor((width * height) / 10500)))
      const starCount = baseStarCount * density
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        depth: 0.18 + Math.random() * 0.82,
        radius: 0.45 + Math.random() * 1.15,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00035 + Math.random() * 0.0009,
      }))
    }

    const draw = (time) => {
      context.clearRect(0, 0, width, height)

      if (!reducedMotion) {
        pointer.x += (pointer.targetX - pointer.x) * 0.14
        pointer.y += (pointer.targetY - pointer.y) * 0.14
      }

      if (!reducedMotion) {
        starColor = starColor.map((channel, index) => (
          channel + (targetStarColor[index] - channel) * 0.08
        ))
      } else {
        starColor = [...targetStarColor]
      }

      const color = starColor.map(Math.round).join(', ')
      stars.forEach((star) => {
        const shimmer = reducedMotion ? 0.32 : 0.08 + (Math.sin(time * star.speed + star.phase) + 1) * 0.22
        const dx = star.x - pointer.x
        const dy = star.y - pointer.y
        const distance = Math.hypot(dx, dy)
        const proximity = hasPointer && !reducedMotion
          ? Math.max(0, 1 - distance / 145)
          : 0
        const displacement = proximity * proximity * (14 + star.depth * 20)
        const x = star.x + (distance ? dx / distance : 0) * displacement
        const y = star.y + (distance ? dy / distance : 0) * displacement
        const radius = star.radius * (0.65 + star.depth * 0.55)

        context.beginPath()
        context.fillStyle = `rgba(${color}, ${shimmer})`
        context.shadowBlur = 2 + star.depth * 4
        context.shadowColor = `rgba(${color}, ${shimmer * 0.6})`
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fill()

        if (star.depth > 0.8 && shimmer > 0.42) {
          context.globalAlpha = shimmer * 0.65
          context.fillRect(x - 0.45, y - radius * 3, 0.9, radius * 6)
          context.fillRect(x - radius * 3, y - 0.45, radius * 6, 0.9)
          context.globalAlpha = 1
        }
      })

      context.shadowBlur = 0
      if (!reducedMotion && !document.hidden) {
        frameId = window.requestAnimationFrame(draw)
      }
    }

    const handlePointerMove = (event) => {
      if (reducedMotion || event.pointerType === 'touch') return
      hasPointer = true
      pointer.targetX = event.clientX
      pointer.targetY = event.clientY
    }

    const handlePointerLeave = () => {
      hasPointer = false
    }

    const handleVisibilityChange = () => {
      window.cancelAnimationFrame(frameId)
      if (document.hidden) return
      if (reducedMotion) {
        draw(performance.now())
      } else {
        frameId = window.requestAnimationFrame(draw)
      }
    }

    const handleMotionPreferenceChange = (event) => {
      reducedMotion = event.matches
      window.cancelAnimationFrame(frameId)
      if (reducedMotion) {
        draw(performance.now())
      } else if (!document.hidden) {
        frameId = window.requestAnimationFrame(draw)
      }
    }

    refreshColors()
    resize()
    const themeObserver = new MutationObserver(refreshColors)
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme', 'style'] })
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    motionPreference.addEventListener('change', handleMotionPreferenceChange)
    frameId = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(frameId)
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionPreference.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [density])

  return <canvas ref={canvasRef} className="starfield-background" aria-hidden="true" />
}

export default StarfieldBackground

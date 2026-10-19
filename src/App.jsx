import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import navigationIcon from './assets/Icon2.png'
import portraitImage from './assets/My pic2.png'
import learningImageOne from './assets/Learning1.png'
import learningImageTwo from './assets/Learning2.png'
import storeImageOne from './assets/Store1.png'
import storeImageTwo from './assets/Store2.png'
import threeDSiteImageOne from './assets/3D1.png'
import threeDSiteImageTwo from './assets/3D2.png'
import StarfieldBackground from './StarfieldBackground.jsx'
import './App.css'

const ThreeBackground = lazy(() => import('./ThreeBackground.jsx'))

const featureSlides = [
  {
    src: portraitImage,
    alt: 'Sebastian',
    heading: 'THE PERSON BEHIND THE PIXELS',
    caption: ['SebastianTech Designs future of tech.'],
    stamp: <>NICE<br />TO MEET<br />YOU</>,
  },
  {
    src: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1000&q=85',
    alt: 'Colorful lines of code on a computer screen',
    heading: 'A FEW LINES AT A TIME',
    caption: ['Write. Learn.', 'Try again.'],
    stamp: <>KEEP<br />GOING</>,
  },
  {
    src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85',
    alt: 'A laptop open to a web development workspace',
    heading: 'IDEAS TAKE SHAPE',
    caption: ['From a blank page', 'to something useful.'],
    stamp: <>MAKE<br />IT REAL</>,
  },
  {
    src: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1000&q=85',
    alt: 'Colorful website and interface design inspiration',
    heading: 'DESIGN FOR PEOPLE',
    caption: ['Clear, thoughtful', 'digital experiences.'],
    stamp: <>STAY<br />CURIOUS</>,
  },
  {
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85',
    alt: 'A team sharing ideas and encouraging one another',
    heading: 'BETTER, TOGETHER',
    caption: ['Share what you know.', 'Lift each other up.'],
    stamp: <>YOU<br />GOT THIS</>,
  },
]

const projects = [
  {
    number: '01',
    title: 'Learning Platform',
    url: 'https://sebastiantech-school.onrender.com',
    description: 'A welcoming place to explore lessons, track progress, and learn at your own pace.',
    tags: ['Learning', 'Responsive'],
    visual: 'learning',
    images: [
      { src: learningImageOne, alt: 'Learning platform home page screenshot' },
      { src: learningImageTwo, alt: 'Learning platform dashboard screenshot' },
    ],
  },
  {
    number: '02',
    title: 'Online Store',
    url: 'https://sebastiantech-store.onrender.com',
    description: 'A clear, easy-to-use storefront for discovering products and shopping online.',
    tags: ['E-commerce', 'UI design'],
    visual: 'store',
    images: [
      { src: storeImageOne, alt: 'Online store home page screenshot' },
      { src: storeImageTwo, alt: 'Online store product listings screenshot' },
    ],
  },
  {
    number: '03',
    title: '3D Site',
    url: 'https://aboutsebastiantech.onrender.com',
    description: 'An immersive web experience that brings depth and interactive 3D visuals to the page.',
    tags: ['3D', 'Interactive'],
    visual: 'three-d',
    images: [
      { src: threeDSiteImageOne, alt: '3D site home page screenshot' },
      { src: threeDSiteImageTwo, alt: '3D site skills page screenshot' },
    ],
  },
]

const colorOptions = {
  blue: { accent: '#3157d5', soft: 'rgba(49, 87, 213, 0.1)', border: 'rgba(49, 87, 213, 0.42)' },
  coral: { accent: '#d94f3d', soft: 'rgba(217, 79, 61, 0.1)', border: 'rgba(217, 79, 61, 0.42)' },
  green: { accent: '#287c5c', soft: 'rgba(40, 124, 92, 0.1)', border: 'rgba(40, 124, 92, 0.42)' },
  violet: { accent: '#7650bd', soft: 'rgba(118, 80, 189, 0.1)', border: 'rgba(118, 80, 189, 0.42)' },
}

function ThemeIcon({ theme }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {theme === 'dark' ? (
        <path d="M20.2 15.4A8.2 8.2 0 0 1 8.6 3.8 8.2 8.2 0 1 0 20.2 15.4Z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </>
      )}
    </svg>
  )
}

function ProjectPreview({ project }) {
  const [loadedImages, setLoadedImages] = useState({})
  const [activeIndex, setActiveIndex] = useState(0)
  const [inView, setInView] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const galleryRef = useRef(null)
  const imagesReady = project.images.every(({ src }) => loadedImages[src])

  useEffect(() => {
    const gallery = galleryRef.current
    if (!gallery) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    )
    observer.observe(gallery)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const gallery = galleryRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!imagesReady || !inView || isPaused || reduceMotion || project.images.length < 2) return undefined

    const timer = window.setTimeout(() => {
      const nextIndex = (activeIndex + 1) % project.images.length
      gallery?.scrollTo({
        left: nextIndex * gallery.clientWidth,
        behavior: 'smooth',
      })
      setActiveIndex(nextIndex)
    }, 7000)

    return () => window.clearTimeout(timer)
  }, [activeIndex, imagesReady, inView, isPaused, project.images.length])

  const updateActiveImage = (event) => {
    const gallery = event.currentTarget
    if (gallery.clientWidth === 0) return
    setActiveIndex(Math.round(gallery.scrollLeft / gallery.clientWidth) % project.images.length)
  }

  return (
    <div className={`project-visual visual-${project.visual}${imagesReady ? ' has-project-images' : ''}`}>
      <div className={`visual-art art-${project.visual}`} aria-hidden="true">
        {project.visual === 'learning' && (
          <div className="learning-window">
            <div className="learning-top"><span /> LEARN / 01</div>
            <strong>Design fundamentals</strong>
            <span className="learning-subtitle">Your next lesson is ready</span>
            <div className="learning-progress"><i /></div>
            <span className="learning-progress-label">3 of 8 lessons complete</span>
          </div>
        )}
        {project.visual === 'store' && (
          <div className="store-window">
            <div className="store-top"><strong>studio goods</strong><span>SHOP&nbsp; BAG (0)</span></div>
            <div className="store-products">
              <div className="store-product"><span className="product-object product-object-one" /><small>Everyday tote</small><b>$28</b></div>
              <div className="store-product"><span className="product-object product-object-two" /><small>Soft form mug</small><b>$18</b></div>
            </div>
          </div>
        )}
        {project.visual === 'three-d' && (
          <div className="three-d-art">
            <span className="three-d-orbit three-d-orbit-one" />
            <span className="three-d-orbit three-d-orbit-two" />
            <span className="three-d-sphere" />
            <span className="three-d-cube" />
            <span className="three-d-caption">MOVE THROUGH SPACE</span>
          </div>
        )}
      </div>
      <div
        ref={galleryRef}
        className={`project-image-gallery${imagesReady ? ' is-ready' : ''}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${project.title} screenshots`}
        tabIndex={0}
        onScroll={updateActiveImage}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false)
        }}
      >
        {project.images.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            decoding="async"
            aria-current={activeIndex === index ? 'true' : undefined}
            onLoad={() => setLoadedImages((current) => ({ ...current, [image.src]: true }))}
          />
        ))}
      </div>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('portfolio-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return 'light'
  })
  const [accentColor, setAccentColor] = useState(() => {
    const savedColor = window.localStorage.getItem('portfolio-accent')
    return Object.hasOwn(colorOptions, savedColor) ? savedColor : 'coral'
  })
  const [starDensity, setStarDensity] = useState(() => {
    const savedDensity = Number(window.localStorage.getItem('portfolio-star-density'))
    return Number.isInteger(savedDensity) && savedDensity >= 1 && savedDensity <= 6 ? savedDensity : 1
  })
  const [threeBackgroundEnabled, setThreeBackgroundEnabled] = useState(
    () => window.localStorage.getItem('portfolio-three-background') !== 'false',
  )
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [portraitVisible, setPortraitVisible] = useState(true)
  const [featureIndex, setFeatureIndex] = useState(0)
  const appearanceRef = useRef(null)
  const appearanceTriggerRef = useRef(null)

  useEffect(() => {
    featureSlides.slice(1).forEach(({ src }) => {
      const image = new Image()
      image.src = src
    })
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(() => {
    const selectedColor = colorOptions[accentColor]
    document.documentElement.style.setProperty('--accent', selectedColor.accent)
    document.documentElement.style.setProperty('--accent-soft', selectedColor.soft)
    document.documentElement.style.setProperty('--accent-border', selectedColor.border)
    window.localStorage.setItem('portfolio-accent', accentColor)
  }, [accentColor])

  useEffect(() => {
    window.localStorage.setItem('portfolio-star-density', String(starDensity))
  }, [starDensity])

  useEffect(() => {
    window.localStorage.setItem('portfolio-three-background', String(threeBackgroundEnabled))
  }, [threeBackgroundEnabled])

  useEffect(() => {
    if (!appearanceOpen) return undefined

    const closeOnOutsideInteraction = (event) => {
      if (!appearanceRef.current?.contains(event.target)) {
        setAppearanceOpen(false)
      }
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setAppearanceOpen(false)
        appearanceTriggerRef.current?.focus()
      }
    }
    const closeOnScroll = () => setAppearanceOpen(false)

    document.addEventListener('pointerdown', closeOnOutsideInteraction)
    document.addEventListener('focusin', closeOnOutsideInteraction)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('scroll', closeOnScroll, { capture: true, passive: true })

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideInteraction)
      document.removeEventListener('focusin', closeOnOutsideInteraction)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('scroll', closeOnScroll, true)
    }
  }, [appearanceOpen])

  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <StarfieldBackground density={starDensity} />
      {threeBackgroundEnabled && (
        <Suspense fallback={null}>
          <ThreeBackground />
        </Suspense>
      )}
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="#home" aria-label="Sebastian, back to top">
            <img className="brand-mark" src={navigationIcon} alt="" />
            <span className="brand-name">SebastianTech<span> Developer </span></span>
          </a>

          <nav className="main-nav" aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#projects">Work</a>
            <a href="#contact">Contact</a>
            <div className="appearance" ref={appearanceRef}>
              <button
                className="appearance-toggle"
                type="button"
                ref={appearanceTriggerRef}
                aria-expanded={appearanceOpen}
                aria-controls="appearance-panel"
                onClick={() => setAppearanceOpen((open) => !open)}
              >
                <span className="appearance-icon"><ThemeIcon theme={theme} /></span>
                Appearance
                <svg className="chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none">
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </button>
              {appearanceOpen && (
                <div className="appearance-panel" id="appearance-panel" role="group" aria-label="Appearance settings">
                  <div className="appearance-panel-header">
                    <button
                      className="appearance-close"
                      type="button"
                      aria-label="Close appearance settings"
                      onClick={() => setAppearanceOpen(false)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="m5 5 10 10M15 5 5 15" />
                      </svg>
                    </button>
                  </div>
                  <button
                    className="theme-toggle"
                    type="button"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    onClick={() => {
                      setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')
                      setAppearanceOpen(false)
                    }}
                  >
                    <span className="theme-toggle-content">
                      <span className="theme-toggle-label">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
                      <span className="theme-indicator">
                        <ThemeIcon theme={theme === 'light' ? 'dark' : 'light'} />
                      </span>
                    </span>
                  </button>
                  <div className="star-density">
                    <span className="star-density-label">Background stars</span>
                    <div className="star-density-options" role="group" aria-label="Background star density">
                      {[1, 2, 3, 4, 5, 6].map((density) => (
                        <button
                          className="star-density-option"
                          type="button"
                          key={density}
                          aria-pressed={starDensity === density}
                          onClick={() => setStarDensity(density)}
                        >
                          {density}×
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    className="background-toggle"
                    type="button"
                    role="switch"
                    aria-checked={threeBackgroundEnabled}
                    onClick={() => setThreeBackgroundEnabled((enabled) => !enabled)}
                  >
                    <span>3D background</span>
                    <span className="background-toggle-track" aria-hidden="true">
                      <span className="background-toggle-thumb" />
                    </span>
                  </button>
                  <div className="color-picker" role="group" aria-label="Accent color">
                    {Object.keys(colorOptions).map((color) => (
                      <button
                        className={`color-option color-${color}`}
                        type="button"
                        key={color}
                        aria-label={`${color} accent`}
                        aria-pressed={accentColor === color}
                        onClick={() => setAccentColor(color)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="portfolio">
      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <h1>Awesome designs,<br />made <span className="accent-word">for you</span></h1>
            <p className="hero-text">
              I&apos;m Sebastian, a full-stack developer who loves making the internet feel enjoyable —
              thoughtful details, useful tools, and clear experiences.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#projects">Explore my work <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#contact">Let&apos;s talk <span aria-hidden="true">↓</span></a>
            </div>
            <p className="hero-note"><span aria-hidden="true">✳</span>Learn, build something, and get better.</p>
          </div>

          <div className="portrait-column">
            {portraitVisible ? (
              <div className="portrait-card">
                <div className="portrait-topline">
                  <span>{featureSlides[featureIndex].heading}</span>
                  <button
                    className="portrait-close"
                    type="button"
                    aria-label="Hide portrait"
                    onClick={() => setPortraitVisible(false)}
                  >×</button>
                </div>
                <button
                  className="portrait-image-button"
                  type="button"
                  aria-label={`Show next photo, ${featureIndex + 1} of ${featureSlides.length}`}
                  onClick={() => setFeatureIndex((index) => (index + 1) % featureSlides.length)}
                >
                  <img
                    src={featureSlides[featureIndex].src}
                    alt={featureSlides[featureIndex].alt}
                  />
                  <span className="portrait-stamp" aria-hidden="true">
                    {featureSlides[featureIndex].stamp}
                  </span>
                  <span className="portrait-next-hint" aria-hidden="true">
                    Next photo <span>→</span>
                  </span>
                </button>
                <div className="portrait-caption">
                  {featureSlides[featureIndex].caption.map((line) => <span key={line}>{line}</span>)}
                </div>
              </div>
            ) : (
              <button
                className="portrait-reveal"
                type="button"
                onClick={() => setPortraitVisible(true)}
              >
                <span className="portrait-reveal-mark" aria-hidden="true">+</span>
                Show portrait
              </button>
            )}
            <span className="portrait-caption-note"><strong>Build your work don't let someone discourage you</strong></span>
          </div>
          <span className="hero-index" aria-hidden="true">01 / 03</span>
        </section>

        <div className="ticker" role="region" aria-label="What drives my work">
          <div className="ticker-track">
            <div className="ticker-group">
              <strong>Driven by Curiosity.</strong><i aria-hidden="true">✳</i>
              <strong>Built on Good Design.</strong><i aria-hidden="true">✳</i>
              <strong>Powered by Useful Code.</strong><i aria-hidden="true">✳</i>
              <strong>Obsessed with Small Details.</strong><i aria-hidden="true">✳</i>
            </div>
            <div className="ticker-group" aria-hidden="true">
              <strong>Driven by Curiosity.</strong><i>✳</i>
              <strong>Built on Good Design.</strong><i>✳</i>
              <strong>Powered by Useful Code.</strong><i>✳</i>
              <strong>Obsessed with Small Details.</strong><i>✳</i>
            </div>
          </div>
        </div>

        <section className="content-section about-section" id="about" data-reveal>
          <div className="section-heading">
            <p className="section-kicker">About me</p>
            <h2>Focused to make<br /><span>everyday life easier.</span></h2>
          </div>
          <div className="about-copy">
            <p>
              I enjoy taking an idea from the first sketch to the final detail in the browser.
              I&apos;m learning modern web technologies and looking for ways to make digital
              experiences feel simple, welcoming, and genuinely useful.
            </p>
            <p>
              Good work, to me, starts with listening and stays grounded in the people who
              will use it. The best details are the ones that make everything feel effortless.
            </p>
            <h1>Tech stack</h1>
            <div className="skills" role="region" aria-label="Technologies and skills">
              <div className="skills-track">
                <div className="skills-group">
                  <span>React</span>
                  <span>JavaScript</span>
                  <span>HTML &amp; CSS</span>
                  <span>Responsive design</span>
                  <span>Node.js</span>
                  <span>Express.js</span>
                  <span>MongoDB</span>
                  <span>Tailwind CSS</span>
                  <span>Three.js</span>
                  <span>M-Pesa Integration</span>
                </div>
                <div className="skills-group" aria-hidden="true">
                  <span>React</span>
                  <span>JavaScript</span>
                  <span>HTML &amp; CSS</span>
                  <span>Responsive design</span>
                  <span>Node.js</span>
                  <span>Express.js</span>
                  <span>MongoDB</span>
                  <span>Tailwind CSS</span>
                  <span>Three.js</span>
                  <span>M-Pesa Integration</span>
                </div>
              </div>
            </div>
            <p className="skills-note">Practising more and growing with every project.</p>
          </div>
        </section>

        <section className="content-section work-section" id="projects" data-reveal>
          <div className="section-heading work-heading">
            <div className="work-title">
              <p className="section-kicker">Progress</p>
              <h2>A few projects<br /><span>I&apos;ve made.</span></h2>
            </div>
            <p className="work-intro">Ideas built to solve a problem somewhere. Here are a few projects from my journey so far.</p>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.number}>
                <ProjectPreview project={project} />
                <div className="project-details">
                  <div className="project-title-row">
                    <h3>{project.title}</h3>
                    <a
                      className="project-demo"
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.title} live demo (opens in a new tab)`}
                    >
                      Live Demo <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                  <p>{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact" data-reveal>
          <div className="contact-stamp" aria-hidden="true">OPEN<br />TO IDEAS</div>
          <p className="section-kicker">Let's get to work</p>
          <h2>Have an idea <br />in <span>mind?</span></h2>
          <p className="contact-copy">I&apos;d love to hear what you&apos;re working on. Drop me a note and let&apos;s make something useful.</p>
          <a className="button contact-button" href="https://wa.me/254797859542">
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
          <a className="contact-email" href="mailto:oumasebastian80@gmail.com">Email</a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#home">Sebastian<span>© 2026</span></a>
        <p>Designed by SebastianTech. Built for you.</p>
        <a className="back-to-top" href="#home">Back to top ↑</a>
      </footer>
      </div>
    </>
  )
}

export default App

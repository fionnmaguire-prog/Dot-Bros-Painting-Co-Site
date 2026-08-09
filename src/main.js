const body = document.body
const root = document.documentElement
const yearTarget = document.querySelector('[data-current-year]')
const introOverlay = document.querySelector('[data-intro-overlay]')
const parallaxElements = document.querySelectorAll('[data-parallax]')
const trustSection = document.querySelector('.trust-strip')
const trustItems = document.querySelectorAll('.trust-list li')
const processSection = document.querySelector('#process')
const processCards = document.querySelectorAll('.process-card')
const estimateForm = document.querySelector('#estimate-form')
const estimateSuccess = document.querySelector('#estimate-success')
const estimateResetButton = document.querySelector('#estimate-reset')
const estimateStatus = document.querySelector('#estimate-status')
const projectTypeNote = document.querySelector('#project-type-note')
const submitButton = document.querySelector('#estimate-submit')

// Web3Forms configuration lives here. Add the real access key in a local .env file
// or deployment environment using VITE_WEB3FORMS_ACCESS_KEY.
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? ''
const projectTypeNoteValues = new Set([
  'Exterior Painting',
  'Interior + Exterior',
  'Mural',
  'Branding / Graphics',
])

// Local testing option: use 'always' to run on every refresh, or 'session' to only play once per browser session.
const INTRO_PLAY_MODE = 'always'
const INTRO_SESSION_KEY = 'dotbros-intro-played'

// Shared intro motion duration in milliseconds. This drives the wipe and roller together.
const INTRO_MOTION_MS = 1600

// Extra horizontal space after the roller clears the painted area.
const INTRO_EXIT_BUFFER_PX = 36

// Short fade once the roller reaches the far edge.
const INTRO_EXIT_MS = 150

// Intro duration in milliseconds. This controls the full overlay sequence length.
const INTRO_DURATION_MS = INTRO_MOTION_MS + INTRO_EXIT_MS

const REDUCED_MOTION_REVEAL_MS = 180
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let parallaxTicking = false
let introMotionFrame = 0
let introCurrentProgress = 0

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

root.style.setProperty('--intro-duration', `${INTRO_DURATION_MS}ms`)
root.style.setProperty('--intro-motion-duration', `${INTRO_MOTION_MS}ms`)
root.style.setProperty('--intro-exit-buffer', `${INTRO_EXIT_BUFFER_PX}px`)
root.style.setProperty('--intro-exit-duration', `${INTRO_EXIT_MS}ms`)

function setIntroProgress(progress) {
  const viewportWidth = Math.max(window.innerWidth, 1)
  const viewportHeight = Math.max(window.innerHeight, 1)
  const rollerWidth = viewportHeight * 1.311
  const totalDistance = viewportWidth + rollerWidth + INTRO_EXIT_BUFFER_PX
  const wipeCompletionRatio = viewportWidth / totalDistance
  const revealProgress = Math.min(progress / wipeCompletionRatio, 1)

  introCurrentProgress = progress
  root.style.setProperty('--intro-progress', progress.toFixed(6))
  root.style.setProperty('--intro-reveal-progress', revealProgress.toFixed(6))
  root.style.setProperty('--intro-wipe-completion-ratio', wipeCompletionRatio.toFixed(6))
}

function updateIntroGeometry() {
  setIntroProgress(introCurrentProgress)
}

function clearIntroMotion() {
  if (introMotionFrame) {
    window.cancelAnimationFrame(introMotionFrame)
    introMotionFrame = 0
  }
}

function easeInSine(progress) {
  return 1 - Math.cos((progress * Math.PI) / 2)
}

function animateIntroMotion() {
  clearIntroMotion()
  setIntroProgress(0)

  const start = performance.now()

  function step(timestamp) {
    const elapsed = Math.min(timestamp - start, INTRO_MOTION_MS)
    const linearProgress = elapsed / INTRO_MOTION_MS
    const easedProgress = easeInSine(linearProgress)

    setIntroProgress(easedProgress)

    if (linearProgress < 1) {
      introMotionFrame = window.requestAnimationFrame(step)
    } else {
      introMotionFrame = 0
    }
  }

  introMotionFrame = window.requestAnimationFrame(step)
}

function finishIntro(rememberIntro = true) {
  window.clearTimeout(window.__dotBrosIntroFailsafe)
  clearIntroMotion()
  body.classList.add('intro-complete')
  body.classList.remove('intro-active', 'play-intro', 'reduce-intro')

  if (introOverlay) {
    introOverlay.hidden = true
  }

  if (rememberIntro && INTRO_PLAY_MODE === 'session') {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true')
  }
}

function getIntroMode() {
  if (prefersReducedMotion.matches) {
    return 'reduced'
  }

  if (INTRO_PLAY_MODE === 'session') {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'true'
      ? 'skip'
      : 'play'
  }

  return 'play'
}

function initializeIntro() {
  if (!introOverlay) {
    body.classList.add('intro-complete')
    return
  }

  const introMode = getIntroMode()

  if (introMode === 'skip') {
    setIntroProgress(1)
    finishIntro(false)
    return
  }

  if (introMode === 'reduced') {
    body.classList.remove('play-intro')
    body.classList.add('reduce-intro')
    setIntroProgress(1)
    window.setTimeout(finishIntro, REDUCED_MOTION_REVEAL_MS)
    return
  }

  animateIntroMotion()
  window.setTimeout(finishIntro, INTRO_DURATION_MS)
}

function updateParallax() {
  if (prefersReducedMotion.matches || parallaxElements.length === 0) {
    return
  }

  const scrollOffset = Math.min(window.scrollY, 900)
  const viewportHeight = Math.max(window.innerHeight, 1)

  parallaxElements.forEach((element) => {
    const speed = Number(element.dataset.parallaxSpeed ?? '0')
    const min = Number(element.dataset.parallaxMin ?? Number.NEGATIVE_INFINITY)
    const max = Number(element.dataset.parallaxMax ?? Number.POSITIVE_INFINITY)
    const mode = element.dataset.parallaxMode ?? 'page'
    let translateY = scrollOffset * speed

    if (mode === 'viewport') {
      const rect = element.getBoundingClientRect()
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2
      translateY = centerOffset * speed
    }

    translateY = Math.min(Math.max(translateY, min), max)
    element.style.setProperty('--parallax-y', `${translateY.toFixed(2)}px`)
  })
}

function requestParallaxUpdate() {
  if (parallaxTicking) {
    return
  }

  parallaxTicking = true
  window.requestAnimationFrame(() => {
    updateParallax()
    parallaxTicking = false
  })
}

function revealProcessCards() {
  processCards.forEach((card) => {
    card.classList.add('process-card-visible')
  })
}

function revealTrustItems() {
  trustItems.forEach((item) => {
    item.classList.add('trust-item-visible')
  })
}

function initializeTrustReveal() {
  if (trustItems.length === 0) {
    return
  }

  if (prefersReducedMotion.matches || !trustSection || !('IntersectionObserver' in window)) {
    revealTrustItems()
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries

      if (!entry?.isIntersecting) {
        return
      }

      revealTrustItems()
      observer.disconnect()
    },
    {
      threshold: 0.35,
      rootMargin: '0px 0px -8% 0px',
    },
  )

  observer.observe(trustSection)
}

function initializeProcessReveal() {
  if (processCards.length === 0) {
    return
  }

  if (prefersReducedMotion.matches || !processSection || !('IntersectionObserver' in window)) {
    revealProcessCards()
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries

      if (!entry?.isIntersecting) {
        return
      }

      revealProcessCards()
      observer.disconnect()
    },
    {
      threshold: 0.25,
      rootMargin: '0px 0px -10% 0px',
    },
  )

  observer.observe(processSection)
}

function getSelectedProjectType() {
  if (!estimateForm) {
    return ''
  }

  const selected = estimateForm.querySelector('input[name="project_type"]:checked')
  return selected?.value ?? ''
}

function setFieldError(fieldName, message) {
  if (!estimateForm) {
    return
  }

  const field = estimateForm.querySelector(`[data-field="${fieldName}"]`)
  const error = estimateForm.querySelector(`#error-${fieldName}`)
  if (!field || !error) {
    return
  }

  error.textContent = message
  field.classList.toggle('has-error', Boolean(message))

  const control = field.querySelector('input, select, textarea')
  if (control) {
    control.setAttribute('aria-invalid', message ? 'true' : 'false')
  }
}

function clearEstimateErrors() {
  if (!estimateForm) {
    return
  }

  estimateForm.querySelectorAll('.field-error').forEach((error) => {
    error.textContent = ''
  })

  estimateForm.querySelectorAll('.has-error').forEach((field) => {
    field.classList.remove('has-error')
  })

  estimateForm.querySelectorAll('input, select, textarea').forEach((control) => {
    control.removeAttribute('aria-invalid')
  })
}

function setEstimateStatus(message, type = '') {
  if (!estimateStatus) {
    return
  }

  estimateStatus.textContent = message
  estimateStatus.classList.toggle('is-error', type === 'error')
}

function updateProjectTypeMessaging() {
  if (!projectTypeNote) {
    return
  }

  const projectType = getSelectedProjectType()
  const showContextNote = projectTypeNoteValues.has(projectType)

  projectTypeNote.hidden = !showContextNote
}

function validateEstimateForm() {
  if (!estimateForm) {
    return false
  }

  clearEstimateErrors()
  let isValid = true

  const nameInput = estimateForm.querySelector('#estimate-name')
  const phoneInput = estimateForm.querySelector('#estimate-phone')
  const emailInput = estimateForm.querySelector('#estimate-email')
  const locationInput = estimateForm.querySelector('#estimate-location')

  const nameValue = nameInput?.value.trim() ?? ''
  const phoneValue = phoneInput?.value.trim() ?? ''
  const emailValue = emailInput?.value.trim() ?? ''
  const locationValue = locationInput?.value.trim() ?? ''
  const projectTypeValue = getSelectedProjectType()
  const phoneDigits = phoneValue.replace(/\D/g, '')
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)

  if (!nameValue) {
    setFieldError('name', 'Please enter your full name.')
    isValid = false
  }

  if (!phoneValue) {
    setFieldError('phone', 'Please enter your phone number.')
    isValid = false
  } else if (phoneDigits.length < 7) {
    setFieldError('phone', 'Please enter a valid phone number.')
    isValid = false
  }

  if (!emailValue) {
    setFieldError('email', 'Please enter your email address.')
    isValid = false
  } else if (!emailValid) {
    setFieldError('email', 'Please enter a valid email address.')
    isValid = false
  }

  if (!locationValue) {
    setFieldError('property_location', 'Please enter the property location.')
    isValid = false
  }

  if (!projectTypeValue) {
    setFieldError('project_type', 'Please choose a project type.')
    isValid = false
  }

  return isValid
}

function setEstimateSubmitting(isSubmitting) {
  if (!submitButton) {
    return
  }

  submitButton.disabled = isSubmitting
  submitButton.textContent = isSubmitting
    ? 'Sending...'
    : 'Request My Free Estimate'
}

async function submitEstimateForm(event) {
  event.preventDefault()

  if (!estimateForm) {
    return
  }

  setEstimateStatus('')

  if (!validateEstimateForm()) {
    return
  }

  const formData = new FormData(estimateForm)
  const selectedSurfaces = formData.getAll('surfaces').filter(Boolean)
  formData.delete('surfaces')
  formData.set('surfaces', selectedSurfaces.length > 0 ? selectedSurfaces.join(', ') : 'Not specified')
  formData.set('page_url', window.location.href)
  formData.set('access_key', WEB3FORMS_ACCESS_KEY)

  if (!WEB3FORMS_ACCESS_KEY) {
    console.warn(
      'VITE_WEB3FORMS_ACCESS_KEY is not set. Estimate form submissions will fail until you add it to a local .env file or deployment environment.',
    )
    setEstimateStatus(
      'Something went wrong while sending your request. Please try again, or contact us directly.',
      'error',
    )
    return
  }

  setEstimateSubmitting(true)

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })

    const result = await response.json()

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Web3Forms submission failed.')
    }

    estimateForm.reset()
    updateProjectTypeMessaging()
    clearEstimateErrors()
    setEstimateStatus('')

    estimateForm.hidden = true
    if (estimateSuccess) {
      estimateSuccess.hidden = false
    }
  } catch (error) {
    console.error('Estimate form submission failed:', error)
    setEstimateStatus(
      'Something went wrong while sending your request. Please try again, or contact us directly.',
      'error',
    )
  } finally {
    setEstimateSubmitting(false)
  }
}

function resetEstimateForm() {
  if (!estimateForm) {
    return
  }

  estimateForm.hidden = false
  if (estimateSuccess) {
    estimateSuccess.hidden = true
  }

  estimateForm.reset()
  clearEstimateErrors()
  setEstimateStatus('')
  setEstimateSubmitting(false)
  updateProjectTypeMessaging()
}

function initializeEstimateForm() {
  if (!estimateForm) {
    return
  }

  if (!WEB3FORMS_ACCESS_KEY) {
    console.warn(
      'VITE_WEB3FORMS_ACCESS_KEY is not set. The estimate form UI will work locally, but submissions will fail until the key is configured.',
    )
  }

  estimateForm.addEventListener('submit', submitEstimateForm)
  estimateForm
    .querySelectorAll('input[name="project_type"]')
    .forEach((input) => input.addEventListener('change', updateProjectTypeMessaging))

  estimateResetButton?.addEventListener('click', resetEstimateForm)
  updateProjectTypeMessaging()
}

window.addEventListener('resize', () => {
  updateIntroGeometry()
  requestParallaxUpdate()
})

window.addEventListener('scroll', requestParallaxUpdate, { passive: true })
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0)
})

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear())
}

window.scrollTo(0, 0)
updateIntroGeometry()
initializeIntro()
updateParallax()
initializeTrustReveal()
initializeProcessReveal()
initializeEstimateForm()

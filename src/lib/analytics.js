import { track } from '@vercel/analytics'

/**
 * Thin wrapper around Vercel Web Analytics custom events.
 *
 * Centralizing event names here keeps reporting consistent and makes it easy
 * to see everything that's tracked in one place. Calls are wrapped in try/catch
 * so a blocked/unloaded analytics script can never break the UI.
 *
 * Vercel only accepts string | number | boolean | null property values, so we
 * coerce/clean props before sending.
 *
 * @param {string} name
 * @param {Record<string, string | number | boolean | null | undefined>} [props]
 */
export function trackEvent(name, props) {
  try {
    if (!props) {
      track(name)
      return
    }
    const clean = {}
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined) continue
      clean[key] = value
    }
    track(name, clean)
  } catch {
    // Analytics is best-effort; never let it throw into the render path.
  }
}

export const AnalyticsEvent = {
  NavClick: 'nav_click',
  CtaClick: 'cta_click',
  ProjectClick: 'project_click',
  SocialClick: 'social_click',
  ThemeToggle: 'theme_toggle',
  SectionView: 'section_view',
  ScrollDepth: 'scroll_depth',
  ContactSubmit: 'contact_submit',
  ContactValidationError: 'contact_validation_error',
  ContactSuccess: 'contact_success',
  ContactError: 'contact_error',
}

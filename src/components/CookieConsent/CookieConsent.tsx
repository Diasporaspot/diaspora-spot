'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import styles from './cookieConsent.module.css';

const COOKIE_NAME = 'ds_cookie_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const CONSENT_CHANGE_EVENT = 'ds:cookie-consent-change';
const DEFAULT_GA_MEASUREMENT_ID = 'G-HY8H12ZFY9';
const DEFAULT_CLARITY_PROJECT_ID = 'xgm7wbtndd';
const DEFAULT_META_PIXEL_ID = '1028283539696763';

type ConsentState = {
  necessary: true;
  functional: boolean;
  analytical: boolean;
  advertising: boolean;
  updatedAt: string;
};

type EditableConsent = Omit<ConsentState, 'necessary' | 'updatedAt'>;

const defaultChoices: EditableConsent = {
  functional: false,
  analytical: false,
  advertising: false,
};

function getConsentCookieValue() {
  if (typeof document === 'undefined') {
    return '';
  }

  return (
    document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1] ?? ''
  );
}

function parseConsentCookie(cookie: string): ConsentState | null {
  if (!cookie) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(cookie)) as Partial<ConsentState>;

    return {
      necessary: true,
      functional: Boolean(parsed.functional),
      analytical: Boolean(parsed.analytical),
      advertising: Boolean(parsed.advertising),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function getStoredConsent(): ConsentState | null {
  return parseConsentCookie(getConsentCookieValue());
}

function getEditableConsent(consent: ConsentState | null): EditableConsent {
  if (!consent) {
    return defaultChoices;
  }

  return {
    functional: consent.functional,
    analytical: consent.analytical,
    advertising: consent.advertising,
  };
}

function storeConsent(choices: EditableConsent) {
  const consent: ConsentState = {
    necessary: true,
    ...choices,
    updatedAt: new Date().toISOString(),
  };
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(consent),
  )}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));

  return consent;
}

function subscribeToConsentChanges(callback: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);

  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
}

function subscribeToMount() {
  return () => undefined;
}

function CookieScripts({ consent }: { consent: ConsentState | null }) {
  const analyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || DEFAULT_CLARITY_PROJECT_ID;
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID;

  return (
    <>
      {consent?.analytical && analyticsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-consent" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${analyticsId}');
            `}
          </Script>
          <Script id="microsoft-clarity-consent" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        </>
      ) : null}

      {consent?.advertising && adsenseClientId ? (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      ) : null}

      {consent?.advertising && metaPixelId ? (
        <Script id="meta-pixel-consent" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}
    </>
  );
}

export default function CookieConsent() {
  const hasMounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const consentCookie = useSyncExternalStore(subscribeToConsentChanges, getConsentCookieValue, () => '');
  const consent = useMemo(() => parseConsentCookie(consentCookie), [consentCookie]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [choices, setChoices] = useState<EditableConsent>(defaultChoices);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && consent) {
        setSettingsOpen(false);
        setIsCustomizing(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [consent, settingsOpen]);

  function openSettings() {
    setChoices(getEditableConsent(consent ?? getStoredConsent()));
    setIsCustomizing(true);
    setSettingsOpen(true);
  }

  function closeSettings() {
    if (!consent) {
      return;
    }

    setSettingsOpen(false);
    setIsCustomizing(false);
  }

  function handleBackdropClick() {
    closeSettings();
  }

  const categories = useMemo(
    () => [
      {
        key: 'functional' as const,
        title: 'Functional cookies',
        text: 'Remember choices that improve the site experience.',
      },
      {
        key: 'analytical' as const,
        title: 'Analytical cookies',
        text: 'Help us understand how people use DiasporaSpot so we can improve it.',
      },
      {
        key: 'advertising' as const,
        title: 'Advertising cookies',
        text: 'Allow advertising services such as Meta Pixel and Google AdSense to measure and tailor ads if configured.',
      },
    ],
    [],
  );

  function saveConsent(nextChoices: EditableConsent) {
    storeConsent(nextChoices);
    setChoices(nextChoices);
    setSettingsOpen(false);
    setIsCustomizing(false);
  }

  const isVisible = hasMounted && (!consent || settingsOpen);
  const showFloatingButton = hasMounted && Boolean(consent) && !isVisible;

  return (
    <>
      <CookieScripts consent={consent} />

      <AnimatePresence>
        {showFloatingButton ? (
          <motion.button
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-label="Open cookie settings"
            className={styles.floatingButton}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            onClick={openSettings}
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            <Cookie aria-hidden="true" size={18} />
            <span className={styles.floatingLabel}>Cookies</span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible ? (
          <motion.div
            animate={{ opacity: 1 }}
            className={styles.backdrop}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={handleBackdropClick}
          >
            <motion.section
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-label="Cookie consent"
              className={styles.banner}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {consent ? (
                <button
                  aria-label="Close cookie settings"
                  className={styles.closeButton}
                  onClick={closeSettings}
                  type="button"
                >
                  <X aria-hidden="true" size={17} />
                </button>
              ) : null}

              <div className={styles.copy}>
                <span className={styles.kicker}>Privacy controls</span>
                <h2 className={styles.title}>Choose your cookie settings</h2>
                <p className={styles.text}>
                  We use necessary cookies to remember your consent. With your permission, we may
                  also use functional, analytical and advertising cookies. You can change this later
                  from the floating cookie button. Read our{' '}
                  <Link className={styles.link} href="/privacy-policy">Privacy Policy</Link>.
                </p>
              </div>

              {isCustomizing ? (
                <div className={styles.panel}>
                  <label className={styles.option}>
                    <span>
                      <span className={styles.optionTitle}>Necessary cookies</span>
                      <span className={styles.optionText}>
                        Required to remember your cookie choices and keep the site working.
                      </span>
                    </span>
                    <input className={styles.toggle} type="checkbox" checked disabled />
                  </label>

                  {categories.map((category) => (
                    <label className={styles.option} key={category.key}>
                      <span>
                        <span className={styles.optionTitle}>{category.title}</span>
                        <span className={styles.optionText}>{category.text}</span>
                      </span>
                      <input
                        checked={choices[category.key]}
                        className={styles.toggle}
                        onChange={(event) =>
                          setChoices((current) => ({
                            ...current,
                            [category.key]: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                    </label>
                  ))}

                  <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.primary}`} onClick={() => saveConsent(choices)} type="button">
                      Save choices
                    </button>
                    <button className={`${styles.button} ${styles.secondary}`} onClick={() => saveConsent({ functional: true, analytical: true, advertising: true })} type="button">
                      Accept all
                    </button>
                    <button className={`${styles.button} ${styles.ghost}`} onClick={() => saveConsent(defaultChoices)} type="button">
                      Reject non-essential
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.actions}>
                  <button className={`${styles.button} ${styles.primary}`} onClick={() => saveConsent({ functional: true, analytical: true, advertising: true })} type="button">
                    Accept all
                  </button>
                  <button className={`${styles.button} ${styles.secondary}`} onClick={() => setIsCustomizing(true)} type="button">
                    Customize
                  </button>
                  <button className={`${styles.button} ${styles.ghost}`} onClick={() => saveConsent(defaultChoices)} type="button">
                    Reject non-essential
                  </button>
                </div>
              )}
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

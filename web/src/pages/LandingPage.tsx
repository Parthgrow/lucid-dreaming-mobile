import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

const APK_URL =
  'https://github.com/Parthgrow/lucid-dreaming-mobile/releases/latest/download/lucid-dreaming.apk';

const LIFETIME_YEARS = 78;

const BENEFITS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'Fewer nightmares',
    body: 'Lucid dreaming therapy has helped some people with recurring nightmares. Once you know it is a dream, you can change the scene or wake yourself up.',
    icon: (
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    ),
  },
  {
    title: 'Fresh ideas',
    body: 'Dreams mix memories in odd ways. Lucid dreamers describe using that to test ideas, build scenes and get unstuck on problems.',
    icon: (
      <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" />
    ),
  },
  {
    title: 'Practice with no stakes',
    body: 'Small studies suggest that rehearsing a skill inside a lucid dream can improve how you perform it awake.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.5" />
      </>
    ),
  },
  {
    title: 'Sharper attention',
    body: 'A regular dream practice trains you to notice thoughts and feelings as they happen. Many people find that carries into the day.',
    icon: (
      <path d="M3 12c2.5 0 2.5-4 5-4s2.5 8 5 8 2.5-4 5-4 1.5 0 3 0" />
    ),
  },
];

const FEATURES = [
  {
    title: 'Dream journal',
    body: 'Write a dream down in under a minute, with a title, the story, the date and tags.',
  },
  {
    title: 'Lucid marker',
    body: 'Flag the dreams where you knew you were dreaming, and see how often it happens.',
  },
  {
    title: 'Daily streaks',
    body: 'Keep a streak going, with weekly counts that show whether your recall is improving.',
  },
  {
    title: 'Meditation minutes',
    body: 'Log meditation next to your dreams. Steady attention is a core skill for both recall and lucidity.',
  },
];

const INSTALL_STEPS = [
  'Download the APK on your Android phone.',
  'Open it and allow installs from your browser or Files app when asked.',
  'If Play Protect warns about an unknown app, choose Install anyway.',
];

function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);

  return [ref, seen] as const;
}

function DownloadButton({ label = 'Download for Android' }: { label?: string }) {
  return (
    <a className="lz-download" href={APK_URL}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
      </svg>
      {label}
    </a>
  );
}

function LifeGrid() {
  const [ref, seen] = useInView<HTMLDivElement>(0.35);

  return (
    <figure className="lz-life">
      <div
        ref={ref}
        className={`lz-dots${seen ? ' is-seen' : ''}`}
        role="img"
        aria-label={`${LIFETIME_YEARS} dots, one for each year of a long life. ${LIFETIME_YEARS / 3} are lit to show the years spent asleep.`}
      >
        {Array.from({ length: LIFETIME_YEARS }, (_, i) => (
          <span
            key={i}
            className={i % 3 === 0 ? 'lz-dot lz-dot--asleep' : 'lz-dot'}
            style={{ ['--i' as string]: i }}
          />
        ))}
      </div>
      <figcaption className="lz-legend">
        <span>
          <i className="lz-key lz-key--asleep" /> 26 years asleep
        </span>
        <span>
          <i className="lz-key" /> 52 years awake
        </span>
      </figcaption>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <div className="lz">
      <header className="lz-hero">
        <nav className="lz-nav">
          <span className="lz-mark">Lucid Dreaming</span>
          <a className="lz-nav-link" href={APK_URL}>
            Download
          </a>
        </nav>

        <div className="lz-hero-body">
          <p className="lz-eyebrow">Dream journal for Android</p>
          <h1>
            A third of your life happens while you sleep. <em>Be there for it.</em>
          </h1>
          <p className="lz-lede">
            Lucid Dreaming helps you remember your dreams, spot the ones where you knew you were
            dreaming, and build the habit that makes more of them happen.
          </p>
          <div className="lz-cta">
            <DownloadButton />
            <a className="lz-ghost" href="#lucid">
              What is a lucid dream?
            </a>
          </div>
          <p className="lz-meta">Free · Android 7.0 or newer · Installs as an APK</p>
        </div>
      </header>

      <main>
        <section className="lz-section lz-split" id="asleep">
          <div>
            <p className="lz-eyebrow">The maths of sleep</p>
            <h2>
              Sleep eight hours a night and you will spend about 26 of your 78 years asleep.
            </h2>
            <p className="lz-body">
              That is a third of your life. Roughly one and a half to two hours of each night is
              REM sleep, when most vivid dreaming happens. Unless you write a dream down, it is
              usually gone within minutes of waking.
            </p>
          </div>
          <LifeGrid />
        </section>

        <section className="lz-section lz-lucid" id="lucid">
          <p className="lz-eyebrow">What it is</p>
          <h2>A lucid dream is one where you know you are dreaming, while it is still happening.</h2>
          <p className="lz-body lz-body--wide">
            You stay asleep and the dream carries on. The difference is that someone in it can now
            notice what is going on, and sometimes choose what happens next. It is more common than
            most people expect.
          </p>
          <dl className="lz-stats">
            <div>
              <dt>
                55<span>%</span>
              </dt>
              <dd>of people have had at least one lucid dream</dd>
            </div>
            <div>
              <dt>
                23<span>%</span>
              </dt>
              <dd>have them at least once a month</dd>
            </div>
          </dl>
        </section>

        <section className="lz-section" id="benefits">
          <p className="lz-eyebrow">Why bother</p>
          <h2>What lucid dreaming can do for you</h2>
          <p className="lz-body lz-body--wide">
            The research is early and the studies are small, but the signals are consistent enough
            to take seriously.
          </p>
          <div className="lz-benefits">
            {BENEFITS.map((b) => (
              <article key={b.title} className="lz-benefit">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {b.icon}
                </svg>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lz-section lz-app" id="app">
          <div className="lz-app-intro">
            <p className="lz-eyebrow">The app</p>
            <h2>Recall comes first. The rest follows.</h2>
            <p className="lz-body">
              Almost every lucid dreaming method starts with remembering your dreams. The app is
              built around that one habit.
            </p>
          </div>
          <ul className="lz-features">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="lz-section lz-final" id="download">
          <h2>Start tonight. Your next dream is a few hours away.</h2>
          <DownloadButton />
          <ol className="lz-steps">
            {INSTALL_STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="lz-fine">
            The app is shared directly as an APK for now, which is why Android shows an unknown-app
            prompt.
          </p>
        </section>
      </main>

      <footer className="lz-footer">
        <p className="lz-fine">
          Lucid dreaming is not a medical treatment. If nightmares or poor sleep are affecting your
          life, talk to a doctor.
        </p>
        <p className="lz-fine">
          Sources: Saunders et al. (2016), Consciousness and Cognition, lucid dream frequency across
          24 studies. Spoormaker and van den Bout (2006), Psychotherapy and Psychosomatics, lucid
          dreaming treatment for nightmares. Erlacher and Schredl (2010), The Sport Psychologist,
          practising a motor task in a lucid dream.
        </p>
        <Link className="lz-privacy" to="/privacy">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';

const APK_URL =
  'https://github.com/Parthgrow/lucid-dreaming-mobile/releases/latest/download/lucid-dreaming.apk';

const FEATURES = [
  {
    title: 'Dream journal',
    body: 'Capture a dream the moment you wake up: title, story, date and tags, all in one place.',
  },
  {
    title: 'Lucid tracking',
    body: 'Mark which dreams were lucid and watch your lucid-dream rate change over time.',
  },
  {
    title: 'Streaks & insights',
    body: 'Build a daily journaling habit with streaks and weekly stats that show your progress.',
  },
  {
    title: 'Meditation practice',
    body: 'Log meditation minutes alongside your dreams, since a calm mind is where lucidity starts.',
  },
];

const INSTALL_STEPS = [
  'Download the APK on your Android phone.',
  'Open it and, when asked, allow installs from your browser or Files app.',
  'If Play Protect warns about an unknown app, choose "Install anyway".',
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-hero">
        <h1>Lucid Dreaming</h1>
        <p className="landing-tagline">
          Remember more dreams. Notice when you are dreaming. Keep a journal that grows with your practice.
        </p>
        <a className="landing-download" href={APK_URL}>
          Download for Android
        </a>
        <span className="landing-meta">Free · Android 7.0+ · APK</span>
      </header>

      <section className="landing-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="landing-card">
            <h2>{f.title}</h2>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <section className="landing-install">
        <h2>How to install</h2>
        <ol>
          {INSTALL_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="landing-note">
          The app is distributed directly as an APK for now, which is why Android shows an
          unknown-app prompt.
        </p>
      </section>

      <footer className="landing-footer">
        <Link to="/privacy">Privacy Policy</Link>
      </footer>
    </div>
  );
}

const LAST_UPDATED = 'September 11, 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {LAST_UPDATED}</p>

      <p>
        Lucid Dreaming ("the App", "we", "us") is a dream journaling and lucid dreaming
        training app. This Privacy Policy explains what information we collect, how we
        use it, and the choices you have.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> your email address and password, used to
          create and authenticate your account (handled via Firebase Authentication).
        </li>
        <li>
          <strong>Dream journal content:</strong> dream entries you write, including
          titles, descriptions, dates, tags, and whether the dream was lucid.
        </li>
        <li>
          <strong>Training progress:</strong> data related to your reality-check /
          meditation practice, such as minutes completed and streaks.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To provide core app functionality: storing and displaying your dream journal and progress.</li>
        <li>To authenticate you and keep your account secure.</li>
        <li>To improve the app's features and reliability.</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>Data storage</h2>
      <p>
        Your data is stored securely using Google Firebase (Authentication and
        Firestore). We do not share your dream journal content with any third party
        except as required to operate the App (e.g., our cloud infrastructure
        provider) or as required by law.
      </p>

      <h2>Data retention and deletion</h2>
      <p>
        We retain your account and journal data for as long as your account is
        active. You may request deletion of your account and associated data at any
        time by contacting us at the email below.
      </p>

      <h2>Children's privacy</h2>
      <p>
        The App is not directed to children under 13, and we do not knowingly collect
        personal information from children under 13.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted
        on this page with an updated "Last updated" date.
      </p>

      <h2>Contact us</h2>
      <p>
        If you have any questions about this Privacy Policy or your data, contact us
        at{' '}
        <a href="mailto:anshchaurasiya239@gmail.com">anshchaurasiya239@gmail.com</a>.
      </p>
    </div>
  );
}

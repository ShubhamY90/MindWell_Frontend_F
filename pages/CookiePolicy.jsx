import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800 mt-[82px]">
      <h1 className="text-3xl font-bold mb-6">🍪 Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: July 16, 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Do We Use Cookies?</h2>
        <p>No — we do <strong>not</strong> use traditional cookies for tracking, analytics, or advertising purposes.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">What We Use Instead</h2>
        <p>
          We use <strong>local storage</strong> to store the following preferences locally on your device:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li><strong>Mute/Sound Settings:</strong> to remember your audio choices</li>
          <li><strong>Mood Test Results:</strong> to keep your recent mood state accessible</li>
        </ul>
        <p className="mt-2">This data is never sent to our servers unless you're logged in.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Authentication & Security</h2>
        <p>
          We use <strong>Firebase Authentication</strong> to manage secure logins. Tokens and session data are handled internally by Firebase. We do <strong>not</strong> store any authentication data in cookies or localStorage.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Control</h2>
        <p>
          You can clear your browser's local storage at any time via your browser settings. This may reset app preferences like sound and mood history.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Changes to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Any major changes will be announced within the app or on our website.
        </p>
      </section>

      <p className="mt-8">
        If you have any questions, contact us at <a href="mailto:aryabrata.swain.ug23@nsut.ac.in" className="text-blue-600 underline">support@mindwell.com</a>.
      </p>
    </div>
  );
};

export default CookiePolicy;

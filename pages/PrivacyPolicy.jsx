import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800 mt-24">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        <strong>Effective Date:</strong> 16 July 2025 <br />
        <strong>Last Updated:</strong> 16 July 2025
      </p>

      <p className="mb-6">
        Welcome to <strong>MindWell</strong>. Your privacy is extremely important to us, especially given the sensitive nature of mental health data. This Privacy Policy outlines how we securely collect, use, and protect your information when you engage with MindWell’s community features, AI chat, mood tests, and mental wellness resources.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-6">
        <li><strong>Personal Information:</strong> Name, email address, optional date of birth (for age verification), and other voluntary submissions.</li>
        <li><strong>Health and Wellness Data:</strong> Mood test responses (e.g., PHQ-9, GAD-7), AI chat history, journals, emotional logs, self-tracking, and resource engagement.</li>
        <li><strong>Community Interactions:</strong> Posts, comments, likes, messages, and follows within the community.</li>
        <li><strong>Usage and Device Data:</strong> IP address, browser type, operating system, device identifiers, platform activity logs.</li>
        <li><strong>Cookies and Tracking:</strong> Used to improve user experience, aid authentication, personalize features, and analyze platform usage.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">2. How We Use Your Information</h2>
      <p className="mb-4">
        All information is stored securely using modern encryption. We use your data to:
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>Deliver personalized features and recommendations</li>
        <li>Train and improve AI tools using aggregated or de-identified data</li>
        <li>Monitor performance and enhance security</li>
      </ul>
      <p className="mb-6 font-semibold">We do not sell or share your data with advertisers or unrelated third parties.</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">3. User Consent and Data Rights</h2>
      <ul className="list-disc list-inside mb-6">
        <li><strong>Access:</strong> Request a copy of your data</li>
        <li><strong>Edit:</strong> Update or correct your information</li>
        <li><strong>Deletion:</strong> Request deletion of your account and data</li>
        <li><strong>Opt-out:</strong> Disable non-essential tracking</li>
      </ul>
      <p className="mb-6">To exercise your rights, email us at <a href="mailto:mindwell319@gmail.com" className="text-purple-600 underline">mindwell319@gmail.com</a></p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">4. Data Protection and Security</h2>
      <ul className="list-disc list-inside mb-6">
        <li>Encryption in transit and at rest</li>
        <li>Restricted access by authorized personnel only</li>
        <li>Regular security audits and privacy training</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">5. Use of Data for Personalization and AI Training</h2>
      <p className="mb-6">
        Data is used in de-identified or aggregated form to improve features and AI tools. Personal information is never used for third-party purposes.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">6. Community Safety</h2>
      <p className="mb-2">Posts in the MindWell community are visible to other users. Use discretion when sharing personal details.</p>
      <p className="mb-6">While we moderate for safety, users are responsible for their own posts.</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">7. Data Sharing</h2>
      <ul className="list-disc list-inside mb-6">
        <li>With essential service providers (cloud storage, analytics)</li>
        <li>When required by law</li>
        <li>In anonymized form for research or platform improvements</li>
      </ul>
      <p className="mb-6">All partners are contractually obligated to uphold data privacy standards.</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">8. Emergency Protocols</h2>
      <p className="mb-6">
        If a user expresses intent to harm themselves or others, we may report this to authorities as per legal and ethical standards.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">9. Data Retention</h2>
      <p className="mb-6">
        Data is retained only as long as needed. Upon deletion requests, your data is erased securely, although encrypted backups may persist briefly.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">10. Minors’ Privacy</h2>
      <p className="mb-6">
        MindWell is not for users under 16 years (or the local legal age). Accounts found belonging to minors will be removed.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">11. International Data Transfers</h2>
      <p className="mb-6">
        Your data may be processed outside your country. We ensure compliance with regulations like the GDPR for all international transfers.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">12. Policy Updates</h2>
      <p className="mb-6">
        This policy may be updated periodically. We’ll notify you via email or in-app. The “Effective Date” will reflect the latest revision.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">13. Contact Us</h2>
      <p className="mb-2 font-medium">Privacy Officer</p>
      <p className="mb-1">MindWell</p>
      <p>Email: <a href="mailto:mindwell319@gmail.com" className="text-purple-600 underline">mindwell319@gmail.com</a></p>
    </div>
  );
};

export default PrivacyPolicy;
import React from "react";
import Head from "next/head";

const PrivacyPolicy: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Privacy Policy</title>
        <meta name="description" content="Privacy Policy for finance_stuff" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose max-w-none">
          <h2>1. Introduction</h2>
          <p>
            finance_stuff is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our service.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when
            you create an account, use our services, or communicate with us.
            This may include:
          </p>
          <ul>
            <li>Personal information (e.g., name, email address)</li>
            <li>
              Financial information (e.g., account balances, transaction
              history)
            </li>
            <li>Usage data (e.g., how you interact with our service)</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>
              Protect against, investigate, and prevent fraudulent or illegal
              activity
            </li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect the security of your personal information. However, please
            note that no method of transmission over the Internet or electronic
            storage is 100% secure.
          </p>

          <h2>5. Data Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We may share your
            information with third parties only in the following situations:
          </p>
          <ul>
            <li>With your consent</li>
            <li>
              To comply with laws or respond to lawful requests and legal
              process
            </li>
            <li>
              To protect the rights and property of finance_stuff, our agents,
              users, and others
            </li>
          </ul>

          <h2>6. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your information.
            You may also have additional rights depending on your jurisdiction.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at info AT stuff DOT finance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

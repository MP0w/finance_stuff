import React from "react";
import Head from "next/head";
import "../app/globals.css";

const TermsAndConditions: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Terms and Conditions</title>
        <meta
          name="description"
          content="Terms and Conditions for our service"
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <div className="prose max-w-none">
          <h2 className="mt-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be
            bound by the terms and provision of this agreement.
          </p>

          <h2 className="mt-4">2. Use of the Service</h2>
          <p>
            You agree to use the service for lawful purposes only and in a way
            that does not infringe the rights of, restrict or inhibit anyone
            else&apos;s use and enjoyment of the website.
          </p>

          <h2 className="mt-4">3. Intellectual Property</h2>
          <p>
            The content, organization, graphics, design, compilation, magnetic
            translation, digital conversion and other matters related to the
            Site are protected under applicable copyrights, trademarks and other
            proprietary rights.
          </p>

          <h2 className="mt-4">4. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis without any warranties of any kind, including
            that the website will operate error-free or that the website, its
            servers, or its content are free of computer viruses or similar
            contamination or destructive features.
          </p>

          <h2 className="mt-4">5. Limitation of Liability</h2>
          <p>
            We shall not be liable for any damages whatsoever, and in particular
            shall not be liable for any special, indirect, consequential, or
            incidental damages, or damages for lost profits, loss of revenue, or
            loss of use, arising out of or related to the website or the
            information contained in it.
          </p>

          <h2 className="mt-4">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Please check
            this page periodically for changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

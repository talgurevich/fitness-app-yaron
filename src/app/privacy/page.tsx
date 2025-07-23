// src/app/privacy/page.tsx
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">1.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Name and contact information when booking appointments</li>
                <li>Email address and phone number</li>
                <li>Appointment preferences and scheduling information</li>
                <li>Fitness goals and health information (when provided to trainers)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">1.2 Information from Google</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Basic profile information (name, email address, profile picture)</li>
                <li>Google Calendar access (to create training appointments)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">1.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Usage data and interaction with our platform</li>
                <li>Device information and IP address</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>To facilitate fitness training appointments and bookings</li>
                <li>To enable communication between trainers and clients</li>
                <li>To send appointment confirmations and reminders</li>
                <li>To create calendar events for scheduled sessions</li>
                <li>To improve our platform and user experience</li>
                <li>To provide customer support</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 With Trainers</h3>
              <p className="mb-4 text-gray-700">
                When you book an appointment, we share your contact information and appointment details 
                with the relevant trainer to facilitate your training session.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Service Providers</h3>
              <p className="mb-4 text-gray-700">
                We may share information with trusted third-party service providers who assist us in 
                operating our platform, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Email service providers (for appointment confirmations)</li>
                <li>Cloud hosting services</li>
                <li>Calendar integration services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Legal Requirements</h3>
              <p className="mb-4 text-gray-700">
                We may disclose your information if required by law or to protect our rights, 
                property, or safety of our users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="mb-4 text-gray-700">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                This includes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Secure cloud infrastructure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="mb-4 text-gray-700">
                We retain your personal information for as long as necessary to provide our services 
                and comply with legal obligations. Specifically:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Account information: Until you delete your account</li>
                <li>Appointment history: For 3 years after the last appointment</li>
                <li>Communication records: For 1 year after the last interaction</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="mb-4 text-gray-700">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your account and associated data</li>
                <li>Object to processing of your information</li>
                <li>Data portability (receive a copy of your data)</li>
                <li>Withdraw consent for optional data processing</li>
              </ul>
              <p className="mb-4 text-gray-700">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Google Integration</h2>
              <p className="mb-4 text-gray-700">
                Our platform integrates with Google services to provide enhanced functionality:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Google Sign-In: For secure authentication</li>
                <li>Google Calendar: To create and manage training appointments</li>
              </ul>
              <p className="mb-4 text-gray-700">
                Your use of Google services is also governed by Google's Privacy Policy, which can be 
                found at <a href="https://policies.google.com/privacy" className="text-blue-600 hover:text-blue-800 underline">https://policies.google.com/privacy</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="mb-4 text-gray-700">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information in accordance 
                with applicable privacy laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="mb-4 text-gray-700">
                Our platform is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you are a parent or guardian 
                and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="mb-4 text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Effective Date" above. 
                You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="mb-4 text-gray-700">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> privacy@trainer-booking.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Website:</strong> <a href="https://trainer-booking.com" className="text-blue-600 hover:text-blue-800 underline">https://trainer-booking.com</a>
                </p>
                <p className="text-gray-700">
                  <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 72 hours.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="mb-4 text-gray-700">
                This Privacy Policy is governed by and construed in accordance with applicable privacy laws. 
                Any disputes arising from this policy will be resolved in accordance with our Terms of Service.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// ── Modal Content ─────────────────────────────────────────────────────────────
const MODAL_CONTENT = {
  terms: {
    title: 'Terms & Conditions',
    body: `By using this platform, you agree to the following terms. Please read them carefully before placing any order.

1. Orders & Payment
All orders are confirmed only upon receipt of full payment. Prices are quoted in Philippine Peso (₱) and are subject to change without prior notice.
We accept payments via GCash, bank transfer, or other methods communicated at the time of order. Cash on delivery is not available.

2. Design Approval
Production begins only after the customer has approved the final design proof. Cache Prints is not responsible for errors (spelling, colors, layout) approved by the customer.
Design files submitted by the customer must not infringe on any third-party intellectual property rights.

3. Production & Turnaround
Standard turnaround is 7–14 business days after design approval. Rush orders are available at an additional cost. Delays caused by late design approvals or incomplete information are not our responsibility.

4. Returns & Refunds
Due to the custom nature of sublimation printing, we do not accept returns or issue refunds for completed orders unless the defect is caused by our production error (e.g., wrong size, print defect).
Defective items must be reported within 3 days of receipt with photo evidence.

5. Intellectual Property
All original designs produced by our graphic designer remain the property of Cache Prints unless otherwise agreed in writing. Customers retain rights to their own uploaded artwork.

6. Limitation of Liability
Cache Prints is not liable for indirect, incidental, or consequential damages arising from delayed orders, courier mishandling, or force majeure events.

7. Governing Law
These terms are governed by the laws of the Republic of the Philippines.`,
  },
  privacy: {
    title: 'Privacy Policy',
    body: `Cache Prints ("we", "us", "our") respects your privacy. This policy explains what personal information we collect, how we use it, and your rights regarding that information when you use our platform (PrintSync).

1. Information We Collect
When you create an account or place an order, we collect your name, email address, phone number, and delivery address.
We may also collect design files you upload, order history, and communication records (e.g., messages sent via Facebook or email).

2. How We Use Your Information
· To process and fulfill your orders
· To communicate order updates, shipping notifications, and support responses
· To improve our platform and services
· To send occasional promotional updates (you may opt out at any time)

3. Data Sharing
We do not sell your personal data. We may share information with courier partners (J&T, LBC, Lalamove) strictly for order delivery purposes.

4. Data Security
We use industry-standard measures to protect your data. However, no method of transmission over the internet is 100% secure. Use our platform at your own discretion.

5. Your Rights
You may request access to, correction of, or deletion of your personal data at any time by contacting us at cacheprints24@gmail.com.

6. Contact
For privacy concerns, email us at cacheprints24@gmail.com.`,
  },
  cookies: {
    title: 'Cookie Policy',
    body: `This platform uses cookies and similar technologies to provide a better experience. Here's what that means.

What Are Cookies?
Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and keep you logged in.

What Cookies We Use
Authentication cookies — Keep you logged into your account so you don't have to sign in every visit.
Session cookies — Store temporary data like your cart and customizer state. These are deleted when you close your browser.
Preference cookies — Remember settings like your selected product or design preferences.

What We Don't Do
We do not use third-party advertising cookies. We do not sell cookie data to anyone. We do not use cookies to track you across other websites.

Your Choices
You can disable cookies in your browser settings at any time. Note that disabling cookies may prevent you from logging in or using certain features of the platform.

Questions?
Email us at cacheprints24@gmail.com with any cookie-related questions.`,
  },
};

// ── Modal Component ───────────────────────────────────────────────────────────
function PolicyModal({ type, onClose }) {
  if (!type) return null;
  const { title, body } = MODAL_CONTENT[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg max-h-[80vh] flex flex-col rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#111]">
          <h3 className="text-[0.85rem] font-extrabold uppercase tracking-widest text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {body.split('\n').map((line, i) => {
            const isHeading = /^\d+\./.test(line.trim()) || ['What Are Cookies?', "What We Don't Do", 'Your Choices', 'Questions?', 'What Cookies We Use'].includes(line.trim());
            if (!line.trim()) return <div key={i} className="h-3" />;
            if (isHeading) return (
              <p key={i} className="text-[0.78rem] font-extrabold uppercase tracking-wider text-[#111] mt-4 mb-1">{line}</p>
            );
            return (
              <p key={i} className="text-[0.78rem] text-gray-600 leading-relaxed">{line}</p>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-[#111] text-white text-[0.72rem] font-bold uppercase tracking-widest py-2.5 hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Register Page ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [modalType, setModalType] = useState(null); // 'terms' | 'privacy' | 'cookies'

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreed) {
      toast.error('Please agree to the Terms, Privacy Policy, and Cookie Policy');
      return;
    }
    try {
      await register(email, password, name);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <PolicyModal type={modalType} onClose={() => setModalType(null)} />

      <div className="min-h-screen bg-light flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">Create Account</h2>
            <p className="text-gray-600">Join us to start designing</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg border border-border p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-border rounded-lg text-primary placeholder-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-border rounded-lg text-primary placeholder-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-border rounded-lg text-primary placeholder-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-border rounded-lg text-primary placeholder-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition"
                />
              </div>

              {/* ── Agreement Checkbox ── */}
              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-gray-900 cursor-pointer shrink-0"
                />
                <label htmlFor="agree" className="text-[0.78rem] text-gray-600 leading-relaxed cursor-pointer select-none">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setModalType('terms')}
                    className="text-secondary font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    Terms & Conditions
                  </button>
                  {', '}
                  <button
                    type="button"
                    onClick={() => setModalType('privacy')}
                    className="text-secondary font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    Privacy Policy
                  </button>
                  {', and '}
                  <button
                    type="button"
                    onClick={() => setModalType('cookies')}
                    className="text-secondary font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    Cookie Policy
                  </button>
                  .
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !agreed}
                className="w-full px-4 py-2.5 bg-primary hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-gray-600 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary hover:text-gray-600 font-medium transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
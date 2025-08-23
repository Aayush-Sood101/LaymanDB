"use client";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

/**
 * ContactForm.jsx
 *
 * Works with Vite, CRA, or Next.js (client component).
 *
 * Expected EmailJS template variables:
 *   {{user_name}}, {{user_email}}, {{subject}}, {{message}}
 * You can add more fields but ensure the `name` attributes match your template.
 *
 * Optional spam protection: there's a hidden honeypot field named `bot_field`.
 */
export default function ContactForm() {
  const formRef = useRef(null);
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formRef.current) return;

    // Basic honeypot check
    const formData = new FormData(formRef.current);
    if (formData.get("bot_field")) {
      setStatus({ loading: false, ok: false, msg: "Blocked by anti-spam." });
      return;
    }

    setStatus({ loading: true, ok: null, msg: "" });

    try {
      // Supports both Vite (import.meta.env) and Next.js/CRA (process.env)
      const serviceId =
        import.meta?.env?.VITE_EMAILJS_SERVICE_ID ||
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
        process.env.REACT_APP_EMAILJS_SERVICE_ID;

      const templateId =
        import.meta?.env?.VITE_EMAILJS_TEMPLATE_ID ||
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

      const publicKey =
        import.meta?.env?.VITE_EMAILJS_PUBLIC_KEY ||
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      await emailjs.sendForm(serviceId, templateId, formRef.current, { publicKey });

      setStatus({
        loading: false,
        ok: true,
        msg: "Message sent! We'll get back to you soon.",
      });
      formRef.current.reset();
    } catch (err) {
      console.error(err);
      setStatus({
        loading: false,
        ok: false,
        msg: err?.text || err?.message || "Failed to send. Please try again.",
      });
    }
  };

  return (
    <div className="shadow-xl border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="space-y-2 text-center pb-8 pt-8 px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Get in Touch</h2>
        <p className="text-base md:text-lg text-gray-300 font-medium">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      
      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

      {/* Form */}
      <div className="px-6 md:px-8 pb-8">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
          {/* Honeypot field for bots */}
          <div className="hidden">
            <label>
              Do not fill this field
              <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold text-base mb-2" htmlFor="user_name">
                Name
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="user_name"
                  name="user_name"
                  type="text"
                  required
                  className="w-full pl-11 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold text-base mb-2" htmlFor="user_email">
                Email
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.95a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="user_email"
                  name="user_email"
                  type="email"
                  required
                  className="w-full pl-11 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold text-base mb-2" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              className="w-full py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's this about?"
            />
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Help us categorize your message.
            </p>
          </div>

          <div>
            <label className="block text-white font-semibold text-base mb-2" htmlFor="message">
              Message
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full pl-11 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Write your message here…"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={status.loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {status.loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending…</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                      />
                    </svg>
                    <span>Send Message</span>
                  </div>

              )}
            </button>
          </div>

          {status.msg && (
            <div className={`p-4 rounded-xl border ${
              status.ok 
                ? "bg-green-500/10 border-green-500/20 text-green-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              <p className="text-sm font-medium">{status.msg}</p>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="flex flex-col space-y-2 text-center text-sm text-gray-400 border-t border-white/10 pt-6 pb-8 px-8 mt-4">
        <p className="text-base font-medium">We respect your privacy and will never share your information.</p>
        <p className="text-base font-medium">Typically, we respond within 24-48 business hours.</p>
      </div>
    </div>
  );
}
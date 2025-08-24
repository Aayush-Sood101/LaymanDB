"use client";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
// ✨ CHANGED: Added framer-motion for animated status messages
import { AnimatePresence, motion } from "framer-motion";

export default function ContactForm() {
  const formRef = useRef(null);
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    if (formData.get("bot_field")) {
      setStatus({ loading: false, ok: false, msg: "Blocked by anti-spam." });
      return;
    }

    setStatus({ loading: true, ok: null, msg: "" });

    try {
      const serviceId =
        import.meta?.env?.VITE_EMAILJS_SERVICE_ID ||
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId =
        import.meta?.env?.VITE_EMAILJS_TEMPLATE_ID ||
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey =
        import.meta?.env?.VITE_EMAILJS_PUBLIC_KEY ||
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      await emailjs.sendForm(serviceId, templateId, formRef.current, {
        publicKey,
      });

      setStatus({
        loading: false,
        ok: true,
        msg: "We will get back to you within 24 hours.",
      });
      formRef.current.reset();
    } catch (err) {
      console.error(err);
      setStatus({
        loading: false,
        ok: false,
        msg: err?.text || "Failed to send. Please try again.",
      });
    }
  };

  return (
    // ✨ CHANGED: Enhanced the glassmorphism effect
    <div className="shadow-2xl border border-white/10 bg-black/20 backdrop-blur-lg rounded-2xl overflow-hidden">
      <div className="space-y-2 text-center pb-8 pt-8 px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Get in Touch
        </h2>
        <p className="text-base md:text-lg text-gray-300 font-medium">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

      <div className="px-6 md:px-8 pb-8">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
          <div className="hidden">
            <label>
              Do not fill this field
              <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-white font-semibold text-base mb-2"
                htmlFor="user_name"
              >
                Name
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  id="user_name"
                  name="user_name"
                  type="text"
                  required
                  // ✨ CHANGED: Added smoother transitions and improved focus styles
                  className="w-full pl-11 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-white font-semibold text-base mb-2"
                htmlFor="user_email"
              >
                Email
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.95a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  id="user_email"
                  name="user_email"
                  type="email"
                  required
                  className="w-full pl-11 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              className="block text-white font-semibold text-base mb-2"
              htmlFor="subject"
            >
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              className="w-full py-3 px-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              placeholder="What's this about?"
            />
          </div>

          <div>
            <label
              className="block text-white font-semibold text-base mb-2"
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full py-3 px-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-300"
              placeholder="Write your message here…"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={status.loading}
              // ✨ CHANGED: Added interactive scaling effect on hover/press
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

          {/* ✨ CHANGED: Wrapped status message in AnimatePresence for smooth transitions */}
          <AnimatePresence>
            {status.msg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  status.ok
                    ? "bg-green-500/10 border-green-500/30 text-green-300"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {/* ✨ CHANGED: Added success/error icons */}
                {status.ok ? (
                  <svg
                    className="h-6 w-6 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <div>
                  <p className="font-bold text-base">
                    {status.ok ? "Message Sent!" : "An Error Occurred"}
                  </p>
                  <p className="text-sm font-medium">{status.msg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="flex flex-col space-y-2 text-center text-sm text-gray-400 border-t border-white/10 pt-6 pb-8 px-8 mt-8">
        <p className="text-base font-medium">
          We respect your privacy and will never share your information.
        </p>
      </div>
    </div>
  );
}
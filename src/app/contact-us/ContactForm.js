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
    <div className="max-w-xl mx-auto p-6 rounded-2xl shadow border bg-white text-gray-900">
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>

      <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
        {/* Honeypot field for bots */}
        <div className="hidden">
          <label>
            Do not fill this field
            <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="user_name">
            Name
          </label>
          <input
            id="user_name"
            name="user_name"
            type="text"
            required
            className="w-full border rounded-xl p-3"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="user_email">
            Email
          </label>
          <input
            id="user_email"
            name="user_email"
            type="email"
            required
            className="w-full border rounded-xl p-3"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            className="w-full border rounded-xl p-3"
            placeholder="What's this about?"
          />
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full border rounded-xl p-3"
            placeholder="Write your message here…"
          />
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full rounded-2xl p-3 font-medium bg-black text-white disabled:opacity-50"
        >
          {status.loading ? "Sending…" : "Send Message"}
        </button>

        {status.msg && (
          <p
            className={`text-sm mt-2 ${
              status.ok ? "text-green-600" : "text-red-600"
            }`}
          >
            {status.msg}
          </p>
        )}
      </form>

      <p className="text-xs text-gray-500 mt-4">
        This form uses EmailJS. Field names must match your EmailJS template.
      </p>
    </div>
  );
}

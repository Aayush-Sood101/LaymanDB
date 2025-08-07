"use client";

export default function Footer() {
  return (
    <footer className="py-2 border-t border-blue-100 bg-white/50 backdrop-blur-sm">
      <div className="w-full px-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Database Creator | Designed for database schema visualization</p>
      </div>
    </footer>
  );
}

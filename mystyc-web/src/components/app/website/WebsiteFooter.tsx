'use client';

export default function WebsiteFooter() {
  return (
    <footer className="flex w-full border-t bg-white px-4 py-3 text-center text-sm text-gray-500">
      <div className="flex w-full max-w-6xl mx-auto justify-center items-center">
        <span>© {new Date().getFullYear()} mystyc</span>
      </div>
    </footer>
  );
}

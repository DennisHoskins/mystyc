'use client';

export default function WebsiteFooter() {

  return (
    <footer className="flex w-full bg-gray-200 px-4 py-3 text-center text-sm text-gray-500">
      <div className="flex w-full max-w-content mx-auto justify-center items-center">
        <span>
          © {new Date().getFullYear()} mystyc
        </span>
      </div>
    </footer>
  );
}

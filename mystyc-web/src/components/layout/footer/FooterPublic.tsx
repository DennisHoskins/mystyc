'use client';

export default function FooterPublic() {
  return (
    <footer className="hidden md:flex w-full border-t bg-white px-4 py-3 text-center text-sm text-gray-500">
      <div className="flex w-full justify-center space-x-2">
        <span>© {new Date().getFullYear()} mystyc</span>
      </div>
    </footer>
  );
}

'use client';

export default function FooterPublic() {
  return (
    <footer className="w-full border-t bg-white px-4 py-3 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} mystyc
    </footer>
  );
}

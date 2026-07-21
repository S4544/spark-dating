export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="text-center">
        <div className="text-9xl font-black text-rose-500 mb-4">404</div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-block px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold rounded-2xl hover:opacity-90">
          🏠 Go Home
        </a>
      </div>
    </div>
  );
}

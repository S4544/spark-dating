export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">We'll send you a link to reset your password</p>
        </div>

        <form className="bg-white rounded-3xl shadow-lg p-8 space-y-4">
          <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none" />
          <button type="submit" className="w-full h-12 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold rounded-2xl hover:opacity-90 transition">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}

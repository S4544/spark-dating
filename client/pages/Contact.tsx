export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600 mb-8">Have a question? We'd love to hear from you.</p>
          
          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-rose-500" />
            <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-rose-500" />
            <textarea placeholder="Your message" rows={5} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-rose-500 resize-none"></textarea>
            <button type="submit" className="w-full h-12 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold rounded-2xl hover:opacity-90">Send Message</button>
          </form>
          
          <div className="mt-8 pt-8 border-t space-y-2 text-gray-600">
            <p>📧 support@sparkdate.app</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>🕐 Monday - Friday: 9am - 5pm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

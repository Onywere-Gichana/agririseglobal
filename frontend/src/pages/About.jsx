import { assetUrl } from '../services/api';

export default function About() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">About Agri Rise Global</h1>
          <p className="text-slate-600 leading-relaxed mb-6">Agri Rise Global shares practical, trusted information to help farmers, smallholders and agribusinesses thrive. We publish expert-led articles, product guides, and hands-on tips focused on sustainable farming, crop and livestock management, and accessible education for rural communities.</p>

          <h2 className="text-lg font-semibold text-slate-800 mt-4">Our mission</h2>
          <p className="text-slate-600 leading-relaxed">To empower farmers with clear, actionable knowledge and tools so they can increase yields, improve livelihoods, and adopt sustainable practices.</p>

          <h2 className="text-lg font-semibold text-slate-800 mt-4">What we offer</h2>
          <ul className="mt-2 space-y-2 text-slate-600">
            <li>• Practical how-to guides and crop management tips</li>
            <li>• Product reviews and sourcing for farming inputs</li>
            <li>• Educational resources and community-focused content</li>
            <li>• Optional WordPress import support for migrating content</li>
          </ul>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="/blog" className="inline-block px-5 py-3 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors">Read the blog</a>
            <a href="mailto:agririseglobal@gmail.com" className="inline-block px-5 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">Contact us</a>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
            <img src={assetUrl('/api/uploads/object/site/images/tractor-working-green-field.jpg')} alt="Fields" className="w-full h-56 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-800">Why we care</h3>
              <p className="text-slate-600 text-sm mt-2">Small changes in farming technique can make a big difference. We focus on clear advice that anyone can try.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-lg border border-emerald-100 shadow-sm">
            <h4 className="text-sm font-semibold text-emerald-700">Join our community</h4>
            <p className="text-slate-600 text-sm mt-2">Follow our latest posts and share feedback — your experience helps us create better content.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

import ReviewForm from '@/app/components/ReviewForm';
import Link from 'next/link';

export const metadata = {
  title: 'Customer Reviews - Yaddis',
  description: 'Share your feedback and see what other customers think about Yaddis',
};

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-lg text-white/90">
            We value your feedback. Share your experience with Yaddis and help us improve!
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Review Form */}
        <ReviewForm />

        {/* Info Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-brand-primary">
            <h3 className="text-lg font-bold text-brand-dark mb-2">Honest Feedback</h3>
            <p className="text-gray-600 text-sm">
              Share your genuine experience to help us serve you better
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-brand-secondary">
            <h3 className="text-lg font-bold text-brand-dark mb-2">Community Driven</h3>
            <p className="text-gray-600 text-sm">
              Your reviews help other customers make informed decisions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-brand-accent">
            <h3 className="text-lg font-bold text-brand-dark mb-2">Make a Difference</h3>
            <p className="text-gray-600 text-sm">
              We actively use your feedback to improve our services
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

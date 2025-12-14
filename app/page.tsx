import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import ProductCard from './components/ProductCard';
import ProductRecommendations from './components/ProductRecommendations';

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
  });
  
  const categories = await prisma.category.findMany({
    where: { section: 'FOOD' },
    orderBy: { titleEn: 'asc' },
  });

  return (
    <div>
      <section className="relative bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-dark text-white overflow-hidden min-h-[600px]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                Free Delivery on All Orders
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Best Prices in Town 
                <span className="block text-brand-accent">Free Delivery</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0">
                Fresh meals, cool treats, and everyday household essentials delivered right to your door.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link 
                  href="/category/food" 
                  className="group px-8 py-4 bg-white text-brand-dark rounded-xl font-bold hover:bg-brand-light transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center gap-2">
                    Browse Food Items
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
                <Link 
                  href="/category/plastics" 
                  className="px-8 py-4 bg-transparent border-2 border-white rounded-xl font-bold hover:bg-white hover:text-brand-dark transition-all"
                >
                  Household Items
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-extrabold mb-1">500+</div>
                  <div className="text-sm text-white/80 font-medium">Products</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-extrabold mb-1">1000+</div>
                  <div className="text-sm text-white/80 font-medium">Happy Customers</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-extrabold mb-1">24/7</div>
                  <div className="text-sm text-white/80 font-medium">Support</div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Image Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Large featured image */}
                <div className="col-span-2 relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80" 
                    alt="Pizza" 
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">Fresh Pizza & More</h3>
                  </div>
                </div>
                
                {/* Two smaller images */}
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80" 
                    alt="Ice Cream" 
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm font-bold text-white">Ice Cream</h3>
                  </div>
                </div>
                
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1585109649139-e9f5a5f5b4f9?auto=format&fit=crop&w=800&q=80" 
                    alt="Hot Meals" 
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm font-bold text-white">Hot Meals</h3>
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="hidden lg:block absolute -top-6 -right-6 bg-brand-accent text-brand-dark rounded-full p-6 shadow-2xl">
                <div className="text-center">
                  <div className="text-2xl font-bold">FREE</div>
                  <div className="text-xs font-medium">Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(245, 241, 237)" />
          </svg>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">AI Recommended For You</h2>
            <p className="text-sm text-brand-secondary">Personalized picks based on popular items</p>
          </div>
          <Link href="/category/food" className="text-sm text-brand-primary hover:text-brand-secondary transition-colors font-medium">View all →</Link>
        </div>
        <ProductRecommendations />
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold mb-4 text-brand-dark">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/category/ice-cream" className="group border border-brand-accent/20 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="aspect-square overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80" alt="Ice Cream" width={400} height={400} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="p-4 font-semibold text-center text-brand-dark">Ice Cream</div>
            </Link>
            <Link href="/category/cakes-pastries-pizza" className="group border border-brand-accent/20 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="aspect-square overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80" alt="Pizza" width={400} height={400} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="p-4 font-semibold text-center text-brand-dark">Cakes & Pizza</div>
            </Link>
            <Link href="/category/yogurt-juices" className="group border border-brand-accent/20 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="aspect-square overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80" alt="Yogurt" width={400} height={400} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="p-4 font-semibold text-center text-brand-dark">Yogurt & Juices</div>
            </Link>
            <Link href="/category/snacks" className="group border border-brand-accent/20 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="aspect-square overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80" alt="Snacks" width={400} height={400} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="p-4 font-semibold text-center text-brand-dark">Snacks</div>
            </Link>
            <Link href="/category/hot-meals" className="group border border-brand-accent/20 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="aspect-square overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1585109649139-e9f5a5f5b4f9?auto=format&fit=crop&w=800&q=80" alt="Hot Meals" width={400} height={400} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="p-4 font-semibold text-center text-brand-dark">Hot Meals</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-brand-primary text-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Special Offer: Keep Your Receipts!</h2>
          <p className="text-lg mb-6">Collect your receipts and bring them back to earn rewards and exclusive discounts!</p>
          <Link href="/rewards" className="inline-block px-8 py-3 bg-white text-brand-dark rounded-lg font-semibold hover:bg-brand-light transition-colors shadow-lg">
            Learn More About Rewards
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah M.', review: 'Amazing quality and prices! The free delivery is a game changer. Highly recommend!', rating: 5 },
            { name: 'John K.', review: 'Fast delivery and fresh products every time. My go-to store for groceries.', rating: 5 },
            { name: 'Mary W.', review: 'Great variety of both food and household items. Very convenient shopping experience!', rating: 5 }
          ].map((review, i) => (
            <div key={i} className="border border-brand-accent/20 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-sm text-brand-secondary mb-4 italic">"{review.review}"</p>
              <div className="font-semibold text-brand-dark">— {review.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-12 border-t border-b border-brand-accent/20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="mx-auto w-16 h-16 mb-3 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-brand-dark">Free Delivery</h3>
              <p className="text-sm text-brand-secondary">On all orders</p>
            </div>
            <div>
              <div className="mx-auto w-16 h-16 mb-3 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-brand-dark">Quality Assured</h3>
              <p className="text-sm text-brand-secondary">Fresh & authentic</p>
            </div>
            <div>
              <div className="mx-auto w-16 h-16 mb-3 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-brand-dark">Fast Service</h3>
              <p className="text-sm text-brand-secondary">Quick turnaround</p>
            </div>
            <div>
              <div className="mx-auto w-16 h-16 mb-3 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="font-semibold text-brand-dark">Rewards Program</h3>
              <p className="text-sm text-brand-secondary">Earn & save more</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

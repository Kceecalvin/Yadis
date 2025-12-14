export default function DebugImages() {
  const imgs = [
    '/images/logo.svg',
    '/images/food/chips-masala.svg',
    '/images/food/pilau.svg',
    '/images/food/biriyani.svg',
    '/images/food/viazi-karai.svg',
    '/images/food/chapo.svg',
    '/images/food/ice-cream.svg',
    '/images/food/pizza.svg',
    '/images/food/yogurt.svg',
    '/images/food/juice.svg',
    '/images/food/snacks.svg',
    '/images/plastics/bucket-20l.svg',
    '/images/plastics/chair.svg',
    '/images/plastics/broom.svg',
    '/images/plastics/spoons.svg',
    '/images/plastics/potty.svg',
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Images</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {imgs.map((src) => (
          <div key={src} className="border rounded p-2">
            <div className="text-xs break-all mb-2">{src}</div>
            <img src={src} alt={src} className="w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

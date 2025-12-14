export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <form className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Full Name" />
          <input className="w-full border rounded px-3 py-2" placeholder="Email" />
          <input className="w-full border rounded px-3 py-2" placeholder="Phone (M-Pesa)" />
          <input className="w-full border rounded px-3 py-2" placeholder="Address" />
          <select className="w-full border rounded px-3 py-2">
            <option>Delivery (Free)</option>
            <option>Pick-up</option>
          </select>
        </form>
        <div className="border rounded p-4">
          <div className="font-semibold mb-2">Order Summary</div>
          <div className="text-sm text-slate-600">Items, taxes, and free delivery.</div>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 rounded bg-black text-white">Pay with Stripe</button>
            <button className="px-4 py-2 rounded bg-green-600 text-white">Pay with M-Pesa</button>
          </div>
        </div>
      </div>
    </div>
  );
}

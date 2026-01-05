# Admin Page Access Guide

## How to Access the Admin Dashboard

### Direct URL
Simply navigate to the admin page in your browser:

**Development:**
```
http://localhost:3000/admin
```

**Production (when deployed):**
```
https://yourdomain.com/admin
```

---

## Admin Routes Available

### 1. Admin Home
**URL:** `/admin`
- Dashboard overview
- Quick links to manage products and categories

### 2. Manage Products
**URL:** `/admin/products`
- View all products in a table
- See product details (name, price, category, stock status)
- Links to edit or view each product

### 3. Add New Product
**URL:** `/admin/products/new`
- Form to add a new product
- Fields: Name, Description, Price, Image URL, Category, Stock status

### 4. Edit Product
**URL:** `/admin/products/[product-id]`
- Edit existing product details
- Update name, price, description, etc.

### 5. Manage Categories
**URL:** `/admin/categories`
- View all categories
- Manage product categories

---

## Quick Access Methods

### Method 1: Direct Navigation
Just type the URL directly in your browser:
```
http://localhost:3000/admin
```

### Method 2: Add Admin Link to Navigation (Recommended)

Update your main navigation to include an admin link. Edit `app/components/CartButton.tsx` or your main layout to add:

```tsx
<Link href="/admin" className="text-sm hover:underline">
  Admin
</Link>
```

### Method 3: Bookmark
Bookmark the admin page for quick access:
- Visit http://localhost:3000/admin
- Press `Ctrl+D` (Windows/Linux) or `Cmd+D` (Mac)
- Save as "Store Admin"

---

## Current Status

✅ **No Authentication Required** (Currently)
- Anyone can access the admin panel
- Good for development and testing
- **⚠️ IMPORTANT**: Add authentication before going live!

---

## Adding Authentication (Recommended for Production)

For production, you should protect the admin pages. Here's how:

### Option 1: Simple Password Protection
```tsx
// app/admin/layout.tsx
'use client';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === 'your-admin-password') {
      setAuthenticated(true);
      localStorage.setItem('admin-auth', 'true');
    } else {
      alert('Wrong password!');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin-auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border rounded px-3 py-2 mb-4"
            placeholder="Enter admin password"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Option 2: NextAuth (Production-Ready)
See the multi-tenant documentation for full NextAuth implementation.

---

## Testing the Admin Panel

1. **Start your development server:**
   ```bash
   cd ecommerce-store
   pnpm dev
   ```

2. **Open your browser:**
   Navigate to http://localhost:3000/admin

3. **Test the features:**
   - View products list
   - Click "Manage Products"
   - Try adding a new product
   - Edit an existing product
   - View categories

---

## Admin Panel Features

### Current Features
✅ View all products
✅ Add new products
✅ Edit existing products
✅ Manage categories
✅ See product stock status
✅ View product images

### Coming Soon (Optional)
- 📊 Sales dashboard
- 📦 Order management
- 👥 Customer management
- 📈 Analytics and reports
- 🎨 Theme customization
- ⚙️ Store settings

---

## Troubleshooting

### Problem: "Cannot access /admin"
**Solution:** Make sure your server is running:
```bash
cd ecommerce-store
pnpm dev
```

### Problem: "Page not found"
**Solution:** Check you're using the correct URL:
- ✅ http://localhost:3000/admin
- ❌ http://localhost:3000/admin/

### Problem: "Products not showing"
**Solution:** Make sure database is seeded:
```bash
pnpm exec prisma db push
pnpm exec tsx prisma/seed.ts
```

### Problem: "Can't edit products"
**Solution:** Check that Prisma client is generated:
```bash
pnpm exec prisma generate
```

---

## Security Tips (For Production)

1. **Add Authentication**
   - Use NextAuth or similar
   - Require login to access /admin
   - Use strong passwords

2. **Restrict Access**
   - Only admin users should access /admin
   - Use role-based access control
   - Log admin actions

3. **Use HTTPS**
   - Never use admin panel over HTTP
   - Always use SSL/TLS in production

4. **Monitor Access**
   - Log who accesses admin panel
   - Track changes made
   - Set up alerts for suspicious activity

5. **Regular Backups**
   - Backup database before major changes
   - Test restore procedures
   - Keep multiple backup copies

---

## Quick Reference

| Action | URL | Description |
|--------|-----|-------------|
| View Dashboard | `/admin` | Admin home page |
| Manage Products | `/admin/products` | List all products |
| Add Product | `/admin/products/new` | Create new product |
| Edit Product | `/admin/products/[id]` | Edit existing product |
| Manage Categories | `/admin/categories` | View/edit categories |

---

## Need Help?

If you encounter any issues:
1. Check server is running (`pnpm dev`)
2. Check browser console for errors (F12)
3. Verify database is accessible
4. Try clearing browser cache
5. Restart the development server

---

**Your admin panel is ready to use!** 🎉

Just navigate to http://localhost:3000/admin to get started.

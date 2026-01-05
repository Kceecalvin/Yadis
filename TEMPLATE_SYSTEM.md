# Multi-Template System for Vendors
## Each Vendor Chooses Their Own Design

---

## 🎨 TEMPLATE SYSTEM OVERVIEW

Instead of just changing colors, each vendor can:
1. **Choose a template** (Classic, Modern, Minimalist, Bold, etc.)
2. **Customize colors** (primary, secondary, accent)
3. **Customize layout** (grid style, card design, spacing)
4. **Add branding** (logo, banner, fonts)

Like Shopify themes but for each vendor!

---

## 📋 AVAILABLE TEMPLATES

### Template 1: "Classic Brown" (Current)
**Style:** Traditional, warm, trustworthy
**Best for:** Food stores, general stores
**Features:**
- Brown color scheme
- Large product images
- Simple card layout
- Traditional fonts
- Warm gradients

### Template 2: "Modern Minimalist"
**Style:** Clean, minimal, spacious
**Best for:** Tech stores, fashion, electronics
**Features:**
- White/black base with accent colors
- Lots of white space
- Thin borders
- Modern sans-serif fonts
- Subtle shadows

### Template 3: "Vibrant Restaurant"
**Style:** Colorful, appetizing, energetic
**Best for:** Restaurants, food delivery
**Features:**
- Bright colors (red, orange, yellow)
- Large food images
- Menu-style layout
- Bold typography
- Gradient overlays

### Template 4: "Medical/Professional"
**Style:** Clean, trustworthy, professional
**Best for:** Pharmacies, medical supplies
**Features:**
- Blue/white color scheme
- Professional layout
- Trust badges
- Clear product info
- Simple navigation

### Template 5: "Fashion/Boutique"
**Style:** Elegant, stylish, sophisticated
**Best for:** Clothing, accessories, beauty
**Features:**
- Black/white with gold accents
- Large product photos
- Magazine-style layout
- Elegant fonts
- Hover animations

### Template 6: "Hardware/Industrial"
**Style:** Strong, practical, organized
**Best for:** Hardware, tools, construction
**Features:**
- Gray/orange industrial colors
- Grid layout
- Detailed product specs
- Practical design
- Bold headers

---

## 🛠️ CUSTOMIZATION OPTIONS

### Per Template, Vendors Can Customize:

#### 1. Colors
- Primary color
- Secondary color
- Accent color
- Text color
- Background color

#### 2. Typography
- Heading font (3 options)
- Body font (3 options)
- Font size (small, medium, large)

#### 3. Layout
- Product grid: 2, 3, or 4 columns
- Card style: Rounded, square, or pill
- Image shape: Square, rounded, circle
- Spacing: Compact, normal, spacious

#### 4. Branding
- Logo upload
- Banner image
- Store tagline
- Custom header text

#### 5. Features (On/Off)
- Show product ratings
- Show stock status
- Show category filters
- Show search bar
- Show bestsellers section

---

## 💻 TECHNICAL IMPLEMENTATION

### Database Schema Addition:

```prisma
model Vendor {
  // ... existing fields ...
  
  // Template & Customization
  templateId      String   @default("classic-brown")
  
  // Colors (customizable per template)
  primaryColor    String   @default("#8B4513")
  secondaryColor  String   @default("#A0522D")
  accentColor     String   @default("#D2691E")
  backgroundColor String   @default("#F5F1ED")
  textColor       String   @default("#3E2F23")
  
  // Typography
  headingFont     String   @default("Inter")
  bodyFont        String   @default("Inter")
  fontSize        String   @default("medium")
  
  // Layout preferences
  productColumns  Int      @default(4)
  cardStyle       String   @default("rounded")
  imageShape      String   @default("rounded")
  spacing         String   @default("normal")
  
  // Feature toggles
  showRatings     Boolean  @default(true)
  showStock       Boolean  @default(true)
  showCategories  Boolean  @default(true)
  showSearch      Boolean  @default(true)
  showBestsellers Boolean  @default(false)
}
```

### Template Components:

```typescript
// app/templates/classic-brown/ShopLayout.tsx
export function ClassicBrownTemplate({ vendor, products }) {
  return (
    <div className="classic-brown-theme">
      <ShopHeader vendor={vendor} />
      <ProductGrid products={products} columns={vendor.productColumns} />
      <ShopFooter vendor={vendor} />
    </div>
  );
}

// app/templates/modern-minimal/ShopLayout.tsx
export function ModernMinimalTemplate({ vendor, products }) {
  return (
    <div className="modern-minimal-theme">
      <MinimalHeader vendor={vendor} />
      <MinimalProductGrid products={products} />
      <MinimalFooter vendor={vendor} />
    </div>
  );
}

// app/templates/vibrant-restaurant/ShopLayout.tsx
export function VibrantRestaurantTemplate({ vendor, products }) {
  return (
    <div className="vibrant-restaurant-theme">
      <RestaurantHeader vendor={vendor} />
      <MenuLayout products={products} />
      <RestaurantFooter vendor={vendor} />
    </div>
  );
}
```

### Template Loader:

```typescript
// app/shop/[slug]/page.tsx
const templates = {
  'classic-brown': ClassicBrownTemplate,
  'modern-minimal': ModernMinimalTemplate,
  'vibrant-restaurant': VibrantRestaurantTemplate,
  'medical-professional': MedicalProfessionalTemplate,
  'fashion-boutique': FashionBoutiqueTemplate,
  'hardware-industrial': HardwareIndustrialTemplate,
};

const TemplateComponent = templates[vendor.templateId] || templates['classic-brown'];

return <TemplateComponent vendor={vendor} products={products} />;
```

---

## 🎨 VENDOR CUSTOMIZATION UI

### In Vendor Dashboard:

```
╔═══════════════════════════════════════════════╗
║  ⚙️ Store Appearance Settings                ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Choose Template:                             ║
║  ┌────────┐ ┌────────┐ ┌────────┐            ║
║  │[●]     │ │[ ]     │ │[ ]     │            ║
║  │Classic │ │Modern  │ │Vibrant │            ║
║  │Brown   │ │Minimal │ │Rest.   │            ║
║  └────────┘ └────────┘ └────────┘            ║
║                                               ║
║  Customize Colors:                            ║
║  Primary:   [🎨 #8B4513]                     ║
║  Secondary: [🎨 #A0522D]                     ║
║  Accent:    [🎨 #D2691E]                     ║
║                                               ║
║  Layout Options:                              ║
║  Product Columns: [●] 3  [ ] 4  [ ] 5        ║
║  Card Style:     [●] Rounded  [ ] Square     ║
║  Spacing:        [●] Normal   [ ] Compact    ║
║                                               ║
║  [Preview Template] [Save Changes]           ║
╚═══════════════════════════════════════════════╝
```

---

## 🔄 MIGRATION PLAN

### Phase 1: Fix Current Issue (Now)
- Fix ProductCard price error
- Get current shop working

### Phase 2: Create Template System (Week 1)
- Build 3 initial templates
- Create template selector
- Add vendor customization UI

### Phase 3: Advanced Customization (Week 2)
- Add more templates
- Font customization
- Layout options
- Preview feature

---

## 📊 TEMPLATE PRICING

You can monetize templates:

**Basic Plan (FREE):**
- 1 template (Classic)
- Basic customization (colors only)

**Pro Plan (KES 5,000/month):**
- 6 templates
- Full customization
- Custom fonts
- Advanced layouts

**Premium Plan (KES 12,000/month):**
- All templates
- Custom CSS
- Developer API
- Dedicated support

---

## 🎯 IMMEDIATE FIX

Let me fix the ProductCard error first, then we can build the template system.

EOF

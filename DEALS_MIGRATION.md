# Deals to Badges/Sales Migration Guide

## What Changed

### Old System (Deals Enum)
```prisma
enum Deals {
  BUY_1_GET_1
  FIFTY_OFF
  TWENTY_OFF
  NEW
}

model Product {
  deals Deals[]
}
```

**Problems:**
- Inflexible discount percentages
- Mixed badges with discounts
- No actual price calculation
- No sale expiration dates

### New System (Badge + SalePrice)
```prisma
enum Badge {
  NEW
  HOT
  LIMITED
  BESTSELLER
  TRENDING
  SALE
}

model Product {
  price       Int      // Original price
  salePrice   Int?     // Discounted price (if on sale)
  badges      Badge[]  // Display badges
  saleEndDate DateTime? // Optional sale expiration
}
```

**Benefits:**
- ✅ Flexible discount amounts (any percentage)
- ✅ Separate concerns: badges vs pricing
- ✅ Actual price calculation
- ✅ Time-based sales with expiration
- ✅ Clean data model

---

## Migration Progress

### ✅ COMPLETED

1. **Prisma Schema** (`/prisma/schema.prisma`)
   - Added `salePrice`, `badges`, `saleEndDate` fields
   - Created `Badge` enum
   - Deprecated `Deals` enum (commented out)

2. **Prisma Client**
   - Generated with `npx prisma generate`

3. **ProductViewInfo Interface** (`/app/View/product/ProductList.tsx`)
   - Updated to use `Badge[]` instead of `Deals[]`
   - Added `salePrice` and `saleEndDate` fields

4. **ProductDetail Component** (`/app/View/product/[id]/ProductDetail.tsx`)
   - Replaced deal display with badge display
   - Added sale price display with strikethrough original price
   - Auto-calculates discount percentage
   - Shows "X% OFF" badge when on sale
   - Checks if sale is still active based on `saleEndDate`

5. **ProductDisplay Component** (`/app/View/product/ProductDisplay.tsx`)
   - Shows sale price with strikethrough regular price on product cards
   - Displays primary badge or discount percentage on image
   - Calculates and displays discount dynamically

6. **ProductService** (`/app/services/ProductService.ts`)
   - Updated `getProductsViewList` to return new fields
   - Updated `createProduct` to use `salePrice`, `badges`, `saleEndDate`
   - Updated `updateProduct` to use new fields
   - Removed `deals` field handling

7. **Product Validation** (`/app/busniessLogic/Product/productValidation.tsx`)
   - Replaced `Deals` enum with `Badge` enum
   - Added `salePrice` validation (must be less than regular price)
   - Added `badges` array validation
   - Added `saleEndDate` validation (optional)

8. **API Routes**
   - All routes automatically updated (they pass through ProductService)
   - `/api/view/product` - Returns new fields
   - `/api/view/product/[id]` - Returns new fields
   - `/api/admin/product` - Accepts new fields
   - `/api/admin/product/[id]` - Accepts new fields

---

## 🚧 TODO: Remaining Tasks

### 1. Update ProductDisplay Component
**File:** `/app/View/product/ProductDisplay.tsx`

**Changes Needed:**
- Replace `Deals` with `Badge`
- Show sale price if available
- Display discount percentage

**Current Code:**
```typescript
// Uses deals: Deals[]
```

**New Code Pattern:**
```typescript
import Badge = $Enums.Badge;

const displayPrice = product.salePrice || product.price;
const onSale = product.salePrice &&
  (!product.saleEndDate || new Date(product.saleEndDate) > new Date());
const discountPercent = calculateDiscountPercent(product.price, product.salePrice);
```

---

### 2. Update API Routes

**Files to Update:**
- `/app/api/view/product/route.tsx` (GET all products)
- `/app/api/view/product/[id]/route.tsx` (GET single product)
- `/app/api/admin/product/route.tsx` (POST create product)
- `/app/api/admin/product/[id]/route.tsx` (PATCH update product)

**Changes Needed:**
- Remove `deals` field from responses
- Add `salePrice`, `badges`, `saleEndDate` to responses
- Update ProductService calls

---

### 3. Update ProductService

**File:** `/app/services/ProductService.ts`

**Changes Needed:**
- Update `createProduct` to accept `salePrice`, `badges`, `saleEndDate`
- Update `updateProduct` to handle new fields
- Update all return types to include new fields
- Remove `deals` field handling

---

### 4. Update Validation Schemas

**File:** `/app/busniessLogic/Product/productValidation.tsx` (or similar)

**Changes Needed:**
- Remove `deals` validation
- Add `salePrice` validation (optional, must be less than `price`)
- Add `badges` validation (array of Badge enum)
- Add `saleEndDate` validation (optional DateTime, must be future date)

**Example Schema:**
```typescript
const productSchema = z.object({
  price: z.number().positive(),
  salePrice: z.number().positive().optional()
    .refine((val, ctx) => {
      if (val && val >= ctx.parent.price) {
        return false; // Sale price must be less than regular price
      }
      return true;
    }, "Sale price must be less than regular price"),
  badges: z.array(z.nativeEnum(Badge)).optional(),
  saleEndDate: z.date().optional(),
});
```

---

### 5. Update Admin Forms

**Files:**
- Product creation form
- Product edit form

**Changes Needed:**
- Remove "Deals" multi-select field
- Add "Sale Price" number input (optional)
- Add "Badges" multi-select (Badge enum values)
- Add "Sale End Date" date picker (optional)

---

## Helper Functions (Reusable)

Create a shared utility file: `/app/Util/productPricing.ts`

```typescript
import {Badge} from "@prisma/client";

export function calculateDiscountPercent(
  price: number,
  salePrice: number | null
): number {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function isSaleActive(saleEndDate: Date | null): boolean {
  if (!saleEndDate) return true; // No end date = perpetual sale
  return new Date(saleEndDate) > new Date();
}

export function getDisplayPrice(
  price: number,
  salePrice: number | null,
  saleEndDate: Date | null
): number {
  const onSale = salePrice && isSaleActive(saleEndDate);
  return onSale ? salePrice : price;
}

export function getBadgeColor(badge: Badge): string {
  switch (badge) {
    case Badge.NEW: return "badge-primary";
    case Badge.HOT: return "badge-error";
    case Badge.SALE: return "badge-warning";
    case Badge.LIMITED: return "badge-info";
    case Badge.BESTSELLER: return "badge-success";
    case Badge.TRENDING: return "badge-secondary";
    default: return "badge-neutral";
  }
}
```

---

## Database Migration

### If You Have Existing Products with Deals:

Run a migration script to convert old `deals` to new system:

```typescript
// migration-script.ts
import {prisma} from "@/prisma/client";
import {Badge} from "@prisma/client";

async function migrateDealsToNewSystem() {
  const products = await prisma.product.findMany();

  for (const product of products) {
    const badges: Badge[] = [];
    let salePrice: number | null = null;

    // Convert old deals to new system
    if (product.deals.includes("NEW")) {
      badges.push(Badge.NEW);
    }
    if (product.deals.includes("BUY_1_GET_1")) {
      badges.push(Badge.HOT);
    }

    // Convert discount deals to sale price
    if (product.deals.includes("FIFTY_OFF")) {
      salePrice = Math.round(product.price * 0.5);
      badges.push(Badge.SALE);
    } else if (product.deals.includes("SEVENTY_OFF")) {
      salePrice = Math.round(product.price * 0.3);
      badges.push(Badge.SALE);
    } else if (product.deals.includes("TWENTY_OFF")) {
      salePrice = Math.round(product.price * 0.8);
      badges.push(Badge.SALE);
    }

    // Update product
    await prisma.product.update({
      where: {id: product.id},
      data: {
        salePrice,
        badges,
        saleEndDate: null, // Set manually if needed
      }
    });
  }

  console.log(`Migrated ${products.length} products`);
}

// Run: npx ts-node migration-script.ts
migrateDealsToNewSystem();
```

---

## Testing Checklist

After completing all migrations:

- [ ] Create a product with sale price - verify discount displays correctly
- [ ] Create a product with badges - verify badges display correctly
- [ ] Create a product with expired sale - verify regular price shows
- [ ] Add product to cart - verify cart uses correct price
- [ ] Test admin product creation form
- [ ] Test admin product edit form
- [ ] Test API endpoints return new fields
- [ ] Verify old `deals` field is removed from responses

---

## Rollback Plan

If you need to rollback:

1. Restore old Prisma schema
2. Run `npx prisma generate`
3. Git revert component changes
4. Restore API routes

**Backup Command:**
```bash
# Before migration
git checkout -b backup-before-deals-migration
git add .
git commit -m "Backup before deals migration"
```

---

## Next Steps

1. Complete ProductDisplay component update
2. Update all API routes
3. Update ProductService
4. Update validation schemas
5. Update admin forms
6. Run database migration script
7. Test thoroughly
8. Remove old `Deals` enum from schema
9. Deploy to production

---

## Questions?

Refer to completed files for patterns:
- `/app/View/product/[id]/ProductDetail.tsx` - Badge and price display
- `/prisma/schema.prisma` - New schema structure
- `/app/View/product/ProductList.tsx` - Updated ProductViewInfo interface
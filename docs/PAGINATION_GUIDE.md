# Product Pagination Guide

## Overview

The product API now supports pagination to efficiently load products in batches, preventing database exhaustion and improving performance.

## API Endpoint

**GET** `/api/admin/product`

### Query Parameters

- `page` (optional): Page number, default = 1
- `limit` (optional): Items per page, default = 50, max = 100

### Response Format

```json
{
  "products": [...],
  "total": 100,
  "page": 1,
  "limit": 50,
  "totalPages": 2
}
```

### Examples

```bash
# Get first page (50 products)
GET /api/admin/product

# Get second page
GET /api/admin/product?page=2

# Get 20 products per page
GET /api/admin/product?limit=20

# Get page 3 with 25 products
GET /api/admin/product?page=3&limit=25
```

## React Usage

### Basic Usage (First 50 products)

```tsx
import { useGetAllProducts } from '@/app/busniessLogic/Product/productManager';

function ProductList() {
    const { data, isLoading, error } = useGetAllProducts();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading products</div>;

    return (
        <div>
            <p>Total: {data.total} products</p>
            <p>Page {data.page} of {data.totalPages}</p>
            {data.products.map(product => (
                <div key={product.id}>{product.name}</div>
            ))}
        </div>
    );
}
```

### With Pagination Controls

```tsx
import { useState } from 'react';
import { useGetAllProducts } from '@/app/busniessLogic/Product/productManager';

function PaginatedProductList() {
    const [page, setPage] = useState(1);
    const limit = 25;

    const { data, isLoading, error } = useGetAllProducts({ page, limit });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading products</div>;

    return (
        <div>
            <h1>Products ({data.total} total)</h1>

            {/* Product list */}
            <div className="grid grid-cols-3 gap-4">
                {data.products.map(product => (
                    <div key={product.id} className="card">
                        <h2>{product.name}</h2>
                        <p>${product.price / 100}</p>
                    </div>
                ))}
            </div>

            {/* Pagination controls */}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn"
                >
                    Previous
                </button>

                <span className="flex items-center">
                    Page {data.page} of {data.totalPages}
                </span>

                <button
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="btn"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
```

### With Page Size Selector

```tsx
function AdvancedProductList() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);

    const { data, isLoading } = useGetAllProducts({ page, limit });

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1); // Reset to first page when changing limit
    };

    return (
        <div>
            {/* Page size selector */}
            <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="select"
            >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
            </select>

            {/* Products and pagination... */}
        </div>
    );
}
```

## Benefits

- **Performance**: Only fetches needed data, not all products at once
- **Database efficiency**: Reduces load on MongoDB with `skip` and `take`
- **Better UX**: Faster page loads, smoother navigation
- **Scalability**: Handles thousands of products without issues

## Cache Behavior

- Results are cached for 5 minutes (staleTime)
- Each page/limit combination has its own cache entry
- Cache key format: `['products', page, limit]`

## Notes

- Default limit: 50 products
- Maximum limit: 100 products (server enforced)
- Products are sorted by `createdAt` in descending order (newest first)
- Invalid pagination parameters return 400 error
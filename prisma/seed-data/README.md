# Database Seed Data

This directory contains JSON files with sample data for seeding the MongoDB database.

## Files

- `products.json` - Sample product data (6 products: curtains, hardware, and pillows)

## Running the Seed Script

To populate your database with sample data, run:

```bash
npm run db:seed
```

Or alternatively:

```bash
npx prisma db seed
```

## Seed Script Features

- **Idempotent**: Running the script multiple times won't create duplicates. It checks for existing products by their `code` field
- **Auto-creates admin user**: If no ROOT user exists, it creates a seed admin user
- **Error handling**: Shows clear messages for successful and failed insertions

## Product Data Structure

Each product includes:
- Basic info: name, code, type (CURTAIN/HARDWARE/PILLOW), price, inventory
- Images: mainImagePath and imageColorInfo with secondary images
- Descriptions: detailDescription and careDescription
- Optional fields: deals, rating, isCustomizable
- System fields: createdBy (automatically filled), isOutOfStock, isDetailFilled

## Modifying Seed Data

To add more products:

1. Edit `products.json` and add new product objects
2. Make sure each product has a unique `code`
3. Follow the existing data structure
4. Run `npm run db:seed` to insert the new products

## Notes

- Prices are in cents (e.g., 12999 = $129.99)
- Image paths use placeholders (/placeholder/...) - replace with actual image paths
- The seed script uses the first ROOT user found or creates one for the `createdBy` field
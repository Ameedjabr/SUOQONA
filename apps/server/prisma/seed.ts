/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Admin User ────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@souqona.com" },
    update: {},
    create: {
      email: "admin@souqona.com",
      passwordHash: adminPassword,
      fullName: "Souqona Admin",
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin user: ${admin.email} (password: Admin@123)`);

  // ── Customer User ─────────────────────────────────
  const customerPassword = await bcrypt.hash("Customer@123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      passwordHash: customerPassword,
      fullName: "Test Customer",
      role: "CUSTOMER",
    },
  });
  console.log(`✓ Customer user: ${customer.email} (password: Customer@123)`);

  // ── Categories ────────────────────────────────────
  console.log("\n📁 Creating categories...");

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });

  const phones = await prisma.category.upsert({
    where: { slug: "phones" },
    update: {},
    create: { name: "Phones", slug: "phones", parentId: electronics.id },
  });

  const laptops = await prisma.category.upsert({
    where: { slug: "laptops" },
    update: {},
    create: { name: "Laptops", slug: "laptops", parentId: electronics.id },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories", parentId: electronics.id },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: { name: "Clothing", slug: "clothing" },
  });

  const mensClothing = await prisma.category.upsert({
    where: { slug: "mens-clothing" },
    update: {},
    create: { name: "Men's Clothing", slug: "mens-clothing", parentId: clothing.id },
  });

  const womensClothing = await prisma.category.upsert({
    where: { slug: "womens-clothing" },
    update: {},
    create: { name: "Women's Clothing", slug: "womens-clothing", parentId: clothing.id },
  });

  const home = await prisma.category.upsert({
    where: { slug: "home" },
    update: {},
    create: { name: "Home & Kitchen", slug: "home" },
  });

  const furniture = await prisma.category.upsert({
    where: { slug: "furniture" },
    update: {},
    create: { name: "Furniture", slug: "furniture", parentId: home.id },
  });

  const kitchen = await prisma.category.upsert({
    where: { slug: "kitchen" },
    update: {},
    create: { name: "Kitchen", slug: "kitchen", parentId: home.id },
  });

  console.log("✓ Categories created");

  // ── Products ──────────────────────────────────────
  console.log("\n📦 Creating products...");

  // Product 1: iPhone
  const iphone = await prisma.product.upsert({
    where: { slug: "iphone-15-pro" },
    update: {},
    create: {
      title: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description: "The latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features include Dynamic Island, Always-On display, and USB-C connectivity.",
      brand: "Apple",
      priceCents: 449900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: iphone.id, categoryId: phones.id } },
    update: {},
    create: { productId: iphone.id, categoryId: phones.id },
  });

  const iphoneVariant128 = await prisma.productVariant.upsert({
    where: { sku: "IPHONE15PRO-128-BLK" },
    update: {},
    create: {
      productId: iphone.id,
      sku: "IPHONE15PRO-128-BLK",
      priceCents: 449900,
      optionValues: { storage: "128GB", color: "Black Titanium" },
    },
  });

  const iphoneVariant256 = await prisma.productVariant.upsert({
    where: { sku: "IPHONE15PRO-256-BLU" },
    update: {},
    create: {
      productId: iphone.id,
      sku: "IPHONE15PRO-256-BLU",
      priceCents: 489900,
      optionValues: { storage: "256GB", color: "Blue Titanium" },
    },
  });

  // Product 2: Samsung Galaxy
  const samsung = await prisma.product.upsert({
    where: { slug: "samsung-galaxy-s24-ultra" },
    update: {},
    create: {
      title: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Premium Android smartphone with S Pen, 200MP camera, and Galaxy AI features. Titanium frame with Gorilla Glass.",
      brand: "Samsung",
      priceCents: 469900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: samsung.id, categoryId: phones.id } },
    update: {},
    create: { productId: samsung.id, categoryId: phones.id },
  });

  const samsungVariant = await prisma.productVariant.upsert({
    where: { sku: "GALAXY-S24U-256-BLK" },
    update: {},
    create: {
      productId: samsung.id,
      sku: "GALAXY-S24U-256-BLK",
      priceCents: 469900,
      optionValues: { storage: "256GB", color: "Titanium Black" },
    },
  });

  // Product 3: MacBook Pro
  const macbook = await prisma.product.upsert({
    where: { slug: "macbook-pro-14" },
    update: {},
    create: {
      title: "MacBook Pro 14-inch M3 Pro",
      slug: "macbook-pro-14",
      description: "Powerful laptop with M3 Pro chip, stunning Liquid Retina XDR display, up to 18 hours battery life. Perfect for professionals and creators.",
      brand: "Apple",
      priceCents: 799900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: macbook.id, categoryId: laptops.id } },
    update: {},
    create: { productId: macbook.id, categoryId: laptops.id },
  });

  const macbookVariant = await prisma.productVariant.upsert({
    where: { sku: "MBP14-M3PRO-512-SLV" },
    update: {},
    create: {
      productId: macbook.id,
      sku: "MBP14-M3PRO-512-SLV",
      priceCents: 799900,
      optionValues: { storage: "512GB SSD", ram: "18GB", color: "Silver" },
    },
  });

  // Product 4: Wireless Headphones
  const airpods = await prisma.product.upsert({
    where: { slug: "airpods-pro-2" },
    update: {},
    create: {
      title: "AirPods Pro 2nd Generation",
      slug: "airpods-pro-2",
      description: "Premium wireless earbuds with active noise cancellation, adaptive audio, and personalized spatial audio. USB-C charging case included.",
      brand: "Apple",
      priceCents: 99900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: airpods.id, categoryId: accessories.id } },
    update: {},
    create: { productId: airpods.id, categoryId: accessories.id },
  });

  const airpodsVariant = await prisma.productVariant.upsert({
    where: { sku: "AIRPODS-PRO2-USBC" },
    update: {},
    create: {
      productId: airpods.id,
      sku: "AIRPODS-PRO2-USBC",
      priceCents: 99900,
      optionValues: { charging: "USB-C" },
    },
  });

  // Product 5: Sony Headphones
  const sonyHeadphones = await prisma.product.upsert({
    where: { slug: "sony-wh1000xm5" },
    update: {},
    create: {
      title: "Sony WH-1000XM5 Wireless Headphones",
      slug: "sony-wh1000xm5",
      description: "Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery life, and comfortable design for all-day wear.",
      brand: "Sony",
      priceCents: 149900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: sonyHeadphones.id, categoryId: accessories.id } },
    update: {},
    create: { productId: sonyHeadphones.id, categoryId: accessories.id },
  });

  const sonyVariantBlack = await prisma.productVariant.upsert({
    where: { sku: "SONY-WH1000XM5-BLK" },
    update: {},
    create: {
      productId: sonyHeadphones.id,
      sku: "SONY-WH1000XM5-BLK",
      priceCents: 149900,
      optionValues: { color: "Black" },
    },
  });

  const sonyVariantSilver = await prisma.productVariant.upsert({
    where: { sku: "SONY-WH1000XM5-SLV" },
    update: {},
    create: {
      productId: sonyHeadphones.id,
      sku: "SONY-WH1000XM5-SLV",
      priceCents: 149900,
      optionValues: { color: "Silver" },
    },
  });

  // Product 6: Men's T-Shirt
  const tshirt = await prisma.product.upsert({
    where: { slug: "cotton-crew-tshirt" },
    update: {},
    create: {
      title: "Premium Cotton Crew Neck T-Shirt",
      slug: "cotton-crew-tshirt",
      description: "Classic fit t-shirt made from 100% organic cotton. Soft, breathable, and perfect for everyday wear.",
      brand: "Souqona Basics",
      priceCents: 7900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: tshirt.id, categoryId: mensClothing.id } },
    update: {},
    create: { productId: tshirt.id, categoryId: mensClothing.id },
  });

  const tshirtVariants = await Promise.all([
    prisma.productVariant.upsert({
      where: { sku: "TSHIRT-M-BLK" },
      update: {},
      create: {
        productId: tshirt.id,
        sku: "TSHIRT-M-BLK",
        priceCents: 7900,
        optionValues: { size: "M", color: "Black" },
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "TSHIRT-L-BLK" },
      update: {},
      create: {
        productId: tshirt.id,
        sku: "TSHIRT-L-BLK",
        priceCents: 7900,
        optionValues: { size: "L", color: "Black" },
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "TSHIRT-M-WHT" },
      update: {},
      create: {
        productId: tshirt.id,
        sku: "TSHIRT-M-WHT",
        priceCents: 7900,
        optionValues: { size: "M", color: "White" },
      },
    }),
  ]);

  // Product 7: Women's Dress
  const dress = await prisma.product.upsert({
    where: { slug: "summer-floral-dress" },
    update: {},
    create: {
      title: "Summer Floral Midi Dress",
      slug: "summer-floral-dress",
      description: "Elegant floral print midi dress, perfect for summer occasions. Features a flattering A-line silhouette with adjustable straps.",
      brand: "Souqona Fashion",
      priceCents: 19900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: dress.id, categoryId: womensClothing.id } },
    update: {},
    create: { productId: dress.id, categoryId: womensClothing.id },
  });

  const dressVariant = await prisma.productVariant.upsert({
    where: { sku: "DRESS-FLORAL-M" },
    update: {},
    create: {
      productId: dress.id,
      sku: "DRESS-FLORAL-M",
      priceCents: 19900,
      optionValues: { size: "M", pattern: "Blue Floral" },
    },
  });

  // Product 8: Office Chair
  const chair = await prisma.product.upsert({
    where: { slug: "ergonomic-office-chair" },
    update: {},
    create: {
      title: "Ergonomic Office Chair",
      slug: "ergonomic-office-chair",
      description: "Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back. Perfect for long work hours.",
      brand: "ComfortPro",
      priceCents: 129900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: chair.id, categoryId: furniture.id } },
    update: {},
    create: { productId: chair.id, categoryId: furniture.id },
  });

  const chairVariant = await prisma.productVariant.upsert({
    where: { sku: "CHAIR-ERGO-BLK" },
    update: {},
    create: {
      productId: chair.id,
      sku: "CHAIR-ERGO-BLK",
      priceCents: 129900,
      optionValues: { color: "Black", material: "Mesh" },
    },
  });

  // Product 9: Coffee Maker
  const coffeeMaker = await prisma.product.upsert({
    where: { slug: "automatic-espresso-machine" },
    update: {},
    create: {
      title: "Automatic Espresso Machine",
      slug: "automatic-espresso-machine",
      description: "Professional-grade automatic espresso machine with built-in grinder, milk frother, and customizable brewing settings. Makes barista-quality coffee at home.",
      brand: "BrewMaster",
      priceCents: 249900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: coffeeMaker.id, categoryId: kitchen.id } },
    update: {},
    create: { productId: coffeeMaker.id, categoryId: kitchen.id },
  });

  const coffeeMakerVariant = await prisma.productVariant.upsert({
    where: { sku: "ESPRESSO-AUTO-SLV" },
    update: {},
    create: {
      productId: coffeeMaker.id,
      sku: "ESPRESSO-AUTO-SLV",
      priceCents: 249900,
      optionValues: { color: "Silver", capacity: "1.8L" },
    },
  });

  // Product 10: Wireless Charger
  const charger = await prisma.product.upsert({
    where: { slug: "wireless-charging-pad" },
    update: {},
    create: {
      title: "15W Fast Wireless Charging Pad",
      slug: "wireless-charging-pad",
      description: "Fast wireless charger compatible with all Qi-enabled devices. Sleek design with LED indicator and overcharge protection.",
      brand: "TechCharge",
      priceCents: 4900,
      currency: "ILS",
      status: "ACTIVE",
    },
  });

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: charger.id, categoryId: accessories.id } },
    update: {},
    create: { productId: charger.id, categoryId: accessories.id },
  });

  const chargerVariant = await prisma.productVariant.upsert({
    where: { sku: "CHARGER-WIRELESS-BLK" },
    update: {},
    create: {
      productId: charger.id,
      sku: "CHARGER-WIRELESS-BLK",
      priceCents: 4900,
      optionValues: { color: "Black" },
    },
  });

  console.log("✓ Products created");

  // ── Inventory ─────────────────────────────────────
  console.log("\n📊 Setting up inventory...");

  const allVariants = [
    { variant: iphoneVariant128, onHand: 25 },
    { variant: iphoneVariant256, onHand: 15 },
    { variant: samsungVariant, onHand: 20 },
    { variant: macbookVariant, onHand: 10 },
    { variant: airpodsVariant, onHand: 50 },
    { variant: sonyVariantBlack, onHand: 30 },
    { variant: sonyVariantSilver, onHand: 25 },
    ...tshirtVariants.map((v) => ({ variant: v, onHand: 100 })),
    { variant: dressVariant, onHand: 40 },
    { variant: chairVariant, onHand: 15 },
    { variant: coffeeMakerVariant, onHand: 8 },
    { variant: chargerVariant, onHand: 200 },
  ];

  for (const { variant, onHand } of allVariants) {
    await prisma.inventoryItem.upsert({
      where: { variantId: variant.id },
      update: { onHand },
      create: {
        variantId: variant.id,
        onHand,
        reserved: 0,
        safetyStock: 5,
      },
    });
  }

  console.log("✓ Inventory set up");

  console.log("\n✅ Seed complete!");
  console.log("\n📋 Summary:");
  console.log("   - 2 Users (admin + customer)");
  console.log("   - 10 Categories (3 main + 7 subcategories)");
  console.log("   - 10 Products with variants");
  console.log("   - Inventory for all variants");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

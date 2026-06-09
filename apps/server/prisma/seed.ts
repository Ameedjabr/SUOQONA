/// <reference types="node" />
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

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
    update: { image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=3840&q=100" },
    create: { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=3840&q=100" },
  });

  const phones = await prisma.category.upsert({
    where: { slug: "phones" },
    update: { image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=3840&q=100" },
    create: { name: "Phones", slug: "phones", parentId: electronics.id, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=3840&q=100" },
  });

  const laptops = await prisma.category.upsert({
    where: { slug: "laptops" },
    update: { image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=3840&q=100" },
    create: { name: "Laptops", slug: "laptops", parentId: electronics.id, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=3840&q=100" },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: { parentId: null, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=3840&q=100" },
    create: { name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=3840&q=100" },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: { image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=3840&q=100" },
    create: { name: "Clothing", slug: "clothing", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=3840&q=100" },
  });

  const mensClothing = await prisma.category.upsert({
    where: { slug: "mens-clothing" },
    update: { image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=3840&q=100" },
    create: { name: "Men's Clothing", slug: "mens-clothing", parentId: clothing.id, image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=3840&q=100" },
  });

  const womensClothing = await prisma.category.upsert({
    where: { slug: "womens-clothing" },
    update: { image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=3840&q=100" },
    create: { name: "Women's Clothing", slug: "womens-clothing", parentId: clothing.id, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=3840&q=100" },
  });

  const home = await prisma.category.upsert({
    where: { slug: "home" },
    update: { image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=3840&q=100" },
    create: { name: "Home & Kitchen", slug: "home", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=3840&q=100" },
  });

  const furniture = await prisma.category.upsert({
    where: { slug: "furniture" },
    update: { image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=3840&q=100" },
    create: { name: "Furniture", slug: "furniture", parentId: home.id, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=3840&q=100" },
  });

  const kitchen = await prisma.category.upsert({
    where: { slug: "kitchen" },
    update: { image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=3840&q=100" },
    create: { name: "Kitchen", slug: "kitchen", parentId: home.id, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=3840&q=100" },
  });

  const sports = await prisma.category.upsert({
    where: { slug: "sports" },
    update: { image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=3840&q=100" },
    create: { name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=3840&q=100" },
  });

  await prisma.category.upsert({
    where: { slug: "football" },
    update: { image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=3840&q=100" },
    create: { name: "Football", slug: "football", parentId: sports.id, image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=3840&q=100" },
  });

  await prisma.category.upsert({
    where: { slug: "basketball" },
    update: { image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=3840&q=100" },
    create: { name: "Basketball", slug: "basketball", parentId: sports.id, image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=3840&q=100" },
  });

  await prisma.category.upsert({
    where: { slug: "fitness" },
    update: { image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=3840&q=100" },
    create: { name: "Fitness", slug: "fitness", parentId: sports.id, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=3840&q=100" },
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

  // ── Product Images ─────────────────────────────────────────────
  console.log("\n🖼️  Adding product images...");

  const PRODUCT_IMAGES: Record<string, { url: string; alt: string }[]> = {
    "iphone-15-pro": [
      { url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=3840&q=100", alt: "iPhone 15 Pro titanium finish" },
      { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=3840&q=100", alt: "iPhone 15 Pro side view" },
    ],
    "samsung-galaxy-s24-ultra": [
      { url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=3840&q=100", alt: "Samsung Galaxy S24 Ultra" },
      { url: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=3840&q=100", alt: "Samsung smartphone display" },
    ],
    "macbook-pro-14": [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=3840&q=100", alt: "MacBook Pro on desk" },
      { url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=3840&q=100", alt: "MacBook Pro keyboard" },
    ],
    "airpods-pro-2": [
      { url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=3840&q=100", alt: "AirPods Pro with case" },
      { url: "https://images.unsplash.com/photo-1588423771073-b8903fead85b?w=3840&q=100", alt: "AirPods Pro earbuds" },
    ],
    "sony-wh1000xm5": [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=3840&q=100", alt: "Sony WH-1000XM5 headphones" },
      { url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=3840&q=100", alt: "Over-ear headphones" },
    ],
    "cotton-crew-tshirt": [
      { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=3840&q=100", alt: "White cotton t-shirt" },
      { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=3840&q=100", alt: "Premium crew neck t-shirt" },
    ],
    "summer-floral-dress": [
      { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=3840&q=100", alt: "Summer floral midi dress" },
      { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=3840&q=100", alt: "Floral print dress detail" },
    ],
    "ergonomic-office-chair": [
      { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=3840&q=100", alt: "Ergonomic office chair" },
      { url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=3840&q=100", alt: "Mesh back office chair" },
    ],
    "automatic-espresso-machine": [
      { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=3840&q=100", alt: "Automatic espresso machine" },
      { url: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=3840&q=100", alt: "Coffee machine brewing" },
    ],
    "wireless-charging-pad": [
      { url: "https://images.unsplash.com/photo-1583394293214-5bc3d357b5b6?w=3840&q=100", alt: "Wireless charging pad" },
      { url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=3840&q=100", alt: "Phone on wireless charger" },
    ],
  };

  for (const [slug, images] of Object.entries(PRODUCT_IMAGES)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) continue;
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: images.map((img, i) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt,
        sortOrder: i,
      })),
    });
  }

  console.log("✓ Product images added");

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

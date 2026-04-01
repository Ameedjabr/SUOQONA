import Groq from "groq-sdk";
import { env } from "../../config/env";
import prisma from "../../lib/prisma";

// ── Groq Client ─────────────────────────────────
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// ── System Prompt ───────────────────────────────
const SYSTEM_PROMPT = `### ROLE
You are the official AI Shopping Assistant for "Soqona," a premier ecommerce platform. Your goal is to provide a seamless, helpful, and efficient shopping experience.

### CAPABILITIES & TOOLS
You have access to the following tools to interact with the Soqona database. You MUST use these tools when a user asks for specific information:
1. \`search_products(query)\`: Finds products based on name, description, or keywords.
2. \`get_categories()\`: Lists all available shopping categories.
3. \`get_product_details(product_id)\`: Provides the exact price, available variants (size, color, material), and stock status.
4. \`filter_by_category(category_name)\`: Shows products within a specific department.

### OPERATING RULES
- **Search First:** If a user is vague (e.g., "I want shoes"), use \`search_products\` or \`get_categories\` first to provide options.
- **Accuracy is Key:** Never hallucinate a price. If you don't have the data from a tool call, ask the user for the specific product name to look it up.
- **Variants & Pricing:** When a user asks about a product, always mention its price and whether it has variants (e.g., "Available in Red and Blue" or "Sizes S, M, L").
- **Tone:** Professional, energetic, and helpful. Use bullet points for lists to make them readable.
- **Language:** Default to English unless the user speaks in another language (e.g., Arabic), in which case, respond in that language.

### CONSTRAINTS
- Do not discuss internal company politics or non-ecommerce topics.
- If a product is out of stock, suggest a similar alternative from the same category.
- Do not confirm orders or take payments; refer the user to the "Checkout" page for final purchases.`;

// ── Tool Definitions ────────────────────────────
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search for products by name, description, brand, or keywords. Returns a list of matching products with their prices and basic info.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search term or keywords to find products (e.g., 'red shoes', 'summer dress', 'laptop')",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_categories",
      description:
        "Get all available product categories in the store. Use this when the user wants to browse or explore what's available.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Get detailed information about a specific product including exact price, all available variants (sizes, colors), and stock status.",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "string",
            description: "The unique identifier (UUID) of the product to get details for",
          },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "filter_by_category",
      description:
        "Get all products within a specific category. Use when the user wants to browse a particular department or category.",
      parameters: {
        type: "object",
        properties: {
          category_name: {
            type: "string",
            description: "The name or slug of the category to filter by (e.g., 'electronics', 'clothing', 'shoes')",
          },
        },
        required: ["category_name"],
      },
    },
  },
];

// ── Tool Implementation Functions ───────────────

/**
 * Search products by query string
 */
async function searchProducts(query: string) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      variants: {
        where: { isActive: true },
        include: { inventoryItem: true },
        take: 3,
      },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      categories: { include: { category: true } },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    description: p.description?.slice(0, 150),
    price: p.priceCents ? `${(p.priceCents / 100).toFixed(2)} ${p.currency}` : null,
    categories: p.categories.map((c) => c.category.name),
    hasVariants: p.variants.length > 0,
    variantCount: p.variants.length,
    image: p.images[0]?.url || null,
  }));
}

/**
 * Get all categories in hierarchical structure
 */
async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
        },
      },
      _count: { select: { productLinks: true } },
    },
    orderBy: { name: "asc" },
  });

  const formatCategory = (cat: any): any => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    productCount: cat._count?.productLinks || 0,
    subcategories: cat.children?.map(formatCategory) || [],
  });

  return categories.map(formatCategory);
}

/**
 * Get detailed product information including variants and stock
 */
async function getProductDetails(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: {
        where: { isActive: true },
        include: { inventoryItem: true, images: { take: 1 } },
      },
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
    },
  });

  if (!product) {
    return { error: "Product not found" };
  }

  // Extract unique option values from variants
  const optionMap: Record<string, Set<string>> = {};
  product.variants.forEach((v) => {
    const opts = v.optionValues as Record<string, string>;
    Object.entries(opts).forEach(([key, value]) => {
      if (!optionMap[key]) optionMap[key] = new Set();
      optionMap[key].add(value);
    });
  });

  const options: Record<string, string[]> = {};
  Object.entries(optionMap).forEach(([key, values]) => {
    options[key] = Array.from(values);
  });

  return {
    id: product.id,
    title: product.title,
    brand: product.brand,
    description: product.description,
    basePrice: product.priceCents ? `${(product.priceCents / 100).toFixed(2)} ${product.currency}` : null,
    compareAtPrice: product.compareAtPriceCents
      ? `${(product.compareAtPriceCents / 100).toFixed(2)} ${product.currency}`
      : null,
    categories: product.categories.map((c) => c.category.name),
    images: product.images.map((img) => img.url),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: `${(v.priceCents / 100).toFixed(2)} ${v.currency}`,
      options: v.optionValues,
      inStock: v.inventoryItem ? v.inventoryItem.onHand - v.inventoryItem.reserved > 0 : false,
      stockQuantity: v.inventoryItem ? v.inventoryItem.onHand - v.inventoryItem.reserved : 0,
    })),
    availableOptions: options,
    totalStock: product.variants.reduce(
      (sum, v) => sum + (v.inventoryItem ? v.inventoryItem.onHand - v.inventoryItem.reserved : 0),
      0
    ),
  };
}

/**
 * Filter products by category name or slug
 */
async function filterByCategory(categoryName: string) {
  // Find category by name or slug
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { contains: categoryName, mode: "insensitive" } },
        { slug: { contains: categoryName, mode: "insensitive" } },
      ],
    },
  });

  if (!category) {
    return { error: `Category "${categoryName}" not found`, availableCategories: await getCategories() };
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      categories: { some: { categoryId: category.id } },
    },
    include: {
      variants: {
        where: { isActive: true },
        include: { inventoryItem: true },
        take: 3,
      },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    take: 15,
    orderBy: { createdAt: "desc" },
  });

  return {
    category: { id: category.id, name: category.name, slug: category.slug },
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      price: p.priceCents ? `${(p.priceCents / 100).toFixed(2)} ${p.currency}` : null,
      hasVariants: p.variants.length > 0,
      inStock: p.variants.some((v) => v.inventoryItem && v.inventoryItem.onHand - v.inventoryItem.reserved > 0),
      image: p.images[0]?.url || null,
    })),
    totalProducts: products.length,
  };
}

// ── Tool Execution Router ───────────────────────
async function executeTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    let result: any;

    switch (name) {
      case "search_products":
        result = await searchProducts(args.query);
        break;
      case "get_categories":
        result = await getCategories();
        break;
      case "get_product_details":
        result = await getProductDetails(args.product_id);
        break;
      case "filter_by_category":
        result = await filterByCategory(args.category_name);
        break;
      default:
        result = { error: `Unknown tool: ${name}` };
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error(`[Tool Error] ${name}:`, error);
    return JSON.stringify({ error: `Failed to execute ${name}: ${(error as Error).message}` });
  }
}

// ── Types ───────────────────────────────────────
type MessageRole = "user" | "assistant" | "system" | "tool";

interface ChatMessage {
  role: MessageRole;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

interface ChatInput {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

interface ChatOutput {
  reply: string;
  tools: Array<{ name: string; args: Record<string, any>; result: any }>;
  history: ChatMessage[];
}

// ── Main Chat Function ──────────────────────────
export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { message, history = [] } = input;

  // Build messages array
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: message },
  ];

  const toolsExecuted: Array<{ name: string; args: Record<string, any>; result: any }> = [];

  // Initial API call
  let response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    tools,
    tool_choice: "auto",
    max_tokens: 1024,
    temperature: 0.7,
  });

  let assistantMessage = response.choices[0].message;

  // Handle tool calls in a loop (supports multiple sequential tool calls)
  while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    // Add assistant's message with tool calls to messages
    messages.push({
      role: "assistant",
      content: assistantMessage.content || "",
      tool_calls: assistantMessage.tool_calls,
    });

    // Execute each tool call
    for (const toolCall of assistantMessage.tool_calls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments || "{}");

      console.log(`[Tool Call] ${functionName}:`, functionArgs);

      const toolResult = await executeTool(functionName, functionArgs);

      toolsExecuted.push({
        name: functionName,
        args: functionArgs,
        result: JSON.parse(toolResult),
      });

      // Add tool result to messages
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }

    // Call the API again with tool results
    response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 1024,
      temperature: 0.7,
    });

    assistantMessage = response.choices[0].message;
  }

  // Build final history for the response
  const finalHistory: ChatMessage[] = [
    ...history.map((msg) => ({ role: msg.role as MessageRole, content: msg.content })),
    { role: "user" as MessageRole, content: message },
    { role: "assistant" as MessageRole, content: assistantMessage.content || "" },
  ];

  return {
    reply: assistantMessage.content || "I apologize, but I couldn't generate a response. Please try again.",
    tools: toolsExecuted,
    history: finalHistory,
  };
}

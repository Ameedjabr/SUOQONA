/**
 * API Service Layer - Centralized API communication
 * All API calls go through this layer for consistency and error handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "API Error", data);
  }

  return data.data || data;
}

// ──── Auth Endpoints ────────────────────────────

export const authApi = {
  register: async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, fullName }),
    });
    return handleResponse<{ user: any; accessToken: string }>(response);
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ user: any; accessToken: string }>(response);
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  },

  refresh: async () => {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse<{ accessToken: string }>(response);
  },

  requestPasswordReset: async (email: string) => {
    const response = await fetch(`${API_URL}/api/auth/password-reset/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/api/auth/password-reset/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// ──── Product Endpoints ────────────────────────────

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  brand: string | null;
  priceCents: number | null;
  compareAtPriceCents: number | null;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
  categories?: Category[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  optionValues: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string | null;
  variantId: string | null;
  url: string;
  alt: string | null;
  sortOrder: number;
  createdAt: string;
}

export const productApi = {
  search: async (params: PaginationParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("q", params.search);
    if (params.sort) query.append("sort", params.sort);

    const response = await fetch(`${API_URL}/api/products?${query}`, {
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result.data || result;
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/products/${id}`);
    return handleResponse<Product>(response);
  },

  getBySlug: async (slug: string) => {
    const response = await fetch(`${API_URL}/api/products/slug/${slug}`);
    return handleResponse<Product>(response);
  },

  create: async (token: string, data: Partial<Product>) => {
    const response = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(response);
  },

  update: async (token: string, id: string, data: Partial<Product> & { categoryIds?: string[] }) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(response);
  },

  // Admin: fetch all statuses by making parallel requests
  searchAll: async (params: Omit<PaginationParams, "status"> = {}) => {
    const [r1, r2, r3] = await Promise.all([
      fetch(`${API_URL}/api/products?${new URLSearchParams({ ...params, page: "1", limit: "500" } as Record<string, string>)}`).then(r => r.json()),
      fetch(`${API_URL}/api/products?${new URLSearchParams({ ...params, page: "1", limit: "500", status: "DRAFT" } as Record<string, string>)}`).then(r => r.json()),
      fetch(`${API_URL}/api/products?${new URLSearchParams({ ...params, page: "1", limit: "500", status: "ARCHIVED" } as Record<string, string>)}`).then(r => r.json()),
    ]);
    const active = (r1.data || r1)?.products || [];
    const draft = (r2.data || r2)?.products || [];
    const archived = (r3.data || r3)?.products || [];
    return { products: [...active, ...draft, ...archived] };
  },

  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  },
};

// ──── Category Endpoints ────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export const categoryApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/categories`);
    return handleResponse<Category[]>(response);
  },

  getBySlug: async (slug: string) => {
    const response = await fetch(`${API_URL}/api/categories/${slug}`);
    return handleResponse<Category & { products: Product[] }>(response);
  },

  create: async (token: string, data: { name: string; slug?: string; parentId?: string | null }) => {
    const response = await fetch(`${API_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  update: async (token: string, id: string, data: { name?: string; slug?: string; parentId?: string | null }) => {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  },
};

// ──── Cart Endpoints ────────────────────────────

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  variant?: ProductVariant & { product: Product };
}

export interface Cart {
  id: string;
  userId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export const cartApi = {
  getCart: async (token?: string) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/api/cart`, {
      headers,
      credentials: "include",
    });
    return handleResponse<Cart>(response);
  },

  addItem: async (token: string, variantId: string, quantity: number) => {
    const response = await fetch(`${API_URL}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ variantId, quantity }),
    });
    return handleResponse<Cart>(response);
  },

  updateItem: async (token: string, itemId: string, quantity: number) => {
    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });
    return handleResponse<Cart>(response);
  },

  removeItem: async (token: string, itemId: string) => {
    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<Cart>(response);
  },
};

// ──── Order Endpoints ────────────────────────────

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string | null;
  productTitle: string;
  variantSku: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string | null;
  customerName: string;
  customerEmail: string | null;
  phonePrimary: string;
  phoneSecondary: string | null;
  country: string;
  city: string;
  area: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  deliveryNotes: string | null;
  currency: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: any;
}

export const orderApi = {
  checkout: async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/api/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<Order>(response);
  },

  getMyOrders: async (token: string) => {
    const response = await fetch(`${API_URL}/api/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const result = await response.json();
    return result.data || result;
  },

  getMyOrder: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/orders/my/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<Order>(response);
  },

  // Admin only
  getAllOrders: async (token: string, params: PaginationParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);

    const response = await fetch(`${API_URL}/api/orders?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const result = await response.json();
    return result.data || result;
  },

  updateStatus: async (token: string, id: string, status: string) => {
    const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    return handleResponse<Order>(response);
  },

  updatePayment: async (
    token: string,
    id: string,
    paymentStatus: string,
    paidAt?: string
  ) => {
    const response = await fetch(`${API_URL}/api/orders/${id}/payment`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ paymentStatus, paidAt }),
    });
    return handleResponse<Order>(response);
  },
};

// ──── User Endpoints ────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "CUSTOMER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  getProfile: async (token: string) => {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<User>(response);
  },

  updateProfile: async (token: string, data: Partial<User>) => {
    const response = await fetch(`${API_URL}/api/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  // Admin only - Fixed to match backend response format
  getAll: async (token: string, params: PaginationParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);

    const response = await fetch(`${API_URL}/api/users?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const result = await response.json();
    return result.data || result;
  },

  getById: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<User>(response);
  },
};

// ──── Address Endpoints ────────────────────────────

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phonePrimary: string;
  phoneSecondary: string | null;
  country: string;
  city: string;
  area: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const addressApi = {
  getMyAddresses: async (token: string) => {
    const response = await fetch(`${API_URL}/api/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const result = await response.json();
    return result.data || result;
  },

  create: async (token: string, data: Partial<Address>) => {
    const response = await fetch(`${API_URL}/api/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<Address>(response);
  },

  update: async (token: string, id: string, data: Partial<Address>) => {
    const response = await fetch(`${API_URL}/api/addresses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<Address>(response);
  },

  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  },
};

// ──── Variant Endpoints ────────────────────────────

export const variantApi = {
  getByProduct: async (productId: string) => {
    const response = await fetch(`${API_URL}/api/variants/product/${productId}`);
    return handleResponse<ProductVariant[]>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/variants/${id}`);
    return handleResponse<ProductVariant>(response);
  },

  create: async (token: string, productId: string, data: Partial<ProductVariant>) => {
    const response = await fetch(`${API_URL}/api/variants/product/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<ProductVariant>(response);
  },

  update: async (token: string, id: string, data: Partial<ProductVariant>) => {
    const response = await fetch(`${API_URL}/api/variants/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<ProductVariant>(response);
  },

  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/variants/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  },
};

// ──── Image Endpoints ────────────────────────────

export interface UploadImageResponse {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export const imageApi = {
  uploadForProduct: async (token: string, productId: string, formData: FormData) => {
    const response = await fetch(`${API_URL}/api/images/product/${productId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
      body: formData,
    });
    return handleResponse<UploadImageResponse[]>(response);
  },

  uploadForVariant: async (token: string, variantId: string, formData: FormData) => {
    const response = await fetch(`${API_URL}/api/images/variant/${variantId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
      body: formData,
    });
    return handleResponse<UploadImageResponse[]>(response);
  },

  getProductImages: async (productId: string) => {
    const response = await fetch(`${API_URL}/api/images/product/${productId}`);
    return handleResponse<UploadImageResponse[]>(response);
  },

  getVariantImages: async (variantId: string) => {
    const response = await fetch(`${API_URL}/api/images/variant/${variantId}`);
    return handleResponse<UploadImageResponse[]>(response);
  },

  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/api/images/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    return handleResponse<{ message: string }>(response);
  },
};

// ──── Chat Endpoints ────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export interface ChatResponse {
  reply: string;
  toolCalls?: ToolCall[];
}

export const chatApi = {
  sendMessage: async (message: string, history?: ChatMessage[]) => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    return handleResponse<ChatResponse>(response);
  },
};

// ──── Inventory Endpoints ────────────────────────────

export interface Inventory {
  id: string;
  variantId: string;
  stock: number;
  reserved: number;
  createdAt: string;
  updatedAt: string;
}

export const inventoryApi = {
  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/api/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const result = await response.json();
    return result.data || result;
  },

  update: async (token: string, id: string, data: Partial<Inventory>) => {
    const response = await fetch(`${API_URL}/api/inventory/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<Inventory>(response);
  },
};

# Backend API Endpoints Reference

## Authentication `/api/auth`
- POST `/register` - Register new user
- POST `/login` - Login user
- POST `/refresh` - Refresh access token
- POST `/logout` - Logout user
- POST `/password-reset/request` - Request password reset
- POST `/password-reset/confirm` - Confirm password reset

## Products `/api/products`
- GET `/` - Search/list products (public, with filters)
  - Query: `page`, `limit`, `q` (search), `category`, `brand`, `status`, `minPrice`, `maxPrice`
  - Response: `{ products: [], total: number, pages: number }`
- GET `/slug/:slug` - Get product by slug (public)
- GET `/:id` - Get product by ID (public)
- POST `/` - Create product (admin only)
- PATCH `/:id` - Update product (admin only)
- DELETE `/:id` - Delete product (admin only)

## Categories `/api/categories`
- GET `/` - List all categories (public)
- GET `/:slug` - Get category with products (public)

## Cart `/api/cart`
- GET `/` - Get user's cart (authenticated)
- POST `/items` - Add item to cart (authenticated)
- PATCH `/items/:id` - Update cart item quantity (authenticated)
- DELETE `/items/:id` - Remove item from cart (authenticated)

## Orders `/api/orders`
- POST `/checkout` - Create order (authenticated)
- GET `/my` - Get user's orders (authenticated)
- GET `/my/:id` - Get user's order detail (authenticated)
- GET `/` - Get all orders (admin only)
- PATCH `/:id/status` - Update order status (admin only)
- PATCH `/:id/payment` - Update order payment (admin only)

## Users `/api/users`
- GET `/me` - Get current user profile (authenticated)
- PATCH `/me` - Update own profile (authenticated)
- GET `/` - List all users (admin only)
  - Query: `page`, `limit`, `search`
  - Response: `{ users: [], total: number, pages: number }`
- GET `/:id` - Get user by ID (admin only)
- PATCH `/:id` - Update user (admin only)

## Addresses `/api/addresses`
- GET `/` - Get user's addresses (authenticated)
- POST `/` - Create address (authenticated)
- PATCH `/:id` - Update address (authenticated)
- DELETE `/:id` - Delete address (authenticated)

## Variants `/api/variants`
- GET `/` - List variants
- GET `/:id` - Get variant by ID
- POST `/` - Create variant (admin only)
- PATCH `/:id` - Update variant (admin only)

## Images `/api/images`
- POST `/` - Upload image (admin only)
- DELETE `/:id` - Delete image (admin only)

## Chat `/api/chat`
- POST `/` - Send chat message (public)
  - Body: `{ message: string, history?: ChatMessage[] }`
  - Response: `{ reply: string, toolCalls?: ToolCall[] }`

## Inventory `/api/inventory`
- GET `/` - Get inventory (admin only)
- PATCH `/:id` - Update inventory (admin only)

---

## Notes:
1. All authenticated endpoints require `Authorization: Bearer <token>` header
2. Admin endpoints require user with role `ADMIN`
3. Responses follow format: `{ success: boolean, data: any, error: null | string }`

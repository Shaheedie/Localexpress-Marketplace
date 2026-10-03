# API Documentation

Health check:

```http
GET /health
```

Returns basic API availability information.

Base URL:

```text
http://localhost:5000/api
```

Protected routes require this header:

```text
Authorization: Bearer YOUR_TOKEN
```

## Authentication

### Register

```http
POST /auth/register
```

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer",
  "phone": "08012345678",
  "address": "Unity Street",
  "town": "Local Town"
}
```

Seller registration can include:

```json
{
  "role": "seller",
  "shopName": "John Store",
  "shopDescription": "Quality local goods"
}
```

### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "buyer@localexpress.com",
  "password": "buyer123"
}
```

### Get Current User

```http
GET /auth/me
```

## Products

### Get Categories

```http
GET /products/categories
```

### Get Products

```http
GET /products
```

Optional query parameters:

```text
search=charger
category=electronics
limit=20
```

### Get One Product

```http
GET /products/:id
```

### Add Product

Seller or admin only.

```http
POST /products
```

Body:

```json
{
  "name": "Phone Charger",
  "description": "Fast charger",
  "price": 4500,
  "stock": 20,
  "category_id": 1,
  "image_url": "https://example.com/image.jpg"
}
```

### Update Product

```http
PUT /products/:id
```

### Remove Product

```http
DELETE /products/:id
```

## Orders

### Place Order

```http
POST /orders
```

Body:

```json
{
  "items": [
    { "product_id": 1, "quantity": 2 }
  ],
  "delivery_type": "delivery",
  "delivery_address": "No. 12 Unity Street",
  "phone": "08012345678",
  "payment_method": "cash_on_delivery",
  "notes": "Call before delivery"
}
```

### Buyer Order History

```http
GET /orders/my-orders
```

### Seller Orders

```http
GET /orders/seller
```

### Update Order Status

Seller or admin only.

```http
PUT /orders/:id/status
```

Body:

```json
{
  "status": "processing"
}
```

## Seller

### Seller Dashboard

```http
GET /seller/dashboard
```

## Admin

### Admin Dashboard

```http
GET /admin/dashboard
```

### Enable or Disable User

```http
PUT /admin/users/:id/toggle
```

### Update Shop Status

```http
PUT /admin/shops/:id/status
```

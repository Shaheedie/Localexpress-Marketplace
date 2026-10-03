# Testing Guide

Before manual testing, run the repository checks and frontend build:

```bash
npm run check
npm run build
```

This guide provides simple manual tests to confirm that the system works correctly.

## Test 1: Buyer Login

1. Open the website.
2. Login with buyer@localexpress.com and buyer123.
3. Expected result: Buyer is logged in and can access products.

## Test 2: Product Search

1. Go to Products.
2. Search for charger.
3. Expected result: Products related to charger are displayed.

## Test 3: Add to Cart

1. Open any product.
2. Click Add to Cart.
3. Open Cart.
4. Expected result: Product appears in the cart.

## Test 4: Place Order

1. Add product to cart.
2. Go to Checkout.
3. Fill delivery address and phone number.
4. Click Place Order.
5. Expected result: Order is created and appears under My Orders.

## Test 5: Seller Adds Product

1. Login with seller@localexpress.com and seller123.
2. Open Seller Dashboard.
3. Add a new product.
4. Expected result: Product appears in seller product list and public product listing.

## Test 6: Seller Updates Order Status

1. Login as seller.
2. Open Seller Dashboard.
3. Change an order status.
4. Expected result: Status updates successfully.

## Test 7: Admin Dashboard

1. Login with admin@localexpress.com and admin123.
2. Open Admin Dashboard.
3. Expected result: Admin can view users, sellers, orders, and system statistics.

## Test 8: Protected Routes

1. Logout.
2. Try to open /seller or /admin.
3. Expected result: System redirects to login or home page.

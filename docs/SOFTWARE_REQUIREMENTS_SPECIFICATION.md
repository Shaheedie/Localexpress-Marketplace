# Software Requirements Specification

## 1. Introduction

LocalExpress Marketplace is a local town-based e-commerce system that connects buyers and sellers within a specific community. The platform allows sellers to upload products and allows buyers to place orders through a clean web interface.

## 2. Purpose

The purpose of the system is to make local buying and selling easier, more organized, and more accessible to customers and small businesses.

## 3. Intended Users

- Buyers/customers
- Sellers/vendors
- System administrator

## 4. System Features

### 4.1 User Registration and Login

Users can create accounts and login securely. Buyers and sellers can register from the frontend, while the admin account is created during database seeding.

### 4.2 Product Management

Sellers can add products with name, category, description, price, stock, and image URL.

### 4.3 Product Browsing

Buyers can view all available products, filter by category, and search by keyword.

### 4.4 Cart Management

Buyers can add products to cart, update quantity, remove products, and view total cost.

### 4.5 Checkout and Order Placement

Buyers can enter delivery details, select delivery or pickup, select payment method, and place an order.

### 4.6 Seller Order Management

Sellers can view customer orders related to their products and update order status.

### 4.7 Admin Management

The admin can view platform statistics, users, shops, and orders. The admin can also disable or enable user accounts.

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | The system shall allow buyers and sellers to register. |
| FR2 | The system shall allow users to login using email and password. |
| FR3 | The system shall hash user passwords before saving them. |
| FR4 | The system shall allow sellers to create products. |
| FR5 | The system shall allow buyers to search products. |
| FR6 | The system shall allow buyers to add products to cart. |
| FR7 | The system shall allow buyers to checkout and place orders. |
| FR8 | The system shall reduce product stock after an order is placed. |
| FR9 | The system shall allow sellers to view orders for their products. |
| FR10 | The system shall allow sellers to update order status. |
| FR11 | The system shall allow admins to view system statistics. |
| FR12 | The system shall allow admins to disable and enable users. |

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR1 | The interface should be responsive on desktop and mobile. |
| NFR2 | The system should be easy to understand and maintain. |
| NFR3 | The system should protect private routes using JWT authentication. |
| NFR4 | The system should provide clear error messages. |
| NFR5 | The system should load products quickly for local testing. |

## 7. Use Case Summary

### Buyer Use Cases

- Register account
- Login
- Browse products
- Search products
- View product details
- Add product to cart
- Place order
- View order history

### Seller Use Cases

- Register seller account
- Login
- Add product
- View product list
- View customer orders
- Update order status

### Admin Use Cases

- Login
- View dashboard statistics
- View users
- View orders
- Disable or enable users

## 8. Assumptions

- Users have internet access or are running the project locally.
- Sellers provide correct product information.
- Payment is currently handled manually through cash on delivery or bank transfer.
- Delivery is handled by local sellers or future delivery partners.

## 9. Future Scope

The project can be improved with online payment, delivery tracking, seller approval, reviews, chat, fraud detection, and advanced reporting.

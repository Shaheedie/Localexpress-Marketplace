# Project Documentation

## Project Title

Design and Implementation of a Local Town-Based Multi-Vendor E-Commerce Marketplace System

## Overview

LocalExpress Marketplace is a web-based e-commerce platform designed for local town buying and selling. The system allows sellers to create shop accounts, upload products, manage stock, and process orders. Buyers can browse products, add products to cart, checkout, and track order history. The administrator monitors users, sellers, shops, orders, and overall marketplace activity.

## Problem Statement

Many local businesses still depend on physical stores, social media messages, or informal WhatsApp groups to sell products. These methods can be difficult to manage because product information, customer orders, stock details, and payment records are usually scattered. Buyers also struggle to compare local products, find sellers nearby, and place orders conveniently. A dedicated local marketplace can solve this problem by bringing buyers and sellers into one organized platform.

## Aim of the Project

The aim of this project is to design and implement a local town-based multi-vendor e-commerce marketplace that enables sellers to advertise products and allows customers to place orders conveniently within their local area.

## Objectives

1. To develop a user registration and login system for buyers, sellers, and administrators.
2. To create a product management system where sellers can add, update, and manage products.
3. To provide product browsing, searching, product details, cart, and checkout features for buyers.
4. To implement an order management system for buyers, sellers, and administrators.
5. To provide an admin dashboard for monitoring users, sellers, products, and orders.

## Scope of the System

The system covers account registration, login, seller shop creation, product listing, product search, cart management, checkout, order placement, seller dashboard, buyer order history, and admin dashboard. It is designed as a working local development system that can later be expanded for production deployment.

## Limitations

The current version does not include live payment integration, delivery rider tracking, email verification, SMS notification, or advanced fraud detection. These can be added in future versions.

## User Roles

### Buyer

A buyer can register, login, browse products, search products, view product details, add items to cart, place orders, and view order history.

### Seller

A seller can register, create a shop profile, add products, view products, manage stock, and update order status.

### Admin

An admin can view platform statistics, monitor users, view sellers, view orders, and disable or enable user accounts.

## Functional Requirements

1. The system shall allow users to register as buyers or sellers.
2. The system shall allow registered users to login securely.
3. The system shall allow sellers to add products with name, price, description, category, stock, and image.
4. The system shall allow buyers to browse and search products.
5. The system shall allow buyers to add products to cart.
6. The system shall allow buyers to place orders.
7. The system shall allow sellers to view customer orders.
8. The system shall allow sellers to update order status.
9. The system shall allow admins to view users, sellers, orders, and platform statistics.

## Non-Functional Requirements

1. The system should be easy to use.
2. The interface should be clean, responsive, and friendly.
3. The system should protect user passwords using hashing.
4. The system should use authentication tokens to protect private routes.
5. The system should be easy to maintain and extend.

## System Architecture

The system uses a client-server architecture.

```text
React Frontend  →  Express API  →  JSON File Database
```

The frontend handles user interaction. The backend handles authentication, product logic, order logic, and admin actions. The database stores users, shops, products, categories, orders, order items, and reviews.

## Main Modules

### Authentication Module

Handles user registration, login, password hashing, and JWT authentication.

### Product Module

Handles product listing, product details, category filtering, product creation, product update, and product deletion.

### Cart Module

Stores selected products on the frontend using local storage.

### Order Module

Handles checkout, order creation, order items, stock reduction, order history, and order status update.

### Seller Module

Provides seller statistics, product list, and recent order list.

### Admin Module

Provides platform statistics, users, shops, and orders.

## Future Improvements

1. Add Paystack or Flutterwave payment integration.
2. Add email verification and password reset.
3. Add product reviews and ratings display.
4. Add delivery rider module.
5. Add seller approval workflow.
6. Add product image upload to Cloudinary.
7. Replace the local JSON file database with MySQL, PostgreSQL, or MongoDB for production.
8. Add order invoice generation.
9. Add buyer-seller chat.
10. Add coupons and discounts.

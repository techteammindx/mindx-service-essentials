# Service TUI Interaction Specification

**Date:** 2025-10-25

## Overview

Interactive terminal user interface (TUI) labeled for Service operations while preserving existing Quote workflows. Black-box interaction with GraphQL/gRPC backend (abstracted from user). Quote-only scope with create, update (add product), and read operations.

---

## Scope

- **Operations:** Create Quote, Add Product to Quote, Read Quote, List Products (helper)
- **Transport:** GraphQL or gRPC (user-agnostic; swappable at runtime)
- **Quantity:** Fixed at 1 per line item (no user input)
- **Output Format:** JSON dumps of backend responses
- **Session:** Stateless; no cross-session persistence
- **Environment:** Localhost only; assumes services are running

---

## Operations

### **1. Create Quote**

**Input:**
- Customer Reference (string, required)
- Optional Description (string, optional)

**Output (JSON):**
```json
{
  "quoteId": "uuid",
  "customerReference": "CUST-001",
  "description": "...",
  "lineItems": [],
  "subtotal": { "currency": "USD", "amount": 0 },
  "status": "draft",
  "createdAt": "ISO-8601"
}
```

**Error Cases:**
- Empty customer reference
- Database unavailable
- Service timeout

---

### **2. Add Product to Quote**

**Input:**
- Quote ID (uuid, required)
- Product ID (uuid, required)
- Unit Price (decimal, required; captured at time of addition)
- Quantity (always 1, implicit)

**Output (JSON):**
```json
{
  "quoteId": "uuid",
  "lineItems": [
    {
      "lineItemId": "uuid",
      "productId": "uuid",
      "productName": "...",
      "productSku": "...",
      "unitPrice": { "currency": "USD", "amount": 50 },
      "quantity": 1,
      "lineTotal": { "currency": "USD", "amount": 50 }
    }
  ],
  "subtotal": { "currency": "USD", "amount": 50 },
  "status": "draft",
  "updatedAt": "ISO-8601"
}
```

**Side Effects:**
- Emits `QuoteTotalsRecalculated` event to Kafka

**Error Cases:**
- Quote not found
- Product not found
- Product already in quote (if enforced)
- Invalid unit price
- Quote in non-draft state

---

### **3. Read Quote**

**Input:**
- Quote ID (uuid, required)

**Output (JSON):**
```json
{
  "quoteId": "uuid",
  "customerReference": "CUST-001",
  "description": "...",
  "lineItems": [
    {
      "lineItemId": "uuid",
      "productId": "uuid",
      "productName": "...",
      "productSku": "...",
      "unitPrice": { "currency": "USD", "amount": 50 },
      "quantity": 1,
      "lineTotal": { "currency": "USD", "amount": 50 }
    }
  ],
  "subtotal": { "currency": "USD", "amount": 50 },
  "status": "draft",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

**Error Cases:**
- Quote not found
- Service timeout

---

### **4. List Products** (Helper)

**Input:**
- Optional Category Filter (string)
- Optional Name Search (string)

**Output (JSON):**
```json
{
  "products": [
    {
      "productId": "uuid",
      "sku": "PROD-001",
      "name": "Product Name",
      "category": "Electronics",
      "basePrice": { "currency": "USD", "amount": 100 },
      "available": true
    }
  ],
  "total": 5
}
```

**Error Cases:**
- No products found (return empty array, not error)
- Service timeout

---

## TUI Menu Flow

```
┌─────────────────────────────────────┐
│   Service Management CLI (localhost) │
│  Transport: [graphql|grpc]          │
└─────────────────────────────────────┘

Main Menu:
  1. List Products
  2. Create Quote
  3. Read Quote
  4. Add Product to Quote
  5. Exit

> _
```

**Interaction Pattern:**
1. Display main menu
2. User selects operation by number (1-5)
3. TUI prompts for required inputs (customer ref, quote ID, product ID, unit price, etc.)
4. Backend response displayed as JSON dump
5. Return to main menu after each operation
6. Support Ctrl+C for clean exit

---

## Error Presentation

```
[ERROR] Quote not found: "invalid-uuid"

Backend response:
{
  "statusCode": 404,
  "message": "Quote with ID invalid-uuid does not exist",
  "error": "Not Found"
}

Press Enter to continue...
```

---

## Example Workflow Session

```
> 1
Listing all products...

{
  "products": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "sku": "LAPTOP-PRO",
      "name": "Pro Laptop",
      "category": "Electronics",
      "basePrice": { "currency": "USD", "amount": 1200 },
      "available": true
    },
    {
      "productId": "550e8400-e29b-41d4-a716-446655440001",
      "sku": "MOUSE-BASIC",
      "name": "Basic Mouse",
      "category": "Accessories",
      "basePrice": { "currency": "USD", "amount": 25 },
      "available": true
    }
  ],
  "total": 2
}

Main Menu:
  1. List Products
  2. Create Quote
  3. Read Quote
  4. Add Product to Quote
  5. Exit

> 2
Enter customer reference: ACME-Corp
Enter description (optional): Q1 2025 Hardware Order
Creating quote...

{
  "quoteId": "660e8400-e29b-41d4-a716-446655440000",
  "customerReference": "ACME-Corp",
  "description": "Q1 2025 Hardware Order",
  "lineItems": [],
  "subtotal": { "currency": "USD", "amount": 0 },
  "status": "draft",
  "createdAt": "2025-10-25T10:30:00Z"
}

Main Menu:
  1. List Products
  2. Create Quote
  3. Read Quote
  4. Add Product to Quote
  5. Exit

> 4
Enter quote ID: 660e8400-e29b-41d4-a716-446655440000
Enter product ID: 550e8400-e29b-41d4-a716-446655440000
Enter unit price: 1200
Adding product to quote...

{
  "quoteId": "660e8400-e29b-41d4-a716-446655440000",
  "lineItems": [
    {
      "lineItemId": "770e8400-e29b-41d4-a716-446655440000",
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "Pro Laptop",
      "productSku": "LAPTOP-PRO",
      "unitPrice": { "currency": "USD", "amount": 1200 },
      "quantity": 1,
      "lineTotal": { "currency": "USD", "amount": 1200 }
    }
  ],
  "subtotal": { "currency": "USD", "amount": 1200 },
  "status": "draft",
  "updatedAt": "2025-10-25T10:31:00Z"
}

Main Menu:
  1. List Products
  2. Create Quote
  3. Read Quote
  4. Add Product to Quote
  5. Exit

> 3
Enter quote ID: 660e8400-e29b-41d4-a716-446655440000
Reading quote...

{
  "quoteId": "660e8400-e29b-41d4-a716-446655440000",
  "customerReference": "ACME-Corp",
  "description": "Q1 2025 Hardware Order",
  "lineItems": [
    {
      "lineItemId": "770e8400-e29b-41d4-a716-446655440000",
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "Pro Laptop",
      "productSku": "LAPTOP-PRO",
      "unitPrice": { "currency": "USD", "amount": 1200 },
      "quantity": 1,
      "lineTotal": { "currency": "USD", "amount": 1200 }
    }
  ],
  "subtotal": { "currency": "USD", "amount": 1200 },
  "status": "draft",
  "createdAt": "2025-10-25T10:30:00Z",
  "updatedAt": "2025-10-25T10:31:00Z"
}

Main Menu:
  1. List Products
  2. Create Quote
  3. Read Quote
  4. Add Product to Quote
  5. Exit

> 5
Exiting...
```

---

## Implementation Notes

- Service TUI remains transport-agnostic; GraphQL/gRPC selection via CLI flag or env variable
- Backend responses printed verbatim as JSON (no reformatting)
- Input validation minimal; defer to backend for business rules
- Separate CLI tool from NestJS service (can live in `tools/` or standalone package)
- Mock responses available for testing the Service TUI without live service

---

## Open Questions (Deferred)

- Should TUI support bulk import of products or quotes?
- Is product SKU lookup needed as alternative to product ID?
- Should unit price default to product's basePrice or require explicit input?

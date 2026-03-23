# DATABASE SCHEMA (FULL DESIGN)

## Core Tables

### users
- id
- email
- password_hash
- role
- created_at

### user_profiles
- user_id
- name
- phone

---

### products
- id
- name
- description
- type (AI, VPS, etc)
- fulfillment_type (auto/semi/manual)
- price
- status

### product_variants
- id
- product_id
- name
- duration
- price

### product_fields
- id
- product_id
- field_name
- field_type

---

### orders
- id
- user_id
- status
- total_price
- created_at

### order_items
- id
- order_id
- product_id
- variant_id

---

### payments
- id
- order_id
- method
- status
- amount

### payment_logs
- id
- payment_id
- raw_response

---

### fulfillments
- id
- order_id
- status
- type

### delivery_logs
- id
- fulfillment_id
- content
- timestamp

---

### subscriptions
- id
- user_id
- product_id
- start_date
- end_date

---

### tickets
- id
- user_id
- order_id
- status
- message

### claims
- id
- user_id
- order_id
- status

---

### notifications
- id
- user_id
- type
- message
- status

---

### promo_codes
- id
- code
- discount
- expiry

---

### reviews
- id
- user_id
- product_id
- rating
- comment

---

### admin_users
- id
- role

### audit_logs
- id
- action
- user_id
- timestamp

---

## Key Notes
- Flexible product system (type-based)
- Support hybrid fulfillment
- Full logging for dispute handling

---

END

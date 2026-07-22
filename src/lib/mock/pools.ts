/** Static name/value pools used by the deterministic mock generators. */

export const FIRST_NAMES = [
  "James", "Maria", "David", "Sarah", "Michael", "Aisha", "Chen", "Olivia",
  "Ahmed", "Sofia", "Daniel", "Fatima", "Lucas", "Emma", "Kwame", "Nadia",
  "Omar", "Grace", "Ravi", "Zara", "Diego", "Ingrid", "Yusuf", "Mei",
  "Tunde", "Hana", "Marco", "Priya", "Noah", "Layla", "Ivan", "Amara",
  "Felix", "Chloe", "Ade", "Rosa", "Sven", " Imani", "Leon", "Yara",
];

export const LAST_NAMES = [
  "Okafor", "Smith", "Chen", "Garcia", "Kim", "Hassan", "Johnson", "Muller",
  "Silva", "Nakamura", "Ali", "Brown", "Adeyemi", "Rossi", "Patel", "Dubois",
  "Wang", "Anderson", "Ibrahim", "Novak", "Costa", "Larsson", "Mensah", "Reyes",
  "Khan", "Lopez", "Bauer", "Osei", "Petrov", "Nguyen",
];

export const CITIES = [
  { city: "New York", country: "USA", lat: 40.71, lng: -74.0 },
  { city: "London", country: "UK", lat: 51.5, lng: -0.12 },
  { city: "Lagos", country: "Nigeria", lat: 6.52, lng: 3.37 },
  { city: "Dubai", country: "UAE", lat: 25.2, lng: 55.27 },
  { city: "Singapore", country: "Singapore", lat: 1.35, lng: 103.8 },
  { city: "Toronto", country: "Canada", lat: 43.65, lng: -79.38 },
  { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.4 },
  { city: "São Paulo", country: "Brazil", lat: -23.55, lng: -46.63 },
];

export const RESTAURANT_ITEMS = [
  { name: "Margherita Pizza", category: "Pizza", price: 14.5 },
  { name: "Pepperoni Pizza", category: "Pizza", price: 16.9 },
  { name: "Classic Burger", category: "Burgers", price: 12.0 },
  { name: "Chicken Wings (12)", category: "Starters", price: 11.5 },
  { name: "Caesar Salad", category: "Salads", price: 9.5 },
  { name: "Spaghetti Carbonara", category: "Pasta", price: 15.0 },
  { name: "Garlic Bread", category: "Sides", price: 5.0 },
  { name: "Tiramisu", category: "Desserts", price: 7.5 },
  { name: "Cappuccino", category: "Drinks", price: 4.0 },
  { name: "Fresh Lemonade", category: "Drinks", price: 4.5 },
  { name: "Grilled Salmon", category: "Mains", price: 22.0 },
  { name: "Cheesecake", category: "Desserts", price: 6.9 },
];

export const INTENTS = [
  "Place order",
  "Reserve table",
  "Book room",
  "Check availability",
  "Track delivery",
  "Reschedule booking",
  "Cancel booking",
  "Ask menu question",
  "Request refund",
  "Book appointment",
  "Product inquiry",
  "Billing question",
  "Complaint",
  "Loyalty inquiry",
  "Upsell accepted",
];

export const LANG_CODES = ["English", "Spanish", "French", "Arabic", "Mandarin", "Hindi", "Portuguese"];

export const DEPARTMENTS = [
  { name: "Reservations", color: "#3A86FF" },
  { name: "Support", color: "#00C896" },
  { name: "Sales", color: "#C9A227" },
  { name: "Kitchen", color: "#FF4D4F" },
  { name: "Front Desk", color: "#6BA5FF" },
  { name: "Management", color: "#E0C158" },
];

export const TAGS = ["VIP", "Regular", "New", "At-risk", "High-value", "Corporate", "Loyalty", "Wholesale"];

export const KNOWLEDGE_DOCS = [
  { name: "Full Menu 2026.pdf", type: "menu", category: "Menu" },
  { name: "Allergen Guide.pdf", type: "policy", category: "Compliance" },
  { name: "Refund Policy.docx", type: "policy", category: "Policies" },
  { name: "Room Rates Q3.xlsx", type: "pricelist", category: "Pricing" },
  { name: "FAQ - Bookings.txt", type: "faq", category: "FAQ" },
  { name: "Wine List.pdf", type: "catalog", category: "Menu" },
  { name: "Loyalty Program Terms.pdf", type: "contract", category: "Policies" },
  { name: "Delivery Zones.csv", type: "csv", category: "Operations" },
  { name: "Brand Guidelines.pptx", type: "powerpoint", category: "Brand" },
  { name: "Seasonal Promotions.pdf", type: "policy", category: "Promotions" },
  { name: "Staff Handbook.docx", type: "word", category: "HR" },
  { name: "Product Catalog.pdf", type: "catalog", category: "Catalog" },
  { name: "https://company.com/faq", type: "url", category: "FAQ" },
  { name: "Insurance Partners.xlsx", type: "excel", category: "Compliance" },
];

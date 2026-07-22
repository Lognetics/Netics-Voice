/** Static name/value pools used by the deterministic mock generators.
 *  Nigerian-first, mixed with other countries for a realistic global demo. */

export const FIRST_NAMES = [
  "Chinedu", "Adebayo", "Ngozi", "Emeka", "Yetunde", "Ifeoma", "Oluwaseun",
  "Chiamaka", "Tunde", "Amara", "Folake", "Obinna", "Zainab", "Musa",
  "Blessing", "Chidi", "Nnamdi", "Temitope", "Bukola", "Segun", "Uche",
  "Damilola", "Kelechi", "Funke", "Ibrahim", "Aisha", "Yusuf", "Halima",
  "Ikenna", "Ada", "Kwame", "Fatima",
  // international mix
  "James", "Maria", "David", "Sarah", "Chen", "Olivia", "Sofia", "Emma",
  "Lucas", "Priya", "Mei", "Diego",
];

export const LAST_NAMES = [
  "Okafor", "Adeyemi", "Okonkwo", "Balogun", "Eze", "Afolabi", "Ogunleye",
  "Nwosu", "Chukwu", "Adeleke", "Bello", "Danjuma", "Okoro", "Abubakar",
  "Nwachukwu", "Olawale", "Adewale", "Uzoma", "Mohammed", "Obi", "Aliyu",
  "Ogundipe", "Ibrahim", "Oyelaran",
  // international mix
  "Smith", "Chen", "Garcia", "Kim", "Silva", "Patel", "Nguyen", "Johnson",
  "Rossi", "Mensah", "Osei",
];

export const CITIES = [
  // Nigeria first (branches use the first six)
  { city: "Lagos", country: "Nigeria", lat: 6.45, lng: 3.42 },
  { city: "Abuja", country: "Nigeria", lat: 9.07, lng: 7.49 },
  { city: "Port Harcourt", country: "Nigeria", lat: 4.82, lng: 7.03 },
  { city: "Ibadan", country: "Nigeria", lat: 7.38, lng: 3.9 },
  { city: "Kano", country: "Nigeria", lat: 12.0, lng: 8.52 },
  { city: "Enugu", country: "Nigeria", lat: 6.44, lng: 7.5 },
  // other countries
  { city: "Accra", country: "Ghana", lat: 5.6, lng: -0.19 },
  { city: "Nairobi", country: "Kenya", lat: -1.29, lng: 36.82 },
  { city: "London", country: "UK", lat: 51.5, lng: -0.12 },
  { city: "New York", country: "USA", lat: 40.71, lng: -74.0 },
  { city: "Dubai", country: "UAE", lat: 25.2, lng: 55.27 },
  { city: "Toronto", country: "Canada", lat: 43.65, lng: -79.38 },
];

/** Real Nigerian street names for branch addresses. */
export const NG_STREETS = [
  "Adeola Odeku Street",
  "Admiralty Way",
  "Awolowo Road",
  "Allen Avenue",
  "Aminu Kano Crescent",
  "Ahmadu Bello Way",
  "Herbert Macaulay Way",
  "Ogui Road",
  "Aba Road",
  "Ring Road",
];

export const RESTAURANT_ITEMS = [
  // Nigerian favourites
  { name: "Jollof Rice & Chicken", category: "Mains", price: 12.5 },
  { name: "Suya Platter", category: "Grills", price: 9.0 },
  { name: "Pounded Yam & Egusi", category: "Mains", price: 13.0 },
  { name: "Pepper Soup", category: "Starters", price: 8.5 },
  { name: "Small Chops Combo", category: "Starters", price: 7.0 },
  { name: "Puff Puff (6)", category: "Sides", price: 3.5 },
  { name: "Chapman", category: "Drinks", price: 4.5 },
  // international
  { name: "Margherita Pizza", category: "Pizza", price: 14.5 },
  { name: "Pepperoni Pizza", category: "Pizza", price: 16.9 },
  { name: "Classic Burger", category: "Burgers", price: 12.0 },
  { name: "Chicken Wings (12)", category: "Starters", price: 11.5 },
  { name: "Caesar Salad", category: "Salads", price: 9.5 },
  { name: "Grilled Salmon", category: "Mains", price: 22.0 },
  { name: "Cappuccino", category: "Drinks", price: 4.0 },
  { name: "Tiramisu", category: "Desserts", price: 7.5 },
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

export const LANG_CODES = ["English", "Pidgin", "Yoruba", "Igbo", "Hausa", "French", "Arabic"];

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
  { name: "Delivery Zones - Lagos.csv", type: "csv", category: "Operations" },
  { name: "Brand Guidelines.pptx", type: "powerpoint", category: "Brand" },
  { name: "Seasonal Promotions.pdf", type: "policy", category: "Promotions" },
  { name: "Staff Handbook.docx", type: "word", category: "HR" },
  { name: "Product Catalog.pdf", type: "catalog", category: "Catalog" },
  { name: "https://company.com/faq", type: "url", category: "FAQ" },
  { name: "Insurance Partners.xlsx", type: "excel", category: "Compliance" },
];

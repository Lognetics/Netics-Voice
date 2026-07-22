import type { Industry, IndustryTemplate } from "@/types";

/** Fixed reference "now" so all mock timestamps stay deterministic (no hydration drift). */
export const NOW = new Date("2026-07-21T14:30:00.000Z");

export const BRAND = {
  name: "NETICS Voice",
  tagline: "The AI Employee That Never Misses a Customer.",
  colors: {
    primary: "#0B0F1A",
    secondary: "#151C2E",
    gold: "#C9A227",
    blue: "#3A86FF",
    green: "#00C896",
    danger: "#FF4D4F",
  },
};

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Arabic",
  "Mandarin",
  "Hindi",
  "Portuguese",
  "German",
  "Yoruba",
  "Swahili",
];

export const VOICES = [
  { id: "aria", name: "Aria", gender: "female", accent: "US", tone: "Warm" },
  { id: "atlas", name: "Atlas", gender: "male", accent: "US", tone: "Confident" },
  { id: "luna", name: "Luna", gender: "female", accent: "UK", tone: "Calm" },
  { id: "kai", name: "Kai", gender: "male", accent: "AU", tone: "Friendly" },
  { id: "nova", name: "Nova", gender: "female", accent: "Neutral", tone: "Professional" },
  { id: "sol", name: "Sol", gender: "male", accent: "ES", tone: "Energetic" },
];

export const INDUSTRY_LABELS: Record<Industry, string> = {
  restaurant: "Restaurant",
  hotel: "Hotel",
  hospital: "Hospital",
  clinic: "Clinic",
  school: "School",
  bank: "Bank",
  insurance: "Insurance",
  real_estate: "Real Estate",
  government: "Government",
  retail: "Retail",
  ecommerce: "E-commerce",
  travel: "Travel",
  logistics: "Logistics",
  law_firm: "Law Firm",
  salon: "Beauty Salon",
  gym: "Gym",
  automotive: "Automotive",
};

/** Curated set of industry templates used in onboarding + AI Studio. */
export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    industry: "restaurant",
    label: "Restaurant",
    icon: "UtensilsCrossed",
    tagline: "Take orders, book tables, upsell - 24/7.",
    color: "#FF4D4F",
    knowledgeCategories: ["Menu", "Allergens", "Promotions", "Delivery Zones"],
    sampleIntents: ["Place order", "Reserve table", "Ask menu", "Track delivery"],
    bookingFields: ["Party size", "Date & time", "Seating preference"],
    orderFlow: ["Browse menu", "Add items", "Upsell", "Confirm", "Pay"],
    greeting:
      "Thanks for calling Bella Cucina! I can take your order or book a table - what can I get started for you?",
    sampleConversation: [
      { role: "customer", text: "Hi, I'd like to order a large pepperoni pizza." },
      {
        role: "ai",
        text: "Great choice! Would you like to make it a combo with garlic bread and a drink for just $4 more?",
      },
      { role: "customer", text: "Sure, that sounds good." },
      {
        role: "ai",
        text: "Perfect. That's one large pepperoni combo - $18.90. Delivery to your usual address on Oak Street?",
      },
    ],
  },
  {
    industry: "hotel",
    label: "Hotel",
    icon: "BedDouble",
    tagline: "Book rooms, upsell suites, handle every request.",
    color: "#C9A227",
    knowledgeCategories: ["Room Types", "Amenities", "Rates", "Policies"],
    sampleIntents: ["Book room", "Check availability", "Room service", "Late checkout"],
    bookingFields: ["Check-in", "Check-out", "Guests", "Room type"],
    orderFlow: ["Check availability", "Recommend room", "Add extras", "Confirm", "Pay"],
    greeting:
      "Welcome to The Grand Aurora. I can check availability and book your perfect room - when are you planning to stay?",
    sampleConversation: [
      { role: "customer", text: "I need a room for this weekend." },
      {
        role: "ai",
        text: "We have three options available. Based on your stay, I'd recommend the Executive Suite - only $30 more and it includes breakfast and airport pickup.",
      },
    ],
  },
  {
    industry: "hospital",
    label: "Hospital",
    icon: "Stethoscope",
    tagline: "Schedule appointments, route emergencies, remind patients.",
    color: "#00C896",
    knowledgeCategories: ["Departments", "Doctors", "Insurance", "Procedures"],
    sampleIntents: ["Book appointment", "Doctor availability", "Lab booking", "Emergency"],
    bookingFields: ["Department", "Doctor", "Date", "Insurance"],
    orderFlow: ["Verify patient", "Select department", "Find slot", "Confirm", "Remind"],
    greeting:
      "Thank you for calling St. Mary's. I can help you book an appointment or check doctor availability. How can I help?",
    sampleConversation: [
      { role: "customer", text: "I'd like to see a cardiologist." },
      {
        role: "ai",
        text: "Dr. Chen has an opening Thursday at 10am, or Dr. Okafor on Friday at 2pm. Which works better for you?",
      },
    ],
  },
  {
    industry: "real_estate",
    label: "Real Estate",
    icon: "Building2",
    tagline: "Qualify leads, book inspections, answer inquiries.",
    color: "#3A86FF",
    knowledgeCategories: ["Listings", "Pricing", "Mortgage", "Neighborhoods"],
    sampleIntents: ["Book inspection", "Property inquiry", "Mortgage info", "Schedule meeting"],
    bookingFields: ["Property", "Date", "Contact", "Budget"],
    orderFlow: ["Capture requirements", "Match listings", "Book viewing", "Follow up"],
    greeting:
      "Hi, thanks for calling Skyline Realty! Are you looking to buy, rent, or book a viewing today?",
    sampleConversation: [
      { role: "customer", text: "I'm looking for a 2-bedroom apartment downtown." },
      {
        role: "ai",
        text: "I have four listings that match. The one on 5th Ave has a rooftop pool and is within your budget - would you like to book a viewing this week?",
      },
    ],
  },
  {
    industry: "salon",
    label: "Beauty Salon",
    icon: "Scissors",
    tagline: "Fill your calendar, reduce no-shows, upsell services.",
    color: "#E0C158",
    knowledgeCategories: ["Services", "Stylists", "Pricing", "Products"],
    sampleIntents: ["Book appointment", "Reschedule", "Service info", "Stylist availability"],
    bookingFields: ["Service", "Stylist", "Date & time"],
    orderFlow: ["Choose service", "Pick stylist", "Find slot", "Confirm", "Remind"],
    greeting:
      "Hi, welcome to Luxe Studio! Would you like to book a cut, color, or something else today?",
    sampleConversation: [
      { role: "customer", text: "Can I book a haircut for Saturday?" },
      {
        role: "ai",
        text: "Of course! Maria has 11am or 3pm open. She's fantastic with your hair type. Which time suits you?",
      },
    ],
  },
  {
    industry: "bank",
    label: "Bank",
    icon: "Landmark",
    tagline: "Verify customers, handle inquiries, block cards instantly.",
    color: "#6BA5FF",
    knowledgeCategories: ["Accounts", "Loans", "Cards", "Compliance"],
    sampleIntents: ["Balance inquiry", "Block card", "Loan application", "Open account"],
    bookingFields: ["Service", "Branch", "Date"],
    orderFlow: ["Verify identity", "Understand request", "Execute", "Confirm"],
    greeting:
      "Thank you for calling Meridian Bank. For your security, I'll need to verify your identity. How can I help today?",
    sampleConversation: [
      { role: "customer", text: "I lost my card and need to block it." },
      {
        role: "ai",
        text: "I understand - let's secure your account right away. I've verified your identity and blocked the card ending 4471. A replacement will arrive in 3 days.",
      },
    ],
  },
  {
    industry: "ecommerce",
    label: "E-commerce",
    icon: "ShoppingBag",
    tagline: "Track orders, process returns, recommend products.",
    color: "#00C896",
    knowledgeCategories: ["Catalog", "Shipping", "Returns", "Promotions"],
    sampleIntents: ["Track order", "Return item", "Product search", "Refund"],
    bookingFields: [],
    orderFlow: ["Find product", "Add to cart", "Upsell", "Checkout"],
    greeting:
      "Hi! Thanks for reaching out to Nimbus Store. I can track an order, start a return, or help you find something new.",
    sampleConversation: [
      { role: "customer", text: "Where's my order?" },
      {
        role: "ai",
        text: "Your order #NB-2231 is out for delivery and will arrive today by 6pm. Want me to text you the live tracking link?",
      },
    ],
  },
  {
    industry: "gym",
    label: "Gym",
    icon: "Dumbbell",
    tagline: "Book classes, manage memberships, reduce churn.",
    color: "#C9A227",
    knowledgeCategories: ["Classes", "Trainers", "Memberships", "Facilities"],
    sampleIntents: ["Book class", "Membership info", "Trainer booking", "Freeze membership"],
    bookingFields: ["Class", "Trainer", "Date & time"],
    orderFlow: ["Choose class", "Check capacity", "Book", "Remind"],
    greeting:
      "Hey, welcome to PulseFit! Want to book a class, meet a trainer, or ask about memberships?",
    sampleConversation: [
      { role: "customer", text: "Is there a spin class tonight?" },
      {
        role: "ai",
        text: "Yes! 7pm with Coach Dee - 3 spots left. Want me to reserve one for you?",
      },
    ],
  },
];

export function getTemplate(industry: Industry): IndustryTemplate | undefined {
  return INDUSTRY_TEMPLATES.find((t) => t.industry === industry);
}

// ==================== COMPANY AND PRODUCT DATA ====================

const companiesData = [
    {
        id: 1,
        name: "Tech Solutions",
        logo: "🔧",
        bgColor: "#667eea",
        products: [
            { id: 101, name: "Wireless Mouse", price: 1299, gram: "120g", stock: 50, image: "🖱️" },
            { id: 102, name: "Mechanical Keyboard", price: 4999, gram: "980g", stock: 30, image: "⌨️" },
            { id: 103, name: "USB Hub", price: 899, gram: "85g", stock: 100, image: "🔌" }
        ]
    },
    {
        id: 2,
        name: "Home Essentials",
        logo: "🏠",
        bgColor: "#f093fb",
        products: [
            { id: 201, name: "Kitchen Knife Set", price: 2499, gram: "450g", stock: 25, image: "🔪" },
            { id: 202, name: "Glass Storage Jars", price: 799, gram: "1200g", stock: 60, image: "🫙" },
            { id: 203, name: "LED Bulbs Pack", price: 599, gram: "240g", stock: 150, image: "💡" }
        ]
    },
    {
        id: 3,
        name: "Fashion Hub",
        logo: "👔",
        bgColor: "#4facfe",
        products: [
            { id: 301, name: "Cotton T-Shirt", price: 599, gram: "180g", stock: 75, image: "👕" },
            { id: 302, name: "Denim Jeans", price: 1999, gram: "550g", stock: 40, image: "👖" },
            { id: 303, name: "Sneakers", price: 2499, gram: "800g", stock: 35, image: "👟" }
        ]
    },
    {
        id: 4,
        name: "Beauty Care",
        logo: "💄",
        bgColor: "#43e97b",
        products: [
            { id: 401, name: "Face Cream", price: 899, gram: "50g", stock: 80, image: "🧴" },
            { id: 402, name: "Shampoo", price: 449, gram: "200ml", stock: 100, image: "🧴" },
            { id: 403, name: "Lipstick", price: 599, gram: "4g", stock: 60, image: "💄" }
        ]
    },
    {
        id: 5,
        name: "Sports Gear",
        logo: "⚽",
        bgColor: "#fa709a",
        products: [
            { id: 501, name: "Yoga Mat", price: 1299, gram: "1200g", stock: 45, image: "🧘" },
            { id: 502, name: "Dumbbells Set", price: 2999, gram: "5000g", stock: 20, image: "🏋️" },
            { id: 503, name: "Resistance Bands", price: 799, gram: "150g", stock: 70, image: "🎽" }
        ]
    },
    {
        id: 6,
        name: "Books Corner",
        logo: "📚",
        bgColor: "#30cfd0",
        products: [
            { id: 601, name: "Fiction Novel", price: 399, gram: "350g", stock: 90, image: "📖" },
            { id: 602, name: "Cookbook", price: 699, gram: "600g", stock: 50, image: "📕" },
            { id: 603, name: "Self-Help Guide", price: 499, gram: "280g", stock: 65, image: "📗" }
        ]
    },
    {
        id: 7,
        name: "Pet Paradise",
        logo: "🐾",
        bgColor: "#a8edea",
        products: [
            { id: 701, name: "Dog Food", price: 1499, gram: "3000g", stock: 40, image: "🦴" },
            { id: 702, name: "Cat Toy", price: 299, gram: "50g", stock: 85, image: "🐱" },
            { id: 703, name: "Pet Bed", price: 1999, gram: "1500g", stock: 25, image: "🛏️" }
        ]
    },
    {
        id: 8,
        name: "Garden Tools",
        logo: "🌱",
        bgColor: "#ff9a56",
        products: [
            { id: 801, name: "Plant Seeds", price: 199, gram: "20g", stock: 150, image: "🌾" },
            { id: 802, name: "Watering Can", price: 599, gram: "400g", stock: 55, image: "💧" },
            { id: 803, name: "Garden Gloves", price: 299, gram: "100g", stock: 70, image: "🧤" }
        ]
    },
    {
        id: 9,
        name: "Baby World",
        logo: "👶",
        bgColor: "#2e2e78",
        products: [
            { id: 901, name: "Baby Bottle", price: 399, gram: "150g", stock: 80, image: "🍼" },
            { id: 902, name: "Diapers Pack", price: 899, gram: "2000g", stock: 60, image: "🧷" },
            { id: 903, name: "Baby Wipes", price: 249, gram: "500g", stock: 100, image: "🧻" }
        ]
    },
    {
        id: 10,
        name: "Office Supplies",
        logo: "📎",
        bgColor: "#000000",
        products: [
            { id: 1001, name: "Notebook", price: 149, gram: "200g", stock: 120, image: "📓" },
            { id: 1002, name: "Pen Set", price: 299, gram: "80g", stock: 90, image: "🖊️" },
            { id: 1003, name: "Desk Organizer", price: 799, gram: "600g", stock: 45, image: "📋" }
        ]
    }
];
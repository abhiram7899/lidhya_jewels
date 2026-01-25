// --- 1. CONFIGURATION ---
const SUPABASE_URL = 'https://unuswepvspaxyepakkkn.supabase.co';

// ⚠️ Ensure this key matches your admin.html key
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudXN3ZXB2c3BheHllcGFra2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjUyNjAsImV4cCI6MjA4NDI0MTI2MH0.D-sL54xnijvTu6CvDu29n20zbW1rZJNdAo6MXlsMm4w'; 

// Your Instagram Username (No @ symbol)
const instagramUsername = "lidhya_thejewelhouse"; // <--- CHANGE THIS TO YOUR ACTUAL USERNAME

// Initialize Supabase
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables
let allProducts = [];
let currentProduct = null;

// --- 2. FETCH PRODUCTS ---
async function fetchProducts() {
    const container = document.getElementById('product-container');
    container.innerHTML = '<p class="loading-text">Loading Collection...</p>';

    // Fetch from Supabase (Newest first)
    let { data, error } = await db
        .from('products')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error("Error:", error);
        container.innerHTML = '<p>Error loading products. Please try again.</p>';
        return;
    }

    allProducts = data;
    renderProducts(allProducts);
}

// --- 3. RENDER PRODUCTS ---
function renderProducts(products) {
    const container = document.getElementById('product-container');
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found in this category.</p>';
        return;
    }

    container.innerHTML = products.map(product => {
        // Logic for Sold Out Badge
        const isSoldOut = product.sold_out === true;
        const soldBadge = isSoldOut ? '<span class="sold-out-badge">SOLD OUT</span>' : '';
        const cardClass = isSoldOut ? 'product-card sold-out' : 'product-card';
        // Disable click if sold out
        const clickAction = isSoldOut ? '' : `onclick="openModal(${product.id})"`;

        return `
            <div class="${cardClass}" ${clickAction}>
                <div class="img-container">
                    ${soldBadge}
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">${product.price}</p>
                </div>
            </div>
        `;
    }).join('');
}

// --- 4. FILTER CATEGORIES ---
window.filterProducts = function(category, btnElement) {
    // 1. Remove 'active' class from all buttons
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 2. Add 'active' class to the clicked button
    if (btnElement) {
        btnElement.classList.add('active');
    }

    // 3. Filter Data
    if (category === 'all') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
};

// --- 5. MODAL (POPUP) LOGIC ---
const modal = document.getElementById('product-modal');

window.openModal = function(id) {
    // Find product details
    currentProduct = allProducts.find(p => p.id === id);
    
    if (!currentProduct) return;

    // Fill Modal Data
    document.getElementById('modal-img').src = currentProduct.image;
    document.getElementById('modal-title').innerText = currentProduct.name;
    document.getElementById('modal-category').innerText = currentProduct.category.toUpperCase();
    document.getElementById('modal-price').innerText = currentProduct.price;
    document.getElementById('modal-desc').innerText = currentProduct.description || "No description available.";

    // Show Modal
    modal.style.display = 'flex';
};

window.closeModal = function() {
    modal.style.display = 'none';
};

// Close modal if clicking outside the box
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
};

// --- 6. SMART INSTAGRAM BUY BUTTON ---
window.buyOnInstagram = function() {
    if (!currentProduct) return;
    
    // 1. Create the message
    const message = `Hi Lidhya! I want to buy: ${currentProduct.name} (${currentProduct.price})`;

    // 2. Copy to Clipboard
    navigator.clipboard.writeText(message).then(() => {
        
        // 3. Notify User
        const proceed = confirm("✅ Message copied to clipboard!\n\nClick OK to open Instagram, then PASTE the message in the chat.");
        
        if (proceed) {
            // 4. Open Instagram Direct Message
            // Uses 'ig.me' shortlink which handles app opening better
            window.location.href = `https://ig.me/m/${instagramUsername}`; 
        }

    }).catch(err => {
        // Fallback if clipboard fails (rare)
        console.error("Clipboard failed", err);
        // Try the old way as a backup
        window.location.href = `https://ig.me/m/${instagramUsername}?text=${encodeURIComponent(message)}`;
    });
};

// Load products on start
fetchProducts();
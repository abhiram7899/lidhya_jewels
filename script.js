/* =========================================
   LIDHYA - SUPABASE CONNECTION (FINAL)
   ========================================= */

// 1. SUPABASE CONFIGURATION
// I found this URL from the image link you shared:
const SUPABASE_URL = 'https://unuswepvspaxyepakkkn.supabase.co';

// 🛑 STOP! PASTE YOUR KEY BELOW 🛑
// Go to Supabase > Settings > API > Project API Keys > anon / public
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudXN3ZXB2c3BheHllcGFra2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjUyNjAsImV4cCI6MjA4NDI0MTI2MH0.D-sL54xnijvTu6CvDu29n20zbW1rZJNdAo6MXlsMm4w'; 

// Initialize the client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Global State
let products = [];
const instagramUsername = "lidhya_thejewelhouse"; 

// 2. MOBILE MENU
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// 3. FETCH DATA FROM SUPABASE
async function fetchProducts() {
    const productContainer = document.getElementById('product-container');
    
    // Show loading state
    if(productContainer) {
        productContainer.innerHTML = '<p style="color:white; text-align:center; grid-column:1/-1;">Loading Collection...</p>';
    }

    try {
        // Fetch data from 'products' table
        let { data, error } = await db
            .from('products')
            .select('*');

        if (error) throw error;

        products = data;
        
        if(productContainer) {
            displayProducts(products);
        }
    } catch (error) {
        console.error("Error loading products:", error);
        if(productContainer) {
            productContainer.innerHTML = '<p style="color:red; text-align:center; grid-column:1/-1;">Failed to load products.</p>';
        }
    }
}

// 4. DISPLAY PRODUCTS
function displayProducts(items) {
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return;

    if (items.length === 0) {
        productContainer.innerHTML = `<p style="text-align:center; width:100%; grid-column: 1/-1;">No products found.</p>`;
        return;
    }

    productContainer.innerHTML = items.map(product => {
        // Handle Sold Out Logic
        const isSoldOut = product.sold_out === true;
        const buttonAction = isSoldOut ? '' : `onclick="openModal(${product.id})"`;
        const imageClass = isSoldOut ? 'style="opacity: 0.5;"' : '';
        const badge = isSoldOut ? '<div style="position:absolute; top:10px; right:10px; background:red; color:white; padding:5px 10px; font-size:0.8rem; border-radius:4px;">SOLD OUT</div>' : '';

        // FIX: Ensure you are using backticks (`) below, not single quotes (')
        return `
        <div class="product-card" ${buttonAction} style="position:relative;">
            ${badge}
            <img src="${product.image}" alt="${product.name}" ${imageClass} loading="lazy">
            <div class="product-info">
                <h3>${product.name}</h3>
                <span>${product.price}</span>
            </div>
        </div>
        `;
    }).join('');
}
// 5. FILTER FUNCTION
window.filterProducts = function(category, btn) {
    let allButtons = document.querySelectorAll('.cat-btn');
    allButtons.forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const catLower = category.toLowerCase();
    if (catLower === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category.toLowerCase() === catLower);
        displayProducts(filtered);
    }
};

// 6. MODAL & INSTAGRAM LOGIC
const modal = document.getElementById('product-modal');
let currentProduct = null;

window.openModal = function(id) {
    const product = products.find(p => p.id === id);
    if(!product) return;

    currentProduct = product;

    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-title').innerText = product.name;
    
    // ✅ THIS IS THE FIX YOU ASKED FOR
    // We use .description instead of .desc
    document.getElementById('modal-desc').innerText = product.description;
    
    document.getElementById('modal-price').innerText = product.price;
    document.getElementById('modal-category').innerText = product.category.toUpperCase();
    
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
};

window.closeModal = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
};

window.onclick = function(event) {
    if (event.target == modal) closeModal();
};

window.buyOnInstagram = function() {
    if (!currentProduct) return;
    const message = `Hi Lidhya! I want to buy: ${currentProduct.name} (${currentProduct.price})`;
    const url = `https://ig.me/m/${instagramUsername}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('product-container')) {
        fetchProducts();
    }
});
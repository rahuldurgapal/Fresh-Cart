// Dummy Product Data
const products = [
    {
        id: 1,
        title: "Organic Bananas",
        category: "Fruits",
        price: 3.99,
        unit: "/ bunch",
        image: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?q=80&w=400&auto=format&fit=crop",
        badge: "Fresh"
    },
    {
        id: 2,
        title: "Green Broccoli",
        category: "Vegetables",
        price: 2.49,
        unit: "/ lb",
        image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Whole Milk",
        category: "Dairy",
        price: 4.50,
        unit: "/ gal",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop",
        badge: "Local"
    },
    {
        id: 4,
        title: "Sourdough Bread",
        category: "Bakery",
        price: 5.99,
        unit: "/ loaf",
        image: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 5,
        title: "Red Apples",
        category: "Fruits",
        price: 4.99,
        unit: "/ bag",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?q=80&w=400&auto=format&fit=crop",
        badge: "Sale"
    },
    {
        id: 6,
        title: "Free Range Eggs",
        category: "Dairy",
        price: 6.99,
        unit: "/ dozen",
        image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 7,
        title: "Chicken Breast",
        category: "Meat",
        price: 8.99,
        unit: "/ lb",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 8,
        title: "Carrots",
        category: "Vegetables",
        price: 1.99,
        unit: "/ bunch",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400&auto=format&fit=crop"
    }
];

// Initialize Cart from LocalStorage
let cart = JSON.parse(localStorage.getItem('freshCart')) || [];

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Only run on the products page
    const productsContainer = document.getElementById('products-container');
    // If not on categories page, group by default
    const isCategoriesPage = document.getElementById('category-sidebar') !== null;
    
    if (productsContainer && !isCategoriesPage) {
        renderProducts(products, true);
        setupCategoryFilters();
    }
    
    // Update Cart UI globally
    updateCartUI();
});

// Render Products
function renderProducts(productsToRender, groupBy = false) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '';
    
    if (productsToRender.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #7f8c8d;">No products found.</p>';
        return;
    }

    if (groupBy) {
        container.style.display = 'block'; // Override CSS grid
        
        const grouped = productsToRender.reduce((acc, product) => {
            if (!acc[product.category]) acc[product.category] = [];
            acc[product.category].push(product);
            return acc;
        }, {});
        
        for (const [category, items] of Object.entries(grouped)) {
            const section = document.createElement('div');
            section.className = 'category-group-section';
            section.style.marginBottom = '2.5rem';
            
            section.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2 style="font-size: 1.5rem; color: var(--text-dark);">${category}</h2>
                    <a href="categories.html?cat=${category}" style="color: var(--primary); font-weight: 600; font-size: 0.9rem;">See All <i class="fa-solid fa-angle-right"></i></a>
                </div>
                <div class="products-horizontal-scroll" style="display: flex; gap: 1.2rem; overflow-x: auto; padding-bottom: 1rem; scrollbar-width: none;">
                    <!-- Items -->
                </div>
            `;
            
            const scrollContainer = section.querySelector('.products-horizontal-scroll');
            items.forEach((product, index) => {
                const card = createProductCard(product, index);
                card.style.minWidth = '200px'; 
                card.style.flexShrink = '0';
                scrollContainer.appendChild(card);
            });
            container.appendChild(section);
        }
    } else {
        container.style.display = ''; // Revert to CSS grid
        productsToRender.forEach((product, index) => {
            const card = createProductCard(product, index);
            container.appendChild(card);
        });
    }
}

function createProductCard(product, index) {
    const delay = index * 0.05;
    const inrPrice = Math.round(product.price * 80);
    const mrpPrice = Math.round(inrPrice * 1.15); // Add a 15% markup for MRP dummy data
    
    // Convert unit text format slightly (e.g. "/ bunch" -> "1 bunch")
    const formattedUnit = product.unit.replace('/', '1 ');
    
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    card.style.animationDelay = `${delay}s`;
    
    card.innerHTML = `
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <img src="${product.image}" alt="${product.title}" class="product-img">
        <h3 class="product-title">${product.title}</h3>
        <div class="product-unit">${formattedUnit}</div>
        <div class="product-footer">
            <div class="price-container">
                <span class="product-price">Rs. ${inrPrice}</span>
                <span class="product-mrp">Rs. ${mrpPrice}</span>
            </div>
            <button class="add-to-cart" onclick="addToCart(event, ${product.id}, ${inrPrice})">
                Add
            </button>
        </div>
    `;
    
    return card;
}

// Setup Category Filtering
function setupCategoryFilters() {
    const catButtons = document.querySelectorAll('.cat-btn');
    
    catButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            catButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked
            e.target.classList.add('active');
            
            // Filter products
            const filterValue = e.target.getAttribute('data-filter');
            
            if (filterValue === 'All') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === filterValue);
                renderProducts(filtered);
            }
        });
    });
}

// Global Add to Cart function
window.addToCart = function(event, productId, inrPrice) {
    event.preventDefault();
    event.stopPropagation();
    
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if item exists in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            image: product.image,
            unit: product.unit,
            price: inrPrice,
            quantity: 1
        });
    }
    
    // Save to LocalStorage
    localStorage.setItem('freshCart', JSON.stringify(cart));
    
    // Update Global UI
    updateCartUI();
    
    // Button Animation
    const btn = event.currentTarget;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = 'scale(1)', 150);
}

// Global UI Update
window.updateCartUI = function() {
    const itemCountEl = document.getElementById('cart-item-count');
    const totalPriceEl = document.getElementById('cart-total-price');
    
    if (itemCountEl && totalPriceEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        itemCountEl.innerText = `${totalItems} items`;
        totalPriceEl.innerText = `₹${totalPrice}`;
    }
}

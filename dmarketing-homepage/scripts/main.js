const products = [
    { title: "SEO Audit Package", category: "SEO", description: "Full website audit, keyword research, and optimization plan.", price: "$199", url: "product.html" },
    { title: "Email Campaign Setup", category: "Email Marketing", description: "Design and launch targeted email campaigns with automation.", price: "$149", url: "product-email.html" },
    { title: "Social Media Growth Plan", category: "Social Media Marketing", description: "Strategy for organic growth, engagement, and content planning.", price: "$179", url: "product-social.html" },
    { title: "Mobile App Promotion", category: "Mobile Marketing", description: "Drive installs and engagement through mobile-first advertising.", price: "$169", url: "MobileMarketing.html" },
    { title: "Affiliate Program Launch", category: "Affiliate Marketing", description: "Set up affiliate tracking, partners, and commission structures.", price: "$229", url: "product-affiliate.html" },
    { title: "PPC Starter Campaign", category: "PPC", description: "Paid search campaign setup with keyword selection and tracking.", price: "$189", url: "product-ppc.html" }
];

const catalogGrid = document.getElementById("catalog-grid");
const searchInput = document.getElementById("catalog-search");
const categorySelect = document.getElementById("catalog-category");

function renderCatalog(items) {
    console.log("Rendering catalog with", items.length, "items"); // Debug
    catalogGrid.innerHTML = "";
    if (!items.length) {
        catalogGrid.innerHTML = "<p class='empty-state'>No products match your search.</p>";
        return;
    }
    items.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";
        // Check if product is in cart to add selected class
        const isInCart = cart.some(item => item.title === product.title);
        if (isInCart) {
            card.classList.add("selected");
        }
        card.innerHTML = `
            <span class="product-category">${product.category}</span>
            <h3><a href="${product.url}" class="product-detail-link">${product.title}</a></h3>
            <p>${product.description}</p>
            <div class="product-meta">${product.price}</div>
            <div class="product-card-actions">
                <a href="${product.url}" class="view-details-btn">View Details</a>
                <button type="button" class="add-to-cart-btn" data-title="${product.title}">Add to Cart</button>
            </div>
        `;
        catalogGrid.appendChild(card);
    });
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", event => {
            const title = event.currentTarget.dataset.title;
            const product = products.find(item => item.title === title);
            if (product) {
                console.log("Adding to cart:", product); // Debug
                addToCart(product);
                // Add animation
                event.currentTarget.classList.add("animate");
                setTimeout(() => event.currentTarget.classList.remove("animate"), 600);
                // Re-render to update selected state
                applyFilters();
            }
        });
    });
}

function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const filtered = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
        const matchesCategory = category === "all" || product.category === category;
        return matchesSearch && matchesCategory;
    });
    renderCatalog(filtered);
}

searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing catalog"); // Debug
    renderCatalog(products);
});
const products = [
    { title: "SEO Audit Package", category: "SEO", description: "Full website audit, keyword research, and optimization plan.", price: "$199" },
    { title: "Email Campaign Setup", category: "Email Marketing", description: "Design and launch targeted email campaigns with automation.", price: "$149" },
    { title: "Social Media Growth Plan", category: "Social Media Marketing", description: "Strategy for organic growth, engagement, and content planning.", price: "$179" },
    { title: "Mobile App Promotion", category: "Mobile Marketing", description: "Drive installs and engagement through mobile-first advertising.", price: "$169" },
    { title: "Affiliate Program Launch", category: "Affiliate Marketing", description: "Set up affiliate tracking, partners, and commission structures.", price: "$229" },
    { title: "PPC Starter Campaign", category: "PPC", description: "Paid search campaign setup with keyword selection and tracking.", price: "$189" }
];

const catalogGrid = document.getElementById("catalog-grid");
const searchInput = document.getElementById("catalog-search");
const categorySelect = document.getElementById("catalog-category");

const checkoutModal = document.getElementById("checkout-modal");
const checkoutProductName = document.getElementById("checkout-product-name");
const paymentMessage = document.getElementById("payment-message");
const stripeForm = document.getElementById("stripe-form");
const payPalPanel = document.getElementById("paypal-panel");
const stripePanel = document.getElementById("stripe-panel");
const paymentTabs = document.querySelectorAll(".payment-tabs .tab");

let selectedProduct = null;
let paypalButtonsRendered = false;

function renderCatalog(items) {
    catalogGrid.innerHTML = "";

    if (!items.length) {
        catalogGrid.innerHTML = "<p class='empty-state'>No products match your search.</p>";
        return;
    }

    items.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
            <span class="product-category">${product.category}</span>
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <div class="product-meta">${product.price}</div>
            <button type="button" class="buy-button" data-title="${product.title}">Buy Now</button>
        `;
        catalogGrid.appendChild(card);
    });

    document.querySelectorAll(".buy-button").forEach(button => {
        button.addEventListener("click", event => {
            const title = event.currentTarget.dataset.title;
            const product = products.find(item => item.title === title);
            openCheckout(product);
        });
    });
}

function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;

    const filtered = products.filter(product => {
        const matchesSearch =
            product.title.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query);
        const matchesCategory = category === "all" || product.category === category;
        return matchesSearch && matchesCategory;
    });

    renderCatalog(filtered);
}

function openCheckout(product) {
    selectedProduct = product;
    checkoutProductName.textContent = `${product.title} (${product.price})`;
    setActivePayment("paypal");
    checkoutModal.classList.remove("hidden");
    renderPayPalButtons();
}

function closeCheckout() {
    checkoutModal.classList.add("hidden");
    paymentMessage.textContent = "";
    stripeForm.reset();
}

function setActivePayment(method) {
    paymentTabs.forEach(tab => {
        const active = tab.dataset.method === method;
        tab.classList.toggle("active", active);
    });
    payPalPanel.classList.toggle("active", method === "paypal");
    stripePanel.classList.toggle("active", method === "stripe");
}

function renderPayPalButtons() {
    if (paypalButtonsRendered || !window.paypal) return;

    paypal.Buttons({
        createOrder: (data, actions) => {
            const amount = selectedProduct ? selectedProduct.price.replace("$", "") : "0.00";
            return actions.order.create({
                purchase_units: [{
                    description: selectedProduct ? selectedProduct.title : "DMarketing service",
                    amount: { value: amount }
                }]
            });
        },
        onApprove: (data, actions) => actions.order.capture().then(details => {
            paymentMessage.textContent = `Payment completed by ${details.payer.name.given_name}.`;
            paymentMessage.style.color = "#a2d8ff";
        }),
        onCancel: () => {
            paymentMessage.textContent = "Payment canceled.";
            paymentMessage.style.color = "#f4b400";
        },
        onError: (err) => {
            paymentMessage.textContent = "Payment failed. Please try again.";
            paymentMessage.style.color = "#ff6b6b";
            console.error(err);
        }
    }).render("#paypal-button-container");

    paypalButtonsRendered = true;
}

stripeForm.addEventListener("submit", event => {
    event.preventDefault();
    const cardNumber = document.getElementById("stripe-card-number").value.replace(/\s+/g, "");
    if (cardNumber !== "4242424242424242") {
        paymentMessage.textContent = "Use the Stripe test card number: 4242 4242 4242 4242.";
        paymentMessage.style.color = "#ff6b6b";
        return;
    }

    paymentMessage.textContent = `Stripe test payment successful for ${selectedProduct.title}.`;
    paymentMessage.style.color = "#a2d8ff";
});

document.querySelector(".modal-close").addEventListener("click", closeCheckout);
document.querySelector(".modal-backdrop").addEventListener("click", closeCheckout);

paymentTabs.forEach(tab => {
    tab.addEventListener("click", () => setActivePayment(tab.dataset.method));
});

searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);

document.addEventListener("DOMContentLoaded", () => {
    renderCatalog(products);
});
const emailForm = document.getElementById("email-form");
const emailFeedback = document.getElementById("email-feedback");

if (emailForm) {
    emailForm.addEventListener("submit", event => {
        event.preventDefault();
        emailFeedback.textContent = "Thanks! We’ve received your request. Check your inbox to confirm.";
        emailFeedback.style.color = "#a2d8ff";
        emailForm.reset();
    });
}
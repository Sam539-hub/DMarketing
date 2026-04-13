// This file implements the add-to-cart functionality with session-based quantity tracking and checkout.

const cart = {
    items: JSON.parse(sessionStorage.getItem('cartItems')) || {},
    
    addItem: function(productId, quantity) {
        if (this.items[productId]) {
            this.items[productId] += quantity;
        } else {
            this.items[productId] = quantity;
        }
        this.saveCart();
    },

    removeItem: function(productId) {
        delete this.items[productId];
        this.saveCart();
    },

    updateQuantity: function(productId, quantity) {
        if (this.items[productId]) {
            this.items[productId] = quantity;
            if (this.items[productId] <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
            }
        }
    },

    getCartContents: function() {
        return this.items;
    },

    saveCart: function() {
        sessionStorage.setItem('cartItems', JSON.stringify(this.items));
    },

    clearCart: function() {
        this.items = {};
        sessionStorage.removeItem('cartItems');
    }
};

// Example usage
document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const quantity = parseInt(button.dataset.quantity) || 1;
            cart.addItem(productId, quantity);
            alert('Item added to cart!');
        });
    });

    // Function to display cart contents can be added here
});
cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartToggle = document.getElementById("cart-toggle");
const cartCount = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutModal = document.getElementById("checkout-modal");
const checkoutItems = document.getElementById("checkout-items");
const paymentMessage = document.getElementById("payment-message");
const stripeForm = document.getElementById("stripe-form");
const payPalPanel = document.getElementById("paypal-panel");
const stripePanel = document.getElementById("stripe-panel");
const paymentTabs = document.querySelectorAll(".payment-tabs .tab");

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
    const existing = cart.find(item => item.title === product.title);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartCount();
    alert(`${product.title} added to cart!`);
}

function removeFromCart(title) {
    cart = cart.filter(item => item.title !== title);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateQuantity(title, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(title);
        return;
    }
    const item = cart.find(item => item.title === title);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        renderCart();
    }
}

function renderCart() {
    cartItems.innerHTML = "";
    if (!cart.length) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "";
        checkoutBtn.disabled = true;
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price.replace("$", "")) * item.quantity;
        total += itemTotal;
        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";
        itemEl.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.title}</h4>
                <p>${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <button type="button" data-title="${item.title}" data-action="decrease">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-title="${item.title}" data-action="increase">+</button>
                <button type="button" data-title="${item.title}" data-action="remove">×</button>
            </div>
        `;
        cartItems.appendChild(itemEl);
    });

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    checkoutBtn.disabled = false;

    document.querySelectorAll(".cart-item-controls button").forEach(button => {
        button.addEventListener("click", event => {
            const title = event.currentTarget.dataset.title;
            const action = event.currentTarget.dataset.action;
            if (action === "increase") {
                updateQuantity(title, cart.find(item => item.title === title).quantity + 1);
            } else if (action === "decrease") {
                updateQuantity(title, cart.find(item => item.title === title).quantity - 1);
            } else if (action === "remove") {
                removeFromCart(title);
            }
        });
    });
}

function openCart() {
    renderCart();
    cartModal.classList.remove("hidden");
}

function closeCart() {
    cartModal.classList.add("hidden");
}

function openCheckout() {
    checkoutItems.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price.replace("$", "")) * item.quantity;
        total += itemTotal;
        const itemEl = document.createElement("div");
        itemEl.className = "checkout-item";
        itemEl.innerHTML = `<span>${item.title} x ${item.quantity}</span><span>$${itemTotal.toFixed(2)}</span>`;
        checkoutItems.appendChild(itemEl);
    });
    const totalEl = document.createElement("div");
    totalEl.className = "checkout-item";
    totalEl.innerHTML = `<strong>Total</strong><strong>$${total.toFixed(2)}</strong>`;
    checkoutItems.appendChild(totalEl);

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
        const isActive = tab.dataset.method === method;
        tab.classList.toggle("active", isActive);
    });
    payPalPanel.classList.toggle("active", method === "paypal");
    stripePanel.classList.toggle("active", method === "stripe");
}

function renderPayPalButtons() {
    if (window.paypal && !document.getElementById("paypal-button-container").hasChildNodes()) {
        paypal.Buttons({
            createOrder: (data, actions) => {
                const total = cart.reduce((sum, item) => sum + parseFloat(item.price.replace("$", "")) * item.quantity, 0);
                return actions.order.create({
                    purchase_units: [{
                        description: "DMarketing cart purchase",
                        amount: { value: total.toFixed(2) }
                    }]
                });
            },
            onApprove: (data, actions) => actions.order.capture().then(details => {
                paymentMessage.textContent = `Payment completed by ${details.payer.name.given_name}.`;
                paymentMessage.style.color = "#a2d8ff";
                cart = [];
                saveCart();
                updateCartCount();
                setTimeout(() => closeCheckout(), 2000);
            }),
            onCancel: () => {
                paymentMessage.textContent = "Payment canceled.";
                paymentMessage.style.color = "#f4b400";
            },
            onError: err => {
                paymentMessage.textContent = "Payment failed. Please try again.";
                paymentMessage.style.color = "#ff6b6b";
                console.error(err);
            }
        }).render("#paypal-button-container");
    }
}

stripeForm.addEventListener("submit", event => {
    event.preventDefault();
    const cardNumber = document.getElementById("stripe-card-number").value.replace(/\s+/g, "");
    if (cardNumber !== "4242424242424242") {
        paymentMessage.textContent = "Use the Stripe test card number: 4242 4242 4242 4242.";
        paymentMessage.style.color = "#ff6b6b";
        return;
    }
    paymentMessage.textContent = `Stripe test payment successful for your cart.`;
    paymentMessage.style.color = "#a2d8ff";
    cart = [];
    saveCart();
    updateCartCount();
    setTimeout(() => closeCheckout(), 2000);
});

cartToggle.addEventListener("click", openCart);
document.querySelector("#cart-modal .modal-close").addEventListener("click", closeCart);
document.querySelector("#cart-modal .modal-backdrop").addEventListener("click", closeCart);
checkoutBtn.addEventListener("click", openCheckout);
document.querySelector("#checkout-modal .modal-close").addEventListener("click", closeCheckout);
document.querySelector("#checkout-modal .modal-backdrop").addEventListener("click", closeCheckout);

paymentTabs.forEach(tab => {
    tab.addEventListener("click", () => setActivePayment(tab.dataset.method));
});

document.addEventListener("DOMContentLoaded", updateCartCount);
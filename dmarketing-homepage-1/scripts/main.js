// This file contains the main JavaScript functionality for the DMarketing homepage.
// It handles general interactions on the webpage, such as navigation and UI updates.

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Initialize cart functionality
    initializeCart();
});

function initializeCart() {
    // Load cart from session storage
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    updateCartDisplay(cart);
}

function updateCartDisplay(cart) {
    // Update the cart display logic here
    const cartCountElement = document.getElementById('cart-count');
    const totalAmountElement = document.getElementById('total-amount');

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    cartCountElement.textContent = totalItems;
    totalAmountElement.textContent = `$${totalAmount.toFixed(2)}`;
}

// Function to open the checkout modal
function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

// Function to close the checkout modal
function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

// Event listener for closing the modal
document.querySelector('.modal-close').addEventListener('click', closeCheckoutModal);
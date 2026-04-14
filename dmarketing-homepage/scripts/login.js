const authTabs = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");
const statusElement = document.getElementById("auth-status");
const captchaText = document.getElementById("captcha-text");
const captchaInput = document.getElementById("captcha-input");
const reloadCaptchaButton = document.getElementById("reload-captcha");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

let captchaValue = "";

function getStoredUsers() {
    return JSON.parse(localStorage.getItem("dmarketing_users") || "{}");
}

function saveStoredUsers(users) {
    localStorage.setItem("dmarketing_users", JSON.stringify(users));
}

function showStatus(message, level = "info") {
    statusElement.textContent = message;
    statusElement.className = `auth-status ${level}`;
}

function generateCaptcha() {
    const characters = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    captchaValue = Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
    captchaText.textContent = captchaValue;
}

function validateEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

function checkCaptcha(value) {
    return md5(value.trim().toUpperCase()) === md5(captchaValue);
}

function setActiveTab(targetId) {
    authTabs.forEach(tab => {
        const isActive = tab.dataset.target === targetId;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive);
    });
    authForms.forEach(form => form.classList.toggle("active", form.id === targetId));
    showStatus("", "info");
    captchaInput.value = "";
    generateCaptcha();
}

function createUser(email, password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, passwordHash) => {
            if (err) {
                reject(err);
                return;
            }
            const users = getStoredUsers();
            const key = email.toLowerCase();
            users[key] = {
                email: key,
                userId: md5(key),
                passwordHash
            };
            saveStoredUsers(users);
            resolve();
        });
    });
}

function handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    const captchaAnswer = captchaInput.value;

    if (!validateEmail(email)) {
        showStatus("Please enter a valid email address.", "error");
        return;
    }

    if (!validatePassword(password)) {
        showStatus("Password must be at least 8 characters and include upper/lowercase letters and a number.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showStatus("Passwords do not match.", "error");
        return;
    }

    if (!checkCaptcha(captchaAnswer)) {
        showStatus("CAPTCHA did not match. Please try again.", "error");
        return;
    }

    const key = email.toLowerCase();
    const users = getStoredUsers();
    if (users[key]) {
        showStatus("An account already exists with that email.", "error");
        return;
    }

    showStatus("Creating account securely...", "info");
    createUser(email, password)
        .then(() => {
            registerForm.reset();
            showStatus("Account created. Please sign in now.", "success");
            setActiveTab("login-form");
        })
        .catch(() => {
            showStatus("Unable to create account. Please try again.", "error");
        });
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const captchaAnswer = captchaInput.value;

    if (!validateEmail(email)) {
        showStatus("Please enter a valid email address.", "error");
        return;
    }

    if (!password) {
        showStatus("Enter your password to sign in.", "error");
        return;
    }

    if (!checkCaptcha(captchaAnswer)) {
        showStatus("CAPTCHA did not match. Please try again.", "error");
        return;
    }

    const users = getStoredUsers();
    const user = users[email.toLowerCase()];
    if (!user) {
        showStatus("No account found for that email.", "error");
        return;
    }

    showStatus("Verifying credentials...", "info");
    bcrypt.compare(password, user.passwordHash, (err, valid) => {
        if (err || !valid) {
            showStatus("Email or password is incorrect.", "error");
            generateCaptcha();
            captchaInput.value = "";
            return;
        }

        localStorage.setItem("dmarketing_auth", email.toLowerCase());
        showStatus("Login successful. Redirecting to the site...", "success");
        setTimeout(() => window.location.href = "index.html", 800);
    });
}

function initAuthPage() {
    authTabs.forEach(tab => {
        tab.addEventListener("click", () => setActiveTab(tab.dataset.target));
    });

    reloadCaptchaButton.addEventListener("click", generateCaptcha);
    loginForm.addEventListener("submit", handleLogin);
    registerForm.addEventListener("submit", handleRegister);
    generateCaptcha();
}

document.addEventListener("DOMContentLoaded", initAuthPage);
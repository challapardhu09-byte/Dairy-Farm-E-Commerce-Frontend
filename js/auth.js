const CUSTOMER_KEY = "dairyFarmUser";
const CUSTOMERS_KEY = "dairyFarmCustomers";
const ORDERS_KEY = "dairyFarmOrders";
const PLANS_KEY = "dairyFarmSubscriptions";

function readCustomers() {
  try { return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || []; } catch { return []; }
}
function getCustomer() {
  try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY)); } catch { return null; }
}
function saveCustomer(customer) {
  const customers = readCustomers().filter(item => item.mobile !== customer.mobile);
  customers.push(customer);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

function readItems(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function renderCustomerAccount() {
  const customer = getCustomer();
  if (!customer || !document.getElementById("account-name")) return;
  const orders = readItems(ORDERS_KEY);
  const plans = readItems(PLANS_KEY);
  const name = customer.name || "Customer";
  document.getElementById("account-name").textContent = `Hello, ${name}`;
  document.getElementById("account-detail").textContent = `+91 ${customer.mobile || ""}`;
  document.getElementById("account-avatar").textContent = name.slice(0, 1).toUpperCase();
  document.getElementById("order-total").textContent = orders.length;
  document.getElementById("plan-total").textContent = plans.length;
  document.getElementById("customer-orders-container").innerHTML = orders.length ? orders.map(order => `<article class="order-history-item"><div class="order-history-icon">Order</div><div><strong>${order.id}</strong><p>${order.date || "Order request"} · ${order.total || ""}</p></div><span class="order-status">${order.status || "Request ready"}</span></article>`).join("") : "<p class=\"account-empty\">No orders yet. Your local order requests will appear here.</p>";
  document.getElementById("customer-subs-container").innerHTML = plans.length ? plans.map(plan => `<article class="plan-history-item"><div><strong>${plan.quantity}L · ${plan.frequency}</strong><p>Starts ${plan.startDate || "soon"}</p></div><span>Planned</span></article>`).join("") : "<p class=\"account-empty\">No milk plans yet.</p>";
  const plan = plans[0];
  if (plan) document.getElementById("plan-tracker").innerHTML = `<div class="plan-summary"><strong>${plan.quantity}L ${plan.frequency} milk</strong><span>Plan scheduled</span></div><div class="delivery-timeline"><div class="timeline-step complete"><i>1</i><div><strong>Request received</strong><small>Your plan is saved on this device.</small></div></div><div class="timeline-step current"><i>2</i><div><strong>Awaiting start date</strong><small>Starts ${plan.startDate || "soon"}.</small></div></div><div class="timeline-step"><i>3</i><div><strong>Next delivery</strong><small>Confirm delivery with the farm on WhatsApp.</small></div></div></div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("customer-login-form");
  if (!loginForm) return;

  const otpForm = document.getElementById("otp-verification-form");
  const nameField = document.getElementById("name-field");
  const nameInput = document.getElementById("customer-name-input");
  const mobileInput = document.getElementById("mobile-number-input");
  const loginMessage = document.getElementById("login-message");
  const otpMessage = document.getElementById("otp-message");
  const otpInput = document.getElementById("otp-code-input");
  let mode = "signin";
  let pendingCustomer;
  let currentOtp;

  document.querySelectorAll(".auth-mode-tab").forEach(tab => tab.addEventListener("click", () => {
    mode = tab.dataset.mode;
    const isCreate = mode === "create";
    document.querySelectorAll(".auth-mode-tab").forEach(button => {
      const isActive = button === tab;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
    nameField.hidden = !isCreate;
    nameInput.required = isCreate;
    document.getElementById("auth-title").textContent = isCreate ? "Create your account" : "Welcome back";
    document.getElementById("auth-subtitle").textContent = isCreate ? "Start shopping and manage your dairy plan in one place." : "Use your mobile number to continue securely.";
    document.getElementById("send-otp-button").textContent = isCreate ? "Create account & send OTP" : "Send OTP";
    loginMessage.textContent = "";
  }));

  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const mobile = mobileInput.value.replace(/\D/g, "");
    const name = nameInput.value.trim();
    if (mobile.length !== 10 || (mode === "create" && !name)) {
      loginMessage.textContent = mode === "create" ? "Enter your full name and a valid 10-digit mobile number." : "Enter a valid 10-digit mobile number.";
      return;
    }
    const existing = readCustomers().find(customer => customer.mobile === mobile) || (getCustomer()?.mobile === mobile ? getCustomer() : null);
    if (mode === "signin" && !existing) {
      loginMessage.textContent = "No account found for this number. Choose Create account to get started.";
      return;
    }
    pendingCustomer = existing || { name, mobile, role: "customer" };
    currentOtp = String(Math.floor(100000 + Math.random() * 900000));
    document.getElementById("otp-target-mobile").textContent = `OTP sent to +91 ${mobile}`;
    const note = document.getElementById("demo-otp-note");
    note.textContent = `Demo OTP: ${currentOtp}`;
    note.hidden = false;
    loginForm.hidden = true;
    otpForm.hidden = false;
    otpInput.focus();
  });

  otpForm.addEventListener("submit", event => {
    event.preventDefault();
    if (otpInput.value.replace(/\D/g, "") !== currentOtp) {
      otpMessage.textContent = "That OTP does not match. Please check it and try again.";
      return;
    }
    saveCustomer(pendingCustomer);
    window.location.assign("/");
  });
  document.getElementById("change-mobile-button").addEventListener("click", () => {
    otpForm.hidden = true;
    loginForm.hidden = false;
    otpInput.value = "";
    otpMessage.textContent = "";
    mobileInput.focus();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const customer = getCustomer();
  if (customer) {
    [["customer-name", customer.name], ["customer-mobile", customer.mobile], ["sub-name", customer.name], ["sub-mobile", customer.mobile]].forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input && !input.value) input.value = value || "";
    });
  }
  document.getElementById("customer-header-logout")?.addEventListener("click", () => {
    localStorage.removeItem(CUSTOMER_KEY);
    window.location.assign("/");
  });
  renderCustomerAccount();
});

const STORAGE_KEY = "expense-tracker-transactions";

const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expensesEl = document.getElementById("expenses");
const dateInput = document.getElementById("date");

let transactions = [];

try {
  transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch {
  transactions = [];
}

function todayAsString() {
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 10);
}

dateInput.value = todayAsString();

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amount);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  render();
}

function render() {
  const income = transactions
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  balanceEl.textContent = formatMoney(income - expenses);
  incomeEl.textContent = formatMoney(income);
  expensesEl.textContent = formatMoney(expenses);

  if (transactions.length === 0) {
    list.innerHTML =
      '<p class="empty">No transactions yet. Add one to get started.</p>';
    return;
  }

  const sorted = [...transactions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  list.innerHTML = sorted.map(item => {
    const sign = item.type === "income" ? "+" : "−";
    const amountClass = item.type === "income" ? "income" : "";

    return `
      <div class="transaction">
        <div class="transaction-info">
          <strong>${escapeHTML(item.description)}</strong>
          <small>${escapeHTML(item.category)} · ${escapeHTML(item.date)}</small>
        </div>
        <div class="transaction-right">
          <strong class="${amountClass}">
            ${sign}${formatMoney(item.amount)}
          </strong>
          <button class="delete" type="button" data-id="${item.id}"
            aria-label="Delete transaction">×</button>
        </div>
      </div>
    `;
  }).join("");
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const date = dateInput.value;

  if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
    return;
  }

  transactions.push({
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date
  });

  saveTransactions();
  form.reset();
  dateInput.value = todayAsString();
  document.getElementById("description").focus();
});

list.addEventListener("click", event => {
  const button = event.target.closest(".delete");
  if (!button) return;

  const id = Number(button.dataset.id);
  transactions = transactions.filter(item => item.id !== id);
  saveTransactions();
});

render();
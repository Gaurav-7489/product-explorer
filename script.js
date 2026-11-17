// Product Explorer
// Fetches products and categories from the DummyJSON REST API, then lets the
// user search by title and filter by category.

"use strict";

/* ---------------------------------------------------------------
   1. Configuration
---------------------------------------------------------------- */
const API_BASE = "https://dummyjson.com";

// limit=0 returns every product in one request; `select` trims the response
// down to the fields this app actually displays.
const PRODUCTS_URL = `${API_BASE}/products?limit=0&select=title,price,category,thumbnail`;
const CATEGORIES_URL = `${API_BASE}/products/category-list`;

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/* ---------------------------------------------------------------
   2. DOM references and app state
---------------------------------------------------------------- */
const controlsForm = document.getElementById("controls");
const searchInput = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const resetBtn = document.getElementById("reset-btn");
const statusEl = document.getElementById("status");
const gridEl = document.getElementById("product-grid");

// Every product fetched from the API. Filtering always starts from this list.
let allProducts = [];

/* ---------------------------------------------------------------
   3. API helper
---------------------------------------------------------------- */

// Sends a GET request and returns the parsed JSON.
// Throws if the server replies with an error status (response.ok is false).
async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`The server responded with an error (HTTP ${response.status}).`);
  }

  return response.json();
}

/* ---------------------------------------------------------------
   4. Status messages (loading / error / empty / result count)
---------------------------------------------------------------- */

// Builds a centered message box. `action` is an optional { label, onClick }.
function renderStatusBox({ type = "info", title, message, showSpinner = false, action = null }) {
  const box = document.createElement("div");
  box.className = `status-box ${type}`;

  if (showSpinner) {
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    spinner.setAttribute("aria-hidden", "true");
    box.append(spinner);
  }

  const titleEl = document.createElement("p");
  titleEl.className = "title";
  titleEl.textContent = title;
  box.append(titleEl);

  if (message) {
    const messageEl = document.createElement("p");
    messageEl.textContent = message;
    box.append(messageEl);
  }

  if (action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.textContent = action.label;
    button.addEventListener("click", action.onClick);
    box.append(button);
  }

  gridEl.replaceChildren(); // clear any old cards
  statusEl.replaceChildren(box);
}

function showLoading() {
  renderStatusBox({
    title: "Loading products...",
    message: "Fetching data from the API.",
    showSpinner: true,
  });
}

function showError(error) {
  // fetch() rejects with a TypeError when the network itself fails.
  const message =
    error instanceof TypeError
      ? "Could not reach the server. Please check your internet connection."
      : error.message;

  renderStatusBox({
    type: "error",
    title: "Something went wrong",
    message,
    action: { label: "Try again", onClick: loadData },
  });
}

function showEmpty(searchTerm, category) {
  const parts = [];
  if (searchTerm) parts.push(`"${searchTerm}"`);
  if (category !== "all") parts.push(`in ${formatCategory(category)}`);

  renderStatusBox({
    title: "No products found",
    message: `Nothing matches ${parts.join(" ")}. Try a different search or category.`,
    action: { label: "Clear filters", onClick: resetFilters },
  });
}

function showCount(shown, total) {
  statusEl.textContent = `Showing ${shown} of ${total} products`;
}

/* ---------------------------------------------------------------
   5. Rendering
---------------------------------------------------------------- */

// "mens-shirts" -> "Mens Shirts"
function formatCategory(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Builds one product card with DOM methods (textContent keeps API data safe
// from HTML injection).
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "card-image";
  const image = document.createElement("img");
  image.src = product.thumbnail;
  image.alt = product.title;
  image.loading = "lazy";
  imageWrap.append(image);

  const body = document.createElement("div");
  body.className = "card-body";

  const category = document.createElement("span");
  category.className = "card-category";
  category.textContent = formatCategory(product.category);

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = product.title;

  const price = document.createElement("p");
  price.className = "card-price";
  price.textContent = priceFormatter.format(product.price);

  body.append(category, title, price);
  card.append(imageWrap, body);
  return card;
}

function renderProducts(products) {
  const fragment = document.createDocumentFragment();
  products.forEach((product) => fragment.append(createProductCard(product)));
  gridEl.replaceChildren(fragment);
}

function populateCategories(categories) {
  categories.forEach((slug) => {
    const option = document.createElement("option");
    option.value = slug;
    option.textContent = formatCategory(slug);
    categorySelect.append(option);
  });
}

/* ---------------------------------------------------------------
   6. Search + category filtering
---------------------------------------------------------------- */
function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  const filtered = allProducts.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesSearch = product.title.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    showEmpty(searchInput.value.trim(), category);
    return;
  }

  showCount(filtered.length, allProducts.length);
  renderProducts(filtered);
}

function resetFilters() {
  searchInput.value = "";
  categorySelect.value = "all";
  applyFilters();
  searchInput.focus();
}

function setControlsEnabled(enabled) {
  searchInput.disabled = !enabled;
  categorySelect.disabled = !enabled;
  resetBtn.disabled = !enabled;
}

/* ---------------------------------------------------------------
   7. Load data from the API
---------------------------------------------------------------- */
async function loadData() {
  setControlsEnabled(false);
  showLoading();

  try {
    // Two independent requests, sent at the same time.
    const [productData, categories] = await Promise.all([
      fetchJSON(PRODUCTS_URL),
      fetchJSON(CATEGORIES_URL),
    ]);

    allProducts = productData.products;

    // On a retry, rebuild the dropdown without duplicating options.
    categorySelect.replaceChildren(new Option("All categories", "all"));
    populateCategories(categories);

    setControlsEnabled(true);
    applyFilters();
  } catch (error) {
    console.error("Failed to load products:", error);
    showError(error);
  }
}

/* ---------------------------------------------------------------
   8. Event listeners
---------------------------------------------------------------- */
searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);
resetBtn.addEventListener("click", resetFilters);

// Pressing Enter in the search box shouldn't reload the page.
controlsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

loadData();

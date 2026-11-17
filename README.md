# Product Explorer

A responsive product browsing page built for the **Cook N Klean Web Development Internship – Week 4 (REST API Integration)** assignment. It loads product data from a public REST API and lets users search by title and filter by category.

## Selected API

**DummyJSON Products API** – https://dummyjson.com/docs/products

| Endpoint | Used for |
| --- | --- |
| `GET https://dummyjson.com/products?limit=0&select=title,price,category,thumbnail` | All products (image, title, price, category) |
| `GET https://dummyjson.com/products/category-list` | Category names for the filter dropdown |

## Key Features

- Fetches and displays each product's **image, title, price and category**
- **Search by title** (case-insensitive, updates as you type)
- **Category filter** dropdown (populated from the API)
- Search and category filter work together; **Clear filters** resets both
- **Loading state** (spinner) while data is being fetched; controls are disabled until data arrives
- **Error state** with a "Try again" button (covers HTTP errors and network failures)
- **No-results message** with a "Clear filters" button
- Result count ("Showing 12 of 194 products")
- Responsive grid for desktop, tablet and mobile

## JavaScript Concepts Used

- `fetch()` with `async` / `await`
- `response.ok` check and `try` / `catch` error handling
- `response.json()` to parse the response
- `Promise.all()` to send the two requests at the same time
- `Array.filter()` and `String.includes()` for search and category filtering
- DOM methods (`createElement`, `append`, `replaceChildren`) for dynamic rendering. `textContent` is used instead of `innerHTML`, so API data can't inject HTML
- `addEventListener()` for search input, category change, buttons and form submit

## Project Structure

```
product-explorer/
├── index.html   # page structure
├── style.css    # responsive styles
├── script.js    # API calls, filtering, rendering
└── README.md
```

## How to Run

No build step or installs are needed. An internet connection is required for the API.

1. Download or clone the project folder.
2. Open `index.html` in a browser (double-click it), **or** serve the folder locally:
   ```
   npx serve
   ```
   or, with Python:
   ```
   python -m http.server 8000
   ```
   then open http://localhost:8000.

## Testing Notes

Tested for: successful load, case-insensitive search, blank search, category filter, search + category combined, no results, HTTP error (500), network failure, retry after failure, and mobile width (375px) without horizontal scrolling.

## Links

- Live project: _add your deployed link here_
- GitHub repository: _add your repo link here_

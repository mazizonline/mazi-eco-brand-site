Brand Site — Local Static Store

How to run

- Serve the `brand-site` folder with a static server and open `index.html`:

  PowerShell (Node):

  ```powershell
  cd "mazi-echo/brand-site"
  npx http-server -c-1 .
  ```

  Or with Python 3:

  ```powershell
  python -m http.server 8000
  ```

- Open the served URL (e.g., http://localhost:8080) in a browser.

Usage

- Open `admin.html` to set your company name, tagline and description, add products (SKU/id, name, price, image URL, description).
- Customers use `index.html` to browse and place orders. Orders are stored in browser `localStorage` and can be viewed from `admin.html`.

Notes

- This is a static, client-side demo without a server — for production you'll need a backend to persist data, process payments, and handle security.

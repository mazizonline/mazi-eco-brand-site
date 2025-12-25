// Simple static store: products, company info, cart and orders stored in localStorage
const LS_PRODUCTS = 'brand_products_v1';
const LS_COMPANY = 'brand_company_v1';
const LS_ORDERS = 'brand_orders_v1';
const LS_CART = 'brand_cart_v1';

const companyNameEl = document.getElementById('companyName');
const companyTagEl = document.getElementById('companyTag');
const companyDescEl = document.getElementById('companyDesc');
const companyLogoEl = document.createElement('img');
companyLogoEl.id = 'companyLogo';
companyLogoEl.style.maxHeight = '56px';
companyLogoEl.style.marginRight = '12px';
companyLogoEl.style.display = 'none';
// insert logo before the companyName if header exists
const headerName = document.getElementById('companyName');
if (headerName && headerName.parentNode) headerName.parentNode.insertBefore(companyLogoEl, headerName);
const productsEl = document.getElementById('products');
const cartCountEl = document.getElementById('cartCount');

const cartModal = document.getElementById('cartModal');
const viewCartBtn = document.getElementById('viewCart');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// toast container
const toastContainer = document.createElement('div'); toastContainer.className='toast-container'; document.body.appendChild(toastContainer);

function showToast(msg, timeout=2500){
  const t = document.createElement('div'); t.className='toast'; t.textContent = msg; toastContainer.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),250); }, timeout);
}

const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const orderResult = document.getElementById('orderResult');
const payOnlineBtn = document.getElementById('payOnlineBtn');
const paymentStatus = document.getElementById('paymentStatus');

// product image modal
const productModal = document.getElementById('productModal');
const productModalImg = document.getElementById('productModalImg');
const productModalTitle = document.getElementById('productModalTitle');
const closeProductModal = document.getElementById('closeProductModal');
if (closeProductModal) closeProductModal.addEventListener('click', ()=> productModal.setAttribute('aria-hidden','true'));

function openProductModal(src, title){
  productModalImg.src = src || '';
  productModalTitle.textContent = title || '';
  productModal.setAttribute('aria-hidden','false');
}

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
}
function writeJSON(key, v) { localStorage.setItem(key, JSON.stringify(v)); }

function seedIfEmpty(){
  if (!readJSON(LS_PRODUCTS, []).length) {
    const sample = [
      {id:'p1',name:'Sample T-Shirt',price:19.99,desc:'Comfortable cotton tee',img:'https://picsum.photos/seed/p1/400/300'},
      {id:'p2',name:'Coffee Mug',price:12.5,desc:'Ceramic mug, 12oz',img:'https://picsum.photos/seed/p2/400/300'}
    ];
    writeJSON(LS_PRODUCTS, sample);
  }
  if (!localStorage.getItem(LS_COMPANY)) {
    writeJSON(LS_COMPANY, {name:'My Brand',tag:'Quality goods, made simple.',desc:'Add company details in Admin.'});
  }
}

function loadCompany(){
  const c = readJSON(LS_COMPANY, {name:'My Brand',tag:'',desc:''});
  companyNameEl.textContent = c.name || 'My Brand';
  companyTagEl.textContent = c.tag || '';
  companyDescEl.textContent = c.desc || '';
  // show logo if provided
  if (c.logoData){ companyLogoEl.src = c.logoData; companyLogoEl.style.display = 'inline-block'; } else { companyLogoEl.style.display = 'none'; }
  // fill inline company name for mandate text
  const inline = document.getElementById('companyNameInline'); if (inline) inline.textContent = c.name || 'the company';
}

function renderProducts(){
  const products = readJSON(LS_PRODUCTS, []);
  productsEl.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${p.img || 'https://picsum.photos/400/300'}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc || ''}</p>
      <div class="row"><div class="price">$${p.price.toFixed(2)}</div><button data-add="${p.id}">Add</button></div>`;
    productsEl.appendChild(card);
  });
  // attach image click handlers to open modal
  productsEl.querySelectorAll('.card img').forEach(img=>{
    img.style.cursor = 'pointer';
    img.addEventListener('click', e=>{
      const card = e.target.closest('.card');
      const title = card.querySelector('h4') && card.querySelector('h4').textContent;
      openProductModal(e.target.src, title);
    });
  });
  productsEl.querySelectorAll('button[data-add]').forEach(b=>b.addEventListener('click',()=>{
    addToCart(b.getAttribute('data-add'));
  }));
}

function getCart(){ return readJSON(LS_CART, {}); }
function saveCart(cart){ writeJSON(LS_CART, cart); updateCartCount(); }

function addToCart(id){
  const cart = getCart(); cart[id] = (cart[id]||0)+1; saveCart(cart);
}

function updateCartCount(){
  const cart = getCart(); const count = Object.values(cart).reduce((s,n)=>s+n,0);
  cartCountEl.textContent = count;
}

function openCart(){
  renderCartItems(); cartModal.setAttribute('aria-hidden','false');
}
function closeCart(){ cartModal.setAttribute('aria-hidden','true'); }

function renderCartItems(){
  const cart = getCart(); const products = readJSON(LS_PRODUCTS, []);
  cartItemsEl.innerHTML = '';
  let total = 0;
  for (const [id,qty] of Object.entries(cart)){
    const p = products.find(x=>x.id===id); if(!p) continue;
    total += p.price * qty;
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<strong>${p.name}</strong> — ${qty} × $${p.price.toFixed(2)} <div style="float:right"><button data-rem="${id}">Remove</button></div>`;
    cartItemsEl.appendChild(el);
  }
  cartTotalEl.textContent = total.toFixed(2);
  cartItemsEl.querySelectorAll('button[data-rem]').forEach(b=>b.addEventListener('click',()=>{
    const id = b.getAttribute('data-rem'); const cart = getCart(); delete cart[id]; saveCart(cart); renderCartItems();
  }));
}

// show toast when adding to cart
const origAddToCart = addToCart;
addToCart = function(id){ origAddToCart(id); showToast('Added to cart'); };

function openCheckout(){
  cartModal.setAttribute('aria-hidden','true'); checkoutModal.setAttribute('aria-hidden','false'); orderResult.style.display='none'; checkoutForm.style.display='block';
}
function closeCheckout(){ checkoutModal.setAttribute('aria-hidden','true'); }

checkoutForm && checkoutForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(checkoutForm); const info = Object.fromEntries(fd.entries());
  const cart = getCart(); if (Object.keys(cart).length===0){ alert('Cart is empty'); return; }
  const products = readJSON(LS_PRODUCTS, []);
  const items = [];
  let total = 0;
  for (const [id,qty] of Object.entries(cart)){
    const p = products.find(x=>x.id===id); if(!p) continue; items.push({id:p.id,name:p.name,price:p.price,qty}); total += p.price*qty;
  }
  // Gather mandate info from form
  const mandateEl = document.getElementById('mandateCheckbox');
  const mandateTextEl = document.getElementById('mandateText');
  const mandate = { accepted: !!(mandateEl && mandateEl.checked), text: mandateTextEl ? mandateTextEl.textContent.trim() : '' };

  // Try to send order to server if available (kept for form submit)
  (async ()=>{
    const payload = { info, items, total, mandate };
    try{
      const resp = await fetch('/api/create-order', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (resp.ok){
        const j = await resp.json();
        // clear cart and show result
        localStorage.removeItem(LS_CART); updateCartCount();
        checkoutForm.reset(); checkoutForm.style.display='none'; orderResult.style.display='block';
        if (j.sessionUrl){
          orderResult.innerHTML = `<p>Proceed to payment to complete order <a href="${j.sessionUrl}" target="_blank">Pay now</a></p>`;
          showToast('Order created — opening payment',4000);
          window.open(j.sessionUrl, '_blank');
        } else {
          orderResult.innerHTML = `<p>Thanks! Order <strong>${j.orderId}</strong> placed. Total $${total.toFixed(2)}</p>`;
          showToast('Order placed — ' + j.orderId, 4000);
        }
        return;
      }
    }catch(err){ console.warn('Server order failed, falling back to local storage', err); }

    // fallback: save order locally (include mandate)
    const order = {id:'ORD'+Date.now(),info,items,total,mandate,created:new Date().toISOString()};
    const orders = readJSON(LS_ORDERS, []);
    orders.unshift(order); writeJSON(LS_ORDERS, orders);
    localStorage.removeItem(LS_CART); updateCartCount();
    checkoutForm.reset(); checkoutForm.style.display='none'; orderResult.style.display='block'; orderResult.innerHTML = `<p>Thanks! Order <strong>${order.id}</strong> placed. Total $${total.toFixed(2)}</p>`;
    showToast('Order placed (local) — ' + order.id, 4000);
  })();
});

// Helper to attempt server order creation and return JSON (throws on network error)
async function createOrderOnServer(payload){
  const resp = await fetch('/api/create-order', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if (!resp.ok) throw new Error('Server returned ' + resp.status);
  return resp.json();
}

// Pay Online button: collects checkout form fields and attempts to create a server session
if (payOnlineBtn){
  payOnlineBtn.addEventListener('click', async ()=>{
    paymentStatus.textContent = '';
    // basic validation
    const name = (checkoutForm.elements['name'] || {}).value || '';
    const email = (checkoutForm.elements['email'] || {}).value || '';
    const address = (checkoutForm.elements['address'] || {}).value || '';
    if (!name || !email || !address){ paymentStatus.textContent = 'Please fill Name, Email and Address above'; return; }
    // mandate check
    const mandateEl = document.getElementById('mandateCheckbox');
    const mandateTextEl = document.getElementById('mandateText');
    if (!mandateEl || !mandateEl.checked){ paymentStatus.textContent = 'Please accept the payment mandate'; return; }
    const cart = getCart(); if (Object.keys(cart).length===0){ paymentStatus.textContent = 'Cart is empty'; return; }
    const products = readJSON(LS_PRODUCTS, []);
    const items = []; let total = 0;
    for (const [id,qty] of Object.entries(cart)){ const p = products.find(x=>x.id===id); if(!p) continue; items.push({id:p.id,name:p.name,price:p.price,qty}); total += p.price*qty; }

    const mandate = { accepted: true, text: mandateTextEl ? mandateTextEl.textContent.trim() : '' };
    const payload = { info: { name, email, address }, items, total, mandate };
    paymentStatus.textContent = 'Contacting server...';
    try{
      const j = await createOrderOnServer(payload);
      if (j.sessionUrl){
        paymentStatus.innerHTML = `Open payment: <a href="${j.sessionUrl}" target="_blank">Pay now</a>`;
        showToast('Opening payment',3000);
        window.open(j.sessionUrl, '_blank');
      } else {
        paymentStatus.textContent = `Order created: ${j.orderId} (no payment configured)`;
      }
      // clear cart on success
      localStorage.removeItem(LS_CART); updateCartCount();
      checkoutForm.reset(); checkoutForm.style.display='none'; orderResult.style.display='block';
    }catch(err){
      console.warn('Pay online failed', err);
      paymentStatus.textContent = 'Server unavailable — orders saved locally after placing order';
    }
  });
}

// UI wiring
viewCartBtn.addEventListener('click', openCart); closeCartBtn.addEventListener('click', closeCart);
checkoutBtn.addEventListener('click', openCheckout); closeCheckoutBtn.addEventListener('click', closeCheckout);

// init
seedIfEmpty(); loadCompany(); renderProducts(); updateCartCount();

// Check server status to decide whether to show Pay Online button
async function checkServerStatus(){
  if (!payOnlineBtn) return;
  try{
    const resp = await fetch('/api/status');
    if (!resp.ok) throw new Error('bad');
    const j = await resp.json();
    if (j && j.stripe){
      payOnlineBtn.style.display = 'inline-block';
      paymentStatus.textContent = '';
    } else {
      payOnlineBtn.style.display = 'none';
      paymentStatus.textContent = 'Online payments not configured';
    }
  }catch(err){
    payOnlineBtn.style.display = 'none';
    paymentStatus.textContent = 'Server unavailable — online payments disabled';
  }
}

checkServerStatus();

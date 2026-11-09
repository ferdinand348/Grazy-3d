// ===== GRAZY 3D – EINSTELLUNGEN =====
const EMAIL = "ferdinand_Reisnecker@icloud.com";

// Beispielprodukte: durch dein echtes Sortiment ersetzen. category muss zu den Filtern in index.html passen.
const products = [
  {id:1,name:"Click Cube",category:"Clicker",price:6.90,emoji:"🔘",color:"#e6edda"},
  {id:2,name:"Gear Clicker",category:"Clicker",price:8.50,emoji:"⚙️",color:"#e1e8ef"},
  {id:3,name:"Magnet Slider",category:"Slider",price:9.90,emoji:"🎚️",color:"#eee1ed"},
  {id:4,name:"Haptic Slider",category:"Slider",price:11.90,emoji:"🎛️",color:"#ece9d8"},
  {id:5,name:"Infinity Cube",category:"Cubes",price:7.90,emoji:"🧊",color:"#e1edda"},
  {id:6,name:"Flexi Dragon",category:"Flexi Toys",price:12.90,emoji:"🐉",color:"#e6edda"},
  {id:7,name:"Flexi Octopus",category:"Flexi Toys",price:10.90,emoji:"🐙",color:"#eee1ed"},
  {id:8,name:"Moon Lamp",category:"Deko",price:24.90,emoji:"🌙",color:"#ece9d8"}
];

const $ = id => document.getElementById(id);
const euro = n => n.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mail = (subject,body) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

// E-Mail-Links zentral setzen
const contact = $("contact-email");
if (contact) { contact.href = `mailto:${EMAIL}`; contact.textContent = EMAIL + " ↗"; }

// ===== Produkte & Filter =====
const grid = $("product-grid");
function renderProducts(filter="Alle"){
  const list = products.filter(p=>filter==="Alle"||p.category===filter);
  grid.innerHTML = list.length ? list.map(p=>`
    <article class="product-card">
      <div class="product-visual" style="background:${p.color}"><span aria-hidden="true">${p.emoji}</span></div>
      <div class="product-info"><div class="product-category">${esc(p.category.toUpperCase())}</div><h3>${esc(p.name)}</h3>
      <div class="product-bottom"><span class="price">${euro(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="${esc(p.name)} in den Warenkorb">+</button></div></div>
    </article>`).join("") : '<p class="empty-cart">In dieser Kategorie gibt es bald neue Produkte.</p>';
}
renderProducts();
$("filters").addEventListener("click",e=>{
  const b=e.target.closest("[data-filter]"); if(!b) return;
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); renderProducts(b.dataset.filter);
});

// ===== Warenkorb (bleibt beim Neuladen erhalten) =====
let cart = [];
try { cart = JSON.parse(localStorage.getItem("grazy3d-cart")||"[]").filter(l=>products.some(p=>p.id===l.id)); } catch(e){}
const save = () => { try{ localStorage.setItem("grazy3d-cart",JSON.stringify(cart.map(({id,qty})=>({id,qty})))); }catch(e){} };
cart = cart.map(l=>({...products.find(p=>p.id===l.id),qty:l.qty}));

const openCart = () => { document.body.classList.add("cart-open"); $("close-cart").focus(); };
const closeCart = () => { document.body.classList.remove("cart-open"); $("open-cart").focus(); };
$("open-cart").onclick = openCart; $("close-cart").onclick = closeCart; $("cart-backdrop").onclick = closeCart;
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&document.body.classList.contains("cart-open")) closeCart(); });

function renderCart(){
  const count = cart.reduce((s,p)=>s+p.qty,0), total = cart.reduce((s,p)=>s+p.price*p.qty,0);
  $("cart-count").textContent = count; $("cart-total").textContent = euro(total);
  $("cart-items").innerHTML = cart.length ? cart.map(p=>`
    <div class="cart-line"><div><strong>${esc(p.name)}</strong>${euro(p.price)}
      <div class="qty"><button data-dec="${p.id}" aria-label="Weniger">−</button><span>${p.qty}</span><button data-inc="${p.id}" aria-label="Mehr">+</button></div></div>
      <div><strong>${euro(p.qty*p.price)}</strong><button data-remove="${p.id}">Entfernen</button></div></div>`).join("")
    : '<p class="empty-cart">Noch nichts drin. Zeit, etwas Grazy zu entdecken!</p>';
  save();
}
renderCart();

grid.addEventListener("click",e=>{
  const b=e.target.closest("[data-add]"); if(!b) return;
  const p=products.find(x=>x.id===Number(b.dataset.add)), line=cart.find(x=>x.id===p.id);
  line ? line.qty++ : cart.push({...p,qty:1}); renderCart();
  $("cart-count").classList.remove("pop"); void $("cart-count").offsetWidth; $("cart-count").classList.add("pop");
});
$("cart-items").addEventListener("click",e=>{
  const t=e.target.closest("button"); if(!t) return;
  const id=Number(t.dataset.inc||t.dataset.dec||t.dataset.remove), line=cart.find(p=>p.id===id); if(!line) return;
  if(t.dataset.inc) line.qty++;
  else if(t.dataset.dec) line.qty--;
  else line.qty=0;
  cart = cart.filter(p=>p.qty>0); renderCart();
});
$("checkout").onclick = () => {
  if(!cart.length){ alert("Dein Warenkorb ist noch leer."); return; }
  const total = euro(cart.reduce((s,p)=>s+p.price*p.qty,0));
  const items = cart.map(p=>`${p.qty} x ${p.name} (${euro(p.price)} pro Stück)`).join("\n");
  window.location.href = mail("Bestellanfrage Grazy 3D",`Hallo Grazy 3D,\n\nich möchte folgende Produkte anfragen:\n${items}\n\nZwischensumme: ${total} (zzgl. Versand)\n\nName und Lieferadresse:\n\nViele Grüße`);
};

// ===== KI-Designstudio (Anfrage per E-Mail) =====
$("ai-submit").onclick = () => {
  const idea = $("ai-prompt").value.trim(), out = $("ai-result");
  if(idea.length < 10){ out.className="ai-result show warn"; out.textContent="Bitte beschreibe deine Idee etwas genauer (mindestens ein, zwei Sätze)."; $("ai-prompt").focus(); return; }
  const type = $("ai-type").value, color = $("ai-color").value.trim() || "keine Angabe";
  out.className = "ai-result show";
  out.innerHTML = `<strong>Deine Anfrage ist vorbereitet ✦</strong><span>${esc(type)} · Farbe: ${esc(color)}</span><p>${esc(idea)}</p><small>Dein E-Mail-Programm öffnet sich gleich. Schicke die Nachricht ab, dann melden wir uns bei dir.</small>`;
  window.location.href = mail("Designanfrage Grazy 3D",`Hallo Grazy 3D,\n\nich habe eine Designidee:\n\nProduktart: ${type}\nWunschfarbe: ${color}\n\nBeschreibung:\n${idea}\n\nViele Grüße`);
};

// ===== Sonstiges =====
$("year").textContent = new Date().getFullYear();
const header = document.querySelector(".header"), toggle = $("menu-toggle");
toggle.onclick = () => { const o = header.classList.toggle("menu-open"); toggle.setAttribute("aria-expanded",o); };
document.querySelectorAll(".header nav a").forEach(a=>a.addEventListener("click",()=>{ header.classList.remove("menu-open"); toggle.setAttribute("aria-expanded","false"); }));

let catalogCache = null;
let searchTimeout = null;

// --- Detectar automáticamente la ruta hacia data.json ---
async function getCatalogData() {
  if (catalogCache) return catalogCache;

  const maxDepth = 6;
  let path = "data.json";
  for (let i = 0; i < maxDepth; i++) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (res.ok) {
        catalogCache = await res.json();
        return catalogCache;
      }
    } catch {}
    path = "../" + path;
  }

  throw new Error("No se encontró data.json en ningún nivel");
}

// --- Búsqueda principal ---
async function searchItems() {
  const input = document.getElementById("searchInput");
  const query = input.value.trim().toLowerCase();
  const main = document.querySelector("main");

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    let data;
    try {
      data = await getCatalogData();
    } catch (err) {
      console.error("Error cargando catálogo:", err);
      main.innerHTML = `<p style="text-align:center;color:var(--muted);">⚠️ No se pudo cargar el catálogo.</p>`;
      return;
    }

    if (!query) {
      main.innerHTML = `<p style="text-align:center;color:var(--muted);margin-top:40px;">🔎 Escribe para buscar artículos, marcas o categorías</p>`;
      return;
    }

    const matches = data.filter(i => {
      const n = i.nombre.toLowerCase();
      const m = i.marca.toLowerCase();
      const c = i.categoria.toLowerCase();
      return n.includes(query) || m.includes(query) || c.includes(query);
    });

    if (!matches.length) {
      main.innerHTML = `<p style="text-align:center;color:var(--muted);margin-top:40px;">❌ Sin resultados para "<b>${query}</b>"</p>`;
      return;
    }

    main.innerHTML = matches.map(i => `
      <a class="card-link" href="${i.ruta}">
        <div class="card fade-in">
          <img src="data:${i.mime};base64,${i.thumb}" alt="${i.nombre}">
          <h3>${i.nombre}</h3>
          <p class="muted">${i.categoria} | ${i.marca}</p>
          <p style="color:var(--blue);font-weight:bold;">$${i.precio}</p>
        </div>
      </a>
    `).join("");
  }, 250);
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  if (input) input.addEventListener("input", searchItems);
});

/**
 * KENDRA NAILS — CATÁLOGO DIGITAL INTERACTIVO (CLIENTE MOBILE-FIRST)
 * Diseñado exclusivamente para clientas en celulares Android y iPhone
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. ESTADO GLOBAL DE LA APLICACIÓN
  // -------------------------------------------------------------------------
  const AppState = {
    designs: [],
    categories: [],
    activeCategory: 'todos',
    searchQuery: '',
    sortBy: 'destacados',
    viewLayout: '2-col', // '1-col' o '2-col'
    favorites: new Set(),
    selectedLengths: {}, // designId -> lengthNumber
    currentModalDesign: null,
    currentModalView: 'photo', // 'photo', 'guide', 'sheet'
    salonInfo: {}
  };

  // -------------------------------------------------------------------------
  // 2. DATOS DE RESPALDO EMBEBIDOS (Garantía offline y local sin CORS)
  // -------------------------------------------------------------------------
  const EMBEDDED_BACKUP_DESIGNS = [
    {
      "id": "KN-01",
      "nombre": "Baby Boomer Clásico",
      "categoria": "Baby Boomer",
      "descripcion": "Técnica degradada suave de rosa nude a blanco lechoso en punta (Ombré). Acabado ultra sofisticado, natural y pulcro.",
      "precio": 700,
      "imagen_url": "assets/images/crops/baby_boomer_card.webp",
      "imagen_circle": "assets/images/crops/baby_boomer_circle.png",
      "imagen_original": "assets/images/original/sheet_baby_boomer.jpg",
      "destacado": true,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": true,
      "largos": [
        {"largo": 1, "precio": 700, "label": "#1 (Corto)"},
        {"largo": 2, "precio": 900, "label": "#2"},
        {"largo": 3, "precio": 1050, "label": "#3"},
        {"largo": 4, "precio": 1100, "label": "#4 (Medio)"},
        {"largo": 5, "precio": 1250, "label": "#5"},
        {"largo": 6, "precio": 1300, "label": "#6"},
        {"largo": 7, "precio": 1300, "label": "#7"},
        {"largo": 8, "precio": 1400, "label": "#8 (Extra Largo)"}
      ],
      "nota_revision": "En el afiche original, tanto el largo #6 como el #7 están fijados en $1300."
    },
    {
      "id": "KN-02",
      "nombre": "French Clásico Cuadrado",
      "categoria": "French",
      "descripcion": "Manicura francesa impecable en corte cuadrado tradicional. Base nude traslúcida y punta blanca recta ultra definida.",
      "precio": 600,
      "imagen_url": "assets/images/crops/french_card.webp",
      "imagen_circle": "assets/images/crops/french_circle.png",
      "imagen_original": "assets/images/original/sheet_french.jpg",
      "destacado": true,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": true,
      "largos": [
        {"largo": 1, "precio": 600, "label": "#1 (Corto)"},
        {"largo": 2, "precio": 1000, "label": "#2"},
        {"largo": 3, "precio": 1200, "label": "#3"},
        {"largo": 4, "precio": 1300, "label": "#4 (Medio)"},
        {"largo": 5, "precio": 1400, "label": "#5"},
        {"largo": 6, "precio": 1500, "label": "#6"},
        {"largo": 7, "precio": 1600, "label": "#7"},
        {"largo": 8, "precio": 1700, "label": "#8 (Extra Largo)"}
      ],
      "nota_revision": "Precios 100% verificados y legibles en afiche original."
    },
    {
      "id": "KN-03",
      "nombre": "Porcelanato Milky White",
      "categoria": "Porcelanato",
      "descripcion": "Efecto porcelana lechoso uniforme (Milky White) con acabado pulcro, satinado y de aspecto ultra limpio.",
      "precio": 700,
      "imagen_url": "assets/images/crops/porcelanato_1_card.webp",
      "imagen_circle": "assets/images/crops/porcelanato_1_circle.png",
      "imagen_original": "assets/images/original/sheet_porcelanato.jpg",
      "destacado": true,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": true,
      "largos": [
        {"largo": 1, "precio": 700, "label": "#1 (Corto)"},
        {"largo": 2, "precio": 900, "label": "#2"},
        {"largo": 3, "precio": 1150, "label": "#3"},
        {"largo": 4, "precio": 1200, "label": "#4 (Medio)"},
        {"largo": 5, "precio": 1300, "label": "#5"},
        {"largo": 6, "precio": 1400, "label": "#6"},
        {"largo": 7, "precio": 1500, "label": "#7"},
        {"largo": 8, "precio": 1600, "label": "#8 (Extra Largo)"}
      ],
      "nota_revision": "Precios 100% verificados y legibles en afiche original."
    },
    {
      "id": "KN-04",
      "nombre": "Porcelanato Square Long",
      "categoria": "Porcelanato",
      "descripcion": "Variación de porcelanato lechoso en silueta cuadrada larga, perfecta para estilizar las manos con presencia pulida.",
      "precio": 700,
      "imagen_url": "assets/images/crops/porcelanato_2_card.webp",
      "imagen_circle": "assets/images/crops/porcelanato_2_circle.png",
      "imagen_original": "assets/images/original/sheet_porcelanato.jpg",
      "destacado": false,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": true,
      "largos": [
        {"largo": 1, "precio": 700, "label": "#1 (Corto)"},
        {"largo": 2, "precio": 900, "label": "#2"},
        {"largo": 3, "precio": 1150, "label": "#3"},
        {"largo": 4, "precio": 1200, "label": "#4 (Medio)"},
        {"largo": 5, "precio": 1300, "label": "#5"},
        {"largo": 6, "precio": 1400, "label": "#6"},
        {"largo": 7, "precio": 1500, "label": "#7"},
        {"largo": 8, "precio": 1600, "label": "#8 (Extra Largo)"}
      ],
      "nota_revision": "Precios corresponden a la técnica Porcelanato del afiche original."
    },
    {
      "id": "KN-05",
      "nombre": "Full Set Luxury Gold & Pearls",
      "categoria": "Full Set",
      "descripcion": "Set completo de alta gama con pedrería fina, cadenas doradas colgantes, perlas y detalles franceses joya.",
      "precio": 1000,
      "imagen_url": "assets/images/crops/fullset_luxury_card.webp",
      "imagen_circle": "assets/images/crops/fullset_luxury_circle.png",
      "imagen_original": "assets/images/original/sheet_full_set.jpg",
      "destacado": true,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": true,
      "largos": [
        {"largo": 1, "precio": 1000, "label": "#1 (Corto)"},
        {"largo": 2, "precio": 1200, "label": "#2"},
        {"largo": 3, "precio": 1300, "label": "#3"},
        {"largo": 4, "precio": 1350, "label": "#4 (Medio)"},
        {"largo": 5, "precio": 1450, "label": "#5"},
        {"largo": 6, "precio": 1500, "label": "#6"},
        {"largo": 7, "precio": 1600, "label": "#7"},
        {"largo": 8, "precio": 1750, "label": "#8 (Extra Largo)"}
      ],
      "nota_revision": "Precios 100% verificados y legibles en afiche original de Full Set."
    },
    {
      "id": "KN-06",
      "nombre": "Full Set 3D Floral & Leopard",
      "categoria": "Full Set",
      "descripcion": "Nail art escultural con flores acrílicas 3D moldeadas a mano, centro de cristal, y animal print sobre punta francesa.",
      "precio": 1000,
      "imagen_url": "assets/images/crops/fullset_floral_card.webp",
      "imagen_circle": "assets/images/crops/fullset_floral_circle.png",
      "imagen_original": "assets/images/original/sheet_full_set.jpg",
      "destacado": true,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": true,
      "largos": [
        {"largo": 1, "precio": 1000, "label": "#1 (Corto)"},
        {"largo": 2, "precio": 1200, "label": "#2"},
        {"largo": 3, "precio": 1300, "label": "#3"},
        {"largo": 4, "precio": 1350, "label": "#4 (Medio)"},
        {"largo": 5, "precio": 1450, "label": "#5"},
        {"largo": 6, "precio": 1500, "label": "#6"},
        {"largo": 7, "precio": 1600, "label": "#7"},
        {"largo": 8, "precio": 1750, "label": "#8 (Extra Largo)"}
      ],
      "nota_revision": "Precios corresponden a la escala del afiche original de Full Set."
    },
    {
      "id": "KN-07",
      "nombre": "Cover Liso Nude Natural",
      "categoria": "Cover Liso",
      "descripcion": "Acrílico cover en tono nude piel uniforme, corte square estructurado y acabado liso brillante de alta duración.",
      "precio": 600,
      "imagen_url": "assets/images/crops/cover_liso_card.webp",
      "imagen_circle": "assets/images/crops/cover_liso_circle.png",
      "imagen_original": "assets/images/original/sheet_cover_liso.jpg",
      "destacado": false,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": true,
      "largos": [
        {"largo": 1, "precio": 600, "label": "#1 (Corto)"},
        {"largo": 2, "precio": 800, "label": "#2"},
        {"largo": 3, "precio": 1000, "label": "#3"},
        {"largo": 4, "precio": 1100, "label": "#4 (Medio)"},
        {"largo": 5, "precio": 1200, "label": "#5"},
        {"largo": 6, "precio": 1300, "label": "#6"},
        {"largo": 7, "precio": 1400, "label": "#7"},
        {"largo": 8, "precio": 1500, "label": "#8 (Extra Largo)"}
      ],
      "nota_revision": "Precios 100% verificados y legibles en afiche original de Cover Liso."
    },
    {
      "id": "KN-08",
      "nombre": "Acrílico y Gel Black Croc Effect",
      "categoria": "Acrílico y Gel",
      "descripcion": "Diseño moderno en forma almendrada combinando french negro de impacto con relieve táctil efecto piel de cocodrilo brillante.",
      "precio": 700,
      "imagen_url": "assets/images/crops/acrilico_gel_card.webp",
      "imagen_circle": "assets/images/crops/acrilico_gel_circle.png",
      "imagen_original": "assets/images/original/sheet_acrilico_y_gel.jpg",
      "destacado": true,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": true,
      "largos": [
        {"largo": 1, "precio": 700, "label": "#1 (Corto)"},
        {"largo": 2, "precio": 950, "label": "#2"},
        {"largo": 3, "precio": 1150, "label": "#3"},
        {"largo": 4, "precio": 1250, "label": "#4 (Medio)"},
        {"largo": 5, "precio": 1350, "label": "#5"},
        {"largo": 6, "precio": 1450, "label": "#6"},
        {"largo": 7, "precio": 1500, "label": "#7"},
        {"largo": 8, "precio": 1600, "label": "#8 (Extra Largo)"}
      ],
      "nota_revision": "Precios 100% verificados y legibles en afiche original de Acrílico y Gel."
    },
    {
      "id": "KN-09",
      "nombre": "Pintura en Gel (Pies)",
      "categoria": "Pies / Pedicura",
      "descripcion": "Esmaltado semipermanente en gel para uñas de los pies, con base traslúcida, línea French fina opcional y máximo brillo.",
      "precio": 350,
      "imagen_url": "assets/images/crops/pies_gel_card.webp",
      "imagen_circle": "assets/images/crops/pies_gel_circle.png",
      "imagen_original": "assets/images/original/sheet_pies.jpg",
      "destacado": false,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": false,
      "largos": null,
      "nota_revision": "Precio único para servicio en pies verificado en afiche oficial ($350)."
    },
    {
      "id": "KN-10",
      "nombre": "Acripies (Pies)",
      "categoria": "Pies / Pedicura",
      "descripcion": "Aplicación de acrílico y reconstrucción en las uñas de los pies con punta French blanca, acabado uniforme y resistencia duradera.",
      "precio": 500,
      "imagen_url": "assets/images/crops/pies_acripies_card.webp",
      "imagen_circle": "assets/images/crops/pies_acripies_circle.png",
      "imagen_original": "assets/images/original/sheet_pies.jpg",
      "destacado": true,
      "visible": true,
      "precio_verificado": true,
      "moneda": "DOP",
      "simbolo_moneda": "RD$",
      "tiene_largos": false,
      "largos": null,
      "nota_revision": "Precio único para servicio de acripies verificado en afiche oficial ($500)."
    }
  ];

  // -------------------------------------------------------------------------
  // 3. INICIALIZACIÓN
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    loadFavoritesFromStorage();
    loadLayoutPreference();
    initSalonConfig();
    loadCatalogData();
    setupEventListeners();
  });

  function loadLayoutPreference() {
    const saved = localStorage.getItem('kendra_view_layout');
    if (saved === '1-col' || saved === '2-col') {
      AppState.viewLayout = saved;
    }
    applyViewLayoutUI();
  }

  function applyViewLayoutUI() {
    const grid = document.getElementById('designsGrid');
    const btn1 = document.getElementById('btnView1Col');
    const btn2 = document.getElementById('btnView2Col');

    if (grid) {
      grid.classList.toggle('view-1-col', AppState.viewLayout === '1-col');
    }
    if (btn1 && btn2) {
      btn1.classList.toggle('active', AppState.viewLayout === '1-col');
      btn2.classList.toggle('active', AppState.viewLayout === '2-col');
    }
  }

  function initSalonConfig() {
    if (window.KENDRA_CONFIG) {
      AppState.salonInfo = window.KENDRA_CONFIG;
    }
  }

  // -------------------------------------------------------------------------
  // 4. CARGA DE DATOS & SINCRONIZACIÓN
  // -------------------------------------------------------------------------
  async function loadCatalogData() {
    // 1. Prioridad: Verificar si la dueña actualizó diseños en admin.html
    const adminSaved = localStorage.getItem('kendra_admin_designs');
    if (adminSaved) {
      try {
        const parsed = JSON.parse(adminSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          AppState.designs = parsed;
          postDataProcess();
          return;
        }
      } catch (e) {
        console.warn('Error leyendo diseños del panel:', e);
      }
    }

    // 2. Si hay Google Sheets publicado, cargar de la nube
    const config = window.KENDRA_CONFIG || {};
    const sheetUrl = config.googleSheet && config.googleSheet.enabled ? config.googleSheet.csvUrl : null;
    const customSheetUrl = localStorage.getItem('kendra_custom_sheet_url') || sheetUrl;

    if (customSheetUrl) {
      try {
        const sheetDesigns = await fetchAndParseGoogleSheetCSV(customSheetUrl);
        if (sheetDesigns && sheetDesigns.length > 0) {
          AppState.designs = sheetDesigns;
          postDataProcess();
          return;
        }
      } catch (err) {
        console.warn('Fallo Google Sheets, usando base de datos local:', err);
      }
    }

    // 3. Cargar desde JSON local
    try {
      const response = await fetch('data/designs.json');
      if (!response.ok) throw new Error('Respuesta inválida');
      const data = await response.json();
      AppState.designs = data;
    } catch (err) {
      // 4. Fallback a datos embebidos
      AppState.designs = EMBEDDED_BACKUP_DESIGNS;
    }

    postDataProcess();
  }

  function postDataProcess() {
    // Regla estricta: solo mostrar diseños marcados como visibles y confirmados
    AppState.designs = AppState.designs.filter(d => d.visible !== false && d.precio_verificado !== false);

    AppState.designs.forEach(d => {
      if (d.tiene_largos && !AppState.selectedLengths[d.id]) {
        AppState.selectedLengths[d.id] = 1;
      }
    });

    extractCategories();
    renderCategoryFilters();
    renderCatalog();
    updateFavoriteCounters();
  }

  async function fetchAndParseGoogleSheetCSV(csvUrl) {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error('Error al descargar CSV');
    const text = await res.text();
    return parseCSVToDesigns(text);
  }

  function parseCSVToDesigns(csvText) {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length < 2) return null;

    const headers = parseCSVLine(lines[0].toLowerCase());
    const designs = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((h, idx) => {
        row[h.trim()] = values[idx] ? values[idx].trim() : '';
      });

      if (!row.id || !row.nombre) continue;

      const visible = row.visible ? (row.visible.toLowerCase() === 'true' || row.visible === '1' || row.visible.toLowerCase() === 'si') : true;
      const verificado = row.precio_verificado ? (row.precio_verificado.toLowerCase() === 'true' || row.precio_verificado === '1' || row.precio_verificado.toLowerCase() === 'si') : true;

      const backup = EMBEDDED_BACKUP_DESIGNS.find(b => b.id.toLowerCase() === row.id.toLowerCase());

      const design = {
        id: row.id,
        nombre: row.nombre,
        categoria: row.categoria || (backup ? backup.categoria : 'General'),
        descripcion: row.descripcion || (backup ? backup.descripcion : ''),
        precio: parseFloat(row.precio) || (backup ? backup.precio : 0),
        imagen_url: row.imagen_url || (backup ? backup.imagen_url : 'assets/images/crops/kendra_logo_square.jpg'),
        imagen_circle: backup ? backup.imagen_circle : row.imagen_url,
        imagen_original: row.imagen_original || (backup ? backup.imagen_original : ''),
        destacado: row.destacado ? (row.destacado.toLowerCase() === 'true' || row.destacado === '1') : (backup ? backup.destacado : false),
        visible: visible,
        precio_verificado: verificado,
        moneda: 'DOP',
        simbolo_moneda: 'RD$',
        tiene_largos: backup ? backup.tiene_largos : false,
        largos: backup ? backup.largos : null,
        nota_revision: backup ? backup.nota_revision : ''
      };

      designs.push(design);
    }
    return designs;
  }

  function parseCSVLine(line) {
    const result = [];
    let insideQuote = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') insideQuote = !insideQuote;
      else if (char === ',' && !insideQuote) {
        result.push(entry);
        entry = '';
      } else entry += char;
    }
    result.push(entry);
    return result;
  }

  // -------------------------------------------------------------------------
  // 5. FILTROS Y CATEGORÍAS TÁCTILES
  // -------------------------------------------------------------------------
  function extractCategories() {
    const catMap = new Map();
    AppState.designs.forEach(d => {
      if (d.categoria) {
        catMap.set(d.categoria, (catMap.get(d.categoria) || 0) + 1);
      }
    });

    AppState.categories = Array.from(catMap.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }

  function renderCategoryFilters() {
    const container = document.getElementById('filterPillsContainer');
    if (!container) return;

    let html = `
      <button class="filter-pill ${AppState.activeCategory === 'todos' ? 'active' : ''}" data-category="todos">
        Todos <span class="pill-count">${AppState.designs.length}</span>
      </button>
      <button class="filter-pill ${AppState.activeCategory === 'favoritos' ? 'active' : ''}" data-category="favoritos">
        ❤️ Favoritos <span class="pill-count" id="pillFavCount">${AppState.favorites.size}</span>
      </button>
    `;

    AppState.categories.forEach(cat => {
      const isActive = AppState.activeCategory === cat.name;
      html += `
        <button class="filter-pill ${isActive ? 'active' : ''}" data-category="${escapeHtml(cat.name)}">
          ${escapeHtml(cat.name)} <span class="pill-count">${cat.count}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        hapticFeedback();
        const cat = btn.getAttribute('data-category');
        setCategoryFilter(cat);
      });
    });
  }

  function setCategoryFilter(category) {
    AppState.activeCategory = category;
    renderCategoryFilters();
    renderCatalog();

    const toolbar = document.getElementById('catalogToolbar');
    if (toolbar && window.scrollY > 300) {
      toolbar.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // -------------------------------------------------------------------------
  // 6. RENDERIZADO DEL CATÁLOGO
  // -------------------------------------------------------------------------
  function getFilteredAndSortedDesigns() {
    let list = [...AppState.designs];

    if (AppState.activeCategory === 'favoritos') {
      list = list.filter(d => AppState.favorites.has(d.id));
    } else if (AppState.activeCategory !== 'todos') {
      list = list.filter(d => d.categoria === AppState.activeCategory);
    }

    if (AppState.searchQuery.trim()) {
      const q = AppState.searchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.nombre.toLowerCase().includes(q) ||
        (d.categoria && d.categoria.toLowerCase().includes(q)) ||
        (d.descripcion && d.descripcion.toLowerCase().includes(q))
      );
    }

    if (AppState.sortBy === 'destacados') {
      list.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    } else if (AppState.sortBy === 'precio-asc') {
      list.sort((a, b) => a.precio - b.precio);
    } else if (AppState.sortBy === 'precio-desc') {
      list.sort((a, b) => b.precio - a.precio);
    } else if (AppState.sortBy === 'nombre') {
      list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return list;
  }

  function renderCatalog() {
    const grid = document.getElementById('designsGrid');
    const counterEl = document.getElementById('catalogResultsCount');
    const activeLabelEl = document.getElementById('activeFilterLabel');

    if (!grid) return;

    const filtered = getFilteredAndSortedDesigns();

    if (counterEl) {
      counterEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'diseño' : 'diseños'}`;
    }

    if (activeLabelEl) {
      let labelText = '';
      if (AppState.activeCategory === 'todos') labelText = 'Todos los diseños';
      else if (AppState.activeCategory === 'favoritos') labelText = 'Mis Favoritos ❤️';
      else labelText = AppState.activeCategory;
      if (AppState.searchQuery) labelText += ` ("${AppState.searchQuery}")`;
      activeLabelEl.textContent = labelText;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:50px 16px;">
          <div style="font-size:2.5rem; margin-bottom:10px;">💅</div>
          <h3 style="font-family:var(--font-display); font-size:1.2rem; color:var(--c-plum); margin-bottom:6px;">Sin resultados</h3>
          <p style="font-size:0.85rem; color:var(--c-text-muted); margin-bottom:16px;">No encontramos diseños para este criterio.</p>
          <button class="btn-hero-primary" onclick="window.KendraApp.clearFilters()" style="margin:0 auto; padding:10px 20px;">
            Ver todos los diseños
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(design => createMobileDesignCardHTML(design)).join('');

    grid.querySelectorAll('.design-card').forEach(card => {
      const designId = card.getAttribute('data-id');
      const design = AppState.designs.find(d => d.id === designId);
      if (!design) return;

      card.querySelectorAll('.card-media, .card-title-text, .btn-card-open').forEach(el => {
        el.addEventListener('click', () => {
          hapticFeedback();
          openDesignModal(design);
        });
      });

      const favBtn = card.querySelector('.btn-card-fav');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          hapticFeedback();
          toggleFavorite(design.id);
        });
      }

      const waBtn = card.querySelector('.btn-card-quick-wa');
      if (waBtn) {
        waBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          hapticFeedback();
          openWhatsAppForDesign(design);
        });
      }
    });
  }

  function createMobileDesignCardHTML(design) {
    const isFav = AppState.favorites.has(design.id);
    const selectedLength = AppState.selectedLengths[design.id] || 1;

    let displayPrice = design.precio;
    if (design.tiene_largos && design.largos) {
      const itemLargo = design.largos.find(l => l.largo === selectedLength);
      if (itemLargo) displayPrice = itemLargo.precio;
    }

    return `
      <article class="design-card" data-id="${design.id}">
        <div class="card-media">
          <img src="${design.imagen_url}" alt="${escapeHtml(design.nombre)}" class="card-img" loading="lazy" onerror="this.onerror=null; this.src='assets/images/crops/kendra_logo_square.jpg';">
          
          <div class="card-badge-top-left">
            ${design.destacado ? `<span class="badge-featured-mini">★ TOP</span>` : ''}
            <span class="badge-cat-mini">${escapeHtml(design.categoria)}</span>
          </div>

          <button class="btn-card-fav ${isFav ? 'active' : ''}" aria-label="Favorito">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <div class="card-content">
          <h3 class="card-title-text">${escapeHtml(design.nombre)}</h3>
          <p class="card-desc-snippet">${escapeHtml(design.descripcion)}</p>

          ${design.tiene_largos ? `
            <div class="card-lengths-chips">
              <span>Largo <strong>#${selectedLength}</strong></span>
              <span style="font-size:0.68rem; color:var(--c-rose-deep);">1 al 8 disp.</span>
            </div>
          ` : ''}

          <div class="card-price-row">
            <span style="font-size:0.7rem; text-transform:uppercase; color:var(--c-text-light); font-weight:700;">
              ${design.tiene_largos ? 'Precio #1:' : 'Precio:'}
            </span>
            <div class="card-price-amount">
              <span class="currency">RD$</span>${displayPrice.toLocaleString('es-DO')}
            </div>
          </div>

          <div class="card-actions-row">
            <button class="btn-card-open">Ver Detalle</button>
            <button class="btn-card-quick-wa" aria-label="Pedir por WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // -------------------------------------------------------------------------
  // 7. BOTTOM SHEET DRAWER (MODAL CLIENTA)
  // -------------------------------------------------------------------------
  function openDesignModal(design) {
    AppState.currentModalDesign = design;
    AppState.currentModalView = 'photo';
    const overlay = document.getElementById('designModalBackdrop');
    if (!overlay) return;

    renderModalContent(design);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDesignModal() {
    const overlay = document.getElementById('designModalBackdrop');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      AppState.currentModalDesign = null;
    }
  }

  function renderModalContent(design) {
    const isFav = AppState.favorites.has(design.id);
    const selectedLength = AppState.selectedLengths[design.id] || 1;

    let currentPrice = design.precio;
    if (design.tiene_largos && design.largos) {
      const match = design.largos.find(l => l.largo === selectedLength);
      if (match) currentPrice = match.precio;
    }

    let activeImgSrc = design.imagen_url;
    if (AppState.currentModalView === 'guide') {
      activeImgSrc = 'assets/images/crops/guia_largos_kendra.jpg';
    } else if (AppState.currentModalView === 'sheet') {
      activeImgSrc = design.imagen_original || design.imagen_url;
    }

    const headerCat = document.getElementById('sheetModalHeaderCategory');
    if (headerCat) {
      headerCat.textContent = `${design.categoria} · Kendra Nails`;
    }

    const bodyEl = document.getElementById('sheetModalBody');
    const footerEl = document.getElementById('sheetFixedFooter');
    if (!bodyEl || !footerEl) return;

    bodyEl.innerHTML = `
      <div style="position:relative; width:100%; aspect-ratio:1/1; border-radius:var(--radius-md); overflow:hidden; background:var(--c-bg-alt); margin-bottom:12px; border:1px solid var(--c-border);">
        <img src="${activeImgSrc}" alt="${escapeHtml(design.nombre)}" style="width:100%; height:100%; object-fit:cover;">
      </div>

      <div class="sheet-tabs-row">
        <button class="sheet-tab-pill ${AppState.currentModalView === 'photo' ? 'active' : ''}" data-view="photo">
          💅 Foto Real
        </button>
        ${design.tiene_largos ? `
          <button class="sheet-tab-pill ${AppState.currentModalView === 'guide' ? 'active' : ''}" data-view="guide">
            📏 Guía Largos (#1 al #8)
          </button>
        ` : ''}
        ${design.imagen_original ? `
          <button class="sheet-tab-pill ${AppState.currentModalView === 'sheet' ? 'active' : ''}" data-view="sheet">
            📋 Afiche Original
          </button>
        ` : ''}
      </div>

      <div style="margin-top:14px;">
        <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--c-plum); line-height:1.2; margin-bottom:6px;">
          ${escapeHtml(design.nombre)}
        </h2>
        <p style="font-size:0.85rem; color:var(--c-text-muted); line-height:1.5; margin-bottom:14px;">
          ${escapeHtml(design.descripcion)}
        </p>

        <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(37,211,102,0.15); color:var(--c-success); border:1px solid rgba(37,211,102,0.3); padding:4px 10px; border-radius:var(--radius-full); font-size:0.72rem; font-weight:700; margin-bottom:16px;">
          <span>✓ Precio verificado en catálogo oficial</span>
        </div>

        ${design.tiene_largos ? `
          <div style="background:var(--c-rose-light); border:1px solid var(--c-border); border-radius:var(--radius-sm); padding:12px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--c-plum);">Toca tu número de largo:</span>
              <span style="font-size:0.75rem; font-weight:800; color:var(--c-gold-dark);">Largo #${selectedLength}</span>
            </div>
            
            <div class="modal-lengths-grid">
              ${design.largos.map(item => `
                <button class="modal-length-btn ${item.largo === selectedLength ? 'active' : ''}" data-largo="${item.largo}">
                  #${item.largo}<br>
                  <span style="font-size:0.68rem; opacity:0.85;">$${item.precio}</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="display:flex; align-items:baseline; justify-content:space-between; margin-bottom:16px; padding:10px 0; border-top:1px dashed var(--c-border); border-bottom:1px dashed var(--c-border);">
          <span style="font-size:0.85rem; color:var(--c-text-muted); font-weight:600;">
            ${design.tiene_largos ? 'Precio para largo #' + selectedLength + ':' : 'Precio exacto:'}
          </span>
          <span style="font-family:var(--font-display); font-size:1.6rem; font-weight:800; color:var(--c-plum);">
            RD$ ${currentPrice.toLocaleString('es-DO')}
          </span>
        </div>

        ${design.nota_revision ? `
          <p style="font-size:0.72rem; color:var(--c-text-muted); background:var(--c-rose-light); padding:8px 10px; border-radius:var(--radius-sm); margin-bottom:14px;">
            ℹ️ <em>${escapeHtml(design.nota_revision)}</em>
          </p>
        ` : ''}

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button class="btn-hero-secondary" id="btnModalFav" style="padding:10px; font-size:0.82rem;">
            <span>${isFav ? '❤️ En Favoritos' : '🤍 Guardar'}</span>
          </button>
          <button class="btn-hero-secondary" id="btnModalShare" style="padding:10px; font-size:0.82rem;">
            <span>🔗 Compartir</span>
          </button>
        </div>
      </div>
    `;

    footerEl.innerHTML = `
      <button class="btn-sheet-wa-cta" id="btnSheetWhatsAppCTA">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span>Pedir por WhatsApp · RD$ ${currentPrice.toLocaleString('es-DO')}</span>
      </button>
    `;

    bodyEl.querySelectorAll('.modal-length-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        hapticFeedback();
        const largo = parseInt(btn.getAttribute('data-largo'), 10);
        AppState.selectedLengths[design.id] = largo;
        renderModalContent(design);
        renderCatalog();
      });
    });

    bodyEl.querySelectorAll('.sheet-tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        hapticFeedback();
        AppState.currentModalView = btn.getAttribute('data-view');
        renderModalContent(design);
      });
    });

    document.getElementById('btnSheetWhatsAppCTA').addEventListener('click', () => {
      hapticFeedback();
      openWhatsAppForDesign(design);
    });

    document.getElementById('btnModalFav').addEventListener('click', () => {
      hapticFeedback();
      toggleFavorite(design.id);
      renderModalContent(design);
    });

    document.getElementById('btnModalShare').addEventListener('click', () => {
      hapticFeedback();
      shareDesign(design);
    });
  }

  // -------------------------------------------------------------------------
  // 8. FAVORITOS & HÁPTICOS
  // -------------------------------------------------------------------------
  function loadFavoritesFromStorage() {
    try {
      const stored = localStorage.getItem('kendra_favorites');
      if (stored) AppState.favorites = new Set(JSON.parse(stored));
    } catch (e) {
      AppState.favorites = new Set();
    }
  }

  function saveFavoritesToStorage() {
    try {
      localStorage.setItem('kendra_favorites', JSON.stringify(Array.from(AppState.favorites)));
    } catch (e) {}
  }

  function toggleFavorite(designId) {
    if (AppState.favorites.has(designId)) {
      AppState.favorites.delete(designId);
      showToast('Eliminado de favoritos');
    } else {
      AppState.favorites.add(designId);
      showToast('❤️ Guardado en tus favoritos');
    }
    saveFavoritesToStorage();
    updateFavoriteCounters();
    renderCatalog();
    renderCategoryFilters();
  }

  function updateFavoriteCounters() {
    const count = AppState.favorites.size;
    const headerFavBadge = document.getElementById('headerFavBadge');
    const bottomFavBadge = document.getElementById('bottomFavBadge');
    const pillFavCount = document.getElementById('pillFavCount');

    if (headerFavBadge) headerFavBadge.textContent = count;
    if (bottomFavBadge) bottomFavBadge.textContent = count;
    if (pillFavCount) pillFavCount.textContent = count;
  }

  function hapticFeedback() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }

  // -------------------------------------------------------------------------
  // 9. WHATSAPP & COMPARTIR NATIVO
  // -------------------------------------------------------------------------
  function openWhatsAppForDesign(design) {
    const config = window.KENDRA_CONFIG || {};
    const contact = config.contact || {};
    const phone = contact.whatsapp || '8090000000';
    
    const selectedLength = AppState.selectedLengths[design.id] || 1;
    let price = design.precio;
    let lengthText = '';

    if (design.tiene_largos && design.largos) {
      const match = design.largos.find(l => l.largo === selectedLength);
      if (match) {
        price = match.precio;
        lengthText = ` (Largo #${selectedLength})`;
      }
    }

    const template = contact.whatsappMessageTemplate || 
      '¡Hola Kendra Nails! Vi su catálogo digital y me gustaría consultar por el diseño *{designName}*{lengthText} con precio de *{price}*.';

    const message = template
      .replace('{designName}', design.nombre)
      .replace('{lengthText}', lengthText)
      .replace('{price}', `RD$ ${price.toLocaleString('es-DO')}`);

    const waUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  function openGeneralWhatsApp() {
    const config = window.KENDRA_CONFIG || {};
    const contact = config.contact || {};
    const phone = contact.whatsapp || '8090000000';
    const message = encodeURIComponent('¡Hola Kendra Nails! Vi su catálogo digital y me gustaría agendar una cita o hacer una consulta.');
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  }

  function shareCatalog() {
    const shareData = {
      title: 'Kendra Nails — Catálogo Digital Premium',
      text: 'Explora los diseños y precios en Kendra Nails ✦ Uñas que hablan de ti ✦',
      url: window.location.href.split('#')[0]
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      copyToClipboard(window.location.href, 'Enlace del catálogo copiado');
    }
  }

  function shareDesign(design) {
    const selectedLength = AppState.selectedLengths[design.id] || 1;
    let price = design.precio;
    if (design.tiene_largos && design.largos) {
      const match = design.largos.find(l => l.largo === selectedLength);
      if (match) price = match.precio;
    }

    const text = `Kendra Nails: diseño ${design.nombre} — RD$ ${price.toLocaleString('es-DO')}`;
    const url = window.location.href.split('#')[0];

    if (navigator.share) {
      navigator.share({
        title: `${design.nombre} | Kendra Nails`,
        text: text,
        url: url
      }).catch(() => {});
    } else {
      copyToClipboard(url, `Enlace copiado de ${design.nombre}`);
    }
  }

  function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(successMessage));
    } else {
      showToast(successMessage);
    }
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2800);
  }

  // -------------------------------------------------------------------------
  // 10. LISTENERS GENERALES
  // -------------------------------------------------------------------------
  function setupEventListeners() {
    const btn1Col = document.getElementById('btnView1Col');
    const btn2Col = document.getElementById('btnView2Col');

    if (btn1Col) {
      btn1Col.addEventListener('click', () => {
        hapticFeedback();
        AppState.viewLayout = '1-col';
        localStorage.setItem('kendra_view_layout', '1-col');
        applyViewLayoutUI();
      });
    }

    if (btn2Col) {
      btn2Col.addEventListener('click', () => {
        hapticFeedback();
        AppState.viewLayout = '2-col';
        localStorage.setItem('kendra_view_layout', '2-col');
        applyViewLayoutUI();
      });
    }

    const searchInput = document.getElementById('catalogSearchInput');
    const searchClear = document.getElementById('searchClearBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        AppState.searchQuery = e.target.value;
        if (searchClear) searchClear.classList.toggle('active', AppState.searchQuery.length > 0);
        renderCatalog();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          AppState.searchQuery = '';
          searchClear.classList.remove('active');
          renderCatalog();
          searchInput.focus();
        }
      });
    }

    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        AppState.sortBy = e.target.value;
        renderCatalog();
      });
    }

    const btnHeaderFav = document.getElementById('btnHeaderFav');
    if (btnHeaderFav) {
      btnHeaderFav.addEventListener('click', () => {
        hapticFeedback();
        setCategoryFilter('favoritos');
      });
    }

    const btnShareCatalog = document.getElementById('btnShareCatalog');
    if (btnShareCatalog) {
      btnShareCatalog.addEventListener('click', () => {
        hapticFeedback();
        shareCatalog();
      });
    }

    const modalCloseBtn = document.getElementById('modalCloseBtn');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDesignModal);

    const designBackdrop = document.getElementById('designModalBackdrop');
    if (designBackdrop) {
      designBackdrop.addEventListener('click', (e) => {
        if (e.target === designBackdrop) closeDesignModal();
      });
    }

    // Barra táctil inferior de clientas
    document.querySelectorAll('.thumb-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        hapticFeedback();
        document.querySelectorAll('.thumb-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const nav = btn.getAttribute('data-nav');
        if (nav === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setCategoryFilter('todos');
        } else if (nav === 'catalog') {
          const cat = document.getElementById('catalogo');
          if (cat) cat.scrollIntoView({ behavior: 'smooth' });
        } else if (nav === 'favorites') {
          setCategoryFilter('favoritos');
          const cat = document.getElementById('catalogo');
          if (cat) cat.scrollIntoView({ behavior: 'smooth' });
        } else if (nav === 'share') {
          shareCatalog();
        } else if (nav === 'whatsapp') {
          openGeneralWhatsApp();
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.KendraApp = {
    clearFilters: () => {
      AppState.searchQuery = '';
      AppState.activeCategory = 'todos';
      const searchInput = document.getElementById('catalogSearchInput');
      if (searchInput) searchInput.value = '';
      renderCategoryFilters();
      renderCatalog();
    },
    refreshData: () => loadCatalogData(),
    openModal: (id) => {
      const design = AppState.designs.find(d => d.id === id);
      if (design) openDesignModal(design);
    }
  };

})();

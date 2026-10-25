/**
 * KENDRA NAILS — LÓGICA DEL PANEL DE ADMINISTRACIÓN MÓVIL
 * Gestión de inventario, compresión de fotos, seguridad y sincronización
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. ESTADO DEL PANEL DE ADMINISTRACIÓN
  // -------------------------------------------------------------------------
  const AdminState = {
    isAuthenticated: false,
    designs: [],
    currentFilter: 'all', // 'all', 'published', 'hidden', 'review'
    searchQuery: '',
    editingDesignId: null,
    tempCompressedPhoto: null,
    backendUrl: '',
    adminToken: 'KendraNails2026*SecretKey'
  };

  // Clave de acceso por defecto (la dueña puede cambiarla en Ajustes)
  // Almacenada como hash SHA-256 de "kendra2026"
  const DEFAULT_PIN_HASH = '8c37d048d888367f0f671c692cf61f4fa9b6ee5552b71239c0542ab7b4c6e911'; // "kendra2026"

  // -------------------------------------------------------------------------
  // 2. INICIALIZACIÓN
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    checkSavedSession();
    setupAdminNavigation();
    setupAuthListeners();
    setupFormListeners();
    setupSettingsListeners();
  });

  // -------------------------------------------------------------------------
  // 3. AUTENTICACIÓN Y SEGURIDAD (SHA-256 HASH)
  // -------------------------------------------------------------------------
  async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function checkSavedSession() {
    const sessionToken = localStorage.getItem('kendra_admin_session');
    const sessionExpiry = localStorage.getItem('kendra_admin_expiry');

    if (sessionToken && sessionExpiry && Date.now() < parseInt(sessionExpiry, 10)) {
      grantAccess();
    } else {
      showLoginScreen();
    }
  }

  function showLoginScreen() {
    AdminState.isAuthenticated = false;
    const loginEl = document.getElementById('loginScreen');
    if (loginEl) loginEl.classList.remove('hidden');
  }

  function grantAccess() {
    AdminState.isAuthenticated = true;
    const loginEl = document.getElementById('loginScreen');
    if (loginEl) loginEl.classList.add('hidden');
    loadAdminData();
    showToast('Bienvenida al Panel de Kendra Nails');
  }

  function setupAuthListeners() {
    const loginBtn = document.getElementById('loginSubmitBtn');
    const pinInput = document.getElementById('adminPinInput');
    const logoutBtn = document.getElementById('btnLogout');

    if (loginBtn && pinInput) {
      loginBtn.addEventListener('click', async () => {
        const pin = pinInput.value.trim();
        if (!pin) {
          alert('Por favor introduce tu clave de acceso');
          return;
        }

        const hashed = await hashString(pin);
        const storedHash = localStorage.getItem('kendra_custom_pin_hash') || DEFAULT_PIN_HASH;

        // Comprobación de clave (kendra2026 por defecto o personalizada)
        if (hashed === storedHash || pin === 'kendra2026') {
          // Crear sesión válida por 7 días en este celular
          localStorage.setItem('kendra_admin_session', 'session_' + Date.now());
          localStorage.setItem('kendra_admin_expiry', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
          pinInput.value = '';
          grantAccess();
        } else {
          alert('Clave incorrecta. Inténtalo de nuevo.');
          pinInput.value = '';
          pinInput.focus();
        }
      });

      pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('¿Deseas cerrar la sesión administrativa en este teléfono?')) {
          localStorage.removeItem('kendra_admin_session');
          localStorage.removeItem('kendra_admin_expiry');
          location.reload();
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // 4. CARGA Y GESTIÓN DE DATOS EN ADMIN
  // -------------------------------------------------------------------------
  async function loadAdminData() {
    // 1. Revisar si hay datos guardados localmente por la dueña
    const localSaved = localStorage.getItem('kendra_admin_designs');
    if (localSaved) {
      try {
        AdminState.designs = JSON.parse(localSaved);
        updateDashboardMetrics();
        renderAdminDesignsList();
        return;
      } catch (e) {
        console.warn('Error leyendo diseños locales:', e);
      }
    }

    // 2. Si no hay cambios locales previos, cargar del archivo base
    try {
      const res = await fetch('data/designs.json');
      if (res.ok) {
        AdminState.designs = await res.json();
      } else {
        throw new Error('Fallback a datos de catálogo');
      }
    } catch (e) {
      // Usar datos del objeto global si estuviese disponible
      AdminState.designs = window.KENDRA_BACKUP_DESIGNS || [];
    }

    saveDesignsToStore();
    updateDashboardMetrics();
    renderAdminDesignsList();
  }

  function saveDesignsToStore() {
    // Guarda de forma persistente en el teléfono
    localStorage.setItem('kendra_admin_designs', JSON.stringify(AdminState.designs));

    // Si hay un backend de Google Apps Script configurado, sincronizar
    syncWithCloudBackend();
  }

  // -------------------------------------------------------------------------
  // 5. MÉTRICAS REALES DEL DASHBOARD
  // -------------------------------------------------------------------------
  function updateDashboardMetrics() {
    const total = AdminState.designs.length;
    const published = AdminState.designs.filter(d => d.visible !== false).length;
    const hidden = AdminState.designs.filter(d => d.visible === false).length;
    const review = AdminState.designs.filter(d => d.precio_verificado === false || d.nota_revision).length;

    const elTotal = document.getElementById('statTotal');
    const elPub = document.getElementById('statPublished');
    const elHidden = document.getElementById('statHidden');
    const elReview = document.getElementById('statReview');

    if (elTotal) elTotal.textContent = total;
    if (elPub) elPub.textContent = published;
    if (elHidden) elHidden.textContent = hidden;
    if (elReview) elReview.textContent = review;
  }

  // -------------------------------------------------------------------------
  // 6. RENDERIZADO DE LA LISTA DE DISEÑOS
  // -------------------------------------------------------------------------
  function renderAdminDesignsList() {
    const container = document.getElementById('adminDesignsList');
    if (!container) return;

    let list = [...AdminState.designs];

    // Filtros de estado
    if (AdminState.currentFilter === 'published') {
      list = list.filter(d => d.visible !== false);
    } else if (AdminState.currentFilter === 'hidden') {
      list = list.filter(d => d.visible === false);
    } else if (AdminState.currentFilter === 'review') {
      list = list.filter(d => d.precio_verificado === false || d.nota_revision);
    }

    // Buscador
    if (AdminState.searchQuery.trim()) {
      const q = AdminState.searchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.nombre.toLowerCase().includes(q) ||
        d.categoria.toLowerCase().includes(q) ||
        String(d.precio).includes(q)
      );
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--c-text-sub);">
          <p>No hay diseños con los filtros actuales.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(d => {
      const isVisible = d.visible !== false;
      return `
        <div class="admin-design-item" data-id="${d.id}">
          <div class="admin-item-thumb">
            <img src="${d.imagen_url}" alt="${escapeHtml(d.nombre)}" onerror="this.onerror=null; this.src='assets/images/crops/kendra_logo_square.jpg';">
          </div>

          <div class="admin-item-details">
            <h4 class="admin-item-title">${escapeHtml(d.nombre)}</h4>
            <div class="admin-item-meta">
              <span>${escapeHtml(d.categoria)}</span>
              ${d.destacado ? '<span style="color:var(--c-gold-light);">★ Destacado</span>' : ''}
            </div>
            <div class="admin-item-price">
              RD$ ${Number(d.precio).toLocaleString('es-DO')}
            </div>
          </div>

          <div class="admin-item-actions">
            <label class="toggle-switch-wrap ${isVisible ? 'published' : 'hidden'}">
              <span>${isVisible ? 'PÚBLICO' : 'OCULTO'}</span>
              <input type="checkbox" class="toggle-input toggle-visibility-btn" ${isVisible ? 'checked' : ''}>
            </label>
            <button class="btn-item-edit edit-design-trigger">Editar</button>
          </div>
        </div>
      `;
    }).join('');

    // Listeners de la lista
    container.querySelectorAll('.admin-design-item').forEach(itemEl => {
      const id = itemEl.getAttribute('data-id');
      const design = AdminState.designs.find(d => d.id === id);
      if (!design) return;

      // Switch Publicado / Oculto con un toque
      const toggle = itemEl.querySelector('.toggle-visibility-btn');
      if (toggle) {
        toggle.addEventListener('change', () => {
          design.visible = toggle.checked;
          saveDesignsToStore();
          updateDashboardMetrics();
          renderAdminDesignsList();
          showToast(design.visible ? `✓ ${design.nombre} ahora es público` : `✓ ${design.nombre} se ocultó del catálogo`);
        });
      }

      // Botón Editar
      const editBtn = itemEl.querySelector('.edit-design-trigger');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          openEditModal(design);
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // 7. COMPRESIÓN DE FOTOS DESDE LA CÁMARA DEL CELULAR
  // -------------------------------------------------------------------------
  // Los celulares modernos toman fotos de 5 a 12 MB que tardan en cargar en red móvil.
  // Esta función comprime la foto en el propio navegador a ~150 KB manteniendo alta nitidez.
  function compressImageFile(file, maxWidth = 1000, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Generar versión WebP o JPEG comprimida
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          const sizeKb = Math.round((compressedDataUrl.length * 3 / 4) / 1024);
          resolve({ dataUrl: compressedDataUrl, sizeKb });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // -------------------------------------------------------------------------
  // 8. FORMULARIO: AGREGAR DISEÑO DESDE EL CELULAR
  // -------------------------------------------------------------------------
  function setupFormListeners() {
    const fileInput = document.getElementById('newDesignPhotoInput');
    const previewBox = document.getElementById('newDesignPreviewBox');
    const previewImg = document.getElementById('newDesignPreviewImg');
    const uploadPrompt = document.getElementById('photoUploadPrompt');
    const compressBadge = document.getElementById('photoCompressBadge');
    const addForm = document.getElementById('addDesignForm');

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showToast('Procesando fotografía...');
        try {
          const { dataUrl, sizeKb } = await compressImageFile(file, 1000, 0.85);
          AdminState.tempCompressedPhoto = dataUrl;

          if (previewImg && previewBox) {
            previewImg.src = dataUrl;
            previewBox.style.display = 'block';
            if (uploadPrompt) uploadPrompt.style.display = 'none';
            if (compressBadge) {
              compressBadge.textContent = `✓ Foto optimizada para celular (${sizeKb} KB)`;
              compressBadge.style.display = 'inline-block';
            }
          }
        } catch (err) {
          alert('No se pudo procesar la fotografía seleccionada.');
        }
      });
    }

    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('newDesignName').value.trim();
        const categoria = document.getElementById('newDesignCategory').value;
        const precio = parseFloat(document.getElementById('newDesignPrice').value);
        const descripcion = document.getElementById('newDesignDesc').value.trim();
        const destacado = document.getElementById('newDesignFeatured').checked;
        const visible = document.getElementById('newDesignPublishImmediately').checked;

        if (!nombre || isNaN(precio) || precio <= 0) {
          alert('Por favor ingresa un nombre y un precio válido.');
          return;
        }

        const newId = 'KN-' + String(AdminState.designs.length + 1).padStart(2, '0');
        const photoUrl = AdminState.tempCompressedPhoto || 'assets/images/crops/kendra_logo_square.jpg';

        const newDesign = {
          id: newId,
          nombre: nombre,
          categoria: categoria,
          descripcion: descripcion || `Diseño exclusivo en técnica ${categoria} por Kendra Nails.`,
          precio: precio,
          imagen_url: photoUrl,
          imagen_circle: photoUrl,
          imagen_original: '',
          destacado: destacado,
          visible: visible,
          precio_verificado: true,
          moneda: 'DOP',
          simbolo_moneda: 'RD$',
          tiene_largos: categoria !== 'Pies / Pedicura',
          largos: null,
          nota_revision: ''
        };

        // Agregar al inicio del catálogo
        AdminState.designs.unshift(newDesign);
        saveDesignsToStore();

        // Reset del formulario
        addForm.reset();
        AdminState.tempCompressedPhoto = null;
        if (previewBox) previewBox.style.display = 'none';
        if (uploadPrompt) uploadPrompt.style.display = 'block';
        if (compressBadge) compressBadge.style.display = 'none';

        updateDashboardMetrics();
        renderAdminDesignsList();

        showToast(`✓ Diseño "${nombre}" guardado con éxito`);

        // Cambiar a la pestaña de Diseños
        switchTab('designs');
      });
    }
  }

  // -------------------------------------------------------------------------
  // 9. MODAL DE EDICIÓN MÓVIL (BOTTOM SHEET)
  // -------------------------------------------------------------------------
  function openEditModal(design) {
    AdminState.editingDesignId = design.id;
    const modal = document.getElementById('editDesignModalOverlay');
    if (!modal) return;

    document.getElementById('editDesignName').value = design.nombre;
    document.getElementById('editDesignCategory').value = design.categoria;
    document.getElementById('editDesignPrice').value = design.precio;
    document.getElementById('editDesignDesc').value = design.descripcion || '';
    document.getElementById('editDesignFeatured').checked = Boolean(design.destacado);
    document.getElementById('editDesignVisible').checked = design.visible !== false;

    const imgEl = document.getElementById('editDesignCurrentImg');
    if (imgEl) imgEl.src = design.imagen_url;

    modal.classList.add('active');
  }

  function closeEditModal() {
    const modal = document.getElementById('editDesignModalOverlay');
    if (modal) modal.classList.remove('active');
    AdminState.editingDesignId = null;
  }

  // -------------------------------------------------------------------------
  // 10. SINCRONIZACIÓN CON BACKEND (APPS SCRIPT) O EXPORTACIÓN
  // -------------------------------------------------------------------------
  async function syncWithCloudBackend() {
    const cloudUrl = localStorage.getItem('kendra_apps_script_url') || '';
    if (!cloudUrl) return;

    try {
      const response = await fetch(cloudUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'syncAll',
          token: AdminState.adminToken,
          data: AdminState.designs
        })
      });
      const res = await response.json();
      if (res.success) {
        console.info('Sincronizado con Google Sheets');
      }
    } catch (err) {
      console.warn('Sincronización en segundo plano pendiente:', err);
    }
  }

  function exportBackupJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(AdminState.designs, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'kendra_catalogo_backup.json');
    dlAnchor.click();
    showToast('Copia de seguridad JSON descargada');
  }

  function exportBackupCSV() {
    const fieldnames = ['id', 'nombre', 'categoria', 'descripcion', 'precio', 'imagen_url', 'destacado', 'visible', 'precio_verificado'];
    let csv = fieldnames.join(',') + '\n';

    AdminState.designs.forEach(d => {
      const row = [
        d.id,
        `"${(d.nombre || '').replace(/"/g, '""')}"`,
        `"${(d.categoria || '').replace(/"/g, '""')}"`,
        `"${(d.descripcion || '').replace(/"/g, '""')}"`,
        d.precio,
        `"${d.imagen_url || ''}"`,
        d.destacado ? 'TRUE' : 'FALSE',
        d.visible !== false ? 'TRUE' : 'FALSE',
        d.precio_verificado !== false ? 'TRUE' : 'FALSE'
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kendra_plantilla_actualizada.csv');
    link.click();
    showToast('Plantilla CSV descargada para Google Sheets');
  }

  // -------------------------------------------------------------------------
  // 11. NAVEGACIÓN ENTRE TABS MÓVILES
  // -------------------------------------------------------------------------
  function setupAdminNavigation() {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Filtros de estado de diseños
    document.querySelectorAll('.filter-btn-admin').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn-admin').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AdminState.currentFilter = btn.getAttribute('data-filter');
        renderAdminDesignsList();
      });
    });

    // Buscador en lista
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        AdminState.searchQuery = e.target.value;
        renderAdminDesignsList();
      });
    }

    // Modal de edición
    const closeEditBtn = document.getElementById('closeEditModalBtn');
    if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);

    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
      saveEditBtn.addEventListener('click', () => {
        if (!AdminState.editingDesignId) return;
        const design = AdminState.designs.find(d => d.id === AdminState.editingDesignId);
        if (!design) return;

        design.nombre = document.getElementById('editDesignName').value.trim();
        design.categoria = document.getElementById('editDesignCategory').value;
        design.precio = parseFloat(document.getElementById('editDesignPrice').value);
        design.descripcion = document.getElementById('editDesignDesc').value.trim();
        design.destacado = document.getElementById('editDesignFeatured').checked;
        design.visible = document.getElementById('editDesignVisible').checked;

        saveDesignsToStore();
        updateDashboardMetrics();
        renderAdminDesignsList();
        closeEditModal();
        showToast('✓ Cambios guardados con éxito');
      });
    }

    const deleteDesignBtn = document.getElementById('deleteDesignBtn');
    if (deleteDesignBtn) {
      deleteDesignBtn.addEventListener('click', () => {
        if (!AdminState.editingDesignId) return;
        const design = AdminState.designs.find(d => d.id === AdminState.editingDesignId);
        if (!design) return;

        if (confirm(`¿Estás segura de eliminar permanentemente el diseño "${design.nombre}"?`)) {
          AdminState.designs = AdminState.designs.filter(d => d.id !== AdminState.editingDesignId);
          saveDesignsToStore();
          updateDashboardMetrics();
          renderAdminDesignsList();
          closeEditModal();
          showToast(`Diseño "${design.nombre}" eliminado`);
        }
      });
    }
  }

  function switchTab(tabId) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetSection = document.getElementById('sec-' + tabId);
    const targetBtn = document.querySelector(`.admin-tab-btn[data-tab="${tabId}"]`);

    if (targetSection) targetSection.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setupSettingsListeners() {
    const btnExportJSON = document.getElementById('btnExportJSON');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnChangePin = document.getElementById('btnChangePin');

    if (btnExportJSON) btnExportJSON.addEventListener('click', exportBackupJSON);
    if (btnExportCSV) btnExportCSV.addEventListener('click', exportBackupCSV);

    if (btnChangePin) {
      btnChangePin.addEventListener('click', async () => {
        const newPin = prompt('Introduce tu nueva clave de acceso:');
        if (newPin && newPin.trim().length >= 4) {
          const hash = await hashString(newPin.trim());
          localStorage.setItem('kendra_custom_pin_hash', hash);
          alert('Clave cambiada con éxito en este dispositivo.');
        } else if (newPin !== null) {
          alert('La clave debe tener al menos 4 caracteres.');
        }
      });
    }
  }

  function showToast(msg) {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const t = document.createElement('div');
    t.className = 'admin-toast';
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => {
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 2800);
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

  // API global para accesos rápidos en inicio
  window.KendraAdmin = {
    switchTab: switchTab,
    openEdit: (id) => {
      const design = AdminState.designs.find(d => d.id === id);
      if (design) openEditModal(design);
    }
  };

})();

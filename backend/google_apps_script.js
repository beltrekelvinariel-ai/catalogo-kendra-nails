/**
 * ============================================================================
 * KENDRA NAILS — BACKEND SERVERLESS GRATUITO CON GOOGLE APPS SCRIPT
 * ============================================================================
 * Este script se pega en Google Sheets (Extensiones > Apps Script) y se publica
 * como Aplicación Web para permitir a la dueña administrar el catálogo desde su
 * panel móvil de forma 100% gratuita, persistente y segura.
 * 
 * LÍMITES DEL PLAN GRATUITO DE GOOGLE (Consumo real estimado: < 1%):
 * - Ejecuciones por día: 20,000 llamadas (Más que suficiente para un salón).
 * - Tiempo de ejecución: 6 minutos por llamada.
 * - Almacenamiento: El espacio libre de Google Drive (15 GB compartidos).
 * - Costo mensual: $0.00 USD para siempre.
 * ============================================================================
 */

// 1. CONFIGURA TU CLAVE SECRETA DE ADMINISTRACIÓN
// Esta clave debe coincidir con la configurada en tu panel móvil admin.html
const ADMIN_SECRET_KEY = "KendraNails2026*SecretKey";

// Nombre de la hoja de cálculo donde están los datos
const SHEET_NAME = "Diseños";

/**
 * Endpoint GET: Devuelve todos los diseños en formato JSON
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ success: true, count: 0, designs: [] });
    }

    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const designs = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[1]) continue; // Fila vacía

      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });

      // Conversión de tipos
      item.precio = parseFloat(item.precio) || 0;
      item.destacado = String(item.destacado).toUpperCase() === "TRUE";
      item.visible = String(item.visible).toUpperCase() === "TRUE";
      item.precio_verificado = String(item.precio_verificado).toUpperCase() === "TRUE";

      designs.push(item);
    }

    return jsonResponse({ success: true, count: designs.length, designs: designs });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Endpoint POST: Crear, actualizar, eliminar u ocultar diseños
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // 1. Verificación de Seguridad
    if (!payload.token || payload.token !== ADMIN_SECRET_KEY) {
      return jsonResponse({ success: false, error: "No autorizado. Token inválido." }, 401);
    }

    const action = payload.action;
    const sheet = getOrCreateSheet();

    // Acción: Crear un nuevo diseño
    if (action === "create") {
      const d = payload.data;
      if (!d.nombre || !d.precio) {
        return jsonResponse({ success: false, error: "Nombre y precio son obligatorios." });
      }

      const newId = d.id || ("KN-" + (sheet.getLastRow()));
      const newRow = [
        newId,
        d.nombre,
        d.categoria || "General",
        d.descripcion || "",
        parseFloat(d.precio) || 0,
        d.imagen_url || "",
        d.destacado ? "TRUE" : "FALSE",
        d.visible !== false ? "TRUE" : "FALSE",
        d.precio_verificado !== false ? "TRUE" : "FALSE"
      ];

      sheet.appendRow(newRow);
      return jsonResponse({ success: true, message: "Diseño creado con éxito", id: newId });
    }

    // Acción: Actualizar un diseño existente
    if (action === "update") {
      const d = payload.data;
      if (!d.id) return jsonResponse({ success: false, error: "ID de diseño requerido." });

      const rowIndex = findRowIndexById(sheet, d.id);
      if (rowIndex === -1) {
        return jsonResponse({ success: false, error: "Diseño no encontrado con ID: " + d.id });
      }

      if (d.nombre !== undefined) sheet.getRange(rowIndex, 2).setValue(d.nombre);
      if (d.categoria !== undefined) sheet.getRange(rowIndex, 3).setValue(d.categoria);
      if (d.descripcion !== undefined) sheet.getRange(rowIndex, 4).setValue(d.descripcion);
      if (d.precio !== undefined) sheet.getRange(rowIndex, 5).setValue(parseFloat(d.precio));
      if (d.imagen_url !== undefined) sheet.getRange(rowIndex, 6).setValue(d.imagen_url);
      if (d.destacado !== undefined) sheet.getRange(rowIndex, 7).setValue(d.destacado ? "TRUE" : "FALSE");
      if (d.visible !== undefined) sheet.getRange(rowIndex, 8).setValue(d.visible ? "TRUE" : "FALSE");
      if (d.precio_verificado !== undefined) sheet.getRange(rowIndex, 9).setValue(d.precio_verificado ? "TRUE" : "FALSE");

      return jsonResponse({ success: true, message: "Diseño actualizado correctamente" });
    }

    // Acción: Alternar visibilidad (Publicar / Ocultar rápido)
    if (action === "toggleVisibility") {
      const id = payload.id;
      const visible = payload.visible;
      const rowIndex = findRowIndexById(sheet, id);
      if (rowIndex === -1) return jsonResponse({ success: false, error: "Diseño no encontrado" });

      sheet.getRange(rowIndex, 8).setValue(visible ? "TRUE" : "FALSE");
      return jsonResponse({ success: true, message: "Estado de visibilidad cambiado a " + (visible ? "PUBLICADO" : "OCULTO") });
    }

    // Acción: Eliminar un diseño
    if (action === "delete") {
      const id = payload.id;
      const rowIndex = findRowIndexById(sheet, id);
      if (rowIndex === -1) return jsonResponse({ success: false, error: "Diseño no encontrado" });

      sheet.deleteRow(rowIndex);
      return jsonResponse({ success: true, message: "Diseño eliminado con éxito" });
    }

    return jsonResponse({ success: false, error: "Acción no reconocida." });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Helpers
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0]; // Usa la primera pestaña
  }
  return sheet;
}

function findRowIndexById(sheet, id) {
  const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(id).trim()) {
      return i + 1; // Base 1 en Google Sheets
    }
  }
  return -1;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

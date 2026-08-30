/* =========================================================
   MI ELECTRI-AGENDA - Core Engine
   ========================================================= */

/* =========================
   ESTADO Y DATOS (localStorage)
   ========================= */
let clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
let servicios = JSON.parse(localStorage.getItem("servicios") || "[]");
let materiales = JSON.parse(localStorage.getItem("materiales") || "[]");
let trabajos = JSON.parse(localStorage.getItem("agenda") || "[]"); // Estandarizado a "agenda"
let presupuestos = JSON.parse(localStorage.getItem("presupuestos") || "[]");
let conceptos = [];

/* =========================
   DATOS INICIALES (Catálogo Base)
   ========================= */
if (servicios.length === 0) {
  servicios = [
    { id: Date.now() + 1, nombre: "Contacto", precio: 250 },
    { id: Date.now() + 2, nombre: "Apagador", precio: 250 },
    { id: Date.now() + 3, nombre: "Lámpara", precio: 450 },
    { id: Date.now() + 4, nombre: "Circuito 120 V", precio: 1500 },
    { id: Date.now() + 5, nombre: "Circuito 220 V", precio: 2000 },
    { id: Date.now() + 6, nombre: "Diagnóstico", precio: 500 }
  ];
  guardarDatos();
}

function guardarDatos() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
  localStorage.setItem("servicios", JSON.stringify(servicios));
  localStorage.setItem("materiales", JSON.stringify(materiales));
  localStorage.setItem("agenda", JSON.stringify(trabajos));
  localStorage.setItem("presupuestos", JSON.stringify(presupuestos));
}

/* =========================
   NAVEGACIÓN DE PANTALLAS
   ========================= */
function mostrar(id) {
  document.querySelectorAll("main > section").forEach(s => s.classList.add("hidden"));
  const seccion = document.getElementById(id);
  if (!seccion) return;
  
  seccion.classList.remove("hidden");

  if (id === "clientes") mostrarClientes();
  if (id === "servicios") mostrarServicios();
  if (id === "materiales") mostrarMateriales();
  if (id === "cotizador") prepararCotizador();
  if (id === "agenda") prepararAgenda();
  if (id === "cobros") mostrarCobros();

  window.scrollTo(0, 0);
}

/* =========================
   GESTIÓN DE CLIENTES
   ========================= */
function nuevoCliente() {
  const nombre = prompt("Nombre del cliente:");
  if (!nombre) return;
  const telefono = prompt("Teléfono:");
  const domicilio = prompt("Domicilio:");
  const referencias = prompt("Referencias:");

  clientes.push({ id: Date.now(), nombre, telefono, domicilio, referencias });
  guardarDatos();
  mostrarClientes();
}

function mostrarClientes() {
  const cont = document.getElementById("listaClientes");
  if (!cont) return;

  if (clientes.length === 0) {
    cont.innerHTML = `<div class="card empty">No tienes clientes todavía.</div>`;
    return;
  }

  cont.innerHTML = "";
  clientes.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${escapeHTML(c.nombre)}</h3>
      <p>📞 ${escapeHTML(c.telefono || "")}</p>
      <p>📍 ${escapeHTML(c.domicilio || "")}</p>
      ${c.referencias ? `<p>📝 ${escapeHTML(c.referencias)}</p>` : ""}
      <div class="actions">
        <button class="primary" onclick="editarCliente(${c.id})">Editar</button>
        <button class="danger" onclick="eliminarCliente(${c.id})">Eliminar</button>
        <button class="dark" onclick="abrirMaps('${encodeURIComponent(c.domicilio || "")}')">🗺️ Maps</button>
        <button class="dark" onclick="abrirWaze('${encodeURIComponent(c.domicilio || "")}')">🚗 Waze</button>
      </div>
    `;
    cont.appendChild(div);
  });
}

function editarCliente(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;
  const nombre = prompt("Nombre:", c.nombre);
  if (!nombre) return;
  c.nombre = nombre;
  c.telefono = prompt("Teléfono:", c.telefono || "");
  c.domicilio = prompt("Domicilio:", c.domicilio || "");
  c.referencias = prompt("Referencias:", c.referencias || "");

  guardarDatos();
  mostrarClientes();
}

function eliminarCliente(id) {
  if (!confirm("¿Eliminar este cliente?")) return;
  clientes = clientes.filter(c => c.id !== id);
  guardarDatos();
  mostrarClientes();
}

/* =========================
   GESTIÓN DE SERVICIOS
   ========================= */
function agregarServicio() {
  const nombre = document.getElementById("servNombre").value.trim();
  const precio = parseFloat(document.getElementById("servPrecio").value);

  if (!nombre || isNaN(precio) || precio <= 0) {
    alert("Escribe nombre y precio válido.");
    return;
  }

  servicios.push({ id: Date.now(), nombre, precio });
  guardarDatos();
  document.getElementById("servNombre").value = "";
  document.getElementById("servPrecio").value = "";
  mostrarServicios();
}

function mostrarServicios() {
  const cont = document.getElementById("listaServicios");
  if (!cont) return;

  if (servicios.length === 0) {
    cont.innerHTML = `<div class="card empty">No hay servicios.</div>`;
    return;
  }

  cont.innerHTML = "";
  servicios.forEach(s => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="row">
        <div>
          <h3>${escapeHTML(s.nombre)}</h3>
          <span class="badge">Mano de obra</span>
        </div>
        <div class="price">$${Number(s.precio).toFixed(2)}</div>
      </div>
      <div class="actions">
        <button class="danger" onclick="eliminarServicio(${s.id})">Eliminar</button>
      </div>
    `;
    cont.appendChild(div);
  });
}

function eliminarServicio(id) {
  servicios = servicios.filter(s => s.id !== id);
  guardarDatos();
  mostrarServicios();
}

/* =========================
   GESTIÓN DE MATERIALES
   ========================= */
function unidadTexto(unidad) {
  const mapa = {
    pieza: "pieza", metro: "metro", litro: "litro", kilogramo: "kg",
    caja: "caja", rollo: "rollo", paquete: "paquete", otro: "unidad"
  };
  return mapa[unidad] || "unidad";
}

function agregarMaterialCatalogo() {
  const nombre = document.getElementById("matNombre").value.trim();
  const unidad = document.getElementById("matUnidad").value;
  const contenido = parseFloat(document.getElementById("matContenido").value);
  const costo = parseFloat(document.getElementById("matCosto").value);
  const margen = parseFloat(document.getElementById("matMargen").value) || 0;
  const stock = parseFloat(document.getElementById("matStock").value) || 0;

  if (!nombre || isNaN(contenido) || contenido <= 0 || isNaN(costo) || costo <= 0) {
    alert("Completa nombre, contenido y costo válidos.");
    return;
  }

  const precioPresentacion = costo * (1 + margen / 100);
  const precioUnidad = precioPresentacion / contenido;

  materiales.push({
    id: Date.now(),
    nombre,
    unidad,
    contenido,
    costo,
    margen,
    precioPresentacion,
    precioUnidad,
    stock
  });

  guardarDatos();
  document.getElementById("matNombre").value = "";
  document.getElementById("matContenido").value = "1";
  document.getElementById("matCosto").value = "";
  document.getElementById("matMargen").value = "20";
  document.getElementById("matStock").value = "";

  mostrarMateriales();
}

function mostrarMateriales() {
  const cont = document.getElementById("listaMateriales");
  if (!cont) return;

  if (materiales.length === 0) {
    cont.innerHTML = `<div class="card empty">No hay materiales.</div>`;
    return;
  }

  cont.innerHTML = "";
  materiales.forEach(m => {
    const contenido = Number(m.contenido) || 1;
    const precioUnidad = Number(m.precioUnidad || (Number(m.precio || 0) / contenido));
    const stock = Number(m.stock) || 0;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="row">
        <div>
          <h3>${escapeHTML(m.nombre)}</h3>
          <span class="badge">${escapeHTML(unidadTexto(m.unidad))}</span>
        </div>
        <div class="price">$${precioUnidad.toFixed(2)} / ${escapeHTML(unidadTexto(m.unidad))}</div>
      </div>
      <hr>
      <p>📦 Presentación: <strong>${contenido} ${escapeHTML(unidadTexto(m.unidad))}</strong></p>
      <p>💵 Costo: $${Number(m.costo || 0).toFixed(2)}</p>
      <p>📈 Margen: ${Number(m.margen || 0).toFixed(2)}%</p>
      <p>💰 Venta presentación: <strong>$${Number(m.precioPresentacion || (m.precio || 0)).toFixed(2)}</strong></p>
      <div class="stock-box">
        📊 Existencia: <strong>${stock.toFixed(2)} ${escapeHTML(unidadTexto(m.unidad))}</strong>
      </div>
      <div class="actions">
        <button class="danger" onclick="eliminarMaterial(${m.id})">Eliminar</button>
      </div>
    `;
    cont.appendChild(div);
  });
}

function eliminarMaterial(id) {
  materiales = materiales.filter(m => m.id !== id);
  guardarDatos();
  mostrarMateriales();
}

/* =========================
   COTIZADOR Y PRESUPUESTOS
   ========================= */
function prepararCotizador() {
  const selectCliente = document.getElementById("clienteSeleccionado");
  selectCliente.innerHTML = `<option value="">Seleccionar cliente</option>`;
  clientes.forEach(c => {
    selectCliente.innerHTML += `<option value="${c.id}">${escapeHTML(c.nombre)}</option>`;
  });

  const selectServicio = document.getElementById("servicioSeleccionado");
  selectServicio.innerHTML = `<option value="">Seleccionar servicio</option>`;
  servicios.forEach(s => {
    selectServicio.innerHTML += `<option value="${s.id}">${escapeHTML(s.nombre)} - $${Number(s.precio).toFixed(2)}</option>`;
  });

  const selectMaterial = document.getElementById("materialSeleccionado");
  selectMaterial.innerHTML = `<option value="">Seleccionar material</option>`;
  materiales.forEach(m => {
    const precioUnidad = Number(m.precioUnidad || (Number(m.precio || 0) / (Number(m.contenido) || 1)));
    selectMaterial.innerHTML += `<option value="${m.id}">${escapeHTML(m.nombre)} - $${precioUnidad.toFixed(2)} / ${escapeHTML(unidadTexto(m.unidad))}</option>`;
  });

  mostrarInfoMaterialCotizacion();
}

function mostrarInfoMaterialCotizacion() {
  const id = parseInt(document.getElementById("materialSeleccionado").value);
  const div = document.getElementById("infoMaterialCotizacion");
  if (!id) { div.innerHTML = ""; return; }

  const m = materiales.find(x => x.id === id);
  if (!m) { div.innerHTML = ""; return; }

  const unidad = unidadTexto(m.unidad);
  const contenido = Number(m.contenido) || 1;
  const precioUnidad = Number(m.precioUnidad || (Number(m.precio || 0) / contenido));
  const stock = Number(m.stock) || 0;

  div.innerHTML = `
    <div class="info-box">
      <strong>${escapeHTML(m.nombre)}</strong><br><br>
      Precio por ${escapeHTML(unidad)}: <strong>$${precioUnidad.toFixed(2)}</strong><br>
      Existencia: <strong>${stock.toFixed(2)} ${escapeHTML(unidad)}</strong>
    </div>
  `;
}

function cargarClienteCotizacion() {
  const id = parseInt(document.getElementById("clienteSeleccionado").value);
  const c = clientes.find(x => x.id === id);
  const div = document.getElementById("datosCliente");

  if (!c) { div.innerHTML = ""; return; }

  div.innerHTML = `
    <div class="card">
      <strong>${escapeHTML(c.nombre)}</strong>
      <p>📞 ${escapeHTML(c.telefono || "")}</p>
      <p>📍 ${escapeHTML(c.domicilio || "")}</p>
      <div class="actions">
        <button class="dark" onclick="abrirMaps('${encodeURIComponent(c.domicilio || "")}')">🗺️ Maps</button>
        <button class="dark" onclick="abrirWaze('${encodeURIComponent(c.domicilio || "")}')">🚗 Waze</button>
      </div>
    </div>
  `;
}

function agregarServicioCotizacion() {
  const id = parseInt(document.getElementById("servicioSeleccionado").value);
  const cantidad = parseFloat(document.getElementById("cantidadServicio").value) || 1;
  const s = servicios.find(x => x.id === id);

  if (!s) { alert("Selecciona un servicio."); return; }

  conceptos.push({ tipo: "servicio", nombre: s.nombre, precio: Number(s.precio), cantidad });
  actualizarCotizacion();
}

function agregarMaterialCotizacion() {
  const id = parseInt(document.getElementById("materialSeleccionado").value);
  const cantidad = parseFloat(document.getElementById("cantidadMaterial").value) || 0;
  const m = materiales.find(x => x.id === id);

  if (!m) { alert("Selecciona un material."); return; }
  if (cantidad <= 0) { alert("Indica una cantidad válida."); return; }

  const unidad = unidadTexto(m.unidad);
  const stock = Number(m.stock) || 0;

  if (stock > 0 && cantidad > stock) {
    if (!confirm("Solo tienes " + stock.toFixed(2) + " " + unidad + ". ¿Deseas continuar?")) return;
  }

  const precioUnidad = Number(m.precioUnidad || (Number(m.precio || 0) / (Number(m.contenido) || 1)));

  conceptos.push({
    tipo: "material",
    materialId: m.id,
    nombre: m.nombre,
    unidad: m.unidad,
    precio: precioUnidad,
    cantidad
  });

  actualizarCotizacion();
}

function actualizarCotizacion() {
  const cont = document.getElementById("conceptos");
  let manoObra = 0;
  let totalMateriales = 0;

  if (conceptos.length === 0) {
    cont.innerHTML = `<div class="empty">No hay conceptos agregados.</div>`;
  } else {
    cont.innerHTML = "";
    conceptos.forEach((c, index) => {
      const subtotal = Number(c.precio) * Number(c.cantidad);
      if (c.tipo === "servicio") manoObra += subtotal;
      else totalMateriales += subtotal;

      const div = document.createElement("div");
      div.className = "item";
      const unidad = c.tipo === "material" ? unidadTexto(c.unidad) : "";

      div.innerHTML = `
        <div class="row">
          <div>
            <strong>${escapeHTML(c.nombre)}</strong><br>
            <small>${Number(c.cantidad).toFixed(2)} ${unidad} × $${Number(c.precio).toFixed(2)}</small>
          </div>
          <strong>$${subtotal.toFixed(2)}</strong>
        </div>
        <button class="danger" onclick="eliminarConcepto(${index})">Eliminar</button>
      `;
      cont.appendChild(div);
    });
  }

  const total = manoObra + totalMateriales;
  document.getElementById("subtotalServicios").textContent = "$" + manoObra.toFixed(2);
  document.getElementById("subtotalMateriales").textContent = "$" + totalMateriales.toFixed(2);
  document.getElementById("total").textContent = "$" + total.toFixed(2);
  document.getElementById("totalFinal").textContent = "$" + total.toFixed(2);

  calcularSaldo();
}

function eliminarConcepto(index) {
  conceptos.splice(index, 1);
  actualizarCotizacion();
}

function calcularSaldo() {
  const total = conceptos.reduce((sum, c) => sum + (Number(c.precio) * Number(c.cantidad)), 0);
  const anticipo = parseFloat(document.getElementById("anticipo").value) || 0;
  const saldo = Math.max(total - anticipo, 0);
  document.getElementById("saldo").textContent = "$" + saldo.toFixed(2);
}

document.getElementById("anticipo").addEventListener("input", calcularSaldo);

function guardarPresupuesto() {
  const clienteId = parseInt(document.getElementById("clienteSeleccionado").value);
  if (!clienteId) { alert("Selecciona un cliente."); return; }
  if (conceptos.length === 0) { alert("Agrega al menos un concepto."); return; }

  const anticipo = Math.max(parseFloat(document.getElementById("anticipo").value) || 0, 0);
  const total = conceptos.reduce((sum, c) => sum + (Number(c.precio) * Number(c.cantidad)), 0);

  if (anticipo > total) {
    alert("El anticipo no puede ser mayor al total.");
    return;
  }

  // Descontar inventario
  conceptos.forEach(c => {
    if (c.tipo !== "material" || !c.materialId) return;
    const m = materiales.find(x => x.id === c.materialId);
    if (!m) return;
    const stock = Number(m.stock) || 0;
    if (stock > 0) {
      m.stock = Math.max(stock - Number(c.cantidad), 0);
    }
  });

  const presupuesto = {
    id: Date.now(),
    clienteId,
    conceptos: JSON.parse(JSON.stringify(conceptos)),
    total,
    anticipo,
    saldo: Math.max(total - anticipo, 0),
    pagos: anticipo > 0 ? [{ id: Date.now() + 1, cantidad: anticipo, fecha: new Date().toLocaleString(), nota: "Anticipo" }] : [],
    estado: anticipo >= total ? "pagado" : anticipo > 0 ? "parcial" : "pendiente",
    fecha: new Date().toLocaleString()
  };

  presupuestos.push(presupuesto);
  guardarDatos();
  mostrarMateriales();

  alert("✅ Presupuesto guardado correctamente.");

  conceptos = [];
  document.getElementById("anticipo").value = "";
  actualizarCotizacion();
}

/* =========================
   AGENDA Y TRABAJOS
========================= */
function prepararAgenda() {
  const select = document.getElementById("agendaCliente");
  select.innerHTML = `<option value="">Seleccionar cliente</option>`;
  clientes.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${escapeHTML(c.nombre)}</option>`;
  });
  mostrarAgenda();
}

function guardarTrabajo() {
  const clienteId = parseInt(document.getElementById("agendaCliente").value);
  const fecha = document.getElementById("agendaFecha").value;
  const hora = document.getElementById("agendaHora").value;
  const trabajo = document.getElementById("agendaTrabajo").value.trim();
  const notas = document.getElementById("agendaNotas").value.trim();

  if (!clienteId) { alert("Selecciona un cliente."); return; }
  if (!fecha) { alert("Selecciona una fecha."); return; }
  if (!hora) { alert("Selecciona una hora."); return; }
  if (!trabajo) { alert("Escribe el trabajo a realizar."); return; }

  trabajos.push({
    id: Date.now(),
    clienteId,
    fecha,
    hora,
    trabajo,
    notas,
    estado: "pendiente"
  });

  guardarDatos();
  alert("✅ Trabajo programado.");

  document.getElementById("agendaCliente").value = "";
  document.getElementById("agendaFecha").value = "";
  document.getElementById("agendaHora").value = "";
  document.getElementById("agendaTrabajo").value = "";
  document.getElementById("agendaNotas").value = "";

  mostrarAgenda();
}

function mostrarAgenda() {
  const cont = document.getElementById("listaAgenda");
  if (!cont) return;

  if (trabajos.length === 0) {
    cont.innerHTML = `<div class="card empty">No tienes trabajos programados.</div>`;
    return;
  }

  const ordenados = [...trabajos].sort((a, b) => ((a.fecha || "") + (a.hora || "")).localeCompare((b.fecha || "") + (b.hora || "")));
  cont.innerHTML = "";

  ordenados.forEach(t => {
    const cliente = clientes.find(c => c.id === t.clienteId);
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>📅 ${escapeHTML(t.trabajo)}</h3>
      <div class="agenda-fecha">
        <strong>${escapeHTML(t.fecha)}</strong><br>⏰ ${escapeHTML(t.hora)}
      </div>
      <p>👤 ${escapeHTML(cliente ? cliente.nombre : "Cliente eliminado")}</p>
      ${cliente && cliente.telefono ? `<p>📞 ${escapeHTML(cliente.telefono)}</p>` : ""}
      ${cliente && cliente.domicilio ? `<p>📍 ${escapeHTML(cliente.domicilio)}</p>` : ""}
      ${t.notas ? `<p style="margin-top:8px">📝 ${escapeHTML(t.notas)}</p>` : ""}
      <div class="actions">
        ${cliente && cliente.domicilio ? `
          <button class="dark" onclick="abrirMaps('${encodeURIComponent(cliente.domicilio)}')">🗺️ Maps</button>
          <button class="dark" onclick="abrirWaze('${encodeURIComponent(cliente.domicilio)}')">🚗 Waze</button>
        ` : ""}
        <button class="success" onclick="marcarTrabajoTerminado(${t.id})">✓ Terminado</button>
        <button class="danger" onclick="eliminarTrabajo(${t.id})">Eliminar</button>
      </div>
    `;
    cont.appendChild(div);
  });
}

function marcarTrabajoTerminado(id) {
  const t = trabajos.find(x => x.id === id);
  if (!t) return;
  t.estado = "terminado";
  guardarDatos();
  mostrarAgenda();
}

function eliminarTrabajo(id) {
  if (!confirm("¿Eliminar este trabajo?")) return;
  trabajos = trabajos.filter(t => t.id !== id);
  guardarDatos();
  mostrarAgenda();
}

/* =========================
   MÓDULO DE COBROS Y CONTROL FINANCIERO
========================= */
function obtenerEstadoPresupuesto(p) {
  const total = Number(p.total) || 0;
  const pagos = Array.isArray(p.pagos) ? p.pagos : (Number(p.anticipo) > 0 ? [{ cantidad: Number(p.anticipo), fecha: p.fecha, nota: "Anticipo" }] : []);
  const cobrado = pagos.reduce((sum, pago) => sum + (Number(pago.cantidad) || 0), 0);
  const saldo = Math.max(total - cobrado, 0);

  let estado = "pendiente";
  if (saldo <= 0) estado = "pagado";
  else if (cobrado > 0) estado = "parcial";

  return { cobrado, saldo, estado };
}

function mostrarCobros() {
  const cont = document.getElementById("listaCobros");

  if (presupuestos.length === 0) {
    cont.innerHTML = `
      <div class="card empty">
        No tienes presupuestos guardados todavía.<br><br>
        Crea un presupuesto desde "Nuevo presupuesto".
      </div>
    `;
    actualizarEstadisticasCobros();
    return;
  }

  cont.innerHTML = "";
  const lista = [...presupuestos].reverse();

  lista.forEach(p => {
    const cliente = clientes.find(c => c.id === p.clienteId);
    const info = obtenerEstadoPresupuesto(p);

    let clase = "cobro-pendiente";
    let badge = `<span class="badge badge-red">Pendiente</span>`;

    if (info.estado === "parcial") {
      clase = "cobro-parcial";
      badge = `<span class="badge badge-yellow">Pago parcial</span>`;
    }

    if (info.estado === "pagado") {
      clase = "cobro-pagado";
      badge = `<span class="badge badge-green">Pagado</span>`;
    }

    const div = document.createElement("div");
    div.className = "card cobro-card " + clase;
    div.innerHTML = `
      <div class="row">
        <div>
          <h3>${escapeHTML(cliente ? cliente.nombre : "Cliente eliminado")}</h3>
          ${badge}
        </div>
        <strong>$${Number(p.total).toFixed(2)}</strong>
      </div>
      <hr>
      <p>📅 ${escapeHTML(p.fecha || "")}</p>
      <p style="margin-top:6px">💵 Cobrado: <strong>$${info.cobrado.toFixed(2)}</strong></p>
      <p style="margin-top:6px">💰 Saldo: <strong>$${info.saldo.toFixed(2)}</strong></p>

      <div class="actions">
        ${info.saldo > 0 ? `<button class="success" onclick="registrarPago(${p.id})">💵 Registrar pago</button>` : ""}
        <button class="primary" onclick="verDetalleCobro(${p.id})">📋 Detalle</button>
        <button class="dark" onclick="whatsappCobro(${p.id})">📲 WhatsApp</button>
        <button class="danger" onclick="eliminarCobro(${p.id})">🗑️ Eliminar</button>
      </div>

      <div id="detalle-${p.id}" class="hidden" style="margin-top:12px">
        ${generarDetallePagos(p)}
      </div>
    `;
    cont.appendChild(div);
  });

  actualizarEstadisticasCobros();
}

function actualizarEstadisticasCobros() {
  let cobrado = 0;
  let porCobrar = 0;

  presupuestos.forEach(p => {
    const info = obtenerEstadoPresupuesto(p);
    cobrado += info.cobrado;
    porCobrar += info.saldo;
  });

  document.getElementById("totalCobrado").textContent = "$" + cobrado.toFixed(2);
  document.getElementById("totalPorCobrar").textContent = "$" + porCobrar.toFixed(2);
}

function generarDetallePagos(p) {
  const pagos = Array.isArray(p.pagos) ? p.pagos : [];
  if (pagos.length === 0) return `<p class="empty">No hay pagos registrados.</p>`;

  let html = "";
  pagos.forEach((pago, index) => {
    html += `
      <div class="item">
        <div class="row">
          <div>
            <strong>Pago ${index + 1}</strong><br>
            <small>${escapeHTML(pago.fecha || "")}</small>
          </div>
          <strong>$${Number(pago.cantidad || 0).toFixed(2)}</strong>
        </div>
        ${pago.nota ? `<small>${escapeHTML(pago.nota)}</small>` : ""}
      </div>
    `;
  });
  return html;
}

function verDetalleCobro(id) {
  const div = document.getElementById("detalle-" + id);
  if (!div) return;
  div.classList.toggle("hidden");
}

function registrarPago(id) {
  const p = presupuestos.find(x => x.id === id);
  if (!p) return;

  const info = obtenerEstadoPresupuesto(p);
  if (info.saldo <= 0) {
    alert("Este presupuesto ya está pagado.");
    return;
  }

  const cantidad = parseFloat(prompt("¿Cuánto pagó el cliente?\nSaldo actual: $" + info.saldo.toFixed(2)));
  if (isNaN(cantidad) || cantidad <= 0) return;

  if (cantidad > info.saldo) {
    alert("El pago no puede ser mayor al saldo.");
    return;
  }

  const nota = prompt("Nota del pago (opcional):") || "";

  if (!Array.isArray(p.pagos)) p.pagos = [];

  p.pagos.push({
    id: Date.now(),
    cantidad,
    fecha: new Date().toLocaleString(),
    nota
  });

  const nuevo = obtenerEstadoPresupuesto(p);
  p.anticipo = p.pagos.reduce((sum, pago) => sum + Number(pago.cantidad || 0), 0);
  p.saldo = nuevo.saldo;
  p.estado = nuevo.estado;

  guardarDatos();
  mostrarCobros();
  alert("✅ Pago registrado.");
}

function eliminarCobro(id) {
  const p = presupuestos.find(x => x.id === id);
  if (!p) return;

  const cliente = clientes.find(c => c.id === p.clienteId);
  const nombreCliente = cliente ? cliente.nombre : "este cliente";

  if (!confirm("¿Eliminar este cobro?\n\nCliente: " + nombreCliente + "\nTotal: $" + Number(p.total).toFixed(2) + "\n\nEsta acción no se puede deshacer.")) {
    return;
  }

  presupuestos = presupuestos.filter(x => x.id !== id);
  guardarDatos();
  mostrarCobros();
  alert("✅ Cobro eliminado correctamente.");
}

/* =========================
   INTEGRACIÓN CON WHATSAPP Y NAVEGACIÓN MAPS
========================= */
function whatsappCobro(id) {
  const p = presupuestos.find(x => x.id === id);
  if (!p) return;
  const cliente = clientes.find(c => c.id === p.clienteId);
  if (!cliente) { alert("No se encontró el cliente."); return; }

  const info = obtenerEstadoPresupuesto(p);
  let mensaje = "⚡ Mi Electri-Agenda\n\n";
  mensaje += "Hola " + cliente.nombre + ", este es el estado de tu presupuesto:\n\n";
  mensaje += "Total: $" + Number(p.total).toFixed(2) + "\n";
  mensaje += "Pagado: $" + info.cobrado.toFixed(2) + "\n";
  mensaje += "Saldo pendiente: $" + info.saldo.toFixed(2) + "\n";

  if (info.estado === "pagado") {
    mensaje += "\n✅ Presupuesto liquidado.";
  } else {
    mensaje += "\n💰 Pendiente de pago.";
  }

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}

function compartirWhatsApp() {
  const clienteId = parseInt(document.getElementById("clienteSeleccionado").value);
  const cliente = clientes.find(c => c.id === clienteId);

  if (!cliente) { alert("Selecciona un cliente."); return; }
  if (conceptos.length === 0) { alert("Agrega al menos un concepto."); return; }

  const total = conceptos.reduce((sum, c) => sum + (Number(c.precio) * Number(c.cantidad)), 0);

  let mensaje = "⚡ Mi Electri-Agenda\n\nPresupuesto para: " + cliente.nombre + "\n\n";
  conceptos.forEach(c => {
    const unidad = c.tipo === "material" ? unidadTexto(c.unidad) : "";
    mensaje += c.nombre + " - " + Number(c.cantidad).toFixed(2) + " " + unidad + " = $" + (Number(c.precio) * Number(c.cantidad)).toFixed(2) + "\n";
  });
  mensaje += "\nTOTAL: $" + total.toFixed(2);

  window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
}

function abrirMaps(direccion) {
  if (!direccion) { alert("No hay domicilio registrado."); return; }
  window.open("https://www.google.com/maps/search/?api=1&query=" + direccion, "_blank");
}

function abrirWaze(direccion) {
  if (!direccion) { alert("No hay domicilio registrado."); return; }
  window.open("https://www.waze.com/ul?q=" + direccion + "&navigate=yes", "_blank");
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   INICIALIZACIÓN
========================= */
mostrar("inicio");

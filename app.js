/* =========================================================
   MI ELECTRI-AGENDA
   Lógica principal de la aplicación
   ========================================================= */


/* =========================
   DATOS
   ========================= */

let clientes =
  JSON.parse(localStorage.getItem("clientes") || "[]");

let servicios =
  JSON.parse(localStorage.getItem("servicios") || "[]");

let materiales =
  JSON.parse(localStorage.getItem("materiales") || "[]");

let presupuestos =
  JSON.parse(localStorage.getItem("presupuestos") || "[]");

let trabajos =
  JSON.parse(localStorage.getItem("trabajos") || "[]");

let pagos =
  JSON.parse(localStorage.getItem("pagos") || "[]");

let conceptos = [];


/* =========================
   DATOS INICIALES
   ========================= */

if (servicios.length === 0) {

  servicios = [

    {
      id: Date.now() + 1,
      nombre: "Contacto",
      precio: 250
    },

    {
      id: Date.now() + 2,
      nombre: "Apagador",
      precio: 250
    },

    {
      id: Date.now() + 3,
      nombre: "Lámpara",
      precio: 450
    },

    {
      id: Date.now() + 4,
      nombre: "Circuito 120 V",
      precio: 1500
    },

    {
      id: Date.now() + 5,
      nombre: "Circuito 220 V",
      precio: 2000
    },

    {
      id: Date.now() + 6,
      nombre: "Diagnóstico",
      precio: 500
    }

  ];

  guardarDatos();
}


/* =========================
   GUARDAR DATOS
   ========================= */

function guardarDatos() {

  localStorage.setItem(
    "clientes",
    JSON.stringify(clientes)
  );

  localStorage.setItem(
    "servicios",
    JSON.stringify(servicios)
  );

  localStorage.setItem(
    "materiales",
    JSON.stringify(materiales)
  );

  localStorage.setItem(
    "presupuestos",
    JSON.stringify(presupuestos)
  );

  localStorage.setItem(
    "trabajos",
    JSON.stringify(trabajos)
  );

  localStorage.setItem(
    "pagos",
    JSON.stringify(pagos)
  );
}


/* =========================
   NAVEGACIÓN
   ========================= */

function mostrar(id) {

  document
    .querySelectorAll("main > section")
    .forEach(s => s.classList.add("hidden"));

  const seccion = document.getElementById(id);

  if (!seccion) return;

  seccion.classList.remove("hidden");

  if (id === "clientes")
    mostrarClientes();

  if (id === "servicios")
    mostrarServicios();

  if (id === "materiales")
    mostrarMateriales();

  if (id === "cotizador")
    prepararCotizador();

  if (id === "agenda")
    mostrarAgenda();

  if (id === "historial")
    mostrarHistorial();

  if (id === "cobros")
    mostrarCobros();

  window.scrollTo(0, 0);
}


/* =========================
   CLIENTES
   ========================= */

function nuevoCliente() {

  const nombre =
    prompt("Nombre del cliente:");

  if (!nombre) return;

  const telefono =
    prompt("Teléfono:");

  const domicilio =
    prompt("Domicilio:");

  const referencias =
    prompt("Referencias:");

  clientes.push({

    id: Date.now(),

    nombre,

    telefono,

    domicilio,

    referencias

  });

  guardarDatos();

  mostrarClientes();
}


function mostrarClientes() {

  const cont =
    document.getElementById("listaClientes");

  if (!cont) return;

  if (clientes.length === 0) {

    cont.innerHTML =
      '<div class="card empty">No tienes clientes todavía.</div>';

    return;
  }

  cont.innerHTML = "";

  clientes.forEach(c => {

    const div =
      document.createElement("div");

    div.className = "card";

    div.innerHTML = `

      <h3>${escapeHTML(c.nombre)}</h3>

      <p>📞 ${escapeHTML(c.telefono || "")}</p>

      <p>📍 ${escapeHTML(c.domicilio || "")}</p>

      ${
        c.referencias
        ? `<p>📝 ${escapeHTML(c.referencias)}</p>`
        : ""
      }

      <div class="actions">

        <button class="primary"
          onclick="editarCliente(${c.id})">
          Editar
        </button>

        <button class="danger"
          onclick="eliminarCliente(${c.id})">
          Eliminar
        </button>

        <button class="dark"
          onclick="abrirMaps('${encodeURIComponent(c.domicilio || "")}')">
          🗺️ Maps
        </button>

        <button class="dark"
          onclick="abrirWaze('${encodeURIComponent(c.domicilio || "")}')">
          🚗 Waze
        </button>

      </div>

    `;

    cont.appendChild(div);

  });
}


function editarCliente(id) {

  const c =
    clientes.find(x => x.id === id);

  if (!c) return;

  const nombre =
    prompt("Nombre:", c.nombre);

  if (!nombre) return;

  c.nombre = nombre;

  c.telefono =
    prompt("Teléfono:", c.telefono || "");

  c.domicilio =
    prompt("Domicilio:", c.domicilio || "");

  c.referencias =
    prompt("Referencias:", c.referencias || "");

  guardarDatos();

  mostrarClientes();
}


function eliminarCliente(id) {

  if (!confirm("¿Eliminar este cliente?"))
    return;

  clientes =
    clientes.filter(c => c.id !== id);

  guardarDatos();

  mostrarClientes();
}


/* =========================
   SERVICIOS
   ========================= */

function agregarServicio() {

  const nombre =
    document
      .getElementById("servNombre")
      .value
      .trim();

  const precio =
    parseFloat(
      document.getElementById("servPrecio").value
    );

  if (!nombre || !precio) {

    alert("Escribe nombre y precio.");

    return;
  }

  servicios.push({

    id: Date.now(),

    nombre,

    precio

  });

  guardarDatos();

  document.getElementById("servNombre").value = "";

  document.getElementById("servPrecio").value = "";

  mostrarServicios();
}


function mostrarServicios() {

  const cont =
    document.getElementById("listaServicios");

  if (!cont) return;

  if (servicios.length === 0) {

    cont.innerHTML =
      '<div class="card empty">No hay servicios.</div>';

    return;
  }

  cont.innerHTML = "";

  servicios.forEach(s => {

    const div =
      document.createElement("div");

    div.className = "card";

    div.innerHTML = `

      <div class="row">

        <div>

          <h3>${escapeHTML(s.nombre)}</h3>

          <span class="badge">
            Mano de obra
          </span>

        </div>

        <div class="price">
          $${s.precio.toFixed(2)}
        </div>

      </div>

      <div class="actions">

        <button class="danger"
          onclick="eliminarServicio(${s.id})">
          Eliminar
        </button>

      </div>

    `;

    cont.appendChild(div);

  });
}


function eliminarServicio(id) {

  servicios =
    servicios.filter(s => s.id !== id);

  guardarDatos();

  mostrarServicios();
}


/* =========================
   MATERIALES
   ========================= */

function agregarMaterialCatalogo() {

  const nombre =
    document
      .getElementById("matNombre")
      .value
      .trim();

  const costo =
    parseFloat(
      document.getElementById("matCosto").value
    );

  const margen =
    parseFloat(
      document.getElementById("matMargen").value
    ) || 0;

  if (!nombre || !costo) {

    alert("Escribe nombre y costo.");

    return;
  }

  const precio =
    costo * (1 + margen / 100);

  materiales.push({

    id: Date.now(),

    nombre,

    costo,

    margen,

    precio

  });

  guardarDatos();

  document.getElementById("matNombre").value = "";

  document.getElementById("matCosto").value = "";

  mostrarMateriales();
}


function mostrarMateriales() {

  const cont =
    document.getElementById("listaMateriales");

  if (!cont) return;

  if (materiales.length === 0) {

    cont.innerHTML =
      '<div class="card empty">No hay materiales.</div>';

    return;
  }

  cont.innerHTML = "";

  materiales.forEach(m => {

    const div =
      document.createElement("div");

    div.className = "card";

    div.innerHTML = `

      <div class="row">

        <div>

          <h3>${escapeHTML(m.nombre)}</h3>

          <small>
            Costo: $${m.costo.toFixed(2)}
            · Margen: ${m.margen}%
          </small>

        </div>

        <div class="price">
          $${m.precio.toFixed(2)}
        </div>

      </div>

      <div class="actions">

        <button class="danger"
          onclick="eliminarMaterial(${m.id})">
          Eliminar
        </button>

      </div>

    `;

    cont.appendChild(div);

  });
}


function eliminarMaterial(id) {

  materiales =
    materiales.filter(m => m.id !== id);

  guardarDatos();

  mostrarMateriales();
}


/* =========================
   COTIZADOR
   ========================= */

function prepararCotizador() {

  const selectCliente =
    document.getElementById(
      "clienteSeleccionado"
    );

  if (!selectCliente) return;

  selectCliente.innerHTML =
    '<option value="">Seleccionar cliente</option>';

  clientes.forEach(c => {

    selectCliente.innerHTML += `

      <option value="${c.id}">
        ${escapeHTML(c.nombre)}
      </option>

    `;

  });


  const selectServicio =
    document.getElementById(
      "servicioSeleccionado"
    );

  selectServicio.innerHTML =
    '<option value="">Seleccionar servicio</option>';

  servicios.forEach(s => {

    selectServicio.innerHTML += `

      <option value="${s.id}">
        ${escapeHTML(s.nombre)}
        - $${s.precio.toFixed(2)}
      </option>

    `;

  });


  const selectMaterial =
    document.getElementById(
      "materialSeleccionado"
    );

  selectMaterial.innerHTML =
    '<option value="">Seleccionar material</option>';

  materiales.forEach(m => {

    selectMaterial.innerHTML += `

      <option value="${m.id}">
        ${escapeHTML(m.nombre)}
        - $${m.precio.toFixed(2)}
      </option>

    `;

  });
}


function cargarClienteCotizacion() {

  const id =
    parseInt(
      document.getElementById(
        "clienteSeleccionado"
      ).value
    );

  const c =
    clientes.find(x => x.id === id);

  const div =
    document.getElementById(
      "datosCliente"
    );

  if (!c) {

    div.innerHTML = "";

    return;
  }

  div.innerHTML = `

    <div class="card">

      <strong>
        ${escapeHTML(c.nombre)}
      </strong>

      <p>
        📞 ${escapeHTML(c.telefono || "")}
      </p>

      <p>
        📍 ${escapeHTML(c.domicilio || "")}
      </p>

      <div class="actions">

        <button class="dark"
          onclick="abrirMaps('${encodeURIComponent(c.domicilio || "")}')">
          🗺️ Maps
        </button>

        <button class="dark"
          onclick="abrirWaze('${encodeURIComponent(c.domicilio || "")}')">
          🚗 Waze
        </button>

      </div>

    </div>

  `;
}


function agregarServicioCotizacion() {

  const id =
    parseInt(
      document.getElementById(
        "servicioSeleccionado"
      ).value
    );

  const cantidad =
    parseInt(
      document.getElementById(
        "cantidadServicio"
      ).value
    ) || 1;

  const s =
    servicios.find(x => x.id === id);

  if (!s) {

    alert("Selecciona un servicio.");

    return;
  }

  conceptos.push({

    tipo: "servicio",

    nombre: s.nombre,

    precio: s.precio,

    cantidad

  });

  actualizarCotizacion();
}


function agregarMaterialCotizacion() {

  const id =
    parseInt(
      document.getElementById(
        "materialSeleccionado"
      ).value
    );

  const cantidad =
    parseInt(
      document.getElementById(
        "cantidadMaterial"
      ).value
    ) || 1;

  const m =
    materiales.find(x => x.id === id);

  if (!m) {

    alert("Selecciona un material.");

    return;
  }

  conceptos.push({

    tipo: "material",

    nombre: m.nombre,

    precio: m.precio,

    cantidad

  });

  actualizarCotizacion();
}


function actualizarCotizacion() {

  const cont =
    document.getElementById("conceptos");

  if (!cont) return;

  let manoObra = 0;

  let totalMateriales = 0;


  if (conceptos.length === 0) {

    cont.innerHTML =
      '<div class="empty">No hay conceptos agregados.</div>';

  } else {

    cont.innerHTML = "";

    conceptos.forEach((c, index) => {

      const subtotal =
        c.precio * c.cantidad;

      if (c.tipo === "servicio")
        manoObra += subtotal;
      else
        totalMateriales += subtotal;


      const div =
        document.createElement("div");

      div.className = "item";

      div.innerHTML = `

        <div class="row">

          <div>

            <strong>
              ${escapeHTML(c.nombre)}
            </strong>

            <br>

            <small>
              ${c.cantidad}
              ×
              $${c.precio.toFixed(2)}
            </small>

          </div>

          <strong>
            $${subtotal.toFixed(2)}
          </strong>

        </div>

        <button class="danger"
          onclick="eliminarConcepto(${index})">
          Eliminar
        </button>

      `;

      cont.appendChild(div);

    });

  }


  const total =
    manoObra + totalMateriales;


  document.getElementById(
    "subtotalServicios"
  ).textContent =
    "$" + manoObra.toFixed(2);

  document.getElementById(
    "subtotalMateriales"
  ).textContent =
    "$" + totalMateriales.toFixed(2);

  document.getElementById(
    "total"
  ).textContent =
    "$" + total.toFixed(2);

  document.getElementById(
    "totalFinal"
  ).textContent =
    "$" + total.toFixed(2);

  calcularSaldo();
}


function eliminarConcepto(index) {

  conceptos.splice(index, 1);

  actualizarCotizacion();
}


/* =========================
   PAGOS
   ========================= */

function calcularSaldo() {

  const total =
    conceptos.reduce(
      (sum, c) =>
        sum + c.precio * c.cantidad,
      0
    );

  const anticipo =
    parseFloat(
      document.getElementById(
        "anticipo"
      )?.value
    ) || 0;

  const saldo =
    Math.max(total - anticipo, 0);

  const elemento =
    document.getElementById("saldo");

  if (elemento)
    elemento.textContent =
      "$" + saldo.toFixed(2);
}


/* =========================
   GUARDAR PRESUPUESTO
   ========================= */

function guardarPresupuesto() {

  const clienteId =
    parseInt(
      document.getElementById(
        "clienteSeleccionado"
      ).value
    );

  if (!clienteId) {

    alert("Selecciona un cliente.");

    return;
  }

  if (conceptos.length === 0) {

    alert("Agrega al menos un concepto.");

    return;
  }

  const anticipo =
    parseFloat(
      document.getElementById(
        "anticipo"
      ).value
    ) || 0;

  const total =
    conceptos.reduce(
      (sum, c) =>
        sum + c.precio * c.cantidad,
      0
    );

  const presupuesto = {

    id: Date.now(),

    numero:
      "PRE-" +
      String(presupuestos.length + 1)
        .padStart(4, "0"),

    clienteId,

    conceptos: [...conceptos],

    total,

    anticipo,

    saldo:
      Math.max(total - anticipo, 0),

    estado:
      anticipo >= total
        ? "Pagado"
        : anticipo > 0
        ? "Anticipo"
        : "Pendiente",

    fecha:
      new Date().toISOString()

  };


  presupuestos.push(presupuesto);

  guardarDatos();


  alert(
    "✅ Presupuesto " +
    presupuesto.numero +
    " guardado."
  );


  crearTrabajoDesdePresupuesto(
    presupuesto
  );

  conceptos = [];

  actualizarCotizacion();
}


/* =========================
   CREAR TRABAJO
   ========================= */

function crearTrabajoDesdePresupuesto(
  presupuesto
) {

  const cliente =
    clientes.find(
      c => c.id === presupuesto.clienteId
    );

  if (!cliente) return;


  const trabajo = {

    id: Date.now() + 1,

    presupuestoId:
      presupuesto.id,

    clienteId:
      cliente.id,

    fecha:
      new Date().toISOString()
        .split("T")[0],

    hora: "",

    descripcion:
      presupuesto.conceptos
        .map(c => c.nombre)
        .join(", "),

    total:
      presupuesto.total,

    estado:
      "Pendiente"

  };


  trabajos.push(trabajo);

  guardarDatos();
}


/* =========================
   AGENDA
   ========================= */

function mostrarAgenda() {

  const cont =
    document.getElementById(
      "listaAgenda"
    );

  if (!cont) return;

  if (trabajos.length === 0) {

    cont.innerHTML =
      '<div class="card empty">No hay trabajos programados.</div>';

    return;
  }

  cont.innerHTML = "";

  const ordenados =
    [...trabajos].sort(
      (a, b) =>
        new Date(a.fecha) -
        new Date(b.fecha)
    );


  ordenados.forEach(t => {

    const cliente =
      clientes.find(
        c => c.id === t.clienteId
      );

    if (!cliente) return;


    const div =
      document.createElement("div");

    div.className =
      "card job " +
      (
        t.estado === "Terminado"
          ? "completed"
          : "pending"
      );


    div.innerHTML = `

      <div class="row">

        <div>

          <h3>
            ${escapeHTML(cliente.nombre)}
          </h3>

          <span class="badge">
            ${escapeHTML(t.estado)}
          </span>

        </div>

        <strong>
          ${formatearFecha(t.fecha)}
        </strong>

      </div>

      <p>
        🕐 ${escapeHTML(t.hora || "Sin hora")}
      </p>

      <p>
        🔧 ${escapeHTML(t.descripcion)}
      </p>

      <p>
        💰 $${t.total.toFixed(2)}
      </p>

      <p>
        📍 ${escapeHTML(cliente.domicilio || "")}
      </p>

      <div class="actions">

        <button class="dark"
          onclick="abrirMaps('${encodeURIComponent(cliente.domicilio || "")}')">
          🗺️ Maps
        </button>

        <button class="dark"
          onclick="abrirWaze('${encodeURIComponent(cliente.domicilio || "")}')">
          🚗 Waze
        </button>

        <button class="success"
          onclick="terminarTrabajo(${t.id})">
          ✓ Terminar
        </button>

      </div>

    `;

    cont.appendChild(div);

  });
}


function terminarTrabajo(id) {

  const trabajo =
    trabajos.find(
      t => t.id === id
    );

  if (!trabajo) return;

  trabajo.estado =
    "Terminado";

  guardarDatos();

  mostrarAgenda();
}


/* =========================
   HISTORIAL
   ========================= */

function mostrarHistorial() {

  const cont =
    document.getElementById(
      "listaHistorial"
    );

  if (!cont) return;

  if (presupuestos.length === 0) {

    cont.innerHTML =
      '<div class="card empty">No hay presupuestos guardados.</div>';

    return;
  }


  let html = "";

  let total =
    0;

  let cobrado =
    0;


  [...presupuestos]
    .reverse()
    .forEach(p => {

      const cliente =
        clientes.find(
          c => c.id === p.clienteId
        );

      total += p.total;

      cobrado += p.anticipo;


      html += `

        <div class="card">

          <div class="row">

            <div>

              <h3>
                ${p.numero}
              </h3>

              <p>
                ${escapeHTML(
                  cliente?.nombre ||
                  "Cliente eliminado"
                )}
              </p>

            </div>

            <strong>
              $${p.total.toFixed(2)}
            </strong>

          </div>

          <p>
            📅 ${formatearFechaHora(p.fecha)}
          </p>

          <p>
            💰 Pagado:
            $${p.anticipo.toFixed(2)}
          </p>

          <p class="${
            p.saldo > 0
              ? "balance"
              : "no-balance"
          }">

            ${
              p.saldo > 0
                ? "Saldo: $" +
                  p.saldo.toFixed(2)
                : "✓ Liquidado"
            }

          </p>

        </div>

      `;

    });


  const resumen = `

    <div class="card">

      <h2>📊 Resumen</h2>

      <div class="stat-grid">

        <div class="stat">

          Presupuestado

          <strong>
            $${total.toFixed(2)}
          </strong>

        </div>

        <div class="stat">

          Cobrado

          <strong>
            $${cobrado.toFixed(2)}
          </strong>

        </div>

      </div>

    </div>

  `;


  cont.innerHTML =
    resumen + html;
}


/* =========================
   COBROS
   ==============

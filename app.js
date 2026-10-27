// Clase que representa una tarea individual.
class Tarea {
  constructor(nombre, completa = false, id = null) {
    this.id = id ?? (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    this.nombre = nombre;
    this.completa = completa;
  }

  editar(nuevoNombre) {
    this.nombre = nuevoNombre;
  }

  actualizarEstado() {
    this.completa = !this.completa;
  }
}

// Clase que administra la lista y las operaciones de las tareas.
class GestorDeTareas {
  constructor() {
    this.tareas = [];
    this.cargar();
  }

  agregarTarea(nombre) {
    const tarea = new Tarea(nombre);
    this.tareas.push(tarea);
    this.guardar();
    this.render();
  }

  editarTarea(id, nuevoNombre) {
    const tarea = this.tareas.find((elemento) => elemento.id === id);
    if (!tarea) return;

    tarea.editar(nuevoNombre);
    this.guardar();
    this.render();
  }

  cambiarEstado(id) {
    const tarea = this.tareas.find((elemento) => elemento.id === id);
    if (!tarea) return;

    tarea.actualizarEstado();
    this.guardar();
    this.render();
  }

  eliminarTarea(id) {
    this.tareas = this.tareas.filter((tarea) => tarea.id !== id);
    this.guardar();
    this.render();
  }

  limpiarCompletadas() {
    this.tareas = this.tareas.filter((tarea) => !tarea.completa);
    this.guardar();
    this.render();
  }

  guardar() {
    localStorage.setItem("printlab-gestor-tareas", JSON.stringify(this.tareas));
  }

  cargar() {
    try {
      const datosGuardados = JSON.parse(localStorage.getItem("printlab-gestor-tareas")) || [];
      this.tareas = datosGuardados.map(
        (dato) => new Tarea(dato.nombre, dato.completa, dato.id)
      );
    } catch (error) {
      this.tareas = [];
      console.error("No se pudieron cargar las tareas guardadas:", error);
    }
  }

  render() {
    const lista = document.querySelector("#lista-tareas");
    const listaVacia = document.querySelector("#lista-vacia");
    const contador = document.querySelector("#contador");

    lista.innerHTML = "";

    this.tareas.forEach((tarea) => {
      const elemento = document.createElement("li");
      elemento.className = `tarea ${tarea.completa ? "completa" : ""}`;
      elemento.dataset.id = tarea.id;

      // El texto del usuario se inserta mediante textContent para evitar interpretar HTML.
      const contenido = document.createElement("div");
      contenido.className = "tarea-contenido";

      const nombre = document.createElement("span");
      nombre.className = "tarea-nombre";
      nombre.textContent = tarea.nombre;

      const estado = document.createElement("span");
      estado.className = "estado";
      estado.textContent = tarea.completa ? "Completada" : "Pendiente";

      contenido.append(nombre, estado);

      const acciones = document.createElement("div");
      acciones.className = "acciones";
      acciones.innerHTML = `
        <button type="button" class="boton boton-secundario" data-accion="estado">
          ${tarea.completa ? "Reabrir" : "Completar"}
        </button>
        <button type="button" class="boton boton-secundario" data-accion="editar">
          Editar
        </button>
        <button type="button" class="boton boton-secundario boton-eliminar" data-accion="eliminar">
          Eliminar
        </button>
      `;

      elemento.append(contenido, acciones);
      lista.append(elemento);
    });

    const pendientes = this.tareas.filter((tarea) => !tarea.completa).length;
    contador.textContent = `${this.tareas.length} ${this.tareas.length === 1 ? "tarea" : "tareas"} · ${pendientes} pendientes`;
    listaVacia.hidden = this.tareas.length > 0;
  }
}

const gestor = new GestorDeTareas();
const formulario = document.querySelector("#formulario-tarea");
const entrada = document.querySelector("#nueva-tarea");
const mensaje = document.querySelector("#mensaje");
const listaTareas = document.querySelector("#lista-tareas");
const limpiarCompletadas = document.querySelector("#limpiar-completadas");

gestor.render();

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nombre = entrada.value.trim();
  if (!nombre) {
    mensaje.textContent = "Escribe una tarea antes de agregarla.";
    entrada.focus();
    return;
  }

  gestor.agregarTarea(nombre);
  formulario.reset();
  mensaje.textContent = "Tarea agregada correctamente.";
  entrada.focus();
});

listaTareas.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const elemento = boton.closest("li[data-id]");
  const id = elemento.dataset.id;
  const accion = boton.dataset.accion;
  const tarea = gestor.tareas.find((elementoTarea) => elementoTarea.id === id);

  if (accion === "editar" && tarea) {
    const nuevoNombre = window.prompt("Edita el nombre de la tarea:", tarea.nombre);
    if (nuevoNombre === null) return;

    if (!nuevoNombre.trim()) {
      mensaje.textContent = "El nombre de la tarea no puede estar vacío.";
      return;
    }

    gestor.editarTarea(id, nuevoNombre.trim());
    mensaje.textContent = "Tarea editada correctamente.";
  }

  if (accion === "eliminar" && tarea) {
    const confirmar = window.confirm(`¿Deseas eliminar la tarea "${tarea.nombre}"?`);
    if (!confirmar) return;

    gestor.eliminarTarea(id);
    mensaje.textContent = "Tarea eliminada.";
  }

  if (accion === "estado") {
    gestor.cambiarEstado(id);
    mensaje.textContent = "Estado de la tarea actualizado.";
  }
});

limpiarCompletadas.addEventListener("click", () => {
  gestor.limpiarCompletadas();
  mensaje.textContent = "Se eliminaron las tareas completadas.";
});

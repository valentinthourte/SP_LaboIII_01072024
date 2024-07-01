import { Crypto } from "../model/crypto.js";
import { StringHelper } from "../helpers/StringHelper.js";
import {mostrarSpinner, esconderSpinner } from "./spinner.js"
import { obtenerTodos, obtenerUno, editarUno, eliminarUno, crearUno, eliminarTodos } from "./api.js";

document.addEventListener("DOMContentLoaded", onInit);

const items = []

async function onInit() {
    eventListeners();
    await cargarItems();

    actualizarTabla();
}


function eventListeners() {
    document.getElementById("botonBorrarTodo").addEventListener("click", borrarTodo);
    document.addEventListener("click", (e) => (manejarClick(e)));
    const formulario = document.getElementById("formCryptos");
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        if (formEsValido(formulario)) {
            let cryptoId = formulario.querySelector("#id").value;
            const fecha = formulario.querySelector("#fechaCreacion").value;
    
    
            const selectConsenso = document.getElementById("tipoConsenso");
            const selectAlgoritmo = document.getElementById("algoritmo");
    
            const operacion = obtenerOperacion(e.submitter, cryptoId);
    
            const model = new Crypto(
                StringHelper.stringHasValue(cryptoId) ? cryptoId : null,
                formulario.querySelector("#nombre").value,
                formulario.querySelector("#simbolo").value,
                StringHelper.stringHasValue(cryptoId) ? fecha : obtenerFecha(),
                parseFloat(formulario.querySelector("#precioActual").value),
                selectConsenso.options[selectConsenso.selectedIndex].text,
                formulario.querySelector("#cantidadCirculacion").value,
                selectAlgoritmo.options[selectAlgoritmo.selectedIndex].text,
                formulario.querySelector("#sitio").value,
            );
    
            switch(operacion) {
                case "editar": 
                    const indice = obtenerIndicePorId(items, cryptoId);
                    items[indice] = model;
                    await editarUnCrypto(cryptoId, model);
                    break;
                case "eliminar":
                    if (confirm("Seguro que quiere eliminar?")) {
                        quitarElementoPorId(items, cryptoId);
                        await eliminarUnCrypto(cryptoId);
                    }
                    break;
                case "crear":
                default:
                    const crypto = await crearUnCrypto(model);
                    model.id = crypto.id;
                    items.push(model);
                    break;
            }
            limpiarFormulario();
            actualizarTabla();
        }
    })

    const filtroAlgoritmo = document.getElementById("filtroAlgoritmo");
    filtroAlgoritmo.addEventListener("change", filtrarTabla)
}


function filtrarTabla() {
    const filtroAlgoritmo = document.getElementById("filtroAlgoritmo");
    let filtroSeleccionado = filtroAlgoritmo.options[filtroAlgoritmo.selectedIndex].text;
    const registrosFiltrados = StringHelper.stringHasValue(filtroSeleccionado) ? items.filter(item => item.algoritmo === filtroSeleccionado) : items;

    actualizarTabla(registrosFiltrados);
    actualizarPromedio(StringHelper.stringHasValue(filtroSeleccionado), registrosFiltrados);
}

function actualizarPromedio(deboCalcular, registros) {
    const promedio = deboCalcular ? calcularPromedioParaRegistros(registros) : "N/A";

    document.getElementById("textoPromedio").value = promedio;
}

function calcularPromedioParaRegistros(registros) {
    return registros.length > 0 ? registros.reduce((acumulador, elemento) => acumulador + elemento.precioActual, 0) / registros.length : 0;
}

function obtenerFecha() {
    const options = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date().toLocaleString("es-AR", options);
}

async function cargarItems() {
    const objetos = await leerTodos();

    objetos.forEach(obj => {
        const model = new Crypto(
            obj.id, 
            obj.nombre, 
            obj.simbolo, 
            obj.fechaCreacion, 
            obj.precioActual, 
            obj.consenso, 
            obj.cantidadCirculacion, 
            obj.algoritmo, 
            obj.sitioWeb
        )
        items.push(model);
    });
}


function manejarClick(evento) {
    if (evento.target.matches("td")) { 
        let id = evento.target.parentNode.dataset.id; 
        let crypto = obtenerElementoPorId(items, id);
        cargarFormulario(
            crypto.id,
            crypto.fechaCreacion,
            crypto.nombre,
            crypto.simbolo,
            crypto.precioActual,
            crypto.consenso,
            crypto.cantidadCirculacion,
            crypto.algoritmo,
            crypto.sitio
        )
    }
}

function cargarFormulario(...datos) {
    const selectConsenso = document.getElementById("tipoConsenso");
    const selectAlgoritmo = document.getElementById("algoritmo");
    const formulario = document.getElementById("formCryptos");
    formulario.querySelector("#id").value = datos[0];
    formulario.querySelector("#nombre").value = datos[2];
    formulario.querySelector("#simbolo").value = datos[3];
    formulario.querySelector("#fechaCreacion").value = datos[1];
    formulario.querySelector("#precioActual").value = datos[4];
    selectConsenso.selectedIndex = indiceOpcionPorTexto(selectConsenso, datos[5]) >= 0  ? indiceOpcionPorTexto(selectConsenso, datos[5]) : 0;
    selectAlgoritmo.selectedIndex = indiceOpcionPorTexto(selectAlgoritmo, datos[7]) >= 0 ? indiceOpcionPorTexto(selectAlgoritmo, datos[7]) : 0;
    formulario.querySelector("#cantidadCirculacion").value = datos[6];
    formulario.querySelector("#sitio").value = datos[8];
}

function indiceOpcionPorTexto(select, texto) {
    const options = select.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].text === texto) {
            return i 
        }
    }
    return -1; 
}

function formEsValido(formulario) {
    let precioActual = formulario.querySelector("#precioActual").value;
    let cantidadCirculacion = formulario.querySelector("#cantidadCirculacion").value;
    let valido = StringHelper.stringHasValue(formulario.querySelector("#nombre").value) &&
    StringHelper.stringHasValue(formulario.querySelector("#simbolo").value) &&
    precioActual != "" && parseFloat(precioActual) > 0 &&
    cantidadCirculacion > 0 &&
    StringHelper.stringHasValue(formulario.querySelector("#sitio").value);
    if (!valido) {
        alert("Los valores ingresados no son validos. Los números deben ser positivos y los textos no vacíos")
    }
    return valido;
}
async function guardarCryptos() {
    await (objectToJson(items));
}

function limpiarFormulario() {
    const selectConsenso = document.getElementById("tipoConsenso");
    const selectFiltroAlgoritmo = document.getElementById("filtroAlgoritmo");
    const selectAlgoritmo = document.getElementById("algoritmo");

    const formulario = document.getElementById("formCryptos");
    formulario.querySelector("#id").value = "";
    formulario.querySelector("#nombre").value = "";
    formulario.querySelector("#simbolo").value = "";
    formulario.querySelector("#fechaCreacion").value = null;
    formulario.querySelector("#precioActual").value = "";
    selectConsenso.selectedIndex = 0;
    selectAlgoritmo.selectedIndex = 0;
    selectFiltroAlgoritmo.selectedIndex = 0;
    document.getElementById("textoPromedio").value = "N/A";
    formulario.querySelector("#cantidadCirculacion").value = "";
    formulario.querySelector("#sitio").value = "";
}

function obtenerOperacion(submitter, id) {
    if (submitter.className.includes("eliminar")) {
        return "eliminar"
    }
    else if (StringHelper.stringHasValue(id)) {
        return "editar"
    }
    else {
        return "crear";
    }
}



function quitarElementoPorId(lista, id) {
    const index = obtenerIndicePorId(lista, id)
    lista.splice(index, 1);
}

function obtenerIndicePorId(lista, id) {
    return lista.findIndex(obj => obj.id.toString() === id);
}

function obtenerElementoPorId(lista, id) {
    let indice = obtenerIndicePorId(lista, id);
    return lista[indice];
}

async function borrarTodo() {
    if (confirm("Seguro que quiere eliminar todos los registros de la tabla?")) {
        await eliminarTodosLosCryptos();
        items.length = 0;
        actualizarTabla();
    }
}

function actualizarTabla(elementos = items) {
    const tabla = document.getElementById("table-items");
    let tbody = tabla.getElementsByTagName('tbody')[0];
  
    tbody.innerHTML = '';    
    const celdas = ["id","nombre","simbolo","fechaCreacion","precioActual","consenso","cantidadCirculacion","algoritmo", "sitio"];

    elementos.forEach((item) => {
        let nuevaFila = document.createElement("tr");

        celdas.forEach((celda) => {
            if (celda == "id") {
                nuevaFila.setAttribute("data-id", item[celda])
            }
            else {
                let nuevaCelda = document.createElement("td");
                nuevaCelda.textContent = item[celda];
                nuevaFila.appendChild(nuevaCelda);
            }
        });
        tbody.appendChild(nuevaFila);
    });
  }

  async function leerTodos() {
    mostrarSpinner();
    const resp = await obtenerTodos();
    esconderSpinner();
    return resp;
}

async function leerUno(id) {
    mostrarSpinner();
    const resp = await obtenerUno(id)
    esconderSpinner();
    return resp;
}

async function crearUnCrypto(model) {
    mostrarSpinner();
    const resp = await crearUno(model);
    esconderSpinner();
    return resp;
}

async function editarUnCrypto(id, model) {
    mostrarSpinner();
    const resp = await editarUno(id, model);
    esconderSpinner();
    return resp;
}

async function eliminarUnCrypto(id) {
    mostrarSpinner();
    const resp = await eliminarUno(id);
    esconderSpinner();
}

async function eliminarTodosLosCryptos(id) {
    mostrarSpinner();
    const resp = await eliminarTodos(id);
    esconderSpinner();
}
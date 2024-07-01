const ENDPOINT = "http://localhost:3000/monedas";

export function obtenerTodos() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          reject(new Error("ERR " + xhr.status + ": " + xhr.statusText));
        }
      }
    });

    xhr.open("GET", `${ENDPOINT}`);
    xhr.send();
  });
}


export function obtenerUno(id) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          reject(new Error("ERR " + xhr.status + ": " + xhr.statusText));
        }
      }
    });

    xhr.open("GET", `${ENDPOINT}/${id}`);
    xhr.send();
  });
}

export function crearUno(model) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          reject(new Error("ERR " + xhr.status + ": " + xhr.statusText));
        }
      }
    });

    xhr.open("POST", `${ENDPOINT}`);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(JSON.stringify(model));
  });
}

export function editarUno(id, model) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          reject(new Error("ERR " + xhr.status + ": " + xhr.statusText));
        }
      }
    });

    xhr.open("PUT", `${ENDPOINT}/${id}`);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(JSON.stringify(model));
  });
}

export function eliminarUno(id) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const data = xhr.responseText;
          resolve(data);
        } else {
          reject(new Error("ERR " + xhr.status + ": " + xhr.statusText));
        }
      }
    });

    xhr.open("DELETE", `${ENDPOINT}/${id}`);
    xhr.send();
  });
}

export function eliminarTodos() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const data = xhr.responseText;
          resolve(data);
        } else {
          reject(new Error("ERR " + xhr.status + ": " + xhr.statusText));
        }
      }
    });

    xhr.open("DELETE", `${ENDPOINT}`);
    xhr.send();
  });
}
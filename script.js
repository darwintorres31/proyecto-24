
// Elementos HTML
const lista = document.getElementById("listaHistorias");
const btnAgregar = document.getElementById("btnAgregar");
const archivo = document.getElementById("archivoHistoria");
const mensaje = document.getElementById("mensaje");

const visor = document.getElementById("visor");
const imagenHistoria = document.getElementById("imagenHistoria");

const contador = document.getElementById("contador");
const cerrar = document.getElementById("cerrar");
const anterior = document.getElementById("anterior");
const siguiente = document.getElementById("siguiente");


// Variables
let historias = JSON.parse(localStorage.getItem("misHistorias")) || [];

let indice = 0;
let inicioX = 0;

// Duración de 24 horas
const DURACION = 24 * 60 * 60 * 1000;

// Para probar 30 segundos:
// const DURACION = 30 * 1000;


// Guardar historias
function guardar() {
    localStorage.setItem("misHistorias", JSON.stringify(historias));
}


// Eliminar historias vencidas
function limpiarHistorias() {

    const cantidad = historias.length;

    historias = historias.filter(function(historia) {
        return historia.expiracion > Date.now();
    });

    if (historias.length !== cantidad) {

        guardar();
        mostrarHistorias();

        if (!visor.hidden) cerrarVisor();

    }

}


// Mostrar historias
function mostrarHistorias() {

    lista.innerHTML = "";
    lista.appendChild(btnAgregar);

    historias.forEach(function(historia, i) {

        const boton = document.createElement("button");

        boton.className = "historia";

        boton.innerHTML = `
            <span class="marco-historia">
                <img src="${historia.imagen}" alt="Historia">
            </span>
            <span class="nombre-historia">Mi historia ${i + 1}</span>
        `;

        boton.onclick = function() {
            indice = i;
            mostrarHistoria();
            visor.hidden = false;
        };

        lista.appendChild(boton);

    });

}


// Agregar imagen
btnAgregar.onclick = function() {
    archivo.click();
};


// Leer imagen seleccionada
archivo.onchange = function() {

    const file = archivo.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        mensaje.textContent = "Selecciona una imagen válida.";
        archivo.value = "";
        return;
    }

    const lector = new FileReader();

    lector.onload = function() {

        const imagen = new Image();

        imagen.onload = function() {

            // Limitar tamaño de imagen
            const escala = Math.min(
                1,
                1080 / imagen.width,
                1920 / imagen.height
            );

            const canvas = document.createElement("canvas");

            canvas.width = Math.round(imagen.width * escala);
            canvas.height = Math.round(imagen.height * escala);

            const contexto = canvas.getContext("2d");

            contexto.drawImage(
                imagen,
                0,
                0,
                canvas.width,
                canvas.height
            );

            // Convertir a Base64
            const nuevaHistoria = {
                imagen: canvas.toDataURL("image/jpeg", 0.75),
                expiracion: Date.now() + DURACION
            };

            // Guardar en localStorage
            try {

                historias.unshift(nuevaHistoria);

                guardar();

                mostrarHistorias();

                mensaje.textContent = "¡Historia agregada!";

            } catch (error) {

                historias.shift();

                mensaje.textContent = "No hay espacio para guardar la imagen.";

            }

            archivo.value = "";

        };

        imagen.src = lector.result;

    };

    lector.readAsDataURL(file);

};


// Mostrar historia
function mostrarHistoria() {

    limpiarHistorias();

    if (indice < 0 || indice >= historias.length) {
        cerrarVisor();
        return;
    }

    imagenHistoria.src = historias[indice].imagen;

    contador.textContent =
        `Historia ${indice + 1} de ${historias.length}`;

}


// Navegar entre historias
anterior.onclick = function() {
    indice--;
    mostrarHistoria();
};

siguiente.onclick = function() {
    indice++;
    mostrarHistoria();
};


// Cerrar visor
function cerrarVisor() {

    visor.hidden = true;
    imagenHistoria.src = "";

}

cerrar.onclick = cerrarVisor;


// Deslizar historias en celular
imagenHistoria.ontouchstart = function(evento) {
    inicioX = evento.changedTouches[0].clientX;
};

imagenHistoria.ontouchend = function(evento) {

    const finalX = evento.changedTouches[0].clientX;

    if (Math.abs(finalX - inicioX) > 50) {

        if (finalX < inicioX) {
            siguiente.click();
        } else {
            anterior.click();
        }

    }

};


// Revisar historias cada 10 segundos
setInterval(limpiarHistorias, 10000);


// Revisar al volver a la página
window.addEventListener("focus", limpiarHistorias);


// Iniciar aplicación
limpiarHistorias();
mostrarHistorias();

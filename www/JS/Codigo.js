const ruteo = document.querySelector("#ruteo");
const URL_Base = "https://movielist.develotion.com"
const menu = document.querySelector("#menu"); Inicializar();
// #region Inicializacion de la app y navegacion
function Inicializar() {
    OcultarPantallas();
    listarTodosPaises();
    AgregarEventos();
}

function OcultarPantallas() {
    let paginas = document.querySelectorAll(".ion-page");
    for (let i = 1; i < paginas.length; i++) {
        paginas[i].style.display = "none"
    }
}

function AgregarEventos() {
    ruteo.addEventListener("ionRouteWillChange", navegar);
    document.querySelector("#BtnRegistrar").addEventListener("click", Registro);
}

async function listarTodosPaises() {
    try {
        const response = await fetch(URL_Base + '/paises', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) {
            mostrarMensaje("Error al cargar los países");
            return;
        }

        const select = document.querySelector("#SltPais");
        select.innerHTML = "";

        data.paises.forEach(pais => {
            const option = document.createElement("ion-select-option");
            option.value = pais.id;
            option.textContent = pais.nombre;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando países:", error);
    }
}

function navegar(evt) {
    let paginaTo = evt.detail.to;
    OcultarPantallas();
    switch (paginaTo) {
        case "/":
            document.querySelector("#page-Home").style.display = "block";
            break;
        case "/login": document.querySelector("#page-Login").style.display = "block";
            break;
        case "/Registro": document.querySelector("#page-Registro").style.display = "block";
            break;
        default: document.querySelector("#page-Login").style.display = "block";
            break;
    }

}

function CerrarMenu() {
    menu.close();
}
//#endregion

// #region Registro

async function Registro() {
    try {
        const usuario = document.querySelector("#InpUsuario").value;
        const pwd = document.querySelector("#InpPWD").value;
        const Idpais = document.querySelector("#SltPais").value;

        if(!ValidarRegistro(usuario,pwd,Idpais)){
            return;
        }
        const response = await fetch(URL_Base + '/usuarios', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuario,
                password: pwd,
                idPais: Idpais
            })
        });

        const data = await response.json();
        if (!response.ok) {
            mostrarMensaje(data.mensaje || "Error en el registro");
            return;
        }
        mostrarMensaje("Registro exitoso!");
        localStorage.setItem("token", data.token);
        console.log(localStorage.getItem("token"))

        console.log(data);
    } catch (error) {
        console.error("Error en el registro", error)
    }
}
//#endregion

function ValidarRegistro(usuario, password, idPais) {

    if (!usuario || usuario.trim() === "") {
        mostrarMensaje("Debe ingresar un usuario");
        return false;
    }

    if (!password || password.trim() === "") {
        mostrarMensaje("Debe ingresar una contraseña");
        return false;
    }

    if (password.length < 4) {
        mostrarMensaje("La contraseña debe tener al menos 4 caracteres");
        return false;
    }

    if (!idPais) {
        mostrarMensaje("Debe seleccionar un país");
        return false;
    }

    return true;
}
function mostrarMensaje(mensaje) {
    let toast = document.createElement("ion-toast");
    toast.duration = 1500
    toast.message = mensaje
    toast.position = "bottom";
    document.body.append(toast);
    toast.present();
}
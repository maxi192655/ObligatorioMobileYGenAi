let token = "";
const ruteo = document.querySelector("#ruteo");
const URL_Base = "https://movielist.develotion.com"
const menu = document.querySelector("#menu");
Inicializar();
// #region Inicializacion de la app y navegacion
function Inicializar() {

    token = localStorage.getItem("token");
    console.log("Token al iniciar:", token);
    OcultarPantallas();
    listarTodosPaises();
    ListarCategoriasPeliculas();
    AgregarEventos();

    if (token) {
        MostrarMenuLogueado();
        window.location.hash = "/";
    } else {
        mostrarMenuNoLogeado();
        window.location.hash = "/Login";
    }
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
    document.querySelector("#BtnLogin").addEventListener("click", login);
}

function VerificarSesion() {
    if (!token || token === "null") {
        mostrarMensaje("Debe iniciar sesión");
        window.location.hash = "/Login";
        return false;
    }
    return true;
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
        mostrarMensaje("Error cargando países:", error);
    }
}


async function ListarCategoriasPeliculas() {
    try {
        if (!VerificarSesion()) {
            return;
        }

        const response = await fetch(URL_Base + '/categorias', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log(response.status);
        console.log(data);
        if (!response.ok) {
            mostrarMensaje(data.error, "Error al cargar las categorias de peliculas");
            return;
        }

        const slt = document.querySelector("#SltCategorias");
        slt.innerHTML = "";

        data.categorias.forEach(categoria => {
            const opt = document.createElement("ion-select-option");
            opt.value = categoria.id;
            opt.textContent = categoria.nombre
            slt.appendChild(opt);
        });

    } catch (error) {
        mostrarMensaje("Error cargando categorias", error);
    }
}

function navegar(evt) {
    console.log(evt.detail.to);
    let paginaTo = evt.detail.to;
    OcultarPantallas();
    switch (paginaTo) {
        case "/":
            document.querySelector("#page-Home").style.display = "block";
            break;
        case "/Login": document.querySelector("#page-Login").style.display = "block";
            break;
        case "/Registro": document.querySelector("#page-Registro").style.display = "block";
            break;
        case "/AgregarUnaPelícula": document.querySelector("#page-AltaPelicula").style.display = "block";
            break;
        default: document.querySelector("#page-Login").style.display = "block";
            break;
    }

}

function MostrarMenuLogueado() {
    document.querySelector("#BtnMenuNavLogOut").style.display = "block";
    document.querySelector("#BtnMenuNavAltaPelicula").style.display = "block";
    document.querySelector("#BtnMenuNavLogin").style.display = "none";
    document.querySelector("#BtnMenuNavRegistro").style.display = "none";
}
function mostrarMenuNoLogeado() {
    document.querySelector("#BtnMenuNavLogin").style.display = "block";
    document.querySelector("#BtnMenuNavRegistro").style.display = "block";
    document.querySelector("#BtnMenuNavLogOut").style.display = "none";
    document.querySelector("#BtnMenuNavAltaPelicula").style.display = "None";
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

        if (!ValidarRegistro(usuario, pwd, Idpais)) {
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
        // localStorage.setItem("token", data.token);
        // console.log(localStorage.getItem("token"))

        // console.log(data);
    } catch (error) {
        console.error("Error en el registro", error)
    }
}


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
//#endregion


// #region Login

async function login() {
    try {
        const usuarioLog = document.querySelector("#InpUsuarioLogin").value;
        const pwdLog = document.querySelector("#InpPWDLogin").value;
        if (!ValidarLogin(usuarioLog, pwdLog)) {
            return;
        }
        const response = await fetch(URL_Base + '/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuarioLog,
                password: pwdLog
            })
        });

        const data = await response.json();
        if (!response.ok) {
            mostrarMensaje(data.mensaje || "Error en el login");
            return;
        }

        localStorage.setItem("token", data.token);
        token = data.token;
        console.log(data.json);
        document.querySelector("#InpUsuarioLogin").value = "";
        document.querySelector("#InpPWDLogin").value = "";
        MostrarMenuLogueado();
        mostrarMensaje("Bienvenido!");

        window.location.hash = "/";
    } catch (error) {
        console.log("Error en el login", error);
        mostrarMensaje("Error de conexion");
    }
}

function ValidarLogin(usuario, password) {
    if (!usuario || usuario.trim() === "") {
        mostrarMensaje("Debe ingresar un usuario");
        return false;
    }
    if (!password || password.trim() === "") {
        mostrarMensaje("Debe ingresar una contraseña");
        return false;
    }
    return true;
}

function Logout() {
    localStorage.removeItem("token");
    token = null;
    mostrarMenuNoLogeado();
    // window.location.hash = "/Login";
    mostrarMensaje("Session expirada.");
}

//#endregion

function mostrarMensaje(mensaje) {
    let toast = document.createElement("ion-toast");
    toast.duration = 1500
    toast.message = mensaje
    toast.position = "bottom";
    document.body.append(toast);
    toast.present();
}
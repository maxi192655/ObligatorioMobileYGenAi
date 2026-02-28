let token = "";
const ruteo = document.querySelector("#ruteo");
const URL_Base = "https://movielist.develotion.com"
const menu = document.querySelector("#menu");
let latitud;
let longitud;
let map;
let Peliculas = [];

// window.addEventListener("load", Inicializar);
Inicializar();
// #region Inicializacion de la app y navegacion
function Inicializar() {

    token = localStorage.getItem("token");
    // console.log(token)
    if (token != null && token !== "") {
        setTimeout(() => {
            ruteo.push("/");

        }, 60);
        //Usuario logeado
        MostrarMenuLogueado();
    } else {
        //Usuario No Logueado
        mostrarMenuNoLogeado();
        setTimeout(() => {
            ruteo.push("/Login");

        }, 60);
    }

    OcultarPantallas();
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
    document.querySelector("#BtnLogin").addEventListener("click", login);
    document.querySelector("#BtnAltaPelicula").addEventListener("click", AgregarPeliculas);
}

function VerificarSesion() {
    if (!token || token === "null") {
        mostrarMensaje("Debe iniciar sesión");
        ruteo.push("/Login");
        return false;
    }
    return true;
}
//#endregion
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

//#region Peliculas
async function ListarCategoriasPeliculas() {
    try {
        if (!VerificarSesion()) return;

        const response = await fetch(URL_Base + '/categorias', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            mostrarMensaje("Sesión expirada. Inicie sesión nuevamente.");
            Logout();
            return;
        }

        const data = await response.json();
        // console.log(response.status);
        // console.log(data);
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

async function AgregarPeliculas() {
    try {
        let idCat = document.querySelector("#SltCategorias").value;
        let pelicula = document.querySelector("#InpPeliculaAgregar").value;
        let fecha = document.querySelector("#InpFechaPelAgregar").value;
        let inpComentario = document.querySelector("#InpComentario").value;
        if (!ValidarAgregarPelicula(idCat, pelicula, fecha, inpComentario)) { return; }


        const responseAI = await fetch(URL_Base + '/genai', {
            method: "POST",
            body: JSON.stringify({
                prompt: inpComentario
            })
        });
        const dataIA = await responseAI.json();
        if (!responseAI.ok) {
            mostrarMensaje(dataIA.error || "Error al procesar el comentario" || dataIA.mensaje);
        }

        if (dataIA.sentiment === 'Negativo') {
            mostrarMensaje("No se puede registrar una pelicula con comentario negatio.");
            return;
        }
        // console.log(dataIA);
        const response = await fetch(URL_Base + '/peliculas', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                idCategoria: idCat,
                nombre: pelicula.trim(),
                fechaEstreno: fecha
            })
        });
        if (response.status === 401) {
            mostrarMensaje("Sesión expirada. Inicie sesión nuevamente.");
            Logout();
            return;
        }
        const data = await response.json();
        if (!response.ok) {
            mostrarMensaje(data.error || "Error al intentar agregar la pelicula.")
        } else {
            mostrarMensaje(data.mensaje, "Pelicula agregada correctamente :)")
        }
        console.log(data);
        idCat.value = null;
        inpComentario.value = null;
        pelicula.value = null;
        fecha.value = null;
    } catch (error) {
        mostrarMensaje("Error cargando pelicula" || error);
    }
}

function ValidarAgregarPelicula(idCat, pelicula, fecha, inpComentario) {

    if (!idCat) {
        mostrarMensaje("Debe seleccionar una categoría");
        return false;
    }

    if (!pelicula || pelicula.trim() === "") {
        mostrarMensaje("Debe ingresar el nombre de la película");
        return false;
    }

    if (!fecha) {
        mostrarMensaje("Debe ingresar una fecha");
        return false;
    }
    if (!inpComentario || inpComentario.trim() === "") {
        mostrarMensaje("Debe ingresar un comentario");
        return false;
    }

    return true;
}

async function CategoriasPeliculas() {
    try {
        if (!VerificarSesion()) return;

        const response = await fetch(URL_Base + '/categorias', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            mostrarMensaje("Sesión expirada. Inicie sesión nuevamente.");
            Logout();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            mostrarMensaje(data.error, "Error al cargar las categorias de peliculas");
            return;
        }

        return data.categorias;
    } catch (error) {

    }
}

async function ListarPeliculas() {
    try {
        if (!VerificarSesion()) return;

        let CatPeliculas = await CategoriasPeliculas() || [];
        const response = await fetch(URL_Base + '/peliculas', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            mostrarMensaje("Sesión expirada. Inicie sesión nuevamente.");
            Logout();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            mostrarMensaje(data.error || "Error al cargar la lista de peliculas");
            return;
        }

        Peliculas = data.peliculas;

        const sltFiltro = document.querySelector("#SltFiltroFecha").value;
        let peliculasAMostrar = Peliculas;

        if (sltFiltro && sltFiltro !== "todas") {
            const hoy = new Date();

            peliculasAMostrar = Peliculas.filter(p => {
                const fechaPelicula = new Date(p.fechaEstreno);

                if (sltFiltro === "semana") {
                    const limite = new Date();
                    limite.setDate(hoy.getDate() - 7);
                    return fechaPelicula >= limite;
                }

                if (sltFiltro === "mes") {
                    const limite = new Date();
                    limite.setMonth(hoy.getMonth() - 1);
                    return fechaPelicula >= limite;
                }
                return true;
            });

        }

        // console.log(peliculasAMostrar);
        // console.log(sltFiltro);
        let cards = `
                    <ion-grid>
                        <ion-row>
                    `;
        peliculasAMostrar.forEach(pelicula => {
            let IdCat = pelicula.idCategoria
            let FindCat = CatPeliculas.find(c => c.id == IdCat)
            let CatNombre = "";
            let CatEmoji = "";
            if (FindCat) {
                CatNombre = FindCat.nombre;
                CatEmoji = FindCat.emoji;
            }

            cards += `
    <ion-card>
        <ion-card-header>

            <ion-item lines="none">
                <ion-label>
                    <ion-card-title>${pelicula.nombre}</ion-card-title>
                </ion-label>

                <ion-button 
                    fill="clear" 
                    color="danger"
                    slot="end"
                    onclick="EliminarPelicula(${pelicula.id})">
                    <ion-icon name="trash-outline"></ion-icon>
                </ion-button>
            </ion-item>

        </ion-card-header>

        <ion-card-content>
            <p>Categoria: ${CatNombre + ' - ' + CatEmoji}</p>
            <p>Fecha de estreno: ${pelicula.fechaEstreno}</p>
        </ion-card-content>
    </ion-card>
`;
        })

 cards += `
        </ion-row>
    </ion-grid>
`;
        document.querySelector("#ListaPeliculas").innerHTML = cards;
        // container.innerHTML = '';

    } catch (error) {
        mostrarMensaje("Error cargando lista de pelicula" || error);
        // console.log(error)
    }
}

async function EliminarPelicula(id) {
    try {
        if (!VerificarSesion()) return;
        const response = await fetch(URL_Base + '/peliculas/' + id, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.status === 401) {
            mostrarMensaje("Sesión expirada. Inicie sesión nuevamente.");
            Logout();
            return;
        }
        // console.log(data)
        if (!response.ok) {
            mostrarMensaje(data.error || "Error intentar eliminar una pelicula");
            return;
        }
        mostrarMensaje(data.mensaje);
        ListarPeliculas();
    } catch (error) {
        mostrarMensaje("Error de conexion" || error);
    }
}
//#endregion


//#region navegar
function navegar(evt) {
    // console.log(evt.detail.to);
    let paginaTo = evt.detail.to;
    OcultarPantallas();
    switch (paginaTo) {
        case "/":
            document.querySelector("#page-Home").style.display = "block";
            break;
        case "/Login":
            document.querySelector("#page-Login").style.display = "block";
            break;
        case "/Registro":
            document.querySelector("#page-Registro").style.display = "block";
            listarTodosPaises();
            break;
        case "/AgregarUnaPelícula":
            document.querySelector("#page-AltaPelicula").style.display = "block";
            ListarCategoriasPeliculas();
            break;
        case "/ListarPeliculas":
            document.querySelector("#page-ListarPeliculas").style.display = "block";
            // ListarPeliculas();
            setTimeout(() => {
                ListarPeliculas();

                const select = document.querySelector("#SltFiltroFecha");

                select.addEventListener("ionChange", () => {
                    ListarPeliculas();
                });

            }, 50);
            break;
        case "/MapaUsuarios":
            // MostrarMapaUsuarios();
            document.querySelector("#page-Mapa").style.display = "block";
            getLocation();
            break;
        default: document.querySelector("#page-Login").style.display = "block";
            break;
    }

}
//#endregion
//#region Mostrar menus segun sesion
function MostrarMenuLogueado() {
    document.querySelector("#BtnMenuNavLogOut").style.display = "block";
    document.querySelector("#BtnMenuNavAltaPelicula").style.display = "block";
    document.querySelector("#BtnMenuNavListarPelicula").style.display = "block";
    document.querySelector("#BtnMenuNavMapaUsuarios").style.display = "block";
    document.querySelector("#BtnMenuNavLogin").style.display = "none";
    document.querySelector("#BtnMenuNavRegistro").style.display = "none";
}
function mostrarMenuNoLogeado() {
    document.querySelector("#BtnMenuNavLogin").style.display = "block";
    document.querySelector("#BtnMenuNavRegistro").style.display = "block";
    document.querySelector("#BtnMenuNavLogOut").style.display = "none";
    document.querySelector("#BtnMenuNavAltaPelicula").style.display = "none";
    document.querySelector("#BtnMenuNavListarPelicula").style.display = "none";
    document.querySelector("#BtnMenuNavMapaUsuarios").style.display = "none";
}
function CerrarMenu() {
    menu.close();
}
//#endregion
//#endregion

// #region Registro

async function Registro() {
    try {
        const usuario = document.querySelector("#InpUsuario").value;
        const pwd = document.querySelector("#InpPWD").value;
        const Idpais = document.querySelector("#SltPais").value;

        if (!ValidarRegistro(usuario, pwd, Idpais)) {
            return;
        } else {
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
        }
        const data = await response.json();
        if (!response.ok) {
            mostrarMensaje(data.mensaje || "Error en el registro");
            return;
        }
        ruteo.push("/")

        mostrarMensaje("Registro exitoso!");

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
        } else {
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
            document.querySelector("#InpUsuarioLogin").value = "";
            document.querySelector("#InpPWDLogin").value = "";
            MostrarMenuLogueado();
            mostrarMensaje("Bienvenido!");

            ruteo.push("/");
        }
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
    localStorage.clear();
    localStorage.removeItem("token");
    token = null;
    mostrarMenuNoLogeado();
    ruteo.push("/")
    mostrarMensaje("Session expirada.");
}

//#endregion




//#region Mapa
function getLocation() {
    if (!navigator.geolocation) {
        mostrarMensaje("La geolocalización no está soportada en este navegador");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        guardarUbicacion,
        mostrarError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


function MostrarMapaUsuarios() {
    if (typeof latitud === "number" && typeof longitud === "number") {
        if (map) {
            map.remove();
        }
        map = L.map('map').setView([latitud, longitud], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        var marker = L.marker([latitud, longitud]).addTo(map);
        marker.bindPopup("<b>Hola!</b><br>Usted es el usuarioPrincipaL!").openPopup();
        var marker = L.marker([-34.894517716076805, -56.15253906600995]).addTo(map);
        marker.bindPopup("<b>Hola!</b><br>Soy el punto 1").openPopup();
        var marker = L.marker([-34.8847165448899, -56.16800846177113]).addTo(map);
        marker.bindPopup("<b>Hola!</b><br>Soy el punto 2").openPopup();
        var marker = L.marker([-34.90678678949317, -56.17306564853651]).addTo(map);
        marker.bindPopup("<b>Hola!</b><br>Soy el punto 3").openPopup();
    } else {
        mostrarMensaje("Coordenadas incorrectas")
    }
}

function guardarUbicacion(position) {
    latitud = position.coords.latitude;
    longitud = position.coords.longitude;

    console.log("Lat:", latitud);
    console.log("Lng:", longitud);

    MostrarMapaUsuarios(); // ← ESTA LINEA FALTABA

}

// function mostrarError(error) {
//     mostrarMensaje(("Error:", error.message));
// }
function mostrarError(error) {
    console.log("Código error:", error.code);
    console.log("Mensaje:", error.message);
    mostrarMensaje("Error geolocalización: " + error.message);
}


function onMapClick(e) {
    alert(`Has hecho click sobre Latitud: ${e.latlng.lat} Longitud: ${e.latlng.lng}`);
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
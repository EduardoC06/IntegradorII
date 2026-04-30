// 1. (El cliente de Supabase ahora se inicializa en supabase-config.js como window.clienteSupabase)

// 2. Sistema de Notificaciones
window.showToast = function (message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  toast.offsetHeight; // Forzar reflow para animación
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
};

// 3. Lógica para el cambio de pestañas en la interfaz
function switchTab(tab) {
  const loginSec = document.getElementById("section-login");
  const regSec = document.getElementById("section-register");
  const verifySec = document.getElementById("section-verify");
  const loginTab = document.getElementById("tab-login");
  const regTab = document.getElementById("tab-register");

  if (verifySec) verifySec.classList.remove("active");

  if (tab === "login") {
    loginSec.classList.add("active");
    regSec.classList.remove("active");
    loginTab.classList.add("active");
    regTab.classList.remove("active");
  } else if (tab === "register") {
    regSec.classList.add("active");
    loginSec.classList.remove("active");
    regTab.classList.add("active");
    loginTab.classList.remove("active");
  }
}

// 4. Manejo del Inicio de Sesión (Huésped Frecuente)
const loginForm = document.querySelector("#section-login form");
loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const submitBtn = loginForm.querySelector(".btn-submit");

  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Ingresando...";
  submitBtn.disabled = true; // Desactivamos el botón para evitar doble clic

  // Usamos clienteSupabase
  const { data, error } = await clienteSupabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    window.showToast("Error: " + error.message, "error");
    // CORRECCIÓN: Reactivar el botón si hay error de credenciales
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  } else {
    // 1. Buscamos el rol en la tabla pública de perfiles
    const { data: perfil, error: perfilError } = await clienteSupabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .maybeSingle();

    if (perfilError) {
      console.error("Error al obtener perfil:", perfilError);
      window.showToast("Error al obtener perfil", "error");
      // CORRECCIÓN: Reactivar el botón si la base de datos falla
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    // Si perfil es null usamos "huesped" por defecto
    const rol = perfil ? perfil.rol : "huesped";

    // NOTA: Recuerda quitar o comentar esta línea en producción
    alert("Rol obtenido tras el login: " + rol);

    // 2. Redirección según el rol
    if (rol === "admin" || rol === "recepcionista") {
      window.location.href = "./admin/Panel.html";
    } else {
      window.location.href = "panelcliente.html";
    }
  }
});
// 5. Manejo del Nuevo Registro
const registerForm = document.getElementById("register-form");
registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const submitBtn = registerForm.querySelector(".btn-submit");

  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Procesando...";
  submitBtn.disabled = true;

  // Usamos clienteSupabase
  const { data, error } = await clienteSupabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { full_name: name }, // Solo enviamos el nombre, la DB pondrá el rol
    },
  });

  if (error) {
    window.showToast("Error: " + error.message, "error");
  } else {
    window.showToast("Registro exitoso. Bienvenido a Hotel El Cielo.");
    window.location.href = "panelcliente.html"; // Por defecto todos van aquí
  }
});

// 6. Comprobar sesión activa al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  // Usamos clienteSupabase
  const {
    data: { session },
  } = await window.clienteSupabase.auth.getSession();

  if (session) {
    console.log("Huésped ya autenticado:", session.user.email);

    // Verificamos el rol antes de redirigir automáticamente
    const rol = await window.getUserRole();
    console.log("Rol detectado al cargar página:", rol);

    if (rol === "admin" || rol === "recepcionista") {
      window.location.href = "./admin/Panel.html";
    } else {
      const redirectUrl =
        sessionStorage.getItem("redirectAfterLogin") || "panelcliente.html";
      window.location.href = redirectUrl;
    }
  }
});

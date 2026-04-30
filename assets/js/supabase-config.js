// Configuración global de Supabase
const SUPABASE_URL = "https://vqkkibvyxruckijcmowk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa2tpYnZ5eHJ1Y2tpamNtb3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzgxNDQsImV4cCI6MjA5MDkxNDE0NH0.GnXcnw1yv22e02u15TvuXyz8_wMx4akst-i_uwfBxvw";

window.clienteSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

// Función global para proteger rutas
window.requireAuth = async function () {
  const {
    data: { session },
  } = await window.clienteSupabase.auth.getSession();
  if (!session) {
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.href = "login.html";
    return false;
  }
  return session;
};

// Función global para verificar si hay sesión activa
window.checkSession = async function () {
  const {
    data: { session },
  } = await window.clienteSupabase.auth.getSession();
  return session;
};

// Obtener el rol del usuario desde la tabla perfiles
window.getUserRole = async function () {
  const session = await window.checkSession();
  if (!session) return null;
  const { data, error } = await window.clienteSupabase
    .from("perfiles")
    .select("rol")
    .eq("id", session.user.id)
    .maybeSingle(); // Cambiado de .single() a .maybeSingle() para evitar error 406
  if (error || !data) return "huesped";
  console.log("Rol de usuario detectado (global):", data.rol);
  return data.rol;
};

// Proteger rutas de administrador
window.requireAdmin = async function () {
  const session = await window.requireAuth();
  if (!session) return false;
  const rol = await window.getUserRole();
  if (rol !== "admin") {
    console.warn(
      "Acceso denegado. Se requiere rol 'admin', pero se detectó:",
      rol,
    );
    alert("Acceso denegado. Se requiere rol de administrador. Rol: " + rol);
    window.location.href = "../ElCielo.html";
    return false;
  }
  return session;
};

// =========================================
// SERVICIOS DE DATOS CENTRALIZADOS (CRUD)
// =========================================

// 1. Obtener sedes que estén marcadas como activas
window.obtenerSedesActivas = async function () {
  const { data: sedesActivas, error } = await window.clienteSupabase
    .from("sedes")
    .select("nombre") // Solo traemos los datos necesarios
    .eq("activa", true); // Filtramos donde activa sea 'true'

  if (error) {
    console.error("Error al obtener sedes:", error.message);
    return [];
  }

  console.log("Sedes disponibles para reserva:", sedesActivas);
  return sedesActivas;
};

// Inyectar estilos del dropdown una sola vez
const authStyleSheet = document.createElement("style");
authStyleSheet.textContent = `
  .auth-user-wrap {
    position: relative;
    display: inline-block;
  }
  .auth-user-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    border: none;
    color: inherit;
    padding: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition: background 0.25s;
  }
  .auth-user-btn:hover {
    background: rgba(255,255,255,0.15);
  }
  .navbar.scrolled .auth-user-btn {
    color: #fff;
  }

  .vert-profile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    border: none;
    color: #fff;
    padding: 0;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    transition: background 0.25s;
    position: relative;
  }
  .vert-profile-btn:hover {
    background: rgba(255,255,255,0.15);
  }

  .auth-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 200px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.18);
    padding: 0.5rem 0;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px) scale(0.97);
    transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
    z-index: 9999;
  }
  .auth-dropdown.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }

  .auth-dropdown-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }
  .auth-dropdown-name {
    font-weight: 700;
    font-size: 0.875rem;
    color: #1e293b;
  }
  .auth-dropdown-email {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .auth-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    color: #334155 !important;
    cursor: pointer;
    transition: background 0.2s;
    text-decoration: none;
    border: none;
    background: #fff !important;
    width: 100%;
    font-family: inherit;
  }
  .auth-dropdown-item:hover {
    background: #f8fafc;
  }
  .auth-dropdown-item .material-symbols-outlined {
    font-size: 20px;
    color: #64748b;
  }

  .auth-dropdown-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 0.25rem 0;
  }

  .auth-dropdown-item.logout {
    color: #ef4444;
  }
  .auth-dropdown-item.logout .material-symbols-outlined {
    color: #ef4444;
  }
  .auth-dropdown-item.logout:hover {
    background: #fef2f2;
  }
`;
document.head.appendChild(authStyleSheet);

// Actualizar el navbar según el estado de la sesión
window.updateNavbarAuth = async function () {
  const session = await window.checkSession();
  const userRole = session ? await window.getUserRole() : null;
  const isAdmin = userRole === "admin";
  const signinBtns = document.querySelectorAll(".btn-signin");

  signinBtns.forEach((btn) => {
    if (session) {
      const userName =
        session.user.user_metadata?.full_name ||
        session.user.email.split("@")[0];
      const userEmail = session.user.email;

      // Crear el wrapper con dropdown
      const wrap = document.createElement("div");
      wrap.className = "auth-user-wrap";

      // Botón principal
      const userBtn = document.createElement("button");
      userBtn.className = "auth-user-btn";
      userBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:24px;">account_circle</span>`;
      userBtn.title = userName;

      // Dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "auth-dropdown";
      dropdown.innerHTML = `
        <div class="auth-dropdown-header">
          <div class="auth-dropdown-name">${userName}</div>
          <div class="auth-dropdown-email">${userEmail}</div>
        </div>
        ${
          isAdmin
            ? `<a href="admin/Panel.html" class="auth-dropdown-item" style="color: #00478d !important; font-weight: 700;">
          <span class="material-symbols-outlined" style="color: #00478d;">admin_panel_settings</span>
          Panel Admin
        </a>`
            : ""
        }
        <a href="panelcliente.html" class="auth-dropdown-item">
          <span class="material-symbols-outlined">dashboard</span>
          Mi Panel
        </a>
        <a href="catalogo.html" class="auth-dropdown-item">
          <span class="material-symbols-outlined">hotel</span>
          Ver Habitaciones
        </a>
        <div class="auth-dropdown-divider"></div>
        <button class="auth-dropdown-item logout" id="btn-logout-${Math.random().toString(36).slice(2, 6)}">
          <span class="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>
      `;

      wrap.appendChild(userBtn);
      wrap.appendChild(dropdown);

      // Reemplazar el botón original
      btn.replaceWith(wrap);

      // Toggle dropdown al hacer clic
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains("open");
        document
          .querySelectorAll(".auth-dropdown.open")
          .forEach((d) => d.classList.remove("open"));
        if (!isOpen) {
          dropdown.classList.add("open");
        }
      });

      // Cerrar al hacer clic fuera
      document.addEventListener("click", () => {
        dropdown.classList.remove("open");
      });

      // Cerrar automáticamente si el mouse sale del menú por 3 segundos
      let hCloseTimer = null;
      wrap.addEventListener("mouseleave", () => {
        hCloseTimer = setTimeout(() => {
          dropdown.classList.remove("open");
        }, 2000); // Segundos de duracion
      });
      wrap.addEventListener("mouseenter", () => {
        if (hCloseTimer) clearTimeout(hCloseTimer);
      });

      // Botón de cerrar sesión
      dropdown.querySelector(".logout").addEventListener("click", async () => {
        await window.logoutUser();
      });
    } else {
      // Usuario no logeado: redirigir a login
      btn.textContent = "Iniciar Sesión";
      btn.onclick = () => (window.location.href = "login.html");
    }
  });

  // Inyectar icono de perfil en el navbar vertical (al lado izquierdo de Inicio)
  const vertLinks = document.querySelector(".vert-links");
  if (vertLinks) {
    // Eliminar perfil previo si existe
    const existing = vertLinks.querySelector(".vert-profile-btn");
    if (existing) existing.parentElement.remove();

    if (session) {
      const userName =
        session.user.user_metadata?.full_name ||
        session.user.email.split("@")[0];
      const userEmail = session.user.email;

      const vertWrap = document.createElement("div");
      vertWrap.className = "auth-user-wrap";
      vertWrap.style.display = "flex";
      vertWrap.style.justifyContent = "center";

      const vertBtn = document.createElement("button");
      vertBtn.className = "vert-profile-btn";
      vertBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:28px;">account_circle</span>`;
      vertBtn.title = userName;

      const vertDropdown = document.createElement("div");
      vertDropdown.className = "auth-dropdown";
      vertDropdown.style.bottom = "calc(100% + 8px)";
      vertDropdown.style.top = "auto";
      vertDropdown.style.left = "0";
      vertDropdown.innerHTML = `
        <div class="auth-dropdown-header">
          <div class="auth-dropdown-name">${userName}</div>
          <div class="auth-dropdown-email">${userEmail}</div>
        </div>
        ${
          isAdmin
            ? `<a href="admin/Panel.html" class="auth-dropdown-item" style="color: #00478d !important; font-weight: 700;">
          <span class="material-symbols-outlined" style="color: #00478d;">admin_panel_settings</span>
          Panel Admin
        </a>`
            : ""
        }
        <a href="panelcliente.html" class="auth-dropdown-item">
          <span class="material-symbols-outlined">dashboard</span>
          Mi Panel
        </a>
        <a href="catalogo.html" class="auth-dropdown-item">
          <span class="material-symbols-outlined">hotel</span>
          Ver Habitaciones
        </a>
        <div class="auth-dropdown-divider"></div>
        <button class="auth-dropdown-item logout">
          <span class="material-symbols-outlined">logout</span>
          Cerrar Sesión
        </button>
      `;

      vertWrap.appendChild(vertBtn);
      vertWrap.appendChild(vertDropdown);
      vertLinks.insertBefore(vertWrap, vertLinks.firstChild);

      vertBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        document
          .querySelectorAll(".auth-dropdown.open")
          .forEach((d) => d.classList.remove("open"));
        vertDropdown.classList.toggle("open");
      });

      document.addEventListener("click", () => {
        vertDropdown.classList.remove("open");
      });

      // Cerrar automáticamente si el mouse sale del menú por 3 segundos
      let vCloseTimer = null;
      vertWrap.addEventListener("mouseleave", () => {
        vCloseTimer = setTimeout(() => {
          vertDropdown.classList.remove("open");
        }, 3000);
      });
      vertWrap.addEventListener("mouseenter", () => {
        if (vCloseTimer) clearTimeout(vCloseTimer);
      });

      vertDropdown
        .querySelector(".logout")
        .addEventListener("click", async () => {
          await window.logoutUser();
        });
    }
  }
};

// Cerrar sesión global
window.logoutUser = async function () {
  await window.clienteSupabase.auth.signOut();
  window.location.href = "ElCielo.html";
};

// Ejecutar automáticamente al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  window.updateNavbarAuth();
});

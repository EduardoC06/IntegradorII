document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu-item');
  const headerTitle = document.querySelector('.header h1');

  const menuData = {
    dashboard: 'Dashboard',
    habitaciones: 'Gestión de Habitaciones',
    reservas: 'Reservas',
    clientes: 'Clientes',
    pagos: 'Pagos',
    resenas: 'Reseñas',
    configuracion: 'Configuración'
  };

  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      menuItems.forEach(mi => mi.classList.remove('active'));
      this.classList.add('active');
      
      const link = this.querySelector('a');
      const href = link.getAttribute('href').substring(1);
      
      if (menuData[href]) {
        headerTitle.textContent = menuData[href];
      }
    });
  });

  const logoutLink = document.querySelector('.logout a');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        e.preventDefault();
      }
    });
  }
});
/**
 * Hotel EL CIELO - Lógica de Interfaz y Animaciones (GSAP)
 * Implementando mejores prácticas de gsap-scrolltrigger y ui-ux-pro-max
 */

// Asegurarse de que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    console.log("Hotel EL CIELO: Iniciando interfaz...");
    
    // 1. Inicializar iconos SVG (Feather) con try/catch para evitar errores fatales
    try {
        if (typeof feather !== 'undefined') {
            feather.replace();
            console.log("Feather Icons: OK");
        } else {
            console.warn("Feather Icons: No se pudo cargar la librería externa.");
        }
    } catch (err) {
        console.error("Error al inicializar Feather Icons:", err);
    }

    // 2. Registrar Plugins de GSAP y verificar carga
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        console.log("GSAP & ScrollTrigger: OK");
        
        // 3. Inicializar Animaciones
        initAnimations();
        
        // 4. Configurar Eventos UI
        setupInteractions();
    } else {
        console.error("GSAP Error: La librería GSAP no está cargada correctamente.");
    }
});

function initAnimations() {
    console.log("Hotel EL CIELO: Inicializando líneas de tiempo...");
    
    // A. Forzar visibilidad inicial (Reset preventivo para evitar bloqueos por caché de versiones anteriores)
    gsap.set([".top-header", ".stats-grid", ".stat-card", ".room-card", ".form-group", ".btn-block"], { 
        autoAlpha: 1, 
        opacity: 1, 
        visibility: "visible" 
    });

    const tl = gsap.timeline({ 
        defaults: { ease: "power3.out" },
        onComplete: () => console.log("Línea de tiempo inicial completada.")
    });

    // B. Animación de entrada usando autoAlpha para mejor manejo de visibilidad (UI/UX Pro Max)
    tl.from(".top-header", {
        y: -30,
        autoAlpha: 0,
        duration: 0.8
    })
    .from(".stats-grid", {
        y: 20,
        autoAlpha: 0,
        duration: 0.6
    }, "-=0.4")
    .from(".stat-card", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.6
    }, "-=0.4");

    // C. ScrollTrigger Batch for Room Cards Entry (gsap-scrolltrigger best practice)
    ScrollTrigger.batch(".room-card", {
        interval: 0.1,
        batchMax: 3,
        onEnter: (batch) => {
            gsap.from(batch, {
                autoAlpha: 0, 
                y: 30, 
                stagger: 0.15, 
                duration: 0.8,
                ease: "power2.out",
                overwrite: true
            });
        },
        start: "top 85%",
    });

    // D. Formulario de Reserva: Animación en cascada
    const formTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".quick-booking",
            start: "top 80%",
        }
    });

    formTimeline.from(".form-group", {
        x: 20,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
    }).from(".btn-block", {
        y: 10,
        autoAlpha: 0,
        duration: 0.4
    }, "-=0.2");
}

function setupInteractions() {
    // Efectos de Hover con GSAP en Room Cards
    // Se usa GSAP para la imagen y CSS para la sombra según directrices de UI/UX Designer
    const roomCards = document.querySelectorAll('.room-card');
    
    roomCards.forEach(card => {
        const img = card.querySelector('.room-img');
        
        card.addEventListener('mouseenter', () => {
            gsap.to(img, {
                backgroundPosition: "50% 60%", // Ligero movimiento parallax
                duration: 1.5,
                ease: "power1.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(img, {
                backgroundPosition: "50% 50%",
                duration: 1.5,
                ease: "power1.out"
            });
        });
    });

    // Simular el Formulario de Reserva Rápidas
    const form = document.getElementById('booking-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simular carga y validación
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            
            gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
            btn.textContent = "Procesando...";
            btn.disabled = true;

            setTimeout(() => {
                showNotification(`¡Reserva confirmada para ${document.getElementById('cliente').value}!`);
                btn.textContent = originalText;
                btn.disabled = false;
                form.reset();
            }, 1200);
        });
    }

    // Botones individuales de cada habitación
    document.querySelectorAll('.btn-book').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const roomNumber = e.target.dataset.room;
            // Scroll suave hacia el formulario (GSAP Plugin recomendado, pero aquí hacemos nativo por brevedad)
            document.querySelector('.quick-booking').scrollIntoView({ behavior: 'smooth' });
            
            // Auto-rellenar algo si quisiéramos o dar focus
            setTimeout(() => {
                const clientInput = document.getElementById('cliente');
                clientInput.focus();
                // Animación de highlight al campo
                gsap.fromTo(clientInput, 
                    { backgroundColor: "rgba(212,175,55,0.2)" },
                    { backgroundColor: "transparent", duration: 1 }
                );
            }, 800);
        });
    });
}

// Sistema de Notificaciones Toast con GSAP
function showNotification(message) {
    const container = document.getElementById('notification-container');
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i data-feather="check-circle" style="color: var(--clr-success);"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    feather.replace(); // Renderizar el icono en el nuevo toast

    // Animación de entrada
    gsap.fromTo(toast, 
        { x: 50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
    );

    // Animación de salida automática después de 4s
    setTimeout(() => {
        gsap.to(toast, {
            x: 50,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                toast.remove();
            }
        });
    }, 4000);
}

// Expandir sección con GSAP (Patrón Acordeón Responsivo)
window.toggleAccordion = function(sectionId) {
    // Si estamos en desktop, no interfiere
    if (window.matchMedia('(min-width: 1024px)').matches) return;

    const container = document.getElementById(sectionId);
    if (!container) return;

    const content = container.querySelector('.accordion-content');
    const icon = container.querySelector('.accordion-icon');
    const isOpen = content.classList.contains('active');

    if (!isOpen) {
        gsap.fromTo(content, 
            { height: 0, opacity: 0 }, 
            { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
        content.classList.add('active');
        if (icon) icon.classList.add('active');
    } else {
        gsap.to(content, { 
            height: 0, 
            opacity: 0, 
            duration: 0.3, 
            ease: 'power2.in' 
        });
        content.classList.remove('active');
        if (icon) icon.classList.remove('active');
    }
};

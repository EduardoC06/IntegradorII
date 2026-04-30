const roomData = [
  {
    id: "azure",
    name: "The Azure Suite",
    location: "Santorini, Greece",
    price: 850,
    size: "120 m²",
    bed: "California King",
    capacity: "2 Adults",
    view: "Panoramic Sea",
    desc: "Designed with the 'Digital Concierge' philosophy in mind, the Azure Suite breaks the mold of traditional luxury. Every line is intentional, every shadow curated.",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    ],
    amenities: [
      { n: "Private Pool", i: "pool" },
      { n: "Fiber WiFi", i: "wifi" },
    ],
  },
  {
    id: "indigo",
    name: "The Indigo Loft",
    location: "Berlin, Germany",
    price: 620,
    size: "85 m²",
    bed: "Queen Size",
    capacity: "2 Adults",
    view: "City Skyline",
    desc: "Industrial elegance meets modern comfort. This loft features concrete walls and high ceilings.",
    images: [
      "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    ],
    amenities: [
      { n: "Smart Spa", i: "spa" },
      { n: "Workspace", i: "laptop_mac" },
    ],
  },
];

function updateRoom(id) {
  const room = roomData.find((r) => r.id === id);

  // Breadcrumb y Desc
  document.getElementById("active-breadcrumb").innerText = room.name;
  document.getElementById("room-desc").innerText = room.desc;

  // Galería
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = `
        <div class="bento-item main-img"><img src="${room.images[0]}"></div>
        <div class="bento-item wide-img"><img src="${room.images[1]}"></div>
        <div class="bento-item"><img src="${room.images[2]}"></div>
        <div class="bento-item"><img src="${room.images[3]}"></div>
    `;

  // Ribbon
  document.getElementById("features").innerHTML = `
        ${renderFeature("square_foot", "Size", room.size)}
        ${renderFeature("king_bed", "Bedding", room.bed)}
        ${renderFeature("visibility", "View", room.view)}
    `;

  // Booking Card
  document.getElementById("booking-card").innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem">
            <h3 style="font-size: 1.5rem">$${room.price} <small style="font-size:0.8rem">/night</small></h3>
            <span>⭐ 4.9</span>
        </div>
        <button class="btn-primary">Reserve Now</button>
    `;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderFeature(icon, label, value) {
  return `
        <div class="feature-item">
            <div class="feature-icon"><span class="material-symbols-outlined">${icon}</span></div>
            <div><small>${label}</small><div><strong>${value}</strong></div></div>
        </div>`;
}

function initCatalog() {
  const container = document.getElementById("catalog");
  container.innerHTML = roomData
    .map(
      (room) => `
        <div class="catalog-item" onclick="updateRoom('${room.id}')">
            <img src="${room.images[0]}">
            <h4 style="margin-top:1rem">${room.name}</h4>
            <p style="color:var(--on-surface-variant)">From $${room.price}</p>
        </div>
    `,
    )
    .join("");
}

// Iniciar
initCatalog();
updateRoom("azure");

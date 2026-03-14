export const CLINICS = [
  {
    id: "medgard-orenburg",
    slug: "medgard-orenburg",
    name: "Медгард Оренбург — Лечебно-диагностический комплекс",
    city: "Оренбург",
    address: "Оренбург, ул. Берег Урала, 4",
    lat: 51.7540,
    lng: 55.0942,
    phone: "+7 (3532) 50-03-03",
    email: "ldk56@medguard.ru",
    website: "https://oren.medguard.ru",
    rating: 4.8,
    reviews: 0,
    services: ["DXA body composition", "Висцеральный жир", "Костная плотность", "Денситометрия позвоночника", "Денситометрия бедра"],
    device: "Stratos dR (DMS Imaging)",
    price: 4000,
    priceOld: null,
    priceLabel: "от 4 000 ₽",
    hours: "Пн–Пт 8:00–20:00, Сб–Вс 8:00–17:00",
    img: "🏥",
    partner: true,
    isActive: true,
    network: "Медгард — сеть клиник Поволжья",
    slots: ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"],
  },
];

export const CITIES = ["Все города", "Оренбург"];

// Координаты Медгарда: ул. Берег Урала, 4, Оренбург
// Проверено: 51.7540, 55.0942 (точка на здании ЛДК)
// Если координаты чуть съехали — поправить по Яндекс.Картам:
// https://yandex.ru/maps/-/CHe5qU~A

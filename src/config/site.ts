export const siteConfig = {
  name: "Sri Lakshmi Ganapathi Photo Frame Works",
  shortName: "Sri Lakshmi Ganapathi Photo Frames",
  tagline: "Since 1985",
  description: "Discover handcrafted photo frames, lighting displays, and silver gift articles. Each piece tells a story of dedication and artistry.",
  phone: "917989178868",
  phoneDisplay: "+91 79891 78868",
  email: "suni99796@gmail.com",
  whatsappMessage: "Hi! I'm interested in your handcrafted frames. Can you help me?",
  address: {
    street: "Gokavaram Bustand Road, near Southindia Shopping Mall, Lakshmivarapu Pet, Innespeta",
    city: "Rajamahendravaram",
    state: "Andhra Pradesh",
    pin: "533104",
    full: "Gokavaram Bustand Road, near Southindia Shopping Mall, Lakshmivarapu Pet, Innespeta, Rajamahendravaram, Andhra Pradesh 533104",
    mapsUrl: "https://maps.app.goo.gl/8GA5A21D2tMN5SJd6",
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    whatsapp: "https://wa.me/919876543210",
    whatsappCommunity: "https://chat.whatsapp.com/CPoRcaFIwCw0vskCTcxjnM",
  },
  businessHours: {
    weekdays: "10:00 AM - 9:00 PM",
    sunday: "11:00 AM - 5:00 PM",
  },
} as const;

export function getWhatsAppUrl(customMessage?: string) {
  const message = encodeURIComponent(customMessage || siteConfig.whatsappMessage);
  return `https://wa.me/${siteConfig.phone}?text=${message}`;
}

export function getCallUrl() {
  return `tel:+${siteConfig.phone}`;
}

export interface Order {
  id: string;
  customerName: string;
  address: string;
  eta: string;
  timeWindow: string;
  packageId: string;
  status: "en_route" | "upcoming" | "completed";
  lat: number;
  lng: number;
  isUrgent?: boolean;
  weight?: string;
  deadline?: string;
  phone?: string;
}

export interface UrgentOrderData {
  order: Order;
  currentRouteEta: string;
  newRouteEta: string;
  reason: string;
  weight: string;
  deadline: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "urgent";
}

export const URGENT_ORDER: UrgentOrderData = {
  order: {
    id: "ORD-3900",
    customerName: "Deepak Rajan",
    address: "42, Kamarajar Salai, Mylapore, Chennai 600004",
    eta: "8 min",
    timeWindow: "10:30 AM - 11:00 AM",
    packageId: "PKG-44250",
    status: "upcoming",
    lat: 13.0339,
    lng: 80.2676,
    isUrgent: true,
    weight: "4.2 kg",
    deadline: "11:00 AM TODAY",
    phone: "+91 98412 33456",
  },
  currentRouteEta: "1h 45m",
  newRouteEta: "1h 52m",
  reason: "Order is near your current location on the T. Nagar-Mylapore route. Minimal detour required.",
  weight: "4.2 kg",
  deadline: "11:00 AM TODAY",
};

export const ORDERS: Order[] = [
  {
    id: "ORD-3001",
    customerName: "Priya Lakshmi",
    address: "12, Cenotaph Road, Teynampet, Chennai 600018",
    eta: "12 min",
    timeWindow: "10:00 AM - 11:00 AM",
    packageId: "PKG-55101",
    status: "en_route",
    lat: 13.0382,
    lng: 80.2466,
    phone: "+91 98410 12345",
  },
  {
    id: "ORD-3002",
    customerName: "Karthik Sundaram",
    address: "78, Anna Nagar 2nd Avenue, Chennai 600040",
    eta: "35 min",
    timeWindow: "11:00 AM - 12:00 PM",
    packageId: "PKG-55102",
    status: "upcoming",
    lat: 13.0850,
    lng: 80.2101,
    phone: "+91 94440 67890",
  },
  {
    id: "ORD-3003",
    customerName: "Meena Venkatesh",
    address: "5, Besant Nagar 3rd Cross, Chennai 600090",
    eta: "55 min",
    timeWindow: "12:00 PM - 1:00 PM",
    packageId: "PKG-55103",
    status: "upcoming",
    lat: 13.0002,
    lng: 80.2668,
    phone: "+91 98765 11223",
  },
  {
    id: "ORD-3004",
    customerName: "Senthil Murugan",
    address: "303, Velachery Main Road, Velachery, Chennai 600042",
    eta: "1h 20m",
    timeWindow: "1:00 PM - 2:00 PM",
    packageId: "PKG-55104",
    status: "upcoming",
    lat: 12.9815,
    lng: 80.2180,
    phone: "+91 90030 44556",
  },
  {
    id: "ORD-3005",
    customerName: "Anitha Ramesh",
    address: "21, TTK Road, Alwarpet, Chennai 600018",
    eta: "--",
    timeWindow: "8:00 AM - 9:00 AM",
    packageId: "PKG-55098",
    status: "completed",
    lat: 13.0346,
    lng: 80.2527,
    phone: "+91 98411 98765",
  },
  {
    id: "ORD-3006",
    customerName: "Vijay Prasad",
    address: "15, Cathedral Road, Gopalapuram, Chennai 600086",
    eta: "--",
    timeWindow: "9:00 AM - 10:00 AM",
    packageId: "PKG-55099",
    status: "completed",
    lat: 13.0505,
    lng: 80.2507,
    phone: "+91 98765 54321",
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "NOT-001",
    title: "Route Update",
    message: "Your route has been optimized. 2 new stops added near T. Nagar.",
    time: "2 min ago",
    read: false,
    type: "info",
  },
  {
    id: "NOT-002",
    title: "Priority Delivery",
    message: "ORD-3001 marked as priority. Customer requested early delivery to Teynampet.",
    time: "15 min ago",
    read: false,
    type: "urgent",
  },
  {
    id: "NOT-003",
    title: "Traffic Alert",
    message: "Heavy congestion on Mount Road near Saidapet. Consider alternate route via Adyar.",
    time: "30 min ago",
    read: false,
    type: "warning",
  },
  {
    id: "NOT-004",
    title: "Break Reminder",
    message: "You have been driving for 3 hours. Please take a 15-minute break.",
    time: "1h ago",
    read: true,
    type: "info",
  },
  {
    id: "NOT-005",
    title: "Fuel Level Low",
    message: "Vehicle fuel level estimated at 15%. Nearest fuel station: Indian Oil, Adyar.",
    time: "2h ago",
    read: true,
    type: "warning",
  },
];

export const LEAVE_REASONS = [
  "Personal Leave",
  "Sick Leave",
  "Family Emergency",
  "Medical Appointment",
  "Other",
];

export const EXCEPTION_TYPES = [
  { id: "road_blocked", label: "Road Blocked", icon: "alert-triangle" as const },
  { id: "customer_not_home", label: "Customer Not Home", icon: "user-x" as const },
  { id: "return_to_origin", label: "Return to Origin", icon: "rotate-ccw" as const },
  { id: "other", label: "Other", icon: "more-horizontal" as const },
];

export const FUEL_STATIONS = [
  { name: "Indian Oil - Adyar", lat: 13.0067, lng: 80.2571 },
  { name: "HP Petrol - T. Nagar", lat: 13.0418, lng: 80.2341 },
  { name: "Bharat Petroleum - Guindy", lat: 13.0067, lng: 80.2206 },
];

export const BREAK_SPOTS = [
  { name: "Saravana Bhavan - Mylapore", lat: 13.0368, lng: 80.2676 },
  { name: "Murugan Idli - Adyar", lat: 13.0067, lng: 80.2571 },
];

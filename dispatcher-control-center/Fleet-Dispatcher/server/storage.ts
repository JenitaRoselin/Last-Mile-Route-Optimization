import type {
  Driver,
  FleetVehicle,
  KpiData,
  Notification,
  MapMarker,
  UrgentOrderInput,
  DriverCandidate,
  LeaveRequest,
  OvertimeRequest,
  FuelBill,
  PODApproval,
} from "@shared/schema";

  import { spawn } from "child_process";
  import * as path from "path";

export interface IStorage {
  getKpis(): Promise<KpiData>;
  getDrivers(): Promise<Driver[]>;
  getFleet(): Promise<FleetVehicle[]>;
  getNotifications(): Promise<Notification[]>;
  getMarkers(): Promise<MapMarker[]>;
  acknowledgeNotification(id: string): Promise<Notification | null>;
  reassignDriver(driverId: string): Promise<{ driver: Driver; vehicle: FleetVehicle } | null>;
  transferDeliveryPoint(fromDriverId: string, toDriverId: string, pointId: string, insertIndex: number): Promise<{ fromDriver: Driver; toDriver: Driver } | null>;
  findUrgentDriverCandidates(input: UrgentOrderInput): Promise<DriverCandidate[]>;
  assignUrgentOrder(driverId: string, input: UrgentOrderInput): Promise<Driver | null>;
  getLeaveRequests(): Promise<LeaveRequest[]>;
  updateLeaveStatus(id: string, status: "approved" | "rejected"): Promise<LeaveRequest | null>;
  getOvertimeRequests(): Promise<OvertimeRequest[]>;
  updateOvertimeStatus(id: string, status: "approved" | "rejected"): Promise<OvertimeRequest | null>;
  getFuelBills(): Promise<FuelBill[]>;
  updateFuelBillStatus(id: string, status: "approved" | "rejected"): Promise<FuelBill | null>;
  getPodApprovals(): Promise<PODApproval[]>;
  updatePodStatus(id: string, status: "approved" | "rejected"): Promise<PODApproval | null>;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const seedKpis: KpiData = {
  onTimeRate: 93,
  dropsPerRoute: 13,
  totalDistance: 248,
  fuelSavings: 22,
  co2Reduction: 28,
};

const chennaiAreas: { name: string; lat: number; lng: number; nearby: string[] }[] = [
  { name: "T. Nagar", lat: 13.0418, lng: 80.2341, nearby: ["Kodambakkam", "Nungambakkam", "Mylapore"] },
  { name: "Anna Nagar", lat: 13.0850, lng: 80.2101, nearby: ["Kilpauk", "Perambur", "Ambattur"] },
  { name: "Adyar", lat: 13.0012, lng: 80.2565, nearby: ["Thiruvanmiyur", "Mylapore", "Guindy"] },
  { name: "Velachery", lat: 12.9816, lng: 80.2185, nearby: ["Guindy", "Adyar", "Chromepet"] },
  { name: "Mylapore", lat: 13.0368, lng: 80.2676, nearby: ["Adyar", "T. Nagar", "Royapettah"] },
  { name: "Tambaram", lat: 12.9249, lng: 80.1000, nearby: ["Chromepet", "Pallavaram", "Sholinganallur"] },
  { name: "Porur", lat: 13.0382, lng: 80.1564, nearby: ["Guindy", "Kodambakkam", "Ambattur"] },
  { name: "Guindy", lat: 13.0067, lng: 80.2206, nearby: ["Velachery", "Adyar", "T. Nagar"] },
  { name: "Chromepet", lat: 12.9516, lng: 80.1462, nearby: ["Tambaram", "Pallavaram", "Velachery"] },
  { name: "Perambur", lat: 13.1187, lng: 80.2332, nearby: ["Anna Nagar", "Kilpauk", "Royapettah"] },
  { name: "Thiruvanmiyur", lat: 12.9830, lng: 80.2594, nearby: ["Adyar", "Velachery", "Sholinganallur"] },
  { name: "Ambattur", lat: 13.1143, lng: 80.1548, nearby: ["Anna Nagar", "Porur", "Perambur"] },
  { name: "Sholinganallur", lat: 12.9010, lng: 80.2279, nearby: ["Thiruvanmiyur", "Velachery", "Tambaram"] },
  { name: "Kilpauk", lat: 13.0842, lng: 80.2428, nearby: ["Anna Nagar", "Perambur", "Egmore"] },
  { name: "Kodambakkam", lat: 13.0524, lng: 80.2247, nearby: ["T. Nagar", "Porur", "Nungambakkam"] },
  { name: "Nungambakkam", lat: 13.0569, lng: 80.2425, nearby: ["T. Nagar", "Kilpauk", "Kodambakkam"] },
  { name: "Egmore", lat: 13.0732, lng: 80.2609, nearby: ["Kilpauk", "Royapettah", "Nungambakkam"] },
  { name: "Royapettah", lat: 13.0540, lng: 80.2650, nearby: ["Mylapore", "Egmore", "T. Nagar"] },
  { name: "Pallavaram", lat: 12.9675, lng: 80.1505, nearby: ["Chromepet", "Tambaram", "Guindy"] },
];

function getAreaInfo(name: string) {
  return chennaiAreas.find((a) => a.name === name) ?? chennaiAreas[0];
}

const seedDrivers: Driver[] = [
  {
    id: "d1", name: "Murugan Selvam", homeLocality: "T. Nagar", vehicleType: "bike", status: "active",
    currentRoute: "T. Nagar Area", dropsCompleted: 9, dropsTotal: 14, fuelConsumption: 2.1,
    phone: "+91 98765 43210", avatar: "MS", rating: 4.6, shiftStart: "08:00 AM", shiftEnd: "05:00 PM",
    hoursWorkedToday: 5.2, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 6,
    deliveryPoints: [
      { id: "dp-d1-1", address: "12, G.N. Chetty Road, T. Nagar", lat: 13.0418, lng: 80.2341, status: "completed", estimatedTime: "09:00 AM", actualTime: "08:55 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d1-2", address: "45, Burkit Road, T. Nagar", lat: 13.0390, lng: 80.2300, status: "completed", estimatedTime: "09:30 AM", actualTime: "09:40 AM", deliveryWindow: "09:00 AM - 10:00 AM" },
      { id: "dp-d1-3", address: "7, North Usman Road, T. Nagar", lat: 13.0450, lng: 80.2320, status: "completed", estimatedTime: "10:00 AM", actualTime: "10:05 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d1-4", address: "22, Pondy Bazaar, T. Nagar", lat: 13.0400, lng: 80.2360, status: "pending", estimatedTime: "10:45 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d1-5", address: "88, Thyagaraya Road, T. Nagar", lat: 13.0430, lng: 80.2310, status: "pending", estimatedTime: "11:15 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
    ],
  },
  {
    id: "d2", name: "Kavitha Lakshmi", homeLocality: "Anna Nagar", vehicleType: "van", status: "active",
    currentRoute: "Anna Nagar Area", dropsCompleted: 12, dropsTotal: 16, fuelConsumption: 8.4,
    phone: "+91 98765 43211", avatar: "KL", rating: 4.8, shiftStart: "07:30 AM", shiftEnd: "04:30 PM",
    hoursWorkedToday: 7.5, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 180,
    deliveryPoints: [
      { id: "dp-d2-1", address: "Shanthi Colony, 2nd Ave, Anna Nagar", lat: 13.0850, lng: 80.2101, status: "completed", estimatedTime: "08:30 AM", actualTime: "08:25 AM", deliveryWindow: "08:00 AM - 09:00 AM" },
      { id: "dp-d2-2", address: "Blue Star Bldg, 3rd Ave, Anna Nagar", lat: 13.0880, lng: 80.2120, status: "completed", estimatedTime: "09:15 AM", actualTime: "09:20 AM", deliveryWindow: "09:00 AM - 10:00 AM" },
      { id: "dp-d2-3", address: "Tower Park, Anna Nagar", lat: 13.0860, lng: 80.2090, status: "delayed", estimatedTime: "10:00 AM", actualTime: "10:35 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d2-4", address: "Roundtana, Anna Nagar", lat: 13.0840, lng: 80.2140, status: "pending", estimatedTime: "11:00 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
    ],
  },
  {
    id: "d3", name: "Senthil Kumaran", homeLocality: "Adyar", vehicleType: "bike", status: "idle",
    currentRoute: "Adyar Area", dropsCompleted: 14, dropsTotal: 14, fuelConsumption: 1.8,
    phone: "+91 98765 43212", avatar: "SK", rating: 4.3, shiftStart: "06:00 AM", shiftEnd: "03:00 PM",
    hoursWorkedToday: 8.5, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 0,
    deliveryPoints: [],
  },
  {
    id: "d4", name: "Meenakshi Sundaram", homeLocality: "Velachery", vehicleType: "van", status: "active",
    currentRoute: "Velachery Area", dropsCompleted: 6, dropsTotal: 12, fuelConsumption: 9.2,
    phone: "+91 98765 43213", avatar: "MD", rating: 4.1, shiftStart: "08:00 AM", shiftEnd: "05:00 PM",
    hoursWorkedToday: 4.8, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 220,
    deliveryPoints: [
      { id: "dp-d4-1", address: "Phoenix Mall, Velachery", lat: 12.9816, lng: 80.2185, status: "completed", estimatedTime: "09:00 AM", actualTime: "09:10 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d4-2", address: "100 Ft Road, Velachery", lat: 12.9830, lng: 80.2200, status: "completed", estimatedTime: "09:45 AM", actualTime: "09:50 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d4-3", address: "Taramani Link Road, Velachery", lat: 12.9850, lng: 80.2220, status: "pending", estimatedTime: "10:30 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d4-4", address: "Vijaya Nagar, Velachery", lat: 12.9800, lng: 80.2170, status: "pending", estimatedTime: "11:15 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
      { id: "dp-d4-5", address: "Bypass Road, Velachery", lat: 12.9780, lng: 80.2150, status: "delayed", estimatedTime: "12:00 PM", deliveryWindow: "11:30 AM - 12:30 PM" },
      { id: "dp-d4-6", address: "MRTS Station, Velachery", lat: 12.9790, lng: 80.2210, status: "pending", estimatedTime: "12:45 PM", deliveryWindow: "12:00 PM - 01:00 PM" },
    ],
  },
  {
    id: "d5", name: "Karthikeyan Rajan", homeLocality: "Mylapore", vehicleType: "bike", status: "offline",
    currentRoute: "\u2014", dropsCompleted: 0, dropsTotal: 0, fuelConsumption: 0,
    phone: "+91 98765 43214", avatar: "KR", rating: 3.9, shiftStart: "\u2014", shiftEnd: "\u2014",
    hoursWorkedToday: 0, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 0,
    deliveryPoints: [],
  },
  {
    id: "d6", name: "Tamilselvi Nadar", homeLocality: "Tambaram", vehicleType: "van", status: "active",
    currentRoute: "Tambaram Area", dropsCompleted: 10, dropsTotal: 18, fuelConsumption: 11.3,
    phone: "+91 98765 43215", avatar: "TN", rating: 4.5, shiftStart: "07:00 AM", shiftEnd: "04:00 PM",
    hoursWorkedToday: 6.3, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 150,
    deliveryPoints: [
      { id: "dp-d6-1", address: "East Tambaram Station Road", lat: 12.9249, lng: 80.1000, status: "completed", estimatedTime: "08:00 AM", actualTime: "07:55 AM", deliveryWindow: "07:30 AM - 08:30 AM" },
      { id: "dp-d6-2", address: "Selaiyur Main Road, Tambaram", lat: 12.9200, lng: 80.1050, status: "completed", estimatedTime: "08:45 AM", actualTime: "08:50 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d6-3", address: "GST Road, Near Tambaram", lat: 12.9280, lng: 80.0980, status: "pending", estimatedTime: "10:15 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d6-4", address: "Mudichur Road, Tambaram", lat: 12.9220, lng: 80.0960, status: "pending", estimatedTime: "11:00 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
      { id: "dp-d6-5", address: "Perungalathur, Near Tambaram", lat: 12.9150, lng: 80.0940, status: "delayed", estimatedTime: "11:45 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
    ],
  },
  {
    id: "d7", name: "Raghavan Pillai", homeLocality: "Guindy", vehicleType: "bike", status: "active",
    currentRoute: "Guindy Area", dropsCompleted: 7, dropsTotal: 11, fuelConsumption: 1.9,
    phone: "+91 98765 43216", avatar: "RP", rating: 4.7, shiftStart: "08:30 AM", shiftEnd: "05:30 PM",
    hoursWorkedToday: 4.0, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 5,
    deliveryPoints: [
      { id: "dp-d7-1", address: "SIDCO Industrial Estate, Guindy", lat: 13.0067, lng: 80.2206, status: "completed", estimatedTime: "09:00 AM", actualTime: "08:58 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d7-2", address: "Kathipara Junction, Guindy", lat: 13.0080, lng: 80.2180, status: "pending", estimatedTime: "10:30 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d7-3", address: "Raj Bhavan, Guindy", lat: 13.0050, lng: 80.2230, status: "pending", estimatedTime: "11:15 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
      { id: "dp-d7-4", address: "Alandur Metro, Near Guindy", lat: 13.0030, lng: 80.2160, status: "pending", estimatedTime: "12:00 PM", deliveryWindow: "11:30 AM - 12:30 PM" },
    ],
  },
  {
    id: "d8", name: "Priya Dharshini", homeLocality: "Porur", vehicleType: "van", status: "active",
    currentRoute: "Porur Area", dropsCompleted: 5, dropsTotal: 13, fuelConsumption: 7.6,
    phone: "+91 98765 43217", avatar: "PD", rating: 4.4, shiftStart: "07:30 AM", shiftEnd: "04:30 PM",
    hoursWorkedToday: 5.8, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 200,
    deliveryPoints: [
      { id: "dp-d8-1", address: "Porur Junction, Porur", lat: 13.0382, lng: 80.1564, status: "completed", estimatedTime: "08:30 AM", actualTime: "08:35 AM", deliveryWindow: "08:00 AM - 09:00 AM" },
      { id: "dp-d8-2", address: "Arcot Road, Near Porur", lat: 13.0400, lng: 80.1540, status: "pending", estimatedTime: "10:00 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d8-3", address: "Mount Poonamallee Road, Porur", lat: 13.0360, lng: 80.1580, status: "pending", estimatedTime: "10:45 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
      { id: "dp-d8-4", address: "Ramapuram Main Road", lat: 13.0340, lng: 80.1600, status: "delayed", estimatedTime: "11:30 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
      { id: "dp-d8-5", address: "Valasaravakkam, Near Porur", lat: 13.0420, lng: 80.1520, status: "pending", estimatedTime: "12:15 PM", deliveryWindow: "12:00 PM - 01:00 PM" },
    ],
  },
  {
    id: "d9", name: "Balasubramanian K", homeLocality: "Perambur", vehicleType: "bike", status: "active",
    currentRoute: "Perambur Area", dropsCompleted: 11, dropsTotal: 15, fuelConsumption: 2.3,
    phone: "+91 98765 43218", avatar: "BK", rating: 4.2, shiftStart: "07:00 AM", shiftEnd: "04:00 PM",
    hoursWorkedToday: 6.5, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 4,
    deliveryPoints: [
      { id: "dp-d9-1", address: "Perambur Barracks Road", lat: 13.1187, lng: 80.2332, status: "completed", estimatedTime: "08:15 AM", actualTime: "08:10 AM", deliveryWindow: "08:00 AM - 09:00 AM" },
      { id: "dp-d9-2", address: "Kolathur Main Road", lat: 13.1200, lng: 80.2300, status: "pending", estimatedTime: "10:30 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d9-3", address: "Vyasarpadi, Near Perambur", lat: 13.1150, lng: 80.2370, status: "pending", estimatedTime: "11:15 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
    ],
  },
  {
    id: "d10", name: "Lakshmi Priya", homeLocality: "Thiruvanmiyur", vehicleType: "van", status: "idle",
    currentRoute: "Thiruvanmiyur Area", dropsCompleted: 10, dropsTotal: 10, fuelConsumption: 6.8,
    phone: "+91 98765 43219", avatar: "LP", rating: 4.9, shiftStart: "06:30 AM", shiftEnd: "03:30 PM",
    hoursWorkedToday: 8.0, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 0,
    deliveryPoints: [],
  },
  {
    id: "d11", name: "Arjun Natarajan", homeLocality: "Chromepet", vehicleType: "bike", status: "active",
    currentRoute: "Chromepet Area", dropsCompleted: 3, dropsTotal: 12, fuelConsumption: 2.0,
    phone: "+91 98765 43220", avatar: "AN", rating: 3.8, shiftStart: "08:00 AM", shiftEnd: "05:00 PM",
    hoursWorkedToday: 3.5, maxHoursPerDay: 9, vehicleCapacityKg: 15, currentLoadKg: 7,
    deliveryPoints: [
      { id: "dp-d11-1", address: "GST Road, Chromepet", lat: 12.9516, lng: 80.1462, status: "completed", estimatedTime: "09:00 AM", actualTime: "09:05 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d11-2", address: "New Colony, Chromepet", lat: 12.9530, lng: 80.1440, status: "pending", estimatedTime: "10:00 AM", deliveryWindow: "09:30 AM - 10:30 AM" },
      { id: "dp-d11-3", address: "Radha Nagar, Chromepet", lat: 12.9500, lng: 80.1480, status: "pending", estimatedTime: "10:45 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
      { id: "dp-d11-4", address: "Hastinapuram, Near Chromepet", lat: 12.9480, lng: 80.1500, status: "delayed", estimatedTime: "11:30 AM", deliveryWindow: "11:00 AM - 12:00 PM" },
      { id: "dp-d11-5", address: "Pallavaram Link Road", lat: 12.9550, lng: 80.1420, status: "pending", estimatedTime: "12:15 PM", deliveryWindow: "12:00 PM - 01:00 PM" },
    ],
  },
  {
    id: "d12", name: "Deepa Venkatesh", homeLocality: "Kilpauk", vehicleType: "van", status: "active",
    currentRoute: "Kilpauk Area", dropsCompleted: 8, dropsTotal: 14, fuelConsumption: 8.1,
    phone: "+91 98765 43221", avatar: "DV", rating: 4.5, shiftStart: "07:00 AM", shiftEnd: "04:00 PM",
    hoursWorkedToday: 6.0, maxHoursPerDay: 9, vehicleCapacityKg: 500, currentLoadKg: 170,
    deliveryPoints: [
      { id: "dp-d12-1", address: "Kilpauk Garden Road", lat: 13.0842, lng: 80.2428, status: "completed", estimatedTime: "08:00 AM", actualTime: "07:58 AM", deliveryWindow: "07:30 AM - 08:30 AM" },
      { id: "dp-d12-2", address: "Pulla Ave, Kilpauk", lat: 13.0860, lng: 80.2410, status: "completed", estimatedTime: "08:45 AM", actualTime: "08:50 AM", deliveryWindow: "08:30 AM - 09:30 AM" },
      { id: "dp-d12-3", address: "EVR Periyar Road, Kilpauk", lat: 13.0830, lng: 80.2450, status: "pending", estimatedTime: "10:15 AM", deliveryWindow: "10:00 AM - 11:00 AM" },
      { id: "dp-d12-4", address: "Amanjikarai, Near Kilpauk", lat: 13.0820, lng: 80.2400, status: "pending", estimatedTime: "11:00 AM", deliveryWindow: "10:30 AM - 11:30 AM" },
    ],
  },
];

const seedFleet: FleetVehicle[] = [
  { id: "v1", type: "bike", licensePlate: "TN-01-AB-1234", driverId: "d1", driverName: "Murugan Selvam", status: "en-route", location: { lat: 13.0418, lng: 80.2341 }, fuelLevel: 72, currentArea: "T. Nagar" },
  { id: "v2", type: "van", licensePlate: "TN-01-CD-5678", driverId: "d2", driverName: "Kavitha Lakshmi", status: "en-route", location: { lat: 13.0850, lng: 80.2101 }, fuelLevel: 45, currentArea: "Anna Nagar" },
  { id: "v3", type: "bike", licensePlate: "TN-01-EF-9012", driverId: "d3", driverName: "Senthil Kumaran", status: "idle", location: { lat: 13.0012, lng: 80.2565 }, fuelLevel: 88, currentArea: "Adyar" },
  { id: "v4", type: "van", licensePlate: "TN-01-GH-3456", driverId: "d4", driverName: "Meenakshi Sundaram", status: "en-route", location: { lat: 12.9816, lng: 80.2185 }, fuelLevel: 31, currentArea: "Velachery" },
  { id: "v5", type: "bike", licensePlate: "TN-01-IJ-7890", driverId: "d5", driverName: "Karthikeyan Rajan", status: "maintenance", location: { lat: 13.0368, lng: 80.2676 }, fuelLevel: 100, currentArea: "Mylapore" },
  { id: "v6", type: "van", licensePlate: "TN-01-KL-2345", driverId: "d6", driverName: "Tamilselvi Nadar", status: "en-route", location: { lat: 12.9249, lng: 80.1000 }, fuelLevel: 56, currentArea: "Tambaram" },
  { id: "v7", type: "bike", licensePlate: "TN-01-MN-6789", driverId: "d7", driverName: "Raghavan Pillai", status: "en-route", location: { lat: 13.0067, lng: 80.2206 }, fuelLevel: 64, currentArea: "Guindy" },
  { id: "v8", type: "van", licensePlate: "TN-01-OP-1122", driverId: "d8", driverName: "Priya Dharshini", status: "en-route", location: { lat: 13.0382, lng: 80.1564 }, fuelLevel: 52, currentArea: "Porur" },
  { id: "v9", type: "bike", licensePlate: "TN-01-QR-3344", driverId: "d9", driverName: "Balasubramanian K", status: "en-route", location: { lat: 13.1187, lng: 80.2332 }, fuelLevel: 78, currentArea: "Perambur" },
  { id: "v10", type: "van", licensePlate: "TN-01-ST-5566", driverId: "d10", driverName: "Lakshmi Priya", status: "idle", location: { lat: 12.9830, lng: 80.2594 }, fuelLevel: 41, currentArea: "Thiruvanmiyur" },
  { id: "v11", type: "bike", licensePlate: "TN-01-UV-7788", driverId: "d11", driverName: "Arjun Natarajan", status: "en-route", location: { lat: 12.9516, lng: 80.1462 }, fuelLevel: 83, currentArea: "Chromepet" },
  { id: "v12", type: "van", licensePlate: "TN-01-WX-9900", driverId: "d12", driverName: "Deepa Venkatesh", status: "en-route", location: { lat: 13.0842, lng: 80.2428 }, fuelLevel: 59, currentArea: "Kilpauk" },
];

const seedNotifications: Notification[] = [
  { id: "n1", type: "late-delivery", severity: "high", driverName: "Meenakshi Sundaram", message: "Delivery #4892 delayed by 22 minutes at Velachery drop point", timestamp: "2 min ago", acknowledged: false },
  { id: "n2", type: "overtime-alert", severity: "high", driverName: "Kavitha Lakshmi", message: "Exceeded 9-hour shift limit. Currently at 9h 34m", timestamp: "8 min ago", acknowledged: false },
  { id: "n3", type: "route-deviation", severity: "medium", driverName: "Murugan Selvam", message: "Deviated 1.2 km from planned route near Mount Road", timestamp: "15 min ago", acknowledged: false },
  { id: "n4", type: "vehicle-issue", severity: "low", driverName: "Karthikeyan Rajan", message: "Bike TN-01-IJ-7890 scheduled for maintenance today", timestamp: "1 hr ago", acknowledged: true },
  { id: "n5", type: "late-delivery", severity: "medium", driverName: "Tamilselvi Nadar", message: "Delivery #4901 at risk \u2014 traffic congestion on GST Road", timestamp: "1 hr ago", acknowledged: true },
];

const autoNotificationTemplates: { type: Notification["type"]; severity: Notification["severity"]; messages: string[] }[] = [
  { type: "late-delivery", severity: "high", messages: ["Delivery #{id} delayed by {min} minutes at {area} drop point", "Delivery #{id} missed time window \u2014 customer waiting at {area}", "Delivery #{id} running {min} minutes behind schedule near {area}"] },
  { type: "overtime-alert", severity: "high", messages: ["Approaching 10-hour shift limit. Currently at 9h {min}m", "Exceeded 9-hour shift limit. Currently at 9h {min}m", "Shift overtime warning \u2014 {min} minutes past scheduled end"] },
  { type: "route-deviation", severity: "medium", messages: ["Deviated {km} km from planned route near {road}", "Unplanned stop detected for {min} minutes near {road}", "Took alternate path \u2014 {km} km longer than optimal near {road}"] },
  { type: "vehicle-issue", severity: "low", messages: ["Fuel level below 15% \u2014 refueling recommended", "Tyre pressure warning triggered on vehicle", "Engine temperature above normal \u2014 monitoring required"] },
];

const autoAreas = ["Porur", "Guindy", "Chromepet", "Perambur", "Thiruvanmiyur", "Ambattur", "Sholinganallur", "Kilpauk", "T. Nagar", "Velachery", "Adyar", "Mylapore"];
const autoRoads = ["Mount Road", "GST Road", "Anna Salai", "OMR", "ECR", "Inner Ring Road", "Poonamallee High Road", "Cathedral Road"];
const autoDriverNames = ["Murugan Selvam", "Kavitha Lakshmi", "Senthil Kumaran", "Meenakshi Sundaram", "Karthikeyan Rajan", "Tamilselvi Nadar", "Raghavan Pillai", "Priya Dharshini", "Balasubramanian K", "Lakshmi Priya", "Arjun Natarajan", "Deepa Venkatesh"];

function generateNotification(counter: number): Notification {
  const template = autoNotificationTemplates[Math.floor(Math.random() * autoNotificationTemplates.length)];
  const msgTemplate = template.messages[Math.floor(Math.random() * template.messages.length)];
  const driverName = autoDriverNames[Math.floor(Math.random() * autoDriverNames.length)];
  const area = autoAreas[Math.floor(Math.random() * autoAreas.length)];
  const road = autoRoads[Math.floor(Math.random() * autoRoads.length)];
  const id = 5000 + counter;
  const min = Math.floor(Math.random() * 40) + 5;
  const km = (Math.random() * 2 + 0.5).toFixed(1);

  const message = msgTemplate
    .replace("{id}", String(id))
    .replace("{min}", String(min))
    .replace("{area}", area)
    .replace("{road}", road)
    .replace("{km}", km);

  return {
    id: `n-auto-${counter}`,
    type: template.type,
    severity: template.severity,
    driverName,
    message,
    timestamp: "Just now",
    acknowledged: false,
  };
}

const seedLeaveRequests: LeaveRequest[] = [
  { id: "lr-1", driverId: "d1", driverName: "Murugan Selvam", avatar: "MS", leaveType: "sick", startDate: "Feb 20, 2026", endDate: "Feb 21, 2026", reason: "Fever and body ache, need 2 days rest as per doctor advice", submittedAt: "Feb 18, 2026 08:30 AM", status: "pending" },
  { id: "lr-2", driverId: "d5", driverName: "Arun Prasad", avatar: "AP", leaveType: "casual", startDate: "Feb 22, 2026", endDate: "Feb 22, 2026", reason: "Family function at native place in Madurai", submittedAt: "Feb 17, 2026 06:45 PM", status: "pending" },
  { id: "lr-3", driverId: "d8", driverName: "Tamilselvi Nadar", avatar: "TN", leaveType: "emergency", startDate: "Feb 19, 2026", endDate: "Feb 19, 2026", reason: "Mother admitted to hospital in Tambaram, need to attend urgently", submittedAt: "Feb 18, 2026 07:15 AM", status: "pending" },
  { id: "lr-4", driverId: "d3", driverName: "Senthil Kumaran", avatar: "SK", leaveType: "personal", startDate: "Feb 25, 2026", endDate: "Feb 26, 2026", reason: "House registration work at sub-registrar office in Chromepet", submittedAt: "Feb 16, 2026 04:00 PM", status: "pending" },
  { id: "lr-5", driverId: "d10", driverName: "Deepa Venkatesh", avatar: "DV", leaveType: "sick", startDate: "Feb 19, 2026", endDate: "Feb 20, 2026", reason: "Dengue fever symptoms, doctor advised complete bed rest for 2 days", submittedAt: "Feb 18, 2026 09:00 AM", status: "pending" },
];

const seedOvertimeRequests: OvertimeRequest[] = [
  { id: "ot-1", driverId: "d2", driverName: "Kavitha Lakshmi", avatar: "KL", date: "Feb 18, 2026", scheduledEnd: "06:00 PM", requestedEnd: "09:00 PM", extraHours: 3, reason: "Delayed shipment from warehouse, 8 pending deliveries in Anna Nagar area need completion today", submittedAt: "Feb 18, 2026 04:30 PM", status: "pending" },
  { id: "ot-2", driverId: "d6", driverName: "Karthikeyan Rajan", avatar: "KR", date: "Feb 18, 2026", scheduledEnd: "05:00 PM", requestedEnd: "07:30 PM", extraHours: 2.5, reason: "Vehicle breakdown earlier today caused 2.5 hour delay, need extra time to complete remaining 5 drops", submittedAt: "Feb 18, 2026 03:15 PM", status: "pending" },
  { id: "ot-3", driverId: "d9", driverName: "Raghavan Pillai", avatar: "RP", date: "Feb 18, 2026", scheduledEnd: "06:00 PM", requestedEnd: "08:00 PM", extraHours: 2, reason: "Urgent medical supply delivery to 3 clinics in Guindy, cannot be postponed to tomorrow", submittedAt: "Feb 18, 2026 05:00 PM", status: "pending" },
  { id: "ot-4", driverId: "d7", driverName: "Priya Dharshini", avatar: "PD", date: "Feb 17, 2026", scheduledEnd: "05:30 PM", requestedEnd: "07:00 PM", extraHours: 1.5, reason: "Heavy traffic on OMR road delayed all afternoon deliveries by 90 minutes", submittedAt: "Feb 17, 2026 04:00 PM", status: "pending" },
];

const seedFuelBills: FuelBill[] = [
  { id: "fb-1", driverId: "d1", driverName: "Murugan Selvam", avatar: "MS", vehiclePlate: "TN-01-AB-1234", fuelType: "petrol", litres: 11.73, amountRs: 951, stationName: "Indian Oil, City Fuel Center, Noida", date: "Feb 18, 2026", receiptImageUrl: "/images/receipts/receipt-1.png", submittedAt: "Feb 18, 2026 09:15 AM", status: "pending" },
  { id: "fb-2", driverId: "d2", driverName: "Kavitha Lakshmi", avatar: "KL", vehiclePlate: "TN-01-CD-5678", fuelType: "petrol", litres: 38.23, amountRs: 3623, stationName: "Chauhan Traders, G.T. Road Uchani", date: "Feb 18, 2026", receiptImageUrl: "/images/receipts/receipt-2.png", submittedAt: "Feb 18, 2026 08:45 AM", status: "pending" },
  { id: "fb-3", driverId: "d5", driverName: "Arun Prasad", avatar: "AP", vehiclePlate: "TN-01-CB-2204", fuelType: "petrol", litres: 1.0, amountRs: 200, stationName: "Indian Oil, Radial Road, Pallavaram", date: "Feb 17, 2026", receiptImageUrl: "/images/receipts/receipt-3.png", submittedAt: "Feb 17, 2026 05:30 PM", status: "pending" },
  { id: "fb-4", driverId: "d9", driverName: "Raghavan Pillai", avatar: "RP", vehiclePlate: "TN-01-AN-3367", fuelType: "diesel", litres: 1.5, amountRs: 316, stationName: "Indian Oil, Valluvar Kottam High Road, Chennai", date: "Feb 18, 2026", receiptImageUrl: "/images/receipts/receipt-4.png", submittedAt: "Feb 18, 2026 10:00 AM", status: "pending" },
  { id: "fb-5", driverId: "d8", driverName: "Tamilselvi Nadar", avatar: "TN", vehiclePlate: "TN-01-KL-2345", fuelType: "petrol", litres: 11.73, amountRs: 951, stationName: "Indian Oil, City Fuel Center", date: "Feb 17, 2026", receiptImageUrl: "/images/receipts/receipt-1.png", submittedAt: "Feb 17, 2026 06:00 PM", status: "pending" },
  { id: "fb-6", driverId: "d7", driverName: "Priya Dharshini", avatar: "PD", vehiclePlate: "TN-01-OP-1122", fuelType: "petrol", litres: 38.23, amountRs: 3623, stationName: "Chauhan Traders, G.T. Road", date: "Feb 16, 2026", receiptImageUrl: "/images/receipts/receipt-2.png", submittedAt: "Feb 16, 2026 07:00 PM", status: "pending" },
];

const seedPodApprovals: PODApproval[] = [
  { id: "pod-1", driverId: "d1", driverName: "Murugan Selvam", avatar: "MS", orderId: "ORD-2026-4501", customerName: "Lakshmi Narayanan", deliveryAddress: "12, G.N. Chetty Road, T. Nagar", photoUrl: "/images/pod/delivery-1.png", deliveredAt: "Feb 18, 2026 09:00 AM", submittedAt: "Feb 18, 2026 09:02 AM", status: "pending" },
  { id: "pod-2", driverId: "d2", driverName: "Kavitha Lakshmi", avatar: "KL", orderId: "ORD-2026-4502", customerName: "Ramesh Babu", deliveryAddress: "78, 2nd Avenue, Anna Nagar", photoUrl: "/images/pod/delivery-2.png", deliveredAt: "Feb 18, 2026 08:30 AM", submittedAt: "Feb 18, 2026 08:32 AM", status: "pending" },
  { id: "pod-3", driverId: "d5", driverName: "Arun Prasad", avatar: "AP", orderId: "ORD-2026-4503", customerName: "Selvi Murugan", deliveryAddress: "34, Gandhi Road, Velachery", photoUrl: "/images/pod/delivery-1.png", deliveredAt: "Feb 17, 2026 04:15 PM", submittedAt: "Feb 17, 2026 04:17 PM", status: "pending" },
  { id: "pod-4", driverId: "d9", driverName: "Raghavan Pillai", avatar: "RP", orderId: "ORD-2026-4504", customerName: "Anand Kumar", deliveryAddress: "56, SIDCO Industrial Estate, Guindy", photoUrl: "/images/pod/delivery-2.png", deliveredAt: "Feb 18, 2026 10:30 AM", submittedAt: "Feb 18, 2026 10:32 AM", status: "pending" },
  { id: "pod-5", driverId: "d3", driverName: "Senthil Kumaran", avatar: "SK", orderId: "ORD-2026-4505", customerName: "Priya Sundaram", deliveryAddress: "22, Besant Avenue, Adyar", photoUrl: "/images/pod/delivery-1.png", deliveredAt: "Feb 18, 2026 11:00 AM", submittedAt: "Feb 18, 2026 11:02 AM", status: "pending" },
  { id: "pod-6", driverId: "d8", driverName: "Tamilselvi Nadar", avatar: "TN", orderId: "ORD-2026-4506", customerName: "Vignesh Raman", deliveryAddress: "89, Railway Station Road, Tambaram", photoUrl: "/images/pod/delivery-2.png", deliveredAt: "Feb 17, 2026 03:45 PM", submittedAt: "Feb 17, 2026 03:47 PM", status: "pending" },
  { id: "pod-7", driverId: "d7", driverName: "Priya Dharshini", avatar: "PD", orderId: "ORD-2026-4507", customerName: "Ganesh Iyer", deliveryAddress: "15, Trunk Road, Porur", photoUrl: "/images/pod/delivery-1.png", deliveredAt: "Feb 18, 2026 09:45 AM", submittedAt: "Feb 18, 2026 09:47 AM", status: "pending" },
];

export class MemStorage implements IStorage {
  private kpis: KpiData;
  private drivers: Driver[];
  private fleet: FleetVehicle[];
  private notifications: Notification[];
  private leaveRequests: LeaveRequest[];
  private overtimeRequests: OvertimeRequest[];
  private fuelBills: FuelBill[];
  private podApprovals: PODApproval[];
  private autoCounter = 0;

  constructor() {
    this.kpis = { ...seedKpis };
    this.drivers = seedDrivers.map((d) => ({ ...d, deliveryPoints: d.deliveryPoints.map((p) => ({ ...p })) }));
    this.fleet = seedFleet.map((f) => ({ ...f, location: { ...f.location } }));
    this.notifications = seedNotifications.map((n) => ({ ...n }));
    this.leaveRequests = seedLeaveRequests.map((l) => ({ ...l }));
    this.overtimeRequests = seedOvertimeRequests.map((o) => ({ ...o }));
    this.fuelBills = seedFuelBills.map((f) => ({ ...f }));
    this.podApprovals = seedPodApprovals.map((p) => ({ ...p }));

    setTimeout(() => {
      this.autoCounter++;
      const notif = generateNotification(this.autoCounter);
      this.notifications.unshift(notif);
    }, 10 * 1000);

    setInterval(() => {
      this.autoCounter++;
      const notif = generateNotification(this.autoCounter);
      this.notifications.unshift(notif);
    }, 2 * 60 * 1000);
  }

  async getKpis(): Promise<KpiData> { return this.kpis; }
  async getDrivers(): Promise<Driver[]> { return this.drivers; }
  async getFleet(): Promise<FleetVehicle[]> { return this.fleet; }
  async getNotifications(): Promise<Notification[]> { return this.notifications; }

  async getMarkers(): Promise<MapMarker[]> {
    return this.fleet.map((v) => ({
      id: v.id, type: v.type, driverName: v.driverName,
      position: v.location, status: v.status,
    }));
  }

  // Run Python OR-Tools solver by spawning solver.py and passing JSON via stdin
  private executePythonSolver(
    locations: [number, number][],
    capacities: number[],
    demands: number[],
    timeWindows?: [number, number][],
    vehicleSpeedKmh?: number
  ) {
    return new Promise<any[]>((resolve, reject) => {
      const solverPath = path.join(process.cwd(), "solver.py");
      const py = spawn("python", [solverPath]);

      let out = "";
      let err = "";
      py.stdout.on("data", (d) => (out += d.toString()));
      py.stderr.on("data", (d) => (err += d.toString()));

      py.on("error", (e) => reject(new Error(`Failed to start python: ${e.message}`)));
      py.on("close", (code) => {
        if (code !== 0) return reject(new Error(`Solver exited ${code}: ${err}`));
        try {
          const parsed = JSON.parse(out);
          resolve(parsed);
        } catch (e: any) {
          reject(new Error(`Invalid JSON from solver: ${e.message} - ${out.slice(0,200)}`));
        }
      });

      const payload: any = { locations, num_vehicles: 1, capacities, demands };
      if (timeWindows) payload.time_windows = timeWindows;
      if (vehicleSpeedKmh) payload.vehicle_speed_kmh = vehicleSpeedKmh;
      py.stdin.write(JSON.stringify(payload));
      py.stdin.end();
    });
  }

  private calculateTravelTimeMin(fromLat: number, fromLng: number, toLat: number, toLng: number, vehicleType: string) {
    const distKm = haversineKm(fromLat, fromLng, toLat, toLng);
    const speed = vehicleType === "bike" ? 20 : 30; // km/h
    return Math.round((distKm / speed) * 60);
  }

  private offsetTime(timeStr: string, minutesToAdd: number) {
    try {
      const parts = timeStr.trim().split(/\s+/);
      if (parts.length < 2) return timeStr;
      const time = parts[0];
      const ampm = parts[1].toUpperCase();
      let [h, m] = time.split(":").map((x) => parseInt(x, 10));
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      const dt = new Date();
      dt.setHours(h, m + minutesToAdd);
      return dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch (e) {
      return timeStr;
    }
  }
  

  async acknowledgeNotification(id: string): Promise<Notification | null> {
    const notification = this.notifications.find((n) => n.id === id);
    if (!notification) return null;
    notification.acknowledged = true;
    return notification;
  }

  async reassignDriver(driverId: string): Promise<{ driver: Driver; vehicle: FleetVehicle } | null> {
    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) return null;
    const vehicle = this.fleet.find((v) => v.driverId === driverId);
    const homeArea = getAreaInfo(driver.homeLocality);
    const currentAreaName = driver.currentRoute.replace(" Area", "");
    const nearbyOptions = [driver.homeLocality, ...homeArea.nearby].filter((a) => a !== currentAreaName);
    const selectedName = nearbyOptions[Math.floor(Math.random() * nearbyOptions.length)];
    const selectedArea = getAreaInfo(selectedName);
    const drops = Math.floor(Math.random() * 8) + 8;
    driver.currentRoute = `${selectedArea.name} Area`;
    driver.dropsCompleted = 0;
    driver.dropsTotal = drops;
    driver.status = "active";
    if (vehicle) {
      vehicle.currentArea = selectedArea.name;
      vehicle.location = { lat: selectedArea.lat, lng: selectedArea.lng };
      vehicle.status = "en-route";
    }
    return { driver, vehicle: vehicle ?? this.fleet[0] };
  }

  async transferDeliveryPoint(
    fromDriverId: string, toDriverId: string, pointId: string, insertIndex: number
  ): Promise<{ fromDriver: Driver; toDriver: Driver } | null> {
    const fromDriver = this.drivers.find((d) => d.id === fromDriverId);
    const toDriver = this.drivers.find((d) => d.id === toDriverId);
    if (!fromDriver || !toDriver) return null;
    const pointIndex = fromDriver.deliveryPoints.findIndex((p) => p.id === pointId);
    if (pointIndex === -1) return null;
    const [point] = fromDriver.deliveryPoints.splice(pointIndex, 1);
    toDriver.deliveryPoints.splice(insertIndex, 0, point);
    fromDriver.dropsTotal = fromDriver.deliveryPoints.length;
    fromDriver.dropsCompleted = fromDriver.deliveryPoints.filter((p) => p.status === "completed").length;
    toDriver.dropsTotal = toDriver.deliveryPoints.length;
    toDriver.dropsCompleted = toDriver.deliveryPoints.filter((p) => p.status === "completed").length;
    return { fromDriver, toDriver };
  }

  async findUrgentDriverCandidates(input: UrgentOrderInput): Promise<DriverCandidate[]> {
    const STOP_TIME = 10; // minutes per stop
    const candidates: DriverCandidate[] = [];

    for (const driver of this.drivers) {
      if (driver.status === "offline") continue;
      const vehicle = this.fleet.find((v) => v.driverId === driver.id);
      if (!vehicle || vehicle.status === "maintenance") continue;

      const remainingCapacity = driver.vehicleCapacityKg - driver.currentLoadKg;
      if (remainingCapacity < input.packageWeightKg) continue;

      // Build locations: [driverPos, warehouse, ...existingStops, urgentDelivery]
      const deliveryPoints = driver.deliveryPoints || [];
      const urgentPoint: typeof deliveryPoints[0] = {
        id: `urgent-temp-${Date.now()}`,
        address: input.deliveryAddress,
        lat: input.deliveryLat,
        lng: input.deliveryLng,
        status: "pending" as const,
        estimatedTime: input.requiredDeliveryTime,
        deliveryWindow: "URGENT",
      };
      const allPoints = [...deliveryPoints, urgentPoint];
      const locations: [number, number][] = [
        [vehicle.location.lat, vehicle.location.lng],
        [input.warehouseLat, input.warehouseLng],
        ...allPoints.map((p) => [p.lat, p.lng] as [number, number]),
      ];

      const capacities = [Math.max(0, Math.floor(remainingCapacity))];
      const demands = [0, 0, ...allPoints.map(() => 10)];

      // Compute time windows (minutes since shift start)
      const parseTimeToMinutes = (ts: string) => {
        const m = ts.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!m) return 0;
        let hh = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const ampm = m[3].toUpperCase();
        if (ampm === 'PM' && hh !== 12) hh += 12;
        if (ampm === 'AM' && hh === 12) hh = 0;
        return hh * 60 + mm;
      };

      const shiftStartMin = parseTimeToMinutes(driver.shiftStart || '08:00 AM');
      const horizon = Math.ceil((driver.maxHoursPerDay || 9) * 60);

      const deliveryDeadlineAbs = parseTimeToMinutes(input.requiredDeliveryTime);
      let deadlineFromShift = deliveryDeadlineAbs - shiftStartMin;
      if (deadlineFromShift < 0) deadlineFromShift += 24 * 60; // roll to next day if needed

      const timeWindows: [number, number][] = [];
      timeWindows.push([0, horizon]); // driver start
      timeWindows.push([0, horizon]); // warehouse
      const urgentNodeIdx = allPoints.findIndex((p) => p.id === urgentPoint.id) + 2; // +2 for [driver, warehouse]
      for (let i = 0; i < allPoints.length; i++) {
        if (i + 2 === urgentNodeIdx) {
          timeWindows.push([0, Math.max(0, deadlineFromShift)]); // urgent must arrive before deadline
        } else {
          timeWindows.push([0, horizon]);
        }
      }

      try {
        // vehicle speed for solver (km/h)
        const vehicleSpeed = driver.vehicleType === 'bike' ? 20 : 30;
        const result = await this.executePythonSolver(locations, capacities, demands, timeWindows, vehicleSpeed);
        const route = (result && result[0] && result[0].route_indices) || [];
        const arrivalMinutes: number[] = (result && result[0] && result[0].arrival_minutes) || [];

        // Verify urgent node is in the feasible route
        const urgentDeliveryIdx = allPoints.findIndex((p) => p.id === urgentPoint.id);
        if (route.length === 0 || !route.includes(urgentDeliveryIdx)) {
          console.warn(`Solver excluded urgent order for driver ${driver.id} (deadline infeasible)`);
          continue;
        }

        // Find arrival time of urgent delivery
        const urgentRoutePos = route.indexOf(urgentDeliveryIdx);
        const urgentArrivalMin = arrivalMinutes[urgentRoutePos] ?? 0;
        const totalDurationMin = (arrivalMinutes[arrivalMinutes.length - 1] ?? 0) + STOP_TIME;

        const willExceed = (driver.hoursWorkedToday + totalDurationMin / 60) > driver.maxHoursPerDay;
        const newEta = willExceed ? "⚠️ SHIFT OVERFLOW" : this.offsetTime(driver.shiftStart, urgentArrivalMin);

        const distToWarehouse = haversineKm(vehicle.location.lat, vehicle.location.lng, input.warehouseLat, input.warehouseLng);

        candidates.push({
          driverId: driver.id,
          driverName: driver.name,
          avatar: driver.avatar,
          vehicleType: driver.vehicleType,
          licensePlate: vehicle.licensePlate,
          distanceToWarehouseKm: Math.round(distToWarehouse * 10) / 10,
          remainingCapacityKg: remainingCapacity,
          remainingHours: Math.round((driver.maxHoursPerDay - driver.hoursWorkedToday) * 10) / 10,
          currentStopsCount: deliveryPoints.filter((p) => p.status !== "completed").length,
          rating: driver.rating,
          estimatedPickupMin: this.calculateTravelTimeMin(vehicle.location.lat, vehicle.location.lng, input.warehouseLat, input.warehouseLng, driver.vehicleType),
          estimatedDeliveryMin: Math.round(urgentArrivalMin),
          oldEta: deliveryPoints.length ? deliveryPoints[deliveryPoints.length - 1].estimatedTime : driver.shiftEnd,
          newEta,
          currentArea: vehicle.currentArea,
          status: driver.status,
        });
      } catch (e: any) {
        // solver failed for this driver; skip
        console.warn(`Solver failed for driver ${driver.id}: ${e.message}`);
        continue;
      }
    }

    return candidates.filter((c) => c.newEta !== "⚠️ SHIFT OVERFLOW").sort((a, b) => a.estimatedDeliveryMin - b.estimatedDeliveryMin).slice(0, 3);
  }

  async assignUrgentOrder(driverId: string, input: UrgentOrderInput): Promise<Driver | null> {
    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) return null;

    const vehicle = this.fleet.find((v) => v.driverId === driverId);
    if (!vehicle) return null;

    // Create new urgent delivery point (pending)
    const newPoint = {
      id: `dp-urgent-${Date.now()}`,
      address: input.deliveryAddress,
      lat: input.deliveryLat,
      lng: input.deliveryLng,
      status: "pending" as const,
      estimatedTime: input.requiredDeliveryTime,
      deliveryWindow: "URGENT",
    };

    // Prepare solver input: driver pos + warehouse + all deliveries (existing + urgent)
    const existing = driver.deliveryPoints || [];
    const allPoints = [...existing, newPoint];
    const locations: [number, number][] = [
      [vehicle.location.lat, vehicle.location.lng],
      [input.warehouseLat, input.warehouseLng],
      ...allPoints.map((p) => [p.lat, p.lng] as [number, number]),
    ];

    const capacities = [Math.max(0, Math.floor(driver.vehicleCapacityKg - driver.currentLoadKg))];
    const demands = [0, 0, ...allPoints.map(() => 10)];

    try {
      // Compute time windows: urgent deadline relative to shift start
      const parseTimeToMinutes = (ts: string) => {
        const m = ts.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!m) return 0;
        let hh = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const ampm = m[3].toUpperCase();
        if (ampm === 'PM' && hh !== 12) hh += 12;
        if (ampm === 'AM' && hh === 12) hh = 0;
        return hh * 60 + mm;
      };
      const shiftStartMin = parseTimeToMinutes(driver.shiftStart || '08:00 AM');
      const horizon = Math.ceil((driver.maxHoursPerDay || 9) * 60);
      const deliveryDeadlineAbs = parseTimeToMinutes(input.requiredDeliveryTime);
      let deadlineFromShift = deliveryDeadlineAbs - shiftStartMin;
      if (deadlineFromShift < 0) deadlineFromShift += 24 * 60;

      // Build time windows: [driverStart, warehouse, ...allPoints with urgent having deadline]
      const timeWindows: [number, number][] = [];
      timeWindows.push([0, horizon]); // node 0: driver current position
      timeWindows.push([0, horizon]); // node 1: warehouse
      const urgentNodeIndex = allPoints.findIndex((p) => p.id === newPoint.id) + 2; // +2 because [driver, warehouse]
      for (let i = 0; i < allPoints.length; i++) {
        if (i + 2 === urgentNodeIndex) {
          // This is the urgent node: must arrive BEFORE deadline
          timeWindows.push([0, Math.max(0, deadlineFromShift)]);
        } else {
          timeWindows.push([0, horizon]);
        }
      }

      const vehicleSpeed = driver.vehicleType === 'bike' ? 20 : 30;
      const result = await this.executePythonSolver(locations, capacities, demands, timeWindows, vehicleSpeed);
      const route = (result && result[0] && result[0].route_indices) || [];
      const arrivalMinutes: number[] = (result && result[0] && result[0].arrival_minutes) || [];

      // Validate solver found a feasible solution (urgent node must be in route)
      const urgentInRoute = route.includes(allPoints.findIndex((p) => p.id === newPoint.id));
      if (route.length === 0 || !urgentInRoute) {
        throw new Error('Solver could not find feasible route respecting deadline constraints');
      }

      // Reorder allPoints according to solver indices
      const reordered: typeof allPoints = [];
      for (let i = 0; i < route.length; i++) {
        const idx = route[i];
        if (idx >= 0 && idx < allPoints.length) {
          const point = { ...allPoints[idx] };
          // Set estimatedTime from solver's arrival minutes (cumulative time from start)
          const arrivalMin = arrivalMinutes[i] ?? 0;
          point.estimatedTime = this.offsetTime(driver.shiftStart, arrivalMin);
          reordered.push(point);
        }
      }

      // Apply reordered route
      driver.deliveryPoints = reordered;

      // Update stats
      driver.dropsTotal = driver.deliveryPoints.length;
      driver.currentLoadKg += input.packageWeightKg;
      if (driver.status === "idle") driver.status = "active";
      if (vehicle.status === "idle") vehicle.status = "en-route";

      // Determine totalMin from solver arrival minutes (arrival of last + stop time)
      let totalMin = 0;
      if (arrivalMinutes.length) {
        totalMin = arrivalMinutes[arrivalMinutes.length - 1] + 10; // include last stop time
      }

      const newHoursWorked = driver.hoursWorkedToday + totalMin / 60;
      if (newHoursWorked > driver.maxHoursPerDay) {
        const extraHours = Math.ceil(newHoursWorked - driver.maxHoursPerDay);
        const otId = `ot-${Date.now()}`;
        this.overtimeRequests.push({
          id: otId,
          driverId: driver.id,
          driverName: driver.name,
          avatar: driver.avatar,
          date: new Date().toLocaleDateString(),
          scheduledEnd: driver.shiftEnd,
          requestedEnd: this.offsetTime(driver.shiftEnd, extraHours * 60),
          extraHours,
          reason: `Auto OT: urgent assignment to ${input.deliveryAddress}`,
          submittedAt: new Date().toISOString(),
          status: "pending",
        });

        this.notifications.unshift({
          id: `n-ot-${Date.now()}`,
          type: "overtime-alert",
          severity: "high",
          driverName: driver.name,
          message: `Optimized urgent route exceeds shift by ${extraHours}h for ${driver.name}. OT requested.`,
          timestamp: "Just now",
          acknowledged: false,
        });
      }

      return driver;
    } catch (e: any) {
      console.error("Solver assign failed:", e.message);
      throw e;
    }
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> { return this.leaveRequests; }
  async updateLeaveStatus(id: string, status: "approved" | "rejected"): Promise<LeaveRequest | null> {
    const req = this.leaveRequests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    return req;
  }

  async getOvertimeRequests(): Promise<OvertimeRequest[]> { return this.overtimeRequests; }
  async updateOvertimeStatus(id: string, status: "approved" | "rejected"): Promise<OvertimeRequest | null> {
    const req = this.overtimeRequests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    return req;
  }

  async getFuelBills(): Promise<FuelBill[]> { return this.fuelBills; }
  async updateFuelBillStatus(id: string, status: "approved" | "rejected"): Promise<FuelBill | null> {
    const bill = this.fuelBills.find((b) => b.id === id);
    if (!bill) return null;
    bill.status = status;
    return bill;
  }

  async getPodApprovals(): Promise<PODApproval[]> { return this.podApprovals; }
  async updatePodStatus(id: string, status: "approved" | "rejected"): Promise<PODApproval | null> {
    const pod = this.podApprovals.find((p) => p.id === id);
    if (!pod) return null;
    pod.status = status;
    return pod;
  }
}

export const storage = new MemStorage();

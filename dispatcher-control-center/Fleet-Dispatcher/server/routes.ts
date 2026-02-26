// // // import { runGoogleOptimization } from "./lib/optimizer";
// // // import { storage } from "./storage";
// // // import type { Express } from "express";
// // // import { type Server } from "http";
// // // import { z } from "zod";
// // // import { urgentOrderInputSchema } from "@shared/schema";

// // // export async function registerRoutes(
// // //   httpServer: Server,
// // //   app: Express
// // // ): Promise<Server> {
  
// // //   // --- Dashboard & Fleet Endpoints ---

// // //   app.get("/api/kpis", async (_req, res) => {
// // //     const kpis = await storage.getKpis();
// // //     res.json(kpis);
// // //   });

// // //   app.get("/api/drivers", async (_req, res) => {
// // //     const drivers = await storage.getDrivers();
// // //     res.json(drivers);
// // //   });

// // //   app.get("/api/fleet", async (_req, res) => {
// // //     const fleet = await storage.getFleet();
// // //     res.json(fleet);
// // //   });

// // //   app.get("/api/notifications", async (_req, res) => {
// // //     const notifications = await storage.getNotifications();
// // //     res.json(notifications);
// // //   });

// // //   app.get("/api/markers", async (_req, res) => {
// // //     const markers = await storage.getMarkers();
// // //     res.json(markers);
// // //   });

// // //   // --- AI Optimization Endpoints ---

// // //   /**
// // //    * GLOBAL OPTIMIZATION:
// // //    * Pulls all drivers and their current pending delivery points, 
// // //    * sends them to Google AI, and returns the optimized "Master Plan".
// // //    */
// // //   app.post("/api/optimize-all", async (_req, res) => {
// // //     try {
// // //       const allDrivers = await storage.getDrivers();
      
// // //       // Flatten all pending delivery points from all drivers into one list for Google
// // //       // We map your schema fields to what the optimizer expects
// // //       const allPendingPoints = allDrivers.flatMap(driver => 
// // //         (driver.deliveryPoints || [])
// // //           .filter(p => p.status === "pending")
// // //           .map(p => ({
// // //             id: p.id,
// // //             address: p.address,
// // //             lat: p.lat,
// // //             lng: p.lng,
// // //             weight: 10 // Default weight as it's not in the base schema
// // //           }))
// // //       );

// // //       if (allPendingPoints.length === 0) {
// // //         return res.status(400).json({ error: "No pending deliveries to optimize" });
// // //       }

// // //       const optimizationResult = await runGoogleOptimization(allDrivers, allPendingPoints);
// // //       res.json(optimizationResult);
// // //     } catch (error: any) {
// // //       console.error("Global AI Optimization failed:", error.message);
// // //       res.status(500).json({ error: error.message });
// // //     }
// // //   });

// // //   /**
// // //    * URGENT ORDER MATCHING:
// // //    * Finds the best driver for a single new urgent order
// // //    * Returns: Array of DriverCandidate ranked by suitability
// // //    */
// // //   app.post("/api/urgent-order/find-drivers", async (req, res) => {
// // //     try {
// // //       const allDrivers = await storage.getDrivers();
// // //       const newOrder = req.body;

// // //       if (!newOrder.deliveryLat || !newOrder.deliveryLng) {
// // //         return res.status(400).json({ error: "Delivery location required" });
// // //       }

// // //       // Convert drivers to DriverCandidate format
// // //       const candidates = allDrivers.map((driver: any) => {
// // //         // Calculate distance from warehouse to delivery point (simplified)
// // //         const warehouseLat = newOrder.warehouseLat || 13.0827;
// // //         const warehouseLng = newOrder.warehouseLng || 80.2707;
        
// // //         const lat1 = warehouseLat * Math.PI / 180;
// // //         const lat2 = newOrder.deliveryLat * Math.PI / 180;
// // //         const deltaLat = (newOrder.deliveryLat - warehouseLat) * Math.PI / 180;
// // //         const deltaLng = (newOrder.deliveryLng - warehouseLng) * Math.PI / 180;
        
// // //         const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
// // //                   Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
// // //         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// // //         const distanceKm = 6371 * c;

// // //         const currentLoad = (driver.currentLoadKg || 0);
// // //         const capacity = (driver.vehicleCapacityKg || 100);
// // //         const remainingCapacity = capacity - currentLoad;
        
// // //         const pendingDeliveries = (driver.deliveryPoints || []).filter((p: any) => p.status === "pending").length;
// // //         const maxCapacityPerDay = 20;
// // //         const remainingCapacity_stops = maxCapacityPerDay - pendingDeliveries;

// // //         const shiftHours = 9;
// // //         const hoursWorked = driver.hoursWorkedToday || 0;
// // //         const remainingHours = Math.max(0, shiftHours - hoursWorked);

// // //         const estimatedPickupMin = Math.round(distanceKm / 40 * 60) + 5; // 40 km/h speed + 5 min buffer
// // //         const estimatedDeliveryMin = estimatedPickupMin + 15; // Add 15 min for delivery

// // //         return {
// // //           driverId: driver.id,
// // //           driverName: driver.name,
// // //           avatar: driver.avatar || "?",
// // //           vehicleType: driver.vehicleType || "van",
// // //           licensePlate: `TN-${driver.id}`,
// // //           distanceToWarehouseKm: Math.round(distanceKm * 10) / 10,
// // //           remainingCapacityKg: Math.max(0, remainingCapacity),
// // //           remainingHours: remainingHours,
// // //           currentStopsCount: pendingDeliveries,
// // //           rating: driver.rating || 4.0,
// // //           estimatedPickupMin: estimatedPickupMin,
// // //           estimatedDeliveryMin: estimatedDeliveryMin,
// // //           oldEta: new Date(Date.now() + estimatedPickupMin * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
// // //           newEta: new Date(Date.now() + estimatedDeliveryMin * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
// // //           currentArea: driver.homeLocality || "Chennai",
// // //           status: driver.status || "active",
// // //         };
// // //       });

// // //       // Sort by suitability: active drivers first, then by remaining capacity & rating
// // //       const sorted = candidates
// // //         .filter((c: any) => c.status === "active" && c.remainingHours > 0)
// // //         .sort((a: any, b: any) => {
// // //           const aScore = a.remainingCapacityKg * 0.4 + a.rating * 10 + a.remainingHours * 5;
// // //           const bScore = b.remainingCapacityKg * 0.4 + b.rating * 10 + b.remainingHours * 5;
// // //           return bScore - aScore;
// // //         })
// // //         .slice(0, 5); // Return top 5 candidates

// // //       res.json(sorted);
// // //     } catch (error: any) {
// // //       console.error("Urgent Order AI Optimization failed:", error.message);
// // //       res.status(500).json({ error: error.message });
// // //     }
// // //   });

// // //   // --- Operational Actions ---

// // //   app.post("/api/notifications/:id/acknowledge", async (req, res) => {
// // //     const { id } = req.params;
// // //     const updated = await storage.acknowledgeNotification(id);
// // //     if (!updated) {
// // //       return res.status(404).json({ error: "Notification not found" });
// // //     }
// // //     res.json(updated);
// // //   });

// // //   app.post("/api/drivers/:id/reassign", async (req, res) => {
// // //     const { id } = req.params;
// // //     const result = await storage.reassignDriver(id);
// // //     if (!result) {
// // //       return res.status(404).json({ error: "Driver not found" });
// // //     }
// // //     res.json(result);
// // //   });

// // //   const transferSchema = z.object({
// // //     fromDriverId: z.string(),
// // //     toDriverId: z.string(),
// // //     pointId: z.string(),
// // //     insertIndex: z.number().int().min(0),
// // //   });

// // //   app.post("/api/delivery-points/transfer", async (req, res) => {
// // //     const parsed = transferSchema.safeParse(req.body);
// // //     if (!parsed.success) {
// // //       return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
// // //     }
// // //     const { fromDriverId, toDriverId, pointId, insertIndex } = parsed.data;
// // //     const result = await storage.transferDeliveryPoint(fromDriverId, toDriverId, pointId, insertIndex);
// // //     if (!result) {
// // //       return res.status(404).json({ error: "Driver or delivery point not found" });
// // //     }
// // //     res.json(result);
// // //   });

// // //   const assignSchema = z.object({
// // //     driverId: z.string(),
// // //     order: urgentOrderInputSchema,
// // //   });

// // //   app.post("/api/urgent-order/assign", async (req, res) => {
// // //     const parsed = assignSchema.safeParse(req.body);
// // //     if (!parsed.success) {
// // //       return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
// // //     }
// // //     const driver = await storage.assignUrgentOrder(parsed.data.driverId, parsed.data.order);
// // //     if (!driver) {
// // //       return res.status(404).json({ error: "Driver not found" });
// // //     }
// // //     res.json(driver);
// // //   });

// // //   // --- Admin Approval Center Endpoints ---

// // //   app.get("/api/approvals/leave", async (_req, res) => {
// // //     const requests = await storage.getLeaveRequests();
// // //     res.json(requests);
// // //   });

// // //   app.post("/api/approvals/leave/:id", async (req, res) => {
// // //     const { id } = req.params;
// // //     const { status } = req.body;
// // //     if (status !== "approved" && status !== "rejected") {
// // //       return res.status(400).json({ error: "Status must be approved or rejected" });
// // //     }
// // //     const result = await storage.updateLeaveStatus(id, status);
// // //     if (!result) return res.status(404).json({ error: "Leave request not found" });
// // //     res.json(result);
// // //   });

// // //   app.get("/api/approvals/overtime", async (_req, res) => {
// // //     const requests = await storage.getOvertimeRequests();
// // //     res.json(requests);
// // //   });

// // //   app.post("/api/approvals/overtime/:id", async (req, res) => {
// // //     const { id } = req.params;
// // //     const { status } = req.body;
// // //     if (status !== "approved" && status !== "rejected") {
// // //       return res.status(400).json({ error: "Status must be approved or rejected" });
// // //     }
// // //     const result = await storage.updateOvertimeStatus(id, status);
// // //     if (!result) return res.status(404).json({ error: "Overtime request not found" });
// // //     res.json(result);
// // //   });

// // //   app.get("/api/approvals/fuel", async (_req, res) => {
// // //     const bills = await storage.getFuelBills();
// // //     res.json(bills);
// // //   });

// // //   app.post("/api/approvals/fuel/:id", async (req, res) => {
// // //     const { id } = req.params;
// // //     const { status } = req.body;
// // //     if (status !== "approved" && status !== "rejected") {
// // //       return res.status(400).json({ error: "Status must be approved or rejected" });
// // //     }
// // //     const result = await storage.updateFuelBillStatus(id, status);
// // //     if (!result) return res.status(404).json({ error: "Fuel bill not found" });
// // //     res.json(result);
// // //   });

// // //   app.get("/api/approvals/pod", async (_req, res) => {
// // //     const pods = await storage.getPodApprovals();
// // //     res.json(pods);
// // //   });

// // //   app.post("/api/approvals/pod/:id", async (req, res) => {
// // //     const { id } = req.params;
// // //     const { status } = req.body;
// // //     if (status !== "approved" && status !== "rejected") {
// // //       return res.status(400).json({ error: "Status must be approved or rejected" });
// // //     }
// // //     const result = await storage.updatePodStatus(id, status);
// // //     if (!result) return res.status(404).json({ error: "POD not found" });
// // //     res.json(result);
// // //   });

// // //   return httpServer;
// // // }

// // import { runLocalOptimization } from "./lib/optimizer";
// // import { storage } from "./storage";
// // import type { Express } from "express";
// // import { type Server } from "http";
// // import { z } from "zod";
// // import { urgentOrderInputSchema } from "@shared/schema";

// // export async function registerRoutes(
// //   httpServer: Server,
// //   app: Express
// // ): Promise<Server> {
  
// //   // --- Dashboard & Fleet Endpoints ---

// //   app.get("/api/kpis", async (_req, res) => {
// //     const kpis = await storage.getKpis();
// //     res.json(kpis);
// //   });

// //   app.get("/api/drivers", async (_req, res) => {
// //     const drivers = await storage.getDrivers();
// //     res.json(drivers);
// //   });

// //   app.get("/api/fleet", async (_req, res) => {
// //     const fleet = await storage.getFleet();
// //     res.json(fleet);
// //   });

// //   app.get("/api/notifications", async (_req, res) => {
// //     const notifications = await storage.getNotifications();
// //     res.json(notifications);
// //   });

// //   app.get("/api/markers", async (_req, res) => {
// //     const markers = await storage.getMarkers();
// //     res.json(markers);
// //   });

// //   // --- AI Optimization Endpoints ---

// //   /**
// //    * GLOBAL OPTIMIZATION (Local Python Sidecar):
// //    * Pulls all drivers and their current pending delivery points, 
// //    * sends them to Python OR-Tools, and returns the optimized "Master Plan".
// //    */
// //   app.post("/api/optimize-all", async (_req, res) => {
// //     try {
// //       const allDrivers = await storage.getDrivers();
// //       const allFleet = await storage.getFleet();
      
// //       // 1. Collect all pending delivery points from all drivers
// //       const pendingPoints = allDrivers.flatMap(driver => 
// //         (driver.deliveryPoints || [])
// //           .filter(p => p.status === "pending")
// //       );

// //       if (pendingPoints.length === 0) {
// //         return res.status(400).json({ error: "No pending deliveries to optimize" });
// //       }

// //       // 2. Prepare data for the Python AI Solver
// //       const solverInput = {
// //         num_vehicles: allDrivers.length,
// //         locations: [
// //           // Driver current coordinates (Start positions)
// //           ...allDrivers.map(d => {
// //             const v = allFleet.find(f => f.driverId === d.id);
// //             return [v?.location.lat || 13.0827, v?.location.lng || 80.2707];
// //           }),
// //           // Delivery point coordinates
// //           ...pendingPoints.map(p => [p.lat, p.lng])
// //         ],
// //         // Calculation: Vehicle Max Capacity minus current Load
// //         capacities: allDrivers.map(d => (d.vehicleCapacityKg || 100) - (d.currentLoadKg || 0)),
// //         demands: pendingPoints.map(() => 10) // 10kg standard weight per parcel
// //       };

// //       // 3. Call our Python Sidecar
// //       const aiResult = await runLocalOptimization(solverInput);

// //       // 4. Transform AI result indices back into descriptive driver/route objects
// //       const optimizedPlan = aiResult.map((res: any) => ({
// //         driverId: allDrivers[res.vehicle_index].id,
// //         driverName: allDrivers[res.vehicle_index].name,
// //         // Match the indices back to the actual pendingPoints objects
// //         newRoute: res.route_indices.map((idx: number) => pendingPoints[idx])
// //       }));

// //       res.json(optimizedPlan);
// //     } catch (error: any) {
// //       console.error("Global AI Optimization failed:", error.message);
// //       res.status(500).json({ error: error.message });
// //     }
// //   });

// //   /**
// //    * URGENT ORDER MATCHING:
// //    * Finds the best driver for a single new urgent order
// //    */
// //   app.post("/api/urgent-order/find-drivers", async (req, res) => {
// //     try {
// //       const allDrivers = await storage.getDrivers();
// //       const newOrder = req.body;

// //       if (!newOrder.deliveryLat || !newOrder.deliveryLng) {
// //         return res.status(400).json({ error: "Delivery location required" });
// //       }

// //       const candidates = allDrivers.map((driver: any) => {
// //         const warehouseLat = newOrder.warehouseLat || 13.0827;
// //         const warehouseLng = newOrder.warehouseLng || 80.2707;
        
// //         // Haversine calculation for ranking suitability
// //         const lat1 = warehouseLat * Math.PI / 180;
// //         const lat2 = newOrder.deliveryLat * Math.PI / 180;
// //         const deltaLat = (newOrder.deliveryLat - warehouseLat) * Math.PI / 180;
// //         const deltaLng = (newOrder.deliveryLng - warehouseLng) * Math.PI / 180;
        
// //         const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
// //                   Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
// //         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// //         const distanceKm = 6371 * c;

// //         const currentLoad = (driver.currentLoadKg || 0);
// //         const capacity = (driver.vehicleCapacityKg || 100);
// //         const remainingCapacity = capacity - currentLoad;
        
// //         const pendingDeliveries = (driver.deliveryPoints || []).filter((p: any) => p.status === "pending").length;
// //         const remainingHours = Math.max(0, 9 - (driver.hoursWorkedToday || 0));

// //         const estimatedPickupMin = Math.round(distanceKm / 40 * 60) + 5;
// //         const estimatedDeliveryMin = estimatedPickupMin + 15;

// //         return {
// //           driverId: driver.id,
// //           driverName: driver.name,
// //           avatar: driver.avatar || "?",
// //           vehicleType: driver.vehicleType || "van",
// //           licensePlate: `TN-${driver.id}`,
// //           distanceToWarehouseKm: Math.round(distanceKm * 10) / 10,
// //           remainingCapacityKg: Math.max(0, remainingCapacity),
// //           remainingHours: remainingHours,
// //           currentStopsCount: pendingDeliveries,
// //           rating: driver.rating || 4.0,
// //           estimatedPickupMin: estimatedPickupMin,
// //           estimatedDeliveryMin: estimatedDeliveryMin,
// //           oldEta: new Date(Date.now() + estimatedPickupMin * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
// //           newEta: new Date(Date.now() + estimatedDeliveryMin * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
// //           currentArea: driver.homeLocality || "Chennai",
// //           status: driver.status || "active",
// //         };
// //       });

// //       const sorted = candidates
// //         .filter((c: any) => c.status === "active" && c.remainingHours > 0)
// //         .sort((a: any, b: any) => {
// //           const aScore = a.remainingCapacityKg * 0.4 + a.rating * 10 + a.remainingHours * 5;
// //           const bScore = b.remainingCapacityKg * 0.4 + b.rating * 10 + b.remainingHours * 5;
// //           return bScore - aScore;
// //         })
// //         .slice(0, 5);

// //       res.json(sorted);
// //     } catch (error: any) {
// //       console.error("Urgent Order AI Optimization failed:", error.message);
// //       res.status(500).json({ error: error.message });
// //     }
// //   });

// //   // --- Operational Actions ---

// //   app.post("/api/notifications/:id/acknowledge", async (req, res) => {
// //     const { id } = req.params;
// //     const updated = await storage.acknowledgeNotification(id);
// //     if (!updated) {
// //       return res.status(404).json({ error: "Notification not found" });
// //     }
// //     res.json(updated);
// //   });

// //   app.post("/api/drivers/:id/reassign", async (req, res) => {
// //     const { id } = req.params;
// //     const result = await storage.reassignDriver(id);
// //     if (!result) {
// //       return res.status(404).json({ error: "Driver not found" });
// //     }
// //     res.json(result);
// //   });

// //   const transferSchema = z.object({
// //     fromDriverId: z.string(),
// //     toDriverId: z.string(),
// //     pointId: z.string(),
// //     insertIndex: z.number().int().min(0),
// //   });

// //   app.post("/api/delivery-points/transfer", async (req, res) => {
// //     const parsed = transferSchema.safeParse(req.body);
// //     if (!parsed.success) {
// //       return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
// //     }
// //     const { fromDriverId, toDriverId, pointId, insertIndex } = parsed.data;
// //     const result = await storage.transferDeliveryPoint(fromDriverId, toDriverId, pointId, insertIndex);
// //     if (!result) {
// //       return res.status(404).json({ error: "Driver or delivery point not found" });
// //     }
// //     res.json(result);
// //   });

// //   const assignSchema = z.object({
// //     driverId: z.string(),
// //     order: urgentOrderInputSchema,
// //   });

// //   app.post("/api/urgent-order/assign", async (req, res) => {
// //     const parsed = assignSchema.safeParse(req.body);
// //     if (!parsed.success) {
// //       return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
// //     }
// //     const driver = await storage.assignUrgentOrder(parsed.data.driverId, parsed.data.order);
// //     if (!driver) {
// //       return res.status(404).json({ error: "Driver not found" });
// //     }
// //     res.json(driver);
// //   });

// //   // --- Admin Approval Center Endpoints ---

// //   app.get("/api/approvals/leave", async (_req, res) => {
// //     const requests = await storage.getLeaveRequests();
// //     res.json(requests);
// //   });

// //   app.post("/api/approvals/leave/:id", async (req, res) => {
// //     const { id } = req.params;
// //     const { status } = req.body;
// //     if (status !== "approved" && status !== "rejected") {
// //       return res.status(400).json({ error: "Status must be approved or rejected" });
// //     }
// //     const result = await storage.updateLeaveStatus(id, status);
// //     if (!result) return res.status(404).json({ error: "Leave request not found" });
// //     res.json(result);
// //   });

// //   app.get("/api/approvals/overtime", async (_req, res) => {
// //     const requests = await storage.getOvertimeRequests();
// //     res.json(requests);
// //   });

// //   app.post("/api/approvals/overtime/:id", async (req, res) => {
// //     const { id } = req.params;
// //     const { status } = req.body;
// //     if (status !== "approved" && status !== "rejected") {
// //       return res.status(400).json({ error: "Status must be approved or rejected" });
// //     }
// //     const result = await storage.updateOvertimeStatus(id, status);
// //     if (!result) return res.status(404).json({ error: "Overtime request not found" });
// //     res.json(result);
// //   });

// //   app.get("/api/approvals/fuel", async (_req, res) => {
// //     const bills = await storage.getFuelBills();
// //     res.json(bills);
// //   });

// //   app.post("/api/approvals/fuel/:id", async (req, res) => {
// //     const { id } = req.params;
// //     const { status } = req.body;
// //     if (status !== "approved" && status !== "rejected") {
// //       return res.status(400).json({ error: "Status must be approved or rejected" });
// //     }
// //     const result = await storage.updateFuelBillStatus(id, status);
// //     if (!result) return res.status(404).json({ error: "Fuel bill not found" });
// //     res.json(result);
// //   });

// //   app.get("/api/approvals/pod", async (_req, res) => {
// //     const pods = await storage.getPodApprovals();
// //     res.json(pods);
// //   });

// //   app.post("/api/approvals/pod/:id", async (req, res) => {
// //     const { id } = req.params;
// //     const { status } = req.body;
// //     if (status !== "approved" && status !== "rejected") {
// //       return res.status(400).json({ error: "Status must be approved or rejected" });
// //     }
// //     const result = await storage.updatePodStatus(id, status);
// //     if (!result) return res.status(404).json({ error: "POD not found" });
// //     res.json(result);
// //   });

// //   return httpServer;
// // }

// import { runLocalOptimization } from "./lib/optimizer";
// import { storage } from "./storage";
// import type { Express } from "express";
// import { type Server } from "http";
// import { z } from "zod";
// import { urgentOrderInputSchema } from "@shared/schema";

// export async function registerRoutes(
//   httpServer: Server,
//   app: Express
// ): Promise<Server> {
  
//   // --- Dashboard & Fleet Endpoints ---

//   app.get("/api/kpis", async (_req, res) => {
//     const kpis = await storage.getKpis();
//     res.json(kpis);
//   });

//   app.get("/api/drivers", async (_req, res) => {
//     const drivers = await storage.getDrivers();
//     res.json(drivers);
//   });

//   app.get("/api/fleet", async (_req, res) => {
//     const fleet = await storage.getFleet();
//     res.json(fleet);
//   });

//   app.get("/api/notifications", async (_req, res) => {
//     const notifications = await storage.getNotifications();
//     res.json(notifications);
//   });

//   app.get("/api/markers", async (_req, res) => {
//     const markers = await storage.getMarkers();
//     res.json(markers);
//   });

//   // --- AI Optimization Endpoints ---

//   /**
//    * GLOBAL OPTIMIZATION (Local Python OR-Tools):
//    * Pulls live data from Mock DB, sanitizes numbers into Integers,
//    * and runs the local route optimization engine.
//    */
//   app.post("/api/optimize-all", async (_req, res) => {
//     try {
//       const allDrivers = await storage.getDrivers();
//       const allFleet = await storage.getFleet();
      
//       // 1. Collect all pending delivery points
//       const pendingPoints = allDrivers.flatMap(driver => 
//         (driver.deliveryPoints || [])
//           .filter(p => p.status === "pending")
//       );

//       if (pendingPoints.length === 0) {
//         return res.status(400).json({ error: "No pending deliveries to optimize" });
//       }

//       // 2. Prepare standardized data for Python (Forcing Integers)
//       const solverInput = {
//         // Ensure num_vehicles is a clean integer
//         num_vehicles: Math.floor(allDrivers.length),
//         locations: [
//           // Driver starting coordinates
//           ...allDrivers.map(d => {
//             const v = allFleet.find(f => f.driverId === d.id);
//             return [
//               v?.location.lat || 13.0827, 
//               v?.location.lng || 80.2707
//             ];
//           }),
//           // Delivery point coordinates
//           ...pendingPoints.map(p => [p.lat, p.lng])
//         ],
//         // IMPORTANT: OR-Tools C++ engine requires whole integers
//         capacities: allDrivers.map(d => 
//           Math.floor((d.vehicleCapacityKg || 100) - (d.currentLoadKg || 0))
//         ),
//         demands: pendingPoints.map(() => 10) // Standard 10kg demand per stop
//       };

//       // 3. Trigger the Python Bridge
//       const aiResult = await runLocalOptimization(solverInput);

//       // 4. Transform results back into DB-friendly Driver-Route objects
//       const optimizedPlan = aiResult.map((res: any) => ({
//         driverId: allDrivers[res.vehicle_index].id,
//         driverName: allDrivers[res.vehicle_index].name,
//         // Match Python's delivery indices back to our pendingPoints array
//         suggestedRoute: res.route_indices.map((idx: number) => pendingPoints[idx])
//       }));

//       res.json(optimizedPlan);
//     } catch (error: any) {
//       console.error("Global AI Optimization failed:", error.message);
//       res.status(500).json({ error: error.message });
//     }
//   });

//   /**
//    * URGENT ORDER MATCHING:
//    * Finds top 5 suitable drivers for a single urgent request
//    */
//   app.post("/api/urgent-order/find-drivers", async (req, res) => {
//     try {
//       const allDrivers = await storage.getDrivers();
//       const newOrder = req.body;

//       if (!newOrder.deliveryLat || !newOrder.deliveryLng) {
//         return res.status(400).json({ error: "Delivery location required" });
//       }

//       const candidates = allDrivers.map((driver: any) => {
//         const warehouseLat = newOrder.warehouseLat || 13.0827;
//         const warehouseLng = newOrder.warehouseLng || 80.2707;
        
//         // Haversine formula for distance
//         const lat1 = warehouseLat * Math.PI / 180;
//         const lat2 = newOrder.deliveryLat * Math.PI / 180;
//         const deltaLat = (newOrder.deliveryLat - warehouseLat) * Math.PI / 180;
//         const deltaLng = (newOrder.deliveryLng - warehouseLng) * Math.PI / 180;
        
//         const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
//                   Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const distanceKm = 6371 * c;

//         const currentLoad = (driver.currentLoadKg || 0);
//         const capacity = (driver.vehicleCapacityKg || 100);
//         const remainingCapacity = capacity - currentLoad;
//         const pendingDeliveries = (driver.deliveryPoints || []).filter((p: any) => p.status === "pending").length;
//         const remainingHours = Math.max(0, 9 - (driver.hoursWorkedToday || 0));

//         const estimatedPickupMin = Math.round(distanceKm / 40 * 60) + 5;
//         const estimatedDeliveryMin = estimatedPickupMin + 15;

//         return {
//           driverId: driver.id,
//           driverName: driver.name,
//           avatar: driver.avatar || "?",
//           vehicleType: driver.vehicleType || "van",
//           licensePlate: `TN-${driver.id}`,
//           distanceToWarehouseKm: Math.round(distanceKm * 10) / 10,
//           remainingCapacityKg: Math.max(0, remainingCapacity),
//           remainingHours: remainingHours,
//           currentStopsCount: pendingDeliveries,
//           rating: driver.rating || 4.0,
//           estimatedPickupMin: estimatedPickupMin,
//           estimatedDeliveryMin: estimatedDeliveryMin,
//           oldEta: new Date(Date.now() + estimatedPickupMin * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
//           newEta: new Date(Date.now() + estimatedDeliveryMin * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
//           currentArea: driver.homeLocality || "Chennai",
//           status: driver.status || "active",
//         };
//       });

//       const sorted = candidates
//         .filter((c: any) => c.status === "active" && c.remainingHours > 0)
//         .sort((a: any, b: any) => {
//           const aScore = a.remainingCapacityKg * 0.4 + a.rating * 10 + a.remainingHours * 5;
//           const bScore = b.remainingCapacityKg * 0.4 + b.rating * 10 + b.remainingHours * 5;
//           return bScore - aScore;
//         })
//         .slice(0, 5);

//       res.json(sorted);
//     } catch (error: any) {
//       console.error("Urgent Order AI Optimization failed:", error.message);
//       res.status(500).json({ error: error.message });
//     }
//   });

//   // --- Operational Actions ---

//   app.post("/api/notifications/:id/acknowledge", async (req, res) => {
//     const { id } = req.params;
//     const updated = await storage.acknowledgeNotification(id);
//     if (!updated) return res.status(404).json({ error: "Notification not found" });
//     res.json(updated);
//   });

//   app.post("/api/drivers/:id/reassign", async (req, res) => {
//     const { id } = req.params;
//     const result = await storage.reassignDriver(id);
//     if (!result) return res.status(404).json({ error: "Driver not found" });
//     res.json(result);
//   });

//   const transferSchema = z.object({
//     fromDriverId: z.string(),
//     toDriverId: z.string(),
//     pointId: z.string(),
//     insertIndex: z.number().int().min(0),
//   });

//   app.post("/api/delivery-points/transfer", async (req, res) => {
//     const parsed = transferSchema.safeParse(req.body);
//     if (!parsed.success) {
//       return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
//     }
//     const { fromDriverId, toDriverId, pointId, insertIndex } = parsed.data;
//     const result = await storage.transferDeliveryPoint(fromDriverId, toDriverId, pointId, insertIndex);
//     if (!result) return res.status(404).json({ error: "Point not found" });
//     res.json(result);
//   });

//   const assignSchema = z.object({
//     driverId: z.string(),
//     order: urgentOrderInputSchema,
//   });

//   app.post("/api/urgent-order/assign", async (req, res) => {
//     const parsed = assignSchema.safeParse(req.body);
//     if (!parsed.success) {
//       return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
//     }
//     const driver = await storage.assignUrgentOrder(parsed.data.driverId, parsed.data.order);
//     if (!driver) return res.status(404).json({ error: "Driver not found" });
//     res.json(driver);
//   });

//   // --- Admin Approval Center Endpoints ---

//   app.get("/api/approvals/leave", async (_req, res) => {
//     const requests = await storage.getLeaveRequests();
//     res.json(requests);
//   });

//   app.post("/api/approvals/leave/:id", async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;
//     const result = await storage.updateLeaveStatus(id, status);
//     if (!result) return res.status(404).json({ error: "Leave request not found" });
//     res.json(result);
//   });

//   app.get("/api/approvals/overtime", async (_req, res) => {
//     const requests = await storage.getOvertimeRequests();
//     res.json(requests);
//   });

//   app.post("/api/approvals/overtime/:id", async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;
//     const result = await storage.updateOvertimeStatus(id, status);
//     if (!result) return res.status(404).json({ error: "Overtime request not found" });
//     res.json(result);
//   });

//   app.get("/api/approvals/fuel", async (_req, res) => {
//     const bills = await storage.getFuelBills();
//     res.json(bills);
//   });

//   app.post("/api/approvals/fuel/:id", async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;
//     const result = await storage.updateFuelBillStatus(id, status);
//     if (!result) return res.status(404).json({ error: "Fuel bill not found" });
//     res.json(result);
//   });

//   app.get("/api/approvals/pod", async (_req, res) => {
//     const pods = await storage.getPodApprovals();
//     res.json(pods);
//   });

//   app.post("/api/approvals/pod/:id", async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;
//     const result = await storage.updatePodStatus(id, status);
//     if (!result) return res.status(404).json({ error: "POD not found" });
//     res.json(result);
//   });

//   return httpServer;
// }

import { runLocalOptimization } from "./lib/optimizer";
import { storage } from "./storage";
import type { Express } from "express";
import { type Server } from "http";
import { z } from "zod";
import { urgentOrderInputSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // --- Dashboard & Fleet Endpoints ---

  app.get("/api/kpis", async (_req, res) => {
    const kpis = await storage.getKpis();
    res.json(kpis);
  });

  app.get("/api/drivers", async (_req, res) => {
    const drivers = await storage.getDrivers();
    res.json(drivers);
  });

  app.get("/api/fleet", async (_req, res) => {
    const fleet = await storage.getFleet();
    res.json(fleet);
  });

  app.get("/api/notifications", async (_req, res) => {
    const notifications = await storage.getNotifications();
    res.json(notifications);
  });

  app.get("/api/markers", async (_req, res) => {
    const markers = await storage.getMarkers();
    res.json(markers);
  });

  // --- AI Optimization Endpoints ---

  /**
   * GLOBAL OPTIMIZATION (Local Python OR-Tools):
   * This is the "Master Plan" engine.
   */
  app.post("/api/optimize-all", async (_req, res) => {
    try {
      const allDrivers = await storage.getDrivers();
      const allFleet = await storage.getFleet();
      
      // 1. Collect all pending delivery points
      const pendingPoints = allDrivers.flatMap(driver => 
        (driver.deliveryPoints || [])
          .filter(p => p.status === "pending")
      );

      if (pendingPoints.length === 0) {
        return res.status(400).json({ error: "No pending deliveries to optimize" });
      }

      // 2. Prepare standardized data for Python
      // CRITICAL: We align locations and demands perfectly to avoid C++ Overflow
      const solverInput = {
        num_vehicles: Math.floor(allDrivers.length),
        locations: [
          // Indices [0 to N-1]: Driver starting points
          ...allDrivers.map(d => {
            const v = allFleet.find(f => f.driverId === d.id);
            return [
              v?.location.lat || 13.0827, 
              v?.location.lng || 80.2707
            ];
          }),
          // Indices [N to M]: Delivery point coordinates
          ...pendingPoints.map(p => [p.lat, p.lng])
        ],
        capacities: allDrivers.map(d => 
          Math.floor((d.vehicleCapacityKg || 100) - (d.currentLoadKg || 0))
        ),
        // FIX: Demand must exist for every location. 
        // Drivers (at the start) take up 0 capacity.
        demands: [
          ...allDrivers.map(() => 0), 
          ...pendingPoints.map(() => 10)
        ]
      };

      // 3. Trigger the Python Bridge
      const aiResult = await runLocalOptimization(solverInput);

      // 4. Transform results back into DB-friendly Driver-Route objects
      const optimizedPlan = aiResult.map((res: any) => ({
        driverId: allDrivers[res.vehicle_index].id,
        driverName: allDrivers[res.vehicle_index].name,
        suggestedRoute: res.route_indices.map((idx: number) => pendingPoints[idx])
      }));

      res.json(optimizedPlan);
    } catch (error: any) {
      console.error("Global AI Optimization failed:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * URGENT ORDER MATCHING:
   * Finds top 3 suitable drivers for a single urgent request
   * Delegates to storage.findUrgentDriverCandidates for all ranking logic
   */
  app.post("/api/urgent-order/find-drivers", async (req, res) => {
    try {
      const parsed = urgentOrderInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid order details" });
      }

      const candidates = await storage.findUrgentDriverCandidates(parsed.data);
      res.json(candidates);
    } catch (error: any) {
      console.error("Urgent Order matching failed:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // 1. Find the top 5 candidates based on location, capacity, and hours
  app.post("/api/urgent-order/candidates", async (req, res) => {
    // Validate the incoming form data using Zod
    const parsed = urgentOrderInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid order details" });
    }

    try {
      const candidates = await storage.findUrgentDriverCandidates(parsed.data);
      res.json(candidates);
    } catch (err: any) {
      console.error("Failed to find urgent driver candidates:", err?.message || err);
      res.status(500).json({ error: err?.message || "Internal error" });
    }
  });

  // --- Operational Actions ---

  app.post("/api/notifications/:id/acknowledge", async (req, res) => {
    const { id } = req.params;
    const updated = await storage.acknowledgeNotification(id);
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json(updated);
  });

  app.post("/api/drivers/:id/reassign", async (req, res) => {
    const { id } = req.params;
    const result = await storage.reassignDriver(id);
    if (!result) return res.status(404).json({ error: "Driver not found" });
    res.json(result);
  });

  const transferSchema = z.object({
    fromDriverId: z.string(),
    toDriverId: z.string(),
    pointId: z.string(),
    insertIndex: z.number().int().min(0),
  });

  app.post("/api/delivery-points/transfer", async (req, res) => {
    const parsed = transferSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    }
    const { fromDriverId, toDriverId, pointId, insertIndex } = parsed.data;
    const result = await storage.transferDeliveryPoint(fromDriverId, toDriverId, pointId, insertIndex);
    if (!result) return res.status(404).json({ error: "Point not found" });
    res.json(result);
  });

  // 2. Assign the order to the selected driver
  app.post("/api/urgent-order/assign", async (req, res) => {
    const { driverId, orderData } = req.body;

    if (!driverId || !orderData) {
      return res.status(400).json({ error: "Missing driver ID or order data" });
    }

    try {
      const updatedDriver = await storage.assignUrgentOrder(driverId, orderData);
      if (!updatedDriver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json(updatedDriver);
    } catch (err: any) {
      console.error("Failed to assign urgent order:", err?.message || err);
      res.status(500).json({ error: err?.message || "Internal error" });
    }
  });

  // --- Admin Approvals ---

  app.get("/api/approvals/leave", async (_req, res) => {
    const requests = await storage.getLeaveRequests();
    res.json(requests);
  });

  app.post("/api/approvals/leave/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await storage.updateLeaveStatus(id, status);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  });

  app.get("/api/approvals/overtime", async (_req, res) => {
    const requests = await storage.getOvertimeRequests();
    res.json(requests);
  });

  app.post("/api/approvals/overtime/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await storage.updateOvertimeStatus(id, status);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  });

  app.get("/api/approvals/fuel", async (_req, res) => {
    const bills = await storage.getFuelBills();
    res.json(bills);
  });

  app.post("/api/approvals/fuel/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await storage.updateFuelBillStatus(id, status);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  });

  app.get("/api/approvals/pod", async (_req, res) => {
    const pods = await storage.getPodApprovals();
    res.json(pods);
  });

  app.post("/api/approvals/pod/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await storage.updatePodStatus(id, status);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  });

  return httpServer;
}
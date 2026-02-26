import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from "react";
import { ORDERS, NOTIFICATIONS, URGENT_ORDER, Order, Notification, UrgentOrderData } from "@/lib/mock-data";

interface AppContextValue {
  orders: Order[];
  notifications: Notification[];
  fuelRequested: boolean;
  breakRequested: boolean;
  fuelStopVisible: boolean;
  setFuelRequested: (v: boolean) => void;
  setBreakRequested: (v: boolean) => void;
  requestFuelStop: () => void;
  dismissNotification: (id: string) => void;
  acknowledgeNotification: (id: string) => void;
  unreadCount: number;
  urgentOrder: UrgentOrderData | null;
  urgentOverlayVisible: boolean;
  urgentAcknowledged: boolean;
  urgentMarkerVisible: boolean;
  voiceBotMessage: string | null;
  showUrgentOverlay: () => void;
  dismissUrgentOverlay: () => void;
  acknowledgeUrgentOrder: () => void;
  clearVoiceBotMessage: () => void;
  triggerUrgentDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [fuelRequested, setFuelRequested] = useState(false);
  const [breakRequested, setBreakRequested] = useState(false);
  const [fuelStopVisible, setFuelStopVisible] = useState(false);

  const [urgentOrder, setUrgentOrder] = useState<UrgentOrderData | null>(null);
  const [urgentOverlayVisible, setUrgentOverlayVisible] = useState(false);
  const [urgentAcknowledged, setUrgentAcknowledged] = useState(false);
  const [urgentMarkerVisible, setUrgentMarkerVisible] = useState(false);
  const [voiceBotMessage, setVoiceBotMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerUrgentDemo();
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const triggerUrgentDemo = useCallback(() => {
    setUrgentOrder(URGENT_ORDER);
    setUrgentOverlayVisible(true);
    setUrgentAcknowledged(false);
    setUrgentMarkerVisible(false);
    setVoiceBotMessage("New urgent order added. Recalculating route for minimum delay.");
  }, []);

  const requestFuelStop = () => {
    setFuelStopVisible(true);
    setFuelRequested(true);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const acknowledgeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const showUrgentOverlay = useCallback(() => {
    setUrgentOverlayVisible(true);
  }, []);

  const dismissUrgentOverlay = useCallback(() => {
    setUrgentOverlayVisible(false);
  }, []);

  const acknowledgeUrgentOrder = useCallback(() => {
    if (!urgentOrder) return;
    setUrgentOverlayVisible(false);
    setUrgentAcknowledged(true);
    setUrgentMarkerVisible(true);

    setOrders((prev) => {
      const urgentExists = prev.some((o) => o.id === urgentOrder.order.id);
      if (urgentExists) return prev;
      const urgentOrderEntry: Order = {
        ...urgentOrder.order,
        status: "upcoming",
        isUrgent: true,
        weight: urgentOrder.weight,
        deadline: urgentOrder.deadline,
      };
      const enRoute = prev.filter((o) => o.status === "en_route");
      const upcoming = prev.filter((o) => o.status === "upcoming");
      const completed = prev.filter((o) => o.status === "completed");
      return [...enRoute, urgentOrderEntry, ...upcoming, ...completed];
    });

    setNotifications((prev) => [
      {
        id: "NOT-URGENT-" + Date.now(),
        title: "Urgent Order Acknowledged",
        message: `${urgentOrder.order.id} has been added to your route. ETA adjusted by +7 min.`,
        time: "Just now",
        read: false,
        type: "urgent",
      },
      ...prev,
    ]);
  }, [urgentOrder]);

  const clearVoiceBotMessage = useCallback(() => {
    setVoiceBotMessage(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({
      orders,
      notifications,
      fuelRequested,
      breakRequested,
      fuelStopVisible,
      setFuelRequested,
      setBreakRequested,
      requestFuelStop,
      dismissNotification,
      acknowledgeNotification,
      unreadCount,
      urgentOrder,
      urgentOverlayVisible,
      urgentAcknowledged,
      urgentMarkerVisible,
      voiceBotMessage,
      showUrgentOverlay,
      dismissUrgentOverlay,
      acknowledgeUrgentOrder,
      clearVoiceBotMessage,
      triggerUrgentDemo,
    }),
    [orders, notifications, fuelRequested, breakRequested, fuelStopVisible, urgentOrder, urgentOverlayVisible, urgentAcknowledged, urgentMarkerVisible, voiceBotMessage, unreadCount, showUrgentOverlay, dismissUrgentOverlay, acknowledgeUrgentOrder, clearVoiceBotMessage, triggerUrgentDemo]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default(""),
  companyName: text("company_name").notNull().default(""),
  employeeId: text("employee_id").notNull().default(""),
  vehicleNo: text("vehicle_no").notNull().default(""),
  vehicleType: text("vehicle_type").notNull().default(""),
  fuelType: text("fuel_type").notNull().default(""),
  capacity: text("capacity").notNull().default(""),
  phoneNo: text("phone_no").notNull().default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  companyName: true,
  employeeId: true,
  vehicleNo: true,
  vehicleType: true,
  fuelType: true,
  capacity: true,
  phoneNo: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

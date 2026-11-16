import { bookingHandlers } from "./bookings";
import { catalogHandlers } from "./catalog";
import { orderHandlers } from "./orders";

// Admin handlers join this list in FE-T11 to FE-T15
export const handlers = [...catalogHandlers, ...orderHandlers, ...bookingHandlers];
import { bookingHandlers } from "./bookings";
import { catalogHandlers } from "./catalog";
import { orderHandlers } from "./orders";
import { adminHandlers } from "./admin";

export const handlers = [...catalogHandlers, ...orderHandlers, ...bookingHandlers, ...adminHandlers];
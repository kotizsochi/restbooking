import { router } from "./trpc";
import { restaurantRouter } from "./routers/restaurant";
import { bookingRouter } from "./routers/booking";
import { authRouter } from "./routers/auth";
import { floorRouter } from "./routers/floor";
import { notificationRouter } from "./routers/notification";
import { waitListRouter } from "./routers/waitlist";

export const appRouter = router({
  restaurant: restaurantRouter,
  booking: bookingRouter,
  auth: authRouter,
  floor: floorRouter,
  notification: notificationRouter,
  waitList: waitListRouter,
});

export type AppRouter = typeof appRouter;

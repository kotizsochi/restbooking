import { router } from "./trpc";
import { restaurantRouter } from "./routers/restaurant";
import { bookingRouter } from "./routers/booking";
import { authRouter } from "./routers/auth";
import { floorRouter } from "./routers/floor";

export const appRouter = router({
  restaurant: restaurantRouter,
  booking: bookingRouter,
  auth: authRouter,
  floor: floorRouter,
});

export type AppRouter = typeof appRouter;

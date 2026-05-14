import { router } from "./trpc";
import { restaurantRouter } from "./routers/restaurant";
import { bookingRouter } from "./routers/booking";

export const appRouter = router({
  restaurant: restaurantRouter,
  booking: bookingRouter,
});

export type AppRouter = typeof appRouter;

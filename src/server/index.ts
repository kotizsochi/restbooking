import { router } from "./trpc";
import { restaurantRouter } from "./routers/restaurant";
import { bookingRouter } from "./routers/booking";
import { authRouter } from "./routers/auth";

export const appRouter = router({
  restaurant: restaurantRouter,
  booking: bookingRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;

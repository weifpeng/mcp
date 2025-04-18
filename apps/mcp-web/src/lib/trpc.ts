import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@tokenpocket/trpc';

export const trpc = createTRPCReact<AppRouter>();

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@mcp/trpc';

export const trpc = createTRPCReact<AppRouter>();

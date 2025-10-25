// app/QueryClientProvider.tsx
'use client';
import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryClientProvider({ children }: { children: ReactNode }) {
    // Create QueryClient only once (useState to persist across renders)
    const [queryClient] = useState(() => new QueryClient());

    return (
        <RQProvider client={queryClient}>
            {children}
        </RQProvider>
    );
}
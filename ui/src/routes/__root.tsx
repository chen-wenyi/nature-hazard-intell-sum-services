import { ABLY_CHANNEL_NAME } from '@/ablyChannel';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { Analytics } from '@vercel/analytics/react';
import * as Ably from 'ably';
import { AblyProvider, ChannelProvider } from 'ably/react';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Natural Hazard Intelligence Summary',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        // Add a version query string (?v=2) to force the browser to reload it
        href: '/favicon.ico?v=2',
      },
    ],
  }),

  shellComponent: RootDocument,
});

const realtimeClient = new Ably.Realtime({
  authUrl: '/ably/create-token',
  clientId: 'nhis-client',
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <HeadContent />
      </head>
      <body>
        <AblyProvider client={realtimeClient}>
          <ChannelProvider channelName={ABLY_CHANNEL_NAME}>
            {children}
          </ChannelProvider>
        </AblyProvider>
        <Analytics />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

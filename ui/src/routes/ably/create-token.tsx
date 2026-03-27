import { createFileRoute } from '@tanstack/react-router';
import * as Ably from 'ably';

export const Route = createFileRoute('/ably/create-token')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY || '' });
          const tokenRequest = await ably.auth.createTokenRequest({
            clientId: 'nhis-client',
          });
          return Response.json(tokenRequest);
        } catch (error) {
          console.error('Error creating Ably token request:', error);
          return new Response('Internal Server Error', { status: 500 });
        }
      },
    },
  },
});

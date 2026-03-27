import type { AblyMessageCallback } from 'ably/react';
import { useChannel, useChannelStateListener } from 'ably/react';
import { useState } from 'react';
import { ABLY_CHANNEL_NAME } from './ablyChannel';

/**
 * useCopyToClipboard hook
 * Returns a copy function and a boolean indicating if the text was copied.
 */
export function useCopyToClipboard(
  timeout = 1500,
): [(text: string) => void, boolean] {
  const [isCopied, setIsCopied] = useState(false);

  function copy(text: string) {
    const html = text.replace(
      /\b(minimal|low|moderate|high)\b(?=\s+(?:confiden|risk))/gi,
      '<span style="text-decoration: underline;">$1</span>',
    );

    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' }),
    });

    navigator.clipboard.write([clipboardItem]).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
    });
  }

  return [copy, isCopied];
}

export function useNHISChannel(callbackOnMessage?: AblyMessageCallback) {
  return useChannel(ABLY_CHANNEL_NAME, callbackOnMessage);
}

export function useNHISChannelStateListener() {
  return useChannelStateListener(ABLY_CHANNEL_NAME, (state) => {
    console.log('NHIS Channel state changed to:', state);
  });
}

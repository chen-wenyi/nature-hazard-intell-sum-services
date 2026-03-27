import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useNHISChannel } from '@/hooks';
import { EVENT } from '@/lib/ably';
import {
  toastError,
  toastInfo,
  toastSuccess,
  toastUpdateToDate,
} from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useThunderstormOutlook } from '@/queries';
import { setActiveOutlookTab, store } from '@/store';
import { createServerFn } from '@tanstack/react-start';
import { useStore } from '@tanstack/react-store';
import lodash from 'lodash';
import { RefreshCcw } from 'lucide-react';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { Skeleton } from '../ui/skeleton';
import { ReactMarkdownWithHighlight } from './ReactMarkdownWithHighlight';
import { RevisionHistory } from './RevisionHistory';

const MESSAGE_HEADER = 'Thunderstorm Outlook';

export default function ThunderstormOutlook() {
  const activeOutlookTab = useStore(store, (state) => state.activeOutlookTab);

  const {
    data: thunderstormOutlook,
    isLoading,
    refetch,
  } = useThunderstormOutlook();

  const [isUpdating, setIsUpdating] = useState(false);

  useNHISChannel((message) => {
    switch (message.name) {
      case EVENT.THUNDERSTORM_OUTLOOK_UPDATING: {
        setIsUpdating(true);
        toastInfo(MESSAGE_HEADER, message.data.message);
        break;
      }
      case EVENT.THUNDERSTORM_OUTLOOK_UPDATED: {
        if (message.data.failed) {
          toastError(MESSAGE_HEADER, message.data.message);
        } else {
          if (message.data.stale) {
            toastSuccess(MESSAGE_HEADER, message.data.message);
            refetch();
          } else {
            toastUpdateToDate(MESSAGE_HEADER, message.data.message);
          }
        }
        setIsUpdating(false);
        break;
      }
      default:
        break;
    }
  });

  const updateThunderstormOutlook = useCallback(
    lodash.throttle(async () => {
      if (!isUpdating) {
        await fetchLatestThunderstormOutlook();
      }
    }, 10000),
    [],
  );

  return (
    <Card
      className={activeOutlookTab === 'thunderstormOutlook' ? 'flex' : 'hidden'}
    >
      <CardHeader>
        <CardTitle>
          <ButtonGroup className="w-full flex">
            <Button
              variant={'outline'}
              className="flex-1 text-black/65 h-12"
              onClick={() => setActiveOutlookTab('severeWeatherOutlook')}
            >
              Severe Weather Outlook
            </Button>
            <Button
              className="flex-1 h-12"
              onClick={() => setActiveOutlookTab('thunderstormOutlook')}
            >
              Thunderstorm Outlook
            </Button>
          </ButtonGroup>
        </CardTitle>
        <CardDescription className="mt-2 ml-1 flex justify-between items-center h-8">
          <div className="flex items-center gap-4">
            <span>
              Source:{' '}
              <a
                href="https://www.metservice.com/warnings/thunderstorm-outlook"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                MetService
              </a>
            </span>
            <RefreshCcw
              className={cn({
                'animate-spin': isUpdating,
                'cursor-pointer hover:scale-110': !isUpdating,
              })}
              size={16}
              onClick={updateThunderstormOutlook}
            />
          </div>
          <RevisionHistory />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            {thunderstormOutlook?.items.map((item) => (
              <ThunderstormOutlookItem
                key={item.header}
                header={item.header}
                issuedDate={item.issuedDate}
                outlook={item.outlook}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-gray-500 text-xs">
          This section uses terminology for confidence, risk and chance provided
          by MetService
          <a
            href="https://about.metservice.com/about-severe-weather-warnings"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2"
          >
            (
            <span className="underline">
              Severe Weather Warnings and Watches
            </span>
            )
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

function ThunderstormOutlookItem({
  header,
  issuedDate,
  outlook,
}: {
  header: string;
  issuedDate: string;
  outlook: string;
}) {
  const activeThunderstormOutlookReference = useStore(
    store,
    (state) => state.activeThunderstormOutlookReference,
  );

  const isActive =
    activeThunderstormOutlookReference &&
    activeThunderstormOutlookReference.date ===
      DateTime.fromFormat(header, 'cccc dd MMM').toISODate();

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isActive]);

  return (
    <div ref={isActive ? ref : null}>
      <div className="flex flex-col ">
        <div className="text-lg font-semibold">{header}</div>
        <div className="text-sm text-gray-400 py-2">Issued: {issuedDate}</div>
      </div>
      <ReactMarkdownWithHighlight
        markdown={outlook}
        quotes={activeThunderstormOutlookReference?.quotes || []}
        keywords={activeThunderstormOutlookReference?.keywords || []}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

const fetchLatestThunderstormOutlook = createServerFn().handler(() => {
  fetch(`${process.env.MAIN_SERVICES_URL!}/update-thunderstorm`);
});

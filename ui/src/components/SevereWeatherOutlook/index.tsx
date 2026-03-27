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
import { useSevereWeatherOutlook } from '@/queries';
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

const MESSAGE_HEADER = 'Severe Weather Outlook';

export default function SevereWeatherOutlook() {
  const activeOutlookTab = useStore(store, (state) => state.activeOutlookTab);

  const {
    data: severeWeatherOutlook,
    isFetching,
    refetch,
  } = useSevereWeatherOutlook();
  const [isUpdating, setIsUpdating] = useState(false);

  useNHISChannel((message) => {
    switch (message.name) {
      case EVENT.SEVERE_WEATHER_OUTLOOK_UPDATING: {
        setIsUpdating(true);
        toastInfo(MESSAGE_HEADER, message.data.message);
        break;
      }
      case EVENT.SEVERE_WEATHER_OUTLOOK_UPDATED: {
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

  const updateSevereWeatherOutlook = useCallback(
    lodash.throttle(async () => {
      if (!isUpdating) {
        await fetchLatestSevereWeatherOutlook();
      }
    }, 10000),
    [],
  );

  return (
    <Card
      className={
        activeOutlookTab === 'severeWeatherOutlook' ? 'flex' : 'hidden'
      }
    >
      <CardHeader>
        <CardTitle>
          <ButtonGroup className="w-full flex">
            <Button
              className="flex-1 h-12"
              onClick={() => setActiveOutlookTab('severeWeatherOutlook')}
            >
              Severe Weather Outlook
            </Button>
            <Button
              variant={'outline'}
              className="flex-1 text-black/65 h-12"
              onClick={() => setActiveOutlookTab('thunderstormOutlook')}
            >
              Thunderstorm Outlook
            </Button>
          </ButtonGroup>
        </CardTitle>
        <CardDescription className="mt-2 ml-1">
          <div className="flex gap-6 items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <span>
                  Source:{' '}
                  <a
                    href="https://www.metservice.com/warnings/severe-weather-outlook"
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
                  onClick={updateSevereWeatherOutlook}
                  size={16}
                />
              </div>
              <div>Issued: {severeWeatherOutlook?.issuedDate}</div>
            </div>
            <RevisionHistory />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isFetching ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            {severeWeatherOutlook?.outlookItems.map((item) => (
              <SevereWeatherOutlookItem
                key={item.date}
                date={item.date}
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

function SevereWeatherOutlookItem({
  date,
  outlook,
}: {
  date: string;
  outlook: string;
}) {
  const activeSevereWeatherOutlookReference = useStore(
    store,
    (state) => state.activeSevereWeatherOutlookReference,
  );

  const isActive =
    activeSevereWeatherOutlookReference &&
    activeSevereWeatherOutlookReference.date ===
      DateTime.fromFormat(date, 'cccc dd MMM').toISODate();

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isActive]);

  return (
    <div ref={isActive ? ref : null}>
      <div className="text-lg font-semibold">{date}</div>
      <ReactMarkdownWithHighlight
        markdown={outlook.replaceAll('\n', '\n \n')}
        quotes={activeSevereWeatherOutlookReference?.quotes || []}
        keywords={activeSevereWeatherOutlookReference?.keywords || []}
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

const fetchLatestSevereWeatherOutlook = createServerFn().handler(() => {
  fetch(`${process.env.MAIN_SERVICES_URL!}/update-severe-weather`);
});

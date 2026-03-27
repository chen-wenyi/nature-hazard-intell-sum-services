import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useNHISChannel } from '@/hooks';
import { EVENT } from '@/lib/ably';
import {
  toastError,
  toastInfo,
  toastSuccess,
  toastUpdateToDate,
} from '@/lib/toast';
import { cn, formatUTCToNZDate } from '@/lib/utils';
import { useIssuedWarningsAndWatches } from '@/queries';
import { store } from '@/store';
import type { IssuedAlert } from '@/types/alert';
import { sortAlerts } from '@/utils';
import { createServerFn } from '@tanstack/react-start';
import { useStore } from '@tanstack/react-store';
import lodash from 'lodash';
import { RefreshCcw } from 'lucide-react';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { AlertHistory } from './AlertHistory';
import { AlertIndicator } from './AlertIndicator';
import { DetailsToggle } from './DetailsToggle';
import { getPeriodDescription } from './utils';

const MESSAGE_HEADER = 'Issued Warnings and Watches';

export default function IssuedWarningsAndWatches() {
  const {
    data: issuedWarningsAndWatches,
    error: _error,
    isLoading,
    refetch,
  } = useIssuedWarningsAndWatches();

  const [isUpdating, setIsUpdating] = useState(false);

  useNHISChannel((message) => {
    console.log(
      `Received ${message.name} message: ${JSON.stringify(message.data)} at ${DateTime.now().setZone('Pacific/Auckland').toISO()}`,
    );

    switch (message.name) {
      case EVENT.ISSUED_ALERTS_UPDATING: {
        setIsUpdating(true);
        toastInfo(MESSAGE_HEADER, message.data.message);
        break;
      }
      case EVENT.ISSUED_ALERTS_UPDATED: {
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

  const updateIssuedAlerts = useCallback(
    lodash.throttle(async () => {
      if (!isUpdating) {
        await fetchLatestIssuedAlerts();
      }
    }, 10000),
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issued Warnings And Watches</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-4">
            <span>
              Source:{' '}
              <a
                href="https://www.metservice.com/warnings/home"
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
              onClick={updateIssuedAlerts}
              size={16}
            />
          </div>
          <div>
            Last updated:{' '}
            {issuedWarningsAndWatches?.updatedAt
              ? formatUTCToNZDate(issuedWarningsAndWatches.updatedAt)
              : ''}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col gap-2 w-75 text-[0.9rem]">
            {issuedWarningsAndWatches &&
            issuedWarningsAndWatches.entries.length > 0 ? (
              sortAlerts(issuedWarningsAndWatches.entries).map((i) => {
                return <AlertCard issuedAlert={i} key={i.id} />;
              })
            ) : (
              <div className="flex items-center gap-4">
                {/* <AllgoodIcon /> */}
                <span> No issued warnings or watches.</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}

function AlertCard({ issuedAlert }: { issuedAlert: IssuedAlert }) {
  const {
    id,
    sent,
    _status,
    _history,
    areaDesc,
    onset,
    expires,
    ChanceOfUpgrade,
    // description intentionally unused here; Details component uses the whole object
    // keep property to avoid changing shape
  } = issuedAlert;

  const scrollIntoViewRef = useRef<HTMLDivElement | null>(null);

  const activeAlertReference = useStore(
    store,
    (state) => state.activeAlertReference,
  );

  const ref =
    activeAlertReference &&
    activeAlertReference.alertIds.length > 0 &&
    activeAlertReference.alertIds[0] === id
      ? scrollIntoViewRef
      : null;

  useEffect(() => {
    if (activeAlertReference?.alertIds.length === 0) return;
    if (scrollIntoViewRef.current) {
      scrollIntoViewRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [activeAlertReference]);
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          ref={ref}
          className={cn(
            'mb-4 w-full border p-4 rounded-md shadow transition-all',
            activeAlertReference?.alertIds.includes(id) &&
              'border-blue-500 bg-blue-50',
            _status === 'removed'
              ? 'opacity-50 bg-gray-100'
              : 'hover:border-blue-500',
          )}
        >
          <div className="text-xs text-gray-500 mb-1 relative flex items-center justify-between">
            <span onClick={() => console.log(id)}>
              {formatUTCToNZDate(new Date(sent))}
            </span>
            <div className="flex gap-1 justify-center items-center">
              {_status && (
                <Badge
                  variant={'outline'}
                  className={cn(
                    'text-xs right-0 font-semibold capitalize',
                    _status === 'updated' && 'border-blue-500 text-blue-500',
                    _status === 'removed' && 'border-gray-500 text-gray-500',
                    _status === 'new' && 'border-green-600 text-green-600',
                  )}
                >
                  {_status}
                </Badge>
              )}
              {_history.length > 0 && (
                <Badge
                  // variant={'outline'}
                  title="Number of history"
                  className={'text-xs right-0 font-semibold'}
                >
                  {_history.length}
                </Badge>
              )}
            </div>
          </div>
          <AlertIndicator data={issuedAlert} />
          <div>
            <span className="font-bold">Area: </span>
            <span>{areaDesc.replace(/,/g, ', ')}</span>
          </div>
          <div>
            <span className="font-bold">Period: </span>
            <span>{getPeriodDescription(onset, expires)}</span>
          </div>
          <div>
            <span className="font-bold">ChanceOfUpgrade: </span>
            <span>{ChanceOfUpgrade || 'N/A'}</span>
          </div>

          <div>
            <DetailsToggle issuedAlert={issuedAlert} />
          </div>
        </div>
      </HoverCardTrigger>
      {_history.length > 0 && (
        <HoverCardContent className="w-90 bg-gray-50 ml-2" side="right">
          <AlertHistory history={_history} />
        </HoverCardContent>
      )}
    </HoverCard>
  );
}

const fetchLatestIssuedAlerts = createServerFn().handler(() => {
  fetch(process.env.MAIN_SERVICES_URL! + '/update-issued-alerts');
});

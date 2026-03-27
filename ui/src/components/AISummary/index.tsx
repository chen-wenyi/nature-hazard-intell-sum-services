import { useNHISChannel } from '@/hooks';
import { EVENT } from '@/lib/ably';
import { cn } from '@/lib/utils';
import {
  useIssuedWarningsAndWatches,
  useSevereWeatherOutlook,
  useThunderstormOutlook,
} from '@/queries';

import {
  getSevereWeatherOutlookAISummaryById,
  getThunderstormOutlookAISummaryById,
} from '@/serverFuncs/AISummary';

import { useQuery } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import axios from 'axios';
import { MoreHorizontalIcon, RefreshCw } from 'lucide-react';
import { DateTime, Interval } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { AiFillThunderbolt } from 'react-icons/ai';
import { IoRainy } from 'react-icons/io5';
import { useIdleTimer } from 'react-idle-timer';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import type { Summary } from './SummaryItem';
import { SummaryItem } from './SummaryItem';
import {
  getLatestDate,
  getThunderstormOutlookDate,
  isOneDigitDay,
} from './utils';

type SummaryWithoutFetchingFlags = Omit<
  Summary,
  | 'isSevereWeatherOutlookAISummaryFetching'
  | 'isThunderstormOutlookAISummaryFetching'
>;

export function AISummary() {
  const isSummaryLoaded = useRef(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [summaries, setSummaries] = useState<SummaryWithoutFetchingFlags[]>([]);

  const [
    isSevereWeatherOutlookAISummaryFetching,
    setIsSevereWeatherOutlookAISummaryFetching,
  ] = useState(false);
  const [
    isThunderstormOutlookAISummaryFetching,
    setIsThunderstormOutlookAISummaryFetching,
  ] = useState(false);

  const {
    data: severeWeatherOutlook,
    isLoading: isSevereWeatherOutlookLoading,
    refetch: refetchSevereWeatherOutlook,
  } = useSevereWeatherOutlook();
  const {
    data: thunderstormOutlook,
    isLoading: isThunderstormOutlookLoading,
    refetch: refetchThunderstormOutlook,
  } = useThunderstormOutlook();

  const {
    data: issuedWarningsAndWatches,
    isLoading: isIssuedWarningsAndWatchesLoading,
    refetch: refetchIssuedWarningsAndWatches,
  } = useIssuedWarningsAndWatches();
  const {
    data: severeWeatherOutlookAISummary,
    refetch: refetchSevereWeatherOutlookAISummary,
  } = useSevereWeatherOutlookAISummary(severeWeatherOutlook?.id ?? '');
  const {
    data: thunderstormOutlookAISummary,
    refetch: refetchThunderstormOutlookAISummary,
  } = useThunderstormOutlookAISummary(thunderstormOutlook?.id ?? '');

  useEffect(() => {
    if (severeWeatherOutlook?.id && thunderstormOutlook?.id) {
      if (!isSummaryLoaded.current) {
        refetchSevereWeatherOutlookAISummary();
        refetchThunderstormOutlookAISummary();
        isSummaryLoaded.current = true;
      }
    }
  }, [severeWeatherOutlook?.id, thunderstormOutlook?.id]);

  useEffect(() => {
    if (
      issuedWarningsAndWatches?.id &&
      severeWeatherOutlookAISummary?.id &&
      thunderstormOutlookAISummary?.id &&
      severeWeatherOutlook?.id
    ) {
      const start = DateTime.now().startOf('day');
      const endDateStr =
        severeWeatherOutlook.outlookItems[
          severeWeatherOutlook.outlookItems.length - 1
        ].date;

      const end = DateTime.fromFormat(
        endDateStr.trim(),
        isOneDigitDay(endDateStr.trim()) ? 'cccc d LLL' : 'cccc dd LLL',
      ).endOf('day');
      const interval = Interval.fromDateTimes(start, end);
      const dates = interval.splitBy({ days: 1 }).map((i) => i.start);

      const _summaries: SummaryWithoutFetchingFlags[] = dates
        .filter((d): d is DateTime => d !== null)
        .map((date) => ({
          date,
          issuedWarningsAndWatches: [],
          severeWeatherOutlookAISummary: [],
          thunderstormOutlookAISummary: [],
        }));

      severeWeatherOutlookAISummary.content.forEach((item) => {
        const outlookDate = DateTime.fromFormat(
          item.date.trim(),
          isOneDigitDay(item.date.trim()) ? 'cccc d LLL' : 'cccc dd LLL',
        );
        _summaries
          .find((daySummary) => daySummary.date.hasSame(outlookDate, 'day'))
          ?.severeWeatherOutlookAISummary.push(...item.summary);
      });

      thunderstormOutlookAISummary.content.forEach((item) => {
        const dateStr = getThunderstormOutlookDate(item.date);
        if (!dateStr) return false;

        const outlookDate = DateTime.fromFormat(
          dateStr.trim(),
          isOneDigitDay(dateStr.trim()) ? 'd LLL' : 'dd LLL',
        );
        _summaries
          .find((daySummary) => daySummary.date.hasSame(outlookDate, 'day'))
          ?.thunderstormOutlookAISummary.push(...item.summary);
      });

      issuedWarningsAndWatches.entries.forEach((i) => {
        const onset = DateTime.fromISO(i.onset);
        const expires = DateTime.fromISO(i.expires);
        _summaries.forEach((daySummary) => {
          if (
            daySummary.date >= onset.startOf('day') &&
            daySummary.date <= expires.endOf('day')
          ) {
            daySummary.issuedWarningsAndWatches.push(i);
          }
        });
      });

      console.log('Generated summaries: ', _summaries);
      setSummaries(_summaries);
      setIsThunderstormOutlookAISummaryFetching(false);
      setIsSevereWeatherOutlookAISummaryFetching(false);
    }
  }, [
    issuedWarningsAndWatches?.id,
    severeWeatherOutlook?.id,
    thunderstormOutlook?.id,
    severeWeatherOutlookAISummary?.id,
    thunderstormOutlookAISummary?.id,
  ]);

  useNHISChannel((message) => {
    switch (message.name) {
      case EVENT.AI_SEVERE_WEATHER_OUTLOOK_SUMMARY_GENERATED: {
        refetchSevereWeatherOutlookAISummary();
        break;
      }
      case EVENT.AI_THUNDERSTORM_OUTLOOK_SUMMARY_GENERATED: {
        refetchThunderstormOutlookAISummary();
        break;
      }
      case EVENT.AI_SEVERE_WEATHER_OUTLOOK_SUMMARY_GENERATING: {
        setIsSevereWeatherOutlookAISummaryFetching(true);
        break;
      }
      case EVENT.AI_THUNDERSTORM_OUTLOOK_SUMMARY_GENERATING: {
        setIsThunderstormOutlookAISummaryFetching(true);
        refetchThunderstormOutlook();
        break;
      }
      default:
        break;
    }
  });

  const isRefDataLoading =
    isIssuedWarningsAndWatchesLoading ||
    isSevereWeatherOutlookLoading ||
    isThunderstormOutlookLoading;

  useEffect(() => {
    const steps = [
      isIssuedWarningsAndWatchesLoading,
      isSevereWeatherOutlookLoading,
      isThunderstormOutlookLoading,
    ];
    const completedSteps = steps.filter((step) => !step).length;
    setLoadingProgress((completedSteps / steps.length) * 100);
  }, [
    isIssuedWarningsAndWatchesLoading,
    isSevereWeatherOutlookLoading,
    isThunderstormOutlookLoading,
  ]);

  const regenerateAll = () => {
    regenerateSevereWether();
    regenerateThunderstorm();
  };

  const regenerateSevereWether = async () => {
    if (severeWeatherOutlook?.id) {
      const resp = await triggerSevereWeatherOutlookAISummaryGeneration({
        data: {
          reason: 'Triggered by user regeneration',
          outlookRefId: severeWeatherOutlook.id,
        },
      });
      if (resp.error) {
        toast.error(
          `Failed to regenerate severe weather outlook AI summary: ${resp.error}`,
        );
      } else if (resp.message) {
        toast.success(resp.message);
      }
    }
  };

  const regenerateThunderstorm = async () => {
    if (thunderstormOutlook?.id) {
      const resp = await triggerThunderstormOutlookAISummaryGeneration({
        data: {
          reason: 'Triggered by user regeneration',
          outlookRefId: thunderstormOutlook.id,
        },
      });
      if (resp.error) {
        toast.error(
          `Failed to regenerate thunderstorm outlook AI summary: ${resp.error}`,
        );
      } else if (resp.message) {
        toast.success(resp.message);
      }
    }
  };

  const generatedAt = getLatestDate([
    issuedWarningsAndWatches?.insertedAt,
    severeWeatherOutlookAISummary?.generatedAt,
    thunderstormOutlookAISummary?.generatedAt,
  ]);

  const isAIGenerating =
    isSevereWeatherOutlookAISummaryFetching ||
    isThunderstormOutlookAISummaryFetching;

  const handleGeneratedAtClick = () => {
    console.log(
      `\n*** AI Summary Generation Time Details ***\nissuedWarningsAndWatches: ${issuedWarningsAndWatches?.id}\ninsertedAt: ${issuedWarningsAndWatches?.insertedAt}\n\nsevereWeatherOutlook: ${severeWeatherOutlook?.id}\n\nthunderstormOutlook: ${thunderstormOutlook?.id}\n\nsevereWeatherOutlookAISummary: ${severeWeatherOutlookAISummary?.id}\ngeneratedAt: ${severeWeatherOutlookAISummary?.generatedAt}\n\nthunderstormOutlookAISummary: ${thunderstormOutlookAISummary?.id}\ngeneratedAt: ${thunderstormOutlookAISummary?.generatedAt}\n*******************************\n`,
    );
  };

  useIdleTimer({
    onIdle: () => {
      console.log('User is idle');
    },
    onActive: async () => {
      console.log('User is active');
      await refetchIssuedWarningsAndWatches();
      await refetchSevereWeatherOutlook();
      await refetchThunderstormOutlook();
      await refetchSevereWeatherOutlookAISummary();
      await refetchThunderstormOutlookAISummary();
    },
    timeout: 1000 * 60 * 30,
    throttle: 500,
  });

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {isRefDataLoading ? (
        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
          <Progress value={loadingProgress} className="w-100" />
          <span className="text-sm animate-pulse">
            Loading reference data...
          </span>
        </div>
      ) : (
        <>
          <div className="flex gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold" onClick={handleGeneratedAtClick}>
                AI Generated At:{' '}
              </span>
              {isAIGenerating ? (
                <Skeleton className="w-36 h-6" />
              ) : (
                generatedAt && (
                  <span className="text-gray-600 font-normal">
                    {DateTime.fromJSDate(generatedAt).toFormat(
                      'h:mm a EEE, d LLL yyyy',
                    )}
                  </span>
                )
              )}
            </div>
            <RegenerateButtonGroup
              regenerateAll={regenerateAll}
              regenerateSevereWether={regenerateSevereWether}
              regenerateThunderstorm={regenerateThunderstorm}
              isAIGenerating={isAIGenerating}
            />
          </div>
          {summaries.map((summary) => (
            <SummaryItem
              key={summary.date.toISODate()}
              {...summary}
              isSevereWeatherOutlookAISummaryFetching={
                isSevereWeatherOutlookAISummaryFetching
              }
              isThunderstormOutlookAISummaryFetching={
                isThunderstormOutlookAISummaryFetching
              }
            />
          ))}
        </>
      )}
    </div>
  );
}

function RegenerateButtonGroup({
  regenerateAll,
  regenerateSevereWether,
  regenerateThunderstorm,
  isAIGenerating,
}: {
  regenerateAll: () => void;
  regenerateSevereWether: () => void;
  regenerateThunderstorm: () => void;
  isAIGenerating: boolean;
}) {
  return (
    <ButtonGroup>
      <Button
        className="cursor-pointer ml-4"
        variant="outline"
        onClick={regenerateAll}
        disabled={isAIGenerating}
      >
        Regenerate
        <RefreshCw className={cn(isAIGenerating && 'animate-spin')} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More Options">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-65">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={regenerateSevereWether}>
              <IoRainy className="text-black" />
              Severe Weather Outlook Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={regenerateThunderstorm}>
              <AiFillThunderbolt className="text-black" />
              Thunderstorm Outlook Only
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}

export const useSevereWeatherOutlookAISummary = (outlookRefId: string) =>
  useQuery({
    enabled: false,
    queryKey: ['aiSevereWeatherOutlookSummary', outlookRefId],
    queryFn: () =>
      getSevereWeatherOutlookAISummaryById({ data: { outlookRefId } }),
    refetchOnWindowFocus: false,
  });

export const useThunderstormOutlookAISummary = (outlookRefId: string) =>
  useQuery({
    enabled: false,
    queryKey: ['aiThunderstormOutlookSummary', outlookRefId],
    queryFn: () =>
      getThunderstormOutlookAISummaryById({ data: { outlookRefId } }),
    refetchOnWindowFocus: false,
  });

const triggerThunderstormOutlookAISummaryGeneration = createServerFn()
  .inputValidator((data: { reason: string; outlookRefId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const resp = await axios.get<string>(
        `${process.env.MAIN_SERVICES_URL!}/regen-ai-thunderstorm-summary`,
        {
          params: data,
        },
      );
      return { message: resp.data };
    } catch (error) {
      console.error(
        'Error triggering thunderstorm outlook AI summary generation:',
        error,
      );
      return { error: `${error}` };
    }
  });

const triggerSevereWeatherOutlookAISummaryGeneration = createServerFn()
  .inputValidator((data: { reason: string; outlookRefId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const resp = await axios.get<string>(
        `${process.env.MAIN_SERVICES_URL!}/regen-ai-severe-weather-summary`,
        {
          params: data,
        },
      );
      return { message: resp.data };
    } catch (error) {
      console.error(
        'Error triggering severe weather outlook AI summary generation:',
        error,
      );
      return { error: `${error}` };
    }
  });

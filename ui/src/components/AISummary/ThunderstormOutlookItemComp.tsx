import { cn } from '@/lib/utils';
import {
  removeActiveThunderstormOutlookReference,
  setActiveThunderstormOutlookReference,
  store,
} from '@/store';
import type { AIThunderstormOutlookSummaryDocument } from '@/types';
import { useStore } from '@tanstack/react-store';
import type { DateTime } from 'luxon';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { CopyIcon } from '../CopyIcon';
import { formatAreasList, formatDuration } from './utils';

export function ThunderstormOutlookItemComp({
  date,
  outlook,
}: {
  date: DateTime;
  outlook: AIThunderstormOutlookSummaryDocument['content'][number]['summary'][number];
}) {
  const formattedDuration = formatDuration(outlook.when);
  const textContent = `${formattedDuration ? `During ${formattedDuration}, ` : ''}there is ${outlook.risk.toLowerCase()} risk of thunderstorms${
    outlook.areas.length > 0 ? ` for ${formatAreasList(outlook.areas)}` : ''
  }.`;

  return (
    <span>
      {formattedDuration
        ? `During the ${formattedDuration}, there is `
        : 'There is '}
      <span className="underline lowercase">{outlook.risk}</span> risk of
      thunderstorms
      {outlook.areas.length > 0 ? ` for ${formatAreasList(outlook.areas)}` : ''}
      .
      <span className="inline-flex px-1 gap-1 items-baseline relative top-0.5">
        <OutlookRefIcon
          date={date}
          quotes={outlook.quotes}
          keywords={outlook.keywords}
        />
        <CopyIcon content={textContent} />
      </span>
    </span>
  );
}

function OutlookRefIcon({
  date,
  quotes,
  keywords,
}: {
  date: DateTime;
  quotes: string[];
  keywords: string[];
}) {
  const activeThunderstormOutlookReference = useStore(
    store,
    (state) => state.activeThunderstormOutlookReference,
  );
  const isActive =
    activeThunderstormOutlookReference &&
    activeThunderstormOutlookReference.date === date.toISODate() &&
    activeThunderstormOutlookReference.quotes.toString() ===
      quotes.toString() &&
    activeThunderstormOutlookReference.keywords.toString() ===
      keywords.toString();

  const onClick = () => {
    if (!isActive) {
      setActiveThunderstormOutlookReference({
        quotes,
        keywords,
        date: date.toISODate()!,
      });
    } else {
      removeActiveThunderstormOutlookReference();
    }
  };

  return (
    <AiOutlineFileSearch
      className={cn(
        ' text-gray-300 cursor-pointer hover:text-yellow-500 relative top-0.5',
        isActive && 'text-yellow-500',
      )}
      size={16}
      onClick={onClick}
    />
  );
}

import { cn } from '@/lib/utils';
import {
  removeactiveSevereWeatherOutlookReference,
  setActiveSevereWeatherOutlookReference,
  store,
} from '@/store';
import type { AISevereWeatherOutlookSummaryDocument } from '@/types';
import { useStore } from '@tanstack/react-store';
import type { DateTime } from 'luxon';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { CopyIcon } from '../CopyIcon';
import { formatAreasList } from './utils';

export function SevereWeatherOutlookItemComp({
  date,
  outlook,
}: {
  date: DateTime;
  outlook: AISevereWeatherOutlookSummaryDocument['content'][number]['summary'][number];
}) {
  const name = outlook.upgradeTo.toLowerCase();
  const event = name.includes('rain')
    ? 'rainfall'
    : name.includes('wind')
      ? 'strong gales'
      : name.includes('thunderstorm')
        ? 'thunderstorms'
        : name;
  const criteria = name.includes('warning')
    ? 'warning'
    : name.includes('watch')
      ? 'watch'
      : name;
  const areas = outlook.areas.length > 0 ? formatAreasList(outlook.areas) : '';

  const textContent = `There is ${outlook.chance.toLowerCase()} confidence that ${event} will reach ${criteria} criteria${
    areas ? ` for ${areas}` : ''
  }.`;

  return (
    <span>
      There is <span className="underline">{outlook.chance.toLowerCase()}</span>{' '}
      confidence that {event} will reach {criteria} criteria
      {areas ? ` for ${areas}` : ''}.
      <span className="inline-flex gap-1 items-baseline relative top-0.5">
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
  const activeSevereWeatherOutlookReference = useStore(
    store,
    (state) => state.activeSevereWeatherOutlookReference,
  );
  const isActive =
    activeSevereWeatherOutlookReference &&
    activeSevereWeatherOutlookReference.date === date.toISODate() &&
    activeSevereWeatherOutlookReference.quotes.toString() ===
      quotes.toString() &&
    activeSevereWeatherOutlookReference.keywords.toString() ===
      keywords.toString();

  const onClick = () => {
    if (!isActive) {
      setActiveSevereWeatherOutlookReference({
        quotes,
        keywords,
        date: date.toISODate()!,
      });
    } else {
      removeactiveSevereWeatherOutlookReference();
    }
  };

  return (
    <AiOutlineFileSearch
      className={cn(
        'relative top-0.5 inline align-text-bottom ml-1 text-gray-300 cursor-pointer hover:text-yellow-500',
        isActive && 'text-yellow-500',
      )}
      size={16}
      onClick={onClick}
    />
  );
}

import { cn } from '@/lib/utils';
import {
  removeActiveAlertReference,
  setActiveAlertReference,
  store,
} from '@/store';
import type {
  AISevereWeatherOutlookSummaryDocument,
  AIThunderstormOutlookSummaryDocument,
} from '@/types';
import type { IssuedAlert } from '@/types/alert';
import { formatAlertName, sortAlerts } from '@/utils';
import { useStore } from '@tanstack/react-store';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { LuFileSearch2 } from 'react-icons/lu';
import { CopyIcon } from '../CopyIcon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Skeleton } from '../ui/skeleton';
import { AlertIndicator } from './AlertIndicator';
import { SevereWeatherOutlookItemComp } from './SevereWeatherOutlookItemComp';
import { ThunderstormOutlookItemComp } from './ThunderstormOutlookItemComp';
import { formatAreasList, groupAlerts } from './utils';

export type Summary = {
  date: DateTime<true>;
  issuedWarningsAndWatches: IssuedAlert[];
  severeWeatherOutlookAISummary: AISevereWeatherOutlookSummaryDocument['content'][number]['summary'];
  thunderstormOutlookAISummary: AIThunderstormOutlookSummaryDocument['content'][number]['summary'];
  isSevereWeatherOutlookAISummaryFetching: boolean;
  isThunderstormOutlookAISummaryFetching: boolean;
};

export function SummaryItem({
  date,
  issuedWarningsAndWatches,
  severeWeatherOutlookAISummary,
  thunderstormOutlookAISummary,
  isSevereWeatherOutlookAISummaryFetching,
  isThunderstormOutlookAISummaryFetching,
}: Summary) {
  const groupedIssuedWarningsAndWatchesToday = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(
        ({ onset, _status }) =>
          DateTime.fromISO(onset).hasSame(date, 'day') && _status !== 'removed',
      ),
    );
  }, [issuedWarningsAndWatches, date]);

  const groupedIssuedWarningsAndWatchesRemaining = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(
        ({ onset, expires, _status }) => {
          return (
            !DateTime.fromISO(onset).hasSame(date, 'day') &&
            !DateTime.fromISO(expires).hasSame(date, 'day') &&
            _status !== 'removed'
          );
        },
      ),
    );
  }, [issuedWarningsAndWatches, date]);

  const groupedIssuedWarningsAndWatchesEnd = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(
        ({ onset, expires, _status }) => {
          return (
            DateTime.fromISO(expires).hasSame(date, 'day') &&
            !DateTime.fromISO(onset).hasSame(date, 'day') &&
            _status !== 'removed'
          );
        },
      ),
    );
  }, [issuedWarningsAndWatches, date]);

  const highRiskThunderstormOutlookAISummary = useMemo(() => {
    return thunderstormOutlookAISummary.filter(({ risk }) => risk === 'High');
  }, [thunderstormOutlookAISummary]);

  const moderateRiskThunderstormOutlookAISummary = useMemo(() => {
    return thunderstormOutlookAISummary.filter(
      ({ risk }) => risk === 'Moderate',
    );
  }, [thunderstormOutlookAISummary]);

  const lowRiskThunderstormOutlookAISummary = useMemo(() => {
    return thunderstormOutlookAISummary.filter(({ risk }) => risk === 'Low');
  }, [thunderstormOutlookAISummary]);

  return (
    <div className="flex flex-col" key={date.toISODate()}>
      <span className="font-semibold">{date.toFormat('cccc dd LLLL')}</span>
      <div>
        {issuedWarningsAndWatches.length > 0 &&
          groupedIssuedWarningsAndWatchesToday.length > 0 && (
            <ul className="text-sm">
              {groupedIssuedWarningsAndWatchesToday.map((group) => (
                <li className="py-2" key={group[0].id}>
                  <IssuedAlerts issuedWarningsAndWatches={group} date={date} />
                </li>
              ))}
            </ul>
          )}
        {groupedIssuedWarningsAndWatchesRemaining.length > 0 && (
          <ul className="text-sm">
            {groupedIssuedWarningsAndWatchesRemaining.map((group) => (
              <li className="py-2" key={group[0].id}>
                <IssuedAlertsRemaining
                  issuedWarningsAndWatches={group}
                  date={date}
                />
              </li>
            ))}
          </ul>
        )}
        {groupedIssuedWarningsAndWatchesEnd.length > 0 && (
          <ul className="text-sm">
            {groupedIssuedWarningsAndWatchesEnd.map((group) => (
              <li className="py-2" key={group[0].id}>
                <IssuedAlertsEnd issuedWarningsAndWatches={group} date={date} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {isSevereWeatherOutlookAISummaryFetching ? (
        <Skeleton className="h-6 w-full my-1" />
      ) : (
        severeWeatherOutlookAISummary.length > 0 && (
          <>
            <div>
              <ul className="text-sm list-disc pl-6 space-y-1">
                {severeWeatherOutlookAISummary
                  .filter(({ chance }) => chance !== 'Low')
                  .map((outlook, index) => (
                    <li className="py-2" key={index}>
                      <SevereWeatherOutlookItemComp
                        date={date}
                        outlook={outlook}
                      />
                    </li>
                  ))}
              </ul>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="Low_Confidence_Severe_Weather_Outlook">
                <AccordionTrigger>
                  <span className="underline cursor-pointer text-xs text-gray-400">
                    Low Confidence Severe Weather Outlook
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="text-sm list-disc pl-6 space-y-1">
                    {severeWeatherOutlookAISummary
                      .filter(({ chance }) => chance === 'Low')
                      .map((outlook, index) => (
                        <li className="py-2" key={index}>
                          <SevereWeatherOutlookItemComp
                            date={date}
                            outlook={outlook}
                          />
                        </li>
                      ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )
      )}
      {isThunderstormOutlookAISummaryFetching ? (
        <Skeleton className="h-6 w-full my-1" />
      ) : (
        thunderstormOutlookAISummary.length > 0 && (
          <>
            <ThunderstormOutLookBrief
              summary={highRiskThunderstormOutlookAISummary}
              date={date}
            />
            <ThunderstormOutLookBrief
              summary={moderateRiskThunderstormOutlookAISummary}
              date={date}
            />

            <Accordion type="single" collapsible>
              <AccordionItem value="Low_Confidence_Thunderstorm_Outlook">
                <AccordionTrigger>
                  <span className="underline cursor-pointer text-xs text-gray-400">
                    Low Confidence Thunderstorm Outlook
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ThunderstormOutLookBrief
                    summary={lowRiskThunderstormOutlookAISummary}
                    date={date}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )
      )}
      {!isSevereWeatherOutlookAISummaryFetching &&
        !isThunderstormOutlookAISummaryFetching &&
        issuedWarningsAndWatches.length === 0 &&
        severeWeatherOutlookAISummary.length === 0 &&
        thunderstormOutlookAISummary.length === 0 && (
          <MinimalRiskSevereWeatherOutlook />
        )}
    </div>
  );
}

function ThunderstormOutLookBrief({
  summary,
  date,
}: {
  summary: Summary['thunderstormOutlookAISummary'];
  date: DateTime<boolean>;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const areas = summary.flatMap((o) => o.areas);

  if (summary.length === 0) {
    return null;
  }

  const risk = summary[0].risk;
  const textContent = `There is a ${risk.toLowerCase()} risk of thunderstorms for ${formatAreasList(areas)}.`;
  return (
    <div className="inline-flex flex-col pl-6">
      <li className="text-sm py-2">
        There is a <span className="underline lowercase">{risk}</span> risk of
        thunderstorms for {formatAreasList(areas)}.{' '}
        <button
          onClick={() => setIsDetailsOpen((s) => !s)}
          className="text-sm text-blue-600 hover:underline inline-block w-28"
        >
          {isDetailsOpen ? 'Hide details ▲' : 'Show details ▼'}
        </button>
        <span className="inline-flex relative top-0.5 left-1">
          <CopyIcon content={textContent} />
        </span>
      </li>
      {isDetailsOpen && (
        <ul className="text-sm pl-6 space-y-1 list-[square]">
          {summary.map((outlook, index) => (
            <li className="py-2 marker:text-gray-400" key={index}>
              <ThunderstormOutlookItemComp date={date} outlook={outlook} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IssuedAlerts({
  issuedWarningsAndWatches,
  date,
}: {
  issuedWarningsAndWatches: IssuedAlert[];
  date: DateTime;
}) {
  const issuedWarningOrAlert = issuedWarningsAndWatches[0];
  const isMultipleAreas = issuedWarningsAndWatches.length > 1;

  let upgradeTo = '';
  const name = issuedWarningOrAlert.headline.toLowerCase();
  if (name.includes('watch')) {
    upgradeTo = 'warning';
  } else if (name.includes('warning - orange')) {
    upgradeTo = 'red warning';
  } else if (name.includes('warning')) {
    upgradeTo = 'red warning';
  }

  const chance = issuedWarningOrAlert.ChanceOfUpgrade;

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex min-h-full">
        <AlertIndicator data={issuedWarningOrAlert} />
      </div>
      <span>
        {isMultipleAreas ? (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              MetService has issued{' '}
              {formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)}{' '}
              for the following areas:
              <div>
                <CopyIcon
                  content={`MetService has issued ${formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)} for the following areas:`}
                />
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-1">
              {issuedWarningsAndWatches.map(
                ({ id, areaDesc, ChanceOfUpgrade }, idx) => {
                  const content = `${areaDesc.length > 0 ? areaDesc : 'Multiple areas'}. ${ChanceOfUpgrade && upgradeTo ? `There is a ${ChanceOfUpgrade.toLowerCase()} confidence of upgrading to a ${upgradeTo}` : ''}.`;
                  return (
                    <li key={idx}>
                      {areaDesc.length > 0 ? areaDesc : 'Multiple areas'}
                      {ChanceOfUpgrade && upgradeTo && (
                        <span>
                          . There is a{' '}
                          <span className="underline lowercase">
                            {ChanceOfUpgrade}
                          </span>{' '}
                          confidence of upgrading to a {upgradeTo}
                        </span>
                      )}
                      <span>.</span>
                      <div className="inline-flex justify-center items-baseline gap-1 relative top-0.5">
                        <AlertRef date={date} alertIds={[id]} />
                        <CopyIcon content={content} />
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        ) : (
          <>
            A {formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)}{' '}
            has been issued{' '}
            {issuedWarningOrAlert.areaDesc.length > 0 && (
              <>for {issuedWarningOrAlert.areaDesc}</>
            )}
            {chance && upgradeTo && (
              <span>
                . There is a{' '}
                <span className="underline">{chance.toLowerCase()}</span>{' '}
                confidence of upgrading to a {upgradeTo}
              </span>
            )}
            <span>.</span>
            <div className="inline-flex justify-center items-baseline gap-1 relative top-0.5">
              <AlertRef date={date} alertIds={[issuedWarningOrAlert.id]} />
              <CopyIcon
                content={`A ${formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)} has been issued ${issuedWarningOrAlert.areaDesc.length > 0 ? `for ${issuedWarningOrAlert.areaDesc}` : ''}${chance && upgradeTo ? `. There is a ${chance.toLowerCase()} confidence of upgrading to a ${upgradeTo}` : ''}.`}
              />
            </div>
          </>
        )}
      </span>
    </div>
  );
}

function IssuedAlertsRemaining({
  issuedWarningsAndWatches,
  date,
}: {
  issuedWarningsAndWatches: IssuedAlert[];
  date: DateTime;
}) {
  const issuedWarningOrAlert = issuedWarningsAndWatches[0];
  const allAreas = issuedWarningsAndWatches.flatMap((a) =>
    a.areaDesc.split(',').map((area) => area.trim()),
  );
  const isMultipleAreas = issuedWarningsAndWatches.length > 1;
  const content = isMultipleAreas
    ? `The ${formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)} remain in place for ${formatAreasList(allAreas)}.`
    : `The ${formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)} remains in place for ${formatAreasList(allAreas)}.`;
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex justify-center min-h-full">
        <AlertIndicator data={issuedWarningOrAlert} />
      </div>
      <span>
        <div className="flex gap-1">
          {content}
          <div className="inline-flex justify-center items-baseline gap-1 relative top-0.5">
            <AlertRef
              date={date}
              alertIds={issuedWarningsAndWatches.map((m) => m.id)}
            />
            <CopyIcon content={content} />
          </div>
        </div>
      </span>
    </div>
  );
}

function IssuedAlertsEnd({
  issuedWarningsAndWatches,
  date,
}: {
  issuedWarningsAndWatches: IssuedAlert[];
  date: DateTime;
}) {
  const issuedWarningOrAlert = issuedWarningsAndWatches[0];
  const allAreas = issuedWarningsAndWatches.flatMap((a) =>
    a.areaDesc.split(',').map((area) => area.trim()),
  );
  const isMultipleAreas = issuedWarningsAndWatches.length > 1;

  const content = isMultipleAreas
    ? `The ${formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)} remain in place for ${formatAreasList(allAreas)}.`
    : `The ${formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)} remains in place for ${formatAreasList(allAreas)} until ${`${DateTime.fromISO(issuedWarningOrAlert.expires).toFormat('HHmm')}hrs`} today.`;

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex justify-center min-h-full">
        <AlertIndicator data={issuedWarningOrAlert} />
      </div>
      <span>
        <div className="flex gap-1">
          <div>
            {content}
            <div className="inline-flex justify-center items-baseline gap-1 relative top-0.5">
              <AlertRef
                date={date}
                alertIds={issuedWarningsAndWatches.map((m) => m.id)}
              />
              <CopyIcon content={content} />
            </div>
          </div>
        </div>
      </span>
    </div>
  );
}

function AlertRef({ date, alertIds }: { date: DateTime; alertIds: string[] }) {
  const activeAlertReference = useStore(
    store,
    (state) => state.activeAlertReference,
  );
  const isActive =
    activeAlertReference &&
    activeAlertReference.date === date.toISODate() &&
    activeAlertReference.alertIds.toString() === alertIds.toString();

  const onClick = () => {
    if (!isActive) {
      setActiveAlertReference({
        alertIds,
        date: date.toISODate()!,
      });
    } else {
      removeActiveAlertReference();
    }
  };

  return (
    <LuFileSearch2
      className={cn(
        'inline align-text-bottom ml-2 text-gray-300 cursor-pointer hover:text-blue-500 relative top-0.5',
        isActive && 'text-blue-500',
      )}
      size={16}
      onClick={onClick}
    />
  );
}

function MinimalRiskSevereWeatherOutlook() {
  return (
    <div className="flex items-center gap-1">
      <div className="text-sm py-2">
        There is <span className="underline">minimal</span> risk of severe
        weather.
      </div>
      <CopyIcon content="There is minimal risk of severe weather." />
    </div>
  );
}

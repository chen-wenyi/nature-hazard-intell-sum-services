import { useThunderstormOutlook } from '@/queries';

import { getThunderstormOutlookCollection } from '@/lib/mongodb';
import type { ThunderstormOutlook, ThunderstormOutlookResp } from '@/types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export function RevisionHistory() {
  const { data: outlook } = useThunderstormOutlook();

  const issuedDateStrs = outlook?.items.map((item) =>
    item.issuedDate.split(', ')[1].trim(),
  );

  // if every issued date is the same, assign only one date string
  const uniqueIssuedDateStrs = Array.from(new Set(issuedDateStrs));

  const issuedDateStr =
    uniqueIssuedDateStrs.length === 1 ? uniqueIssuedDateStrs[0] : '';

  const { data: revisionHistory } = useQuery({
    enabled: !!outlook && !!issuedDateStr,
    queryKey: ['thunderstormOutlookRevisionHistory', outlook?.id],
    queryFn: async () =>
      getThunderstormOutlookHistory({ data: { dateStr: issuedDateStr } }),
    staleTime: Infinity,
  });

  if (!revisionHistory || revisionHistory.length <= 1) {
    return <></>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Revision History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw]! h-[80vh]">
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
        {<DiffViewer items={revisionHistory.map(({ items }) => items)} />}
      </DialogContent>
    </Dialog>
  );
}

export function DiffViewer({ items }: { items: ThunderstormOutlookResp[] }) {
  const outlookStrs = items.map((item) =>
    item
      .map(({ header, outlook, issuedDate }) => {
        return `\n{title}${header}\n${outlook.replaceAll('\n', ' \n')}\n \n{issued}Issued: ${issuedDate}`;
      })
      .join('\n \n'),
  );

  console.log('outlookStrs', outlookStrs);

  const length = outlookStrs.length;
  if (length < 2) {
    return <div>No previous summary to compare.</div>;
  }

  const [oldIndex, setOldIndex] = useState(length - 2);
  const [newIndex, setNewIndex] = useState(length - 1);

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex pb-2">
        <div className="flex-1 flex items-center justify-center">
          <ButtonGroup>
            <Button disabled size="sm" variant="outline">
              Revision
            </Button>
            {Array.from({ length }).map((_, idx) => (
              <Button
                size="sm"
                variant={idx === oldIndex ? 'default' : 'outline'}
                key={idx}
                onClick={() => setOldIndex(idx)}
              >
                {idx + 1}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ButtonGroup>
            <Button disabled size="sm" variant="outline">
              Revision
            </Button>
            {Array.from({ length }).map((_, idx) => (
              <Button
                size="sm"
                variant={idx === newIndex ? 'default' : 'outline'}
                key={idx}
                onClick={() => setNewIndex(idx)}
              >
                {idx + 1}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <ReactDiffViewer
          extraLinesSurroundingDiff={5}
          oldValue={outlookStrs[oldIndex]}
          newValue={outlookStrs[newIndex]}
          splitView={true}
          hideLineNumbers={true}
          compareMethod={DiffMethod.WORDS}
          showDiffOnly={false}
          renderContent={(str) => {
            if (!str) return str;
            if (str.startsWith('{title}')) {
              return <strong>{str.replace('{title}', '')}</strong>;
            } else if (str.startsWith('{issued}')) {
              return <em>{str.replace('{issued}', '')}</em>;
            } else {
              return str;
            }
          }}
        />
      </div>
    </div>
  );
}

type DDMMM = string; // 29 Jan or 9 Jan
const getThunderstormOutlookHistory = createServerFn()
  .inputValidator((data: { dateStr: DDMMM }) => data) // DD MMM format
  .handler(
    async ({
      data,
    }): Promise<(ThunderstormOutlook & { insertedAt: Date })[]> => {
      const collection = await getThunderstormOutlookCollection();

      const query = {
        items: {
          $ne: [],
          $not: {
            $elemMatch: {
              issuedDate: { $not: { $regex: data.dateStr } },
            },
          },
        },
      };

      const outlooks = await collection
        .find(query, { sort: { insertedAt: 1 } })
        .toArray();

      return outlooks.map((outlook) => ({
        insertedAt: outlook.insertedAt,
        id: outlook._id.toString(),
        items: outlook.items,
        refIssuedDates: outlook.refIssuedDates,
      }));
    },
  );

import { Badge } from '@/components/ui/badge';
import { formatUTCToNZDate } from '@/lib/utils';

import type { IssuedAlert } from '@/types/alert';
import { AlertIndicator } from './AlertIndicator';
import { DetailsToggle } from './DetailsToggle';
import { getPeriodDescription } from './utils';

export function AlertHistory({ history }: { history: IssuedAlert[] }) {
  return (
    <div>
      <div className="flex items-center justify-center">
        <h4 className="font-bold mb-4">Timeline ({history.length})</h4>
      </div>
      <div className="w-full px-4 max-h-160 overflow-y-auto text-[0.9rem]">
        {history.map((i, index) => (
          <div
            key={i.id}
            className="mb-4 w-full border p-4 rounded-md shadow bg-white"
          >
            <div className="text-xs mb-1 flex items-center relative">
              <span onClick={() => console.log(i.id)}>
                {formatUTCToNZDate(new Date(i.sent))}
              </span>
              {index === 0 && (
                <Badge className="absolute right-0 mx-2">Latest</Badge>
              )}
            </div>
            <AlertIndicator data={i} />
            <div>
              <span className="font-bold">Area: </span>
              <span>{i.areaDesc.replace(/,/g, ', ')}</span>
            </div>
            <div>
              <span className="font-bold">Period: </span>
              <span>{getPeriodDescription(i.onset, i.expires)}</span>
            </div>
            <div>
              <span className="font-bold">ChanceOfUpgrade: </span>
              <span>{i.ChanceOfUpgrade || 'N/A'}</span>
            </div>
            <div>
              <DetailsToggle issuedAlert={i} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

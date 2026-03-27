import { cn } from '@/lib/utils';
import type { IssuedAlert } from '@/types/alert';
import { useState } from 'react';
import { analyseDescription } from './utils';

export function DetailsToggle({ issuedAlert }: { issuedAlert: IssuedAlert }) {
  const [open, setOpen] = useState(false);
  const detail = analyseDescription(issuedAlert.description);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="text-sm text-blue-600 hover:underline mt-2"
      >
        {open ? 'Hide details ▲' : 'Show details ▼'}
      </button>
      <div
        className={cn(
          'transition-[opacity,max-height] duration-200 overflow-hidden mt-2',
          open ? 'opacity-100 max-h-500' : 'opacity-0 max-h-0',
        )}
        aria-hidden={!open}
      >
        <>
          {detail.forecast && (
            <div>
              <span className="font-bold">Forecast: </span>
              <span>{detail.forecast || 'N/A'}</span>
            </div>
          )}
          {detail.changes && (
            <div>
              <span className="font-bold">Changes: </span>
              <span>{detail.changes || 'N/A'}</span>
            </div>
          )}
          {detail.impact && (
            <div>
              <span className="font-bold">Impact: </span>
              <span>{detail.impact || 'N/A'}</span>
            </div>
          )}
          <div className="mt-2">
            <table className="w-full text-xs table-auto border border-gray-200 rounded">
              <thead>
                <tr>
                  <th className="text-center font-semibold pr-4 px-2 py-1">
                    Urgency
                  </th>
                  <th className="text-center font-semibold pr-4 px-2 py-1">
                    Severity
                  </th>
                  <th className="text-center font-semibold px-2 py-1">
                    Certainty
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center pr-4 px-2 py-1 border-t border-gray-200">
                    {issuedAlert.urgency || 'N/A'}
                  </td>
                  <td className="text-center pr-4 px-2 py-1 border-t border-gray-200">
                    {issuedAlert.severity || 'N/A'}
                  </td>
                  <td className="text-center px-2 py-1 border-t border-gray-200">
                    {issuedAlert.certainty || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      </div>
    </>
  );
}

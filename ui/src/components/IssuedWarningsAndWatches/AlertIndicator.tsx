import type { IssuedAlert } from '@/types/alert';
import { formatAlertName } from '@/utils';
import { HeavyRain } from '../warnings-and-watches-indicators/heavy-rain';
import { SevereThunderstorm } from '../warnings-and-watches-indicators/severe-thunderstorm';
import { StrongWind } from '../warnings-and-watches-indicators/strong-wind';
import { COLOR_CODE_MAP } from './utils';

export function AlertIndicator({ data }: { data: IssuedAlert }) {
  const event = data.event.toLowerCase();
  const colorCode = data.ColourCode;
  const level = colorCode?.toLowerCase()
    ? COLOR_CODE_MAP[colorCode.toLowerCase()]
    : '';

  const formattedName = formatAlertName(data.headline);

  if (event === 'thunderstorm') {
    return (
      <h3 className="flex items-center gap-2 font-semibold text-sm">
        <div className="w-8 h-8 ">
          {level && <SevereThunderstorm level={level} />}
        </div>
        {formattedName}
      </h3>
    );
  } else if (event === 'rain') {
    return (
      <div className="flex items-center gap-2 font-semibold text-sm">
        <div className="w-8 h-8">{level && <HeavyRain level={level} />}</div>
        {formattedName}
      </div>
    );
  } else if (event === 'wind') {
    return (
      <div className="flex items-center gap-2 font-semibold text-sm">
        <div className="w-8 h-8">{level && <StrongWind level={level} />}</div>
        {formattedName}
      </div>
    );
  } else {
    return <h3 className="font-semibold">{formattedName}</h3>;
  }
}

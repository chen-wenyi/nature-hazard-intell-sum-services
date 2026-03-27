import type { IssuedAlert } from '@/types/alert';
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

  if (event === 'thunderstorm') {
    return (
      <div className="w-8 h-8 shrink-0">
        {level && <SevereThunderstorm level={level} />}
      </div>
    );
  } else if (event === 'rain') {
    return (
      <div className="w-8 h-8 shrink-0">
        {level && <HeavyRain level={level} />}
      </div>
    );
  } else if (event === 'wind') {
    return (
      <div className="w-8 h-8 shrink-0">
        {level && <StrongWind level={level} />}
      </div>
    );
  } else {
    return <></>;
  }
}

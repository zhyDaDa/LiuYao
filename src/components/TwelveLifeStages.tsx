import type { ElementName } from "../types/basicTerms";
import { LIFE_STAGE_BRANCHES, LIFE_STAGE_NAMES } from "../types/basicTerms";

interface TwelveLifeStagesProps {
  element: ElementName;
}

export function TwelveLifeStages({ element }: TwelveLifeStagesProps) {
  const branches = LIFE_STAGE_BRANCHES[element];

  return (
    <div
      className="calendar-band twelve-life-stages"
      aria-label={`${element}十二长生`}
    >
      {LIFE_STAGE_NAMES.map((stage) => (
        <div key={stage}>
          <span>{stage}</span>
          <strong>{branches[stage]}</strong>
        </div>
      ))}
    </div>
  );
}

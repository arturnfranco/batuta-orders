export const STATUSES = ['CREATION','PREPARATION','DISPATCH','DELIVERY'] as const;

export type Status = typeof STATUSES[number];

export function isValidStatus(status: Status): status is Status {
  return STATUSES.includes(status);
}

export function getIndex(status: Status): number {
  return STATUSES.indexOf(status);
}

export function getPrevStatus(status: Status): Status | undefined {
  const idx = getIndex(status);
  return idx > 0 ? STATUSES[idx - 1] : undefined;
}

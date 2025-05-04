export const TOURNAMENT_PREDICTION_CLOSING_TIME = '2025-05-09T18:00:00+05:30';

export function isMatchTimeBelowSixtyMins(matchDateTime: string | Date): boolean {
    const timeDiff = getTimeDifference(matchDateTime);
    return timeDiff.hours == 0 && timeDiff.minutes < 60;
}

export function isMatchOpenForUpdateResult(matchDateTime: string | Date): boolean {
    const timeDiff = getTimeDifference(matchDateTime);
    return timeDiff.hours <= -4;
}

export function isMatchToday(matchDateTime: string | Date): boolean {
    const matchDate = new Date(matchDateTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return matchDate.toDateString() === today.toDateString();
}

export function isTournamentPredictionClosed(): boolean {
    const closeDate = new Date(TOURNAMENT_PREDICTION_CLOSING_TIME); // IST
    const now = new Date();
    
    // If deadline has passed
    if (now >= closeDate) {
      return true;
    } else return false;
}

function getTimeDifference(providedDateTime: string | Date): { hours: number; minutes: number } {
    const currentTime = new Date();
    const diffInMs = new Date(providedDateTime).getTime() - currentTime.getTime();

    const diffInMinutes = Math.floor(diffInMs / 60000);
    return { hours: Math.floor(diffInMinutes / 60), minutes: diffInMinutes % 60 };
}
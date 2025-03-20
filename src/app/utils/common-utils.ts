export function isMatchTimeBelowSixtyMins(matchDateTime: string | Date): boolean {
    const timeDiff = getTimeDifference(matchDateTime);
    return timeDiff.hours == 0 && timeDiff.minutes < 60;
}

export function getTimeDifference(providedDateTime: string | Date): { hours: number; minutes: number } {
    const currentTime = new Date();
    const diffInMs = new Date(providedDateTime).getTime() - currentTime.getTime();

    const diffInMinutes = Math.floor(diffInMs / 60000);
    return { hours: Math.floor(diffInMinutes / 60), minutes: diffInMinutes % 60 };
}
export interface Match {
    matchNo: string;
    dateTime: string;
    home: string;
    away: string;
    homeLogo: string;
    awayLogo: string;
    isLocked: boolean;
    isToday: boolean;
    predictionLockingTime: string;
    isPredicted: boolean;
    name?: string;
}

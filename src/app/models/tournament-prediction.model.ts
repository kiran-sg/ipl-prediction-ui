import { User } from "./user.model";

export interface TournamentPrediction {
    predictionId: number;
    userId: string;
    user: User;
    orangeCapPredictedId: number | null;
    purpleCapPredictedId: number | null;
    emergingPlayerPredictedId: number | null;
    fairPlayTeamPredictedId: number | null;
    mostFoursPredictedId: number | null;
    mostSixesPredictedId: number | null;
    mostDotBallsPredictedId: number | null;
    bestBowlingFigPredictedId: number | null;
    playerOfTournamentPredictedId: number | null;
    points: number;
}

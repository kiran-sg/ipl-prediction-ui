import { User } from "./user.model";

export interface TournamentPrediction {
    predictionId: number;
    userId: string;
    user: User;
    orangeCapPredicted: string;
    purpleCapPredicted: string;
    emergingPlayerPredicted: string;
    fairPlayTeamPredicted: string;
    mostFoursPredicted: string;
    mostSixesPredicted: string;
    mostDotBallsPredicted: string;
    bestBowlingFigPredicted: string;
    points: number;
}
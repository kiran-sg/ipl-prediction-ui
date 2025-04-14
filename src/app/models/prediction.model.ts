import { MatchResult } from "./match-result";
import { User } from "./user.model";

export interface Prediction {
    predictionId: number;
    matchId: string;
    match: string;
    matchDate: string;
    matchResult: MatchResult;
    userId: string;
    user: User
    userName: string;
    location: string;
    tossPredicted: string;
    firstInnScorePredicted: string;
    teamPredicted: string;
    momPredicted: string;
    mostRunsScorerPredicted: string;
    mostWicketsTakerPredicted: string;
    points: number;
}
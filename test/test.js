
import { assert } from "chai";
import {
    createGame,
    createUser,
    twoPairScore,
    smallStraightScore,
    largeStraightScore
} from "../server/logik.js";

describe("dice-logik", () => {
    describe("twoPairScore", () => {
        it("giver 0 point, når der ikke er to par", () => {
            assert.equal(twoPairScore([1,2,3,4,5]), 0);
        });

        it("Beregner korrekte point ved to par", () => {
            assert.equal(twoPairScore([1,3,4,4,3]), 14);
        });
    });

    describe("createGame", () => {
        it("holder terninger og kastetæller adskilt mellem spil", () => {
            const firstGame = createGame();
            const secondGame = createGame();

            firstGame.holdDie(0);
            firstGame.rollRandomDice();

            assert.equal(firstGame.getHeldDice()[0], true);
            assert.equal(secondGame.getHeldDice()[0], false);
            assert.equal(firstGame.getCounter(), 2);
            assert.equal(secondGame.getCounter(), 3);
        });

        it("holder scorekort og totalscore adskilt mellem spil", () => {
            const firstGame = createGame();
            const secondGame = createGame();

            firstGame.holdScore(0);

            assert.equal(firstGame.getHeldScores()[0], true);
            assert.equal(secondGame.getHeldScores()[0], false);
            assert.equal(firstGame.calculateTotalSum(), 1);
            assert.equal(secondGame.calculateTotalSum(), 0);
        });

        it("opretter brugeren med username som id", () => {
            const user = createUser("Lucas");

            assert.equal(user.id, "Lucas");
            assert.equal(user.username, "Lucas");
            assert.equal(user.game.getCounter(), 3);
        });
    });

    describe("smallStraightScore", () => {
        it("Giver 15 points for 1-2-3-4-5", () => {
            assert.equal(smallStraightScore([1,2,3,4,5]), 15);
        });
    
        it("Giver 0 points, hvis der ikke er small straight", () => {
            assert.equal(smallStraightScore([1,3,2,6,5]), 0);
        });
    });

    describe("largeStraightScore", () => {
        it("Giver 20 point for 2-3-4-5-6", () => {
            assert.equal(largeStraightScore([2,3,4,5,6]), 20);
        });

        it("Giver 0 point hvis der ikke er large straight", () => {
            assert.equal(largeStraightScore([2,3,4,4,1]), 0);
        });
    });
});
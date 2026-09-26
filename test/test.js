
import { assert } from "chai";
import {
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
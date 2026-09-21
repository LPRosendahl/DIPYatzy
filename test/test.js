
import { assert } from "chai";
import {
    dice,
    twoPairScore,
    smallStraightScore,
    largeStraightScore
} from "../server/logik.js";

describe("dice-logik", () => {
    it("indeholder fem terninger", () => {
        assert.lengthOf(dice, 5);
    });

    it("indeholder terninger med værdier fra 1 til 6", () => {
        dice.forEach(value => {
            assert.isAtLeast(value, 1);
            assert.isAtMost(value, 6);
        });
    });

    it("giver 0 point for two pair, når der ikke er to par", () => {
        assert.equal(twoPairScore(), 0);
    });

    it("giver 15 point for small straight", () => {
        assert.equal(smallStraightScore(), 15);
    });

    it("Giver 20 point for large straight", () => {
        dice.splice(0, 5, 2, 3, 4, 5, 6)
        assert.equal(largeStraightScore(), 20);
    });

    it("")
});
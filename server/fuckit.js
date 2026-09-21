function randomDiceValue() {
	return Math.floor(Math.random() * 6) + 1;
}

let dice = Array.from({ length: 5 }, randomDiceValue);



console.log(dice);
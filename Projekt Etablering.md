# Yatzy Project 2 - Arbejdsplan

## Aftalt spilflow

- Singleplayer: Spilleren starter et privat spil.
- Multiplayer: Spillere tilmelder sig én fælles lobby med deres navn.
- Multiplayer kan først startes, når mindst to spillere er tilmeldt.
- Når spillet starter, følger turene tilmeldingsrækkefølgen. Nye spillere kan ikke tilslutte sig under spillet.
- Scoreboardet rangerer spillerne efter samlet score og opdateres efter hvert scorevalg.
- Scoreboardet vises til højre både i menuen og på spilsiden.

## Allerede på plads

- [x] Express-server og grundlæggende Yatzy-ruter.
- [x] Spilside med terninger og scorekort.
- [x] Facade, som sender GET- og POST-kald til serveren.
- [x] Pug-, Express-session- og Express-afhængigheder i projektet.

## Trin 1 - Vis Pug-menuen

- [ ] Lad Express bruge `MainMenu.pug` som visning.
- [ ] Vis menuen på `/` i stedet for spillets `index.html`.
- [ ] Fjern standardnavn og eksempelresultater fra menuen.
- [ ] Kontrollér, at menuens CSS og side stadig indlæses korrekt.

**Hvorfor først:** Vi skal have den rigtige startside på plads, før menuens knapper kan føre videre til spillet.

## Trin 2 - Lav valg mellem singleplayer og multiplayer

- [ ] Tilføj et navnefelt og en knap til at starte singleplayer.
- [ ] Tilføj en knap til at tilmelde sig multiplayer-lobbyen.
- [ ] Vis tilmeldte multiplayer-spillere i menuen.
- [ ] Tilføj en startknap, som først kan bruges, når mindst to spillere er tilmeldt.
- [ ] Forhindr nye tilmeldinger, efter multiplayer-spillet er startet.

**Hvorfor nu:** Serveren skal vide, hvem der spiller, og hvilken spiltype der vælges, før den kan oprette den rigtige spiltilstand.

## Trin 3 - Gem spiller og spiltilstand på serveren

- [ ] Knyt spillerens navn og spiltype til spillerens session.
- [ ] Giv hver singleplayer og multiplayer-spiller sit eget terninge- og scorekort.
- [ ] Lad kun den aktive spiller udføre handlinger i multiplayer.
- [ ] Gå videre til næste spiller, når den aktive spiller vælger en scorekategori.
- [ ] Aftal og implementér, hvornår multiplayer-spillet slutter.

**Hvorfor nu:** Først når serveren holder styr på spillere og ture, kan klienten vise korrekte data og forhindre handlinger på andres ture.

## Trin 4 - Vis og opdatér scoreboardet

- [ ] Vis spillernes aktuelle totalscore i menuens scoreboard.
- [ ] Vis det samme scoreboard til højre på spilsiden.
- [ ] Opdatér scoreboardet efter hvert scorevalg.
- [ ] Vis hvis det er spillerens tur, eller hvem der skal spille.
- [ ] Deaktivér spilhandlinger, når det ikke er spillerens tur.

**Hvorfor nu:** Scoreboard og turstatus kræver spiller- og scoredata fra serveren.

## Trin 5 - Test hele spilforløbet

- [ ] Test singleplayer fra menu til afsluttet scorekort.
- [ ] Test multiplayer med mindst to separate browser-sessioner.
- [ ] Kontrollér, at spillerne får ture i tilmeldingsrækkefølge.
- [ ] Kontrollér, at scoreboardet ændres efter hvert scorevalg.
- [ ] Test serveren på localhost.
- [ ] Test tilslutning fra en anden enhed på samme netværk via serverens IP-adresse.

**Hvorfor til sidst:** Når sider, sessioner og API-kald er samlet, kan hele forløbet testes på samme måde, som det skal bruges.

## Mulige udvidelser

- [ ] Gem spillere og spiltilstand, så de overlever en servergenstart.
- [ ] Vis statistik som highscore eller gennemsnitlig score.

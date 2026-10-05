# Hyponet

Hyponet er alting:

1. gem tekst
2. forbind tekst ved at markere

## Hyponet er en model

* brugere markerer data
* uddybninger analyseres
* tekst dukker op baseret på associationer

## Opbygning

Dette repo er kun UI'et (HTML + jQuery). Der er ingen logik i js-filen – alle noder og relationer oprettes i neo4j via
backend-solutionen `hyponet_api`, som UI'et kalder på `https://localhost:44380` (se `main.js`).

| UI-element         | Node i neo4j |
|--------------------|--------------|
| rød boks           | grundnode    |
| grøn boks          | SPEC-node (uddybning) |
| gul markering      | MARK-node    |
| lilla boks         | ASS-node (association/output) |

## Kør lokalt

1. Start neo4j og `hyponet_api` (kører på `https://localhost:44380`).
2. Server denne mappe som statiske filer, fx på port 8080 (som i `.vscode/launch.json`):
   `npx http-server -p 8080` eller `python -m http.server 8080`, eller åbn `Hyponet.sln` i Visual Studio.
3. Åbn `http://localhost:8080`.

# Hyponet

Hyponet er alting:

1. gem tekst
2. forbind tekst ved at markere

## Hyponet er en model

* brugere markerer data
* uddybninger analyseres
* tekst dukker op baseret på associationer

## Opbygning

UI'et er HTML + jQuery i roden af repoet. Der er ingen logik i js-filen – alle noder og relationer oprettes i neo4j via
backenden `hyponet_api` (ASP.NET Core / .NET 6) i mappen `api/`. UI'et kalder den på `https://localhost:44380` (se `main.js`).

Adressen kan overskrives med `?api=`, fx `http://localhost:8080/?api=http://localhost:5080`.

Endpoints som `main.js` bruger: `Node/Create`, `Node/CreateMarkNode`, `Node/MergeMarkNodes`, `Node/FindAssToRelateTo`,
`Node/ChooseOutputNode/{id}`, `Node/FindNode` og `Relation/Create` (POST med formdata, undtagen `ChooseOutputNode`).
`Node/Delete` med `scope=all` er kun tilladt når backenden kører i Development.

| UI-element         | Node i neo4j |
|--------------------|--------------|
| rød boks           | grundnode    |
| grøn boks          | SPEC-node (uddybning) |
| gul markering      | MARK-node    |
| lilla boks         | ASS-node (association/output) |

## Kør lokalt

1. Start neo4j (4.4 med APOC), fx:
   `docker run -d -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/<kodeord> -e NEO4JLABS_PLUGINS='["apoc"]' neo4j:4.4`
2. Start backenden. Forbindelsen sættes via miljøvariabler (eller `dotnet user-secrets`) – læg aldrig kodeord i `appsettings.json`:
   ```
   cd api
   Neo4j__Uri=bolt://localhost:7687 Neo4j__User=neo4j Neo4j__Password=<kodeord> dotnet run
   ```
   I Visual Studio kører den på `https://localhost:44380`.
3. Server denne mappe som statiske filer, fx på port 8080 (som i `.vscode/launch.json`):
   `npx http-server -p 8080` eller `python -m http.server 8080`, eller åbn `Hyponet.sln` i Visual Studio.
4. Åbn `http://localhost:8080`.

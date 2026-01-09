# Refleksjonsrapport - Programmering med KI

## 1. Gruppeinformasjon

**Gruppenavn:** SG - NextGenCoding

**Gruppemedlemmer:**
- Henrik Bøe - henrik.boe@himolde.no

**Dato:** 23.11.2025

---

## 2. Utviklingsprosessen

### 2.1 Oversikt over prosjektet
Vi har utviklet en webapplikasjon som gjør om forelesningsnotater til AI-genererte sammendrag og quizzes. 
Hovedformålet var å tilby studenter en ny måte å lære på, samt tenkte vi at dette kunne gi lærere og undervisere et verktøy for å enklere lage sammendrag og quizzer for sine studenter. 
Applikasjonen skal ta notater og bruke AI til å generere sammendrag og quizzes. Dette skal gjøre at det blir lettere å tilegne seg kunnskap. 
Systemet støtter opplasting av dokumenter (PDF/TXT), generering av kortfattede sammendrag og strukturerte quizspørsmål med svar.
Målet var å lage en brukervennlig, sikker og effektiv plattform som kan hjelpe studenter med å forbedre sin læring gjennom AI-drevne verktøy.

### 2.2 Arbeidsmetodikk
Arbeidet ble gennomført ved hjelp av BMAD-rammeverket. BMAD ga oss en tydelig plan på hvilke prosesser vi skulle gjennom, som brainstorming, research, design og så videre.
Gemini var AI-modellen som ble brukt sammen med BMAD for å gjennomføre utviklingen av applikasjonen. 
Git og GitHub ble brukt for versjonskontroll.
Teams ble brukt som kommunikasjonskanal.

### 2.3 Teknologi og verktøy
De viktigste verktøyene i vår applikasjon:
- Frontend: Next.js 14+, TypeScript, Tailwind CSS, Shadcn UI
- Backend: FastAPI (Python) for REST-endpoints
- Database: Supabase (PostgreSQL) med RLS og Supabase Auth for brukerpålogging
- KI-modell: Gemini 2.5 Pro/Flash for sammendrag, quizgenerering og feedback

### 2.4 Utviklingsfaser (timeline)
Nedenfor ser du en oppsatt timeline for prosjektet. Grunnet diverse endringer og hendelser hadde vi noen avvik fra denne.
- Phase 1 & 2 (Uke 44): Analyse, krav og planlegging
- Phase 3 (Uke 45-46): Løsningsarkitektur, DB-design og UI/UX mockups
- Phase 4 (Uke 47-48): Implementasjon, testing og deploy

Av diverse grunner ble det noen endringer i timeline, og vi havnet litt bak skjema. Dette gjorde at enkelte uker ble mer hektiske enn planlagt.

Den reelle timelineen ble som følger:
- Uke 1 av prosjekt: Opprettelse av proposal og gjennomføring av brainstorming og research.
- Uke 2: Opprettelse av Product brief og begynnelse på PRD.
- Uke 3: Fullføring av PRD, opprettelse av epics og user stories.
- Uke 4: Opprettelse av UX-design og validering av dette.
- uke 5: Arkitekturoppsett og begynnelse på implementasjon.
- Uke 6-7: Implementasjon og utvikling av applikasjonen. 

---
**Fase 1: Planlegging**

**Fase 1 besto av flere ulike steg hvor ulike agenter ble tatt i bruk:**
#### Analyse-agenten: 
*Steg 1: Opprettelse av proposal* 
- Her skulle vi beskrive hva vi ønsket å lage. Vi brukte en del tid på denne jobben og gikk også tilbake for å gjøre nødvendige endringer underveis i prosjektet. 
- Proposal var avgjørende for å sikre at KI-verktøyene forstod hva vi ønsket å lage. Proposal var avgjørende for de senere stegene i prosessen og en mer detaljert proposal ville gitt bedre resultater i de senere stegene.

*steg 2: Initiering av prosjektet*
- Her kjørte vi en "Workflow init" kommando i Gemini CLI for å lage en workflow-status fil. 
- Dette skulle brukes som en mal for resten av prosjektet.
- Denne ble ikke brukt i de senere delene av prosjektet, ettersom vi benyttet oss av "project-plan.md" filen for å styre utviklingen.

*steg 3: Brainstorming og research*
- Her kjørte vi gjennom en runde med brainstorming, hvor vi så på funksjonaliteten i applikasjonen vår. 
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi analyst-agenten som hjalp oss med denne prosessen. 
- Proposal ble brukt for å gi KI-en kontekst om hva vi ønsket å lage.
- Prompt for brainstorming: Brainstorming.json

- Research ble gjennomført hvor vi undersøkte hvilke KI-biblioteker som var aktuelle for LLM-komunikasjoenen i vårt prosjekt. 
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi analyst-agenten som hjalp oss med denne prosessen.
- Proposal ble brukt for å gi KI-en kontekst om hva vi ønsket å lage.
- Prompt for research: Research.json

*steg 4: Product brief*
- Her opprettet vi en product brief som beskrev hovedfunksjonaliteten i applikasjonen vår. 
- Dette dokumentet ble brukt som en referanse senere i prosjektet. 
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi Analyst-agenten som hjalp oss med denne prosessen.
- Her brukte vi Proposal-dokumentet som grunnlag for å lage en mer konkret beskrivelse av produktet vårt.
- Prompt for product brief: product-brief.json

#### PM-agenten:
*Steg 5: Opprettelse av PRD*
- Her opprettet vi et Product Requirements Document (PRD) som spesifiserte kravene til applikasjonen vår.
- Dette dokumentet ble brukt som en referanse for utviklingen.
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi PM-agenten som hjalp oss med denne prosessen.
- Prompt for PRD: PRD.json

*Steg 6: opprettelse av Epics og stories* 
- Her opprettet vi epics og user stories basert på PRD-dokumentet.
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi PM-agenten som hjalp oss med denne prosessen.
- Prompt for epics og stories: Epics-and-Stories.json

*Steg 7: Validering av PRD*
- Her validerte vi PRD-dokumentet for å sikre at det var komplett og korrekt.
- Det var også nødvendig med epics og user stories for å kunne validere PRD-en, derfor måtte vi lage epics og stories som steg 6. 
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi PM-agenten som hjalp oss med denne prosessen.
- Prompt for validering av PRD: PRD-Validation.json

#### UX-designer-agenten:
*Steg 8: Opprettelse av UX-design*
- Her opprettet vi en UX-design for applikasjonen vår.
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi UX-designer-agenten som hjalp oss med denne prosessen.
- Dette var en veldig interaktiv del, hvor vi gjennom komuniskasjon med KI-en lagde et design vi ble fornøyde med. 
- Som del av denne prosessen ble flere filer oprettet: 
  - ux-design-directions.html
  - ux-color-themes.html
  - ux-design-specification.md
  - videre lagde vi også noen mockups for å se hvordan designet vårt ville se ut i praksis.
- Prompt for UX-design: UX-design.json, UX-design2.json

*Steg 9: validering av UX-design*
- Her validerte vi UX-designet for å sikre at det oppfylte kravene. 
- Denne prosessen ble først kjørt en gang, hvor vi fikk tilbakemeldinger om at det var flere nødvendige endrigner som måtte gjøres.
- Etter første validering, ga vi KI-en tilbakemeldinger på hva som måtte endres, for å endre på designet. 
- Deretter kjørte vi valideringen på nytt, og fikk et bedre resultat. 
- Her ble agenten UX-designer brukt for valideringen.
- Prompt for validering av UX-design: design-validation.json, changes-to-design.json, design-validation-2.json

#### Arkitekt-agenten:
*Steg 10: opprettelse av arkitektur*
- Her opprettet vi arkitekturen for applikasjonen vår.
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi Arkitekt-agenten som hjalp oss med denne prosessen.
- Prompt for arkitektur: Architecture.json

*steg 11: Kvalitetssikring av Epics og stories*
- Her kvalitetssikret vi epics og user stories for å sikre at de var komplette og korrekte.
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi Arkitekt-agenten som hjalp oss med denne prosessen.
- Epic og stories var godt utviklet fra den tidligere fasen, så det var ingen endringer som måtte gjøres her. 

*steg 12: test design av arkitektur*
- Her testet vi arkitekturen for å sikre at den oppfylte kravene.
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi test-agenten som hjalp oss med denne prosessen.
- Prompt for test av arkitektur: test-design.json

*steg 13: solutioning-gate-check*
- Her gjennomførte vi en solutioning-gate-check for å sikre at vi var klare for implementasjonsfasen.
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi Arkitekt-agenten som hjalp oss med denne prosessen.
- Prompt for solutioning-gate-check: solutioning-gate-check.json

**Fase 2: Utvikling**

Da alle stegene i planleggingsfasen var fullført, kunne vi begynne på utviklingsfasen.
Implementasjonsfasen besto av flere ulike steg. 

*steg 1: sprint-planlegging og opprettelse av sprint-status*
- i denne fasen planla vi sprintene våre basert på epics og user stories som var opprettet i planleggingsfasen.
- Ved hjelp av BMAD-rammeverket og Gemini, kjørte vi SM-agenten som hjalp oss med denne prosessen.
- Som et resultat av denne prosessen ble en sprint-status fil opprettet som skulle brukes for å styre utviklingen i implementasjonsfasen og sikre at utviklingen ble gjort riktig.
- Prompt for sprint-planlegging: sprint-planning.json

*steg 2:*
I denne fasen jobbet vi inkrementelt, hvor vi tok for oss en og en epic av gangen, og en og en story i utviklingen.
For hver epic gjennomførte vi følgende steg:
- Opprettelse av Epic-context
- Validering av Epic-context
 
Dette ble gjort i forkant av utviklingsprosessen for hver epic, for å sikre at KI-en forstod hva som skulle utvikles.

*steg 3:*
Videre ble følgene steg gjennomført for hver user story i epicen:
- opprettelse av story
- validering av story
- Opprettelse av task-context
- Validering av task-context
- oppdater sprint-status med story "ready-for-dev"

*steg 4:*
Deretter ble utviklingsprossessen gjennomført:
- Utvikling av story
- Kodegjennomgang og testing av generert kode
- (om nødvendig) feilretting og forbedring av kode
- Oppdatering av sprint-status med story "done"

*steg 5:*
Etter at alle stories i en epic var ferdig utviklet, ble følgende steg gjennomført:
- Epic-retrospective
- Oppdatering av sprint-status med epic "done"

Disse stegen ble gjennomført for alle epicene i prosjektet, inntil hele applikasjonen var ferdig utviklet.
- Epic 1: fundamentet, Oppsett av frontend og backend, med intgrasjon mot Supabase. 
- Epic 2: Login og brukerautentisering
- Epic 3: Filopplasting og KI-integrasjon for sammendrag
- Epic 4: Quiz-generering og KI-tilbakemelding
- Epic 5: Historikk over tidligere sammendrag og quizzer, samt filopplastninger.

## 3. Utfordringer og løsninger

### 3.1 Tekniske utfordringer

**Utfordring 1: KI fant ikke filene**
- Problem: Etterhver som prosjektet vokste, slet KI-en med å finne filene i prosjektet. Jeg fikk flere ganger feilmeldinger om at filer som allerede fantes i prosjektet, ikke var laget. 
- Løsning: Måten vi løste dette på var å spesifisere filnavn og sti for å få KI-en til å finne filene når KI-en ikke fant dem selv. Dette gjorde at utviklingen tok lengre tid enn nødvendig, men førte ikke til noen store problemer. 
- KI sin rolle: Her lå problemet hos KI-en, som ikke klarte å finne filene når prosjektet ble større. Heldigvis var det ikke et stort problem, da vi enkelt kunne "rette på" KI-en ved å spesifisere filnavn og sti.

**Utfordring 2: Tom for requests**
- Problem: Dette var ikke et problem i planleggingsfasen, men ble en virkelig utfordring i implementasjonsfasen. Her ble mange requests brukt opp veldig fort, noe som gjorde at utviklingen tok lengre tid enn forventet.
- Løsning: En løsning vi tok i bruk var å benytte oss av en "fallback"-modell for deler av utviklingen. Dette gjorde at vi kunne fortsette utviklingen uten å måtte vente på at requestene skulle bli fylt opp igjen. Dette førte til at utviklingsoppgavene vi hadde startet på kunne bli ferdigstilt uten for store forsinkelser.
- KI sin rolle: Det var KI-en selv som ga oss muligheten til å benytte oss av en "fallback"-modell når vi gikk tom for requests. Dette var en nyttig funksjon som gjorde at vi kunne fortsette og ferdigstille de oppgavene vi var i gang med. 

### 3.2 Samarbeidsutfordringer
**Sammarbeidsutfordring: Manglende initiativ av Gruppemedlemmer**
- Problem: Jeg har opplevd store vansker når det kommer til sammarbeid i gruppen. Det tok lang tid før jeg i det hele tatt fikk kontakt med de andre, og når jeg først fikk det var det vanskelig å få til et godt samarbeid, da de ikke gjennomførte oppgavene sine som avtalt. 
- Løsning: Løsningen på denne utfordringer var at jeg rett og slett måtte gjøre alt arbeidet selv. Etter forsøkene om å få de andre med på laget ikke fungerte, valgte jeg å gå videre alene for å sikre at prosjektet ble ferdigstilt innen fristen.

### 3.3 KI-spesifikke utfordringer

**KI-utfordring 1: formatering og placeholders**
- Problem: Det oppsto situasjoner hvor KI-en slet med formatering av dokumenter og genererte filer med placeholders som ikke ble fjernet. Dette førte til at jeg måtte gå over dokumentene for å fikse formattering og innhold. Dette var mest sannsynlig et resultat av at KI-en tok i bruk en mal ved generering av dokumenter, hvor noen punkter ikke ble fylt ut korrekt, som gjorde at placeholders ble stående igjen i dokumentene.
- Løsning: Dette ble løst ved at jeg explicit ba KI-en om å kvalitetssikre dokumentene den selv hadde laget, for å sørge for at det var riktig format og innhold.

**KI-utfordring 2: overskriving av filer**
- Problem: Det oppsto noen situasjoner hvor KI-en overskrev tidligere lagrede filer i prosjektet. Dette skjedde eksempelvis når jeg gjennomførte validering av epic-context for de ulike epicene. I stedet for å lage en ny fil for epic-2, skrev den over epic-1 filen. Dette førte til at jeg mistet noe informasjon som jeg hadde skrevet tidligere. Dette skjedde siden valideringene ble gjort på samme dag, og fikk dermed det samme filnavnet. Jeg fant heldigvis ut at dette ble gjort tidlig, så jeg slapp å gjøre mye av arbeidet på nytt.
- Løsning: Løsningen på dette problemet var at jeg måtte be KI-en om å lagre filene med unike navn for hver epic, og spesifisere hvilken epic det gjaldt. Valideringen av Epic 1, fikk jeg laget på nytt ved å åpne den lagrede chatten med Gemini CLI for valideringen av epic-1 og ba den lage en ny fil med spesifikt navn for epic-1. 

**KI-utfordring 3: problemer med interaktiv modus**
- Problem: Under utviklingsprosessen opplevde jeg flere ganger at Gemini CLI sin interaktive modus sluttet å fungere. Dette skjedde i implementasjonsfasen, hvor KI-en var avhengig av min tilatelse for å kjøre visse operasjoner. Dette skjedde blant annet ved flere anledninger når KI-en skulle laste ned ulike biblioteker som var nødvendige for prosjektet. 
- Løsning: Jeg fant ingen kjempegod løsning på dette problemet. Det oppsto flere ganger og jeg måtte velge ulike løsninger ved de ulike anledningene. Noen ganger løste det seg ved å restarte Gemini CLI, mens andre ganger måtte jeg kjøre kommandoene utenfor  Gemini CLI for å la KI-en slippe, for å unngå at den "sto fast" i interaktiv modus.

---

## 4. Kritisk vurdering av KI sin påvirkning

### 4.1 Fordeler med KI-assistanse


**Effektivitet og produktivitet:**
Bruken av KI hadde en tydelig positiv effekt på arbeidshastigheten. Det ville tatt betydelig lengre tid å utvikle en tilsvarende løsning uten KI-støtte. Dette merket vi både i planleggings- og implementasjonsfasen. I planleggingsfasen hjalp KI oss med å strukturere tanker og ideer raskt, dette gjorde at vi raskt kom i gang med prosjektet og fikk utviklet en tydelig visjon for applikasjonen. I implementasjonsfasen gjorde KI-en kodegenerering og problemløsning mye raskere enn om vi skulle gjort alt manuelt.


**Læring og forståelse:**
Arbeidet ga oss innsikt i at KI er et svært kraftig verktøy når det brukes riktig. KI kan bidra til bedre forståelse på enkelte områder, men kan også hemme læringen ved at man ikke alltid trenger å utvikle kode selv. Samtidig forutsetter effektiv bruk at man kvalitetssikrer resultatene KI genererer og sørger for at de stemmer med prosjektets krav. Vi erfarte også at presise og gjennomtenkte prompt er avgjørende for å få gode og relevante svar.


**Kvalitet på koden:**
KI bidro til bedre struktur og kvalitet i koden. I kombinasjon med BMAD-rammeverket fikk vi en mer systematisk tilnærming til utviklingsprosessen, noe som gjorde det enklere å bruke KI effektivt og målrettet.

### 4.2 Begrensninger og ulemper


**Kvalitet og pålitelighet:**
Vi støtte på utfordringer der KI ikke leverte det vi forventet. Blant annet oppstod situasjoner hvor KI ikke klarte å finne filer i prosjektet, eller hvor Gemini ikke fulgte definerte workflow-steg. Disse problemene ble gradvis redusert etter justeringer i både BMAD-rammeverket og måten vi jobbet på.

**Avhengighet og forståelse:**
Når man ser effektiviteten man oppnår ved bruk av KI, er det lett å bli avhengig.
Dette kan føre til at man mister viktige ferdigheter og forståelse for hvordan ting fungerer "under panseret".
Det kan også føre til at man ser feil eller mangler, men ikke forstår helt hvorfor eller hvor feilen ligger. Man mister litt oversikten over hva som er hvor.


**Kreativitet og problemløsning:**
Vi opplevde at KI noen ganger begrenset vår egen kreativitet. Spesielt når det gjald design av UX/UI.
Vi hadde våre ideer om hvordan vi ønsket at applikasjonen skulle se ut og fungere, men opplevde at det var vanskelig å lage det slik vi så det for oss.
KI gjorde kanskje at designet ble litt forenklet og litt mer "standardisert" enn det vi egentlig ønsket oss.
Likevel var KI nyttig i design-prosessen, og hadde vi brukt mere tid i denne fasen ville vi nok fått et bedre resultat som lå nærmere vår opprinnelige visjon.
Positivt var det at KI ofte utfordret oss til å tenke annerledes og vurdere alternative løsninger.


### 4.3 Sammenligning: Med og uten KI
Dersom vi skulle gjennomføre dette prosjektet uten bruk av KI, ville det nok mest sannsynlig ikke blitt ferdig på den gitte tiden vi hadde. 
KI var helt avgjørende i utviklingsprosessen. 
Skulle vi gjennomført et slit prosjekt uten KI-hjelp, ville vi trengt langt mer tid, og ikke minst en god del mer kunskap. 


### 4.4 Samlet vurdering
Samlet sett var KI en positiv og helt avgjørende faktor for at prosjektet lot seg gjennomføre. 
Vi sitter igjen med betydelig lærdom om både applikasjonsutvikling og om hvordan man kan bruke KI-verktøy på en effektiv måte. 
Det er ingen tvil i mine øyne om at prosjektet ikke ville blitt realisert på samme nivå – eller i det hele tatt – uten KI-assistanse.

---

## 5. Etiske implikasjoner

### 5.1 Ansvar og eierskap
- Når KI bidrar til utvikling av kode, er det fortsatt utvikleren som må stå ansvarlig for kvalitet, sikkerhet og eventuelle feil som oppstår.
- Koden som genereres av KI er dermed avhengig av utviklerens evne til å kvalitetssikre og validere resultatene.
- Når det gjelder opphavsrett og intellektuell eiendom, er det viktig å merke seg at koden generert av KI kan være basert på eksisterende kode og mønstre som KI-en har blitt trent på. Dette kan føre til spørsmål om eierskap og rettigheter knyttet til den genererte koden. I vårt prosjekt vil dette trolig ikke være noe problem, men det er viktig å være bevisst på dette i større prosjekter eller kommersielle sammenhenger.


### 5.2 Transparens
- Det bør være transparens rundt bruken av KI i utviklingsprosessen. God dokumentasjon av KI sitt bidrag er viktig for å sikre at alle involverte parter forstår hvordan koden er utviklet og hvilke verktøy som er brukt.
- I vårt prosjekt har vi dokumentert bruken av KI i denne refleksjonsrapporten, samt lagret våre prompts og chat-logger som vedlegg.
- Manglende åpenhet om KI-bruk kan føre til mistillit blant brukere og samarbeidspartnere, samt svekke tilitten til både resultatet og utviklingsprosessen.

### 5.3 Påvirkning på læring og kompetanse
- Bruk av KI kan føre til mer effektiv utvikling, men som konsekvens kan det også føre til at utviklere ikke utvikler nødvendige ferdigheter og forståelse for koding og problemløsning.
- Ved å kun benytte seg av KI, vil man risikere å ikke utvikle ferdigheter innen arkitekturoppsett, problemløsning og debugging. Dette er viktige ferdigheter for enhver utvikler, og det er essensielt å opprettholde og videreutvikle disse.
- Det er viktig å finne en balanse mellom å bruke KI for effektivitet og samtidig sørge for at man utvikler og opprettholder sine egne ferdigheter. Det å ha en god nok forståelse for hvordan ting fungerer "under panseret" er avgjørende, og vil dermed gjøre at man kan benytte seg av KI-verktøy som et hjelpemiddel framfor en erstatning for egen kunnskap.

### 5.4 Arbeidsmarkedet
- KI vil kunne ha påvirkning på hvilke roller som blir viktige i fremtiden. Roller som krever kreativitet, kritisk tenkning og problemløsning vil fortsatt være viktige, mens mer rutinepregede oppgaver kan bli automatisert.
- Utviklere som kan kombinere teknisk kompetanse med evnen til å forstå og utnytte KI-verktøy vil være ettertraktet i arbeidsmarkedet.
- I en KI-drevet verden vil de grunnleggende ferdighetene innen programmering og systemforståelse fortsatt være viktige. Det å kunne unytte KI som et hjelpemiddel for å øke produktivitet og kvalitet vil være en verdifull ferdighet for fremtidige karrierer innen IT.

### 5.5 Datasikkerhet og personvern
- I vårt prosjekt delte vi ikke sensitiv informasjon med KI-verktøyene. Vi delte kun informasjon som var nødvendig for å utvikle applikasjonen. 
- Ved å dele kode og data med KI-verktøy, er det potensielle risikoer knyttet til datalekkasje og misbruk av informasjon. Det er viktig å være bevisst på hvilke data som deles, og sørge for at sensitive opplysninger ikke blir eksponert.
- Når man bruker KI, burde man følge "minste privelegium"-prinsippet, og kun dele den informasjonen som er absolutt nødvendig for å oppnå ønsket resultat.
- 

---

## 6. Teknologiske implikasjoner

### 6.1 Kodekvalitet og vedlikehold
- KI-kode er effektiv for å generere, men kan skape utfordringer på sikt dersom strukturen eller logikken ikke er tydelig. 
- KI kode er ikke alltid like lett å forstå som menneskeskrevet kode, spesielt dersom KI-en gir løsninger uten forklaring eller kontekst. 
- Det kan være vanskeligere og mer utfordrende å debugge KI-generert kode, siden man ikke kjenner til tankegangen bak løsningen på samme måte som med menneskeskrevet kode.

### 6.2 Standarder og beste praksis
- KI følger ikke alltid beste praksis og industristandarder. Det kan noen ganger foreslå løsninger som er utdaterte eller ikke optimale for den gitte konteksten.
- For eksempel opplevde vi at KI-en foreslo bruk av bilitokerer som vi ikke ønsket å bruke, eller foreslo arkitekturmønstre som ikke hørt til beskrivelsen av prosjektet vårt. Hadde vi ikke vært tydelige i beskrivelsen av prosjektet, kunne dette ført til at vi fikk en løsning som ikke passet våre behov.
- Dette understreker viktigheten av at utviklere må validere og kvalitetssikre KI-forslag. 

### 6.3 Fremtidig utvikling
- KI vil sannsynligvis bli et standard hjelpemiddel i programvareutvikling i fremtiden, og vil kunne automatisere mange rutineoppgaver og utvikling av "standard-oppsett" osv. 
- Dette vil gjøre at ferdigheter som kvalitetssikring og sikkerhet blir enda viktigere for utviklere. I tillegg vil ferdigheter som prompt-enginering og forståelse for hvordan man best utnytter KI-verktøy bli essensielle.
- KI kan som i dette faget bli brukt som et verktøy for å fremme forståelse for ulike prosesser innen prosjektutvikling, men det er viktig at man har en forståelse over at man ikke kan stole blindt på det som genereres.


---

## 7. Konklusjon og læring

### 7.1 Viktigste lærdommer
1. Grundig planlegging gir et tydelig fundament og reduserer misforståelser senere.
2. Presise og konkrete instruksjoner til KI gir bedre og mer relevante svar. 
3. Alltid gjennomgå og verifiser KI-generert innhold — det sikrer kvalitet, forståelse og kontroll. 
4. KI er et effektivt støtteverktøy, men menneskelig vurdering er fortsatt nødvendig. 

### 7.2 Hva ville dere gjort annerledes?

**Teknsike valg:**
Hadde jeg hatt mer kunnskap og erfaring da jeg skulle begynne med prosjektet ville det nok vært lettere å finne ut av hva som var nødvendig for mitt prosjekt.
Slik det ble nå tok jeg utgangspunkt i forslagene som foreleseren hadde gitt oss i starten av kurset, og valgte rammeverk og biblioteker basert på hva vi skulle gå gjennom. 
Dette var riktig nok ikke noe problem, men det gjorde at jeg egentlig ikke forstå hva de ulike rammeverkene og bibliotekene gjorde, og hvodan de skulle fungere i mitt prosjekt. 

**Bruk av KI:** 
KI ble brukt i stort sett alle delene av prosjektet. Selv om det er en effektiv måte å gjennomføre et slikt prosjekt på, ville jeg nok prøvd å bruke KI mer som et hjelpemiddel fremfor en erstatning for egen kunnskap.
Grunnet litt begrenset erfaring med både utvikling av applikasjoner og bruk av KI-verktøy, ble det litt for lett å lene seg på KI-en for mye.
Dette gjorde at jeg ikke fikk like god forståelse for hvordan ting fungerte "under panseret", samt hvilke rammeverk og biblioteker som var nyttig for mitt prosjekt. Dette har nok en del med erfaring å gjøre. 
Selv om KI ble brukt slik det ble, har jeg lært mye, og fått mye mer og bedre erfaring og forståelse enn ved vanlig "skolearbeid" og undervisning. Jeg brukte KI som et læringsverktøy, og det fungerte veldig bra.

**sammarbeid og organisering:**
Det er vanskelig å si så mye på, da jeg endte opp med å gjennomføre prosjektet alene. Men hadde jeg fått tidligere og bedre kontakt ville jeg nok prøvd å få organisert og satt opp arbeidsoppgaver tidlig. 
Jeg hadde også prøvd å få til en god komunikasjon og tydelig oversikt over hva som ble gjort av hvem. 

### 7.3 Anbefalinger
**Effektiv bruk av KI**
- Ha en tydelig og konkret plan før du begynner. Skaff deg en god forståelse for hva du ønsker å lage, og lag en detaljert beskrivelse av prosjektet ditt.
- Gjør planlegginsfasen grundig. Dette er fundamentet for prosjektet og hjelper med å unngå misforståelser senere i prosessen.
- Gi tydelige og konkrete instrukser til KI-en. Jo mer spesifikk du er, jo bedre resultater får du.
- Vær forberedt på å justere og tilpasse underveis. 
- Sørg for å kontrollere og prøve og forstå hva som blir laget. Dette vil gi en bedre forståelse og læringsopplevelse.

**Fallgruver å unngå**
- Ikke bare la KI-en generere alt uten å forstå hva som blir laget. Prøv å sette deg inn i hva og hvordan ting fungerer.
- Ikke stol blindt på det KI-en genererer.
- Ikke undervurder viktigheten av en god planleggingsfase. Og sørg for å vite hva som er gjort og hva som skal gjøres.
- Ikke vær redd for å eksperimentere og prøve nye ting. Det er en del av læringsprosessen.





### 7.4 Personlig refleksjon (individuelt)

**Henrik Bøe:**
Jeg hadde i forkant av dette prosjektet lite erfaring når det kom til hvordan man utvikler applikasjoner. Jeg har gjennom tidligere fag jobbet med både webutvikling og programmering, men sjeldent slått dette sammen til å lage en fungerende applikasjon.
Dermed så var det en del nytt jeg måtte lære meg gjennom dette faget. Kominasjonen av undervisning og arbeid selv har vært god, og gjort at jeg fikk den nødvendige forståelsen som trengtes. 
Prosjektarbeidet har jeg måtte gjennomføre selv, så jeg har vært avhengig av å forstå og gjennomføre alt selv. Dette har gjort at det har blitt en del jobb, men jeg sitte også igjen med å ha vært gjennom alt og alle delene av prosjektet. 
Planen for prosjektarbeidet var god og tydelig, noe som gjorde at det var lett å forstå hva som skulle gjøres og hva man skulle gjennom i løpet av prosjektet. 

Når jeg ser tilbake føler jeg at jeg sitter igjen med mye nyttig kunnskap. 
Jeg har fått en forståelse ovenfor arkitektur og hvordan ulike applikasjoner er satt opp for å fungere. 
Jeg har også lært å organisere arbeid i ulike faser, noe som gjør at man har tydlig arbeidsoppgaver til en hver tid. 
Jeg har lært viktigheten av god planlegging og viktigheten av å virkelig forstå hva man ønsker å utvikle. 

I tillegg sitter jeg igjen med mye kunnskap om hvordan KI kan brukes som et verktøy og hjelpemiddel ved utvikling av applikasjoner.
Her har jeg blant annet lært hvordan KI-en fungerer. i tillegg til hva som er viktig for å få gode resultater, som tydelige instruksjoner og god planlegging.
Bruk av KI har vært helt avgjørende for at jeg i det hele tatt har klart å gjennomføre dette prosjektet, og selv om den har gjort mye av arbeidet, har jeg lært mye gjennom å forstå hva som blir laget og hvordan ting fungerer.

---

## 8. Vedlegg (valgfritt)
- Lenke til GitHub repository: https://github.com/IBE160/SG-NextGenCoding.git
- Prompt-logg: se egen prompts-folder i github repo. 

---



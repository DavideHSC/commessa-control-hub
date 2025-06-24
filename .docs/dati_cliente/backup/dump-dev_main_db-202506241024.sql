--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 17.0

-- Started on 2025-06-24 10:24:33

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3633 (class 1262 OID 16384)
-- Name: dev_main_db; Type: DATABASE; Schema: -; Owner: dev_user
--

CREATE DATABASE dev_main_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE dev_main_db OWNER TO dev_user;

\connect dev_main_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 26311)
-- Name: public; Type: SCHEMA; Schema: -; Owner: dev_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO dev_user;

--
-- TOC entry 3634 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: dev_user
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 872 (class 1247 OID 26350)
-- Name: FormulaImporto; Type: TYPE; Schema: public; Owner: dev_user
--

CREATE TYPE public."FormulaImporto" AS ENUM (
    'imponibile',
    'iva',
    'totale'
);


ALTER TYPE public."FormulaImporto" OWNER TO dev_user;

--
-- TOC entry 869 (class 1247 OID 26344)
-- Name: SezioneScrittura; Type: TYPE; Schema: public; Owner: dev_user
--

CREATE TYPE public."SezioneScrittura" AS ENUM (
    'Dare',
    'Avere'
);


ALTER TYPE public."SezioneScrittura" OWNER TO dev_user;

--
-- TOC entry 866 (class 1247 OID 26334)
-- Name: TipoCampo; Type: TYPE; Schema: public; Owner: dev_user
--

CREATE TYPE public."TipoCampo" AS ENUM (
    'number',
    'select',
    'text',
    'date'
);


ALTER TYPE public."TipoCampo" OWNER TO dev_user;

--
-- TOC entry 863 (class 1247 OID 26322)
-- Name: TipoConto; Type: TYPE; Schema: public; Owner: dev_user
--

CREATE TYPE public."TipoConto" AS ENUM (
    'Costo',
    'Ricavo',
    'Patrimoniale',
    'Fornitore',
    'Cliente'
);


ALTER TYPE public."TipoConto" OWNER TO dev_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 26401)
-- Name: Allocazione; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."Allocazione" (
    id text NOT NULL,
    importo double precision NOT NULL,
    descrizione text,
    "rigaScritturaId" text NOT NULL,
    "commessaId" text NOT NULL,
    "voceAnaliticaId" text NOT NULL
);


ALTER TABLE public."Allocazione" OWNER TO dev_user;

--
-- TOC entry 218 (class 1259 OID 26379)
-- Name: BudgetVoce; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."BudgetVoce" (
    id text NOT NULL,
    importo double precision NOT NULL,
    "commessaId" text NOT NULL,
    "voceAnaliticaId" text NOT NULL
);


ALTER TABLE public."BudgetVoce" OWNER TO dev_user;

--
-- TOC entry 223 (class 1259 OID 26415)
-- Name: CampoDatiPrimari; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."CampoDatiPrimari" (
    id text NOT NULL,
    tipo public."TipoCampo" NOT NULL,
    descrizione text NOT NULL,
    nome text NOT NULL,
    opzioni text[],
    "voceTemplateId" text NOT NULL
);


ALTER TABLE public."CampoDatiPrimari" OWNER TO dev_user;

--
-- TOC entry 222 (class 1259 OID 26408)
-- Name: CausaleContabile; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."CausaleContabile" (
    id text NOT NULL,
    descrizione text NOT NULL,
    "externalId" text,
    nome text,
    "dataFine" timestamp(3) without time zone,
    "dataInizio" timestamp(3) without time zone,
    "noteMovimento" text,
    "tipoAggiornamento" text,
    "tipoMovimento" text,
    "tipoRegistroIva" text
);


ALTER TABLE public."CausaleContabile" OWNER TO dev_user;

--
-- TOC entry 225 (class 1259 OID 26485)
-- Name: Cliente; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."Cliente" (
    id text NOT NULL,
    "externalId" text,
    nome text NOT NULL,
    piva text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "codiceFiscale" text,
    cap text,
    "codicePagamento" text,
    "codiceValuta" text,
    cognome text,
    comune text,
    "comuneNascita" text,
    "dataNascita" timestamp(3) without time zone,
    indirizzo text,
    nazione text,
    "nomeAnagrafico" text,
    provincia text,
    sesso text,
    telefono text,
    "tipoAnagrafica" text
);


ALTER TABLE public."Cliente" OWNER TO dev_user;

--
-- TOC entry 227 (class 1259 OID 26520)
-- Name: CodiceIva; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."CodiceIva" (
    id text NOT NULL,
    "externalId" text,
    descrizione text NOT NULL,
    aliquota double precision,
    indetraibilita double precision,
    note text,
    "tipoCalcolo" text,
    "dataFine" timestamp(3) without time zone,
    "dataInizio" timestamp(3) without time zone
);


ALTER TABLE public."CodiceIva" OWNER TO dev_user;

--
-- TOC entry 217 (class 1259 OID 26372)
-- Name: Commessa; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."Commessa" (
    id text NOT NULL,
    nome text NOT NULL,
    "clienteId" text NOT NULL,
    descrizione text,
    "externalId" text,
    "parentId" text
);


ALTER TABLE public."Commessa" OWNER TO dev_user;

--
-- TOC entry 228 (class 1259 OID 26527)
-- Name: CondizionePagamento; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."CondizionePagamento" (
    id text NOT NULL,
    "externalId" text,
    descrizione text NOT NULL,
    codice text,
    "contoIncassoPagamento" text,
    "inizioScadenza" text,
    "numeroRate" integer,
    suddivisione text
);


ALTER TABLE public."CondizionePagamento" OWNER TO dev_user;

--
-- TOC entry 216 (class 1259 OID 26364)
-- Name: Conto; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."Conto" (
    id text NOT NULL,
    codice text,
    nome text NOT NULL,
    tipo public."TipoConto" NOT NULL,
    "richiedeVoceAnalitica" boolean DEFAULT false NOT NULL,
    "vociAnaliticheAbilitateIds" text[],
    "contropartiteSuggeriteIds" text[],
    "externalId" text,
    "voceAnaliticaId" text
);


ALTER TABLE public."Conto" OWNER TO dev_user;

--
-- TOC entry 231 (class 1259 OID 26560)
-- Name: FieldDefinition; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."FieldDefinition" (
    id text NOT NULL,
    start integer NOT NULL,
    length integer NOT NULL,
    "templateId" text NOT NULL,
    "fileIdentifier" text,
    "fieldName" text,
    format text
);


ALTER TABLE public."FieldDefinition" OWNER TO dev_user;

--
-- TOC entry 226 (class 1259 OID 26493)
-- Name: Fornitore; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."Fornitore" (
    id text NOT NULL,
    "externalId" text,
    nome text NOT NULL,
    piva text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "codiceFiscale" text,
    aliquota double precision,
    "attivitaMensilizzazione" integer,
    cap text,
    "codicePagamento" text,
    "codiceRitenuta" text,
    "codiceValuta" text,
    cognome text,
    comune text,
    "comuneNascita" text,
    "contributoPrevidenziale" boolean,
    "contributoPrevidenzialeL335" text,
    "dataNascita" timestamp(3) without time zone,
    enasarco boolean,
    gestione770 boolean,
    indirizzo text,
    nazione text,
    "nomeAnagrafico" text,
    "percContributoCassaPrev" double precision,
    provincia text,
    quadro770 text,
    sesso text,
    "soggettoInail" boolean,
    "soggettoRitenuta" boolean,
    telefono text,
    "tipoAnagrafica" text,
    "tipoRitenuta" text
);


ALTER TABLE public."Fornitore" OWNER TO dev_user;

--
-- TOC entry 232 (class 1259 OID 26591)
-- Name: ImportLog; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."ImportLog" (
    id text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "templateName" text NOT NULL,
    "fileName" text NOT NULL,
    status text NOT NULL,
    details text,
    "rowCount" integer NOT NULL
);


ALTER TABLE public."ImportLog" OWNER TO dev_user;

--
-- TOC entry 235 (class 1259 OID 26685)
-- Name: ImportScritturaRigaContabile; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."ImportScritturaRigaContabile" (
    id text NOT NULL,
    "codiceUnivocoScaricamento" text NOT NULL,
    "codiceConto" text NOT NULL,
    "descrizioneConto" text NOT NULL,
    "importoDare" double precision,
    "importoAvere" double precision,
    note text,
    "insDatiMovimentiAnalitici" boolean NOT NULL,
    riga integer NOT NULL
);


ALTER TABLE public."ImportScritturaRigaContabile" OWNER TO dev_user;

--
-- TOC entry 234 (class 1259 OID 26622)
-- Name: ImportScritturaRigaIva; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."ImportScritturaRigaIva" (
    id text NOT NULL,
    "codiceUnivocoScaricamento" text NOT NULL,
    "codiceIva" text NOT NULL,
    imponibile double precision NOT NULL,
    imposta double precision NOT NULL,
    "codiceConto" text,
    indetraibilita double precision,
    riga integer NOT NULL
);


ALTER TABLE public."ImportScritturaRigaIva" OWNER TO dev_user;

--
-- TOC entry 230 (class 1259 OID 26553)
-- Name: ImportTemplate; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."ImportTemplate" (
    id text NOT NULL,
    "modelName" text,
    "fileIdentifier" text,
    name text
);


ALTER TABLE public."ImportTemplate" OWNER TO dev_user;

--
-- TOC entry 229 (class 1259 OID 26534)
-- Name: RigaIva; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."RigaIva" (
    id text NOT NULL,
    imponibile double precision NOT NULL,
    imposta double precision NOT NULL,
    "codiceIvaId" text NOT NULL,
    "rigaScritturaId" text
);


ALTER TABLE public."RigaIva" OWNER TO dev_user;

--
-- TOC entry 220 (class 1259 OID 26394)
-- Name: RigaScrittura; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."RigaScrittura" (
    id text NOT NULL,
    descrizione text NOT NULL,
    dare double precision NOT NULL,
    avere double precision NOT NULL,
    "contoId" text NOT NULL,
    "scritturaContabileId" text NOT NULL
);


ALTER TABLE public."RigaScrittura" OWNER TO dev_user;

--
-- TOC entry 219 (class 1259 OID 26386)
-- Name: ScritturaContabile; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."ScritturaContabile" (
    id text NOT NULL,
    data timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "causaleId" text,
    descrizione text NOT NULL,
    "datiAggiuntivi" jsonb,
    "externalId" text,
    "fornitoreId" text,
    "dataDocumento" timestamp(3) without time zone,
    "numeroDocumento" text
);


ALTER TABLE public."ScritturaContabile" OWNER TO dev_user;

--
-- TOC entry 215 (class 1259 OID 26357)
-- Name: VoceAnalitica; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."VoceAnalitica" (
    id text NOT NULL,
    nome text NOT NULL,
    descrizione text,
    "externalId" text
);


ALTER TABLE public."VoceAnalitica" OWNER TO dev_user;

--
-- TOC entry 224 (class 1259 OID 26422)
-- Name: VoceTemplateScrittura; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."VoceTemplateScrittura" (
    id text NOT NULL,
    sezione public."SezioneScrittura" NOT NULL,
    "formulaImporto" public."FormulaImporto",
    descrizione text NOT NULL,
    "templateId" text NOT NULL
);


ALTER TABLE public."VoceTemplateScrittura" OWNER TO dev_user;

--
-- TOC entry 233 (class 1259 OID 26599)
-- Name: WizardState; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public."WizardState" (
    id text NOT NULL,
    step text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."WizardState" OWNER TO dev_user;

--
-- TOC entry 214 (class 1259 OID 26312)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO dev_user;

--
-- TOC entry 237 (class 1259 OID 26722)
-- Name: import_allocazioni; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public.import_allocazioni (
    id text NOT NULL,
    importo double precision NOT NULL,
    percentuale double precision,
    "suggerimentoAutomatico" boolean DEFAULT false NOT NULL,
    "commessaId" text NOT NULL,
    "importScritturaRigaContabileId" text NOT NULL
);


ALTER TABLE public.import_allocazioni OWNER TO dev_user;

--
-- TOC entry 236 (class 1259 OID 26704)
-- Name: import_scritture_testate; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE public.import_scritture_testate (
    id text NOT NULL,
    "codiceUnivocoScaricamento" text NOT NULL,
    "codiceCausale" text NOT NULL,
    "descrizioneCausale" text NOT NULL,
    "dataRegistrazione" timestamp(3) without time zone,
    "tipoRegistroIva" text,
    "clienteFornitoreCodiceFiscale" text,
    "clienteFornitoreSigla" text,
    "dataDocumento" timestamp(3) without time zone,
    "numeroDocumento" text,
    "protocolloNumero" text,
    "totaleDocumento" double precision,
    "noteMovimento" text
);


ALTER TABLE public.import_scritture_testate OWNER TO dev_user;

--
-- TOC entry 3611 (class 0 OID 26401)
-- Dependencies: 221
-- Data for Name: Allocazione; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."Allocazione" (id, importo, descrizione, "rigaScritturaId", "commessaId", "voceAnaliticaId") FROM stdin;
\.


--
-- TOC entry 3608 (class 0 OID 26379)
-- Dependencies: 218
-- Data for Name: BudgetVoce; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."BudgetVoce" (id, importo, "commessaId", "voceAnaliticaId") FROM stdin;
\.


--
-- TOC entry 3613 (class 0 OID 26415)
-- Dependencies: 223
-- Data for Name: CampoDatiPrimari; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."CampoDatiPrimari" (id, tipo, descrizione, nome, opzioni, "voceTemplateId") FROM stdin;
\.


--
-- TOC entry 3612 (class 0 OID 26408)
-- Dependencies: 222
-- Data for Name: CausaleContabile; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."CausaleContabile" (id, descrizione, "externalId", nome, "dataFine", "dataInizio", "noteMovimento", "tipoAggiornamento", "tipoMovimento", "tipoRegistroIva") FROM stdin;
ABB	Abbuoni e arrotondamenti passivi	ABB	ABB	\N	\N		C		
ABBA	Abbuoni e arrotondamenti attivi	ABBA	ABBA	\N	\N		C		
XAC20	Fattura ricevuta cellulari reverse	XAC20	XAC20	\N	\N		I		
ACCA	Ricevuto acconto	ACCA	ACCA	\N	\N		C		
ACCP	Pagato acconto	ACCP	ACCP	\N	\N		C		
ADDE	Nota di addebito emessa	ADDE	ADDE	\N	\N		I		
ADDR	Nota di addebito ricevuta	ADDR	ADDR	\N	\N		I		
AEDIT	Fattura ricevuta edilizia reverse	AEDIT	AEDIT	\N	\N		I		
AMMO	Ammortamenti	AMMO	AMMO	\N	\N		C		
AO20	Fattura ricevuta oro reverse	AO20	AO20	\N	\N		I		
XAP20	Fattura ricevuta processori reverse	XAP20	XAP20	\N	\N		I		
AUTO	Autofattura	AUTO	AUTO	\N	\N		I		
BAMM	Rilevazione plus./min. per cess. b. amm	BAMM	BAMM	\N	\N		C	.	
BIA	Apertura	BIA	BIA	\N	\N		C		
BIC	Chiusura	BIC	BIC	\N	\N		C		
XBOL5	Bolla doganale (per sempl. opz. c. 4/5)	XBOL5	XBOL5	\N	\N		I		
BOLL	Bolla doganale	BOLL	BOLL	\N	\N		I		
BOLLA	Acquisto valori bollati e postali	BOLLA	BOLLA	\N	\N		C		
CEFT	Fattura emessa CEE	CEFT	CEFT	\N	\N		I		
CERE	Fattura ricevuta cee in valuta estera	CERE	CERE	\N	\N		I		
CERI	Fattura ricevuta CEE	CERI	CERI	\N	\N		I		
XCERR	Fattura ricevuta CEE reg. in ritardo	XCERR	XCERR	\N	\N		I		0
CESP	Variazione cespiti condono L. 289/2002	CESP	CESP	\N	\N		C		
COMM	Interessi e commissioni bancarie	COMM	COMM	\N	\N		C		
XCOMP	Compensi lavoro a progetto	XCOMP	XCOMP	\N	\N		C		
CONT	Contributi	CONT	CONT	\N	\N		C		
CORS	Corrispettivi a scorporo	CORS	CORS	\N	\N		I		
CORV	Corrispettivi ventilati	CORV	CORV	\N	\N		I		
COSAN	Costi anticipati	COSAN	COSAN	\N	\N		C		
XCOSP	Costi posticipati	XCOSP	XCOSP	\N	\N		C		
XCOSS	Corrispettivi oss/ioss	XCOSS	XCOSS	\N	\N		I		
XDIC	Dichiarazione d'intento emessa	XDIC	XDIC	\N	\N		I		
XDICH	Dichiarazione d'intento	XDICH	XDICH	\N	\N		I		
XDIST	Distinta AUSL	XDIST	XDIST	\N	\N		I		
XF17R	Fattura acquisto art.17 c.2 reg. ritard	XF17R	XF17R	\N	\N		I	o	0
XFERR	Fattura emessa con ritenuta RSM	XFERR	XFERR	\N	\N		I		
XFERSM	Fattura emessa e rimborso spese mediche	XFERSM	XFERSM	\N	\N		I		
XFOSS	Fattura emessa oss/ioss	XFOSS	XFOSS	\N	\N		I		
FRPP	Fattura ricevuta con generazione pagam.	FRPP	FRPP	\N	\N		I		
XFRRC	Fattura ricevuta reverse charge	XFRRC	XFRRC	\N	\N		I		
XFRRR	Fattura ric. reverse charge reg. ritard	XFRRR	XFRRR	\N	\N		I	o	0
XFRS	Fattura ricevuta split payment Iva diff	XFRS	XFRS	\N	\N		I	.	
XFRS2	Ft. ric. Iva e.diff. art32bis DL 83/201	XFRS2	XFRS2	\N	\N		I	2	
XFRSE	Fattura ricevuta ExtraCEE (opz. c. 4/5)	XFRSE	XFRSE	\N	\N		C		
FRSI	Fattura pagamento ft. Iva ad esig. diff	FRSI	FRSI	\N	\N		I	.	
FRSO	Fattura ricevuta esigibilità differita	FRSO	FRSO	\N	\N		I		
XFRSP	Fatt ricevuta Iva esig.diff. DL.185/200	XFRSP	XFRSP	\N	\N		I	8	
FT17	Fattura di acquisto art. 17 c.2	FT17	FT17	\N	\N		I		
FTAU	Autofattura di acquisto	FTAU	FTAU	\N	\N		I		
XFTCO	Fattura. em. reg. corr (st. cont. c.4/5	XFTCO	XFTCO	\N	\N		I	)	
XFTCOR	Fattura em. reg. corrisp. (storno cont.	XFTCOR	XFTCOR	\N	\N		I	)	
FTD28	Fattura ricevuta RSM con IVA - NO SDI	FTD28	FTD28	\N	\N		I		
FTDE	Fatture da emettere	FTDE	FTDE	\N	\N		C		
FTDR	Fatture da ricevere	FTDR	FTDR	\N	\N		C		
FTE0	Fattura emessa importo zero	FTE0	FTE0	\N	\N		I		
XFTEC	Fattura emessa su registro corrispettiv	XFTEC	XFTEC	\N	\N		I	i	
FTEC1	Fattura emessa su registro corrispettiv	FTEC1	FTEC1	\N	\N		I	i	
XFTEC2	Fattura emessa su registro corrispettiv	XFTEC2	XFTEC2	\N	\N		I	i	
FTEE	Fattura emessa con enasarco e ritenuta	FTEE	FTEE	\N	\N		I		
FTEM	Fattura emessa	FTEM	FTEM	\N	\N		I		
FTEM2	FATTURA EMESSA2	FTEM2	FTEM2	\N	\N		I		
FTEN	Fattura emessa enasarco	FTEN	FTEN	\N	\N		I		
FTEP	Fattura emessa professionista (incasso)	FTEP	FTEP	\N	\N		I		
FTER	Fattura emessa RSM	FTER	FTER	\N	\N		I		
XFTEV	Fattura emessa con importo in valuta	XFTEV	XFTEV	\N	\N		I		
FTEX	Fattura emessa extra CEE	FTEX	FTEX	\N	\N		I		
FTPP	Fattura emessa con generazione incasso	FTPP	FTPP	\N	\N		I		
FTR	Fattura ricevuta RSM con IVA	FTR	FTR	\N	\N		I		
FTR0	Fattura ricevuta importo zero	FTR0	FTR0	\N	\N		I		
XFTRB	Fattura emessa con ritenuta su bonifico	XFTRB	XFTRB	\N	\N		I		
FTRE	Fattura ricevuta Extra CEE beni	FTRE	FTRE	\N	\N		C		
FTRI	Fattura ricevuta	FTRI	FTRI	\N	\N		I		
FTRIM	CFattura ricevuta materiale di consumo	FTRIM	FTRIM	\N	\N		I		
XFTRL	Fattura ricevuta registrata in ritardo	XFTRL	XFTRL	\N	\N		I		
FTRR	Fattura emessa con ritenuta	FTRR	FTRR	\N	\N		I		
FTRS	Fattura ricevuta RSM senza IVA	FTRS	FTRS	\N	\N		I		
XFTS	Fattura emessa con split payment	XFTS	XFTS	\N	\N		I		
XFTS2	Ft.. em. Iva e.diff. art.32bis DL83/201	XFTS2	XFTS2	\N	\N		I	2	
XFTSE	Fattura emessa split con enasarco e rit	XFTSE	XFTSE	\N	\N		I	.	
XFTSEN	Fattura emessa split con enasarco	XFTSEN	XFTSEN	\N	\N		I		
FTSI	Ft. incasso ft. con IVA ad esig. diff.	FTSI	FTSI	\N	\N		I		
FTSO	Fattura emessa con Iva ad esig.differit	FTSO	FTSO	\N	\N		I	a	
XFTSP	Fatt. emessa Iva esig.diff. DL 185/2008	XFTSP	XFTSP	\N	\N		I		
FTSR	Fattura con Iva es.diff. e ritenuta	FTSR	FTSR	\N	\N		I		
XFTST	Fattura emessa split payment e ritenuta	XFTST	XFTST	\N	\N		I		
XFTT2	Fatt.em.  IVA es.diff.DL83/2012 e riten	XFTT2	XFTT2	\N	\N		I	.	
XFTTR	Fatt.em.  IVA es.diff. DL185/08 e riten	XFTTR	XFTTR	\N	\N		I	.	
XGANT	Gestione Anticipi	XGANT	XGANT	\N	\N		C		
GIRA	Giroconto per ratei attivi	GIRA	GIRA	\N	\N		C		
GIRC	Giroconto per ratei passivi	GIRC	GIRC	\N	\N		C		
GIRO	Giroconto	GIRO	GIRO	\N	\N		C		
GRIA	Giroconto risconti attivi	GRIA	GRIA	\N	\N		C		
GRIP	Giroconto risconti passivi	GRIP	GRIP	\N	\N		C		
IMPIN	DIMPOSTE E SPESE  INDEDUCIBILI	IMPIN	IMPIN	\N	\N		C		
IMPO	Rilevazione imposte	IMPO	IMPO	\N	\N		C		
INC	Incasso	INC	INC	\N	\N		C		
INCA	Incasso su registro Iva	INCA	INCA	\N	\N		C		
XINCV	Incasso corrispettivi con IVA esig.diff	XINCV	XINCV	\N	\N		I	.	
INS	Insoluto	INS	INS	\N	\N		C		
INTA	Interessi attivi	INTA	INTA	\N	\N		C		
INTE	Interessi passivi	INTE	INTE	\N	\N		C		
IO20	Fattura ricevuta intra oro rev. charge	IO20	IO20	\N	\N		I		
LIBE	LIBERA	LIBE	LIBE	\N	\N		C		
LIQ	Rilevazione giroconti per liquid. Iva	LIQ	LIQ	\N	\N		C		
LIQP	Giroconto per liquid. Iva con costi/ric	LIQP	LIQP	\N	\N		C	.	
MAR	Giroconto margine beni usati	MAR	MAR	\N	\N		C		
MARC	Margine beni usati reg. corrispettivi	MARC	MARC	\N	\N		I		
MARG	Margine beni usati	MARG	MARG	\N	\N		I		
MINU	Minusvalenze su beni amm.	MINU	MINU	\N	\N		C		
MO20	Fattura ricevuta impor. oro reverse	MO20	MO20	\N	\N		I		
XNC17	Nota di accredito ricevuta art. 17 c. 2	XNC17	XNC17	\N	\N		I		
NCCE	Nota di credito emessa CEE	NCCE	NCCE	\N	\N		I		
NCDE	Note di accredito da emettere	NCDE	NCDE	\N	\N		C		
NCDR	Note di accredito da ricevere	NCDR	NCDR	\N	\N		C		
XNCE0	Nota di accredito emessa importo zero	XNCE0	XNCE0	\N	\N		I		
XNCE2	Nota cred. Em. Iva e. Diff. DL .83/2012	XNCE2	XNCE2	\N	\N		I		
XNCEC	Nota credito emessa reg. corrispettivi	XNCEC	XNCEC	\N	\N		I		
XNCED	Nota cred. Em. Iva esig. Diff. DL 185/0	XNCED	XNCED	\N	\N		I	8	
XNCEE	Nota cred. emessa con enasarco e rit.	XNCEE	XNCEE	\N	\N		I		
NCEM	Nota di accredito emessa	NCEM	NCEM	\N	\N		I		
XNCEN	Nota di accredito emessa con enasarco	XNCEN	XNCEN	\N	\N		I		
XNCER	Nota di accredito emessa con ritenuta	XNCER	XNCER	\N	\N		I		
XNCET	Nota di accredito emessa in ritardo	XNCET	XNCET	\N	\N		I		
XNCEX	Nota di accredito emessa extra Cee	XNCEX	XNCEX	\N	\N		I		
XNCR	Nota di accredito ricevuta RSM con IVA	XNCR	XNCR	\N	\N		I		
XNCR2	Nota cred. Ric. Iva e. Diff. DL.83/2012	XNCR2	XNCR2	\N	\N		I		
NCRC	Nota di accredito ricevuta CEE	NCRC	NCRC	\N	\N		I		
XNCRD	Nota cred. Ric. Iva esig. Diff. DL185/0	XNCRD	XNCRD	\N	\N		I	8	
NCRE	Nota di accredito ricevuta edil. rev. c	NCRE	NCRE	\N	\N		I	h	
NCRI	Nota di accredito ricevuta	NCRI	NCRI	\N	\N		I		
XNCRI0	Nota di accredito ricevuta importo zero	XNCRI0	XNCRI0	\N	\N		I		
XNCRL	Nota di credito registrata in ritardo	XNCRL	XNCRL	\N	\N		I		
XNCRR	Nota di accredito ricevuta rev. charge	XNCRR	XNCRR	\N	\N		I		
XNCRS	Nota di accredito ricevuta RSM no IVA	XNCRS	XNCRS	\N	\N		I		
XNCRSP	Nota di credito ric.. split p. Iva diff	XNCRSP	XNCRSP	\N	\N		I	.	
XNCRT	Nota credito emessa Iva es.diff. e rit.	XNCRT	XNCRT	\N	\N		I		
XNCS	Nota di credito emessa con split paymen	XNCS	XNCS	\N	\N		I	t	
XNCSI	Nota credito pagam. n.c. a esig. differ	XNCSI	XNCSI	\N	\N		I	.	
NCSO	Nota credito emessa IVA ad esig. diff.	NCSO	NCSO	\N	\N		I		
XNCSP	Nota credito incasso n.c. a esig. diff.	XNCSP	XNCSP	\N	\N		I		
XNCSR	Nota credito ricevuta IVA ad esig. diff	XNCSR	XNCSR	\N	\N		I		
XNCST	Nota cred. emessa split paym. e ritenut	XNCST	XNCST	\N	\N		I	a	
XNOSS	Nota di accredito emessa oss/ioss	XNOSS	XNOSS	\N	\N		I		
NOTAS	Nota spese ricevuta	NOTAS	NOTAS	\N	\N		C		
PAG	Pagamento su registro Iva	PAG	PAG	\N	\N		C		
PAGA	Pagamento	PAGA	PAGA	\N	\N		C		
PAGAS	Pagamento stipendi	PAGAS	PAGAS	\N	\N		C		
PAGR	Pagamento fattura con ritenuta	PAGR	PAGR	\N	\N		C		
PASS	Premi assicurazione	PASS	PASS	\N	\N		C		
PLUS	Plusvalenze su beni amm.	PLUS	PLUS	\N	\N		C		
PREL	Prelevamento	PREL	PREL	\N	\N		C		
PRES	Presentati effetti	PRES	PRES	\N	\N		C		
PROC	Prestazioni lavoro autonomo occasionale	PROC	PROC	\N	\N		C		
RATA	Ratei attivi	RATA	RATA	\N	\N		C		
RATP	Ratei passivi	RATP	RATP	\N	\N		C		
RI20	Fattura intra rottami reverse charge	RI20	RI20	\N	\N		I		
RIBA	Emesse ricevute bancarie	RIBA	RIBA	\N	\N		C		
RICAN	Ricavi anticipati	RICAN	RICAN	\N	\N		C		
XRICP	Ricavi posticipati	XRICP	XRICP	\N	\N		C		
RID	Emessi RID	RID	RID	\N	\N		C		
RIEF	Ricevuti effetti attivi	RIEF	RIEF	\N	\N		C		
RILE	Rilevazione ritenute effettuate	RILE	RILE	\N	\N		C		
RILS	Rilevazione ritenute subite	RILS	RILS	\N	\N		C		
RIMF	Rimanenze finali	RIMF	RIMF	\N	\N		C		
RIMI	Rimanenze iniziali	RIMI	RIMI	\N	\N		C		
RIPA	Riporto risconti attivi	RIPA	RIPA	\N	\N		C		
RIPP	Riporto risconti passivi	RIPP	RIPP	\N	\N		C		
RISA	Risconti attivi	RISA	RISA	\N	\N		C		
RISP	Risconti passivi	RISP	RISP	\N	\N		C		
RIV	Rivalutazione cespite	RIV	RIV	\N	\N		C		
RM20	Fattura import. rottami reverse charge	RM20	RM20	\N	\N		I		
RO20	Fattura ricevuta rottami reverse charge	RO20	RO20	\N	\N		I		
SCHED	Scheda carburante	SCHED	SCHED	\N	\N		I		
SOPA	Sopravvenienze attive	SOPA	SOPA	\N	\N		C		
SOPP	Sopravvenienze passive	SOPP	SOPP	\N	\N		C		
SPE	Spese documentate	SPE	SPE	\N	\N		C		
STIP	Stipendi	STIP	STIP	\N	\N		C		
STPAR	ADEG. STUDI/PARAMETRI	STPAR	STPAR	\N	\N		C		
SVA	Svalutazione cespiti	SVA	SVA	\N	\N		C		
TFR	Rilevazione TFR	TFR	TFR	\N	\N		C		
TGOV	Tasse di concessione governativa	TGOV	TGOV	\N	\N		C		
VERR	Versamenti ritenute	VERR	VERR	\N	\N	X	C		
VERS	Versamento	VERS	VERS	\N	\N		C		
\.


--
-- TOC entry 3615 (class 0 OID 26485)
-- Dependencies: 225
-- Data for Name: Cliente; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."Cliente" (id, "externalId", nome, piva, "createdAt", "updatedAt", "codiceFiscale", cap, "codicePagamento", "codiceValuta", cognome, comune, "comuneNascita", "dataNascita", indirizzo, nazione, "nomeAnagrafico", provincia, sesso, telefono, "tipoAnagrafica") FROM stdin;
system_customer_01	SYS-CUST	Cliente di Sistema (per importazioni)	\N	2025-06-24 07:35:16.584	2025-06-24 07:35:16.584	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmca7nkh70000jn44nodo3k2u	PENISOLAVERDE_SPA	PENISOLAVERDE SPA	01234567890	2025-06-24 07:35:16.843	2025-06-24 07:35:16.843	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 3617 (class 0 OID 26520)
-- Dependencies: 227
-- Data for Name: CodiceIva; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."CodiceIva" (id, "externalId", descrizione, aliquota, indetraibilita, note, "tipoCalcolo", "dataFine", "dataInizio") FROM stdin;
\.


--
-- TOC entry 3607 (class 0 OID 26372)
-- Dependencies: 217
-- Data for Name: Commessa; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."Commessa" (id, nome, "clienteId", descrizione, "externalId", "parentId") FROM stdin;
sorrento	Comune di Sorrento	cmca7nkh70000jn44nodo3k2u	Commessa principale per il comune di Sorrento	1	\N
massa_lubrense	Comune di Massa Lubrense	cmca7nkh70000jn44nodo3k2u	Commessa principale per il comune di Massa Lubrense	2	\N
piano_di_sorrento	Comune di Piano di Sorrento	cmca7nkh70000jn44nodo3k2u	Commessa principale per il comune di Piano di Sorrento	3	\N
sorrento_igiene_urbana	Igiene Urbana - Sorrento	cmca7nkh70000jn44nodo3k2u	Servizio di igiene urbana per Sorrento	4	sorrento
massa_lubrense_igiene_urbana	Igiene Urbana - Massa Lubrense	cmca7nkh70000jn44nodo3k2u	Servizio di igiene urbana per Massa Lubrense	5	massa_lubrense
piano_di_sorrento_igiene_urbana	Igiene Urbana - Piano di Sorrento	cmca7nkh70000jn44nodo3k2u	Servizio di igiene urbana per Piano di Sorrento	6	piano_di_sorrento
sorrento_verde_pubblico	Verde Pubblico - Sorrento	cmca7nkh70000jn44nodo3k2u	Servizio di gestione del verde pubblico per Sorrento	7	sorrento
\.


--
-- TOC entry 3618 (class 0 OID 26527)
-- Dependencies: 228
-- Data for Name: CondizionePagamento; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."CondizionePagamento" (id, "externalId", descrizione, codice, "contoIncassoPagamento", "inizioScadenza", "numeroRate", suddivisione) FROM stdin;
\.


--
-- TOC entry 3606 (class 0 OID 26364)
-- Dependencies: 216
-- Data for Name: Conto; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."Conto" (id, codice, nome, tipo, "richiedeVoceAnalitica", "vociAnaliticheAbilitateIds", "contropartiteSuggeriteIds", "externalId", "voceAnaliticaId") FROM stdin;
\.


--
-- TOC entry 3621 (class 0 OID 26560)
-- Dependencies: 231
-- Data for Name: FieldDefinition; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."FieldDefinition" (id, start, length, "templateId", "fileIdentifier", "fieldName", format) FROM stdin;
cmca7nkkf0002jn448f7x7sw2	4	6	cmca7nkkf0001jn4438sj6xk2	\N	id	\N
cmca7nkkf0003jn448pii3lsv	4	6	cmca7nkkf0001jn4438sj6xk2	\N	externalId	\N
cmca7nkkf0004jn44p0x75gbb	4	6	cmca7nkkf0001jn4438sj6xk2	\N	nome	\N
cmca7nkkf0005jn44jlny9l2d	10	40	cmca7nkkf0001jn4438sj6xk2	\N	descrizione	\N
cmca7nkkf0006jn441rn0as13	50	1	cmca7nkkf0001jn4438sj6xk2	\N	tipoMovimento	\N
cmca7nkkf0007jn448hgf3pmy	51	1	cmca7nkkf0001jn4438sj6xk2	\N	tipoAggiornamento	\N
cmca7nkkf0008jn44olqmk4m3	52	8	cmca7nkkf0001jn4438sj6xk2	\N	dataInizio	date:YYYYMMDD
cmca7nkkf0009jn44i76p8sd9	60	8	cmca7nkkf0001jn4438sj6xk2	\N	dataFine	date:YYYYMMDD
cmca7nkkf000ajn44hhxyyx30	68	1	cmca7nkkf0001jn4438sj6xk2	\N	tipoRegistroIva	\N
cmca7nkkf000bjn44gn6fr9gh	101	60	cmca7nkkf0001jn4438sj6xk2	\N	noteMovimento	\N
cmca7nko2000djn44o5auugkp	4	8	cmca7nko2000cjn44tpk5yk4b	\N	id	\N
cmca7nko3000ejn44usd7wrpy	4	8	cmca7nko2000cjn44tpk5yk4b	\N	externalId	\N
cmca7nko3000fjn44q0eokldo	12	40	cmca7nko2000cjn44tpk5yk4b	\N	descrizione	\N
cmca7nko3000gjn44d2csf3bv	52	10	cmca7nko2000cjn44tpk5yk4b	\N	contoIncassoPagamento	\N
cmca7nko3000hjn441qj6saal	64	1	cmca7nko2000cjn44tpk5yk4b	\N	suddivisione	\N
cmca7nko3000ijn44yutb8a2u	65	1	cmca7nko2000cjn44tpk5yk4b	\N	inizioScadenza	\N
cmca7nko3000jjn444l1fou2a	66	2	cmca7nko2000cjn44tpk5yk4b	\N	numeroRate	number
cmca7nkqc000ljn44gllo9z8y	4	4	cmca7nkqc000kjn44b22gyas0	\N	id	\N
cmca7nkqc000mjn44yj3rhmur	4	4	cmca7nkqc000kjn44b22gyas0	\N	externalId	\N
cmca7nkqc000njn44kbtqjqjw	8	40	cmca7nkqc000kjn44b22gyas0	\N	descrizione	\N
cmca7nkqc000ojn44c8spxycw	48	1	cmca7nkqc000kjn44b22gyas0	\N	tipoCalcolo	\N
cmca7nkqc000pjn44tri76b3n	49	6	cmca7nkqc000kjn44b22gyas0	\N	aliquota	number
cmca7nkqc000qjn44pktwwonf	55	3	cmca7nkqc000kjn44b22gyas0	\N	indetraibilita	number
cmca7nkqc000rjn44pb7jdemo	58	40	cmca7nkqc000kjn44b22gyas0	\N	note	\N
cmca7nkqd000sjn44jzpct2sp	98	8	cmca7nkqc000kjn44b22gyas0	\N	dataInizio	date:YYYYMMDD
cmca7nkqd000tjn442oxyd6ej	106	8	cmca7nkqc000kjn44b22gyas0	\N	dataFine	date:YYYYMMDD
cmca7nkss000vjn44rxmg1xsx	20	12	cmca7nksr000ujn44f1jh8a2u	\N	id	\N
cmca7nkss000wjn44cjpajh32	20	12	cmca7nksr000ujn44f1jh8a2u	\N	externalId	\N
cmca7nkss000xjn44j0xmt5gx	32	16	cmca7nksr000ujn44f1jh8a2u	\N	codiceFiscale	\N
cmca7nkss000yjn44mqmuu87k	49	1	cmca7nksr000ujn44f1jh8a2u	\N	tipo	\N
cmca7nkss000zjn440cwvz4ji	82	11	cmca7nksr000ujn44f1jh8a2u	\N	piva	\N
cmca7nkss0010jn44ccwgsgal	94	60	cmca7nksr000ujn44f1jh8a2u	\N	nome	\N
cmca7nkvq0012jn44tigtmeck	5	10	cmca7nkvq0011jn44tni6u8ks	\N	id	\N
cmca7nkvq0013jn44ge26jdrd	4	1	cmca7nkvq0011jn44tni6u8ks	\N	livello	\N
cmca7nkvq0014jn441pvi857l	5	10	cmca7nkvq0011jn44tni6u8ks	\N	codice	\N
cmca7nkvq0015jn44ongrqkjn	15	60	cmca7nkvq0011jn44tni6u8ks	\N	nome	\N
cmca7nkvq0016jn44vwsfhzxg	75	1	cmca7nkvq0011jn44tni6u8ks	\N	tipoChar	\N
cmca7nkyn0018jn44atxnwgsi	20	12	cmca7nkym0017jn444zts6huk	PNTESTA.TXT	externalId	\N
cmca7nkyn0019jn44rpkwzplf	39	6	cmca7nkym0017jn444zts6huk	PNTESTA.TXT	causaleId	\N
cmca7nkyn001ajn4493qa4yjy	85	8	cmca7nkym0017jn444zts6huk	PNTESTA.TXT	dataRegistrazione	date:YYYYMMDD
cmca7nkyn001bjn44plo3o9sa	99	16	cmca7nkym0017jn444zts6huk	PNTESTA.TXT	clienteFornitoreCodiceFiscale	\N
cmca7nkyn001cjn447ffm072x	128	8	cmca7nkym0017jn444zts6huk	PNTESTA.TXT	dataDocumento	date:YYYYMMDD
cmca7nkyn001djn443ig7rihp	136	12	cmca7nkym0017jn444zts6huk	PNTESTA.TXT	numeroDocumento	\N
cmca7nkyn001ejn44ihplei6t	172	12	cmca7nkym0017jn444zts6huk	PNTESTA.TXT	totaleDocumento	number
cmca7nkyn001fjn44wdc6u3v5	192	60	cmca7nkym0017jn444zts6huk	PNTESTA.TXT	noteMovimento	\N
cmca7nkyn001gjn44c26byy6h	3	12	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	externalId	\N
cmca7nkyn001hjn44j7n92wnn	15	3	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	progressivoRigo	number
cmca7nkyn001ijn4466991bkv	18	1	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	tipoConto	\N
cmca7nkyn001jjn44c3kyxhr0	19	16	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	clienteFornitoreCodiceFiscale	\N
cmca7nkyn001kjn44fvpr7vpn	48	10	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	conto	\N
cmca7nkyn001ljn44vekt5znt	58	12	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	importoDare	number
cmca7nkyn001mjn44dzzy9ipd	70	12	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	importoAvere	number
cmca7nkyn001njn44p8yc0438	82	60	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	note	\N
cmca7nkyn001ojn44gs0nw769	247	1	cmca7nkym0017jn444zts6huk	PNRIGCON.TXT	movimentiAnalitici	\N
cmca7nkyn001pjn4443jfo8nd	3	12	cmca7nkym0017jn444zts6huk	PNRIGIVA.TXT	externalId	\N
cmca7nkyn001qjn4466ue6n8q	15	4	cmca7nkym0017jn444zts6huk	PNRIGIVA.TXT	codiceIva	\N
cmca7nkyn001rjn44o4ixpvyr	19	10	cmca7nkym0017jn444zts6huk	PNRIGIVA.TXT	contropartita	\N
cmca7nkyn001sjn44m5aexj4k	29	12	cmca7nkym0017jn444zts6huk	PNRIGIVA.TXT	imponibile	number
cmca7nkyn001tjn44yyrfazjh	41	12	cmca7nkym0017jn444zts6huk	PNRIGIVA.TXT	imposta	number
cmca7nkyn001ujn44rzxtiofy	89	12	cmca7nkym0017jn444zts6huk	PNRIGIVA.TXT	importoLordo	number
cmca7nkyn001vjn440321ldsc	101	60	cmca7nkym0017jn444zts6huk	PNRIGIVA.TXT	note	\N
cmca7nkyn001wjn44sxhh6h9w	3	12	cmca7nkym0017jn444zts6huk	MOVANAC.TXT	externalId	\N
cmca7nkyn001xjn44p8tghktu	15	3	cmca7nkym0017jn444zts6huk	MOVANAC.TXT	progressivoRigoContabile	number
cmca7nkyn001yjn449rxjww38	18	4	cmca7nkym0017jn444zts6huk	MOVANAC.TXT	centroDiCosto	\N
cmca7nkyn001zjn44tu2kn8y4	22	12	cmca7nkym0017jn444zts6huk	MOVANAC.TXT	parametro	number
\.


--
-- TOC entry 3616 (class 0 OID 26493)
-- Dependencies: 226
-- Data for Name: Fornitore; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."Fornitore" (id, "externalId", nome, piva, "createdAt", "updatedAt", "codiceFiscale", aliquota, "attivitaMensilizzazione", cap, "codicePagamento", "codiceRitenuta", "codiceValuta", cognome, comune, "comuneNascita", "contributoPrevidenziale", "contributoPrevidenzialeL335", "dataNascita", enasarco, gestione770, indirizzo, nazione, "nomeAnagrafico", "percContributoCassaPrev", provincia, quadro770, sesso, "soggettoInail", "soggettoRitenuta", telefono, "tipoAnagrafica", "tipoRitenuta") FROM stdin;
system_supplier_01	SYS-SUPP	Fornitore di Sistema (per importazioni)	\N	2025-06-24 07:35:16.732	2025-06-24 07:35:16.732	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 3622 (class 0 OID 26591)
-- Dependencies: 232
-- Data for Name: ImportLog; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."ImportLog" (id, "timestamp", "templateName", "fileName", status, details, "rowCount") FROM stdin;
\.


--
-- TOC entry 3625 (class 0 OID 26685)
-- Dependencies: 235
-- Data for Name: ImportScritturaRigaContabile; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."ImportScritturaRigaContabile" (id, "codiceUnivocoScaricamento", "codiceConto", "descrizioneConto", "importoDare", "importoAvere", note, "insDatiMovimentiAnalitici", riga) FROM stdin;
\.


--
-- TOC entry 3624 (class 0 OID 26622)
-- Dependencies: 234
-- Data for Name: ImportScritturaRigaIva; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."ImportScritturaRigaIva" (id, "codiceUnivocoScaricamento", "codiceIva", imponibile, imposta, "codiceConto", indetraibilita, riga) FROM stdin;
\.


--
-- TOC entry 3620 (class 0 OID 26553)
-- Dependencies: 230
-- Data for Name: ImportTemplate; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."ImportTemplate" (id, "modelName", "fileIdentifier", name) FROM stdin;
cmca7nkkf0001jn4438sj6xk2	CausaleContabile	\N	causali
cmca7nko2000cjn44tpk5yk4b	CondizionePagamento	\N	condizioni_pagamento
cmca7nkqc000kjn44b22gyas0	CodiceIva	\N	codici_iva
cmca7nksr000ujn44f1jh8a2u	\N	\N	anagrafica_clifor
cmca7nkvq0011jn44tni6u8ks	\N	\N	piano_dei_conti
cmca7nkym0017jn444zts6huk	\N	\N	scritture_contabili
\.


--
-- TOC entry 3619 (class 0 OID 26534)
-- Dependencies: 229
-- Data for Name: RigaIva; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."RigaIva" (id, imponibile, imposta, "codiceIvaId", "rigaScritturaId") FROM stdin;
\.


--
-- TOC entry 3610 (class 0 OID 26394)
-- Dependencies: 220
-- Data for Name: RigaScrittura; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."RigaScrittura" (id, descrizione, dare, avere, "contoId", "scritturaContabileId") FROM stdin;
\.


--
-- TOC entry 3609 (class 0 OID 26386)
-- Dependencies: 219
-- Data for Name: ScritturaContabile; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."ScritturaContabile" (id, data, "causaleId", descrizione, "datiAggiuntivi", "externalId", "fornitoreId", "dataDocumento", "numeroDocumento") FROM stdin;
\.


--
-- TOC entry 3605 (class 0 OID 26357)
-- Dependencies: 215
-- Data for Name: VoceAnalitica; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."VoceAnalitica" (id, nome, descrizione, "externalId") FROM stdin;
costo_personale	Costo del personale	\N	\N
gestione_automezzi	Gestione automezzi	\N	\N
gestione_attrezzature	Gestione attrezzature	\N	\N
sacchi_materiali_consumo	Sacchi e materiali di consumo	\N	\N
servizi_esterni	Servizi esterni	\N	\N
pulizia_strade_rurali	Pulizia strade rurali	\N	\N
gestione_aree_operative	Gestione Aree operative	\N	\N
ammortamento_automezzi	Ammortamento Automezzi	\N	\N
ammortamento_attrezzature	Ammortamento Attrezzature	\N	\N
locazione_sedi_operative	Locazione sedi operative	\N	\N
trasporti_esterni	Trasporti esterni	\N	\N
spese_generali	Spese generali	\N	\N
selezione_valorizzazione_rifiuti	Selezione e Valorizzazione Rifiuti Differenziati	\N	\N
gestione_frazione_organica	Gestione frazione organica	\N	\N
\.


--
-- TOC entry 3614 (class 0 OID 26422)
-- Dependencies: 224
-- Data for Name: VoceTemplateScrittura; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."VoceTemplateScrittura" (id, sezione, "formulaImporto", descrizione, "templateId") FROM stdin;
\.


--
-- TOC entry 3623 (class 0 OID 26599)
-- Dependencies: 233
-- Data for Name: WizardState; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public."WizardState" (id, step, completed, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- TOC entry 3604 (class 0 OID 26312)
-- Dependencies: 214
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
dd09ee35-d3b2-4191-a0d4-f8e8d3cb8192	2cd9ec061aef0bf8aa49b3563b93242e9e6600fe9c1704629aead2243d6f6067	2025-06-24 07:34:56.870563+00	20250619122108_init	\N	\N	2025-06-24 07:34:55.729495+00	1
bc5586a4-136b-47b4-a2c9-deafb83fdbf7	2e2be39f49891075e1ef0974b4232745e69f429305f9e7cfa9e7b43eb71c26b1	2025-06-24 07:34:59.464765+00	20250622225114_make_aliquota_optional	\N	\N	2025-06-24 07:34:59.405145+00	1
6152750d-7b20-45f3-8b33-6e03e2347bca	09ef2a8cc4cd94b90f26629d53d2f0939661120a75f5d55cd8ce66d850ebe235	2025-06-24 07:34:57.518559+00	20250619152117_add_clienti_fornitori_e_external_ids	\N	\N	2025-06-24 07:34:56.905172+00	1
3f388a33-42b5-47a0-9223-75faa1b735fe	cbc14d50a07cef26daa06a2ac41bcaad4beb4a55d049b2aadeb3cbaa6bf7f74f	2025-06-24 07:34:57.923647+00	20250620082838_add_import_models	\N	\N	2025-06-24 07:34:57.546695+00	1
babbda18-2d6b-4980-8fd9-765f6d792e99	b556e9c8e985ce948f7c3bbb86b2b03823ea539bcecbe643ab90399e470bc6ad	2025-06-24 07:35:01.533194+00	20250623072323_add_fields_to_payment_condition	\N	\N	2025-06-24 07:35:01.45688+00	1
22ea2e81-de5b-4492-b2a9-b85a9f54f69b	59c31f292e93aed330f9dcf96901c838dbba553cb38e9314293ab6e356257cd1	2025-06-24 07:34:58.22228+00	20250620085533_add_dynamic_import_models	\N	\N	2025-06-24 07:34:57.956794+00	1
82713a27-8aba-4682-ab97-4cefa821e43e	48251190821ed9374e7cefcaa0c84d88e7d2d651b02be1bb741133b2c1b13eb7	2025-06-24 07:34:59.624678+00	20250622230250_add_missing_fields_to_anagrafiche	\N	\N	2025-06-24 07:34:59.485022+00	1
a2a836de-3fa2-4795-9a18-5f0c8d68ec6a	041b96c23b95e22a242d561dc96eac14f888831df49f08405e9aa41bdbd5a96d	2025-06-24 07:34:58.326389+00	20250620100150_add_file_identifier_to_field_definition	\N	\N	2025-06-24 07:34:58.268541+00	1
f63e045c-3ae7-4963-aa04-9fc21688d13f	ce11610d3f2ecbc946a62715ef5f511f0560a852b0f8e010b9e63982fb20deaa	2025-06-24 07:34:58.420624+00	20250620114544_add_modelname_to_import_template	\N	\N	2025-06-24 07:34:58.34506+00	1
8ee58c3b-48ba-44dd-82fb-a717d20e7e8f	3b7c27d797c82f14a7afb36de8272f8e8eae131cd19291b450e6a5985c2e1f48	2025-06-24 07:34:58.531722+00	20250620115346_fix_template_seeding_model	\N	\N	2025-06-24 07:34:58.457778+00	1
985b3cd6-13e7-4b93-b409-ea27d9cdd09c	c44e04cce21b760de5f016e8a852a698d3158a63620c87a4a3f9f0afc1dd310e	2025-06-24 07:35:00.344725+00	20250622234321_relax_piva_uniqueness_and_fix_schema	\N	\N	2025-06-24 07:34:59.658323+00	1
a935063c-0ba2-4396-bd49-b376003683ae	b3c78a0f65a3e754f313de5d5e5a36483139206df691698a2d9146df3fd2b215	2025-06-24 07:34:58.632337+00	20250620131511_make_scrittura_fields_optional	\N	\N	2025-06-24 07:34:58.572983+00	1
c6899948-a8a7-4696-8f5f-7c01c47e46be	66320b421010c9474a0b8da07c0dd39a2fd5815d90bfa3e30a43245462a9b53b	2025-06-24 07:34:58.829915+00	20250621164013_add_import_log	\N	\N	2025-06-24 07:34:58.665082+00	1
15ccb090-02cc-4869-bbd0-af4b9184e604	e5b808cd1b0468f85a33826fff55b0f5b0c3760868b3adb291d4e59b898c611f	2025-06-24 07:34:59.053912+00	20250621180019_add_wizard_step_tracking	\N	\N	2025-06-24 07:34:58.880595+00	1
15fc1155-c62f-490b-9bdd-17e91377d399	d3d1354f5596383df405a7cf474412f1b0a3125b742a864532e8061cf8a7f978	2025-06-24 07:35:00.497691+00	20250623005043_rinomina_relazione_conto_voce_analitica_e_fix_causale	\N	\N	2025-06-24 07:35:00.362586+00	1
cd4699f4-a381-4c66-b423-518d16d2ee79	1984138635922c0fa4bae2e616d30fe9fed33f9b9c0f831325eeb54cd3648896	2025-06-24 07:34:59.196587+00	20250622215630_add_missing_fields_to_anagrafiche	\N	\N	2025-06-24 07:34:59.073186+00	1
49118d9e-c089-4b0a-ad8a-dab480d7d7c1	53145f6f3afceebe207c34ca0fbfc8b9f15497a328a56b13656dd693123dd681	2025-06-24 07:34:59.296836+00	20250622224538_add_causale_fields	\N	\N	2025-06-24 07:34:59.21313+00	1
6702d60f-02bd-4d21-a772-eb5882e73c75	feb17eccb8b5f0a396f6f93b1dab40ddb37a6c1930c701c9bc59828f77b49876	2025-06-24 07:35:01.795734+00	20250623073619_relax_import_scritture_constraints	\N	\N	2025-06-24 07:35:01.552718+00	1
0badaa9d-4d3a-4063-b97e-2083943eead2	16f02931f4e1a1e82d74ff1541c233ead274e9db9780a1d023b30ba00634a2bc	2025-06-24 07:34:59.388645+00	20250622224853_add_iva_fields	\N	\N	2025-06-24 07:34:59.313576+00	1
15c0a9c4-897a-4aac-924d-ffd47b25ca32	3d450d439e629935a26ff4b08306871867a17c35b66009f56c12356e8da90d35	2025-06-24 07:35:00.666402+00	20250623010101_add_commessa_hierarchy	\N	\N	2025-06-24 07:35:00.523376+00	1
47406ace-881f-49d2-b3c3-3c8cccdbe8c4	94b026734b5d5633dc7bbb71edbe20b3345aa37375a1d7d3db0bb10558567396	2025-06-24 07:35:00.932406+00	20250623022917_add_analytical_fields_to_staging_rows	\N	\N	2025-06-24 07:35:00.709114+00	1
93dd3f31-2c86-40ef-8147-7559d42195b9	a1feaa53069aa35d2b86edfed7e93a2d765ef1070448fafee0515c7ca6b4add3	2025-06-24 07:35:01.31274+00	20250623030215_fix_consolidation_logic_2	\N	\N	2025-06-24 07:35:00.966377+00	1
e0e3a7fd-269f-45cc-9818-b9ecf8b494fd	62d633be610b6f3a9fcad4ec698164c210886eaff94d2fbf1c55524ce55e69d6	2025-06-24 07:35:01.991357+00	20250623091746_add_interactive_allocation_model	\N	\N	2025-06-24 07:35:01.82791+00	1
03f1dc8f-ecd3-4edd-a9ac-d5b5a943a228	53145f6f3afceebe207c34ca0fbfc8b9f15497a328a56b13656dd693123dd681	2025-06-24 07:35:01.44047+00	20250623070717_add_fields_to_causale	\N	\N	2025-06-24 07:35:01.345938+00	1
78de3b3a-57ef-4b56-84ea-18b36ebc57d9	a3ff4e35fc46cb4c6ba717b4532f40c24df4c07470b739803f704fb05459f71a	2025-06-24 07:35:02.284948+00	20250623093700_fix_staging_models_and_types	\N	\N	2025-06-24 07:35:02.012468+00	1
\.


--
-- TOC entry 3627 (class 0 OID 26722)
-- Dependencies: 237
-- Data for Name: import_allocazioni; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public.import_allocazioni (id, importo, percentuale, "suggerimentoAutomatico", "commessaId", "importScritturaRigaContabileId") FROM stdin;
\.


--
-- TOC entry 3626 (class 0 OID 26704)
-- Dependencies: 236
-- Data for Name: import_scritture_testate; Type: TABLE DATA; Schema: public; Owner: dev_user
--

COPY public.import_scritture_testate (id, "codiceUnivocoScaricamento", "codiceCausale", "descrizioneCausale", "dataRegistrazione", "tipoRegistroIva", "clienteFornitoreCodiceFiscale", "clienteFornitoreSigla", "dataDocumento", "numeroDocumento", "protocolloNumero", "totaleDocumento", "noteMovimento") FROM stdin;
\.


--
-- TOC entry 3396 (class 2606 OID 26407)
-- Name: Allocazione Allocazione_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Allocazione"
    ADD CONSTRAINT "Allocazione_pkey" PRIMARY KEY (id);


--
-- TOC entry 3389 (class 2606 OID 26385)
-- Name: BudgetVoce BudgetVoce_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."BudgetVoce"
    ADD CONSTRAINT "BudgetVoce_pkey" PRIMARY KEY (id);


--
-- TOC entry 3402 (class 2606 OID 26421)
-- Name: CampoDatiPrimari CampoDatiPrimari_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."CampoDatiPrimari"
    ADD CONSTRAINT "CampoDatiPrimari_pkey" PRIMARY KEY (id);


--
-- TOC entry 3399 (class 2606 OID 26414)
-- Name: CausaleContabile CausaleContabile_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."CausaleContabile"
    ADD CONSTRAINT "CausaleContabile_pkey" PRIMARY KEY (id);


--
-- TOC entry 3407 (class 2606 OID 26492)
-- Name: Cliente Cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Cliente"
    ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY (id);


--
-- TOC entry 3413 (class 2606 OID 26526)
-- Name: CodiceIva CodiceIva_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."CodiceIva"
    ADD CONSTRAINT "CodiceIva_pkey" PRIMARY KEY (id);


--
-- TOC entry 3386 (class 2606 OID 26378)
-- Name: Commessa Commessa_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Commessa"
    ADD CONSTRAINT "Commessa_pkey" PRIMARY KEY (id);


--
-- TOC entry 3417 (class 2606 OID 26533)
-- Name: CondizionePagamento CondizionePagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."CondizionePagamento"
    ADD CONSTRAINT "CondizionePagamento_pkey" PRIMARY KEY (id);


--
-- TOC entry 3382 (class 2606 OID 26371)
-- Name: Conto Conto_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Conto"
    ADD CONSTRAINT "Conto_pkey" PRIMARY KEY (id);


--
-- TOC entry 3424 (class 2606 OID 26567)
-- Name: FieldDefinition FieldDefinition_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."FieldDefinition"
    ADD CONSTRAINT "FieldDefinition_pkey" PRIMARY KEY (id);


--
-- TOC entry 3410 (class 2606 OID 26500)
-- Name: Fornitore Fornitore_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Fornitore"
    ADD CONSTRAINT "Fornitore_pkey" PRIMARY KEY (id);


--
-- TOC entry 3426 (class 2606 OID 26598)
-- Name: ImportLog ImportLog_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ImportLog"
    ADD CONSTRAINT "ImportLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 3435 (class 2606 OID 26691)
-- Name: ImportScritturaRigaContabile ImportScritturaRigaContabile_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ImportScritturaRigaContabile"
    ADD CONSTRAINT "ImportScritturaRigaContabile_pkey" PRIMARY KEY (id);


--
-- TOC entry 3432 (class 2606 OID 26628)
-- Name: ImportScritturaRigaIva ImportScritturaRigaIva_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ImportScritturaRigaIva"
    ADD CONSTRAINT "ImportScritturaRigaIva_pkey" PRIMARY KEY (id);


--
-- TOC entry 3422 (class 2606 OID 26559)
-- Name: ImportTemplate ImportTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ImportTemplate"
    ADD CONSTRAINT "ImportTemplate_pkey" PRIMARY KEY (id);


--
-- TOC entry 3419 (class 2606 OID 26540)
-- Name: RigaIva RigaIva_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."RigaIva"
    ADD CONSTRAINT "RigaIva_pkey" PRIMARY KEY (id);


--
-- TOC entry 3394 (class 2606 OID 26400)
-- Name: RigaScrittura RigaScrittura_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."RigaScrittura"
    ADD CONSTRAINT "RigaScrittura_pkey" PRIMARY KEY (id);


--
-- TOC entry 3392 (class 2606 OID 26393)
-- Name: ScritturaContabile ScritturaContabile_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ScritturaContabile"
    ADD CONSTRAINT "ScritturaContabile_pkey" PRIMARY KEY (id);


--
-- TOC entry 3378 (class 2606 OID 26363)
-- Name: VoceAnalitica VoceAnalitica_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."VoceAnalitica"
    ADD CONSTRAINT "VoceAnalitica_pkey" PRIMARY KEY (id);


--
-- TOC entry 3404 (class 2606 OID 26428)
-- Name: VoceTemplateScrittura VoceTemplateScrittura_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."VoceTemplateScrittura"
    ADD CONSTRAINT "VoceTemplateScrittura_pkey" PRIMARY KEY (id);


--
-- TOC entry 3428 (class 2606 OID 26607)
-- Name: WizardState WizardState_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."WizardState"
    ADD CONSTRAINT "WizardState_pkey" PRIMARY KEY (id);


--
-- TOC entry 3374 (class 2606 OID 26320)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3440 (class 2606 OID 26729)
-- Name: import_allocazioni import_allocazioni_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public.import_allocazioni
    ADD CONSTRAINT import_allocazioni_pkey PRIMARY KEY (id);


--
-- TOC entry 3438 (class 2606 OID 26710)
-- Name: import_scritture_testate import_scritture_testate_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public.import_scritture_testate
    ADD CONSTRAINT import_scritture_testate_pkey PRIMARY KEY (id);


--
-- TOC entry 3387 (class 1259 OID 26432)
-- Name: BudgetVoce_commessaId_voceAnaliticaId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "BudgetVoce_commessaId_voceAnaliticaId_key" ON public."BudgetVoce" USING btree ("commessaId", "voceAnaliticaId");


--
-- TOC entry 3400 (class 1259 OID 26630)
-- Name: CampoDatiPrimari_nome_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "CampoDatiPrimari_nome_key" ON public."CampoDatiPrimari" USING btree (nome);


--
-- TOC entry 3397 (class 1259 OID 26505)
-- Name: CausaleContabile_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "CausaleContabile_externalId_key" ON public."CausaleContabile" USING btree ("externalId");


--
-- TOC entry 3405 (class 1259 OID 26501)
-- Name: Cliente_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "Cliente_externalId_key" ON public."Cliente" USING btree ("externalId");


--
-- TOC entry 3411 (class 1259 OID 26541)
-- Name: CodiceIva_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "CodiceIva_externalId_key" ON public."CodiceIva" USING btree ("externalId");


--
-- TOC entry 3383 (class 1259 OID 26506)
-- Name: Commessa_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "Commessa_externalId_key" ON public."Commessa" USING btree ("externalId");


--
-- TOC entry 3384 (class 1259 OID 26431)
-- Name: Commessa_nome_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "Commessa_nome_key" ON public."Commessa" USING btree (nome);


--
-- TOC entry 3414 (class 1259 OID 26631)
-- Name: CondizionePagamento_codice_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "CondizionePagamento_codice_key" ON public."CondizionePagamento" USING btree (codice);


--
-- TOC entry 3415 (class 1259 OID 26542)
-- Name: CondizionePagamento_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "CondizionePagamento_externalId_key" ON public."CondizionePagamento" USING btree ("externalId");


--
-- TOC entry 3379 (class 1259 OID 26430)
-- Name: Conto_codice_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "Conto_codice_key" ON public."Conto" USING btree (codice);


--
-- TOC entry 3380 (class 1259 OID 26507)
-- Name: Conto_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "Conto_externalId_key" ON public."Conto" USING btree ("externalId");


--
-- TOC entry 3408 (class 1259 OID 26503)
-- Name: Fornitore_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "Fornitore_externalId_key" ON public."Fornitore" USING btree ("externalId");


--
-- TOC entry 3433 (class 1259 OID 26742)
-- Name: ImportScritturaRigaContabile_codiceUnivocoScaricamento_riga_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "ImportScritturaRigaContabile_codiceUnivocoScaricamento_riga_key" ON public."ImportScritturaRigaContabile" USING btree ("codiceUnivocoScaricamento", riga);


--
-- TOC entry 3430 (class 1259 OID 26743)
-- Name: ImportScritturaRigaIva_codiceUnivocoScaricamento_riga_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "ImportScritturaRigaIva_codiceUnivocoScaricamento_riga_key" ON public."ImportScritturaRigaIva" USING btree ("codiceUnivocoScaricamento", riga);


--
-- TOC entry 3420 (class 1259 OID 26632)
-- Name: ImportTemplate_name_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "ImportTemplate_name_key" ON public."ImportTemplate" USING btree (name);


--
-- TOC entry 3390 (class 1259 OID 26508)
-- Name: ScritturaContabile_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "ScritturaContabile_externalId_key" ON public."ScritturaContabile" USING btree ("externalId");


--
-- TOC entry 3375 (class 1259 OID 26509)
-- Name: VoceAnalitica_externalId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "VoceAnalitica_externalId_key" ON public."VoceAnalitica" USING btree ("externalId");


--
-- TOC entry 3376 (class 1259 OID 26429)
-- Name: VoceAnalitica_nome_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "VoceAnalitica_nome_key" ON public."VoceAnalitica" USING btree (nome);


--
-- TOC entry 3429 (class 1259 OID 26744)
-- Name: WizardState_userId_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "WizardState_userId_key" ON public."WizardState" USING btree ("userId");


--
-- TOC entry 3436 (class 1259 OID 26711)
-- Name: import_scritture_testate_codiceUnivocoScaricamento_key; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE UNIQUE INDEX "import_scritture_testate_codiceUnivocoScaricamento_key" ON public.import_scritture_testate USING btree ("codiceUnivocoScaricamento");


--
-- TOC entry 3450 (class 2606 OID 26465)
-- Name: Allocazione Allocazione_commessaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Allocazione"
    ADD CONSTRAINT "Allocazione_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES public."Commessa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3451 (class 2606 OID 26460)
-- Name: Allocazione Allocazione_rigaScritturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Allocazione"
    ADD CONSTRAINT "Allocazione_rigaScritturaId_fkey" FOREIGN KEY ("rigaScritturaId") REFERENCES public."RigaScrittura"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3452 (class 2606 OID 26470)
-- Name: Allocazione Allocazione_voceAnaliticaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Allocazione"
    ADD CONSTRAINT "Allocazione_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES public."VoceAnalitica"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3444 (class 2606 OID 26440)
-- Name: BudgetVoce BudgetVoce_commessaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."BudgetVoce"
    ADD CONSTRAINT "BudgetVoce_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES public."Commessa"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3445 (class 2606 OID 26445)
-- Name: BudgetVoce BudgetVoce_voceAnaliticaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."BudgetVoce"
    ADD CONSTRAINT "BudgetVoce_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES public."VoceAnalitica"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3453 (class 2606 OID 26633)
-- Name: CampoDatiPrimari CampoDatiPrimari_voceTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."CampoDatiPrimari"
    ADD CONSTRAINT "CampoDatiPrimari_voceTemplateId_fkey" FOREIGN KEY ("voceTemplateId") REFERENCES public."VoceTemplateScrittura"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3442 (class 2606 OID 26510)
-- Name: Commessa Commessa_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Commessa"
    ADD CONSTRAINT "Commessa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3443 (class 2606 OID 26668)
-- Name: Commessa Commessa_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Commessa"
    ADD CONSTRAINT "Commessa_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Commessa"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3441 (class 2606 OID 26658)
-- Name: Conto Conto_voceAnaliticaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."Conto"
    ADD CONSTRAINT "Conto_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES public."VoceAnalitica"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3457 (class 2606 OID 26643)
-- Name: FieldDefinition FieldDefinition_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."FieldDefinition"
    ADD CONSTRAINT "FieldDefinition_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ImportTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3459 (class 2606 OID 26712)
-- Name: ImportScritturaRigaContabile ImportScritturaRigaContabile_codiceUnivocoScaricamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ImportScritturaRigaContabile"
    ADD CONSTRAINT "ImportScritturaRigaContabile_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES public.import_scritture_testate("codiceUnivocoScaricamento") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3458 (class 2606 OID 26717)
-- Name: ImportScritturaRigaIva ImportScritturaRigaIva_codiceUnivocoScaricamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ImportScritturaRigaIva"
    ADD CONSTRAINT "ImportScritturaRigaIva_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES public.import_scritture_testate("codiceUnivocoScaricamento") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3455 (class 2606 OID 26543)
-- Name: RigaIva RigaIva_codiceIvaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."RigaIva"
    ADD CONSTRAINT "RigaIva_codiceIvaId_fkey" FOREIGN KEY ("codiceIvaId") REFERENCES public."CodiceIva"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3456 (class 2606 OID 26548)
-- Name: RigaIva RigaIva_rigaScritturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."RigaIva"
    ADD CONSTRAINT "RigaIva_rigaScritturaId_fkey" FOREIGN KEY ("rigaScritturaId") REFERENCES public."RigaScrittura"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3448 (class 2606 OID 26450)
-- Name: RigaScrittura RigaScrittura_contoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."RigaScrittura"
    ADD CONSTRAINT "RigaScrittura_contoId_fkey" FOREIGN KEY ("contoId") REFERENCES public."Conto"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3449 (class 2606 OID 26455)
-- Name: RigaScrittura RigaScrittura_scritturaContabileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."RigaScrittura"
    ADD CONSTRAINT "RigaScrittura_scritturaContabileId_fkey" FOREIGN KEY ("scritturaContabileId") REFERENCES public."ScritturaContabile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3446 (class 2606 OID 26663)
-- Name: ScritturaContabile ScritturaContabile_causaleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ScritturaContabile"
    ADD CONSTRAINT "ScritturaContabile_causaleId_fkey" FOREIGN KEY ("causaleId") REFERENCES public."CausaleContabile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3447 (class 2606 OID 26515)
-- Name: ScritturaContabile ScritturaContabile_fornitoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."ScritturaContabile"
    ADD CONSTRAINT "ScritturaContabile_fornitoreId_fkey" FOREIGN KEY ("fornitoreId") REFERENCES public."Fornitore"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3454 (class 2606 OID 26638)
-- Name: VoceTemplateScrittura VoceTemplateScrittura_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public."VoceTemplateScrittura"
    ADD CONSTRAINT "VoceTemplateScrittura_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ImportTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3460 (class 2606 OID 26745)
-- Name: import_allocazioni import_allocazioni_commessaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public.import_allocazioni
    ADD CONSTRAINT "import_allocazioni_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES public."Commessa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3461 (class 2606 OID 26730)
-- Name: import_allocazioni import_allocazioni_importScritturaRigaContabileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY public.import_allocazioni
    ADD CONSTRAINT "import_allocazioni_importScritturaRigaContabileId_fkey" FOREIGN KEY ("importScritturaRigaContabileId") REFERENCES public."ImportScritturaRigaContabile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3635 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: dev_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-06-24 10:24:34

--
-- PostgreSQL database dump complete
--


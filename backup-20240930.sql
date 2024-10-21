--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Homebrew)
-- Dumped by pg_dump version 14.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: oleksiydzhos
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Project" OWNER TO oleksiydzhos;

--
-- Name: TestCase; Type: TABLE; Schema: public; Owner: oleksiydzhos
--

CREATE TABLE public."TestCase" (
    id text NOT NULL,
    title text NOT NULL,
    "expectedResult" text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    steps text[]
);


ALTER TABLE public."TestCase" OWNER TO oleksiydzhos;

--
-- Name: TestCaseResult; Type: TABLE; Schema: public; Owner: oleksiydzhos
--

CREATE TABLE public."TestCaseResult" (
    id text NOT NULL,
    "testRunId" text NOT NULL,
    "testCaseId" text NOT NULL,
    status text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TestCaseResult" OWNER TO oleksiydzhos;

--
-- Name: TestRun; Type: TABLE; Schema: public; Owner: oleksiydzhos
--

CREATE TABLE public."TestRun" (
    id text NOT NULL,
    name text NOT NULL,
    status text NOT NULL,
    "projectId" text NOT NULL,
    "testSuiteId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TestRun" OWNER TO oleksiydzhos;

--
-- Name: TestSuite; Type: TABLE; Schema: public; Owner: oleksiydzhos
--

CREATE TABLE public."TestSuite" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TestSuite" OWNER TO oleksiydzhos;

--
-- Name: User; Type: TABLE; Schema: public; Owner: oleksiydzhos
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text
);


ALTER TABLE public."User" OWNER TO oleksiydzhos;

--
-- Name: _TestCaseToTestRun; Type: TABLE; Schema: public; Owner: oleksiydzhos
--

CREATE TABLE public."_TestCaseToTestRun" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_TestCaseToTestRun" OWNER TO oleksiydzhos;

--
-- Name: _TestCaseToTestSuite; Type: TABLE; Schema: public; Owner: oleksiydzhos
--

CREATE TABLE public."_TestCaseToTestSuite" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_TestCaseToTestSuite" OWNER TO oleksiydzhos;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: oleksiydzhos
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


ALTER TABLE public._prisma_migrations OWNER TO oleksiydzhos;

--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public."Project" (id, title, description, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: TestCase; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public."TestCase" (id, title, "expectedResult", priority, description, "projectId", "createdAt", "updatedAt", status, steps) FROM stdin;
\.


--
-- Data for Name: TestCaseResult; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public."TestCaseResult" (id, "testRunId", "testCaseId", status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TestRun; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public."TestRun" (id, name, status, "projectId", "testSuiteId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TestSuite; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public."TestSuite" (id, name, description, "projectId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public."User" (id, email, name) FROM stdin;
\.


--
-- Data for Name: _TestCaseToTestRun; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public."_TestCaseToTestRun" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _TestCaseToTestSuite; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public."_TestCaseToTestSuite" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: oleksiydzhos
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0b2fbee0-9b2b-4f34-8222-376f65f8a484	366365c9fa05cbaff8c594de67597b1865c5f550de6328ed22346e4b04ddaf1e	2024-09-29 11:18:48.420842+03	20240929081848_dev_check	\N	\N	2024-09-29 11:18:48.377802+03	1
7230bb7a-8dff-4809-8d60-1df06e532585	4dbcf48f68e5acc06919e4687d515be2262ab35a1cb552f9cb772716a7145181	2024-09-29 18:30:23.711825+03	20240929153023_add_user_project_relation	\N	\N	2024-09-29 18:30:23.696685+03	1
3f4d5912-8deb-4b34-990c-61aa927db981	5aa9bcb26fa8932941f7ce7c7ce1fc187a2be88dd46fa1fe02876b70ec9f9070	2024-09-29 19:23:00.40683+03	20240929162300_update_schema	\N	\N	2024-09-29 19:23:00.402156+03	1
\.


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: TestCaseResult TestCaseResult_pkey; Type: CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestCaseResult"
    ADD CONSTRAINT "TestCaseResult_pkey" PRIMARY KEY (id);


--
-- Name: TestCase TestCase_pkey; Type: CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestCase"
    ADD CONSTRAINT "TestCase_pkey" PRIMARY KEY (id);


--
-- Name: TestRun TestRun_pkey; Type: CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestRun"
    ADD CONSTRAINT "TestRun_pkey" PRIMARY KEY (id);


--
-- Name: TestSuite TestSuite_pkey; Type: CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestSuite"
    ADD CONSTRAINT "TestSuite_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: TestCaseResult_testCaseId_testRunId_key; Type: INDEX; Schema: public; Owner: oleksiydzhos
--

CREATE UNIQUE INDEX "TestCaseResult_testCaseId_testRunId_key" ON public."TestCaseResult" USING btree ("testCaseId", "testRunId");


--
-- Name: TestCase_id_projectId_key; Type: INDEX; Schema: public; Owner: oleksiydzhos
--

CREATE UNIQUE INDEX "TestCase_id_projectId_key" ON public."TestCase" USING btree (id, "projectId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: oleksiydzhos
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _TestCaseToTestRun_AB_unique; Type: INDEX; Schema: public; Owner: oleksiydzhos
--

CREATE UNIQUE INDEX "_TestCaseToTestRun_AB_unique" ON public."_TestCaseToTestRun" USING btree ("A", "B");


--
-- Name: _TestCaseToTestRun_B_index; Type: INDEX; Schema: public; Owner: oleksiydzhos
--

CREATE INDEX "_TestCaseToTestRun_B_index" ON public."_TestCaseToTestRun" USING btree ("B");


--
-- Name: _TestCaseToTestSuite_AB_unique; Type: INDEX; Schema: public; Owner: oleksiydzhos
--

CREATE UNIQUE INDEX "_TestCaseToTestSuite_AB_unique" ON public."_TestCaseToTestSuite" USING btree ("A", "B");


--
-- Name: _TestCaseToTestSuite_B_index; Type: INDEX; Schema: public; Owner: oleksiydzhos
--

CREATE INDEX "_TestCaseToTestSuite_B_index" ON public."_TestCaseToTestSuite" USING btree ("B");


--
-- Name: Project Project_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TestCaseResult TestCaseResult_testCaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestCaseResult"
    ADD CONSTRAINT "TestCaseResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES public."TestCase"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TestCaseResult TestCaseResult_testRunId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestCaseResult"
    ADD CONSTRAINT "TestCaseResult_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES public."TestRun"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TestCase TestCase_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestCase"
    ADD CONSTRAINT "TestCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestRun TestRun_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestRun"
    ADD CONSTRAINT "TestRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestRun TestRun_testSuiteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestRun"
    ADD CONSTRAINT "TestRun_testSuiteId_fkey" FOREIGN KEY ("testSuiteId") REFERENCES public."TestSuite"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TestSuite TestSuite_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."TestSuite"
    ADD CONSTRAINT "TestSuite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TestCaseToTestRun _TestCaseToTestRun_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."_TestCaseToTestRun"
    ADD CONSTRAINT "_TestCaseToTestRun_A_fkey" FOREIGN KEY ("A") REFERENCES public."TestCase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TestCaseToTestRun _TestCaseToTestRun_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."_TestCaseToTestRun"
    ADD CONSTRAINT "_TestCaseToTestRun_B_fkey" FOREIGN KEY ("B") REFERENCES public."TestRun"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TestCaseToTestSuite _TestCaseToTestSuite_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."_TestCaseToTestSuite"
    ADD CONSTRAINT "_TestCaseToTestSuite_A_fkey" FOREIGN KEY ("A") REFERENCES public."TestCase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TestCaseToTestSuite _TestCaseToTestSuite_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: oleksiydzhos
--

ALTER TABLE ONLY public."_TestCaseToTestSuite"
    ADD CONSTRAINT "_TestCaseToTestSuite_B_fkey" FOREIGN KEY ("B") REFERENCES public."TestSuite"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: oleksiydzhos
--

GRANT ALL ON SCHEMA public TO admin;


--
-- PostgreSQL database dump complete
--


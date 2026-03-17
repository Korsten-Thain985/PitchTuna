--
-- PostgreSQL database dump
--

\restrict RdzO8jugjUlkUszkdBVe8Ys02mONzObBk7NW8VT6on1zSTjtKWoEsQLZqYQE0d9

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attempts (
    attempt_id integer NOT NULL,
    user_id text NOT NULL,
    user_name text NOT NULL,
    target_note text NOT NULL,
    target_pitch numeric(10,4) NOT NULL,
    achieved_pitch numeric(10,4) NOT NULL,
    deviation_hz numeric(10,4) NOT NULL,
    deviation_cent numeric(10,4) NOT NULL,
    time_to_hit_ms integer NOT NULL,
    success boolean DEFAULT false NOT NULL,
    confidence numeric(5,4) DEFAULT 0,
    note_detected text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.attempts OWNER TO postgres;

--
-- Name: attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attempts_attempt_id_seq OWNER TO postgres;

--
-- Name: attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attempts_attempt_id_seq OWNED BY public.attempts.attempt_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    preferred_range text DEFAULT 'C3-G5'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.attempts_attempt_id_seq'::regclass);


--
-- Data for Name: attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attempts (attempt_id, user_id, user_name, target_note, target_pitch, achieved_pitch, deviation_hz, deviation_cent, time_to_hit_ms, success, confidence, note_detected, created_at) FROM stdin;
1	user_patrick_001	Patrick	C4	261.6300	261.7000	0.0700	0.5000	1950	t	0.9800	C4	2026-02-17 16:15:00.435426+01
2	user_patrick_001	Patrick	G4	392.0000	389.8000	-2.2000	-9.7000	4800	f	0.5800	F#4	2026-02-18 16:15:00.435426+01
3	user_patrick_001	Patrick	E4	329.6300	332.1000	2.4700	12.9000	6100	f	0.4400	F4	2026-02-19 16:15:00.435426+01
4	user_patrick_001	Patrick	A3	220.0000	220.0300	0.0300	0.2000	1400	t	0.9900	A3	2026-02-20 16:15:00.435426+01
5	user_patrick_001	Patrick	D4	293.6600	294.2000	0.5400	3.2000	2600	t	0.9100	D4	2026-02-21 16:15:00.435426+01
6	user_patrick_001	Patrick	B3	246.9400	247.1000	0.1600	1.1000	5500	t	0.8700	B3	2026-02-22 16:15:00.435426+01
7	user_zhang_002	Zhang	F#4	369.9900	370.2000	0.2100	1.0000	2700	t	0.9400	F#4	2026-02-16 16:15:00.450952+01
8	user_zhang_002	Zhang	C5	523.2500	530.0000	6.7500	22.1000	7200	f	0.3100	C#5	2026-02-17 16:15:00.450952+01
9	user_zhang_002	Zhang	A4	440.0000	440.5000	0.5000	1.9000	2100	t	0.9600	A4	2026-02-18 16:15:00.450952+01
11	user_zhang_002	Zhang	G3	196.0000	196.0500	0.0500	0.4000	1300	t	0.9900	G3	2026-02-21 16:15:00.450952+01
12	user_zhang_002	Zhang	B4	493.8800	494.3000	0.4200	1.5000	2200	t	0.9300	B4	2026-02-22 16:15:00.450952+01
13	user_mia_003	Mia	G3	196.0000	196.1000	0.1000	0.9000	1600	t	0.9700	G3	2026-02-18 16:15:00.452849+01
14	user_mia_003	Mia	E3	164.8100	162.5000	-2.3100	-24.3000	8900	f	0.2700	Eb3	2026-02-19 16:15:00.452849+01
15	user_mia_003	Mia	B4	493.8800	494.1000	0.2200	0.8000	2300	t	0.9500	B4	2026-02-20 16:15:00.452849+01
16	user_mia_003	Mia	D4	293.6600	286.0000	-7.6600	-45.2000	11200	f	0.1900	C#4	2026-02-21 16:15:00.452849+01
18	user_mia_003	Mia	F4	349.2300	349.5000	0.2700	1.3000	3100	t	0.8900	F4	2026-02-23 16:15:00.452849+01
20	user_1770723735045	Lukas	C4	261.6256	104.3476	-157.2779	8.6734	24716	t	0.8608	Ab2	2026-03-03 12:08:09.150972+01
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, preferred_range, created_at) FROM stdin;
user_patrick_001	Patrick	C3-G5	2026-02-23 16:15:00.425875+01
user_zhang_002	Zhang	A2-C5	2026-02-23 16:15:00.425875+01
user_mia_003	Mia	E3-B5	2026-02-23 16:15:00.425875+01
user_omaygott_1771927240169	Omaygott	C4-C6	2026-02-24 11:00:40.173041+01
1	Test User	A3-A5	2026-02-24 11:00:47.115918+01
user_1770723735045	Lukas	C3-G5	2026-03-03 12:08:09.142865+01
\.


--
-- Name: attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attempts_attempt_id_seq', 20, true);


--
-- Name: attempts attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_attempts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attempts_created_at ON public.attempts USING btree (created_at DESC);


--
-- Name: idx_attempts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attempts_user_id ON public.attempts USING btree (user_id);


--
-- Name: attempts attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict RdzO8jugjUlkUszkdBVe8Ys02mONzObBk7NW8VT6on1zSTjtKWoEsQLZqYQE0d9


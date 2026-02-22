--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, preferred_range, created_at) FROM stdin;
\.


--
-- Name: attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attempts_attempt_id_seq', 1, false);


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


--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5
-- Dumped by pg_dump version 10.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: bodies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bodies (
    id bigint NOT NULL,
    name character varying(255),
    type character varying(255),
    mass double precision,
    diameter integer,
    axial_tilt double precision,
    rotation_period double precision,
    oblateness double precision,
    inserted_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: bodies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bodies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bodies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bodies_id_seq OWNED BY public.bodies.id;


--
-- Name: orbits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orbits (
    id bigint NOT NULL,
    inclination double precision,
    period double precision,
    min_velocity double precision,
    max_velocity double precision,
    semi_major_axis double precision,
    center_body_id bigint NOT NULL,
    orbiting_body_id bigint NOT NULL,
    inserted_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: orbits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orbits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orbits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orbits_id_seq OWNED BY public.orbits.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp without time zone
);


--
-- Name: textures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.textures (
    id bigint NOT NULL,
    ambient_occlusion character varying(255),
    bump character varying(255),
    displacement character varying(255),
    emissive character varying(255),
    map character varying(255),
    normal character varying(255),
    body_id bigint NOT NULL,
    inserted_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: textures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.textures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: textures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.textures_id_seq OWNED BY public.textures.id;


--
-- Name: bodies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bodies ALTER COLUMN id SET DEFAULT nextval('public.bodies_id_seq'::regclass);


--
-- Name: orbits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orbits ALTER COLUMN id SET DEFAULT nextval('public.orbits_id_seq'::regclass);


--
-- Name: textures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.textures ALTER COLUMN id SET DEFAULT nextval('public.textures_id_seq'::regclass);


--
-- Name: bodies bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bodies
    ADD CONSTRAINT bodies_pkey PRIMARY KEY (id);


--
-- Name: orbits orbits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orbits
    ADD CONSTRAINT orbits_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: textures textures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.textures
    ADD CONSTRAINT textures_pkey PRIMARY KEY (id);


--
-- Name: orbits_center_body_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orbits_center_body_id_index ON public.orbits USING btree (center_body_id);


--
-- Name: orbits_orbiting_body_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orbits_orbiting_body_id_index ON public.orbits USING btree (orbiting_body_id);


--
-- Name: textures_body_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX textures_body_id_index ON public.textures USING btree (body_id);


--
-- Name: orbits orbits_center_body_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orbits
    ADD CONSTRAINT orbits_center_body_id_fkey FOREIGN KEY (center_body_id) REFERENCES public.bodies(id) ON DELETE CASCADE;


--
-- Name: orbits orbits_orbiting_body_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orbits
    ADD CONSTRAINT orbits_orbiting_body_id_fkey FOREIGN KEY (orbiting_body_id) REFERENCES public.bodies(id) ON DELETE CASCADE;


--
-- Name: textures textures_body_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.textures
    ADD CONSTRAINT textures_body_id_fkey FOREIGN KEY (body_id) REFERENCES public.bodies(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

INSERT INTO public."schema_migrations" (version) VALUES (20181024004320), (20181106021154), (20181107030443);


--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-1.pgdg110+1)
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activites_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activites_documents (
    id character varying(255) NOT NULL,
    activite_document_type_id character varying(3) NOT NULL,
    date character varying(10) NOT NULL,
    activite_id character varying(255),
    description character varying(1024),
    largeobject_id oid NOT NULL
);


--
-- Name: administrations__activites_types__emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administrations__activites_types__emails (
    activite_type_id character varying(3) NOT NULL,
    administration_id character varying(64) NOT NULL,
    email character varying(255) NOT NULL
);


--
-- Name: communes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communes (
    id character varying(5) NOT NULL,
    nom character varying(255) NOT NULL,
    geometry public.geometry NOT NULL
);


--
-- Name: entreprises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entreprises (
    id character varying(64) NOT NULL,
    nom character varying(255) NOT NULL,
    pays_id character varying(255),
    legal_siren character varying(255),
    legal_etranger character varying(255),
    legal_forme character varying(255),
    categorie character varying(255),
    date_creation character varying(10),
    adresse character varying(255),
    code_postal character varying(255),
    commune character varying(255),
    cedex character varying(255),
    url character varying(1024),
    email character varying(255),
    telephone character varying(255),
    archive boolean DEFAULT false NOT NULL
);


--
-- Name: entreprises_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entreprises_documents (
    id character varying(255) NOT NULL,
    entreprise_document_type_id character varying(3) NOT NULL,
    date character varying(10) NOT NULL,
    entreprise_id character varying(64),
    description character varying(1024),
    largeobject_id oid NOT NULL
);


--
-- Name: entreprises_etablissements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entreprises_etablissements (
    id character varying(64) NOT NULL,
    entreprise_id character varying(64) NOT NULL,
    nom character varying(255) NOT NULL,
    legal_siret character varying(255),
    date_debut character varying(10) NOT NULL,
    date_fin character varying(10)
);


--
-- Name: etape_avis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.etape_avis (
    id character varying(255) NOT NULL,
    avis_type_id character varying(255) NOT NULL,
    avis_statut_id character varying(255) NOT NULL,
    avis_visibility_id character varying(255) NOT NULL,
    etape_id character varying(255) NOT NULL,
    description text NOT NULL,
    date character varying(10) NOT NULL,
    largeobject_id oid
);


--
-- Name: etapes_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.etapes_documents (
    id character varying(255) NOT NULL,
    etape_document_type_id character varying(3) NOT NULL,
    etape_id character varying(255) NOT NULL,
    description character varying(1024),
    public_lecture boolean NOT NULL,
    entreprises_lecture boolean NOT NULL,
    largeobject_id oid NOT NULL
);


--
-- Name: forets_postgis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forets_postgis (
    id character varying(30) NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);


--
-- Name: journaux; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journaux (
    id character varying(255) NOT NULL,
    utilisateur_id character varying(255) NOT NULL,
    date timestamp with time zone NOT NULL,
    element_id character varying(255) NOT NULL,
    operation text NOT NULL,
    differences jsonb,
    titre_id character varying(128) NOT NULL,
    CONSTRAINT logs_operation_check CHECK ((operation = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text])))
);


--
-- Name: logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logs (
    datetime timestamp with time zone DEFAULT now() NOT NULL,
    path character varying(255),
    method character varying(6) NOT NULL,
    body jsonb,
    utilisateur_id character varying(255) NOT NULL
);


--
-- Name: perimetre_reference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.perimetre_reference (
    titre_etape_id character varying(255) NOT NULL,
    geo_systeme character varying(255) NOT NULL,
    opposable boolean DEFAULT false,
    geojson_perimetre jsonb
);


--
-- Name: sdom_zones_postgis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sdom_zones_postgis (
    id character varying(30) NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);


--
-- Name: secteurs_maritime_postgis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.secteurs_maritime_postgis (
    id integer NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);


--
-- Name: titres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.titres (
    id character varying(128) NOT NULL,
    nom character varying(255) NOT NULL,
    type_id character varying(3) NOT NULL,
    titre_statut_id character varying(3) DEFAULT 'ind'::character varying NOT NULL,
    public_lecture boolean DEFAULT false NOT NULL,
    doublon_titre_id character varying(128),
    props_titre_etapes_ids jsonb DEFAULT '{}'::jsonb,
    slug character varying(255) NOT NULL,
    archive boolean DEFAULT false NOT NULL,
    "references" jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: titres__titres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.titres__titres (
    titre_from_id character varying(255) NOT NULL,
    titre_to_id character varying(255) NOT NULL
);


--
-- Name: titres_activites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.titres_activites (
    id character varying(255) NOT NULL,
    titre_id character varying(128),
    utilisateur_id character varying(128),
    date character varying(10) NOT NULL,
    date_saisie character varying(10),
    contenu jsonb,
    type_id character varying(3) NOT NULL,
    activite_statut_id character varying(3) NOT NULL,
    annee integer NOT NULL,
    periode_id integer NOT NULL,
    sections jsonb[] NOT NULL,
    suppression boolean DEFAULT false NOT NULL,
    slug character varying(255) NOT NULL
);


--
-- Name: titres_demarches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.titres_demarches (
    id character varying(128) NOT NULL,
    titre_id character varying(128) NOT NULL,
    type_id character varying(3) NOT NULL,
    statut_id character varying(3) DEFAULT 'ind'::character varying NOT NULL,
    public_lecture boolean DEFAULT false NOT NULL,
    entreprises_lecture boolean DEFAULT false NOT NULL,
    ordre integer DEFAULT 0 NOT NULL,
    slug character varying(255),
    description character varying(255),
    archive boolean DEFAULT false NOT NULL,
    demarche_date_debut character varying(10),
    demarche_date_fin character varying(10)
);


--
-- Name: titres_etapes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.titres_etapes (
    id character varying(128) NOT NULL,
    titre_demarche_id character varying(128) NOT NULL,
    type_id character varying(3) NOT NULL,
    statut_id character varying(3) NOT NULL,
    ordre integer DEFAULT 0 NOT NULL,
    date character varying(10) NOT NULL,
    date_debut character varying(10),
    date_fin character varying(10),
    duree integer,
    surface real,
    contenu jsonb,
    heritage_props jsonb,
    heritage_contenu jsonb,
    slug character varying(255),
    archive boolean DEFAULT false NOT NULL,
    substances jsonb DEFAULT '[]'::jsonb NOT NULL,
    secteurs_maritime jsonb DEFAULT '[]'::jsonb NOT NULL,
    administrations_locales jsonb DEFAULT '[]'::jsonb NOT NULL,
    sdom_zones jsonb DEFAULT '[]'::jsonb NOT NULL,
    forets jsonb DEFAULT '[]'::jsonb NOT NULL,
    communes jsonb DEFAULT '[]'::jsonb NOT NULL,
    geojson4326_perimetre public.geometry(MultiPolygon,4326),
    geojson4326_points jsonb,
    geojson_origine_points jsonb,
    geojson_origine_perimetre jsonb,
    geojson_origine_geo_systeme_id character varying,
    geojson4326_forages jsonb,
    geojson_origine_forages jsonb,
    titulaire_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    amodiataire_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_brouillon boolean DEFAULT false NOT NULL,
    note jsonb DEFAULT json_build_object('valeur', '', 'is_avertissement', false) NOT NULL,
    CONSTRAINT forages_origine_not_null_when_forages4326_not_null CHECK (((ROW(geojson4326_forages, geojson_origine_forages) IS NULL) OR (ROW(geojson4326_forages, geojson_origine_forages) IS NOT NULL))),
    CONSTRAINT perimetre_origine_not_null_when_perimetre_4326_not_null CHECK (((ROW(geojson4326_perimetre, geojson_origine_geo_systeme_id, geojson_origine_perimetre) IS NULL) OR (ROW(geojson4326_perimetre, geojson_origine_geo_systeme_id, geojson_origine_perimetre) IS NOT NULL))),
    CONSTRAINT points_origine_not_null_when_points_4326_not_null CHECK (((ROW(geojson4326_points, geojson_origine_points) IS NULL) OR (ROW(geojson4326_points, geojson_origine_points) IS NOT NULL)))
);


--
-- Name: titres_etapes_entreprises_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.titres_etapes_entreprises_documents (
    titre_etape_id character varying(128) NOT NULL,
    entreprise_document_id character varying(255) NOT NULL
);


--
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilisateurs (
    id character varying(255) NOT NULL,
    email character varying(255),
    nom character varying(255),
    prenom character varying(255),
    telephone_fixe character varying(255),
    telephone_mobile character varying(255),
    role character varying(255) NOT NULL,
    date_creation character varying(255) NOT NULL,
    administration_id character varying(255),
    qgis_token character varying(255),
    keycloak_id character varying(255),
    CONSTRAINT check_keycloak_id_not_null CHECK (((email IS NULL) OR (keycloak_id IS NOT NULL)))
);


--
-- Name: utilisateurs__entreprises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilisateurs__entreprises (
    utilisateur_id character varying(64),
    entreprise_id character varying(64)
);


--
-- Name: utilisateurs__titres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilisateurs__titres (
    utilisateur_id character varying(255) NOT NULL,
    titre_id character varying(255) NOT NULL
);


--
-- Name: activites_documents activites_documents_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activites_documents
    ADD CONSTRAINT activites_documents_pk PRIMARY KEY (id);


--
-- Name: administrations__activites_types__emails administrations__activites_types__emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrations__activites_types__emails
    ADD CONSTRAINT administrations__activites_types__emails_pkey PRIMARY KEY (administration_id, activite_type_id, email);


--
-- Name: communes communes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communes
    ADD CONSTRAINT communes_pkey PRIMARY KEY (id);


--
-- Name: entreprises_documents entreprises_documents_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entreprises_documents
    ADD CONSTRAINT entreprises_documents_pk PRIMARY KEY (id);


--
-- Name: entreprises_etablissements entreprises_etablissements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entreprises_etablissements
    ADD CONSTRAINT entreprises_etablissements_pkey PRIMARY KEY (id);


--
-- Name: entreprises entreprises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entreprises
    ADD CONSTRAINT entreprises_pkey PRIMARY KEY (id);


--
-- Name: etapes_documents etapes_documents_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etapes_documents
    ADD CONSTRAINT etapes_documents_pk PRIMARY KEY (id);


--
-- Name: forets_postgis forets_postgis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forets_postgis
    ADD CONSTRAINT forets_postgis_pkey PRIMARY KEY (id);


--
-- Name: journaux logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journaux
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: perimetre_reference perimetre_reference_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perimetre_reference
    ADD CONSTRAINT perimetre_reference_pk PRIMARY KEY (titre_etape_id, geo_systeme);


--
-- Name: sdom_zones_postgis sdom_zones_postgis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sdom_zones_postgis
    ADD CONSTRAINT sdom_zones_postgis_pkey PRIMARY KEY (id);


--
-- Name: secteurs_maritime_postgis secteurs_maritime_postgis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secteurs_maritime_postgis
    ADD CONSTRAINT secteurs_maritime_postgis_pkey PRIMARY KEY (id);


--
-- Name: titres__titres titres__titres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres__titres
    ADD CONSTRAINT titres__titres_pkey PRIMARY KEY (titre_from_id, titre_to_id);


--
-- Name: titres_activites titres_activites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_activites
    ADD CONSTRAINT titres_activites_pkey PRIMARY KEY (id);


--
-- Name: titres_demarches titres_demarches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_demarches
    ADD CONSTRAINT titres_demarches_pkey PRIMARY KEY (id);


--
-- Name: titres_etapes_entreprises_documents titres_etapes_justificatifs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_etapes_entreprises_documents
    ADD CONSTRAINT titres_etapes_justificatifs_pkey PRIMARY KEY (titre_etape_id, entreprise_document_id);


--
-- Name: titres_etapes titres_etapes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_etapes
    ADD CONSTRAINT titres_etapes_pkey PRIMARY KEY (id);


--
-- Name: titres titres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres
    ADD CONSTRAINT titres_pkey PRIMARY KEY (id);


--
-- Name: utilisateurs__titres utilisateurs__titres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs__titres
    ADD CONSTRAINT utilisateurs__titres_pkey PRIMARY KEY (utilisateur_id, titre_id);


--
-- Name: utilisateurs utilisateurs_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_unique UNIQUE (email);


--
-- Name: utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id);


--
-- Name: administrations__activitestypes__emails_activitetypeid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX administrations__activitestypes__emails_activitetypeid_index ON public.administrations__activites_types__emails USING btree (activite_type_id);


--
-- Name: administrations__activitestypes__emails_administrationid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX administrations__activitestypes__emails_administrationid_index ON public.administrations__activites_types__emails USING btree (administration_id);


--
-- Name: entreprisesetablissements_entrepriseid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entreprisesetablissements_entrepriseid_index ON public.entreprises_etablissements USING btree (entreprise_id);


--
-- Name: index_geo_forets; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_geo_forets ON public.forets_postgis USING spgist (geometry);


--
-- Name: index_geo_sdom_zones; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_geo_sdom_zones ON public.sdom_zones_postgis USING spgist (geometry);


--
-- Name: index_geo_secteurs_maritime; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_geo_secteurs_maritime ON public.secteurs_maritime_postgis USING spgist (geometry);


--
-- Name: journaux_titreid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journaux_titreid_index ON public.journaux USING btree (titre_id);


--
-- Name: logs_utilisateurid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX logs_utilisateurid_index ON public.journaux USING btree (utilisateur_id);


--
-- Name: titres__titres_titrefromid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres__titres_titrefromid_index ON public.titres__titres USING btree (titre_from_id);


--
-- Name: titres__titres_titretoid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres__titres_titretoid_index ON public.titres__titres USING btree (titre_to_id);


--
-- Name: titres_domaines_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_domaines_idx ON public.titres USING btree ("right"((type_id)::text, 1));


--
-- Name: titres_etapes_administrations_locales_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_etapes_administrations_locales_index ON public.titres_etapes USING btree (administrations_locales);


--
-- Name: titres_etapes_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_etapes_geom_idx ON public.titres_etapes USING gist (geojson4326_perimetre);


--
-- Name: titres_etapes_sdom_zones_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_etapes_sdom_zones_index ON public.titres_etapes USING btree (sdom_zones);


--
-- Name: titres_etapes_secteurs_maritime_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_etapes_secteurs_maritime_index ON public.titres_etapes USING btree (secteurs_maritime);


--
-- Name: titres_etapes_substances_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_etapes_substances_index ON public.titres_etapes USING btree (substances);


--
-- Name: titres_references_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_references_index ON public.titres USING btree ("references");


--
-- Name: titres_slug_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_slug_index ON public.titres USING btree (slug);


--
-- Name: titres_statutid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_statutid_index ON public.titres USING btree (titre_statut_id);


--
-- Name: titres_typeid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_typeid_index ON public.titres USING btree (type_id);


--
-- Name: titres_types_types_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titres_types_types_idx ON public.titres USING btree ("left"((type_id)::text, 2));


--
-- Name: titresactivites_slug_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresactivites_slug_index ON public.titres_activites USING btree (slug);


--
-- Name: titresactivites_statutid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresactivites_statutid_index ON public.titres_activites USING btree (activite_statut_id);


--
-- Name: titresactivites_titreid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresactivites_titreid_index ON public.titres_activites USING btree (titre_id);


--
-- Name: titresactivites_typeid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresactivites_typeid_index ON public.titres_activites USING btree (type_id);


--
-- Name: titresactivites_utilisateurid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresactivites_utilisateurid_index ON public.titres_activites USING btree (utilisateur_id);


--
-- Name: titresdemarches_slug_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresdemarches_slug_index ON public.titres_demarches USING btree (slug);


--
-- Name: titresdemarches_statutid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresdemarches_statutid_index ON public.titres_demarches USING btree (statut_id);


--
-- Name: titresdemarches_titreid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresdemarches_titreid_index ON public.titres_demarches USING btree (titre_id);


--
-- Name: titresdemarches_typeid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresdemarches_typeid_index ON public.titres_demarches USING btree (type_id);


--
-- Name: titresetapes_slug_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresetapes_slug_index ON public.titres_etapes USING btree (slug);


--
-- Name: titresetapes_statutid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresetapes_statutid_index ON public.titres_etapes USING btree (statut_id);


--
-- Name: titresetapes_titredemarcheid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresetapes_titredemarcheid_index ON public.titres_etapes USING btree (titre_demarche_id);


--
-- Name: titresetapes_typeid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresetapes_typeid_index ON public.titres_etapes USING btree (type_id);


--
-- Name: titresetapesjustificatifs_documentid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresetapesjustificatifs_documentid_index ON public.titres_etapes_entreprises_documents USING btree (entreprise_document_id);


--
-- Name: titresetapesjustificatifs_titreetapeid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titresetapesjustificatifs_titreetapeid_index ON public.titres_etapes_entreprises_documents USING btree (titre_etape_id);


--
-- Name: utilisateurs__entreprises_entrepriseid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX utilisateurs__entreprises_entrepriseid_index ON public.utilisateurs__entreprises USING btree (entreprise_id);


--
-- Name: utilisateurs__entreprises_utilisateurid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX utilisateurs__entreprises_utilisateurid_index ON public.utilisateurs__entreprises USING btree (utilisateur_id);


--
-- Name: utilisateurs__titres_titreid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX utilisateurs__titres_titreid_index ON public.utilisateurs__titres USING btree (titre_id);


--
-- Name: utilisateurs__titres_utilisateurid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX utilisateurs__titres_utilisateurid_index ON public.utilisateurs__titres USING btree (utilisateur_id);


--
-- Name: utilisateurs_administrationid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX utilisateurs_administrationid_index ON public.utilisateurs USING btree (administration_id);


--
-- Name: utilisateurs_qgis_token_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX utilisateurs_qgis_token_index ON public.utilisateurs USING btree (qgis_token);


--
-- Name: activites_documents activites_documents_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activites_documents
    ADD CONSTRAINT activites_documents_fk FOREIGN KEY (activite_id) REFERENCES public.titres_activites(id);


--
-- Name: entreprises_documents entreprises_documents_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entreprises_documents
    ADD CONSTRAINT entreprises_documents_fk FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id);


--
-- Name: entreprises_etablissements entreprisesetablissements_entrepriseid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entreprises_etablissements
    ADD CONSTRAINT entreprisesetablissements_entrepriseid_foreign FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON DELETE CASCADE;


--
-- Name: etapes_documents etapes_documents_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etapes_documents
    ADD CONSTRAINT etapes_documents_fk FOREIGN KEY (etape_id) REFERENCES public.titres_etapes(id);


--
-- Name: journaux journaux_titreid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journaux
    ADD CONSTRAINT journaux_titreid_foreign FOREIGN KEY (titre_id) REFERENCES public.titres(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: logs logs__utilisateur_id__foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs__utilisateur_id__foreign FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id);


--
-- Name: perimetre_reference perimetre_reference_titre_etape_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perimetre_reference
    ADD CONSTRAINT perimetre_reference_titre_etape_fk FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id);


--
-- Name: titres__titres titres__titres_titrefromid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres__titres
    ADD CONSTRAINT titres__titres_titrefromid_foreign FOREIGN KEY (titre_from_id) REFERENCES public.titres(id);


--
-- Name: titres__titres titres__titres_titretoid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres__titres
    ADD CONSTRAINT titres__titres_titretoid_foreign FOREIGN KEY (titre_to_id) REFERENCES public.titres(id);


--
-- Name: titres_etapes_entreprises_documents titres_etapes_entreprises_documents_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_etapes_entreprises_documents
    ADD CONSTRAINT titres_etapes_entreprises_documents_fk FOREIGN KEY (entreprise_document_id) REFERENCES public.entreprises_documents(id);


--
-- Name: titres_activites titresactivites_titreid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_activites
    ADD CONSTRAINT titresactivites_titreid_foreign FOREIGN KEY (titre_id) REFERENCES public.titres(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: titres_activites titresactivites_utilisateurid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_activites
    ADD CONSTRAINT titresactivites_utilisateurid_foreign FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id);


--
-- Name: titres_demarches titresdemarches_titreid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_demarches
    ADD CONSTRAINT titresdemarches_titreid_foreign FOREIGN KEY (titre_id) REFERENCES public.titres(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: titres_etapes titresetapes_titredemarcheid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_etapes
    ADD CONSTRAINT titresetapes_titredemarcheid_foreign FOREIGN KEY (titre_demarche_id) REFERENCES public.titres_demarches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: titres_etapes_entreprises_documents titresetapesjustificatifs_titreetapeid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titres_etapes_entreprises_documents
    ADD CONSTRAINT titresetapesjustificatifs_titreetapeid_foreign FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: utilisateurs__entreprises utilisateurs__entreprises_entrepriseid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs__entreprises
    ADD CONSTRAINT utilisateurs__entreprises_entrepriseid_foreign FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON DELETE CASCADE;


--
-- Name: utilisateurs__entreprises utilisateurs__entreprises_utilisateurid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs__entreprises
    ADD CONSTRAINT utilisateurs__entreprises_utilisateurid_foreign FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- Name: utilisateurs__titres utilisateurs__titres_titreid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs__titres
    ADD CONSTRAINT utilisateurs__titres_titreid_foreign FOREIGN KEY (titre_id) REFERENCES public.titres(id) ON DELETE CASCADE;


--
-- Name: utilisateurs__titres utilisateurs__titres_utilisateurid_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs__titres
    ADD CONSTRAINT utilisateurs__titres_utilisateurid_foreign FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

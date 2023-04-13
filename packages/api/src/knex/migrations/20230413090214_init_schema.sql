SET default_tablespace = '';
SET default_table_access_method = heap;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE public.activites_types (
    id character varying(3) NOT NULL,
    nom character varying(255) NOT NULL,
    sections jsonb[] NOT NULL,
    frequence_id character varying(3) NOT NULL,
    date_debut character varying(255) NOT NULL,
    delai_mois integer,
    ordre integer NOT NULL,
    description text
);
ALTER TABLE public.activites_types OWNER TO postgres;
CREATE TABLE public.activites_types__documents_types (
    activite_type_id character varying(3) NOT NULL,
    document_type_id character varying(3) NOT NULL,
    optionnel boolean
);
ALTER TABLE public.activites_types__documents_types OWNER TO postgres;
CREATE TABLE public.activites_types__pays (
    pays_id character varying(3) NOT NULL,
    activite_type_id character varying(3) NOT NULL
);
ALTER TABLE public.activites_types__pays OWNER TO postgres;
CREATE TABLE public.activites_types__titres_types (
    titre_type_id character varying(3) NOT NULL,
    activite_type_id character varying(3) NOT NULL
);
ALTER TABLE public.activites_types__titres_types OWNER TO postgres;
CREATE TABLE public.administrations (
    id character varying(64) NOT NULL
);
ALTER TABLE public.administrations OWNER TO postgres;
CREATE TABLE public.administrations__activites_types (
    activite_type_id character varying(3) NOT NULL,
    administration_id character varying(64) NOT NULL,
    modification_interdit boolean,
    lecture_interdit boolean
);
ALTER TABLE public.administrations__activites_types OWNER TO postgres;
CREATE TABLE public.administrations__activites_types__emails (
    activite_type_id character varying(3) NOT NULL,
    administration_id character varying(64) NOT NULL,
    email character varying(255) NOT NULL
);
ALTER TABLE public.administrations__activites_types__emails OWNER TO postgres;
CREATE TABLE public.caches (
    id character varying(128) NOT NULL,
    valeur jsonb
);
ALTER TABLE public.caches OWNER TO postgres;
CREATE TABLE public.communes (
    id character varying(5) NOT NULL,
    nom character varying(255) NOT NULL,
    departement_id character varying(3) NOT NULL
);
ALTER TABLE public.communes OWNER TO postgres;
CREATE TABLE public.communes_postgis (
    id character varying(5) NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);
ALTER TABLE public.communes_postgis OWNER TO postgres;
CREATE TABLE public.demarches_types (
    id character varying(3) NOT NULL,
    nom character varying(255) NOT NULL,
    description text,
    ordre integer,
    duree boolean,
    points boolean,
    substances boolean,
    titulaires boolean,
    renouvelable boolean,
    exception boolean,
    auto boolean,
    travaux boolean
);
ALTER TABLE public.demarches_types OWNER TO postgres;
CREATE TABLE public.documents (
    id character varying(255) NOT NULL,
    type_id character varying(3) NOT NULL,
    date character varying(10) NOT NULL,
    entreprise_id character varying(64),
    titre_etape_id character varying(128),
    description character varying(1024),
    titre_activite_id character varying(128),
    fichier boolean,
    fichier_type_id character varying(3),
    url character varying(1024),
    uri character varying(1024),
    jorf character varying(32),
    nor character varying(32),
    public_lecture boolean,
    entreprises_lecture boolean
);
ALTER TABLE public.documents OWNER TO postgres;
CREATE TABLE public.documents_types (
    id character varying(3) NOT NULL,
    nom character varying(255) NOT NULL,
    description text
);
ALTER TABLE public.documents_types OWNER TO postgres;
CREATE TABLE public.domaines (
    id character varying(1) NOT NULL,
    nom character varying(255) NOT NULL,
    description text,
    ordre integer NOT NULL
);
ALTER TABLE public.domaines OWNER TO postgres;
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
    archive boolean DEFAULT false
);
ALTER TABLE public.entreprises OWNER TO postgres;
CREATE TABLE public.entreprises__documents_types (
    document_type_id character varying(3) NOT NULL
);
ALTER TABLE public.entreprises__documents_types OWNER TO postgres;
CREATE TABLE public.entreprises_etablissements (
    id character varying(64) NOT NULL,
    entreprise_id character varying(64) NOT NULL,
    nom character varying(255),
    legal_siret character varying(255),
    date_debut character varying(10),
    date_fin character varying(10)
);
ALTER TABLE public.entreprises_etablissements OWNER TO postgres;
CREATE TABLE public.etapes_types (
    id character varying(3) NOT NULL,
    nom character varying(128),
    description text,
    ordre integer NOT NULL,
    fondamentale boolean,
    "unique" boolean,
    acceptation_auto boolean,
    date_fin character varying(10),
    sections jsonb[],
    public_lecture boolean,
    entreprises_lecture boolean
);
ALTER TABLE public.etapes_types OWNER TO postgres;
CREATE TABLE public.etapes_types__justificatifs_types (
    etape_type_id character varying(3) NOT NULL,
    document_type_id character varying(3) NOT NULL,
    optionnel boolean,
    description text
);
ALTER TABLE public.etapes_types__justificatifs_types OWNER TO postgres;
CREATE TABLE public.forets (
    id character varying(30) NOT NULL,
    nom character varying(255) NOT NULL
);
ALTER TABLE public.forets OWNER TO postgres;
CREATE TABLE public.forets_postgis (
    id character varying(30) NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);
ALTER TABLE public.forets_postgis OWNER TO postgres;
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
ALTER TABLE public.journaux OWNER TO postgres;
CREATE TABLE public.sdom_zones_postgis (
    id character varying(30) NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);
ALTER TABLE public.sdom_zones_postgis OWNER TO postgres;
CREATE TABLE public.secteurs_maritime_postgis (
    id integer NOT NULL,
    geometry public.geometry(MultiPolygon,4326)
);
ALTER TABLE public.secteurs_maritime_postgis OWNER TO postgres;
CREATE TABLE public.titres (
    id character varying(128) NOT NULL,
    nom character varying(255) NOT NULL,
    type_id character varying(3) NOT NULL,
    titre_statut_id character varying(3) DEFAULT 'ind'::character varying NOT NULL,
    date_debut character varying(10),
    date_fin character varying(10),
    date_demande character varying(10),
    public_lecture boolean DEFAULT false,
    entreprises_lecture boolean DEFAULT false,
    doublon_titre_id character varying(128),
    contenus_titre_etapes_ids jsonb,
    coordonnees point,
    props_titre_etapes_ids jsonb DEFAULT '{}'::jsonb,
    slug character varying(255),
    archive boolean DEFAULT false NOT NULL,
    "references" jsonb DEFAULT '[]'::jsonb NOT NULL
);
ALTER TABLE public.titres OWNER TO postgres;
CREATE TABLE public.titres__titres (
    titre_from_id character varying(255) NOT NULL,
    titre_to_id character varying(255) NOT NULL
);
ALTER TABLE public.titres__titres OWNER TO postgres;
CREATE TABLE public.titres_activites (
    id character varying(255) NOT NULL,
    titre_id character varying(128),
    utilisateur_id character varying(128),
    date character varying(10),
    date_saisie character varying(10),
    contenu jsonb,
    type_id character varying(3) NOT NULL,
    activite_statut_id character varying(3) NOT NULL,
    annee integer NOT NULL,
    periode_id integer,
    sections jsonb[],
    suppression boolean,
    slug character varying(255)
);
ALTER TABLE public.titres_activites OWNER TO postgres;
CREATE TABLE public.titres_amodiataires (
    titre_etape_id character varying(128) NOT NULL,
    entreprise_id character varying(64) NOT NULL,
    operateur boolean
);
ALTER TABLE public.titres_amodiataires OWNER TO postgres;
CREATE TABLE public.titres_communes (
    titre_etape_id character varying(128) NOT NULL,
    commune_id character varying(8) NOT NULL,
    surface integer
);
ALTER TABLE public.titres_communes OWNER TO postgres;
CREATE TABLE public.titres_demarches (
    id character varying(128) NOT NULL,
    titre_id character varying(128) NOT NULL,
    type_id character varying(3) NOT NULL,
    statut_id character varying(3) DEFAULT 'ind'::character varying NOT NULL,
    public_lecture boolean DEFAULT false,
    entreprises_lecture boolean DEFAULT false,
    ordre integer DEFAULT 0,
    slug character varying(255),
    description character varying(255),
    archive boolean DEFAULT false NOT NULL
);
ALTER TABLE public.titres_demarches OWNER TO postgres;
CREATE TABLE public.titres_demarches_liens (
    enfant_titre_demarche_id character varying(128) NOT NULL,
    parent_titre_demarche_id character varying(128) NOT NULL
);
ALTER TABLE public.titres_demarches_liens OWNER TO postgres;
CREATE TABLE public.titres_etapes (
    id character varying(128) NOT NULL,
    titre_demarche_id character varying(128) NOT NULL,
    type_id character varying(3) NOT NULL,
    statut_id character varying(3) NOT NULL,
    ordre integer,
    date character varying(10) NOT NULL,
    date_debut character varying(10),
    date_fin character varying(10),
    duree integer,
    surface real,
    contenu jsonb,
    incertitudes jsonb,
    heritage_props jsonb,
    heritage_contenu jsonb,
    slug character varying(255),
    decisions_annexes_sections jsonb[],
    decisions_annexes_contenu json,
    archive boolean DEFAULT false NOT NULL,
    substances jsonb DEFAULT '[]'::jsonb NOT NULL,
    secteurs_maritime jsonb,
    administrations_locales jsonb,
    sdom_zones jsonb
);
ALTER TABLE public.titres_etapes OWNER TO postgres;
CREATE TABLE public.titres_etapes_justificatifs (
    titre_etape_id character varying(128) NOT NULL,
    document_id character varying(255) NOT NULL
);
ALTER TABLE public.titres_etapes_justificatifs OWNER TO postgres;
CREATE TABLE public.titres_forets (
    titre_etape_id character varying(128) NOT NULL,
    foret_id character varying(8) NOT NULL
);
ALTER TABLE public.titres_forets OWNER TO postgres;
CREATE TABLE public.titres_phases (
    titre_demarche_id character varying(128) NOT NULL,
    phase_statut_id character varying(3) NOT NULL,
    date_debut character varying(10),
    date_fin character varying(10)
);
ALTER TABLE public.titres_phases OWNER TO postgres;
CREATE TABLE public.titres_points (
    id character varying(255) NOT NULL,
    titre_etape_id character varying(128) NOT NULL,
    coordonnees point NOT NULL,
    groupe integer NOT NULL,
    contour integer NOT NULL,
    point integer NOT NULL,
    nom character varying(255),
    description text,
    securite boolean,
    subsidiaire boolean,
    lot integer,
    slug character varying(255)
);
ALTER TABLE public.titres_points OWNER TO postgres;
CREATE TABLE public.titres_points_references (
    id character varying(255) NOT NULL,
    titre_point_id character varying(255),
    geo_systeme_id character varying(5) NOT NULL,
    coordonnees point NOT NULL,
    opposable boolean,
    slug character varying(255)
);
ALTER TABLE public.titres_points_references OWNER TO postgres;
CREATE TABLE public.titres_titulaires (
    titre_etape_id character varying(128) NOT NULL,
    entreprise_id character varying(64) NOT NULL,
    operateur boolean
);
ALTER TABLE public.titres_titulaires OWNER TO postgres;
CREATE TABLE public.titres_types (
    id character varying(3) NOT NULL,
    domaine_id character varying(1) NOT NULL,
    type_id character varying(3) NOT NULL,
    contenu_ids jsonb[],
    archive boolean
);
ALTER TABLE public.titres_types OWNER TO postgres;
CREATE TABLE public.titres_types__demarches_types__etapes_types (
    titre_type_id character varying(3) NOT NULL,
    ordre integer,
    demarche_type_id character varying(7) NOT NULL,
    etape_type_id character varying(3) NOT NULL,
    sections jsonb[]
);
ALTER TABLE public.titres_types__demarches_types__etapes_types OWNER TO postgres;
CREATE TABLE public.titres_types__demarches_types__etapes_types__justificatifs_t (
    titre_type_id character varying(3) NOT NULL,
    demarche_type_id character varying(7) NOT NULL,
    etape_type_id character varying(3) NOT NULL,
    document_type_id character varying(3) NOT NULL,
    optionnel boolean,
    description text
);
ALTER TABLE public.titres_types__demarches_types__etapes_types__justificatifs_t OWNER TO postgres;
CREATE TABLE public.titres_types_types (
    id character varying(2) NOT NULL,
    nom character varying(255) NOT NULL,
    description text,
    ordre integer NOT NULL
);
ALTER TABLE public.titres_types_types OWNER TO postgres;
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
    qgis_token character varying(255)
);
ALTER TABLE public.utilisateurs OWNER TO postgres;
CREATE TABLE public.utilisateurs__entreprises (
    utilisateur_id character varying(64),
    entreprise_id character varying(64)
);
ALTER TABLE public.utilisateurs__entreprises OWNER TO postgres;
CREATE TABLE public.utilisateurs__titres (
    utilisateur_id character varying(255) NOT NULL,
    titre_id character varying(255) NOT NULL
);
ALTER TABLE public.utilisateurs__titres OWNER TO postgres;
ALTER TABLE ONLY public.activites_types__documents_types
    ADD CONSTRAINT activites_types__documents_types_pkey PRIMARY KEY (activite_type_id, document_type_id);
ALTER TABLE ONLY public.activites_types__pays
    ADD CONSTRAINT activites_types__pays_pkey PRIMARY KEY (pays_id, activite_type_id);
ALTER TABLE ONLY public.activites_types
    ADD CONSTRAINT activites_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.administrations__activites_types__emails
    ADD CONSTRAINT administrations__activites_types__emails_pkey PRIMARY KEY (administration_id, activite_type_id, email);
ALTER TABLE ONLY public.administrations
    ADD CONSTRAINT administrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.caches
    ADD CONSTRAINT caches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.communes
    ADD CONSTRAINT communes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.communes_postgis
    ADD CONSTRAINT communes_postgis_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.demarches_types
    ADD CONSTRAINT demarches_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.documents_types
    ADD CONSTRAINT documents_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.domaines
    ADD CONSTRAINT domaines_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.entreprises__documents_types
    ADD CONSTRAINT entreprises__documents_types_pkey PRIMARY KEY (document_type_id);
ALTER TABLE ONLY public.entreprises_etablissements
    ADD CONSTRAINT entreprises_etablissements_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.entreprises
    ADD CONSTRAINT entreprises_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.etapes_types__justificatifs_types
    ADD CONSTRAINT etapes_types__justificatifs_types_pkey PRIMARY KEY (etape_type_id, document_type_id);
ALTER TABLE ONLY public.etapes_types
    ADD CONSTRAINT etapes_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.forets
    ADD CONSTRAINT forets_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.forets_postgis
    ADD CONSTRAINT forets_postgis_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.journaux
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sdom_zones_postgis
    ADD CONSTRAINT sdom_zones_postgis_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.secteurs_maritime_postgis
    ADD CONSTRAINT secteurs_maritime_postgis_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres__titres
    ADD CONSTRAINT titres__titres_pkey PRIMARY KEY (titre_from_id, titre_to_id);
ALTER TABLE ONLY public.titres_activites
    ADD CONSTRAINT titres_activites_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres_amodiataires
    ADD CONSTRAINT titres_amodiataires_pkey PRIMARY KEY (titre_etape_id, entreprise_id);
ALTER TABLE ONLY public.titres_communes
    ADD CONSTRAINT titres_communes_pkey PRIMARY KEY (titre_etape_id, commune_id);
ALTER TABLE ONLY public.titres_demarches_liens
    ADD CONSTRAINT titres_demarches_liens_pkey PRIMARY KEY (enfant_titre_demarche_id, parent_titre_demarche_id);
ALTER TABLE ONLY public.titres_demarches
    ADD CONSTRAINT titres_demarches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres_etapes_justificatifs
    ADD CONSTRAINT titres_etapes_justificatifs_pkey PRIMARY KEY (titre_etape_id, document_id);
ALTER TABLE ONLY public.titres_etapes
    ADD CONSTRAINT titres_etapes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres_forets
    ADD CONSTRAINT titres_forets_pkey PRIMARY KEY (titre_etape_id, foret_id);
ALTER TABLE ONLY public.titres_phases
    ADD CONSTRAINT titres_phases_pkey PRIMARY KEY (titre_demarche_id);
ALTER TABLE ONLY public.titres
    ADD CONSTRAINT titres_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres_points
    ADD CONSTRAINT titres_points_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres_points_references
    ADD CONSTRAINT titres_points_references_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres_titulaires
    ADD CONSTRAINT titres_titulaires_pkey PRIMARY KEY (titre_etape_id, entreprise_id);
ALTER TABLE ONLY public.activites_types__titres_types
    ADD CONSTRAINT titres_types__activites_types_pkey PRIMARY KEY (titre_type_id, activite_type_id);
ALTER TABLE ONLY public.titres_types__demarches_types__etapes_types__justificatifs_t
    ADD CONSTRAINT titres_types__demarches_types__etapes_types__justificatifs_t_pk PRIMARY KEY (titre_type_id, demarche_type_id, etape_type_id, document_type_id);
ALTER TABLE ONLY public.titres_types__demarches_types__etapes_types
    ADD CONSTRAINT titres_types__demarches_types__etapes_types_pkey PRIMARY KEY (titre_type_id, demarche_type_id, etape_type_id);
ALTER TABLE ONLY public.titres_types
    ADD CONSTRAINT titres_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres_types_types
    ADD CONSTRAINT titres_types_types_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.titres_types
    ADD CONSTRAINT titrestypes_domaineid_typeid_unique UNIQUE (domaine_id, type_id);
ALTER TABLE ONLY public.utilisateurs__titres
    ADD CONSTRAINT utilisateurs__titres_pkey PRIMARY KEY (utilisateur_id, titre_id);
ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_unique UNIQUE (email);
ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id);
CREATE INDEX activitestypes__documentstypes_activitetypeid_index ON public.activites_types__documents_types USING btree (activite_type_id);
CREATE INDEX activitestypes__documentstypes_documenttypeid_index ON public.activites_types__documents_types USING btree (document_type_id);
CREATE INDEX activitestypes__pays_activitetypeid_index ON public.activites_types__pays USING btree (activite_type_id);
CREATE INDEX activitestypes_frequenceid_index ON public.activites_types USING btree (frequence_id);
CREATE INDEX administrations__activitestypes__emails_activitetypeid_index ON public.administrations__activites_types__emails USING btree (activite_type_id);
CREATE INDEX administrations__activitestypes__emails_administrationid_index ON public.administrations__activites_types__emails USING btree (administration_id);
CREATE INDEX administrations__activitestypes_activitetypeid_index ON public.administrations__activites_types USING btree (activite_type_id);
CREATE INDEX administrations__activitestypes_administrationid_index ON public.administrations__activites_types USING btree (administration_id);
CREATE INDEX documents_entrepriseid_index ON public.documents USING btree (entreprise_id);
CREATE INDEX documents_titreactiviteid_index ON public.documents USING btree (titre_activite_id);
CREATE INDEX documents_titreetapeid_index ON public.documents USING btree (titre_etape_id);
CREATE INDEX documents_typeid_index ON public.documents USING btree (type_id);
CREATE INDEX entreprises__documentstypes_documenttypeid_index ON public.entreprises__documents_types USING btree (document_type_id);
CREATE INDEX entreprisesetablissements_entrepriseid_index ON public.entreprises_etablissements USING btree (entreprise_id);
CREATE INDEX etapestypes__justificatifstypes_documenttypeid_index ON public.etapes_types__justificatifs_types USING btree (document_type_id);
CREATE INDEX etapestypes__justificatifstypes_etapetypeid_index ON public.etapes_types__justificatifs_types USING btree (etape_type_id);
CREATE INDEX index_geo_communes ON public.communes_postgis USING spgist (geometry);
CREATE INDEX index_geo_forets ON public.forets_postgis USING spgist (geometry);
CREATE INDEX index_geo_sdom_zones ON public.sdom_zones_postgis USING spgist (geometry);
CREATE INDEX index_geo_secteurs_maritime ON public.secteurs_maritime_postgis USING spgist (geometry);
CREATE INDEX journaux_titreid_index ON public.journaux USING btree (titre_id);
CREATE INDEX logs_utilisateurid_index ON public.journaux USING btree (utilisateur_id);
CREATE INDEX titres__titres_titrefromid_index ON public.titres__titres USING btree (titre_from_id);
CREATE INDEX titres__titres_titretoid_index ON public.titres__titres USING btree (titre_to_id);
CREATE INDEX titres_coordonnees_index ON public.titres USING gist (coordonnees);
CREATE INDEX titres_etapes_administrations_locales_index ON public.titres_etapes USING btree (administrations_locales);
CREATE INDEX titres_etapes_sdom_zones_index ON public.titres_etapes USING btree (sdom_zones);
CREATE INDEX titres_etapes_secteurs_maritime_index ON public.titres_etapes USING btree (secteurs_maritime);
CREATE INDEX titres_etapes_substances_index ON public.titres_etapes USING btree (substances);
CREATE INDEX titres_references_index ON public.titres USING btree ("references");
CREATE INDEX titres_slug_index ON public.titres USING btree (slug);
CREATE INDEX titres_statutid_index ON public.titres USING btree (titre_statut_id);
CREATE INDEX titres_typeid_index ON public.titres USING btree (type_id);
CREATE INDEX titresactivites_slug_index ON public.titres_activites USING btree (slug);
CREATE INDEX titresactivites_statutid_index ON public.titres_activites USING btree (activite_statut_id);
CREATE INDEX titresactivites_titreid_index ON public.titres_activites USING btree (titre_id);
CREATE INDEX titresactivites_typeid_index ON public.titres_activites USING btree (type_id);
CREATE INDEX titresactivites_utilisateurid_index ON public.titres_activites USING btree (utilisateur_id);
CREATE INDEX titresamodiataires_entrepriseid_index ON public.titres_amodiataires USING btree (entreprise_id);
CREATE INDEX titresamodiataires_titreetapeid_index ON public.titres_amodiataires USING btree (titre_etape_id);
CREATE INDEX titrescommunes_communeid_index ON public.titres_communes USING btree (commune_id);
CREATE INDEX titrescommunes_titreetapeid_index ON public.titres_communes USING btree (titre_etape_id);
CREATE INDEX titresdemarches_slug_index ON public.titres_demarches USING btree (slug);
CREATE INDEX titresdemarches_statutid_index ON public.titres_demarches USING btree (statut_id);
CREATE INDEX titresdemarches_titreid_index ON public.titres_demarches USING btree (titre_id);
CREATE INDEX titresdemarches_typeid_index ON public.titres_demarches USING btree (type_id);
CREATE INDEX titresdemarchesliens_enfanttitredemarcheid_index ON public.titres_demarches_liens USING btree (enfant_titre_demarche_id);
CREATE INDEX titresdemarchesliens_parenttitredemarcheid_index ON public.titres_demarches_liens USING btree (parent_titre_demarche_id);
CREATE INDEX titresetapes_slug_index ON public.titres_etapes USING btree (slug);
CREATE INDEX titresetapes_statutid_index ON public.titres_etapes USING btree (statut_id);
CREATE INDEX titresetapes_titredemarcheid_index ON public.titres_etapes USING btree (titre_demarche_id);
CREATE INDEX titresetapes_typeid_index ON public.titres_etapes USING btree (type_id);
CREATE INDEX titresetapesjustificatifs_documentid_index ON public.titres_etapes_justificatifs USING btree (document_id);
CREATE INDEX titresetapesjustificatifs_titreetapeid_index ON public.titres_etapes_justificatifs USING btree (titre_etape_id);
CREATE INDEX titresforets_foretid_index ON public.titres_forets USING btree (foret_id);
CREATE INDEX titresforets_titreetapeid_index ON public.titres_forets USING btree (titre_etape_id);
CREATE INDEX titrespoints_coordonnees_index ON public.titres_points USING gist (coordonnees);
CREATE INDEX titrespoints_slug_index ON public.titres_points USING btree (slug);
CREATE INDEX titrespoints_titreetapeid_index ON public.titres_points USING btree (titre_etape_id);
CREATE INDEX titrespointsreferences_slug_index ON public.titres_points_references USING btree (slug);
CREATE INDEX titrespointsreferences_titrepointid_index ON public.titres_points_references USING btree (titre_point_id);
CREATE INDEX titrestitulaires_entrepriseid_index ON public.titres_titulaires USING btree (entreprise_id);
CREATE INDEX titrestitulaires_titreetapeid_index ON public.titres_titulaires USING btree (titre_etape_id);
CREATE INDEX titrestypes__activitestypes_activitetypeid_index ON public.activites_types__titres_types USING btree (activite_type_id);
CREATE INDEX titrestypes__activitestypes_titretypeid_index ON public.activites_types__titres_types USING btree (titre_type_id);
CREATE INDEX titrestypes__demarchestypes__etapestypes__justificatifst_demarc ON public.titres_types__demarches_types__etapes_types__justificatifs_t USING btree (demarche_type_id);
CREATE INDEX titrestypes__demarchestypes__etapestypes__justificatifst_docume ON public.titres_types__demarches_types__etapes_types__justificatifs_t USING btree (document_type_id);
CREATE INDEX titrestypes__demarchestypes__etapestypes__justificatifst_etapet ON public.titres_types__demarches_types__etapes_types__justificatifs_t USING btree (etape_type_id);
CREATE INDEX titrestypes__demarchestypes__etapestypes__justificatifst_titret ON public.titres_types__demarches_types__etapes_types__justificatifs_t USING btree (titre_type_id);
CREATE INDEX titrestypes__demarchestypes__etapestypes_demarchetypeid_index ON public.titres_types__demarches_types__etapes_types USING btree (demarche_type_id);
CREATE INDEX titrestypes__demarchestypes__etapestypes_etapetypeid_index ON public.titres_types__demarches_types__etapes_types USING btree (etape_type_id);
CREATE INDEX titrestypes__demarchestypes__etapestypes_titretypeid_index ON public.titres_types__demarches_types__etapes_types USING btree (titre_type_id);
CREATE INDEX titrestypes_domaineid_index ON public.titres_types USING btree (domaine_id);
CREATE INDEX titrestypes_typeid_index ON public.titres_types USING btree (type_id);
CREATE INDEX utilisateurs__entreprises_entrepriseid_index ON public.utilisateurs__entreprises USING btree (entreprise_id);
CREATE INDEX utilisateurs__entreprises_utilisateurid_index ON public.utilisateurs__entreprises USING btree (utilisateur_id);
CREATE INDEX utilisateurs__titres_titreid_index ON public.utilisateurs__titres USING btree (titre_id);
CREATE INDEX utilisateurs__titres_utilisateurid_index ON public.utilisateurs__titres USING btree (utilisateur_id);
CREATE INDEX utilisateurs_administrationid_index ON public.utilisateurs USING btree (administration_id);
CREATE INDEX utilisateurs_qgis_token_index ON public.utilisateurs USING btree (qgis_token);
ALTER TABLE ONLY public.activites_types__documents_types
    ADD CONSTRAINT activitestypes__documentstypes_activitetypeid_foreign FOREIGN KEY (activite_type_id) REFERENCES public.activites_types(id);
ALTER TABLE ONLY public.activites_types__documents_types
    ADD CONSTRAINT activitestypes__documentstypes_documenttypeid_foreign FOREIGN KEY (document_type_id) REFERENCES public.documents_types(id);
ALTER TABLE ONLY public.activites_types__pays
    ADD CONSTRAINT activitestypes__pays_activitetypeid_foreign FOREIGN KEY (activite_type_id) REFERENCES public.activites_types(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.administrations__activites_types__emails
    ADD CONSTRAINT administrations__activitestypes__emails_activitetypeid_foreign FOREIGN KEY (activite_type_id) REFERENCES public.activites_types(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.administrations__activites_types__emails
    ADD CONSTRAINT administrations__activitestypes__emails_administrationid_foreig FOREIGN KEY (administration_id) REFERENCES public.administrations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.administrations__activites_types
    ADD CONSTRAINT administrations__activitestypes_activitetypeid_foreign FOREIGN KEY (activite_type_id) REFERENCES public.activites_types(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.administrations__activites_types
    ADD CONSTRAINT administrations__activitestypes_administrationid_foreign FOREIGN KEY (administration_id) REFERENCES public.administrations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_entrepriseid_foreign FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_titreactiviteid_foreign FOREIGN KEY (titre_activite_id) REFERENCES public.titres_activites(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_titreetapeid_foreign FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_typeid_foreign FOREIGN KEY (type_id) REFERENCES public.documents_types(id);
ALTER TABLE ONLY public.entreprises__documents_types
    ADD CONSTRAINT entreprises__documentstypes_documenttypeid_foreign FOREIGN KEY (document_type_id) REFERENCES public.documents_types(id);
ALTER TABLE ONLY public.entreprises_etablissements
    ADD CONSTRAINT entreprisesetablissements_entrepriseid_foreign FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.etapes_types__justificatifs_types
    ADD CONSTRAINT etapestypes__justificatifstypes_documenttypeid_foreign FOREIGN KEY (document_type_id) REFERENCES public.entreprises__documents_types(document_type_id);
ALTER TABLE ONLY public.etapes_types__justificatifs_types
    ADD CONSTRAINT etapestypes__justificatifstypes_etapetypeid_foreign FOREIGN KEY (etape_type_id) REFERENCES public.etapes_types(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.journaux
    ADD CONSTRAINT journaux_titreid_foreign FOREIGN KEY (titre_id) REFERENCES public.titres(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres__titres
    ADD CONSTRAINT titres__titres_titrefromid_foreign FOREIGN KEY (titre_from_id) REFERENCES public.titres(id);
ALTER TABLE ONLY public.titres__titres
    ADD CONSTRAINT titres__titres_titretoid_foreign FOREIGN KEY (titre_to_id) REFERENCES public.titres(id);
ALTER TABLE ONLY public.titres
    ADD CONSTRAINT titres_typeid_foreign FOREIGN KEY (type_id) REFERENCES public.titres_types(id);
ALTER TABLE ONLY public.titres_activites
    ADD CONSTRAINT titresactivites_titreid_foreign FOREIGN KEY (titre_id) REFERENCES public.titres(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_activites
    ADD CONSTRAINT titresactivites_typeid_foreign FOREIGN KEY (type_id) REFERENCES public.activites_types(id);
ALTER TABLE ONLY public.titres_activites
    ADD CONSTRAINT titresactivites_utilisateurid_foreign FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id);
ALTER TABLE ONLY public.titres_amodiataires
    ADD CONSTRAINT titresamodiataires_entrepriseid_foreign FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_amodiataires
    ADD CONSTRAINT titresamodiataires_titreetapeid_foreign FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_communes
    ADD CONSTRAINT titrescommunes_communeid_foreign FOREIGN KEY (commune_id) REFERENCES public.communes(id);
ALTER TABLE ONLY public.titres_communes
    ADD CONSTRAINT titrescommunes_titreetapeid_foreign FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_demarches
    ADD CONSTRAINT titresdemarches_titreid_foreign FOREIGN KEY (titre_id) REFERENCES public.titres(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_demarches
    ADD CONSTRAINT titresdemarches_typeid_foreign FOREIGN KEY (type_id) REFERENCES public.demarches_types(id);
ALTER TABLE ONLY public.titres_demarches_liens
    ADD CONSTRAINT titresdemarchesliens_enfanttitredemarcheid_foreign FOREIGN KEY (enfant_titre_demarche_id) REFERENCES public.titres_demarches(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_demarches_liens
    ADD CONSTRAINT titresdemarchesliens_parenttitredemarcheid_foreign FOREIGN KEY (parent_titre_demarche_id) REFERENCES public.titres_demarches(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_etapes
    ADD CONSTRAINT titresetapes_titredemarcheid_foreign FOREIGN KEY (titre_demarche_id) REFERENCES public.titres_demarches(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_etapes
    ADD CONSTRAINT titresetapes_typeid_foreign FOREIGN KEY (type_id) REFERENCES public.etapes_types(id);
ALTER TABLE ONLY public.titres_etapes_justificatifs
    ADD CONSTRAINT titresetapesjustificatifs_documentid_foreign FOREIGN KEY (document_id) REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_etapes_justificatifs
    ADD CONSTRAINT titresetapesjustificatifs_titreetapeid_foreign FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_forets
    ADD CONSTRAINT titresforets_foretid_foreign FOREIGN KEY (foret_id) REFERENCES public.forets(id);
ALTER TABLE ONLY public.titres_forets
    ADD CONSTRAINT titresforets_titreetapeid_foreign FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_phases
    ADD CONSTRAINT titresphases_titredemarcheid_foreign FOREIGN KEY (titre_demarche_id) REFERENCES public.titres_demarches(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_points
    ADD CONSTRAINT titrespoints_titreetapeid_foreign FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_points_references
    ADD CONSTRAINT titrespointsreferences_titrepointid_foreign FOREIGN KEY (titre_point_id) REFERENCES public.titres_points(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_titulaires
    ADD CONSTRAINT titrestitulaires_entrepriseid_foreign FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.titres_titulaires
    ADD CONSTRAINT titrestitulaires_titreetapeid_foreign FOREIGN KEY (titre_etape_id) REFERENCES public.titres_etapes(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.activites_types__titres_types
    ADD CONSTRAINT titrestypes__activitestypes_activitetypeid_foreign FOREIGN KEY (activite_type_id) REFERENCES public.activites_types(id);
ALTER TABLE ONLY public.activites_types__titres_types
    ADD CONSTRAINT titrestypes__activitestypes_titretypeid_foreign FOREIGN KEY (titre_type_id) REFERENCES public.titres_types(id);
ALTER TABLE ONLY public.titres_types__demarches_types__etapes_types__justificatifs_t
    ADD CONSTRAINT titrestypes__demarchestypes__etapestypes__justificatifst_docume FOREIGN KEY (document_type_id) REFERENCES public.documents_types(id);
ALTER TABLE ONLY public.titres_types__demarches_types__etapes_types__justificatifs_t
    ADD CONSTRAINT titrestypes__demarchestypes__etapestypes__justificatifst_titret FOREIGN KEY (titre_type_id, demarche_type_id, etape_type_id) REFERENCES public.titres_types__demarches_types__etapes_types(titre_type_id, demarche_type_id, etape_type_id);
ALTER TABLE ONLY public.titres_types__demarches_types__etapes_types
    ADD CONSTRAINT titrestypes__demarchestypes__etapestypes_demarchetypeid_foreign FOREIGN KEY (demarche_type_id) REFERENCES public.demarches_types(id);
ALTER TABLE ONLY public.titres_types__demarches_types__etapes_types
    ADD CONSTRAINT titrestypes__demarchestypes__etapestypes_etapetypeid_foreign FOREIGN KEY (etape_type_id) REFERENCES public.etapes_types(id);
ALTER TABLE ONLY public.titres_types__demarches_types__etapes_types
    ADD CONSTRAINT titrestypes__demarchestypes__etapestypes_titretypeid_foreign FOREIGN KEY (titre_type_id) REFERENCES public.titres_types(id);
ALTER TABLE ONLY public.titres_types
    ADD CONSTRAINT titrestypes_domaineid_foreign FOREIGN KEY (domaine_id) REFERENCES public.domaines(id);
ALTER TABLE ONLY public.titres_types
    ADD CONSTRAINT titrestypes_typeid_foreign FOREIGN KEY (type_id) REFERENCES public.titres_types_types(id);
ALTER TABLE ONLY public.utilisateurs__entreprises
    ADD CONSTRAINT utilisateurs__entreprises_entrepriseid_foreign FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.utilisateurs__entreprises
    ADD CONSTRAINT utilisateurs__entreprises_utilisateurid_foreign FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.utilisateurs__titres
    ADD CONSTRAINT utilisateurs__titres_titreid_foreign FOREIGN KEY (titre_id) REFERENCES public.titres(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.utilisateurs__titres
    ADD CONSTRAINT utilisateurs__titres_utilisateurid_foreign FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_administrationid_foreign FOREIGN KEY (administration_id) REFERENCES public.administrations(id);

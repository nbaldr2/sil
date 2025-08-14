--  SIL Laboratory Information System Database Schema - Complete Implementation

-- ====================== CORE REQUEST MANAGEMENT ======================
CREATE TABLE silDemande (
  id_demande INT PRIMARY KEY AUTO_INCREMENT,
  id_patient INT NOT NULL,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_site INT,
  id_medecin INT,
  statut ENUM('created', 'collected', 'analysis', 'validated') DEFAULT 'created',
  priorite ENUM('normal', 'urgent') DEFAULT 'normal',
  INDEX idx_statut (statut),
  INDEX idx_date_creation (date_creation),
  INDEX idx_patient (id_patient)
);

CREATE TABLE silDemandeAnalyse (
  id_demande_analyse INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  code_analyse VARCHAR(20) NOT NULL,
  statut_validation ENUM('pending', 'entered', 'validated') DEFAULT 'pending',
  valeur VARCHAR(100),
  unite VARCHAR(20),
  date_validation DATETIME,
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

CREATE TABLE silDemandeActe (
  id_acte INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  code_acte VARCHAR(20) NOT NULL,
  libelle VARCHAR(100),
  tarif DECIMAL(10,2),
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

CREATE TABLE silDemandePrelevement (
  id_prelevement INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  date_prelevement DATETIME,
  type_echantillon VARCHAR(50),
  volume_ml INT,
  technicien_id INT,
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

CREATE TABLE silDemandeResultat (
  id_resultat INT PRIMARY KEY AUTO_INCREMENT,
  id_demande_analyse INT,
  valeur VARCHAR(100) NOT NULL,
  unite VARCHAR(20),
  valeur_reference VARCHAR(50),
  commentaire TEXT,
  FOREIGN KEY (id_demande_analyse) REFERENCES silDemandeAnalyse(id_demande_analyse)
);

CREATE TABLE silDemandeCommentaire (
  id_commentaire INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  commentaire TEXT NOT NULL,
  auteur_id INT,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

CREATE TABLE silDemandeGarde (
  id_garde INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  responsable_id INT,
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

CREATE TABLE silDemandeMultiple (
  id_liaison INT PRIMARY KEY AUTO_INCREMENT,
  id_demande_principale INT,
  id_demande_associee INT,
  type_liaison ENUM('group', 'series', 'followup') DEFAULT 'group',
  FOREIGN KEY (id_demande_principale) REFERENCES silDemande(id_demande),
  FOREIGN KEY (id_demande_associee) REFERENCES silDemande(id_demande)
);

CREATE TABLE silDemandeOrganisme (
  id_organisme INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  type ENUM('cpam', 'mutuelle', 'assurance', 'particulier') NOT NULL,
  code VARCHAR(20) UNIQUE,
  taux_remboursement DECIMAL(5,2) DEFAULT 70.00
);

CREATE TABLE silDemandeMedecinCorrespondant (
  id_medecin INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100),
  specialite_id INT,
  telephone VARCHAR(20),
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande),
  FOREIGN KEY (specialite_id) REFERENCES silSpecialite(id_specialite)
);

CREATE TABLE silDemandeNumeroLot (
  id_lot INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  numero VARCHAR(50) NOT NULL,
  date_creation DATE DEFAULT (CURDATE()),
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

CREATE TABLE silDemandeRendezVous (
  id_rendezvous INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  date_heure DATETIME NOT NULL,
  type ENUM('prelevement', 'consultation', 'resultat') DEFAULT 'prelevement',
  statut ENUM('programme', 'confirme', 'annule') DEFAULT 'programme',
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

-- ====================== PATIENT MANAGEMENT ======================
CREATE TABLE silPatient (
  id_patient INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_naissance DATE,
  numero_secu VARCHAR(15) UNIQUE,
  telephone VARCHAR(20),
  email VARCHAR(100),
  adresse TEXT,
  code_postal VARCHAR(10),
  ville VARCHAR(100),
  medecin_traitant VARCHAR(100),
  INDEX idx_nom (nom),
  INDEX idx_numero_secu (numero_secu)
);

-- ====================== BILLING MANAGEMENT ======================
CREATE TABLE silFactureReglement (
  id_reglement INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  montant DECIMAL(10,2) NOT NULL,
  date_reglement DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_organisme INT,
  mode_reglement ENUM('virement', 'cheque', 'especes', 'carte') DEFAULT 'virement',
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande),
  FOREIGN KEY (id_organisme) REFERENCES silDemandeOrganisme(id_organisme)
);

CREATE TABLE silFactureTransfert (
  id_transfert INT PRIMARY KEY AUTO_INCREMENT,
  id_facture INT NOT NULL,
  date_transfert DATETIME DEFAULT CURRENT_TIMESTAMP,
  destination VARCHAR(100),
  statut ENUM('envoye', 'recu', 'refuse') DEFAULT 'envoye'
);

CREATE TABLE silFactureEnvoi (
  id_envoi INT PRIMARY KEY AUTO_INCREMENT,
  id_facture INT NOT NULL,
  date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
  mode_envoi ENUM('email', 'courrier', 'fax', 'edi') DEFAULT 'email',
  destinataire VARCHAR(100)
);

CREATE TABLE silDemandeImpaye (
  id_impaye INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  montant DECIMAL(10,2) NOT NULL,
  date_echeance DATE NOT NULL,
  nb_relances INT DEFAULT 0,
  statut ENUM('en_cours', 'contentieux', 'abandonne') DEFAULT 'en_cours',
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

CREATE TABLE silDemandeImpayeFichier (
  id_fichier INT PRIMARY KEY AUTO_INCREMENT,
  id_impaye INT,
  nom_fichier VARCHAR(255) NOT NULL,
  type_fichier VARCHAR(50),
  taille_ko INT,
  contenu LONGBLOB,
  FOREIGN KEY (id_impaye) REFERENCES silDemandeImpaye(id_impaye)
);

-- ====================== PRINTING & COMMUNICATION ======================
CREATE TABLE silImpressionType (
  id_type INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  template_path VARCHAR(255),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE silDemandeImpression (
  id_impression INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  date_impression DATETIME DEFAULT CURRENT_TIMESTAMP,
  impression_type_id INT,
  statut ENUM('pending', 'printed', 'failed') DEFAULT 'pending',
  nb_copies INT DEFAULT 1,
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande),
  FOREIGN KEY (impression_type_id) REFERENCES silImpressionType(id_type)
);

CREATE TABLE silImpressionAuto (
  id_config INT PRIMARY KEY AUTO_INCREMENT,
  impression_type_id INT,
  condition_declenchement VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (impression_type_id) REFERENCES silImpressionType(id_type)
);

CREATE TABLE silImpressionGestion (
  id_gestion INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE silImpressionGestionSite (
  id_config_site INT PRIMARY KEY AUTO_INCREMENT,
  site_id INT NOT NULL,
  gestion_id INT,
  parametres JSON,
  FOREIGN KEY (gestion_id) REFERENCES silImpressionGestion(id_gestion)
);

CREATE TABLE silEtiquetteSite (
  id_config_etiquette INT PRIMARY KEY AUTO_INCREMENT,
  site_id INT NOT NULL,
  type_etiquette VARCHAR(50),
  parametres JSON
);

CREATE TABLE silEtiquetteTampon (
  id_tampon INT PRIMARY KEY AUTO_INCREMENT,
  etiquette_site_id INT,
  contenu VARCHAR(255) NOT NULL,
  position_x INT DEFAULT 0,
  position_y INT DEFAULT 0,
  FOREIGN KEY (etiquette_site_id) REFERENCES silEtiquetteSite(id_config_etiquette)
);

CREATE TABLE silModem (
  id_modem INT PRIMARY KEY AUTO_INCREMENT,
  site_id INT,
  numero VARCHAR(20) UNIQUE NOT NULL,
  statut ENUM('actif', 'inactif', 'maintenance') DEFAULT 'actif',
  FOREIGN KEY (site_id) REFERENCES silImpressionGestionSite(id_config_site)
);

CREATE TABLE silModemBloque (
  id_blocage INT PRIMARY KEY AUTO_INCREMENT,
  modem_id INT,
  numero VARCHAR(20) NOT NULL,
  date_blocage DATETIME DEFAULT CURRENT_TIMESTAMP,
  raison VARCHAR(255),
  FOREIGN KEY (modem_id) REFERENCES silModem(id_modem)
);

CREATE TABLE silFaxEchoue (
  id_fax_echoue INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  date_tentative DATETIME DEFAULT CURRENT_TIMESTAMP,
  raison VARCHAR(255),
  numero_destinataire VARCHAR(20),
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

-- ====================== IMPORT/EXPORT ======================
CREATE TABLE silImport (
  id_import INT PRIMARY KEY AUTO_INCREMENT,
  nom_fichier VARCHAR(255) NOT NULL,
  date_import DATETIME DEFAULT CURRENT_TIMESTAMP,
  type_import ENUM('patient', 'analysis', 'billing') NOT NULL,
  statut ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  nb_lignes_traitees INT DEFAULT 0
);

CREATE TABLE silImportLien (
  id_lien INT PRIMARY KEY AUTO_INCREMENT,
  import_id INT,
  type_relation VARCHAR(50) NOT NULL,
  id_source INT,
  id_cible INT,
  FOREIGN KEY (import_id) REFERENCES silImport(id_import)
);

CREATE TABLE silImportLCSD (
  id_import_lcsd INT PRIMARY KEY AUTO_INCREMENT,
  import_id INT,
  donnees JSON,
  FOREIGN KEY (import_id) REFERENCES silImport(id_import)
);

CREATE TABLE silExportCatalogue (
  id_export_catalogue INT PRIMARY KEY AUTO_INCREMENT,
  date_export DATETIME DEFAULT CURRENT_TIMESTAMP,
  format_export ENUM('xml', 'csv', 'json') DEFAULT 'xml',
  contenu LONGTEXT
);

CREATE TABLE silExportCegid (
  id_export_cegid INT PRIMARY KEY AUTO_INCREMENT,
  date_export DATETIME DEFAULT CURRENT_TIMESTAMP,
  type_export ENUM('comptabilite', 'analytique', 'budget') NOT NULL,
  periode_debut DATE,
  periode_fin DATE,
  contenu LONGTEXT
);

CREATE TABLE silFichierLegal (
  id_fichier INT PRIMARY KEY AUTO_INCREMENT,
  type_fichier ENUM('archivage', 'audit', 'sauvegarde') NOT NULL,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_expiration DATE,
  contenu LONGBLOB,
  hash_md5 VARCHAR(32)
);

-- ====================== CONFIGURATION ======================
CREATE TABLE silTableCorrespondance (
  id_correspondance INT PRIMARY KEY AUTO_INCREMENT,
  table_source VARCHAR(100) NOT NULL,
  table_cible VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE silTableCorrespondanceElement (
  id_element INT PRIMARY KEY AUTO_INCREMENT,
  correspondance_id INT,
  code_source VARCHAR(50) NOT NULL,
  code_cible VARCHAR(50) NOT NULL,
  libelle VARCHAR(100),
  FOREIGN KEY (correspondance_id) REFERENCES silTableCorrespondance(id_correspondance)
);

CREATE TABLE silTable50 (
  id_code INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(10) UNIQUE NOT NULL,
  libelle VARCHAR(100) NOT NULL,
  taux_ss DECIMAL(5,2) DEFAULT 70.00,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE silSpecialite (
  id_specialite INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(10) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE silModeleRemise (
  id_modele INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE silModeleRemiseElement (
  id_element_modele INT PRIMARY KEY AUTO_INCREMENT,
  modele_id INT,
  condition_sql VARCHAR(255),
  remise_pourcentage DECIMAL(5,2) NOT NULL,
  remise_montant DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (modele_id) REFERENCES silModeleRemise(id_modele)
);

-- ====================== TECHNICAL TABLES ======================
CREATE TABLE silInstall (
  id_ticket INT PRIMARY KEY AUTO_INCREMENT,
  description TEXT NOT NULL,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  priorite ENUM('basse', 'normale', 'haute', 'critique') DEFAULT 'normale',
  statut ENUM('ouvert', 'en_cours', 'resolu', 'ferme') DEFAULT 'ouvert'
);

CREATE TABLE silInstallTemps (
  id_temps INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT,
  duree_minutes INT NOT NULL,
  date_intervention DATETIME DEFAULT CURRENT_TIMESTAMP,
  technicien_nom VARCHAR(100),
  description TEXT,
  FOREIGN KEY (ticket_id) REFERENCES silInstall(id_ticket)
);

CREATE TABLE silFSEBordereau (
  id_bordereau INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  statut_transmission ENUM('attente', 'transmis', 'accepte', 'refuse') DEFAULT 'attente',
  date_transmission DATETIME,
  numero_bordereau VARCHAR(50) UNIQUE,
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

CREATE TABLE silFSEErreur (
  id_erreur_fse INT PRIMARY KEY AUTO_INCREMENT,
  bordereau_id INT,
  code_erreur VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  date_erreur DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bordereau_id) REFERENCES silFSEBordereau(id_bordereau)
);

CREATE TABLE silFSEART (
  id_art INT PRIMARY KEY AUTO_INCREMENT,
  bordereau_id INT,
  date_reception DATETIME DEFAULT CURRENT_TIMESTAMP,
  contenu_art TEXT,
  FOREIGN KEY (bordereau_id) REFERENCES silFSEBordereau(id_bordereau)
);

CREATE TABLE silErreurFormatage (
  id_erreur_format INT PRIMARY KEY AUTO_INCREMENT,
  id_demande INT,
  type_erreur VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  date_erreur DATETIME DEFAULT CURRENT_TIMESTAMP,
  corrige BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_demande) REFERENCES silDemande(id_demande)
);

-- ====================== SAMPLE DATA ======================
INSERT INTO silSpecialite (code, nom) VALUES 
('HEM', 'Hématologie'),
('BCH', 'Biochimie'),
('MIC', 'Microbiologie'),
('IMM', 'Immunologie'),
('ANA', 'Anatomopathologie'),
('TOX', 'Toxicologie');

INSERT INTO silImpressionGestionSite (site_id, parametres) VALUES 
(1, '{"nom": "Laboratoire Central Paris", "adresse": "123 Rue de la Santé, 75014 Paris", "telephone": "01.42.34.56.78"}'),
(2, '{"nom": "Antenne Boulogne", "adresse": "45 Avenue Victor Hugo, 92100 Boulogne", "telephone": "01.46.23.45.67"}');

INSERT INTO silDemandeOrganisme (nom, type, code, taux_remboursement) VALUES
('CPAM Paris', 'cpam', 'CPAM75', 70.00),
('Mutuelle Générale', 'mutuelle', 'MG001', 80.00),
('Harmonie Mutuelle', 'mutuelle', 'HM001', 85.00),
('Particulier', 'particulier', 'PART', 0.00);

INSERT INTO silTable50 (code, libelle, taux_ss) VALUES
('4005', 'Hémogramme', 70.00),
('4010', 'Glycémie', 70.00),
('4015', 'Créatininémie', 70.00),
('4020', 'Bilan lipidique', 70.00);

INSERT INTO silImpressionType (nom, template_path) VALUES
('Compte-rendu', '/templates/report.pdf'),
('Étiquette échantillon', '/templates/label.pdf'),
('Facture', '/templates/invoice.pdf'),
('Bon de prélèvement', '/templates/sampling.pdf');

--  ====================== USER MANAGEMENT ======================
CREATE TABLE silUser (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'biologist', 'technician', 'secretary') NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  dernier_acces DATETIME
);

INSERT INTO silUser (nom, prenom, email, password_hash, role) VALUES
('Admin', 'Dr.', 'admin@lab.fr', 'admin', 'admin'),
('Biologist', 'Dr.', 'bio@lab.fr', '123456', 'biologist'),
('Technician', 'Tech', 'tech@lab.fr', 'tech123', 'technician'),
('Secretary', 'Secretary', 'sec@lab.fr', 'sec123', 'secretary');

INSERT INTO silPatient (nom, prenom, date_naissance, numero_secu, telephone, adresse, ville) VALUES
('Dupont', 'Marie', '1985-03-15', '2850315123456', '01.42.34.56.78', '123 Rue de la Paix', 'Paris'),
('Martin', 'Pierre', '1972-11-20', '1721120654321', '01.56.78.90.12', '45 Avenue Victor Hugo', 'Boulogne'),
('Bernard', 'Sophie', '1990-07-08', '2900708987654', '01.23.45.67.89', '67 Boulevard Saint-Germain', 'Paris'),
('Kabbaj', 'Ahmed', '1978-05-12', '1780512345678', '01.34.56.78.90', '89 Rue de la République', 'Lyon'),
('Benali', 'Fatima', '1992-09-25', '2920925876543', '01.45.67.89.01', '12 Avenue des Fleurs', 'Marseille'),
('Tazi', 'Mohammed', '1965-12-03', '1651203456789', '01.56.78.90.23', '34 Boulevard Central', 'Toulouse'); 

INSERT INTO silDemande (id_patient, statut, priorite, id_site) VALUES
(1, 'analysis', 'normal', 1),
(2, 'validated', 'urgent', 1),
(3, 'created', 'normal', 2);

INSERT INTO silDemandeAnalyse (id_demande, code_analyse, statut_validation, valeur, unite) VALUES
(1, '4005', 'entered', '4.2', 'G/L'),
(1, '4010', 'pending', NULL, 'g/L'),
(2, '4020', 'validated', '1.8', 'g/L');
 
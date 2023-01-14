-- MySQL dump 10.16  Distrib 10.1.26-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: cvnclerkbot
-- ------------------------------------------------------
-- Server version	10.1.26-MariaDB-0+deb9u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `channels` (
  `ch_name` varbinary(255) NOT NULL DEFAULT '',
  UNIQUE KEY `channels_chan` (`ch_name`)
) ENGINE=InnoDB DEFAULT CHARSET=binary;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channels`
--

LOCK TABLES `channels` WRITE;
/*!40000 ALTER TABLE `channels` DISABLE KEYS */;
INSERT INTO `channels` VALUES ('#countervandalism');
INSERT INTO `channels` VALUES ('#cvn-ar-scan');
INSERT INTO `channels` VALUES ('#cvn-bn-scan');
INSERT INTO `channels` VALUES ('#cvn-bots');
INSERT INTO `channels` VALUES ('#cvn-brickimedia');
INSERT INTO `channels` VALUES ('#cvn-commons');
INSERT INTO `channels` VALUES ('#cvn-commons-uploads');
INSERT INTO `channels` VALUES ('#cvn-es-scan');
INSERT INTO `channels` VALUES ('#cvn-it-scan');
INSERT INTO `channels` VALUES ('#cvn-ja');
INSERT INTO `channels` VALUES ('#cvn-ko-scan');
INSERT INTO `channels` VALUES ('#cvn-mediawiki');
INSERT INTO `channels` VALUES ('#cvn-meta');
INSERT INTO `channels` VALUES ('#cvn-mk-scan');
INSERT INTO `channels` VALUES ('#cvn-sandbox');
INSERT INTO `channels` VALUES ('#cvn-simplewikis');
INSERT INTO `channels` VALUES ('#cvn-staff');
INSERT INTO `channels` VALUES ('#cvn-sw');
INSERT INTO `channels` VALUES ('#cvn-sw-spam');
INSERT INTO `channels` VALUES ('#cvn-unifications');
INSERT INTO `channels` VALUES ('#cvn-wikidata');
INSERT INTO `channels` VALUES ('#cvn-wikivoyage');
INSERT INTO `channels` VALUES ('#cvn-wp-da');
INSERT INTO `channels` VALUES ('#cvn-wp-en');
INSERT INTO `channels` VALUES ('#cvn-wp-en-newpages');
INSERT INTO `channels` VALUES ('#cvn-wp-es');
INSERT INTO `channels` VALUES ('#cvn-wp-fa');
INSERT INTO `channels` VALUES ('#cvn-wp-fr');
INSERT INTO `channels` VALUES ('#cvn-wp-he');
INSERT INTO `channels` VALUES ('#cvn-wp-hr');
INSERT INTO `channels` VALUES ('#cvn-wp-nl');
INSERT INTO `channels` VALUES ('#cvn-wp-pl');
INSERT INTO `channels` VALUES ('#cvn-wp-ru');
INSERT INTO `channels` VALUES ('#cvn-zh-scan');
INSERT INTO `channels` VALUES ('#cvn-zh-sw');
INSERT INTO `channels` VALUES ('#cvn-zho');
/*!40000 ALTER TABLE `channels` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-01-14 20:52:57

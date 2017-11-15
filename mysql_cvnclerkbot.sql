-- MySQL dump 10.13  Distrib 5.5.58, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: cvnclerkbot
-- ------------------------------------------------------
-- Server version	5.5.58-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
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
INSERT INTO `channels` VALUES ('#cvn-abusefilter');
INSERT INTO `channels` VALUES ('#cvn-blacklist');
INSERT INTO `channels` VALUES ('#cvn-blocks');
INSERT INTO `channels` VALUES ('#cvn-bots');
INSERT INTO `channels` VALUES ('#cvn-brickimedia');
INSERT INTO `channels` VALUES ('#cvn-clubpenguin');
INSERT INTO `channels` VALUES ('#cvn-commons');
INSERT INTO `channels` VALUES ('#cvn-commons-uploads');
INSERT INTO `channels` VALUES ('#cvn-cvnwiki');
INSERT INTO `channels` VALUES ('#cvn-halopedia');
INSERT INTO `channels` VALUES ('#cvn-it-scan');
INSERT INTO `channels` VALUES ('#cvn-ja');
INSERT INTO `channels` VALUES ('#cvn-meta');
INSERT INTO `channels` VALUES ('#cvn-newpages');
INSERT INTO `channels` VALUES ('#cvn-sandbox');
INSERT INTO `channels` VALUES ('#cvn-simplewikis');
INSERT INTO `channels` VALUES ('#cvn-species-');
INSERT INTO `channels` VALUES ('#cvn-staff');
INSERT INTO `channels` VALUES ('#cvn-sw');
INSERT INTO `channels` VALUES ('#cvn-sw-spam');
INSERT INTO `channels` VALUES ('#cvn-unifications');
INSERT INTO `channels` VALUES ('#cvn-wb-en');
INSERT INTO `channels` VALUES ('#cvn-wb-fa');
INSERT INTO `channels` VALUES ('#cvn-wikia');
INSERT INTO `channels` VALUES ('#cvn-wikia-?pedia');
INSERT INTO `channels` VALUES ('#cvn-wikia-aoc');
INSERT INTO `channels` VALUES ('#cvn-wikia-bleach');
INSERT INTO `channels` VALUES ('#cvn-wikia-central');
INSERT INTO `channels` VALUES ('#cvn-wikia-clubpenguin');
INSERT INTO `channels` VALUES ('#cvn-wikia-cod');
INSERT INTO `channels` VALUES ('#cvn-wikia-combatarms');
INSERT INTO `channels` VALUES ('#cvn-wikia-de');
INSERT INTO `channels` VALUES ('#cvn-wikia-digimon-es');
INSERT INTO `channels` VALUES ('#cvn-wikia-es');
INSERT INTO `channels` VALUES ('#cvn-wikia-fallout');
INSERT INTO `channels` VALUES ('#cvn-wikia-halo');
INSERT INTO `channels` VALUES ('#cvn-wikia-inciclopedia');
INSERT INTO `channels` VALUES ('#cvn-wikia-lego-wikis');
INSERT INTO `channels` VALUES ('#cvn-wikia-pokemontowerdefense');
INSERT INTO `channels` VALUES ('#cvn-wikia-runescape');
INSERT INTO `channels` VALUES ('#cvn-wikia-twewy');
INSERT INTO `channels` VALUES ('#cvn-wikia-uncyc');
INSERT INTO `channels` VALUES ('#cvn-wikia-wookieepedia');
INSERT INTO `channels` VALUES ('#cvn-wikia-wowwiki');
INSERT INTO `channels` VALUES ('#cvn-wikia-zelda');
INSERT INTO `channels` VALUES ('#cvn-wikidata');
INSERT INTO `channels` VALUES ('#cvn-wikivoyage');
INSERT INTO `channels` VALUES ('#cvn-wn-en');
INSERT INTO `channels` VALUES ('#cvn-wn-fa');
INSERT INTO `channels` VALUES ('#cvn-wn-fi');
INSERT INTO `channels` VALUES ('#cvn-wp-ar');
INSERT INTO `channels` VALUES ('#cvn-wp-da');
INSERT INTO `channels` VALUES ('#cvn-wp-en');
INSERT INTO `channels` VALUES ('#cvn-wp-en-abuse');
INSERT INTO `channels` VALUES ('#cvn-wp-en-cluenet');
INSERT INTO `channels` VALUES ('#cvn-wp-en-newpages');
INSERT INTO `channels` VALUES ('#cvn-wp-en-newusers');
INSERT INTO `channels` VALUES ('#cvn-wp-en-uploads');
INSERT INTO `channels` VALUES ('#cvn-wp-es');
INSERT INTO `channels` VALUES ('#cvn-wp-fa');
INSERT INTO `channels` VALUES ('#cvn-wp-fi');
INSERT INTO `channels` VALUES ('#cvn-wp-he');
INSERT INTO `channels` VALUES ('#cvn-wp-hu');
INSERT INTO `channels` VALUES ('#cvn-wp-is');
INSERT INTO `channels` VALUES ('#cvn-wp-nl');
INSERT INTO `channels` VALUES ('#cvn-wp-nn');
INSERT INTO `channels` VALUES ('#cvn-wp-no');
INSERT INTO `channels` VALUES ('#cvn-wp-pl');
INSERT INTO `channels` VALUES ('#cvn-wp-pt');
INSERT INTO `channels` VALUES ('#cvn-wp-ru');
INSERT INTO `channels` VALUES ('#cvn-wp-scan');
INSERT INTO `channels` VALUES ('#cvn-wp-sh');
INSERT INTO `channels` VALUES ('#cvn-wp-sv');
INSERT INTO `channels` VALUES ('#cvn-wp-tr');
INSERT INTO `channels` VALUES ('#cvn-wq-en');
INSERT INTO `channels` VALUES ('#cvn-ws-en');
INSERT INTO `channels` VALUES ('#cvn-ws-fa');
INSERT INTO `channels` VALUES ('#cvn-ws-fr');
INSERT INTO `channels` VALUES ('#cvn-wt-de');
INSERT INTO `channels` VALUES ('#cvn-wt-en');
INSERT INTO `channels` VALUES ('#cvn-wt-es');
INSERT INTO `channels` VALUES ('#cvn-wv-en');
INSERT INTO `channels` VALUES ('#cvn-zh-scan');
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

-- Dump completed on 2017-11-15  0:49:20

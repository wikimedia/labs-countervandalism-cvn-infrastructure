-- MySQL dump 10.13  Distrib 5.1.66, for debian-linux-gnu (x86_64)
--
-- Host: sql    Database: p_cvn_clerkbot
-- ------------------------------------------------------
-- Server version	5.1.66

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
INSERT INTO `channels` VALUES ('#cvn-abusefilter'),('#cvn-blacklist'),('#cvn-blocks'),('#cvn-bots'),('#cvn-clubpenguin'),('#cvn-commons'),('#cvn-commons-uploads'),('#cvn-cvnwiki'),('#cvn-halopedia'),('#cvn-it-scan'),('#cvn-ja'),('#cvn-meta'),('#cvn-newpages'),('#cvn-sandbox'),('#cvn-simplewikis'),('#cvn-species-'),('#cvn-staff'),('#cvn-sw'),('#cvn-sw-spam'),('#cvn-unifications'),('#cvn-wb-en'),('#cvn-wb-fa'),('#cvn-wikia'),('#cvn-wikia-?pedia'),('#cvn-wikia-aoc'),('#cvn-wikia-bleach'),('#cvn-wikia-central'),('#cvn-wikia-clubpenguin'),('#cvn-wikia-cod'),('#cvn-wikia-combatarms'),('#cvn-wikia-de'),('#cvn-wikia-digimon-es'),('#cvn-wikia-es'),('#cvn-wikia-fallout'),('#cvn-wikia-halo'),('#cvn-wikia-inciclopedia'),('#cvn-wikia-lego-wikis'),('#cvn-wikia-pokemontowerdefense'),('#cvn-wikia-runescape'),('#cvn-wikia-twewy'),('#cvn-wikia-uncyc'),('#cvn-wikia-wookieepedia'),('#cvn-wikia-wowwiki'),('#cvn-wikia-zelda'),('#cvn-wikidata'),('#cvn-wikivoyage'),('#cvn-wn-en'),('#cvn-wn-fa'),('#cvn-wn-fi'),('#cvn-wp-ar'),('#cvn-wp-da'),('#cvn-wp-en'),('#cvn-wp-en-abuse'),('#cvn-wp-en-cluenet'),('#cvn-wp-en-newpages'),('#cvn-wp-en-newusers'),('#cvn-wp-en-uploads'),('#cvn-wp-es'),('#cvn-wp-fa'),('#cvn-wp-fi'),('#cvn-wp-hu'),('#cvn-wp-is'),('#cvn-wp-nl'),('#cvn-wp-nn'),('#cvn-wp-no'),('#cvn-wp-pl'),('#cvn-wp-pt'),('#cvn-wp-ru'),('#cvn-wp-scan'),('#cvn-wp-sv'),('#cvn-wq-en'),('#cvn-ws-en'),('#cvn-ws-fa'),('#cvn-ws-fr'),('#cvn-wt-de'),('#cvn-wt-en'),('#cvn-wt-es'),('#cvn-wv-en'),('#cvn-zh-scan');
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

-- Dump completed on 2013-03-29  1:18:11

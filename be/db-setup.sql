CREATE DATABASE `MemoryGameDB`;

-- MemoryGameDB.Cards definition

CREATE TABLE `MemoryGameDB`.`Cards` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `imgURL` varchar(2048) NOT NULL,
    `theme` varchar(100) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 61 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- MemoryGameDB.Scores definition

CREATE TABLE `MemoryGameDB`.`Scores` (
    `id` int NOT NULL AUTO_INCREMENT,
    `score` int NOT NULL,
    `playerName` varchar(100) NOT NULL,
    `dateTime` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `Scores_playerName_uq` (`playerName`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

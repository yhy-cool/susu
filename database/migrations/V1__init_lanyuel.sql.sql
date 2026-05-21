/*
 Navicat Premium Data Transfer

 Source Server         : aaaa
 Source Server Type    : MySQL
 Source Server Version : 80012
 Source Host           : localhost:3306
 Source Schema         : lanyuel

 Target Server Type    : MySQL
 Target Server Version : 80012
 File Encoding         : 65001

 Date: 21/05/2026 16:14:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_default` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of addresses
-- ----------------------------
INSERT INTO `addresses` VALUES (1, 1, '苏', '1121341414', '河北省广平县', 0, '2026-04-26 20:37:38');
INSERT INTO `addresses` VALUES (2, 2, 'su', '15288367283', '河北省邯郸市广平县', 0, '2026-04-26 20:51:52');

-- ----------------------------
-- Table structure for carts
-- ----------------------------
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  INDEX `product_id`(`product_id`) USING BTREE,
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_id`) USING BTREE,
  INDEX `product_id`(`product_id`) USING BTREE,
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (2, 2, 2, 3, 3.99, '2026-04-26 20:51:59');
INSERT INTO `order_items` VALUES (3, 2, 5, 2, 6.99, '2026-04-26 20:51:59');
INSERT INTO `order_items` VALUES (4, 2, 4, 3, 1.99, '2026-04-26 20:51:59');
INSERT INTO `order_items` VALUES (5, 3, 3, 6, 4.59, '2026-05-14 21:51:02');
INSERT INTO `order_items` VALUES (6, 3, 4, 3, 1.99, '2026-05-14 21:51:02');
INSERT INTO `order_items` VALUES (7, 4, 3, 6, 4.59, '2026-05-14 21:51:04');
INSERT INTO `order_items` VALUES (8, 4, 4, 3, 1.99, '2026-05-14 21:51:04');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `order_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pending',
  `customer_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `customer_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `customer_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `delivery_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'delivery',
  `delivery_time` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, 1, '2026-04-26 20:37:46', 'shipping', '苏', '1121341414', '河北省广平县', 'delivery', NULL, '2026-04-26 20:37:46');
INSERT INTO `orders` VALUES (2, 2, '2026-04-26 20:51:59', 'delivered', 'su', '15288367283', '河北省邯郸市广平县', 'delivery', NULL, '2026-04-26 20:51:59');
INSERT INTO `orders` VALUES (3, 1, '2026-05-14 21:51:02', 'pending', '苏', '1121341414', '河北省广平县', 'delivery', NULL, '2026-05-14 21:51:02');
INSERT INTO `orders` VALUES (4, 1, '2026-05-14 21:51:04', 'pending', '苏', '1121341414', '河北省广平县', 'delivery', NULL, '2026-05-14 21:51:04');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, '红富士苹果', 5.99, '苹果梨桃水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%20in%20basket&image_size=square', '新鲜红富士苹果，果肉脆甜多汁，富含维生素C和膳食纤维，是老少皆宜的健康水果。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (2, '进口香蕉', 3.99, '其他水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20yellow%20bananas&image_size=square', '精选进口香蕉，口感软糯香甜，富含钾元素和维生素B6，有助于补充能量。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (3, '有机西红柿', 4.59, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20tomatoes&image_size=square', '有机种植西红柿，富含番茄红素和维生素C，可生食或烹饪，营养又美味。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (4, '新鲜黄瓜', 1.99, '其他蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20green%20cucumbers&image_size=square', '新鲜采摘黄瓜，口感清脆爽口，富含水分和维生素E，适合凉拌或直接食用。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (5, '赣南脐橙', 6.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20oranges&image_size=square', '正宗赣南脐橙，果肉细嫩多汁，维生素C含量高，可榨汁或直接食用。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (6, '阳光玫瑰葡萄', 12.99, '葡提浆果水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20grapes&image_size=square', '阳光玫瑰葡萄，果粒饱满，口感脆甜带有一股淡淡的玫瑰香味，是高端水果代表。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (7, '黄心土豆', 2.29, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20potatoes&image_size=square', '黄心土豆，淀粉含量高，口感绵软，适合煮食、烤食或制作各种土豆菜肴。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (8, '新鲜香菇', 6.99, '菌菇类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shiitake%20mushrooms&image_size=square', '新鲜香菇，菌肉肥厚，香气浓郁，富含氨基酸和多种微量元素，是烹饪的佳品。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (9, '进口柠檬', 4.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lemons&image_size=square', '进口青柠檬，酸度适中，富含维生素C，可用于调味、制作饮品或烘焙。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (10, '新疆哈密瓜', 5.99, '其他水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20hami%20melon&image_size=square', '正宗新疆哈密瓜，瓜肉甘甜多汁，富含维生素A和维生素C，是夏季解暑佳品。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (11, '大白菜', 1.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cabbage&image_size=square', '新鲜大白菜，叶片嫩绿，富含维生素C和膳食纤维，适合炒食或做馅。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (12, '紫甘蓝', 3.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20purple%20cabbage&image_size=square', '紫甘蓝富含花青素和维生素C，颜色艳丽，适合凉拌或做沙拉，营养又美观。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (13, '白萝卜', 1.59, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20white%20radish&image_size=square', '新鲜白萝卜，水分充足，口感脆甜，富含维生素C和淀粉酶，有助于消化。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (14, '胡萝卜', 2.29, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20carrots&image_size=square', '新鲜胡萝卜，富含β-胡萝卜素和维生素A，口感脆甜，可生食或烹饪。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (15, '金针菇', 4.99, '菌菇类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20enoki%20mushrooms&image_size=square', '金针菇菌柄细长，菌帽滑嫩，富含氨基酸和锌元素，适合涮火锅或凉拌。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (16, '杏鲍菇', 5.99, '菌菇类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20king%20oyster%20mushroom&image_size=square', '杏鲍菇菌肉肥厚，口感似鲍鱼，香气独特，富含蛋白质和多种氨基酸。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (17, '皇冠梨', 4.99, '苹果梨桃水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pears&image_size=square', '皇冠梨果肉雪白细腻，口感脆甜多汁，富含维生素B和果胶，是润肺止咳的好选择。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (18, '水蜜桃', 8.99, '苹果梨桃水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20peaches&image_size=square', '新鲜水蜜桃，果肉柔软多汁，香气浓郁，富含铁元素和维生素C，女性滋补佳品。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (19, '红灯笼樱桃', 15.99, '葡提浆果水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cherries&image_size=square', '进口红灯笼樱桃，果实饱满，颜色红艳，口感甜美，富含铁元素和花青素。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (20, '草莓', 9.99, '葡提浆果水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20strawberries&image_size=square', '新鲜草莓，香气浓郁，口感酸甜，富含维生素C和鞣酸，是春季必吃水果。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (21, '西柚', 6.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20grapefruit&image_size=square', '红心西柚，果肉饱满多汁，口感微苦回甜，富含维生素C和番茄红素，美容养颜佳品。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (22, '沃柑', 5.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20citrus&image_size=square', '沃柑果肉细嫩多汁，口感甜润，香味浓郁，是近年来的网红水果，老少皆宜。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (23, '小米椒', 7.99, '其他蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20chili%20peppers&image_size=square', '新鲜小米椒，辣味十足，富含维生素C和辣椒素，可用于调味或制作辣味菜肴。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (24, '生菜', 2.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lettuce&image_size=square', '新鲜生菜，叶片脆嫩，富含叶酸和维生素K，适合做沙拉或夹汉堡食用。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (25, '菠菜', 3.49, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20spinach&image_size=square', '新鲜菠菜，富含铁元素和叶酸，叶片嫩绿，口感清爽，适合清炒或做汤。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (26, '西兰花', 4.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20broccoli&image_size=square', '新鲜西兰花，富含维生素C和萝卜硫素，花球紧实，颜色深绿，是健康蔬菜的代表。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (27, '山药', 5.99, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20yam&image_size=square', '新鲜山药，富含黏蛋白和淀粉酶，口感绵软，健脾养胃，适合炖汤或清炒。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (28, '板栗南瓜', 3.99, '其他蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pumpkin&image_size=square', '板栗南瓜口感粉糯，甜度适中，富含胡萝卜素和膳食纤维，适合蒸食或做辅食。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (29, '紫薯', 3.99, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20purple%20sweet%20potato&image_size=square', '紫薯富含花青素和硒元素，外观呈紫色，口感绵软香甜，是健康粗粮的好选择。', '2026-04-23 20:28:27');
INSERT INTO `products` VALUES (30, '平和蜜柚', 7.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pummelo&image_size=square', '正宗平和蜜柚，果肉晶莹剔透，汁多味甜，富含维生素C和叶酸，是秋季特色水果。', '2026-04-23 20:28:27');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'user',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'test', '123456', 'user', 'active', '2026-04-23 20:27:45');
INSERT INTO `users` VALUES (2, 'admin', 'admin123', 'admin', 'active', '2026-04-23 20:27:45');

SET FOREIGN_KEY_CHECKS = 1;

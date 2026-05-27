// 数据库连接管理 - MySQL
const mysql = require('mysql');

// MySQL连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'lanyuel'
};

// 创建连接池
let pool = mysql.createPool(dbConfig);

// 数据库操作
const query = (sql, values, req) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('MySQL连接失败:', err.message);
        reject(err);
        return;
      }

      connection.query(sql, values, (error, results, fields) => {
        connection.release();
        if (error) {
          console.error('SQL查询错误:', error.message);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  });
};

// 数据库初始化
const initDatabase = async () => {
  try {
    // 创建用户表
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        nickname VARCHAR(50),
        phone VARCHAR(20)
      )
    `);

    // 创建商品表
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image VARCHAR(500) NOT NULL,
        description TEXT
      )
    `);

    // 创建订单表
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_time DATETIME NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        customer_name VARCHAR(50) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_address VARCHAR(255) NOT NULL,
        delivery_method VARCHAR(20) DEFAULT 'delivery',
        delivery_time VARCHAR(100),
        created_at DATETIME NOT NULL
      )
    `);

    // 创建订单商品表
    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at DATETIME NOT NULL
      )
    `);

    // 创建地址表
    await query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address VARCHAR(255) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at DATETIME NOT NULL
      )
    `);

    // 创建购物车表
    await query(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        created_at DATETIME NOT NULL,
        UNIQUE KEY user_product (user_id, product_id)
      )
    `);

    // 检查是否已有用户数据
    const users = await query('SELECT * FROM users');
    if (users.length === 0) {
      await query('INSERT INTO users (username, password, type, status) VALUES (?, ?, ?, ?)', ['test', '123456', 'user', 'active']);
      await query('INSERT INTO users (username, password, type, status) VALUES (?, ?, ?, ?)', ['admin', 'admin123', 'admin', 'active']);
    }

    // 检查是否已有商品数据
    const products = await query('SELECT * FROM products');
    if (products.length === 0) {
      const defaultProducts = [
        ['红富士苹果', 5.99, '苹果梨桃水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%20in%20basket&image_size=square', '新鲜红富士苹果，果肉脆甜多汁，富含维生素C和膳食纤维，是老少皆宜的健康水果。'],
        ['进口香蕉', 3.99, '其他水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20yellow%20bananas&image_size=square', '精选进口香蕉，口感软糯香甜，富含钾元素和维生素B6，有助于补充能量。'],
        ['有机西红柿', 4.59, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20tomatoes&image_size=square', '有机种植西红柿，富含番茄红素和维生素C，可生食或烹饪，营养又美味。'],
        ['新鲜黄瓜', 1.99, '其他蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20green%20cucumbers&image_size=square', '新鲜采摘黄瓜，口感清脆爽口，富含水分和维生素E，适合凉拌或直接食用。'],
        ['赣南脐橙', 6.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20oranges&image_size=square', '正宗赣南脐橙，果肉细嫩多汁，维生素C含量高，可榨汁或直接食用。'],
        ['阳光玫瑰葡萄', 12.99, '葡提浆果水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20grapes&image_size=square', '阳光玫瑰葡萄，果粒饱满，口感脆甜带有一股淡淡的玫瑰香味，是高端水果代表。'],
        ['黄心土豆', 2.29, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20potatoes&image_size=square', '黄心土豆，淀粉含量高，口感绵软，适合煮食、烤食或制作各种土豆菜肴。'],
        ['新鲜香菇', 6.99, '菌菇类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shiitake%20mushrooms&image_size=square', '新鲜香菇，菌肉肥厚，香气浓郁，富含氨基酸和多种微量元素，是烹饪的佳品。'],
        ['进口柠檬', 4.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lemons&image_size=square', '进口青柠檬，酸度适中，富含维生素C，可用于调味、制作饮品或烘焙。'],
        ['新疆哈密瓜', 5.99, '其他水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20hami%20melon&image_size=square', '正宗新疆哈密瓜，瓜肉甘甜多汁，富含维生素A和维生素C，是夏季解暑佳品。'],
        ['大白菜', 1.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cabbage&image_size=square', '新鲜大白菜，叶片嫩绿，富含维生素C和膳食纤维，适合炒食或做馅。'],
        ['紫甘蓝', 3.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20purple%20cabbage&image_size=square', '紫甘蓝富含花青素和维生素C，颜色艳丽，适合凉拌或做沙拉，营养又美观。'],
        ['白萝卜', 1.59, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20white%20radish&image_size=square', '新鲜白萝卜，水分充足，口感脆甜，富含维生素C和淀粉酶，有助于消化。'],
        ['胡萝卜', 2.29, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20carrots&image_size=square', '新鲜胡萝卜，富含β-胡萝卜素和维生素A，口感脆甜，可生食或烹饪。'],
        ['金针菇', 4.99, '菌菇类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20enoki%20mushrooms&image_size=square', '金针菇菌柄细长，菌帽滑嫩，富含氨基酸和锌元素，适合涮火锅或凉拌。'],
        ['杏鲍菇', 5.99, '菌菇类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20king%20oyster%20mushroom&image_size=square', '杏鲍菇菌肉肥厚，口感似鲍鱼，香气独特，富含蛋白质和多种氨基酸。'],
        ['皇冠梨', 4.99, '苹果梨桃水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pears&image_size=square', '皇冠梨果肉雪白细腻，口感脆甜多汁，富含维生素B和果胶，是润肺止咳的好选择。'],
        ['水蜜桃', 8.99, '苹果梨桃水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20peaches&image_size=square', '新鲜水蜜桃，果肉柔软多汁，香气浓郁，富含铁元素和维生素C，女性滋补佳品。'],
        ['红灯笼樱桃', 15.99, '葡提浆果水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cherries&image_size=square', '进口红灯笼樱桃，果实饱满，颜色红艳，口感甜美，富含铁元素和花青素。'],
        ['草莓', 9.99, '葡提浆果水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20strawberries&image_size=square', '新鲜草莓，香气浓郁，口感酸甜，富含维生素C和鞣酸，是春季必吃水果。'],
        ['西柚', 6.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20grapefruit&image_size=square', '红心西柚，果肉饱满多汁，口感微苦回甜，富含维生素C和番茄红素，美容养颜佳品。'],
        ['沃柑', 5.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20citrus&image_size=square', '沃柑果肉细嫩多汁，口感甜润，香味浓郁，是近年来的网红水果，老少皆宜。'],
        ['小米椒', 7.99, '其他蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20chili%20peppers&image_size=square', '新鲜小米椒，辣味十足，富含维生素C和辣椒素，可用于调味或制作辣味菜肴。'],
        ['生菜', 2.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lettuce&image_size=square', '新鲜生菜，叶片脆嫩，富含叶酸和维生素K，适合做沙拉或夹汉堡食用。'],
        ['菠菜', 3.49, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20spinach&image_size=square', '新鲜菠菜，富含铁元素和叶酸，叶片嫩绿，口感清爽，适合清炒或做汤。'],
        ['西兰花', 4.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20broccoli&image_size=square', '新鲜西兰花，富含维生素C和萝卜硫素，花球紧实，颜色深绿，是健康蔬菜的代表。'],
        ['山药', 5.99, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20yam&image_size=square', '新鲜山药，富含黏蛋白和淀粉酶，口感绵软，健脾养胃，适合炖汤或清炒。'],
        ['板栗南瓜', 3.99, '其他蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pumpkin&image_size=square', '板栗南瓜口感粉糯，甜度适中，富含胡萝卜素和膳食纤维，适合蒸食或做辅食。'],
        ['紫薯', 3.99, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20purple%20sweet%20potato&image_size=square', '紫薯富含花青素和硒元素，外观呈紫色，口感绵软香甜，是健康粗粮的好选择。'],
        ['平和蜜柚', 7.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pummelo&image_size=square', '正宗平和蜜柚，果肉晶莹剔透，汁多味甜，富含维生素C和叶酸，是秋季特色水果。']
      ];

      for (const product of defaultProducts) {
        await query(
          'INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)',
          product
        );
      }
    }

    console.log('MySQL数据库初始化完成');
  } catch (error) {
    console.error('MySQL数据库初始化失败:', error.message);
  }
};

module.exports = {
  query,
  initDatabase
};

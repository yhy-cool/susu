const express = require('express');
const router = express.Router();
const { query, initDatabase } = require('../model/db');

// 初始化数据库
initDatabase().then(() => {
  console.log('数据库初始化完成');
  // 初始化默认商品数据
  initDefaultProducts();
  // 初始化默认用户数据
  initDefaultUsers();
}).catch((error) => {
  console.error('数据库初始化失败:', error);
});

// 初始化默认商品数据
async function initDefaultProducts() {
  try {
    // 检查是否已有商品数据
    const existingProducts = await query('SELECT * FROM products');
    if (existingProducts.length === 0) {
      // 添加默认商品
      const defaultProducts = [
        ['苹果', 5.99, '苹果梨桃水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%20in%20basket&image_size=square'],
        ['香蕉', 3.99, '其他水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20yellow%20bananas&image_size=square'],
        ['西红柿', 2.99, '叶菜类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20tomatoes&image_size=square'],
        ['黄瓜', 1.99, '其他蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20green%20cucumbers&image_size=square'],
        ['橙子', 4.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20oranges&image_size=square'],
        ['葡萄', 8.99, '葡提浆果水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20grapes&image_size=square'],
        ['土豆', 1.59, '根茎类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20potatoes&image_size=square'],
        ['香菇', 6.99, '菌菇类蔬菜', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shiitake%20mushrooms&image_size=square'],
        ['柠檬', 3.99, '柑桔橙柚水果', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lemons&image_size=square']
      ];
      
      for (const product of defaultProducts) {
        await query('INSERT INTO products (name, price, category, image) VALUES (?, ?, ?, ?)', product);
      }
      console.log('默认商品数据初始化完成');
    }
  } catch (error) {
    console.error('初始化默认商品失败:', error);
  }
}

// 初始化默认用户数据
async function initDefaultUsers() {
  try {
    // 检查是否已有用户数据
    const existingUsers = await query('SELECT * FROM users');
    if (existingUsers.length === 0) {
      // 添加默认用户
      await query('INSERT INTO users (username, password, type, status) VALUES (?, ?, ?, ?)', ['test', '123456', 'user', 'active']);
      await query('INSERT INTO users (username, password, type, status) VALUES (?, ?, ?, ?)', ['admin', 'admin123', 'admin', 'active']);
      console.log('默认用户数据初始化完成');
    }
  } catch (error) {
    console.error('初始化默认用户失败:', error);
  }
}

// 已完全迁移到数据库存储，不再使用内存存储变量

// 用户登录接口
router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (user.length > 0) {
      const userData = user[0];
      if (userData.status === 'frozen') {
        res.json({
          success: false,
          message: '账号已被冻结'
        });
        return;
      }
      res.json({
        success: true,
        message: '登录成功',
        user: { id: userData.id, username: userData.username, type: userData.type, status: userData.status }
      });
    } else {
      res.json({
        success: false,
        message: '用户名或密码错误'
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    res.json({
      success: false,
      message: '登录失败'
    });
  }
});

// 商品列表接口
router.get('/api/products', async (req, res) => {
  try {
    const results = await query('SELECT * FROM products');
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.json({
      success: false,
      message: '获取商品列表失败'
    });
  }
});

// 商品详情接口
router.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (results.length === 0) {
      res.json({
        success: false,
        message: '商品不存在'
      });
      return;
    }
    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.json({
      success: false,
      message: '获取商品详情失败'
    });
  }
});

// 订单提交接口
router.post('/api/order', async (req, res) => {
  const { userId, products: orderProducts } = req.body;
  if (!userId || !orderProducts || orderProducts.length === 0) {
    res.json({
      success: false,
      message: '订单信息不完整'
    });
    return;
  }
  
  try {
    // 开始事务
    await query('START TRANSACTION');
    
    // 创建订单
    const orderResult = await query(
      'INSERT INTO orders (user_id, order_time, status, customer_name, customer_phone, customer_address, created_at) VALUES (?, NOW(), ?, ?, ?, ?, NOW())',
      [userId, 'pending', req.body.customerName || '未知', req.body.customerPhone || '未知', req.body.customerAddress || '未知'],
      req
    );
    
    const orderId = orderResult.insertId;
    
    // 添加订单商品
    for (const product of orderProducts) {
      // 添加订单商品记录
      await query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, created_at) VALUES (?, ?, ?, ?, NOW())',
        [orderId, product.id, product.quantity, product.price]
      );
    }
    
    // 提交事务
    await query('COMMIT');
    
    res.json({
      success: true,
      message: '订单提交成功',
      orderId
    });
  } catch (error) {
    // 回滚事务
    await query('ROLLBACK');
    console.error('提交订单失败:', error);
    res.json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 管理员商品管理接口

// 添加商品
router.post('/api/admin/products', async (req, res) => {
  const { name, price, category, image } = req.body;
  if (!name || price === undefined || !category) {
    res.json({
      success: false,
      message: '商品信息不完整'
    });
    return;
  }
  
  try {
    const result = await query(
      'INSERT INTO products (name, price, category, image) VALUES (?, ?, ?, ?)',
      [name, parseFloat(price), category, image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruits%20and%20vegetables&image_size=square']
    );
    
    const newProduct = {
      id: result.insertId,
      name,
      price: parseFloat(price),
      category,
      image: image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruits%20and%20vegetables&image_size=square'
    };
    
    res.json({
      success: true,
      message: '商品添加成功',
      data: newProduct
    });
  } catch (error) {
    console.error('添加商品失败:', error);
    res.json({
      success: false,
      message: '添加商品失败'
    });
  }
});

// 修改商品
router.put('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, category, image } = req.body;
  
  try {
    // 检查商品是否存在
    const existingProduct = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      res.json({
        success: false,
        message: '商品不存在'
      });
      return;
    }
    
    // 更新商品
    await query(
      'UPDATE products SET name = ?, price = ?, category = ?, image = ? WHERE id = ?',
      [name || existingProduct[0].name, price ? parseFloat(price) : existingProduct[0].price, category || existingProduct[0].category, image || existingProduct[0].image, id]
    );
    
    const updatedProduct = {
      ...existingProduct[0],
      name: name || existingProduct[0].name,
      price: price ? parseFloat(price) : existingProduct[0].price,
      category: category || existingProduct[0].category,
      image: image || existingProduct[0].image
    };
    
    res.json({
      success: true,
      message: '商品修改成功',
      data: updatedProduct
    });
  } catch (error) {
    console.error('修改商品失败:', error);
    res.json({
      success: false,
      message: '修改商品失败'
    });
  }
});

// 删除商品
router.delete('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await query('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      res.json({
        success: false,
        message: '商品不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.json({
      success: false,
      message: '删除商品失败'
    });
  }
});



// 管理员订单管理接口
router.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // 为每个订单获取商品详情并转换字段名
    const formattedOrders = orders.map(order => {
      return {
        id: order.id,
        userId: order.user_id,
        orderTime: order.order_time,
        status: order.status,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        created_at: order.created_at,
        products: []
      };
    });
    
    // 为每个订单获取商品详情
    for (const order of formattedOrders) {
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      // 获取商品详情
      const products = [];
      for (const item of items) {
        const product = await query('SELECT * FROM products WHERE id = ?', [item.product_id]);
        if (product.length > 0) {
          products.push({
            id: product[0].id,
            name: product[0].name,
            price: product[0].price,
            quantity: item.quantity
          });
        }
      }
      order.products = products;
    }
    
    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.json({
      success: false,
      message: '获取订单列表失败'
    });
  }
});

// 用户订单管理接口
router.get('/api/orders', async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // 为每个订单获取商品详情并转换字段名
    const formattedOrders = orders.map(order => {
      return {
        id: order.id,
        userId: order.user_id,
        orderTime: order.order_time,
        status: order.status,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        created_at: order.created_at,
        products: []
      };
    });
    
    // 为每个订单获取商品详情
    for (const order of formattedOrders) {
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      // 获取商品详情
      const products = [];
      for (const item of items) {
        const product = await query('SELECT * FROM products WHERE id = ?', [item.product_id]);
        if (product.length > 0) {
          products.push({
            id: product[0].id,
            name: product[0].name,
            price: product[0].price,
            quantity: item.quantity
          });
        }
      }
      order.products = products;
    }
    
    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.json({
      success: false,
      message: '获取订单列表失败'
    });
  }
});

// 删除订单
router.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // 开始事务
    await query('START TRANSACTION');
    
    // 删除订单商品
    await query('DELETE FROM order_items WHERE order_id = ?', [id]);
    
    // 删除订单
    const result = await query('DELETE FROM orders WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      await query('ROLLBACK');
      res.json({
        success: false,
        message: '订单不存在'
      });
      return;
    }
    
    // 提交事务
    await query('COMMIT');
    
    res.json({
      success: true,
      message: '订单删除成功'
    });
  } catch (error) {
    // 回滚事务
    await query('ROLLBACK');
    console.error('删除订单失败:', error);
    res.json({
      success: false,
      message: '删除订单失败'
    });
  }
});

// 更新订单状态
router.put('/api/orders/status', async (req, res) => {
  const { id, status } = req.body;
  
  try {
    const result = await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    
    if (result.affectedRows === 0) {
      res.json({
        success: false,
        message: '订单不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.json({
      success: false,
      message: '更新订单状态失败'
    });
  }
});

// 批量删除订单
router.post('/api/orders/delete', async (req, res) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids)) {
    res.json({
      success: false,
      message: '请提供要删除的订单ID列表'
    });
    return;
  }
  
  try {
    // 开始事务
    await query('START TRANSACTION');
    
    // 删除订单商品
    await query('DELETE FROM order_items WHERE order_id IN (?)', [ids]);
    
    // 删除订单
    const result = await query('DELETE FROM orders WHERE id IN (?)', [ids]);
    
    // 提交事务
    await query('COMMIT');
    
    res.json({
      success: true,
      message: `成功删除${result.affectedRows}个订单`
    });
  } catch (error) {
    // 回滚事务
    await query('ROLLBACK');
    console.error('批量删除订单失败:', error);
    res.json({
      success: false,
      message: '批量删除订单失败'
    });
  }
});

// 管理员用户管理接口
router.get('/api/admin/users', async (req, res) => {
  try {
    const results = await query('SELECT * FROM users');
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 添加用户
router.post('/api/admin/users', async (req, res) => {
  const { username, password, type } = req.body;
  if (!username || !password || !type) {
    res.json({
      success: false,
      message: '用户信息不完整'
    });
    return;
  }
  
  try {
    // 检查用户名是否已存在
    const existingUser = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      res.json({
        success: false,
        message: '用户名已存在'
      });
      return;
    }
    
    // 添加新用户
    const result = await query(
      'INSERT INTO users (username, password, type, status) VALUES (?, ?, ?, ?)',
      [username, password, type, 'active']
    );
    
    const newUser = {
      id: result.insertId,
      username,
      password,
      type,
      status: 'active'
    };
    
    res.json({
      success: true,
      message: '用户添加成功',
      data: newUser
    });
  } catch (error) {
    console.error('添加用户失败:', error);
    res.json({
      success: false,
      message: '添加用户失败'
    });
  }
});

// 修改用户密码
router.put('/api/admin/users/:id/password', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  
  try {
    const result = await query('UPDATE users SET password = ? WHERE id = ?', [password, id]);
    
    if (result.affectedRows === 0) {
      res.json({
        success: false,
        message: '用户不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.json({
      success: false,
      message: '修改密码失败'
    });
  }
});

// 冻结/解冻用户账号
router.put('/api/admin/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    
    if (result.affectedRows === 0) {
      res.json({
        success: false,
        message: '用户不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: `账号${status === 'frozen' ? '冻结' : '解冻'}成功`
    });
  } catch (error) {
    console.error('修改账号状态失败:', error);
    res.json({
      success: false,
      message: '修改账号状态失败'
    });
  }
});

// 修改用户个人信息
router.put('/api/users/:id/profile', async (req, res) => {
  const { id } = req.params;
  const { nickname, phone } = req.body;
  
  try {
    const result = await query('UPDATE users SET nickname = ?, phone = ? WHERE id = ?', [nickname, phone, id]);
    
    if (result.affectedRows === 0) {
      res.json({
        success: false,
        message: '用户不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '个人信息修改成功'
    });
  } catch (error) {
    console.error('修改个人信息失败:', error);
    res.json({
      success: false,
      message: '修改个人信息失败'
    });
  }
});

// 用户修改密码
router.put('/api/users/:id/password', async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  
  try {
    // 验证旧密码
    const user = await query('SELECT * FROM users WHERE id = ? AND password = ?', [id, oldPassword]);
    if (user.length === 0) {
      res.json({
        success: false,
        message: '旧密码错误'
      });
      return;
    }
    
    // 更新密码
    const result = await query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);
    
    if (result.affectedRows === 0) {
      res.json({
        success: false,
        message: '用户不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.json({
      success: false,
      message: '修改密码失败'
    });
  }
});

// 用户购物车接口

// 添加到购物车
router.post('/api/cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || !quantity) {
    res.json({
      success: false,
      message: '购物车信息不完整'
    });
    return;
  }
  
  try {
    // 检查商品是否存在
    const product = await query('SELECT * FROM products WHERE id = ?', [productId]);
    if (product.length === 0) {
      res.json({
        success: false,
        message: '商品不存在'
      });
      return;
    }
    
    // 检查购物车中是否已有该商品
    const existingCart = await query('SELECT * FROM carts WHERE user_id = ? AND product_id = ?', [userId, productId]);
    
    if (existingCart.length > 0) {
      // 更新数量
      await query('UPDATE carts SET quantity = quantity + ? WHERE id = ?', [quantity, existingCart[0].id]);
    } else {
      // 添加新购物车项
      await query('INSERT INTO carts (user_id, product_id, quantity, created_at) VALUES (?, ?, ?, NOW())', [userId, productId, quantity]);
    }
    
    res.json({
      success: true,
      message: '添加购物车成功'
    });
  } catch (error) {
    console.error('添加购物车失败:', error);
    res.json({
      success: false,
      message: '添加购物车失败'
    });
  }
});

// 获取购物车
router.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // 获取用户购物车商品，包含商品详情
    const cartItems = await query(`
      SELECT c.id, c.user_id as userId, c.product_id, c.quantity, 
             p.name, p.price, p.image
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);
    
    res.json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    res.json({
      success: false,
      message: '获取购物车失败'
    });
  }
});

// 删除购物车商品
router.delete('/api/cart/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await query('DELETE FROM carts WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      res.json({
        success: false,
        message: '购物车商品不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '删除购物车商品成功'
    });
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    res.json({
      success: false,
      message: '删除购物车商品失败'
    });
  }
});

// 清空购物车
router.delete('/api/cart/clear/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await query('DELETE FROM carts WHERE user_id = ?', [userId]);
    
    res.json({
      success: true,
      message: '购物车清空成功',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('清空购物车失败:', error);
    res.json({
      success: false,
      message: '清空购物车失败'
    });
  }
});

// 收货信息管理接口

// 添加地址
router.post('/api/addresses', async (req, res) => {
  const { userId, name, phone, address, isDefault } = req.body;
  if (!userId || !name || !phone || !address) {
    res.json({
      success: false,
      message: '地址信息不完整'
    });
    return;
  }
  
  try {
    // 开始事务
    await query('START TRANSACTION');
    
    // 如果设置为默认地址，将其他地址设为非默认
    if (isDefault) {
      await query('UPDATE addresses SET is_default = false WHERE user_id = ?', [userId]);
    }
    
    // 添加新地址
    const result = await query(
      'INSERT INTO addresses (user_id, name, phone, address, is_default, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, name, phone, address, isDefault || false]
    );
    
    const newAddress = {
      id: result.insertId,
      userId: parseInt(userId),
      name,
      phone,
      address,
      isDefault: isDefault || false
    };
    
    // 提交事务
    await query('COMMIT');
    
    res.json({
      success: true,
      message: '地址添加成功',
      data: newAddress
    });
  } catch (error) {
    // 回滚事务
    await query('ROLLBACK');
    console.error('添加地址失败:', error);
    res.json({
      success: false,
      message: '添加地址失败'
    });
  }
});

// 获取用户地址
router.get('/api/addresses/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const userAddresses = await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
    res.json({
      success: true,
      data: userAddresses
    });
  } catch (error) {
    console.error('获取地址失败:', error);
    res.json({
      success: false,
      message: '获取地址失败'
    });
  }
});

// 修改地址
router.put('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, address, isDefault } = req.body;
  
  try {
    // 开始事务
    await query('START TRANSACTION');
    
    // 检查地址是否存在
    const existingAddress = await query('SELECT * FROM addresses WHERE id = ?', [id]);
    if (existingAddress.length === 0) {
      await query('ROLLBACK');
      res.json({
        success: false,
        message: '地址不存在'
      });
      return;
    }
    
    const userId = existingAddress[0].user_id;
    
    // 如果设置为默认地址，将其他地址设为非默认
    if (isDefault) {
      await query('UPDATE addresses SET is_default = false WHERE user_id = ?', [userId]);
    }
    
    // 更新地址
    await query(
      'UPDATE addresses SET name = ?, phone = ?, address = ?, is_default = ? WHERE id = ?',
      [name || existingAddress[0].name, phone || existingAddress[0].phone, address || existingAddress[0].address, isDefault !== undefined ? isDefault : existingAddress[0].is_default, id]
    );
    
    const updatedAddress = {
      ...existingAddress[0],
      name: name || existingAddress[0].name,
      phone: phone || existingAddress[0].phone,
      address: address || existingAddress[0].address,
      isDefault: isDefault !== undefined ? isDefault : existingAddress[0].is_default
    };
    
    // 提交事务
    await query('COMMIT');
    
    res.json({
      success: true,
      message: '地址修改成功',
      data: updatedAddress
    });
  } catch (error) {
    // 回滚事务
    await query('ROLLBACK');
    console.error('修改地址失败:', error);
    res.json({
      success: false,
      message: '修改地址失败'
    });
  }
});

// 删除地址
router.delete('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await query('DELETE FROM addresses WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      res.json({
        success: false,
        message: '地址不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '地址删除成功'
    });
  } catch (error) {
    console.error('删除地址失败:', error);
    res.json({
      success: false,
      message: '删除地址失败'
    });
  }
});

console.log('模拟数据初始化成功');
console.log('测试用户: test/123456');
console.log('管理员账号: admin/admin123');

module.exports = router;
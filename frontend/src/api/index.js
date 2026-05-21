// API请求封装

const baseUrl = 'http://localhost:3001';

// 通用请求方法
const request = async (url, options = {}) => {
  try {
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求失败:', error);
    return { success: false, message: '网络错误' };
  }
};

// API接口
export const api = {
  // 用户登录
  login: async (username, password) => {
    return await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  // 获取商品列表
  getProducts: async () => {
    return await request('/api/products');
  },
  
  // 获取商品详情
  getProduct: async (id) => {
    return await request(`/api/products/${id}`);
  },
  
  // 提交订单
  submitOrder: async (userId, products, customerInfo = {}) => {
    return await request('/api/order', {
      method: 'POST',
      body: JSON.stringify({ userId, products, ...customerInfo })
    });
  },
  
  // 用户订单管理接口
  getOrders: async () => {
    return await request('/api/orders');
  },
  
  // 删除订单
  deleteOrder: async (id) => {
    return await request(`/api/orders/${id}`, {
      method: 'DELETE'
    });
  },
  
  // 更新订单状态
  updateOrderStatus: async (id, status) => {
    return await request('/api/orders/status', {
      method: 'PUT',
      body: JSON.stringify({ id, status })
    });
  },
  
  // 批量删除订单
  deleteOrders: async (ids) => {
    return await request('/api/orders/delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
  },
  
  // 管理员商品管理
  addProduct: async (productData) => {
    return await request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },
  
  updateProduct: async (id, productData) => {
    return await request(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },
  
  deleteProduct: async (id) => {
    return await request(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });
  },
  
  updateProductStatus: async (id, status) => {
    return await request(`/api/admin/products/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },
  
  // 管理员订单管理
  getAdminOrders: async () => {
    return await request('/api/admin/orders');
  },
  
  // 管理员用户管理
  getUsers: async () => {
    return await request('/api/admin/users');
  },
  
  updateUserPassword: async (id, password) => {
    return await request(`/api/admin/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password })
    });
  },
  
  updateUserStatus: async (id, status) => {
    return await request(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },
  
  // 添加用户
  addUser: async (userData) => {
    return await request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  // 用户购物车管理
  addToCart: async (userId, productId, quantity) => {
    return await request('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, quantity })
    });
  },
  
  getCart: async (userId) => {
    return await request(`/api/cart/${userId}`);
  },
  
  deleteFromCart: async (id) => {
    return await request(`/api/cart/${Number(id)}`, {
      method: 'DELETE'
    });
  },
  
  // 清空购物车
  clearCart: async (userId) => {
    return await request(`/api/cart/clear/${userId}`, {
      method: 'DELETE'
    });
  },
  
  // 用户收货信息管理
  addAddress: async (userId, name, phone, address, isDefault) => {
    return await request('/api/addresses', {
      method: 'POST',
      body: JSON.stringify({ userId, name, phone, address, isDefault })
    });
  },
  
  getAddresses: async (userId) => {
    return await request(`/api/addresses/${userId}`);
  },
  
  updateAddress: async (id, name, phone, address, isDefault) => {
    return await request(`/api/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, phone, address, isDefault })
    });
  },
 // 删除地址
  deleteAddress: async (id) => {
    return await request(`/api/addresses/${id}`, {
      method: 'DELETE'
    });
  },
  
  // 修改个人信息
  updateProfile: async (userId, nickname, phone) => {
    return await request(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ nickname, phone })
    });
  },
  
  // 修改密码
  changePassword: async (userId, oldPassword, newPassword) => {
    return await request(`/api/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  }
};
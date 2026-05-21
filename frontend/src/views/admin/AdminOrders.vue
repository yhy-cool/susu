<template>
  <div class="admin-orders-container">
    <h2>订单管理</h2>
    
    <div class="orders-summary">
      <div class="summary-card total">
        <div class="summary-icon">📋</div>
        <div class="summary-content">
          <div class="summary-value">{{ totalOrders }}</div>
          <div class="summary-label">总订单数</div>
        </div>
      </div>
      <div class="summary-card pending">
        <div class="summary-icon">⏳</div>
        <div class="summary-content">
          <div class="summary-value">{{ pendingOrders }}</div>
          <div class="summary-label">未发货</div>
        </div>
      </div>
      <div class="summary-card shipping">
        <div class="summary-icon">🚚</div>
        <div class="summary-content">
          <div class="summary-value">{{ shippingOrders }}</div>
          <div class="summary-label">配送中</div>
        </div>
      </div>
      <div class="summary-card delivered">
        <div class="summary-icon">✅</div>
        <div class="summary-content">
          <div class="summary-value">{{ deliveredOrders }}</div>
          <div class="summary-label">已收货</div>
        </div>
      </div>
    </div>
    
    <div class="orders-header">
      <div class="select-all">
        <input type="checkbox" v-model="selectAll" @change="handleSelectAll">
        <span>全选</span>
      </div>
      <button @click="deleteSelectedOrders" class="delete-selected-btn" :disabled="selectedOrders.length === 0">删除选中订单</button>
    </div>
    
    <div v-for="order in orders" :key="order.id" class="order-item">
      <div class="order-header">
        <div class="order-info">
          <input type="checkbox" v-model="order.selected" @change="handleOrderSelect(order.id)">
          <span class="order-id">订单ID: {{ order.id }}</span>
          <span class="order-time">下单时间: {{ formatDate(order.orderTime) }}</span>
          <span class="order-status" :class="`status-${order.status}`">
            {{ order.status === 'pending' ? '未发货' : order.status === 'shipping' ? '配送中' : order.status === 'delivered' ? '已收货' : order.status }}
          </span>
        </div>
        <div class="order-actions">
          <select v-model="order.status" @change="updateOrderStatus(order.id, order.status)" class="status-select">
            <option value="pending">未发货</option>
            <option value="shipping">配送中</option>
            <option value="delivered">已收货</option>
          </select>
          <button @click="deleteOrder(order.id)" class="delete-btn">删除</button>
        </div>
      </div>
      
      <div class="order-details">
        <div class="customer-info">
          <h4>订购者信息</h4>
          <p>姓名: {{ order.customerName || '未知' }}</p>
          <p>电话: {{ order.customerPhone || '未知' }}</p>
          <p>住址: {{ order.customerAddress || '未知' }}</p>
        </div>
        
        <div class="products-info">
          <h4>购买商品</h4>
          <table class="products-table">
            <thead>
              <tr>
                <th>商品名称</th>
                <th>数量</th>
                <th>单价</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in order.products" :key="product.id">
                <td>{{ product.name }}</td>
                <td>{{ product.quantity }}</td>
                <td>¥{{ product.price.toFixed(2) }}</td>
                <td>¥{{ (product.price * product.quantity).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-amount">
            <span>总计: ¥{{ calculateTotal(order.products).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <p v-if="orders.length === 0" class="empty-message">暂无订单</p>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../../api/index';

export default {
  name: 'AdminOrders',
  data() {
    return {
      orders: [],
      message: '',
      selectAll: false
    };
  },
  computed: {
    selectedOrders() {
      return this.orders.filter(order => order.selected);
    },
    totalOrders() {
      return this.orders.length;
    },
    pendingOrders() {
      return this.orders.filter(order => order.status === 'pending').length;
    },
    shippingOrders() {
      return this.orders.filter(order => order.status === 'shipping').length;
    },
    deliveredOrders() {
      return this.orders.filter(order => order.status === 'delivered').length;
    }
  },
  mounted() {
    this.getOrders();
  },
  methods: {
    async getOrders() {
      const result = await api.getAdminOrders();
      if (result.success) {
        // 为每个订单添加selected属性
        this.orders = result.data.map(order => ({
          ...order,
          selected: false
        }));
      } else {
        this.message = result.message;
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    },
    
    calculateTotal(products) {
      return products.reduce((total, product) => {
        return total + product.price * product.quantity;
      }, 0);
    },
    
    async updateOrderStatus(orderId, status) {
      const result = await api.updateOrderStatus(orderId, status);
      if (result.success) {
        this.message = '订单状态已更新';
      } else {
        this.message = result.message;
      }
    },
    
    handleSelectAll() {
      this.orders.forEach(order => {
        order.selected = this.selectAll;
      });
    },
    
    handleOrderSelect(orderId) {
      // 检查是否所有订单都被选中
      this.selectAll = this.orders.every(order => order.selected);
    },
    
    async deleteOrder(orderId) {
      if (confirm('确定要删除这个订单吗？')) {
        const result = await api.deleteOrder(orderId);
        if (result.success) {
          this.message = result.message;
          this.getOrders();
        } else {
          this.message = result.message;
        }
      }
    },
    
    async deleteSelectedOrders() {
      if (this.selectedOrders.length === 0) {
        this.message = '请先选择要删除的订单';
        return;
      }
      
      if (confirm(`确定要删除选中的${this.selectedOrders.length}个订单吗？`)) {
        const selectedIds = this.selectedOrders.map(order => order.id);
        const result = await api.deleteOrders(selectedIds);
        if (result.success) {
          this.message = result.message;
          this.getOrders();
          this.selectAll = false;
        } else {
          this.message = result.message;
        }
      }
    }
  }
};
</script>

<style scoped>
.admin-orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.orders-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  font-size: 36px;
  margin-right: 15px;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.summary-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.summary-card.total {
  border-left: 4px solid #3498db;
}

.summary-card.pending {
  border-left: 4px solid #f39c12;
}

.summary-card.shipping {
  border-left: 4px solid #3498db;
}

.summary-card.delivered {
  border-left: 4px solid #27ae60;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-all input[type="checkbox"] {
  transform: scale(1.2);
}

.delete-selected-btn {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-selected-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.order-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.order-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.order-info input[type="checkbox"] {
  transform: scale(1.2);
}

.order-id {
  font-weight: bold;
  color: #333;
}

.order-time {
  color: #666;
  font-size: 14px;
}

.order-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-pending {
  background-color: #f39c12;
  color: white;
}

.status-shipping {
  background-color: #3498db;
  color: white;
}

.status-delivered {
  background-color: #27ae60;
  color: white;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.status-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.delete-btn {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.order-details {
  padding: 20px;
  display: flex;
  gap: 40px;
}

.customer-info {
  flex: 1;
  min-width: 300px;
}

.customer-info h4,
.products-info h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.customer-info p {
  margin: 10px 0;
  color: #666;
  font-size: 14px;
}

.products-info {
  flex: 2;
  min-width: 500px;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.products-table th,
.products-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  font-size: 14px;
}

.products-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}

.total-amount {
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
  margin-top: 10px;
}

.empty-message {
  text-align: center;
  padding: 50px 0;
  color: #95a5a6;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  color: #27ae60;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .orders-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .order-details {
    flex-direction: column;
    gap: 20px;
  }
  
  .customer-info,
  .products-info {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .orders-summary {
    grid-template-columns: 1fr;
  }
  
  .orders-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .order-actions {
    align-self: flex-end;
  }
}
</style>
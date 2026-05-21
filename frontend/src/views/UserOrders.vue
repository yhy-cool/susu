<template>
  <div class="user-orders-container">
    <h2>我的订单</h2>
    
    <div v-if="orders.length > 0" class="orders-header">
      <div class="select-all">
        <input type="checkbox" v-model="selectAll" @change="handleSelectAll">
        <span>全选</span>
      </div>
      <button @click="deleteSelectedOrders" class="delete-selected-btn" :disabled="selectedOrders.length === 0">删除选中订单</button>
    </div>
    
    <div v-if="orders.length > 0" class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-item">
        <div class="order-header">
          <div class="order-info">
            <input type="checkbox" v-model="order.selected" @change="handleOrderSelect(order.id)">
            <span class="order-id">订单ID: {{ order.id }}</span>
            <span class="order-time">下单时间: {{ formatDate(order.orderTime) }}</span>
            <div class="status-control">
              <span class="order-status" :class="`status-${order.status}`">
                {{ order.status === 'pending' ? '未发货' : order.status === 'shipping' ? '配送中' : order.status === 'delivered' ? '已收货' : order.status }}
              </span>
            </div>
          </div>
          <div class="order-actions">
            <button @click="deleteOrder(order.id)" class="delete-btn">删除</button>
          </div>
        </div>
        
        <div class="order-details">
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
    </div>
    
    <div v-else class="empty-orders">
      <p>您还没有订单</p>
      <button @click="goToProducts" class="go-shopping-btn">去购物</button>
    </div>
    
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../api/index';

export default {
  name: 'UserOrders',
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
    }
  },
  mounted() {
    this.getOrders();
  },
  methods: {
    async getOrders() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      const result = await api.getOrders();
      if (result.success) {
        // 只显示当前用户的订单
        this.orders = result.data.filter(order => order.userId === user.id).map(order => ({
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
    
    goToProducts() {
      this.$router.push('/products');
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
    },
    

  }
};
</script>

<style scoped>
.user-orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.status-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-actions {
  display: flex;
  gap: 10px;
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
}

.products-info h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
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

.empty-orders {
  text-align: center;
  padding: 50px 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.go-shopping-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.go-shopping-btn:hover {
  background-color: #2980b9;
}

.message {
  text-align: center;
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  color: #27ae60;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

/* 响应式设计 */
@media (max-width: 768px) {
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
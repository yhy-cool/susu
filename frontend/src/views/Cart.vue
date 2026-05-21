<template>
  <div class="cart-container">
    
    <div v-if="cartItems.length > 0" class="cart-content">
      <div class="cart-header">
        <input type="checkbox" v-model="selectAll" @change="handleSelectAll">
        <span>全选</span>
        <button @click="deleteSelected" class="delete-selected-btn">删除选中</button>
      </div>
      
      <table class="cart-table">
        <thead>
          <tr>
            <th></th>
            <th>商品图片</th>
            <th>商品名称</th>
            <th>单价</th>
            <th>数量</th>
            <th>小计</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartItems" :key="item.id">
            <td>
              <input type="checkbox" v-model="item.selected" @change="handleItemSelect">
            </td>
            <td>
              <img :src="item.image" :alt="item.name" class="product-image">
            </td>
            <td>{{ item.name }}</td>
            <td>¥{{ item.price.toFixed(2) }}</td>
            <td>
              <div class="quantity-control">
                <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">-</button>
                <input type="number" v-model.number="item.quantity" @change="updateQuantity(item)" min="1">
                <button @click="increaseQuantity(item)">+</button>
              </div>
            </td>
            <td>¥{{ (item.price * item.quantity).toFixed(2) }}</td>
            <td>
              <button @click="removeFromCart(item.id)" class="remove-btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="cart-footer">
        <div class="select-info">
          <span>已选择 {{ selectedCount }} 件商品</span>
        </div>
        <div class="total-info">
          <span class="total-label">总计：</span>
          <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="cart-actions">
          <button @click="goToProducts" class="continue-btn">继续购物</button>
          <button @click="checkout" class="checkout-btn" :disabled="selectedCount === 0">去结算</button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-cart">
      <p>购物车为空</p>
      <button @click="goToProducts" class="go-shopping-btn">去购物</button>
    </div>
    
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../api/index';

export default {
  name: 'Cart',
  data() {
    return {
      cartItems: [],
      message: '',
      selectAll: false
    };
  },
  computed: {
    totalAmount() {
      return this.cartItems.reduce((total, item) => {
        if (item.selected) {
          return total + item.price * item.quantity;
        }
        return total;
      }, 0);
    },
    selectedCount() {
      return this.cartItems.filter(item => item.selected).length;
    }
  },
  mounted() {
    this.getCart();
  },
  methods: {
    async getCart() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      const result = await api.getCart(user.id);
      if (result.success) {
        // 为每个商品添加selected属性，默认为false
        this.cartItems = result.data.map(item => ({
          ...item,
          selected: false
        }));
        this.updateSelectAll();
      } else {
        this.message = result.message;
      }
    },
    
    async removeFromCart(itemId) {
      const result = await api.deleteFromCart(itemId);
      if (result.success) {
        this.message = result.message;
        this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.updateSelectAll();
      } else {
        this.message = result.message;
      }
    },
    
    async deleteSelected() {
      const selectedItems = this.cartItems.filter(item => item.selected);
      if (selectedItems.length === 0) {
        this.message = '请先选择要删除的商品';
        return;
      }
      
      const selectedIds = selectedItems.map(item => item.id);
      
      for (const itemId of selectedIds) {
        await api.deleteFromCart(itemId);
      }
      
      this.message = '选中的商品已删除';
      this.cartItems = this.cartItems.filter(item => !item.selected);
      this.selectAll = false;
    },
    
    handleSelectAll() {
      this.cartItems.forEach(item => {
        item.selected = this.selectAll;
      });
    },
    
    handleItemSelect() {
      this.updateSelectAll();
    },
    
    updateSelectAll() {
      if (this.cartItems.length === 0) {
        this.selectAll = false;
        return;
      }
      this.selectAll = this.cartItems.every(item => item.selected);
    },
    
    increaseQuantity(item) {
      item.quantity++;
      this.updateQuantity(item);
    },
    
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.updateQuantity(item);
      }
    },
    
    async updateQuantity(item) {
      // 确保数量至少为1
      if (item.quantity < 1) {
        item.quantity = 1;
      }
      
      // 这里应该调用API更新购物车商品数量
      // 暂时使用模拟数据
      this.message = '商品数量已更新';
    },
    
    goToProducts() {
      this.$router.push('/products');
    },
    
    checkout() {
      // 将选中的购物车商品转换为订单格式
      const orderProducts = this.cartItems.filter(item => item.selected).map(item => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      if (orderProducts.length === 0) {
        this.message = '请先选择要结算的商品';
        return;
      }
      
      // 存储到localStorage，然后跳转到订单提交页面
      localStorage.setItem('orderProducts', JSON.stringify(orderProducts));
      this.$router.push('/order');
    }
  }
};
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.cart-header input[type="checkbox"] {
  margin-right: 10px;
  transform: scale(1.2);
}

.delete-selected-btn {
  margin-left: auto;
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.cart-table th,
.cart-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.cart-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.cart-table td input[type="checkbox"] {
  transform: scale(1.2);
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.remove-btn {
  padding: 5px 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.quantity-control button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control input {
  width: 60px;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.cart-footer {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 20px;
}

.select-info {
  font-size: 14px;
  color: #666;
}

.total-info {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.total-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
}

.continue-btn,
.checkout-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.continue-btn {
  background-color: #95a5a6;
  color: white;
}

.checkout-btn {
  background-color: #27ae60;
  color: white;
}

.checkout-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.empty-cart {
  text-align: center;
  padding: 50px 0;
}

.go-shopping-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
</style>
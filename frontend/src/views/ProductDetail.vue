<template>
  <div class="product-detail-container">
    <h2>商品详情</h2>
    <div v-if="product" class="product-detail">
      <div class="product-image">
        <img :src="product.image" :alt="product.name" />
      </div>
      <div class="product-info">
        <h3>{{ product.name }}</h3>
        <p class="product-price">¥{{ product.price.toFixed(2) }}/500g</p>
        <div class="product-description">
          <h4>商品简介</h4>
          <p>{{ product.description }}</p>
        </div>
        <div class="quantity-control">
          <button @click="decreaseQuantity" :disabled="quantity <= 0">-</button>
          <input 
            type="number" 
            v-model.number="quantity" 
            @input="validateQuantity" 
            min="0" 
            class="quantity-input"
          />
          <button @click="increaseQuantity">+</button>
        </div>
        <el-button type="primary" @click="addToCart" :disabled="quantity <= 0">添加到购物车</el-button>
        <el-button type="success" @click="goToOrder" :disabled="quantity <= 0">立即购买</el-button>
      </div>
    </div>
    <div v-else class="loading">
      <el-loading :fullscreen="true" text="加载中..." />
    </div>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../api/index';

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      quantity: 1,
      message: ''
    };
  },
  mounted() {
    this.getProductDetail();
  },
  methods: {
    async getProductDetail() {
      const productId = this.$route.params.id;
      const result = await api.getProduct(productId);
      if (result.success) {
        this.product = result.data;
      } else {
        this.message = result.message;
      }
    },
    increaseQuantity() {
      this.quantity = (this.quantity || 0) + 1;
    },
    decreaseQuantity() {
      if (this.quantity > 0) {
        this.quantity -= 1;
      }
    },
    validateQuantity() {
      // 确保数量为非负数
      if (this.quantity < 0) {
        this.quantity = 0;
      }
      // 清除错误信息
      this.message = '';
    },
    async addToCart() {
      if (this.quantity <= 0) {
        this.message = '请先选择商品数量';
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      const result = await api.addToCart(user.id, this.product.id, this.quantity);
      if (result.success) {
        this.message = result.message;
        // 重置商品数量
        this.quantity = 1;
      } else {
        this.message = result.message;
      }
    },
    goToOrder() {
      // 存储选中的商品到localStorage
      const selectedProducts = [{
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        quantity: this.quantity,
        image: this.product.image,
        description: this.product.description
      }];
      localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
      this.$router.push('/order');
    }
  }
};
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.product-detail {
  display: flex;
  gap: 40px;
  margin-top: 30px;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-image {
  flex: 1;
  max-width: 400px;
}

.product-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.product-info {
  flex: 2;
  min-width: 400px;
}

.product-info h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.product-price {
  font-size: 28px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 20px;
}

.product-description {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.product-description h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.product-description p {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
}

.quantity-control button {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 80px;
  text-align: center;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.quantity-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.message {
  margin-top: 15px;
  color: #e74c3c;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail {
    flex-direction: column;
    align-items: center;
  }
  
  .product-image {
    max-width: 100%;
  }
  
  .product-info {
    min-width: auto;
    width: 100%;
  }
}
</style>
<template>
  <div class="product-list-container">
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品名称或分类"
        style="width: 300px; margin-bottom: 20px;"
      />
    </div>
    <div class="product-table">
      <el-table :data="filteredProducts" style="width: 100%">

        <el-table-column label="商品图片" width="120">
          <template slot-scope="scope">
            <img 
              :src="scope.row.image" 
              :alt="scope.row.name" 
              class="product-image"
              @error="handleImageError(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" width="100">
          <template slot-scope="scope">
            <span class="product-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template slot-scope="scope">
            ¥{{ scope.row.price.toFixed(2) }}/500g
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <div class="quantity-control">
              <button @click="decreaseQuantity(scope.row)" :disabled="scope.row.quantity <= 0">-</button>
              <input 
                type="number" 
                v-model.number="scope.row.quantity" 
                @input="validateQuantity(scope.row)" 
                min="0" 
                class="quantity-input"
              />
              <button @click="increaseQuantity(scope.row)">+</button>
            </div>
            <el-button type="primary" size="small" @click="addToCart(scope.row)" :disabled="scope.row.quantity <= 0">添加到购物车</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="order-section">
      <el-button type="success" @click="goToOrder" :disabled="!hasSelectedProducts">去结算</el-button>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import { api } from '../api/index';

export default {
  name: 'ProductList',
  props: {
    category: {
      type: Object,
      default: () => ({
        type: 'vegetables',
        subType: 'all'
      })
    }
  },
  data() {
    return {
      products: [],
      message: '',
      searchKeyword: ''
    };
  },
  computed: {
    hasSelectedProducts() {
      return this.products.some(product => product.quantity > 0);
    },
    filteredProducts() {
      console.log('Category:', this.category);
      
      // 首先应用搜索关键词过滤，在整个商品数据库中搜索
      let filtered = this.products.filter(product => 
        this.searchKeyword === '' || 
        product.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
      
      // 然后应用分类过滤（如果有选择分类的话）
      if (this.category) {
        const { type, subType } = this.category;
        console.log('Filtering by type:', type, 'subType:', subType);
        
        if (type === 'vegetables') {
          if (subType === 'all') {
            // 全部蔬菜：包含所有蔬菜
            filtered = filtered.filter(product => product.category.includes('蔬菜'));
          } else if (subType === 'leaf') {
            // 叶菜类：category等于"叶菜类蔬菜"
            filtered = filtered.filter(product => product.category === '叶菜类蔬菜');
          } else if (subType === 'root') {
            // 根茎类：category等于"根茎类蔬菜"
            filtered = filtered.filter(product => product.category === '根茎类蔬菜');
          } else if (subType === 'mushroom') {
            // 菌菇类：category等于"菌菇类蔬菜"
            filtered = filtered.filter(product => product.category === '菌菇类蔬菜');
          } else if (subType === 'other') {
            // 其他蔬菜：category等于"其他蔬菜"
            filtered = filtered.filter(product => product.category === '其他蔬菜');
          }
        } else if (type === 'fruits') {
          if (subType === 'all') {
            // 全部水果：包含所有水果
            filtered = filtered.filter(product => product.category.includes('水果'));
          } else if (subType === 'citrus') {
            // 柑桔橙柚：category等于"柑桔橙柚水果"
            filtered = filtered.filter(product => product.category === '柑桔橙柚水果');
          } else if (subType === 'apple') {
            // 苹果梨桃：category等于"苹果梨桃水果"
            filtered = filtered.filter(product => product.category === '苹果梨桃水果');
          } else if (subType === 'grape') {
            // 葡提浆果：category等于"葡提浆果水果"
            filtered = filtered.filter(product => product.category === '葡提浆果水果');
          } else if (subType === 'other') {
            // 其他水果：category等于"其他水果"
            filtered = filtered.filter(product => product.category === '其他水果');
          }
        }
      }
      
      console.log('Filtered products:', filtered);
      return filtered;
    }
  },
  mounted() {
    this.getProducts();
    // 添加轮询机制，每30秒重新获取商品数据
    this.pollingInterval = setInterval(() => {
      this.getProducts();
    }, 30000);
  },
  beforeDestroy() {
    // 组件销毁时清除轮询
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },
  watch: {
    category: {
      handler(newCategory) {
        console.log('Category changed:', newCategory);
        // 当category变化时，重新计算filteredProducts
        this.$forceUpdate();
      },
      deep: true
    },
    '$route': {
      handler() {
        // 当路由变化时，重新获取商品数据
        this.getProducts();
      }
    }
  },
  methods: {
    async getProducts() {
      const result = await api.getProducts();
      if (result.success) {
        this.products = result.data.map(product => ({
          ...product,
          quantity: 0
        }));
      } else {
        this.message = result.message;
      }
    },
    increaseQuantity(product) {
      product.quantity = (product.quantity || 0) + 1;
    },
    decreaseQuantity(product) {
      if (product.quantity > 0) {
        product.quantity -= 1;
      }
    },
    
    validateQuantity(product) {
      if (product.quantity < 0) {
        product.quantity = 0;
      }
      this.message = '';
    },
    goToOrder() {
      const selectedProducts = this.products.filter(product => product.quantity > 0);
      localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
      this.$router.push('/order');
    },
    
    async addToCart(product) {
      if (product.quantity <= 0) {
        this.message = '请先选择商品数量';
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      const result = await api.addToCart(user.id, product.id, product.quantity);
      if (result.success) {
        this.message = result.message;
        product.quantity = 0;
      } else {
        this.message = result.message;
      }
    },
    
    handleImageError(product) {
      // 当图片加载失败时，使用默认图片
      product.image = '/images/苹果.jpg';
    }
  }
};
</script>

<style scoped>
.product-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  margin-bottom: 15px;
}

.product-table {
  margin-bottom: 20px;
}

/* 优化表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

:deep(.el-table__header th) {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #333;
}

:deep(.el-table__body tr:hover) {
  background-color: #f9f9f9;
}

:deep(.el-table__body tr) {
  height: 90px;
}

.product-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
}

.product-name {
  color: #333;
  font-weight: 500;
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 10px;
}

.quantity-control button {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-control button:hover {
  border-color: #3498db;
  background-color: #ecf5ff;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 50px;
  text-align: center;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.quantity-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.order-section {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.message {
  margin-top: 10px;
  color: #e74c3c;
}
</style>
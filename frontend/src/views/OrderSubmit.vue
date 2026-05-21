<template>
  <div class="order-submit-container">
    <h2>订单提交</h2>
    <div v-if="selectedProducts.length > 0" class="order-details">
      <!-- 地址选择 -->
      <div class="address-section">
        <h3>收货信息</h3>
        <div v-if="addresses.length > 0" class="address-list">
          <div v-for="address in addresses" :key="address.id" class="address-item" :class="{ 'selected': selectedAddressId === address.id }" @click="selectAddress(address.id)">
            <div class="address-header">
              <h4>{{ address.name }} {{ address.phone }}</h4>
              <span v-if="address.isDefault" class="default-tag">默认</span>
            </div>
            <div class="address-content">
              <p>{{ address.address }}</p>
            </div>
          </div>
        </div>
        <div v-else class="no-address">
          <p>您还没有添加收货信息</p>
          <button @click="goToAddresses" class="add-address-btn">添加收货信息</button>
        </div>
      </div>
      
      <!-- 配送方式选择 -->
      <div class="delivery-section">
        <h3>配送方式</h3>
        <div class="delivery-options">
          <div class="delivery-option" :class="{ 'selected': deliveryMethod === 'self' }" @click="selectDeliveryMethod('self')">
            <span class="option-radio"></span>
            <span class="option-text">自取</span>
          </div>
          <div class="delivery-option" :class="{ 'selected': deliveryMethod === 'delivery' }" @click="selectDeliveryMethod('delivery')">
            <span class="option-radio"></span>
            <span class="option-text">配送上门</span>
          </div>
        </div>
      </div>
      
      <!-- 配送时间选择 -->
      <div v-if="deliveryMethod === 'delivery'" class="delivery-time-section">
        <h3>配送时间</h3>
        <div class="delivery-time-picker">
          <el-date-picker
            v-model="deliveryTime"
            type="datetime"
            placeholder="选择配送时间"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
            style="width: 100%;"
          />
        </div>
      </div>
      
      <!-- 商品详情 -->
      <div class="products-section">
        <h3>商品详情</h3>
        <table class="order-table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>单价</th>
              <th>数量</th>
              <th>小计</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in selectedProducts" :key="product.id">
              <td>{{ product.name }}</td>
              <td>¥{{ product.price.toFixed(2) }}</td>
              <td>{{ product.quantity }}</td>
              <td>¥{{ (product.price * product.quantity).toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">总计</td>
              <td>¥{{ totalAmount.toFixed(2) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <button @click="submitOrder" class="submit-btn" :disabled="!selectedAddressId">提交订单</button>
    </div>
    <div v-else class="empty-order">
      <p>您还没有选择商品</p>
      <button @click="goBack" class="back-btn">返回商品列表</button>
    </div>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../api/index';

export default {
  name: 'OrderSubmit',
  data() {
    return {
      selectedProducts: [],
      message: '',
      addresses: [],
      selectedAddressId: null,
      deliveryMethod: 'self', // self: 自取, delivery: 配送上门
      deliveryTime: '',
      pickerOptions: {
        disabledDate(time) {
          // 禁用过去的日期
          return time.getTime() < Date.now() - 8.64e7;
        },
        selectableRange: '09:00:00 - 20:00:00' // 限制选择时间范围
      }
    };
  },
  computed: {
    totalAmount() {
      return this.selectedProducts.reduce((total, product) => {
        return total + product.price * product.quantity;
      }, 0);
    },
    selectedAddress() {
      return this.addresses.find(address => address.id === this.selectedAddressId) || null;
    }
  },
  mounted() {
    this.loadSelectedProducts();
    this.loadAddresses();
  },
  methods: {
    loadSelectedProducts() {
      // 先尝试从orderProducts中加载（来自购物车）
      let products = localStorage.getItem('orderProducts');
      // 如果没有，再尝试从selectedProducts中加载（来自商品列表）
      if (!products) {
        products = localStorage.getItem('selectedProducts');
      }
      if (products) {
        this.selectedProducts = JSON.parse(products);
      }
    },
    async loadAddresses() {
      const user = localStorage.getItem('user');
      if (!user) {
        return;
      }
      
      const userId = JSON.parse(user).id;
      const result = await api.getAddresses(userId);
      if (result.success) {
        this.addresses = result.data;
        // 自动选择默认地址
        const defaultAddress = this.addresses.find(address => address.isDefault);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
        } else if (this.addresses.length > 0) {
          // 如果没有默认地址，选择第一个地址
          this.selectedAddressId = this.addresses[0].id;
        }
      }
    },
    selectAddress(addressId) {
      this.selectedAddressId = addressId;
    },
    selectDeliveryMethod(method) {
      this.deliveryMethod = method;
    },
    goToAddresses() {
      this.$router.push('/addresses');
    },
    async submitOrder() {
      const user = localStorage.getItem('user');
      if (!user) {
        this.message = '请先登录';
        setTimeout(() => {
          this.$router.push('/');
        }, 1000);
        return;
      }
      
      if (!this.selectedAddressId) {
        this.message = '请选择收货信息';
        return;
      }
      
      const userId = JSON.parse(user).id;
      const address = this.selectedAddress;
      
      try {
        const result = await api.submitOrder(userId, this.selectedProducts, {
          customerName: address.name,
          customerPhone: address.phone,
          customerAddress: address.address,
          deliveryMethod: this.deliveryMethod,
          deliveryTime: this.deliveryTime
        });
        if (result.success) {
          this.message = `订单提交成功！订单号: ${result.orderId}`;
          // 清空选中的商品
          localStorage.removeItem('selectedProducts');
          localStorage.removeItem('orderProducts');
          // 清空购物车
          await api.clearCart(userId);
          // 跳转到商品列表页
          setTimeout(() => {
            this.$router.push('/products');
          }, 2000);
        } else {
          this.message = result.message;
        }
      } catch (error) {
        this.message = '订单提交失败，请重试';
        console.error('提交订单失败:', error);
      }
    },
    goBack() {
      this.$router.push('/products');
    }
  }
};
</script>

<style scoped>
.order-submit-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.order-details {
  margin-bottom: 30px;
}

.address-section,
.delivery-section,
.delivery-time-section,
.products-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.address-section h3,
.delivery-section h3,
.delivery-time-section h3,
.products-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #555;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.delivery-options {
  display: flex;
  gap: 30px;
}

.delivery-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  transition: all 0.3s;
}

.delivery-option:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delivery-option.selected {
  border-color: #4CAF50;
  background-color: #f0f9ff;
  color: #4CAF50;
}

.option-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  position: relative;
}

.delivery-option.selected .option-radio {
  border-color: #4CAF50;
}

.delivery-option.selected .option-radio::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #4CAF50;
  border-radius: 50%;
}

.option-text {
  font-size: 16px;
  font-weight: 500;
}

.delivery-time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.delivery-option {
  padding: 10px 20px;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.delivery-option:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delivery-option.selected {
  border-color: #4CAF50;
  background-color: #f0f9ff;
  color: #4CAF50;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.address-item.selected {
  border-color: #4CAF50;
  background-color: #f0f9ff;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.address-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.default-tag {
  background-color: #e74c3c;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.address-content {
  margin-bottom: 10px;
}

.address-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.no-address {
  text-align: center;
  padding: 30px 0;
  background-color: white;
  border-radius: 8px;
  border: 1px dashed #e9ecef;
}

.no-address p {
  margin: 0 0 20px 0;
  color: #666;
}

.add-address-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.add-address-btn:hover {
  background-color: #45a049;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.order-table th,
.order-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.order-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #555;
}

.order-table tfoot {
  font-weight: bold;
  background-color: #f8f9fa;
}

.submit-btn {
  display: block;
  margin: 0 auto;
  padding: 12px 30px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #219a52;
}

.submit-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.empty-order {
  text-align: center;
  padding: 50px 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.back-btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 20px;
}

.back-btn:hover {
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
</style>
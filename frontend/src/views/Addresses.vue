<template>
  <div class="addresses-container">
    <h2>收货信息管理</h2>
    <div class="address-actions">
      <button @click="showAddModal = true" class="add-address-btn">添加收货信息</button>
    </div>
    
    <div class="address-list">
      <div v-for="address in addresses" :key="address.id" class="address-item">
        <div class="address-header">
          <h4>{{ address.name }} {{ address.phone }}</h4>
          <span v-if="address.isDefault" class="default-tag">默认</span>
        </div>
        <div class="address-content">
          <p>{{ address.address }}</p>
        </div>
        <div class="address-operations">
          <button @click="editAddress(address)" class="edit-btn">修改</button>
          <button @click="deleteAddress(address.id)" class="delete-btn">删除</button>
          <button v-if="!address.isDefault" @click="setDefault(address.id)" class="default-btn">设为默认</button>
        </div>
      </div>
    </div>
    
    <!-- 添加/修改地址模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ showAddModal ? '添加收货信息' : '修改收货信息' }}</h3>
        <div class="form-group">
          <label>收货人</label>
          <input type="text" v-model="addressForm.name" placeholder="请输入收货人姓名">
        </div>
        <div class="form-group">
          <label>手机号</label>
          <input type="tel" v-model="addressForm.phone" placeholder="请输入手机号">
        </div>
        <div class="form-group">
          <label>详细地址</label>
          <textarea v-model="addressForm.address" placeholder="请输入详细地址"></textarea>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="addressForm.isDefault">
            设为默认收货信息
          </label>
        </div>
        <div class="modal-buttons">
          <button @click="cancelModal" class="cancel-btn">取消</button>
          <button @click="submitAddress" class="submit-btn">{{ showAddModal ? '添加' : '修改' }}</button>
        </div>
      </div>
    </div>
    
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../api/index';

export default {
  name: 'Addresses',
  data() {
    return {
      addresses: [],
      showAddModal: false,
      showEditModal: false,
      addressForm: {
        name: '',
        phone: '',
        address: '',
        isDefault: false
      },
      currentAddressId: null,
      message: ''
    };
  },
  mounted() {
    this.getAddresses();
  },
  methods: {
    async getAddresses() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      const result = await api.getAddresses(user.id);
      if (result.success) {
        this.addresses = result.data;
      } else {
        this.message = result.message;
      }
    },
    
    editAddress(address) {
      this.addressForm = {
        name: address.name,
        phone: address.phone,
        address: address.address,
        isDefault: address.isDefault
      };
      this.currentAddressId = address.id;
      this.showEditModal = true;
    },
    
    async deleteAddress(id) {
      if (confirm('确定要删除这个地址吗？')) {
        const result = await api.deleteAddress(id);
        if (result.success) {
          this.message = result.message;
          this.getAddresses();
        } else {
          this.message = result.message;
        }
      }
    },
    
    async setDefault(id) {
      const address = this.addresses.find(a => a.id === id);
      if (address) {
        const result = await api.updateAddress(id, address.name, address.phone, address.address, true);
        if (result.success) {
          this.message = '地址已设为默认';
          this.getAddresses();
        } else {
          this.message = result.message;
        }
      }
    },
    
    cancelModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.addressForm = {
        name: '',
        phone: '',
        address: '',
        isDefault: false
      };
      this.currentAddressId = null;
    },
    
    async submitAddress() {
      if (!this.addressForm.name || !this.addressForm.phone || !this.addressForm.address) {
        this.message = '请填写完整的地址信息';
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      if (this.showAddModal) {
        const result = await api.addAddress(user.id, this.addressForm.name, this.addressForm.phone, this.addressForm.address, this.addressForm.isDefault);
        if (result.success) {
          this.message = result.message;
          this.getAddresses();
          this.cancelModal();
        } else {
          this.message = result.message;
        }
      } else if (this.showEditModal) {
        const result = await api.updateAddress(this.currentAddressId, this.addressForm.name, this.addressForm.phone, this.addressForm.address, this.addressForm.isDefault);
        if (result.success) {
          this.message = result.message;
          this.getAddresses();
          this.cancelModal();
        } else {
          this.message = result.message;
        }
      }
    }
  }
};
</script>

<style scoped>
.addresses-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.address-actions {
  margin-bottom: 20px;
  text-align: right;
}

.add-btn {
  padding: 10px 20px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.address-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  position: relative;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.address-header h3 {
  margin: 0;
  font-size: 16px;
}

.default-tag {
  background-color: #e74c3c;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.address-content {
  margin-bottom: 15px;
}

.address-content p {
  margin: 0;
  color: #666;
}

.address-operations {
  display: flex;
  gap: 10px;
}

.edit-btn,
.delete-btn,
.default-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.default-btn {
  background-color: #f39c12;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-weight: normal;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.submit-btn {
  background-color: #27ae60;
  color: white;
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
</style>
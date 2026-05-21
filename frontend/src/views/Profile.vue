<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人中心</h2>
    </div>
    
    <div class="profile-content">
      <!-- 个人信息 -->
      <div class="profile-section">
        <h3>个人信息</h3>
        <div class="info-item">
          <label>用户名</label>
          <span>{{ user ? user.username : '' }}</span>
        </div>
        <div class="info-item">
          <label>用户类型</label>
          <span>{{ user ? (user.type === 'admin' ? '管理员' : '普通用户') : '' }}</span>
        </div>
        <div class="info-item">
          <label>账号状态</label>
          <span>{{ user ? (user.status === 'active' ? '正常' : '冻结') : '' }}</span>
        </div>
        <button @click="showEditProfileModal = true" class="edit-profile-btn">修改个人信息</button>
      </div>
      
      <!-- 修改个人信息模态框 -->
      <div v-if="showEditProfileModal" class="modal-overlay">
        <div class="modal-content">
          <h3>修改个人信息</h3>
          <div class="form-group">
            <label>昵称</label>
            <input type="text" v-model="profileForm.nickname" placeholder="请输入昵称">
          </div>
          <div class="form-group">
            <label>电话</label>
            <input type="tel" v-model="profileForm.phone" placeholder="请输入电话">
          </div>
          <div class="modal-buttons">
            <button @click="showEditProfileModal = false" class="cancel-btn">取消</button>
            <button @click="updateProfile" class="submit-btn">确认修改</button>
          </div>
        </div>
      </div>
      
      <!-- 修改密码 -->
      <div class="profile-section">
        <h3>修改密码</h3>
        <div class="form-group">
          <label>旧密码</label>
          <input type="password" v-model="passwordForm.oldPassword" placeholder="请输入旧密码">
        </div>
        <div class="form-group">
          <label>新密码</label>
          <input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码">
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <input type="password" v-model="passwordForm.confirmPassword" placeholder="请确认新密码">
        </div>
        <button @click="changePassword" class="submit-btn">修改密码</button>
      </div>
      
      <!-- 收货信息管理 -->
      <div class="profile-section">
        <div class="section-header">
          <h3>收货信息</h3>
          <button @click="showAddAddressModal = true" class="add-btn">添加收货信息</button>
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
      </div>
    </div>
    
    <!-- 添加/修改收货信息模态框 -->
    <div v-if="showAddAddressModal || showEditAddressModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ showAddAddressModal ? '添加收货信息' : '修改收货信息' }}</h3>
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
          <button @click="cancelAddressModal" class="cancel-btn">取消</button>
          <button @click="submitAddress" class="submit-btn">{{ showAddAddressModal ? '添加' : '修改' }}</button>
        </div>
      </div>
    </div>
    
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../api/index';

export default {
  name: 'Profile',
  data() {
    return {
      user: null,
      addresses: [],
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      profileForm: {
        nickname: '',
        phone: ''
      },
      addressForm: {
        name: '',
        phone: '',
        address: '',
        isDefault: false
      },
      showAddAddressModal: false,
      showEditAddressModal: false,
      showEditProfileModal: false,
      currentAddressId: null,
      message: ''
    };
  },
  mounted() {
    this.getUserInfo();
    this.getAddresses();
  },
  methods: {
    getUserInfo() {
      const user = JSON.parse(localStorage.getItem('user'));
      this.user = user;
    },
    
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
    
    async changePassword() {
      if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
        this.message = '请填写完整的密码信息';
        return;
      }
      
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.message = '两次输入的新密码不一致';
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      const result = await api.changePassword(user.id, this.passwordForm.oldPassword, this.passwordForm.newPassword);
      if (result.success) {
        this.message = result.message;
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } else {
        this.message = result.message;
      }
    },
    
    showAddModal() {
      this.showAddAddressModal = true;
      this.addressForm = {
        name: '',
        phone: '',
        address: '',
        isDefault: false
      };
    },
    
    editAddress(address) {
      this.addressForm = {
        name: address.name,
        phone: address.phone,
        address: address.address,
        isDefault: address.isDefault
      };
      this.currentAddressId = address.id;
      this.showEditAddressModal = true;
    },
    
    async deleteAddress(id) {
      if (confirm('确定要删除这个收货信息吗？')) {
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
          this.message = '收货信息已设为默认';
          this.getAddresses();
        } else {
          this.message = result.message;
        }
      }
    },
    
    cancelAddressModal() {
      this.showAddAddressModal = false;
      this.showEditAddressModal = false;
      this.currentAddressId = null;
      this.addressForm = {
        name: '',
        phone: '',
        address: '',
        isDefault: false
      };
    },
    
    async submitAddress() {
      if (!this.addressForm.name || !this.addressForm.phone || !this.addressForm.address) {
        this.message = '请填写完整的收货信息';
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      if (this.showAddAddressModal) {
        const result = await api.addAddress(user.id, this.addressForm.name, this.addressForm.phone, this.addressForm.address, this.addressForm.isDefault);
        if (result.success) {
          this.message = result.message;
          this.getAddresses();
          this.cancelAddressModal();
        } else {
          this.message = result.message;
        }
      } else if (this.showEditAddressModal) {
        const result = await api.updateAddress(this.currentAddressId, this.addressForm.name, this.addressForm.phone, this.addressForm.address, this.addressForm.isDefault);
        if (result.success) {
          this.message = result.message;
          this.getAddresses();
          this.cancelAddressModal();
        } else {
          this.message = result.message;
        }
      }
    },
    
    async updateProfile() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        this.$router.push('/');
        return;
      }
      
      const result = await api.updateProfile(user.id, this.profileForm.nickname, this.profileForm.phone);
      if (result.success) {
        this.message = result.message;
        this.showEditProfileModal = false;
      } else {
        this.message = result.message;
      }
    }
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-header h2 {
  margin: 0;
  color: #333;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #555;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  color: #555;
  border-bottom: none;
}

.add-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
}

.info-item label {
  width: 100px;
  font-weight: 500;
  color: #666;
}

.info-item span {
  flex: 1;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #666;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
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
  position: relative;
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
  margin-bottom: 15px;
}

.address-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
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

.edit-profile-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.edit-profile-btn:hover {
  background-color: #2980b9;
  transition: background-color 0.3s;
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

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
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
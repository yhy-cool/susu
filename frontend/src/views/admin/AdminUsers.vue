<template>
  <div class="admin-users-container">
    <h2>用户管理</h2>
    <div class="admin-header">
      <button @click="showAddUserModal = true" class="add-user-btn">添加用户</button>
    </div>
    
    <table class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>用户类型</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.type === 'admin' ? '管理员' : '普通用户' }}</td>
          <td>{{ user.status === 'active' ? '正常' : '冻结' }}</td>
          <td>
            <button @click="showPasswordModal(user)" class="password-btn">修改密码</button>
            <button @click="toggleUserStatus(user)" class="status-btn">
              {{ user.status === 'active' ? '冻结' : '解冻' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- 修改密码模态框 -->
    <div v-if="showPasswordModalVisible" class="modal-overlay">
      <div class="modal-content">
        <h3>修改密码</h3>
        <div class="form-group">
          <label>用户名</label>
          <input type="text" :value="currentUser ? currentUser.username : ''" disabled>
        </div>
        <div class="form-group">
          <label>新密码</label>
          <input type="password" v-model="newPassword" placeholder="请输入新密码">
        </div>
        <div class="modal-buttons">
          <button @click="showPasswordModalVisible = false" class="cancel-btn">取消</button>
          <button @click="updatePassword" class="submit-btn">确认修改</button>
        </div>
      </div>
    </div>
    
    <!-- 添加用户模态框 -->
    <div v-if="showAddUserModal" class="modal-overlay">
      <div class="modal-content">
        <h3>添加用户</h3>
        <div class="form-group">
          <label>用户名</label>
          <input type="text" v-model="newUser.username" placeholder="请输入用户名">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="newUser.password" placeholder="请输入密码">
        </div>
        <div class="form-group">
          <label>用户类型</label>
          <select v-model="newUser.type" class="user-type-select">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="modal-buttons">
          <button @click="showAddUserModal = false" class="cancel-btn">取消</button>
          <button @click="addUser" class="submit-btn">确认添加</button>
        </div>
      </div>
    </div>
    
    <p v-if="users.length === 0" class="empty-message">暂无用户</p>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../../api/index';

export default {
  name: 'AdminUsers',
  data() {
    return {
      users: [],
      showPasswordModalVisible: false,
      showAddUserModal: false,
      currentUser: null,
      newPassword: '',
      newUser: {
        username: '',
        password: '',
        type: 'user'
      },
      message: ''
    };
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      const result = await api.getUsers();
      if (result.success) {
        this.users = result.data;
      } else {
        this.message = result.message;
      }
    },
    
    showPasswordModal(user) {
      this.currentUser = user;
      this.newPassword = '';
      this.showPasswordModalVisible = true;
    },
    
    async updatePassword() {
      if (!this.newPassword) {
        this.message = '请输入新密码';
        return;
      }
      
      const result = await api.updateUserPassword(this.currentUser.id, this.newPassword);
      if (result.success) {
        this.message = result.message;
        this.showPasswordModalVisible = false;
        this.getUsers();
      } else {
        this.message = result.message;
      }
    },
    
    async toggleUserStatus(user) {
      const newStatus = user.status === 'active' ? 'frozen' : 'active';
      const result = await api.updateUserStatus(user.id, newStatus);
      if (result.success) {
        this.message = result.message;
        this.getUsers();
      } else {
        this.message = result.message;
      }
    },
    
    async addUser() {
      if (!this.newUser.username || !this.newUser.password) {
        this.message = '请填写完整的用户信息';
        return;
      }
      
      const result = await api.addUser(this.newUser);
      if (result.success) {
        this.message = result.message;
        this.getUsers();
        this.showAddUserModal = false;
        this.newUser = {
          username: '',
          password: '',
          type: 'user'
        };
      } else {
        this.message = result.message;
      }
    }
  }
};
</script>

<style scoped>
.admin-users-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.password-btn,
.status-btn {
  padding: 5px 10px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.password-btn {
  background-color: #3498db;
  color: white;
}

.status-btn {
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
  max-height: 80vh;
  overflow-y: auto;
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

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.admin-header {
  margin-bottom: 20px;
  text-align: right;
}

.add-user-btn {
  padding: 10px 20px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.add-user-btn:hover {
  background-color: #219a52;
  transition: background-color 0.3s;
}

.user-type-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.user-type-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}
</style>
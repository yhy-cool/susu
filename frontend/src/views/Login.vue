<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <div slot="header" class="login-header">
        <div class="logo">🛍️</div>
        <h2>蓝月亮小区果蔬预定系统</h2>
        <p class="login-subtitle">便捷、新鲜、优质的果蔬配送服务</p>
      </div>
      <div class="login-form">
        <el-radio-group v-model="loginType" class="login-type">
          <el-radio-button label="user">用户登录</el-radio-button>
          <el-radio-button label="admin">管理员登录</el-radio-button>
        </el-radio-group>
        <el-form :model="loginForm" class="login-form" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" maxlength="20" show-password></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" class="login-btn" style="width: 100%;">登录</el-button>
          </el-form-item>
        </el-form>
        <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon class="error-msg"></el-alert>
        <el-card class="login-hint" shadow="hover">
          <div slot="header" class="hint-header">
            <span class="hint-icon">💡</span>
            <span>测试账号</span>
          </div>
          <div class="hint-content">
            <div class="hint-item">
              <span class="hint-label">用户：</span>
              <span class="hint-value">test / 123456</span>
            </div>
            <div class="hint-item">
              <span class="hint-label">管理员：</span>
              <span class="hint-value">admin / admin123</span>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { api } from '../api/index';

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      errorMsg: '',
      loginType: 'user'
    };
  },
  methods: {
    async handleLogin() {
      if (!this.loginForm.username || !this.loginForm.password) {
        this.errorMsg = '请输入用户名和密码';
        return;
      }
      
      const result = await api.login(this.loginForm.username, this.loginForm.password);
      if (result.success) {
        // 登录成功，存储用户信息
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // 根据用户类型跳转到不同页面
        if (result.user.type === 'admin') {
          this.$router.push('/admin/products');
        } else {
          this.$router.push('/products');
        }
      } else {
        this.errorMsg = result.message;
      }
    }
  }
};
</script>

<style scoped>
/* 登录容器 */
.login-container {
  width: 100vw;
  height: 100vh;
  background-image: url('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruits%20and%20vegetables%20market%20background&image_size=landscape_16_9');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 背景渐变覆盖层 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(25, 118, 210, 0.3));
  backdrop-filter: blur(5px);
  z-index: 1;
}

/* 登录卡片 */
.login-card {
  max-width: 420px;
  width: 90%;
  margin: 0 auto;
  z-index: 2;
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  font-size: 48px;
  margin-bottom: 15px;
}

.login-header h2 {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
}

.login-subtitle {
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 400;
}

/* 登录类型选择 */
.login-type {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

/* 登录表单 */
.login-form {
  margin-bottom: 20px;
}

/* 错误消息 */
.error-msg {
  margin-top: 15px;
  margin-bottom: 15px;
}

/* 登录提示 */
.login-hint {
  margin-top: 20px;
}

.hint-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-icon {
  font-size: 16px;
  color: #3498db;
}

.hint-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.hint-item:last-child {
  border-bottom: none;
}

.hint-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
  min-width: 60px;
}

.hint-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
  flex: 1;
}
</style>
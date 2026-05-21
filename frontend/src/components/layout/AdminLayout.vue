<template>
  <div class="admin-layout">
    <!-- 侧边导航栏 -->
    <aside class="aside">
      <div class="aside-header">
        <h2>管理员后台</h2>
      </div>
      <nav class="nav-menu">
        <!-- 商品管理菜单 -->
        <div class="nav-item">
          <a @click="navigateTo('/admin/products')" class="nav-item-header">
            <span class="nav-icon">📦</span>
            <span class="nav-title">商品管理</span>
          </a>
        </div>
        
        <!-- 用户管理菜单 -->
        <div class="nav-item">
          <a @click="navigateTo('/admin/users')" class="nav-item-header">
            <span class="nav-icon">👥</span>
            <span class="nav-title">用户管理</span>
          </a>
        </div>
        
        <!-- 订单管理菜单 -->
        <div class="nav-item">
          <a @click="navigateTo('/admin/orders')" class="nav-item-header">
            <span class="nav-icon">📋</span>
            <span class="nav-title">订单管理</span>
          </a>
        </div>
      </nav>
    </aside>
    
    <!-- 主内容区域 -->
    <main class="main">
      <div class="main-header">
        <h1>{{ currentTitle }}</h1>
      </div>
      <div class="main-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  data() {
    return {
      currentTitle: '商品管理'
    };
  },
  methods: {
    navigateTo(path) {
      // 检查当前路由是否与目标路由相同，避免重复导航错误
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
      // 更新当前标题
      this.updateTitle(path);
    },
    updateTitle(path) {
      if (path.includes('/admin/products')) {
        this.currentTitle = '商品管理';
      } else if (path.includes('/admin/users')) {
        this.currentTitle = '用户管理';
      } else if (path.includes('/admin/orders')) {
        this.currentTitle = '订单管理';
      } else {
        this.currentTitle = '管理员后台';
      }
    }
  },
  mounted() {
    // 初始化当前标题
    this.updateTitle(this.$route.path);
  },
  watch: {
    // 监听路由变化，更新标题
    '$route.path': function(newPath) {
      this.updateTitle(newPath);
    }
  }
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 侧边导航栏 */
.aside {
  width: 200px;
  background-color: #343a40;
  color: white;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.aside-header {
  padding: 20px;
  border-bottom: 1px solid #495057;
  text-align: center;
}

.aside-header h2 {
  margin: 0;
  color: #4CAF50;
  font-size: 18px;
}

.nav-menu {
  flex: 1;
  padding: 10px 0;
}

.nav-item {
  margin-bottom: 5px;
}

.nav-item-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-left: 3px solid transparent;
  text-decoration: none;
  color: white;
}

.nav-item-header:hover {
  background-color: #495057;
  border-left-color: #4CAF50;
}

.nav-icon {
  font-size: 18px;
  margin-right: 10px;
}

.nav-title {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
}

/* 主内容区域 */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  padding: 20px 30px;
  border-bottom: 1px solid #e9ecef;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: #f8f9fa;
}
</style>
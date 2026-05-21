<template>
  <div class="user-layout">
    <!-- 侧边导航栏 -->
    <aside class="aside">
      <div class="aside-header">
        <h2>蓝月亮果蔬</h2>
      </div>
      <nav class="nav-menu">
        <!-- 商品菜单 -->
        <div class="nav-item">
          <div @click="toggleMenu('products')" class="nav-item-header">
            <span class="nav-icon">🛍️</span>
            <span class="nav-title">商品</span>
            <span class="nav-arrow">{{ expandedMenu === 'products' ? '▼' : '▶' }}</span>
          </div>
          <div v-if="expandedMenu === 'products'" class="nav-submenu">
            <!-- 蔬菜分类 -->
            <div class="nav-subitem">
              <div @click="toggleSubMenu('vegetables')" class="nav-subitem-header">
                <span class="nav-subtitle">蔬菜</span>
                <span class="nav-arrow">{{ expandedSubMenu === 'vegetables' ? '▼' : '▶' }}</span>
              </div>
              <div v-if="expandedSubMenu === 'vegetables'" class="nav-subsubmenu">
                <a @click.prevent="selectCategory('vegetables', 'all')" class="nav-subsubitem">全部蔬菜</a>
                <a @click.prevent="selectCategory('vegetables', 'leaf')" class="nav-subsubitem">叶菜类</a>
                <a @click.prevent="selectCategory('vegetables', 'root')" class="nav-subsubitem">根茎类</a>
                <a @click.prevent="selectCategory('vegetables', 'mushroom')" class="nav-subsubitem">菌菇类</a>
                <a @click.prevent="selectCategory('vegetables', 'other')" class="nav-subsubitem">其他</a>
              </div>
            </div>
            <!-- 水果分类 -->
            <div class="nav-subitem">
              <div @click="toggleSubMenu('fruits')" class="nav-subitem-header">
                <span class="nav-subtitle">水果</span>
                <span class="nav-arrow">{{ expandedSubMenu === 'fruits' ? '▼' : '▶' }}</span>
              </div>
              <div v-if="expandedSubMenu === 'fruits'" class="nav-subsubmenu">
                <a @click.prevent="selectCategory('fruits', 'all')" class="nav-subsubitem">全部水果</a>
                <a @click.prevent="selectCategory('fruits', 'citrus')" class="nav-subsubitem">柑桔橙柚</a>
                <a @click.prevent="selectCategory('fruits', 'apple')" class="nav-subsubitem">苹果梨桃</a>
                <a @click.prevent="selectCategory('fruits', 'grape')" class="nav-subsubitem">葡提浆果</a>
                <a @click.prevent="selectCategory('fruits', 'other')" class="nav-subsubitem">其他</a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 购物车菜单 -->
        <div class="nav-item">
          <a @click="navigateTo('/cart')" class="nav-item-header">
            <span class="nav-icon">🛒</span>
            <span class="nav-title">购物车</span>
          </a>
        </div>
        
        <!-- 我的菜单 -->
        <div class="nav-item">
          <div @click="toggleMenu('profile')" class="nav-item-header">
            <span class="nav-icon">👤</span>
            <span class="nav-title">我的</span>
            <span class="nav-arrow">{{ expandedMenu === 'profile' ? '▼' : '▶' }}</span>
          </div>
          <div v-if="expandedMenu === 'profile'" class="nav-submenu">
            <a @click="navigateTo('/profile')" class="nav-subitem">个人中心</a>
            <a @click="navigateTo('/orders')" class="nav-subitem">我的订单</a>
            <a @click="navigateTo('/addresses')" class="nav-subitem">收货信息</a>
          </div>
        </div>
      </nav>
    </aside>
    
    <!-- 主内容区域 -->
    <main class="main">
      <div class="main-header">
        <h1>{{ currentTitle }}</h1>
      </div>
      <div class="main-content">
        <ProductList v-if="$route.path === '/products'" :category="currentCategory" />
        <Cart v-else-if="$route.path === '/cart'" />
        <Profile v-else-if="$route.path === '/profile'" />
        <UserOrders v-else-if="$route.path === '/orders'" />
        <Addresses v-else-if="$route.path === '/addresses'" />
        <OrderSubmit v-else-if="$route.path === '/order'" />
      </div>
    </main>
  </div>
</template>

<script>
import ProductList from '../../views/ProductList.vue';
import Cart from '../../views/Cart.vue';
import Profile from '../../views/Profile.vue';
import UserOrders from '../../views/UserOrders.vue';
import Addresses from '../../views/Addresses.vue';
import OrderSubmit from '../../views/OrderSubmit.vue';

export default {
  name: 'UserLayout',
  components: {
    ProductList,
    Cart,
    Profile,
    UserOrders,
    Addresses,
    OrderSubmit
  },
  data() {
    return {
      expandedMenu: '',
      expandedSubMenu: '',
      currentTitle: '商品列表',
      currentCategory: null
    };
  },
  methods: {
    toggleMenu(menu) {
      this.expandedMenu = this.expandedMenu === menu ? '' : menu;
    },
    toggleSubMenu(subMenu) {
      this.expandedSubMenu = this.expandedSubMenu === subMenu ? '' : subMenu;
    },
    selectCategory(type, subType) {
      console.log('Selecting category:', type, subType);
      this.currentCategory = { type, subType };
      // 触发分类选择事件，通知父组件或路由
      this.$emit('category-change', this.currentCategory);
      // 更新当前标题
      this.updateTitle(type, subType);
      // 确保路由是在/products页面
      if (this.$route.path !== '/products') {
        this.$router.push('/products');
      }
      console.log('Updated currentCategory:', this.currentCategory);
      console.log('Current route:', this.$route.path);
    },
    navigateTo(path) {
      console.log('Navigating to:', path);
      // 直接跳转，不检查当前路由
      this.$router.push(path);
      // 更新当前标题
      this.updateTitleByPath(path);
    },
    updateTitle(type, subType) {
      if (type === 'vegetables') {
        switch (subType) {
          case 'all':
            this.currentTitle = '全部蔬菜';
            break;
          case 'leaf':
            this.currentTitle = '叶菜类';
            break;
          case 'root':
            this.currentTitle = '根茎类';
            break;
          case 'mushroom':
            this.currentTitle = '菌菇类';
            break;
          case 'other':
            this.currentTitle = '其他蔬菜';
            break;
        }
      } else if (type === 'fruits') {
        switch (subType) {
          case 'all':
            this.currentTitle = '全部水果';
            break;
          case 'citrus':
            this.currentTitle = '柑桔橙柚';
            break;
          case 'apple':
            this.currentTitle = '苹果梨桃';
            break;
          case 'grape':
            this.currentTitle = '葡提浆果';
            break;
          case 'other':
            this.currentTitle = '其他水果';
            break;
        }
      }
    },
    updateTitleByPath(path) {
      if (path === '/cart') {
        this.currentTitle = '购物车';
      } else if (path === '/profile') {
        this.currentTitle = '个人中心';
      } else if (path === '/orders') {
        this.currentTitle = '我的订单';
      } else if (path === '/addresses') {
        this.currentTitle = '收货信息';
      } else if (path === '/order') {
        this.currentTitle = '订单提交';
      } else {
        this.currentTitle = '商品列表';
      }
    }
  }
};
</script>

<style scoped>
.user-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 侧边导航栏 */
.aside {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.aside-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
}

.aside-header h2 {
  margin: 0;
  color: #4CAF50;
  font-size: 20px;
}

.nav-menu {
  flex: 1;
  padding: 10px 0;
}

.nav-item {
  margin-bottom: 10px;
}

.nav-item-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-left: 3px solid transparent;
}

.nav-item-header:hover {
  background-color: #e9ecef;
}

.nav-icon {
  font-size: 18px;
  margin-right: 10px;
}

.nav-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.nav-arrow {
  font-size: 12px;
  color: #666;
}

.nav-submenu {
  background-color: #f1f3f5;
}

.nav-subitem {
  margin-left: 10px;
  border-left: 1px solid #dee2e6;
}

.nav-subitem-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-subitem-header:hover {
  background-color: #e9ecef;
}

.nav-subtitle {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.nav-subsubmenu {
  background-color: #e9ecef;
  padding-left: 15px;
}

.nav-subsubitem {
  display: block;
  padding: 8px 15px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-subsubitem:hover {
  background-color: #dee2e6;
  color: #4CAF50;
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
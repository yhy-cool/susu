import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import ProductList from '../views/ProductList.vue'
import OrderSubmit from '../views/OrderSubmit.vue'
import UserLayout from '../components/layout/UserLayout.vue'
import AdminLayout from '../components/layout/AdminLayout.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: UserLayout,
    children: [
      {
        path: 'products',
        name: 'ProductList',
        component: ProductList,
        props: true
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue')
      },
      {
        path: 'order',
        name: 'OrderSubmit',
        component: OrderSubmit
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('../views/Cart.vue')
      },
      {
        path: 'addresses',
        name: 'Addresses',
        component: () => import('../views/Addresses.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue')
      },
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('../views/UserOrders.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/AdminProducts.vue')
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrders.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/AdminUsers.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
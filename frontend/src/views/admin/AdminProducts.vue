<template>
  <div class="admin-products-container">
    <h2>商品管理</h2>
    <div class="admin-header">
      <button @click="showAddModal = true" class="add-btn">添加商品</button>
    </div>
    
    <table class="products-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>商品名称</th>
          <th>价格</th>
          <th>分类</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.id }}</td>
          <td>{{ product.name }}</td>
          <td>¥{{ product.price.toFixed(2) }}</td>
          <td>{{ product.category }}</td>
          <td>
            <button @click="editProduct(product)" class="edit-btn">修改</button>
            <button @click="deleteProduct(product.id)" class="delete-btn">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- 添加/修改商品模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ showAddModal ? '添加商品' : '修改商品' }}</h3>
        <div class="form-group">
          <label>商品名称</label>
          <input type="text" v-model="formData.name" placeholder="请输入商品名称">
        </div>
        <div class="form-group">
          <label>价格</label>
          <input type="number" v-model="formData.price" placeholder="请输入价格" step="0.01">
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="formData.category" class="category-select">
            <option value="">请选择分类</option>
            <optgroup label="蔬菜">
              <option value="叶菜类蔬菜">叶菜类</option>
              <option value="根茎类蔬菜">根茎类</option>
              <option value="菌菇类蔬菜">菌菇类</option>
              <option value="其他蔬菜">其他</option>
            </optgroup>
            <optgroup label="水果">
              <option value="柑桔橙柚水果">柑桔橙柚</option>
              <option value="苹果梨桃水果">苹果梨桃</option>
              <option value="葡提浆果水果">葡提浆果</option>
              <option value="其他水果">其他</option>
            </optgroup>
          </select>
        </div>
        <div class="form-group">
          <label>商品图片</label>
          <input type="file" @change="handleImageUpload" accept="image/*" class="image-upload">
          <div v-if="formData.image" class="image-preview">
            <img :src="formData.image" alt="商品图片预览" class="preview-img">
          </div>
          <div v-else class="image-hint">
            <p>请选择一张图片</p>
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="cancelModal" class="cancel-btn">取消</button>
          <button @click="submitForm" class="submit-btn">{{ showAddModal ? '添加' : '修改' }}</button>
        </div>
      </div>
    </div>
    
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { api } from '../../api/index';

export default {
  name: 'AdminProducts',
  data() {
    return {
      products: [],
      showAddModal: false,
      showEditModal: false,
      formData: {
        name: '',
        price: 0,
        category: '',
        image: ''
      },
      currentProductId: null,
      message: ''
    };
  },
  mounted() {
    this.getProducts();
  },
  methods: {
    async getProducts() {
      const result = await api.getProducts();
      if (result.success) {
        this.products = result.data;
      } else {
        this.message = result.message;
      }
    },
    
    editProduct(product) {
      this.formData = {
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image
      };
      this.currentProductId = product.id;
      this.showEditModal = true;
    },
    
    async deleteProduct(id) {
      if (confirm('确定要删除这个商品吗？')) {
        const result = await api.deleteProduct(id);
        if (result.success) {
          this.message = result.message;
          this.getProducts();
        } else {
          this.message = result.message;
        }
      }
    },
    

    
    cancelModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.formData = {
        name: '',
        price: 0,
        category: '',
        image: ''
      };
      this.currentProductId = null;
    },
    
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    async submitForm() {
      if (!this.formData.name || this.formData.price === undefined || this.formData.price === '' || !this.formData.category) {
        this.message = '请填写完整的商品信息';
        return;
      }
      
      if (this.showAddModal) {
        const result = await api.addProduct(this.formData);
        if (result.success) {
          this.message = result.message;
          this.getProducts();
          this.cancelModal();
        } else {
          this.message = result.message;
        }
      } else if (this.showEditModal) {
        const result = await api.updateProduct(this.currentProductId, this.formData);
        if (result.success) {
          this.message = result.message;
          this.getProducts();
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
.admin-products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header {
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

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th,
.products-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.products-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.edit-btn,
.delete-btn,
.status-btn {
  padding: 5px 10px;
  margin: 0 5px;
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

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  color: #27ae60;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.image-upload {
  margin-bottom: 15px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
  width: 100%;
}

.image-preview {
  margin: 15px 0;
  text-align: center;
}

.preview-img {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-hint {
  margin: 10px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.image-url-input {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.category-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.category-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}
</style>
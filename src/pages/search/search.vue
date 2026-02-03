<template>
  <view class="search-container">
    <!-- Search Bar -->
    <view class="search-header">
      <view class="search-bar-content">
        <view class="input-box">
          <text class="iconfont icon-search search-icon"></text>
          <input class="search-input" type="text" placeholder="搜索食材或菜谱" v-model="keyword" focus confirm-type="search"
            @confirm="onSearch(keyword)" @input="onInput" />
          <text v-if="keyword" class="iconfont icon-close clear-icon" @click="clearKeyword"></text>
        </view>
        <text class="cancel-btn" @click="onCancel">取消</text>
      </view>
    </view>

    <!-- Scrollable content -->
    <view class="search-body">
      <!-- 1: Search History & Hot Searches (Initial state) -->
      <scroll-view scroll-y class="search-suggestions" v-if="!showResults">
        <!-- History -->
        <view class="section history" v-if="historyList.length > 0">
          <view class="section-hd">
            <text class="title">搜索历史</text>
            <text class="iconfont icon-delete delete-btn" @click="clearHistory"></text>
          </view>
          <view class="tag-list">
            <text class="tag" v-for="(tag, index) in historyList" :key="index" @click="onTagClick(tag)">{{ tag }}</text>
          </view>
        </view>

        <!-- Hot Searches -->
        <view class="section hot">
          <view class="section-hd">
            <text class="title">热门搜索</text>
          </view>
          <view class="tag-list">
            <text class="tag" v-for="(tag, index) in hotList" :key="index" @click="onTagClick(tag)">{{ tag }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 2: Search Results (Search state) -->
      <view class="results-container" v-else>
        <!-- Tabs -->
        <view class="tabs">
          <view class="tab-item" :class="{ active: activeTab === 0 }" @click="activeTab = 0">
            查食物
            <view class="line" v-if="activeTab === 0"></view>
          </view>
          <view class="tab-item" :class="{ active: activeTab === 1 }" @click="activeTab = 1">
            找菜谱
            <view class="line" v-if="activeTab === 1"></view>
          </view>
        </view>

        <!-- Tab Content -->
        <scroll-view scroll-y class="result-list">
          <!-- Tab 1: Food List -->
          <block v-if="activeTab === 0">
            <view class="food-item" v-for="(food, index) in foodResults" :key="index" @click="goToDetail(food._id)">
              <!-- <image class="food-img" :src="food.image" mode="aspectFill"></image> -->
              <text class="food-img-temporary" :style="{ backgroundColor: getItemColor(index) }">{{ food.name.slice(0,
                1)
                }}</text>
              <view class="food-info">
                <text class="food-name">{{ food.name }}</text>
                <view class="purine-row">
                  <text class="label">嘌呤含量：</text>
                  <text class="value">{{ food.purine_per_100g }}mg</text>
                  <view class="dot" :style="{ backgroundColor: getPurineColor(food.purine_per_100g) }"></view>
                </view>
              </view>
              <text class="iconfont icon-right arrow"></text>
            </view>
            <!-- Empty State -->
            <view class="empty-state" v-if="foodResults.length === 0">
              <text class="empty-text">未找到相关食物</text>
            </view>
          </block>

          <!-- Tab 2: Recipe List -->
          <block v-if="activeTab === 1">
            <view class="recipe-item" v-for="(recipe, index) in recipeResults" :key="index">
              <!-- <image class="recipe-img" :src="recipe.cover_image" mode="aspectFill"></image> -->
              <text class="recipe-img-temporary" :style="{ backgroundColor: getItemColor(index) }">{{
                recipe.title.slice(0, 1) }}</text>
              <view class="recipe-info">
                <text class="recipe-name">{{ recipe.title }}</text>
                <view class="meta-row">
                  <text class="meta">{{ recipe.time }}</text>
                </view>
                <view class="tags-row">
                  <text class="mini-tag" v-for="(tag, tIndex) in recipe.health_tags" :key="tIndex">{{ formatTag(tag)
                  }}</text>
                </view>
              </view>
            </view>
            <!-- Empty State -->
            <view class="empty-state" v-if="recipeResults.length === 0">
              <text class="empty-text">未找到相关菜谱</text>
            </view>
          </block>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 1. 变量定义
const keyword = ref('');
const historyList = ref([]);
const hotList = ref(['西红柿', '痛风', '鸡胸肉', '秋葵', '降糖茶', '三文鱼']);
const showResults = ref(false);
const activeTab = ref(0); // 0: Food, 1: Recipe
const isLoading = ref(false);

// Cloud Objects
const foodService = uniCloud.importObject('food-service');
const recipeService = uniCloud.importObject('recipe-service');

// Data Results
const foodResults = ref([]);
const recipeResults = ref([]);

// 3. 辅助函数
const getPurineColor = (val) => {
  // Purine values: Low < 50, Medium 50-150, High > 150
  if (val < 50) return '#4CAF50'; // Low - Green
  if (val <= 150) return '#FFC107'; // Medium - Orange
  return '#FF5252'; // High - Red
};

const getItemColor = (index) => {
  const colors = ['#FF8A80', '#FFD180', '#A7FFEB', '#80D8FF', '#82B1FF', '#B388FF', '#F8BBD0', '#C8E6C9'];
  return colors[index % colors.length];
};

const formatTag = (tag) => {
  const dict = {
    'low_purine': '低嘌呤',
    'low_fat': '低脂',
    'high_protein': '高蛋白',
    'low_sugar': '低糖',
    'balanced': '均衡营养',
    'high_fiber': '富含纤维',
    'diabetes_friendly': '控糖推荐',
    'gout_friendly': '痛风友好',
    'vegetarian': '纯素',
    'kid_friendly': '儿童套餐',
    'heart_healthy': '护心方案',
    'warm_food': '温补',
    'winter_special': '冬季特选',
    'healthy_fats': '优质油脂'
  };
  return dict[tag] || tag;
};

// 4. 生命周期
onLoad(() => {
  // 从 Storage 读取历史记录
  const storedHistory = uni.getStorageSync('search_history');
  if (storedHistory) {
    historyList.value = JSON.parse(storedHistory);
  }
});

// Methods
const onInput = () => {
  if (!keyword.value.trim()) {
    showResults.value = false;
  }
};

const clearKeyword = () => {
  keyword.value = '';
  showResults.value = false;
};

const onCancel = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
};

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        historyList.value = [];
        uni.removeStorageSync('search_history');
      }
    }
  });
};

const onTagClick = (tag) => {
  keyword.value = tag;
  onSearch(tag);
};

const goToDetail = (id) => {
  if (!id) return;
  uni.navigateTo({
    url: `/pages/food/detail?id=${id}`
  });
};

const onSearch = (value) => {
  const kw = value || keyword.value;
  if (!kw || !kw.trim()) return;

  // 1. Add to history
  const index = historyList.value.indexOf(kw);
  if (index !== -1) {
    historyList.value.splice(index, 1);
  }
  historyList.value.unshift(kw);
  if (historyList.value.length > 10) {
    historyList.value.pop();
  }
  uni.setStorageSync('search_history', JSON.stringify(historyList.value));

  // 2. Trigger Search
  keyword.value = kw;
  doSearch(kw);
};


// 2. 查询逻辑
const doSearch = async (kw) => {
  isLoading.value = true;
  showResults.value = true;

  // Reset results
  foodResults.value = [];
  recipeResults.value = [];

  uni.showLoading({ title: '加载中...' });

  try {
    // Parallel requests
    const [foodRes, recipeRes] = await Promise.all([
      foodService.searchFood(kw),
      recipeService.searchRecipes(kw)
    ]);

    if (foodRes.code === 0) {
      foodResults.value = foodRes.data;
    }

    if (recipeRes.code === 0) {
      recipeResults.value = recipeRes.data;
    }

  } catch (e) {
    console.error('Search failed', e);
    uni.showToast({ title: '搜索失败，请重试', icon: 'none' });
  } finally {
    isLoading.value = false;
    uni.hideLoading();
  }
};
</script>

<style lang="scss" scoped>
$primary-color: #42B983;
$text-color: #333;
$sub-text-color: #999;
$bg-gray: #F5F7FA;

.search-container {
  min-height: 100vh;
  background-color: #fff;
}

/* Header */
.search-header {
  padding: 10rpx 32rpx 20rpx;
  background-color: #fff;
}

.search-bar-content {
  display: flex;
  align-items: center;
}

.input-box {
  flex: 1;
  height: 72rpx;
  background-color: $bg-gray;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;

  .search-icon {
    font-size: 32rpx;
    color: #999;
    margin-right: 12rpx;
  }

  .search-input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }

  .clear-icon {
    font-size: 32rpx;
    color: #ccc;
    padding: 10rpx;
  }
}

.cancel-btn {
  font-size: 28rpx;
  color: #333;
  margin-left: 24rpx;
}

/* Suggestions & History */
.section {
  padding: 40rpx 32rpx 0;

  .section-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .title {
      font-size: 30rpx;
      font-weight: bold;
      color: $text-color;
    }

    .delete-btn {
      font-size: 32rpx;
      color: #999;
    }
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;

    .tag {
      padding: 12rpx 28rpx;
      background-color: $bg-gray;
      border-radius: 32rpx;
      font-size: 26rpx;
      color: #666;
      margin: 0 20rpx 20rpx 0;
    }
  }
}

/* Results */
.results-container {
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  height: 88rpx;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    color: #666;
    position: relative;

    &.active {
      color: $primary-color;
      font-weight: bold;
    }

    .line {
      position: absolute;
      bottom: 0;
      width: 40rpx;
      height: 4rpx;
      background-color: $primary-color;
      border-radius: 2rpx;
    }
  }
}

/* Lists */
.result-list {
  height: calc(100vh - 44px - 88rpx); // Adjusted for native nav
  background-color: #fff;
}

/* Food Item */
.food-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f9f9f9;

  .food-img {
    width: 100rpx;
    height: 100rpx;
    border-radius: 8rpx;
    background-color: #eee;
    margin-right: 24rpx;
  }

  .food-info {
    flex: 1;

    .food-name {
      font-size: 30rpx;
      color: $text-color;
      font-weight: 500;
      margin-bottom: 8rpx;
      display: block;
    }

    .purine-row {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #666;

      .value {
        font-weight: bold;
        margin-right: 12rpx;
      }

      .dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;

        &.high {
          background-color: #FF5252;
        }

        &.medium {
          background-color: #FFC107;
        }

        &.low {
          background-color: #4CAF50;
        }
      }
    }
  }

  .arrow {
    font-size: 32rpx;
    color: #ccc;
  }
}

/* Temporary Image Utility Styles */
.food-img-temporary,
.recipe-img-temporary {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: bold;
  flex-shrink: 0;
}

/* Recipe Item */
.recipe-item {
  display: flex;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f9f9f9;

  .recipe-img {
    width: 220rpx;
    height: 140rpx;
    border-radius: 12rpx;
    background-color: #eee;
    margin-right: 24rpx;
  }

  .recipe-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .recipe-name {
      font-size: 30rpx;
      color: $text-color;
      font-weight: bold;
    }

    .meta-row {
      font-size: 24rpx;
      color: $sub-text-color;
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;

      .mini-tag {
        font-size: 20rpx;
        color: $primary-color;
        background-color: rgba(66, 185, 131, 0.1);
        padding: 4rpx 10rpx;
        border-radius: 4rpx;
        margin-right: 10rpx;
        margin-top: 8rpx;
      }
    }
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>

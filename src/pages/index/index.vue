<template>
  <view class="home-container">
    <!-- Static Search Bar -->
    <view class="static-search-container" @click="onSearchClick">
      <view class="search-bar">
        <text class="placeholder">搜索食材或菜谱</text>
      </view>
    </view>

    <!-- Banner Swiper -->
    <swiper class="banner-swiper" circular indicator-dots indicator-active-color="#42B983" autoplay interval="5000">
      <swiper-item v-for="(item, index) in bannerList" :key="index" @click="onBannerClick(item)">
        <view class="banner-item" :style="{ backgroundColor: '#eee' }">
          <image v-if="item.image" :src="item.image" mode="aspectFill" style="height: 100%;object-fit: cover;"></image>
          <text v-else class="banner-text">{{ item.title }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- King Kong Area (Grid Menu) -->
    <view class="grid-menu">
      <view class="grid-item" v-for="(item, index) in menuList" :key="index" @click="onGridItemClick(item)">
        <view class="icon-box" :style="{ backgroundColor: item.color }">
          <!-- Placeholder icons -->
          <text class="icon-text">{{ item.iconText }}</text>
        </view>
        <text class="menu-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- Personalized Recommendation -->
    <view class="section recommended">
      <block v-if="isLogin && userGoal">
        <view class="section-header">
          <text class="section-title">为您推荐：控糖食谱</text>
          <text class="more">查看更多 ></text>
        </view>
        <scroll-view scroll-x class="horizontal-scroll">
          <view class="card recipe-card" v-for="(item, index) in recommendedRecipes" :key="index">
            <view class="card-img-placeholder"></view>
            <text class="card-title">{{ item.title }}</text>
            <text class="card-tag">低GI</text>
          </view>
        </scroll-view>
      </block>

      <block v-else>
        <view class="section-header">
          <text class="section-title">今日饮食建议</text>
        </view>
        <view class="daily-advice-card">
          <view class="advice-content">
            <text class="advice-title">痛风患者请注意</text>
            <text class="advice-desc">多喝水，促进尿酸排泄；避免高嘌呤食物。</text>
            <button class="advice-btn" size="mini">查看详情</button>
          </view>
          <view class="advice-img-placeholder"></view>
        </view>

        <view class="section-header mt-20">
          <text class="section-title">热门低嘌呤榜单</text>
        </view>
        <view class="rank-list">
          <view class="rank-item" v-for="(food, index) in lowPurineFoods" :key="index">
            <text class="rank-num">{{ index + 1 }}</text>
            <view class="rank-info">
              <text class="food-name">{{ food.name }}</text>
              <text class="food-desc">嘌呤: {{ food.purine }}mg/100g</text>
            </view>
            <text class="badge success">推荐</text>
          </view>
        </view>
      </block>
    </view>

    <!-- Tabbar spacer -->
    <!-- <view class="tabbar-spacer"></view> -->
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
const db = uniCloud.database();
// --- Mock User Store (Pinia-like) ---
const userStore = reactive({
  state: {
    isLogin: uni.getStorageSync('isLogin') || false,
    userInfo: uni.getStorageSync('userInfo') || {
      nickname: 'Guest',
      goal: 'low_sugar' // 'low_sugar' | 'low_purine'
    }
  },
  login() {
    // This is now handled by the real login page, but keeping for dev fallback
    this.state.isLogin = true
    uni.setStorageSync('isLogin', true)
    fetchData()
  },
  logout() {
    this.state.isLogin = false
    uni.removeStorageSync('isLogin')
    uni.removeStorageSync('userInfo')
    fetchData()
  }
})

// --- 变量与计算属性 ---
const keyword = ref('')
const isLogin = computed(() => userStore.state.isLogin)
const userGoal = computed(() => userStore.state.userInfo.goal)

// --- Lifecycle ---
onLoad(() => {
  fetchData()
})

// --- 数据列表 ---
const bannerList = ref([
  { title: '夏季降尿酸指南', image: '/static/carousel/夏季降尿酸指南.png', url: '/pages/article/detail?id=1' },
  { title: '糖尿病饮食误区', image: '/static/carousel/糖尿病饮食误区.png', url: '/pages/article/detail?id=2' },
  { title: '今日健康食谱', image: '/static/carousel/今日健康食谱.png', url: '/pages/recipes/detail?id=101' }
])

const menuList = ref([
  { name: '嘌呤查询', iconText: '查', color: '#E8F5E9', path: '/pages/query/purine' },
  { name: '食物搭配', iconText: '搭', color: '#FFF3E0', path: '/pages/food/pairing' },
  { name: '菜谱推荐', iconText: '菜', color: '#E1F5FE', action: 'switchTab', path: '/pages/recipes/recipes' },
  { name: '特殊定制', iconText: '定', color: '#F3E5F5', path: '/pages/custom/custom' },
  { name: '饮食记录', iconText: '记', color: '#E0F2F1', path: '/pages/diet/log' },
  { name: '健康测评', iconText: '测', color: '#FFEBEE', path: '/pages/assessment/index' }
])

const recommendedRecipes = ref<any[]>([])
const lowPurineFoods = ref<any[]>([])

// --- Methods ---
const fetchData = async () => {
  try {
    if (isLogin.value && userGoal.value) {
      // Fetch recommended recipes
      const res = await request('recipe-service', 'getRecommendedRecipes', { goal: userGoal.value })
      recommendedRecipes.value = res || []
    } else {
      // Fetch low purine rank
      uni.showLoading({ title: '加载中...' })
      try {
        // JQL查询语法：仅查询必要字段并使用别名以匹配模板
        const { result } = await db.collection('food_library')
          .where('purine_per_100g != null')
          .field('name, purine_per_100g')
          .orderBy('purine_per_100g', 'asc')
          .limit(5)
          .get()

        // 赋值给页面变量，手动映射字段名
        lowPurineFoods.value = (result.data || []).map((item: any) => ({
          ...item,
          name: item.name,
          purine: item.purine_per_100g
        }));
      } catch (e) {
        console.error('查询失败：', e);
        uni.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        uni.hideLoading()
      }
    }
  } catch (e) {
    console.error('Fetch Data Failed', e)
  }
}

const onSearchClick = () => {
  uni.navigateTo({
    url: '/pages/search/search',
    fail: () => {
      uni.showToast({ title: '搜索页开发中', icon: 'none' })
    }
  })
}

const onGridItemClick = (item: any) => {
  if (item.action === 'switchTab') {
    uni.switchTab({
      url: item.path
    })
  } else if (item.path) {
    uni.navigateTo({
      url: item.path,
      fail: () => {
        uni.showToast({ title: `${item.name} 功能开发中`, icon: 'none' })
      }
    })
  }
}

const onBannerClick = (item: any) => {
  console.log('Banner Click:', item.title)
}

// --- Lifecycle ---
onLoad(() => {
  fetchData()
})
</script>

<style lang="scss">
$primary-color: #42B983;
$secondary-color: #FF9800;
$bg-color: #F5F7FA;

.home-container {
  min-height: 100vh;
  background-color: $bg-color;
}

/* Static Search Container */
.static-search-container {
  background-color: #fff;
  padding: 20rpx 32rpx;

  .search-bar {
    height: 36px;
    background-color: #F0F2F5;
    border-radius: 18px;
    display: flex;
    align-items: center;
    padding-left: 24rpx;

    .placeholder {
      font-size: 14px;
      color: #999;
    }
  }
}

/* Banner */
.banner-swiper {
  margin: 24rpx 32rpx;
  height: 150px;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .banner-item {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .banner-text {
      font-size: 20px;
      font-weight: bold;
      color: #555;
    }
  }
}

/* Grid Menu */
.grid-menu {
  display: flex;
  flex-wrap: wrap;
  margin: 0 16rpx;
  padding-bottom: 40rpx;

  .grid-item {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      background-color: #eee;

      .icon-text {
        font-size: 18px;
        color: #666;
        font-weight: bold;
      }
    }

    .menu-name {
      font-size: 13px;
      color: #333;
    }
  }
}

/* Section Common */
.section {
  padding: 0 32rpx;
  margin-bottom: 40rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      position: relative;
      padding-left: 10px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 3px;
        width: 4px;
        height: 16px;
        background-color: $primary-color;
        border-radius: 2px;
      }
    }

    .more {
      font-size: 12px;
      color: #999;
    }
  }

  &.mt-20 {
    margin-top: 40rpx;
  }
}

/* Horizontal Scroll */
.horizontal-scroll {
  white-space: nowrap;

  .recipe-card {
    display: inline-block;
    width: 140px;
    background: #fff;
    border-radius: 16rpx;
    margin-right: 12px;
    padding-bottom: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    overflow: hidden;

    .card-img-placeholder {
      height: 100px;
      background-color: #eee;
    }

    .card-title {
      display: block;
      font-size: 14px;
      color: #333;
      margin: 8px 8px 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-tag {
      display: inline-block;
      font-size: 10px;
      color: $primary-color;
      background-color: rgba(66, 185, 131, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 8px;
    }
  }
}

/* Daily Advice Card */
.daily-advice-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 16px;
  display: flex;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  margin-bottom: 30rpx;

  .advice-content {
    flex: 1;
    padding-right: 10px;

    .advice-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 6px;
    }

    .advice-desc {
      font-size: 12px;
      color: #666;
      display: block;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .advice-btn {
      margin: 0;
      background-color: rgba(255, 152, 0, 0.1);
      color: $secondary-color;
      font-size: 12px;
      border: none;
      padding: 0 12px;
    }
  }

  .advice-img-placeholder {
    width: 80px;
    height: 80px;
    background-color: #E8F5E9; // Light green placeholder
    border-radius: 8px;
  }
}

/* Rank List */
.rank-list {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  .rank-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .rank-num {
      width: 24px;
      font-size: 16px;
      font-weight: bold;
      color: #999;
      font-style: italic;
    }

    &:nth-child(1) .rank-num {
      color: #FFD700;
    }

    &:nth-child(2) .rank-num {
      color: #C0C0C0;
    }

    &:nth-child(3) .rank-num {
      color: #CD7F32;
    }

    .rank-info {
      flex: 1;

      .food-name {
        font-size: 14px;
        color: #333;
        margin-right: 8px;
      }

      .food-desc {
        font-size: 12px;
        color: #999;
      }
    }

    .badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;

      &.success {
        color: $primary-color;
        background-color: rgba(66, 185, 131, 0.1);
      }
    }
  }
}

.tabbar-spacer {
  // height: 50px;
  // padding-bottom: env(safe-area-inset-bottom);
}
</style>

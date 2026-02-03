<template>
    <view class="container">
        <!-- 1. Hero Section -->
        <view class="hero-section">
            <image class="hero-img" :src="food.image || heroPlaceholder" mode="aspectFill"></image>
            <!-- Overlay -->
            <view class="hero-overlay">
                <!-- Back Button -->
                <view class="nav-btn back-btn" @click="goBack" :style="{ top: navTop + 'px' }">
                    <text class="iconfont fanhui"></text>
                </view>
                <!-- Fav Button -->
                <view class="nav-btn fav-btn" @click="toggleFav" :style="{ top: navTop + 'px' }">
                    <text class="iconfont" :class="isFav ? 'icon-heart-fill' : 'icon-heart'"></text>
                </view>
            </view>
        </view>

        <!-- 2. Metrics Card -->
        <view class="metrics-card">
            <view class="header-row">
                <text class="food-name">{{ food.name || '-' }}</text>
                <text class="food-alias" v-if="food.alias">又名：{{ food.alias }}</text>
            </view>

            <!-- Warning Strip -->
            <view class="warning-strip" :class="purineLevelClass">
                <text class="warning-icon">{{ purineLevelClass === 'level-3' ? '!' : '✓' }}</text>
                <text class="warning-text">{{ purineWarningText }}</text>
            </view>

            <!-- 3D Grid -->
            <view class="data-grid">
                <view class="grid-item">
                    <text class="label">嘌呤含量</text>
                    <view class="value-box">
                        <text class="val big">{{ food.purine_per_100g || 0 }}</text>
                        <text class="unit">mg/100g</text>
                    </view>
                </view>
                <view class="line"></view>
                <view class="grid-item">
                    <text class="label">GI值</text>
                    <view class="value-box">
                        <text class="val">{{ food.gi_value || '-' }}</text>
                    </view>
                </view>
                <view class="line"></view>
                <view class="grid-item">
                    <text class="label">热量</text>
                    <view class="value-box">
                        <text class="val">{{ food.calories || 0 }}</text>
                        <text class="unit">Kcal</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- Content Area -->
        <view class="content-area">
            <!-- 4. Nutrition Details (Mock Data for Demo) -->
            <view class="section">
                <view class="section-title">营养成分</view>
                <view class="nutrient-list">
                    <view class="nutrient-item">
                        <view class="n-label">蛋白质</view>
                        <view class="n-bar-box">
                            <view class="n-bar" style="width: 60%; background-color: #42B983;"></view>
                        </view>
                        <view class="n-val">High</view>
                    </view>
                    <view class="nutrient-item">
                        <view class="n-label">脂肪</view>
                        <view class="n-bar-box">
                            <view class="n-bar" style="width: 20%; background-color: #FFC107;"></view>
                        </view>
                        <view class="n-val">Low</view>
                    </view>
                    <view class="nutrient-item">
                        <view class="n-label">碳水</view>
                        <view class="n-bar-box">
                            <view class="n-bar" style="width: 40%; background-color: #2196F3;"></view>
                        </view>
                        <view class="n-val">Med</view>
                    </view>
                </view>
            </view>

            <!-- 5. Recommendations -->
            <view class="section">
                <view class="section-title">适宜人群</view>
                <view class="recommend-box">
                    <view class="rec-item">
                        <text class="iconfont icon-user"></text>
                        <view class="rec-text-box">
                            <text class="rec-title">痛风人群</text>
                            <text class="rec-desc">{{ purineLevelClass === 'level-3' ? '不建议食用' : '可适量食用' }}</text>
                        </view>
                    </view>
                    <view class="rec-item">
                        <text class="iconfont icon-plus"></text>
                        <view class="rec-text-box">
                            <text class="rec-title">糖尿病人群</text>
                            <text class="rec-desc">{{ (food.gi_value || 0) > 55 ? '需控制摄入量' : '友好食物' }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 6. Recipes Scroll -->
            <view class="section" v-if="relatedRecipes.length > 0">
                <view class="section-title">怎么吃才健康？</view>
                <scroll-view class="recipe-scroll" scroll-x>
                    <view class="recipe-card" v-for="(item, index) in relatedRecipes" :key="index">
                        <text class="recipe-img-temporary" :style="{ backgroundColor: getItemColor(index) }">{{
                            item.title ? item.title.slice(0, 1) : 'R' }}</text>
                        <text class="r-title">{{ item.title }}</text>
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- Bottom Placeholder -->
        <view style="height: 120rpx;"></view>

        <!-- 7. Bottom Action Bar -->
        <view class="action-bar safe-area-bottom">
            <view class="left-action" @click="onFeedback">
                <text class="icon-edit">✎</text>
                <text>纠错</text>
            </view>
            <view class="main-btn" @click="addToDiet">
                <text class="icon-plus">+</text>
                <text>记入饮食</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// Lazy load foodService
let foodService = null;

// Data
const food = ref({});
const relatedRecipes = ref([]);
const isFav = ref(false);
const navTop = ref(44); // Default status bar height

// Temp Image Colors
const getItemColor = (index) => {
    const colors = ['#FF8A80', '#FFD180', '#A7FFEB', '#80D8FF', '#82B1FF', '#B388FF', '#F8BBD0', '#C8E6C9'];
    return colors[index % colors.length];
};

// Computed
const heroPlaceholder = computed(() => {
    return `https://placehold.co/750x500/eee/999?text=${encodeURIComponent(food.value.name || 'Food')}`;
});

const purineLevelClass = computed(() => {
    const p = food.value.purine_per_100g || 0;
    if (p < 50) return 'level-1';
    if (p <= 150) return 'level-2';
    return 'level-3';
});

const purineWarningText = computed(() => {
    const p = food.value.purine_per_100g || 0;
    if (p < 50) return '低嘌呤 - 放心理用';
    if (p <= 150) return '中嘌呤 - 适量食用';
    return '高嘌呤 - 慎重食用';
});

// Lifecycle
onLoad(async (options) => {
    const sysInfo = uni.getSystemInfoSync();
    navTop.value = sysInfo.statusBarHeight + 10;

    if (options.id) {
        await loadData(options.id);
    }
});

// Methods
const loadData = async (id) => {
    uni.showLoading({ title: '加载中' });
    try {
        if (!foodService) {
            foodService = uniCloud.importObject('food-service');
        }

        // Safety check
        if (!foodService) throw new Error("Failed to import food-service");

        const res = await foodService.getFoodDetail(id);
        if (res.code === 0) {
            food.value = res.data;
            relatedRecipes.value = res.data.related_recipes || [];
        } else {
            uni.showToast({ title: '食物不存在', icon: 'none' });
            setTimeout(() => uni.navigateBack(), 1500);
        }
    } catch (e) {
        console.error(e);
        uni.showToast({ title: '加载失败', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

const goBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        uni.switchTab({ url: '/pages/index/index' });
    }
};

const toggleFav = () => {
    isFav.value = !isFav.value;
    uni.showToast({ title: isFav.value ? '已收藏' : '取消收藏', icon: 'none' });
};

const onFeedback = () => {
    uni.showToast({ title: '感谢反馈', icon: 'none' });
};

const addToDiet = () => {
    uni.showToast({ title: '已加入今日饮食', icon: 'success' });
};

</script>

<style lang="scss" scoped>
/* Variables */
$level-1: #42B983; // Low Purine
$level-2: #FF9800; // Med Purine
$level-3: #FF5252; // High Purine
$text-main: #333;
$text-light: #999;

.container {
    min-height: 100vh;
    background-color: #F8F8F8;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}

/* 1. Hero Section */
.hero-section {
    position: relative;
    width: 100%;
    height: 500rpx;
    background-color: #eee;
}

.hero-img {
    width: 100%;
    height: 100%;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent 30%);
    pointer-events: none;
}

.nav-btn {
    position: absolute;
    width: 64rpx;
    height: 64rpx;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    z-index: 100;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
    left: 32rpx;
}

.fav-btn {
    right: 32rpx;
}

/* 2. Metrics Card */
.metrics-card {
    position: relative;
    margin: -60rpx 32rpx 0;
    background-color: #fff;
    border-radius: 24rpx;
    padding: 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    z-index: 10;
}

.header-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 24rpx;
}

.food-name {
    font-size: 48rpx;
    font-weight: bold;
    color: $text-main;
    margin-right: 16rpx;
}

.food-alias {
    font-size: 28rpx;
    color: $text-light;
}

/* Warning Strip */
.warning-strip {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    border-radius: 12rpx;
    margin-bottom: 32rpx;

    &.level-1 {
        background-color: rgba($level-1, 0.1);
        color: $level-1;
    }

    &.level-2 {
        background-color: rgba($level-2, 0.1);
        color: $level-2;
    }

    &.level-3 {
        background-color: rgba($level-3, 0.1);
        color: $level-3;
    }
}

.warning-icon {
    font-size: 28rpx;
    font-weight: bold;
}

.warning-text {
    font-size: 28rpx;
    font-weight: bold;
    margin-left: 12rpx;
}

/* Data Grid */
.data-grid {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.line {
    width: 2rpx;
    height: 40rpx;
    background-color: #eee;
}

.label {
    font-size: 24rpx;
    color: $text-light;
    margin-bottom: 8rpx;
}

.value-box {
    display: flex;
    align-items: baseline;
}

.val {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-main;

    &.big {
        font-size: 44rpx;
    }
}

.unit {
    font-size: 22rpx;
    color: $text-light;
    margin-left: 4rpx;
}

/* Content Area */
.content-area {
    padding: 32rpx;
}

.section {
    margin-bottom: 48rpx;
}

.section-title {
    font-size: 34rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 24rpx;
    position: relative;
    padding-left: 20rpx;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 32rpx;
        background-color: $level-1;
        border-radius: 4rpx;
    }
}

/* Nutrient List */
.nutrient-list {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
}

.nutrient-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.n-label {
    width: 100rpx;
    font-size: 28rpx;
    color: $text-main;
}

.n-bar-box {
    flex: 1;
    height: 12rpx;
    background-color: #f0f0f0;
    border-radius: 6rpx;
    margin: 0 24rpx;
    overflow: hidden;
}

.n-bar {
    height: 100%;
    border-radius: 6rpx;
}

.n-val {
    width: 60rpx;
    font-size: 24rpx;
    color: $text-light;
    text-align: right;
}

/* Recommend Box */
.recommend-box {
    display: flex;
    justify-content: space-between;
}

.rec-item {
    flex: 1;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-right: 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);

    &:last-child {
        margin-right: 0;
    }

    .iconfont {
        font-size: 40rpx;
        color: $level-1;
        margin-right: 16rpx;
    }
}

.rec-text-box {
    display: flex;
    flex-direction: column;
}

.rec-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
}

.rec-desc {
    font-size: 24rpx;
    color: $text-light;
    margin-top: 4rpx;
}

/* Recipe Scroll */
.recipe-scroll {
    white-space: nowrap;
    width: 100%;
}

.recipe-card {
    display: inline-flex;
    flex-direction: column;
    margin-right: 24rpx;
    width: 220rpx;
    vertical-align: top;
}

.r-title {
    font-size: 26rpx;
    color: $text-main;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.recipe-img-temporary {
    width: 220rpx;
    height: 140rpx;
    border-radius: 12rpx;
    margin-bottom: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 48rpx;
    font-weight: bold;
}

/* 7. Action Bar */
.action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 999;
}

.safe-area-bottom {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(100rpx + constant(safe-area-inset-bottom));
    height: calc(100rpx + env(safe-area-inset-bottom));
}

.left-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 32rpx;
    color: $text-light;
    font-size: 22rpx;

    .icon-edit {
        font-size: 36rpx;
        margin-bottom: 4rpx;
    }
}

.main-btn {
    flex: 1;
    height: 80rpx;
    background-color: $text-main;
    border-radius: 40rpx;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: bold;

    .icon-plus {
        margin-right: 8rpx;
        font-weight: bold;
    }
}
</style>
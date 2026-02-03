<template>
    <view class="container">
        <!-- Header Section -->
        <view class="header">
            <view class="header-bg"></view>
            <view class="header-content">
                <view class="user-info" @tap="handleUserClick">
                    <view class="avatar">
                        <image :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"
                            class="avatar-img" />
                    </view>
                    <view class="info-text">
                        <text class="nickname">{{ isLogin ? userInfo.nickname : '点击登录/注册' }}</text>
                        <text class="status">健康饮食第 {{ isLogin ? userInfo.track_days : 0 }} 天</text>
                    </view>
                </view>
                <view class="settings-btn" @tap="navTo('/pages/settings/settings')">
                    <text class="iconfont icon-settings"></text>
                </view>
            </view>
        </view>

        <!-- Stats Bar (Floating Card) -->
        <view class="stats-card">
            <view class="stats-item" hover-class="item-hover" @tap="navTo('/pages/my/favorites')">
                <text class="value">{{ isLogin ? userInfo.favorites_count : 0 }}</text>
                <text class="label">我的收藏</text>
            </view>
            <view class="stats-item" hover-class="item-hover" @tap="navTo('/pages/my/records')">
                <text class="value">{{ isLogin ? userInfo.track_days : 0 }}</text>
                <text class="label">饮食记录(天)</text>
            </view>
            <view class="stats-item" hover-class="item-hover" @tap="navTo('/pages/my/score')">
                <text class="value">{{ isLogin ? userInfo.health_score : '--' }}</text>
                <text class="label">健康分</text>
            </view>
        </view>

        <!-- Menu List -->
        <view class="menu-list-card">
            <view class="menu-item" hover-class="item-hover" @tap="navTo('/pages/profile/edit')">
                <view class="left">
                    <text class="iconfont icon-archive"></text>
                    <text class="title">健康档案</text>
                </view>
                <text class="iconfont icon-arrow-right"></text>
            </view>
            <view class="menu-item" hover-class="item-hover" @tap="navTo('/pages/vip/index')">
                <view class="left">
                    <text class="iconfont icon-vip"></text>
                    <text class="title">VIP会员</text>
                </view>
                <text class="iconfont icon-arrow-right"></text>
            </view>
            <view class="menu-item" hover-class="item-hover" @tap="navTo('/pages/stats/body-data')">
                <view class="left">
                    <text class="iconfont icon-chart"></text>
                    <text class="title">身体数据</text>
                </view>
                <text class="iconfont icon-arrow-right"></text>
            </view>

            <!-- Split line for system items -->
            <view class="menu-item border-top" hover-class="item-hover" @tap="navTo('/pages/support/index')">
                <view class="left">
                    <text class="iconfont icon-customer-service"></text>
                    <text class="title">联系客服</text>
                </view>
                <text class="iconfont icon-arrow-right"></text>
            </view>
            <view class="menu-item" hover-class="item-hover" @tap="navTo('/pages/about/index')">
                <view class="left">
                    <text class="iconfont icon-about"></text>
                    <text class="title">关于我们</text>
                </view>
                <text class="iconfont icon-arrow-right"></text>
            </view>

            <!-- Logout Item -->
            <view v-if="isLogin" class="menu-item logout-item" hover-class="item-hover" @tap="handleLogout">
                <view class="center">
                    <text class="title logout-text">退出登录</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { reactive, toRefs, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

// --- Mock User Store ---
interface UserInfo {
    avatar: string;
    nickname: string;
    health_score: number;
    track_days: number;
    favorites_count: number;
    health_goal?: string; // e.g. "Low Purine", "Sugar Control"
    body_metrics?: Record<string, any>;
}

// --- UniCloud Integration (TODO: Uncomment and integrate with uni-id) ---
// const uniIdCo = uniCloud.importObject('uni-id-co');

const userState = reactive({
    isLogin: false,
    userInfo: {} as UserInfo
});

const { isLogin, userInfo } = toRefs(userState);

// --- Core Logic ---

// Fetch extended user profile from UniCloud
const fetchUserProfile = async () => {
    /* TODO: Uncomment when ready to integrate with UniCloud
    try {
      const res = await uniIdCo.getUserInfo();
      if (res.errCode === 0) {
        const { health_goal, body_metrics, nickname, avatar } = res.userInfo;
        userState.userInfo = {
          ...userState.userInfo,
          nickname: nickname || userState.userInfo.nickname,
          avatar: avatar || userState.userInfo.avatar,
          health_goal,
          body_metrics
        };
        // Example: Map health_goal to a specific UI behavior or label
        console.log('Health Goal:', health_goal);
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    }
    */
};

// Check login status and load data
const checkLogin = () => {
    const loginFlag = uni.getStorageSync('isLogin');
    if (loginFlag) {
        userState.isLogin = true;
        const persistentUserInfo = uni.getStorageSync('userInfo');
        userState.userInfo = {
            avatar: persistentUserInfo?.avatar || 'https://img.js.design/assets/placeholder/742b8374-1e01-449e-b851-4e785501d67a.png',
            nickname: persistentUserInfo?.nickname || '健康达人',
            health_score: 85,
            track_days: 12,
            favorites_count: 5
        };
        // fetchUserProfile(); // TODO: Call this when UniCloud is ready
    } else {
        userState.isLogin = false;
        userState.userInfo = {} as UserInfo;
    }
};

onShow(() => {
    checkLogin();
});

// Navigation handler
const navTo = (url: string) => {
    if (!userState.isLogin && url.includes('/pages/my/')) {
        uni.navigateTo({ url: '/pages/login/login' });
        return;
    }
    uni.navigateTo({ url });
};

// Header click handler
const handleUserClick = () => {
    if (!userState.isLogin) {
        uni.navigateTo({ url: '/pages/login/login' });
    } else {
        // Navigate to profile edit page
        navTo('/pages/profile/edit');
    }
};

// Logout handler
const handleLogout = () => {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
            if (res.confirm) {
                uni.removeStorageSync('isLogin');
                uni.removeStorageSync('userInfo');
                userState.isLogin = false;
                userState.userInfo = {} as UserInfo;
                uni.showToast({
                    title: '已退出',
                    icon: 'none'
                });
            }
        }
    });
};

onMounted(() => {
    // Initial check
    checkLogin();

    // For demo: automatically log in after 1 second if not logged in
    // setTimeout(() => {
    //   uni.setStorageSync('isLogin', true);
    //   checkLogin();
    // }, 1000);
});
</script>

<style lang="scss" scoped>
.container {
    min-height: 100vh;
    background-color: #F5F7FA;
    // padding-bottom: 30rpx;
}

.header {
    position: relative;
    /* height: 250rpx; // Height should grow with status-bar */
    width: 100%;
    overflow: hidden;
    padding-bottom: 30rpx;

    .header-bg {
        position: absolute;
        top: 0;
        left: -10%;
        width: 120%;
        height: 100%;
        background: linear-gradient(135deg, #6fd3a8 0%, #42B983 100%);
        border-bottom-left-radius: 50% 20rpx;
        border-bottom-right-radius: 50% 20rpx;
    }

    .header-content {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 40rpx 40rpx 40rpx;

        .user-info {
            display: flex;
            align-items: center;

            .avatar {
                width: 120rpx;
                height: 120rpx;
                border-radius: 50%;
                background-color: #eee;
                border: 4rpx solid rgba(255, 255, 255, 0.4);
                overflow: hidden;
                margin-right: 24rpx;

                .avatar-img {
                    width: 100%;
                    height: 100%;
                }
            }

            .info-text {
                display: flex;
                flex-direction: column;

                .nickname {
                    font-size: 36rpx;
                    font-weight: bold;
                    color: #ffffff;
                    margin-bottom: 8rpx;
                }

                .status {
                    font-size: 24rpx;
                    color: rgba(255, 255, 255, 0.8);
                }
            }
        }

        .settings-btn {
            .iconfont {
                font-size: 44rpx;
                color: #ffffff;
            }
        }
    }
}

.stats-card {
    position: relative;
    z-index: 2;
    margin: -40rpx 30rpx 0;
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx 0;
    display: flex;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);

    .stats-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;

        &:not(:last-child)::after {
            content: "";
            position: absolute;
            right: 0;
            top: 20%;
            height: 60%;
            width: 1rpx;
            background-color: #f0f0f0;
        }

        .value {
            font-size: 36rpx;
            font-weight: bold;
            color: #333333;
            margin-bottom: 6rpx;
        }

        .label {
            font-size: 24rpx;
            color: #999999;
        }
    }
}

.menu-list-card {
    margin: 30rpx 30rpx 0;
    background-color: #ffffff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

    .menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 34rpx 30rpx;
        transition: background-color 0.2s;

        &:not(:last-child) {
            border-bottom: 1rpx solid #f8f8f8;
        }

        &.border-top {
            margin-top: 10rpx;
            border-top: 10rpx solid #F5F7FA;
        }

        .left {
            display: flex;
            align-items: center;

            .iconfont {
                font-size: 40rpx;
                margin-right: 20rpx;
                color: #42B983;

                &.icon-archive {
                    color: #42B983;
                }

                &.icon-vip {
                    color: #f1c40f;
                }

                &.icon-chart {
                    color: #3498db;
                }

                &.icon-customer-service {
                    color: #e67e22;
                }

                &.icon-about {
                    color: #95a5a6;
                }
            }

            .title {
                font-size: 28rpx;
                color: #333333;
            }
        }

        .icon-arrow-right {
            font-size: 24rpx;
            color: #bbbbbb;
        }

        &.logout-item {
            justify-content: center;
            margin-top: 20rpx;
            border-top: 1rpx solid #f8f8f8;

            .logout-text {
                color: #e74c3c;
                font-weight: 500;
            }
        }
    }
}

.item-hover {
    background-color: #f9f9f9;
    opacity: 0.8;
}

/* Placeholder icon font styles if not already globally defined */
.iconfont {
    font-family: serif;
    /* Fallback */
}
</style>

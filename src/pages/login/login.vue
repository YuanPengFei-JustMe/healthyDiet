<template>
    <view class="login-container">
        <view class="login-header">
            <view class="logo-box">
                <text class="logo-text">轻悦食光</text>
            </view>
            <text class="slogan">科学饮食，悦享健康</text>
        </view>

        <view class="login-methods">
            <!-- WeChat Login Button -->
            <!-- #ifdef MP-WEIXIN -->
            <button class="login-btn wechat-btn" @tap="handleWechatLogin">
                <text class="iconfont icon-wechat"></text>
                微信一键登录
            </button>
            <!-- #endif -->

            <!-- Fallback / Visitor Login -->
            <button class="login-btn guest-btn" @tap="handleGuestLogin">
                游客访问 / 模拟登录
            </button>
        </view>

        <view class="login-footer">
            <view class="agreement">
                <checkbox :checked="isAgreed" @tap="toggleAgreement" color="#42B983" class="checkbox" />
                <text class="agreement-text">
                    已阅读并同意 <text class="link">《用户协议》</text> 和 <text class="link">《隐私政策》</text>
                </text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isAgreed = ref(false);

const toggleAgreement = () => {
    isAgreed.value = !isAgreed.value;
};

// --- Login Logic ---

const handleWechatLogin = () => {
    if (!isAgreed.value) {
        uni.showToast({ title: '请先同意用户协议', icon: 'none' });
        return;
    }

    uni.showLoading({ title: '正在授权...' });

    // 1. Get User Profile FIRST (requires direct user action)
    uni.getUserProfile({
        desc: '用于完善会员资料',
        success: (profileRes) => {
            console.log('User Profile Success:', profileRes.userInfo);

            // 2. Perform Login after profile success
            uni.login({
                provider: 'weixin',
                success: (loginRes) => {
                    console.log('Login Success, Code:', loginRes.code);

                    // 3. Complete login logic
                    completeLogin({
                        nickname: profileRes.userInfo.nickName,
                        avatar: profileRes.userInfo.avatarUrl,
                        code: loginRes.code
                    });
                },
                fail: (err) => {
                    uni.hideLoading();
                    console.error('uni.login fail:', err);
                    uni.showModal({
                        title: '登录失败',
                        content: `微信登录接口调用失败：${err.errMsg || '未知错误'}。请检查 AppID 是否配置正确。`,
                        showCancel: false
                    });
                }
            });
        },
        fail: (err) => {
            uni.hideLoading();
            console.error('uni.getUserProfile fail:', err);

            // If the user cancelled, just show a simple toast
            if (err.errMsg.indexOf('cancel') !== -1) {
                uni.showToast({ title: '您取消了授权', icon: 'none' });
                return;
            }

            uni.showModal({
                title: '授权失败',
                content: `获取用户信息失败：${err.errMsg || '未知错误'}。注意：必须在真机或微信开发者工具中运行，并确保 AppID 有效。`,
                showCancel: false
            });
        }
    });
};

const handleGuestLogin = () => {
    if (!isAgreed.value) {
        uni.showToast({ title: '请先同意用户协议', icon: 'none' });
        return;
    }

    uni.showLoading({ title: '模拟登录中...' });
    setTimeout(() => {
        completeLogin({
            nickname: '访客用户',
            avatar: 'https://placehold.co/150x150?text=登录'
        });
    }, 1000);
};

const completeLogin = (userInfo: any) => {
    uni.setStorageSync('isLogin', true);
    uni.setStorageSync('userInfo', userInfo);

    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });

    // Handle redirection: Go back if possible, otherwise switch to Home
    setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
            uni.navigateBack();
        } else {
            uni.switchTab({
                url: '/pages/index/index'
            });
        }
    }, 1500);
};
</script>

<style lang="scss" scoped>
.login-container {
    height: 100vh;
    background-color: #ffffff;
    padding: 60rpx 60rpx;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.login-header {
    padding-top: 80rpx;
    margin-bottom: 100rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .logo-box {
        width: 160rpx;
        height: 160rpx;
        background-color: #42B983;
        border-radius: 40rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 30rpx;
        box-shadow: 0 10rpx 30rpx rgba(66, 185, 131, 0.2);

        .logo-text {
            color: #ffffff;
            font-size: 32rpx;
            font-weight: bold;
        }
    }

    .slogan {
        font-size: 34rpx;
        color: #333333;
        font-weight: 500;
    }
}

.login-methods {
    flex: 1;

    .login-btn {
        width: 100%;
        height: 90rpx;
        border-radius: 45rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30rpx;
        margin-bottom: 40rpx;
        border: none;

        &::after {
            border: none;
        }

        &.wechat-btn {
            background-color: #42B983;
            color: #ffffff;

            .iconfont {
                margin-right: 16rpx;
                font-size: 36rpx;
            }
        }

        &.guest-btn {
            background-color: #f5f5f5;
            color: #666666;
        }
    }
}

.login-footer {
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom));

    .agreement {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20rpx 0;

        .checkbox {
            transform: scale(0.65);
            margin-right: 8rpx;
            display: flex;
            align-items: center;
        }

        .agreement-text {
            font-size: 24rpx;
            color: #999999;
            line-height: 1.2;

            .link {
                color: #42B983;
            }
        }
    }
}
</style>

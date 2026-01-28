<template>
  <view class="container">
    <text class="page-title">个人中心</text>
    <view class="user-card">
      <text class="username">未登录</text>
    </view>
    <view class="settings">
      <view class="item">
        <text>我的健康档案 (痛风/糖尿病设置)</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
.container {
  padding: 20px;
}
.page-title {
  font-size: 20px;
  font-weight: bold;
  color: $uni-text-color;
  margin-bottom: 20px;
  display: block;
}
.user-card {
  background: $uni-color-primary;
  padding: 30px;
  border-radius: $uni-border-radius-lg;
  color: white;
  margin-bottom: 20px;
}
.settings {
  .item {
    padding: 15px;
    background: white;
    border-bottom: 1px solid #eee;
  }
}
</style>

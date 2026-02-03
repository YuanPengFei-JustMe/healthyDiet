<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    // Check login status with a small delay to avoid disrupting early initialization
    setTimeout(() => {
      const isLogin = uni.getStorageSync('isLogin');
      if (!isLogin) {
        // Redirect to login page if not logged in
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
    }, 50);
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
@import "uview-plus/index.scss";
@import url("https://at.alicdn.com/t/c/font_5120550_c4qtbuedkql.css");

/* 每个页面公共css */
body {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 顶部状态栏占位 */
.status-bar {
  height: var(--status-bar-height);
  width: 100%;
  background: transparent;
}

/* 兼容刘海屏的顶部内边距 */
.safe-area-inset-top {
  padding-top: var(--status-bar-height);
}
</style>

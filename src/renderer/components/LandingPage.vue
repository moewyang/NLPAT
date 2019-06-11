<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <main>
      <el-container>
        <el-header width="100%">
            <NavBar></NavBar>
        </el-header>
        <el-container>
          <div class="panel">
            <router-view></router-view>
          </div>
        </el-container>
        <el-footer>
          <Footer></Footer>
        </el-footer>
      </el-container>
    </main>
  </div>
</template>

<script>
  import NavBar from './LandingPage/NavBar'
  import Footer from './LandingPage/Footer'

  export default {
    name: 'landing-page',
    components: { NavBar, Footer },
    data () {
      return {
        val: true
      }
    }
  }
</script>

<style>
  /* @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro'); */

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif; }

  #wrapper {
    background: rgba(229, 229, 229, .9);
    height: 100vh;
    width: 100vw;
  }

  main {
    display: flex;
    justify-content: space-between;
    height: 100%;
  }

  .el-header {
    padding: 0!important;
  }

  .panel {
      width: 100%;
      margin: 30px 30px 0 30px;
      padding: 30px;
      border: 1px solid #EEE;
      border-radius: 20px;
      box-shadow: 0 0 1px 0 rgba(232, 237, 250, .6);
      background: white;
      overflow-y: auto;
  }
</style>

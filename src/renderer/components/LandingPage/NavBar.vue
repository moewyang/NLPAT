<template>
  <el-menu
    :default-active="activeIndex"
    mode="horizontal"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    :router="true"
  >
    <el-menu-item index="home">主页</el-menu-item>
    <el-menu-item index="entity-tagging">实体标注</el-menu-item>
    <el-menu-item index="entity-linking">实体链接标注</el-menu-item>
    <el-menu-item index="entity-relationship">实体关系标注</el-menu-item>
    <el-menu-item index="ai-annotation">AI自动标注</el-menu-item>
    <el-menu-item index="toolkit">其他工具集</el-menu-item>
    <el-menu-item index="setting">配置</el-menu-item>
    <el-menu-item index="about">关于</el-menu-item>
  </el-menu>
</template>
<script>
  export default {
    data () {
      return {
        activeIndex: 'home'
      }
    },
    created () {
      this.activeIndex = this.$route.path.substr(1)
      if (!this.activeIndex) {
        this.activeIndex = 'home'
      }
    },
    watch: {
      $route () {
        this.activeIndex = this.$route.path.substr(1)
      }
    }
  }
</script>
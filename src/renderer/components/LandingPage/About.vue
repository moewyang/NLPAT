<template>
    <div class="about-page">
        <div>知行中文图谱管理系统 - 标注系统 <el-tag size="small" effect="dark">{{ version }}</el-tag></div>
        <el-link type="primary" @click="open('http://www.actkg.com/')">系统网站</el-link>
    </div>
</template>
<script>
  const config = require('../../../../package.json')
  const shell = require('electron').shell
  export default {
    data () {
      return {
        version: config.version
      }
    },
    methods: {
      open (url) {
        shell.openExternal(url)
      }
    }
  }
</script>
<style>
</style>

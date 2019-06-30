<template>
    <div class="about-page">
      <el-tabs type="card">
        <el-tab-pane label="NA格式文件介绍">
        </el-tab-pane>
        <el-tab-pane label="技术介绍">
        </el-tab-pane>
        <el-tab-pane label="系统软件介绍">
          <el-card shadow="always">
            <div>北航“知行”中文知识图谱系统ACTKG  <el-tag size="mini" effect="dark">2.0</el-tag></div>
            <el-link type="primary" @click="open('http://www.actkg.com/')">在线访问地址</el-link>
            <br><br>
            <p>言你所思，见我所知。北航 BDBC 实验室于 2016 年开始构建的中文开放知识库，由百度百科、互动百科及中文维基三大数据源融合重构而成，目前拥有超过 10M 实体与 13M 关系，提供知识检索、中文问答、实体链接及知识抽取等工具API 在线调用。</p>
            <br>
            <p>©Copyright 2017-2019, BDBC Lib, Beihang University.</p>
            <p>Coded with Python and Pycharm, built with Django.</p>
          </el-card>
          <br>
          <el-card shadow="always">
            <div>北航“知行”中文知识图谱标注软件NLPAT  <el-tag size="mini" effect="dark">{{ version }}</el-tag></div>
            <br><br>
            <p>©Copyright 2018-2019, BDBC Lib, Beihang University.</p>
            <p>Coded with Vue and Element, built with Electron.</p>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="开发团队介绍">
          
        </el-tab-pane>
      </el-tabs>
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

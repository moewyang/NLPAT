<template>
  <div class="setting-page">
    <el-tabs type="card">
      <el-tab-pane label="默认文件路径">
        <el-card shadow="always">
          <div class="tips">TIPS：只能上传.na文件，且不超过10MB</div>
          <div class="block open-block" v-for="(item, i) in titleNames" v-bind:key="i">
            <div class="title">{{ item }}默认文件路径：{{ srcFilePaths[i] ? srcFilePaths[i] : '未设置' }}</div>
            <el-button size="mini" type="primary" @click="openFile(i)">设置</el-button>
            <el-button size="mini" type="danger" @click="delPath(i)">清除</el-button>
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="远程KG配置">
        <el-card shadow="always">
          <div class="tips">TIPS：作为<el-link type="primary" @click="open('https://www.aclweb.org/anthology/P09-1113')">远程监督</el-link>实体链接标注和实体关系标注的，目前只支持<el-link type="primary" @click="open('https://neo4j.com/')">Neo4j</el-link></div>
          <el-form class="block open-block" ref="form" :model="form" label-width="120px" label-position="left">
            <el-form-item label="URL">
              <el-input v-model="form.url" clearable></el-input>
            </el-form-item>
            <el-form-item label="AUTHCODE*">
              <el-input v-model="form.authCode" clearable></el-input>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="onSet">设置</el-button>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="实体标注类型" class="tagging-type">
        <el-card shadow="always">
          <div>
            <strong>默认标注类型参照CoNLL2003，实体被标注为四种类型：</strong>
            <ul class="default-list">
              <li>LOC (location, 地名)</li>
              <li>ORG (organisation， 组织机构名)</li>
              <li>PER （person， 人名）</li>
              <li>MISC (miscellaneous， 其他)</li>
            </ul>
          </div>
          <div class="set-type">
            <strong>设置标注类型：</strong>
            <el-row :gutter="20">
              <el-col :span="11">
                标注值
              </el-col>
              <el-col :span="11">
                标注描述
              </el-col>
            </el-row>
            <el-row :gutter="20" v-for="(item, i) in typeOptions" :key="i">
              <el-col :span="11">
                <el-input v-model="item.value"></el-input>
              </el-col>
              <el-col :span="11">
                <el-input v-model="item.label"></el-input>
              </el-col>
              <el-col :span="2">
                <el-button icon="el-icon-close" circle @click="delLine(i)"></el-button>
              </el-col>
            </el-row>
          </div>
          <div class="set-buttons">
            <el-button size="mini" @click="addLine()">添加一行</el-button>
            <el-button size="mini" type="warning" @click="updateOptions()">更新</el-button>
            <el-button size="mini" type="danger" @click="resetOptions()">重置</el-button>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
const shell = require('electron').shell
export default {
  data () {
    return {
      modelName: 'setting',
      srcFilePaths: ['', '', '', ''],
      configNames: ['tagDefaultPath', 'linkingDefaultPath', 'relationDefaultPath', 'toolkitDefaultPath'],
      titleNames: ['实体标注', '实体链接标注', '实体关系标注', '其他工具集'],
      cIndex: 0,
      form: {
        url: '',
        authCode: ''
      },
      defaltTypeOptions: [{
        value: 'PER',
        label: 'PER-person,人名'
      }, {
        value: 'ORG',
        label: 'ORG-organisation,组织机构名'
      }, {
        value: 'LOC',
        label: 'LOC-location, 地名'
      }, {
        value: 'MISC',
        label: 'MISC-miscellaneous,其他'
      }],
      typeOptions: []
    }
  },
  created () {
    this.$electron.ipcRenderer.send('get-all-config', this.modelName)
  },
  methods: {
    openFile: function (index) {
      console.log('open-file-dialog')
      this.cIndex = index
      this.$electron.ipcRenderer.send('open-file-dialog', this.modelName)
    },
    delPath: function (index) {
      this.$electron.ipcRenderer.send('del-config', this.configNames[index])
      this.srcFilePaths.splice(index, 1, '')
    },
    open (url) {
      shell.openExternal(url)
    },
    onSet () {
      this.$electron.ipcRenderer.send('set-config', 'kgUrl', this.form.url)
      this.$electron.ipcRenderer.send('set-config', 'kgAuthCode', this.form.authCode)
    },
    addLine () {
      this.typeOptions.push({
        value: '',
        label: ''
      })
    },
    delLine (i) {
      this.typeOptions.splice(i, 1)
    },
    updateOptions () {
      this.$electron.ipcRenderer.send('set-config', 'typeOptions', JSON.stringify(this.typeOptions))
      this.$message({
        message: '更新成功',
        type: 'success'
      })
    },
    resetOptions () {
      this.typeOptions = this.defaltTypeOptions
      this.$electron.ipcRenderer.send('set-config', 'typeOptions', JSON.stringify(this.typeOptions))
      this.$message({
        message: '重置成功',
        type: 'success'
      })
    }
  },
  mounted () {
    this.$electron.ipcRenderer.on('selected-open-file-' + this.modelName, (event, path) => {
      this.srcFilePaths.splice(this.cIndex, 1, path[0])
      this.$electron.ipcRenderer.send('set-config', this.configNames[this.cIndex], path[0])
    })
    this.$electron.ipcRenderer.on('get-all-config-reply-' + this.modelName, (event, value) => {
      if (value.hasOwnProperty('tagDefaultPath')) {
        this.srcFilePaths.splice(0, 1, value.tagDefaultPath)
      }
      if (value.hasOwnProperty('linkingDefaultPath')) {
        this.srcFilePaths.splice(1, 1, value.linkingDefaultPath)
      }
      if (value.hasOwnProperty('relationDefaultPath')) {
        this.srcFilePaths.splice(2, 1, value.relationDefaultPath)
      }
      if (value.hasOwnProperty('toolkitDefaultPath')) {
        this.srcFilePaths.splice(3, 1, value.toolkitDefaultPath)
      }
      if (value.hasOwnProperty('kgUrl')) {
        this.$set(this.form, 'url', value.kgUrl)
      }
      if (value.hasOwnProperty('kgAuthCode')) {
        this.$set(this.form, 'authCode', value.kgAuthCode)
      }
      if (value.hasOwnProperty('typeOptions')) {
        this.typeOptions = JSON.parse(value.typeOptions)
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.setting-page {
  .tips {
    margin: 10px 0;
  }
  .block {
    display: block;
    width: 100%;
  }
  .open-block {
    padding-top: 30px;
    .title {
      padding-bottom: 10px;
    }
  }
  .el-link {
    font-size: 16px;
    vertical-align: top;
  }
  .tagging-type {
    .default-list {
      margin-left: 30px;
    }
    .set-type {
      margin-top: 20px;
      .el-col {
        margin-top: 10px;
        margin-bottom: 10px;
      }
    }
    .set-buttons {
      float: right;
      margin: 20px 0;
    }
  }
}
</style>

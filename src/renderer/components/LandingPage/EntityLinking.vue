<template>
  <div class="entity-linking-page">
    <div class="tip" v-if="tip" v-html="tip"></div>
    <el-card shadow="always">
      <div >
        <el-tooltip v-if="srcFilePath" effect="light" placement="top-start">
          <el-button size="mini" type="primary" @click="openFile">打开.na文件</el-button>
          <div slot="content">当前文件路径:{{ srcFilePath }}</div>
        </el-tooltip>
        <el-button v-else size="mini" type="primary" @click="openFile">打开.na文件</el-button>
        <el-button size="mini" type="warning" @click="onSubmit">保存</el-button>
        <el-button size="mini" type="warning" @click="onSaveAs">另存为</el-button>
        <el-button size="mini" type="success" @click="aiAssist">智能协助</el-button>
      </div>
    </el-card>
    <br>
    <el-card shadow="always" v-loading="pageLoading">
      <div>
        <span>当前</span>
        <span class="jump-index" v-if="listLen !== 0">第 <el-input-number class="index-input" v-model="curNum" size="mini" :min="1" :max="listLen" :step="10"></el-input-number> 句&nbsp;&nbsp;共{{listLen}}句</span>
        <span v-if="listLen !== 0">（状态：{{senList[curIndex].hasOwnProperty('links') ? '已修改' : '未修改'}}）</span>
      </div>
      <el-row class="block sen-block">
        <el-col :span="2">
          <el-button class="sen-btn" type="default" size="medium" icon="el-icon-d-arrow-left" circle @click="pre()"></el-button>
        </el-col>
        <el-col class="sen-wrapper" :span="20">
          <el-input type="text" v-if="senList[curIndex]" class="sen" v-html="color(senList[curIndex].string)"></el-input>
          <div v-else class="sen">暂无内容</div>
        </el-col>
        <el-col :span="2">
          <el-button class="sen-btn" type="default" size="medium" icon="el-icon-d-arrow-right" circle @click="next()"></el-button>
        </el-col>
      </el-row>
      <p>标注知识库中对应实体:</p>
      <el-form class="block entity-block" ref="form" label-width="40px" label-position="left">
        <el-form-item v-for="(item, i) in entities[curIndex]" v-bind:key="i" label-width="0">
          <el-badge :value="item.id" type="primary">
            <el-tag type="primary">{{ item.name }}</el-tag>
          </el-badge>
          &nbsp;
          <el-tag type="success">{{ item.type }}</el-tag>
          &nbsp;
          <el-autocomplete :highlight-first-item="true" class="entity-auto-complete" popper-class="entitiy-pull-down" v-model="item.description" :fetch-suggestions="querySearchAsync(item.name)" placeholder="点击获取" clearable>
            <template slot-scope="{ item }">
              <div class="nid">{{ item.neoId }}</div>
              <span class="ndes">{{ item.description }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import { Message } from 'element-ui'
const fs = require('fs')
const readline = require('readline')
export default {
  data () {
    return {
      pageLoading: false,
      tip: '',
      modelName: 'linking',
      srcFilePath: '',
      entities: [[
        {
          id: 1,
          name: '实体名称',
          type: 'TAG',
          description: ''
        },
        {
          id: 2,
          name: '实体名称',
          type: 'TAG',
          description: ''
        },
        {
          id: 3,
          name: '实体名称',
          type: 'TAG',
          description: ''
        }
      ]],
      dragover: false,
      progress: 0,
      showProgress: false,
      showError: false,
      senList: [],
      curIndex: 0,
      listLen: 0,
      descriptions: [],
      jumpTo: 1,
      kgUrl: 'http://localhost:7474/db/data/transaction/commit',
      kgAuthCode: 'bmVvNGo6MjA4MDI5OTE=',
      curNum: 1,
      isOnSubmit: false
    }
  },
  watch: {
    curIndex () {
      this.curNum = this.curIndex + 1
    },
    curNum () {
      this.curIndex = this.curNum - 1
    }
  },
  created () {
    this.$electron.ipcRenderer.send('get-all-config', this.modelName)
  },
  methods: {
    aiAssist () {
      console.log('aiAssist')
    },
    onSubmit () {
      if (this.isOnSubmit) {
        return
      }
      this.isOnSubmit = true
      console.log('onSubmit')
      var links = this.entities[this.curIndex].map((item) => {
        return item.description
      })
      Object.assign(this.senList[this.curIndex], {
        links
      })
      this.$electron.ipcRenderer.send('save-file', this.srcFilePath, this.modelName)
    },
    onSaveAs () {
      console.log('onSaveAs')
      var links = this.entities[this.curIndex].map((item) => {
        return item.description
      })
      Object.assign(this.senList[this.curIndex], {
        links
      })
      this.$electron.ipcRenderer.send('save-as-file-dialog', this.modelName)
    },
    openFile: function () {
      console.log('open-file-dialog')
      this.$electron.ipcRenderer.send('open-file-dialog', this.modelName)
    },
    readFileToArr: (vueThis, fReadName, callback) => {
      var size = fs.statSync(fReadName).size
      if (size > 10485760) {
        Message.warning('打开文件不能超过10MB')
        vueThis.pageLoading = false
        return
      }
      vueThis.resetPage()
      vueThis.srcFilePath = fReadName
      var fRead = fs.createReadStream(fReadName)
      var objReadline = readline.createInterface({
        input: fRead
      })
      var arr = []
      objReadline.on('line', (line) => {
        arr.push(line)
      })
      objReadline.on('close', () => {
        callback(arr)
      })
    },
    pre () {
      if (this.curIndex > 0) {
        this.curIndex--
      }
    },
    next () {
      if (this.curIndex < this.listLen - 1) {
        this.curIndex++
      }
    },
    color (sen) {
      var senArr = sen.split('')
      var entities = this.senList[this.curIndex].entities
      var startIndexList = entities.map((item) => {
        return item.pos.split(',')[0]
      })
      var endIndexList = entities.map((item) => {
        return item.pos.split(',')[1]
      })
      for (var i = 0; i < startIndexList.length; i++) {
        senArr[startIndexList[i]] = '<div class="el-badge item"><sup class="el-badge__content el-badge__content--primary is-fixed">' + (i + 1) + '</sup><span style=\'background-color: rgb(216, 236, 255)\'>' + senArr[startIndexList[i]]
      }
      for (var j = 0; j < endIndexList.length; j++) {
        if (senArr[endIndexList[j]] !== undefined) {
          senArr[endIndexList[j]] = '</span></div>&nbsp;&nbsp;&nbsp;&nbsp;' + senArr[endIndexList[j]]
        } else {
          senArr[endIndexList[j]] = '</span></div>'
        }
      }
      return senArr.join('')
    },
    runCypherQuery (query, params, callback) {
      var headers = {
        'Accept': 'application/json; charset=UTF-8',
        'Content-Type': 'application/json'
      }
      if (this.kgAuthCode) {
        Object.assign(headers, {
          'Authorization': 'Basic ' + this.kgAuthCode
        })
      }
      this.$http.post(this.kgUrl, {
        statements: [
          {
            statement: query,
            parameters: params
          }
        ]
      }, {
        headers
      }).then((response) => {
        callback(response)
      }).catch((error) => {
        callback(error)
      })
    },
    querySearchAsync (name) {
      if (!name) {
        return (queryString, cb) => {
          let result = []
          cb(result)
        }
      }
      return (queryString, cb) => {
        this.descriptions = []
        this.runCypherQuery(
          'match (n:Instance) where n.name = { name } return id(n), n',
          { name },
          (resp) => {
            if (resp.status !== 200) {
              console.log(resp)
            } else {
              var resData = resp.data.results[0].data
              let descriptions = []
              if (resData) {
                descriptions = resData.map((item) => {
                  return {
                    neoId: item.row[0],
                    description: item.row[1].description,
                    value: '' + item.row[0]
                  }
                })
              }
              var result = queryString ? descriptions.filter(this.createStateFilter(queryString)) : descriptions
              cb(result)
            }
          }
        )
      }
    },
    createStateFilter (queryString) {
      return (state) => {
        return ((state.description.trim() + state.value.trim()).toLowerCase().indexOf(queryString.trim().toLowerCase()) !== -1)
      }
    },
    readLineCallback (data) {
      this.listLen = data.length
      this.senList = data.map((item) => {
        return JSON.parse(item)
      })
      this.entities = data.map((item, index) => {
        var entityList = []
        var itemJson = JSON.parse(item)
        for (var i = 0; i < itemJson.entities.length; i++) {
          entityList.push({
            id: i + 1,
            name: itemJson.entities[i].word,
            type: itemJson.entities[i].type,
            // description: this.senList[index].hasOwnProperty('links') ? this.senList[index].links[i] : ''
            description: itemJson.entities[i].link === 'none' ? '' : itemJson.entities[i].link
          })
        }
        return entityList
      })
      this.pageLoading = false
    },
    resetPage () {
      this.curIndex = 0
      this.listLen = 0
      this.senList = []
      this.descriptions = []
      this.srcFilePath = ''
    }
  },
  mounted () {
    this.$electron.ipcRenderer.on('selected-open-file-' + this.modelName, (event, path) => {
      // const name = path[0].slice(path[0].lastIndexOf('/') + 1)
      this.pageLoading = true
      this.readFileToArr(this, path[0], this.readLineCallback)
    })
    this.$electron.ipcRenderer.on('direct-save-file-' + this.modelName, (event, path) => {
      console.log('save to:' + path)
      var output = this.senList.map((item) => {
        return JSON.stringify(item)
      }).join('\n')
      var that = this
      fs.writeFile(path, output, () => {
        that.$electron.ipcRenderer.send('show-message', '保存成功')
      })
      this.isOnSubmit = false
    })
    this.$electron.ipcRenderer.on('selected-save-file-' + this.modelName, (event, path) => {
      console.log('save to:' + path)
      var output = this.senList.map((item) => {
        return JSON.stringify(item)
      }).join('\n')
      var that = this
      fs.writeFile(path, output, () => {
        that.$electron.ipcRenderer.send('show-message', '保存成功')
      })
    })
    this.$electron.ipcRenderer.on('get-all-config-reply-' + this.modelName, (event, value) => {
      if (value.hasOwnProperty('linkingDefaultPath')) {
        if (value.linkingDefaultPath) {
          this.pageLoading = true
          this.readFileToArr(this, value.linkingDefaultPath, this.readLineCallback)
        }
      }
      if (value.hasOwnProperty('kgUrl')) {
        this.kgUrl = value.kgUrl
        if (value.hasOwnProperty('kgAuthCode')) {
          this.kgAuthCode = value.kgAuthCode
        }
      } else {
        this.tip = '⚠️请先在"<a style="color: #F56C6C" href="#/setting">配置</a>-远程KG配置"中设置KG地址'
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.entity-linking-page {
  .tip {
    font-size: 20px;
    color: #F56C6C;
    margin: 10px 0;
  }
  .block {
    display: block;
    width: 100%;
    margin: 10px 0;
  }
  .jump-index {
    margin-top: 10px;
    .index-input {
      width: 120px;
    }
  }
  .sen-block {
    text-align: center;
    margin: 15px 0;
    .sen {
      border: 1px solid #CCC;
      border-radius: 10px;
      padding: 10px;
    }
    .sen-wrapper {
      text-align: left;
    }
    .sen-btn {
      margin-top: 4px;
    }
  }
  .entity-block {
    border: 1px solid #EEE;
    border-radius: 10px;
    padding: 20px;
    height: 318px;
    overflow-y: auto;
    .entity-auto-complete {
      width: 65%;
    }
  }
}
.entitiy-pull-down {
  li {
    line-height: normal;
    padding: 7px;
  }
  .ndes {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .nid {
    font-size: 12px;
    color: #b4b4b4;
  }
  .highlighted .nid {
    color: #ddd;
  }
}
</style>

<template>
  <div class="entity-relationship-page">
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
        <!-- <el-button size="mini" type="danger" @click="onDel">清除关系</el-button> -->
        <el-button size="mini" type="success" @click="aiAssist">智能协助</el-button>
      </div>
    </el-card>
    <br>
    <el-card shadow="always" v-loading="pageLoading">
      <div>
        <span>当前</span>
        <span class="jump-index" v-if="listLen !== 0">第 <el-input-number class="index-input" v-model="curNum" size="mini" :min="1" :max="listLen" :step="10"></el-input-number> 句&nbsp;&nbsp;共{{listLen}}句</span>
        <span v-if="listLen !== 0">（状态：{{senList[curIndex].hasOwnProperty('relations') ? '已修改' : '未修改'}}）</span>
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
      <p>标注实体之间的关系:</p>
      <el-form class="block entity-block" ref="form" label-width="0px" label-position="left">
        <el-form-item v-for="(item, i) in entityPairs[curIndex]" v-bind:key="i">
          <el-badge :value="item.leftId" type="primary">
            <el-tag type="primary">{{ item.leftName }}({{ item.leftNid }})</el-tag>
          </el-badge>
          &nbsp;
          <span>=></span>
          <el-badge :value="item.rightId" type="primary">
            <el-tag type="primary">{{ item.rightName }}({{ item.rightNid }})</el-tag>
          </el-badge>
          &nbsp;
          <el-autocomplete :highlight-first-item="true" class="entity-auto-complete" popper-class="entitiy-pull-down" v-model="item.relation" :fetch-suggestions="querySearchAsync(item.leftNid, item.rightNid)" placeholder="点击获取" clearable>
            <template slot-scope="{ item }">
              <div class="nid">{{ item.relationId }}</div>
              <span class="ndes">{{ item.relationName }}</span>
            </template>
          </el-autocomplete>
          <el-tag v-if="senList[curIndex] && senList[curIndex].dr.indexOf(item.leftPos + ',' + item.rightPos) > -1" type="warning">多关系</el-tag>
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
      modelName: 'relation',
      srcFilePath: '',
      dragover: false,
      progress: 0,
      showProgress: false,
      showError: false,
      senList: [],
      curIndex: 0,
      listLen: 0,
      relations: [],
      entityPairs: [],
      kgUrl: 'http://localhost:7474/db/data/transaction/commit',
      kgAuthCode: 'bmVvNGo6MjA4MDI5OTE=',
      curNum: 1
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
      console.log('onSubmit')
      var relations = this.entityPairs[this.curIndex].map((item) => {
        return {
          entity1: item.leftNid,
          entity2: item.rightNid,
          relation: item.relation
        }
      })
      Object.assign(this.senList[this.curIndex], {
        relations
      })
      this.$electron.ipcRenderer.send('save-file', this.srcFilePath, this.modelName)
    },
    onSaveAs () {
      console.log('onSaveAs')
      var relations = this.entityPairs[this.curIndex].map((item) => {
        return {
          entity1: item.leftNid,
          entity2: item.righNid,
          relation: item.relation
        }
      })
      Object.assign(this.senList[this.curIndex], {
        relations
      })
      this.$electron.ipcRenderer.send('save-as-file-dialog', this.modelName)
    },
    onDel () {
      console.log('onDel')
      if (!this.senList[this.curIndex].hasOwnProperty('relations')) {
        this.$electron.ipcRenderer.send('show-message', '无需清除')
        return
      } else {
        delete this.senList[this.curIndex].relations
      }
      this.$electron.ipcRenderer.send('save-file-dialog', this.modelName)
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
    querySearchAsync (id1, id2) {
      if (!id1 || !id2) {
        return (queryString, cb) => {
          let result = []
          cb(result)
        }
      } else {
        id1 = parseInt(id1)
        id2 = parseInt(id2)
      }
      return (queryString, cb) => {
        this.relations = []
        this.runCypherQuery(
          'MATCH (n:Instance)-[r]->(m:Instance) where id(n)={ id1 } and id(m)={ id2 } RETURN id(r), type(r)',
          { id1, id2 },
          (resp) => {
            if (resp.status !== 200) {
              console.log(resp)
            } else {
              var resData = resp.data.results[0].data
              let relations = []
              if (resData) {
                relations = resData.map((item) => {
                  return {
                    relationId: item.row[0],
                    relationName: item.row[1],
                    value: '' + item.row[0]
                  }
                })
              }
              var result = queryString ? relations.filter(this.createStateFilter(queryString)) : relations
              cb(result)
            }
          }
        )
      }
    },
    createStateFilter (queryString) {
      return (state) => {
        return ((state.relationName.trim() + state.value.trim()).toLowerCase().indexOf(queryString.trim().toLowerCase()) !== -1)
      }
    },
    readLineCallback (data) {
      this.listLen = data.length
      this.senList = data.map((item) => {
        return JSON.parse(item)
      })
      var validEntity = data.map((item, index) => {
        var entityList = []
        var itemJson = JSON.parse(item)
        for (var i = 0; i < itemJson.entities.length; i++) {
          entityList.push({
            id: i + 1,
            pos: itemJson.entities[i].pos,
            name: itemJson.entities[i].word,
            nid: itemJson.entities[i].link
          })
        }
        return entityList
      })
      for (var k = 0; k < validEntity.length; ++k) {
        var pair = []
        for (var i = 0; i < validEntity[k].length; ++i) {
          for (var j = 0; j < validEntity[k].length; ++j) {
            var leftNid = validEntity[k][i].nid
            var rightNid = validEntity[k][j].nid
            if (i !== j && leftNid !== 'none' && rightNid !== 'none') {
              pair.push({
                leftId: validEntity[k][i].id,
                rightId: validEntity[k][j].id,
                leftPos: validEntity[k][i].pos,
                rightPos: validEntity[k][j].pos,
                leftName: validEntity[k][i].name,
                rightName: validEntity[k][j].name,
                leftNid,
                rightNid,
                relation: this.senList[k].hasOwnProperty('relations') ? this.findRelation(this.senList[k].relations, validEntity[k][i].pos, validEntity[k][j].pos) : ''
              })
            }
          }
        }
        this.entityPairs.push(pair)
      }
      this.pageLoading = false
    },
    findRelation (relations, leftPos, rightPos) {
      for (var i in relations) {
        if (relations[i].entity1 === leftPos && relations[i].entity2 === rightPos) {
          return relations[i].relation
        }
      }
      return ''
    },
    resetPage () {
      this.curIndex = 0
      this.listLen = 0
      this.senList = []
      this.relations = []
      this.entityPairs = []
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
      if (value.hasOwnProperty('relationDefaultPath')) {
        this.pageLoading = true
        if (value.relationDefaultPath) {
          this.readFileToArr(this, value.relationDefaultPath, this.readLineCallback)
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
.entity-relationship-page {
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
      width: auto;
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

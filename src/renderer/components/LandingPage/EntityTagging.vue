<template>
  <div class="entity-tagging-page">
    <div class="tip" v-if="tip" v-html="tip"></div>
    <el-card shadow="always">
      <div >
        <el-tooltip v-if="srcFilePath" effect="light" placement="top-start">
          <el-button size="mini" type="primary" @click="openFile">打开.na文件</el-button>
          <div slot="content">当前文件路径：{{ srcFilePath }}</div>
        </el-tooltip>
        <el-button v-else size="mini" type="primary" @click="openFile">打开.na文件</el-button>
        <el-button size="mini" type="warning" @click="onSubmit">保存</el-button>
        <el-button size="mini" type="warning" @click="onSaveAs">另存为</el-button>
        <el-button size="mini" type="warning" @click="exportDialogVisible = true">导出</el-button>
        <!--<el-button size="mini" type="success" @click="aiAssist">智能协助</el-button>-->
      </div>
    </el-card>
    <br>
    <el-card shadow="always" v-loading="pageLoading">
      <p>标注实体位置（指上文本后拖动选择）:</p>
      <br>
      <div>
        <span>当前</span>
        <span class="jump-index" v-if="listLen !== 0">第 <el-input-number class="index-input" v-model="curNum" size="mini" :min="1" :max="listLen" :step="10"></el-input-number> 句&nbsp;&nbsp;共{{listLen}}句</span>
        <!--<span v-if="listLen !== 0">（状态：{{senList[curIndex].hasOwnProperty('links') ? '已修改' : '未修改'}}）</span>-->
      </div>
      <el-row class="block sen-block" id="sen-block">
        <el-col :span="2">
          <el-button class="sen-btn" type="default" size="medium" icon="el-icon-d-arrow-left" circle @click="pre()"></el-button>
        </el-col>
        <el-col class="sen-wrapper" :span="20">
          <el-input type="text" v-if="isEdit && senList[curIndex]" class="sen" v-html="senList[curIndex].s" @mouseup.native="getSelectedContents" @mouseleave.native="isEdit = false"></el-input>
          <el-input type="text" v-else-if="!isEdit && senList[curIndex]" class="sen" v-html="color(senList[curIndex].s)" @mouseenter.native="isEdit = true"></el-input>
          <div v-else class="sen">暂无内容</div>
        </el-col>
        <el-col :span="2">
          <el-button class="sen-btn" type="default" size="medium" icon="el-icon-d-arrow-right" circle @click="next()"></el-button>
        </el-col>
      </el-row>
      <p>标注实体类别:</p>
      <el-form v-if="senList[curIndex]" class="block entity-block" ref="form" label-width="40px" label-position="left">
        <el-form-item v-for="(item, i) in senList[curIndex].e" v-bind:key="i" label-width="0">
          <el-badge :value="i + 1" type="primary">
            <el-tag type="primary">{{ senList[curIndex].s.substring(item.p.split(',')[0], item.p.split(',')[1]) }}</el-tag>
          </el-badge>
          &nbsp;
          <el-select size="small" v-model="item.t" placeholder="请选择">
            <el-option v-for="it in typeOptions" :key="it.value" :label="it.label" :value="it.value"></el-option>
          </el-select>
          <el-button size="mini" type="default" icon="el-icon-close" circle @click="onDelEntity(i)"></el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-dialog title="导出选项" :visible.sync="exportDialogVisible" width="30%" center>
      <div class="export-block">
        <el-select class="export-select" v-model="exportType" placeholder="请选择">
          <el-option v-for="item in exportTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onExport">确 定</el-button>
      </span>
    </el-dialog>
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
      modelName: 'tag',
      srcFilePath: '',
      showError: false,
      senList: [],
      curIndex: 0,
      listLen: 0,
      isEdit: false,
      typeOptions: [{
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
      exportDialogVisible: false,
      exportType: 'BIO',
      exportTypeOptions: [{
        value: 'IO',
        label: 'IO'
      }, {
        value: 'BIO',
        label: 'BIO'
      }, {
        value: 'BIOES',
        label: 'BIOES'
      }, {
        value: 'BMEWO',
        label: 'BMEWO'
      }],
      exportStr: '',
      seperate: '\t',
      curNum: 1,
      fileInfo: {},
      relationTable: [],
      typeTable: [],
      relationType: []
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
      this.$electron.ipcRenderer.send('save-file', this.srcFilePath, this.modelName)
    },
    onSaveAs () {
      console.log('onSaveAs')
      this.$electron.ipcRenderer.send('save-as-file-dialog', this.modelName)
    },
    onExport () {
      console.log('onExport')
      // this.exportDialogVisible = false
      var that = this
      this.exportStr = ''
      var startTag = 'B-'
      var insideTag = 'I-'
      var endTag = 'I-'
      var singleTag = 'B-'
      var defaultTag = 'O'
      if (this.exportType === 'IO') {
        startTag = 'I-'
        insideTag = 'I-'
        endTag = 'I-'
      } else if (this.exportType === 'BIO') {
        startTag = 'B-'
        insideTag = 'I-'
        endTag = 'I-'
      } else if (this.exportType === 'BMEWO') {
        startTag = 'B-'
        insideTag = 'M-'
        endTag = 'E-'
      } else if (this.exportType === 'BIOES') {
        startTag = 'B-'
        insideTag = 'I-'
        endTag = 'E-'
        singleTag = 'S-'
      }
      this.exportStr = this.senList.map((item) => {
        var wordList = item.s.split('')
        var entities = item.e.sort((item1, item2) => {
          return item1.p.split(',')[0] > item2.p.split(',')[0]
        }).map(x => x)
        var isInside = false
        var curEntity = entities.shift()
        if (curEntity !== undefined) {
          var curStart = parseInt(curEntity.p.split(',')[0])
          var curEnd = parseInt(curEntity.p.split(',')[1]) - 1
          var curType = curEntity.t
        }
        return wordList.map((wordItem, index) => {
          if (curEntity !== undefined) {
            if (index === curStart && index === curEnd) {
              isInside = false
              return wordItem + that.seperate + singleTag + curType
            } else if (index === curStart) {
              isInside = true
              return wordItem + that.seperate + startTag + curType
            } else if (index === curEnd) {
              isInside = false
              curEntity = entities.shift()
              var ret = wordItem + that.seperate + endTag + curType
              if (curEntity !== undefined) {
                curStart = parseInt(curEntity.p.split(',')[0])
                curEnd = parseInt(curEntity.p.split(',')[1]) - 1
                curType = curEntity.t
              }
              return ret
            } else if (isInside) {
              return wordItem + that.seperate + insideTag + curType
            } else {
              return wordItem + that.seperate + defaultTag
            }
          } else {
            return wordItem + that.seperate + defaultTag
          }
        }).join('\n')
      }).join('\n\n')
      this.exportDialogVisible = false
      this.$electron.ipcRenderer.send('export-file-dialog', this.modelName)
    },
    onDelEntity (i) {
      console.log('onDelEntity')
      this.senList[this.curIndex].e.splice(i, 1)
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
      var entities = this.senList[this.curIndex].e
      var startIndexList = entities.map((item) => {
        return item.p.split(',')[0]
      })
      var endIndexList = entities.map((item) => {
        return item.p.split(',')[1]
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
    readLineCallback (data) {
      var that = this
      if (data.length > 0) {
        this.fileInfo = JSON.parse(data.shift())
        if (this.fileInfo.sv === '3.0.0' && this.fileInfo.dv === '1.0.0' && this.fileInfo.dn === 4) {
          this.relationTable = JSON.parse(data.shift())
          this.typeTable = JSON.parse(data.shift())
          this.relationType = JSON.parse(data.shift())
        }
        this.typeOptions = Object.keys(this.typeTable[1]).map((item) => {
          return {
            value: that.typeTable[1][item],
            label: '(' + that.typeTable[1][item] + ')' + item
          }
        })
      }
      this.listLen = data.length
      this.senList = data.map((item) => {
        return JSON.parse(item)
      })
      this.pageLoading = false
    },
    resetPage () {
      this.curIndex = 0
      this.listLen = 0
      this.senList = []
      this.srcFilePath = ''
      this.fileInfo = {}
      this.relationTable = []
      this.typeTable = []
      this.relationType = []
    },
    getSelectedContents () {
      this.isEdit = true
      if (window.getSelection) {
        // chrome,firefox,opera
        if (window.getSelection().rangeCount < 1) {
          return
        }
        var selection = window.getSelection()
        var selectionStr = selection.toString()
        if (selectionStr.length > 0) {
          var selectStartIndex = selection.anchorOffset
          var selectEndIndex = selection.focusOffset
          var entities = this.senList[this.curIndex].e
          var startIndexList = entities.map((item) => {
            return item.p.split(',')[0]
          })
          var endIndexList = entities.map((item) => {
            return item.p.split(',')[1]
          })
          // check cross
          for (var i = 0; i < startIndexList.length; i++) {
            if ((selectStartIndex < startIndexList[i] && selectEndIndex <= startIndexList[i]) || (selectStartIndex >= endIndexList[i] && selectEndIndex > endIndexList[i])) {
              continue
            } else {
              console.log('不能交叉选择')
              this.$electron.ipcRenderer.send('show-message', '不能交叉选择实体，可以先删除已标记实体')
              return
            }
          }
          this.senList[this.curIndex].e.push({'p': selectStartIndex + ',' + selectEndIndex, 't': -1})
          this.senList[this.curIndex].e.sort((item1, item2) => {
            return item1.p.split(',')[0] > item2.p.split(',')[0]
          })
          // let range = window.getSelection().getRangeAt(0)
          // let container = document.createElement('span')
          // container.appendChild(range.cloneContents())
          // container.setAttribute('style', 'background-color: rgb(216, 236, 255)')
          // range.surroundContents(container)
        }
        // return container.innerHTML
        // return window.getSelection() //只复制文本
      } else if (document.getSelection) {
        // 其他
        if (window.getSelection().rangeCount < 1) {
          return
        }
        let range = window.getSelection().getRangeAt(0)
        let container = document.createElement('div')
        container.appendChild(range.cloneContents())
        container.setAttribute('style', 'background-color: rgb(216, 236, 255)')
        range.surroundContents(container)
        // return container.innerHTML
        // return document.getSelection(); //只复制文本
      } else if (document.selection) {
        // IE特有的
        console.log('不支持IE')
        // return document.selection.createRange().htmlText
        // return document.selection.createRange().text //只复制文本
      }
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
      })
      output.unshift(JSON.stringify(this.relationType))
      output.unshift(JSON.stringify(this.typeTable))
      output.unshift(JSON.stringify(this.relationTable))
      this.fileInfo.ut = (new Date().getTime()) + ''
      output.unshift(JSON.stringify(this.fileInfo))
      var that = this
      fs.writeFile(path, output.join('\n'), () => {
        that.$electron.ipcRenderer.send('show-message', '保存成功')
      })
    })
    this.$electron.ipcRenderer.on('selected-save-file-' + this.modelName, (event, path) => {
      console.log('save to:' + path)
      var output = this.senList.map((item) => {
        return JSON.stringify(item)
      })
      output.unshift(JSON.stringify(this.relationType))
      output.unshift(JSON.stringify(this.typeTable))
      output.unshift(JSON.stringify(this.relationTable))
      this.fileInfo.ut = (new Date().getTime()) + ''
      output.unshift(JSON.stringify(this.fileInfo))
      var that = this
      fs.writeFile(path, output.join('\n'), () => {
        that.$electron.ipcRenderer.send('show-message', '保存成功')
      })
    })
    this.$electron.ipcRenderer.on('export-save-file-' + this.modelName, (event, path) => {
      console.log('save to:' + path)
      var that = this
      fs.writeFile(path, this.exportStr, () => {
        that.$electron.ipcRenderer.send('show-message', '保存成功')
      })
    })
    this.$electron.ipcRenderer.on('get-all-config-reply-' + this.modelName, (event, value) => {
      if (value.hasOwnProperty('tagDefaultPath')) {
        this.pageLoading = true
        if (value.tagDefaultPath) {
          this.readFileToArr(this, value.tagDefaultPath, this.readLineCallback)
        }
      }
      // if (value.hasOwnProperty('typeOptions')) {
      //   this.typeOptions = JSON.parse(value.typeOptions)
      // }
    })
  }
}
</script>
<style lang="scss" scoped>
.entity-tagging-page {
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
  .open-block {
    padding-left: 30px;
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
    height: 268px;
    overflow-y: auto;
    .entity-auto-complete {
      width: 85%;
    }
  }
  .export-block {
    text-align: center;
    .el-select {
      width: 100%;
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

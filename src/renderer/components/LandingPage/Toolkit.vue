<template>
  <div class="toolkit-page">
    <el-tabs type="card" v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="文件格式转化" name="tab-1">
        <el-card shadow="always">
          <div class="tips">TIPS：将不同格式的文件转为.na格式的文件，na格式文件的介绍见"<a style="color: black" href="#/about">关于</a>-NA格式文件介绍"</div>
          <el-form ref="form1" :model="form1" label-width="80px" label-position="left">
            <el-form-item label="文件格式">
              <el-radio-group v-model="form1.type">
                <el-radio label="txt">一句话一行的文本</el-radio>
                <el-radio label="io">IO</el-radio>
                <el-radio label="bio">BIO</el-radio>
                <el-radio label="bioes">BIOES</el-radio>
                <el-radio label="bmewo">BMEWO</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="文件地址">
              <el-button size="mini" type="primary" @click="openFile">打开文件</el-button>
              <span v-if="waitSwitchFilePath" class="el-upload__tip">当前打开文件路径：{{ waitSwitchFilePath }}</span>
            </el-form-item>
            <el-form-item v-if="waitSwitchFilePath">
              <el-button size="mini" type="success" @click="onSwitch" :loading="isSwitchLoading">转换</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="实体搜索" name="tab-2">
        <el-card shadow="always">
          <el-form :inline="true" ref="form2" :model="form2" label-width="80px" label-position="left">
            <el-form-item label="查询类型">
              <el-radio-group v-model="form2.type">
                <el-radio label="name">名称</el-radio>
                <el-radio label="id">ID</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="查询值">
              <el-input v-model="form2.content"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">查询</el-button>
            </el-form-item>
          </el-form>
          <p>结果</p>
          <div el-input type="text" v-html="nlpResult"></div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="中文问答" name="tab-3">
        <el-card shadow="always">
          <el-form :inline="true" ref="form3" :model="form3" label-position="left">
            <el-form-item label="">
              <el-input v-model="form3.content" style="width: 600px"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">提问</el-button>
            </el-form-item>
          </el-form>
          <p>结果</p>
          <div el-input type="text" v-html="nlpResult"></div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="分词/词性标注/实体识别/链接" name="tab-4">
        <div class="tip" v-if="tip" v-html="tip"></div>
        <el-card shadow="always">
          <div>
            <el-tooltip v-if="srcFilePath" effect="light" placement="top-start">
              <el-button size="mini" type="primary" @click="openFile">打开.na文件</el-button>
              <div slot="content">当前文件路径:{{ srcFilePath }}</div>
            </el-tooltip>
            <el-button v-else size="mini" type="primary" @click="openFile">打开.na文件</el-button>
          </div>
        </el-card>
        <br>
        <el-card shadow="always" v-loading="pageLoading">
          <div>
            <span>当前</span>
            <span class="jump-index" v-if="listLen !== 0">第 <el-input-number class="index-input" v-model="curNum" size="mini" :min="1" :max="listLen" :step="10"></el-input-number> 句&nbsp;&nbsp;共{{listLen}}句</span>
          </div>
          <el-row class="block sen-block">
            <el-col :span="2">
              <el-button class="sen-btn" type="default" size="medium" icon="el-icon-d-arrow-left" circle @click="pre()"></el-button>
            </el-col>
            <el-col class="sen-wrapper" :span="20">
              <el-input type="text" v-if="senList[curIndex]" class="sen" v-html="senList[curIndex].string"></el-input>
              <div v-else class="sen">暂无内容</div>
            </el-col>
            <el-col :span="2">
              <el-button class="sen-btn" type="default" size="medium" icon="el-icon-d-arrow-right" circle @click="next()"></el-button>
            </el-col>
          </el-row>
          <p>识别结果</p>
          <div el-input type="text" v-html="nlpResult"></div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="信息抽取" name="tab-5">
        <div class="tip" v-if="tip" v-html="tip"></div>
        <el-card shadow="always">
          <div>
            <el-tooltip v-if="srcFilePath" effect="light" placement="top-start">
              <el-button size="mini" type="primary" @click="openFile">打开.na文件</el-button>
              <div slot="content">当前文件路径:{{ srcFilePath }}</div>
            </el-tooltip>
            <el-button v-else size="mini" type="primary" @click="openFile">打开.na文件</el-button>
          </div>
        </el-card>
        <br>
        <el-card shadow="always" v-loading="pageLoading">
          <div>
            <span>当前</span>
            <span class="jump-index" v-if="listLen !== 0">第 <el-input-number class="index-input" v-model="curNum" size="mini" :min="1" :max="listLen" :step="10"></el-input-number> 句&nbsp;&nbsp;共{{listLen}}句</span>
          </div>
          <el-row class="block sen-block">
            <el-col :span="2">
              <el-button class="sen-btn" type="default" size="medium" icon="el-icon-d-arrow-left" circle @click="pre()"></el-button>
            </el-col>
            <el-col class="sen-wrapper" :span="20">
              <el-input type="text" v-if="senList[curIndex]" class="sen" v-html="senList[curIndex].string"></el-input>
              <div v-else class="sen">暂无内容</div>
            </el-col>
            <el-col :span="2">
              <el-button class="sen-btn" type="default" size="medium" icon="el-icon-d-arrow-right" circle @click="next()"></el-button>
            </el-col>
          </el-row>
          <p>识别结果</p>
          <div el-input type="text" v-html="nlpResult"></div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
const fs = require('fs')
const readline = require('readline')
export default {
  data () {
    return {
      pageLoading: false,
      tip: '',
      modelName: 'toolkit',
      srcFilePath: '',
      waitSwitchFilePath: '',
      showError: false,
      senList: [],
      curIndex: 0,
      listLen: 0,
      concatStr: '',
      form1: {
        type: 'txt'
      },
      form2: {
        content: '中国',
        type: 'name'
      },
      form3: {
        content: '清华大学的现任校长是哪个学校毕业的'
      },
      nlpResult: '',
      activeName: 'tab-1',
      actkgUrl: 'http://www.actkg.com',
      curNum: 1,
      isSwitchLoading: false
    }
  },
  created () {
    this.$electron.ipcRenderer.send('get-all-config', this.modelName)
  },
  watch: {
    activeName () {
      this.query()
    },
    curIndex () {
      this.curNum = this.curIndex + 1
      this.query()
    },
    curNum () {
      this.curIndex = this.curNum - 1
    }
  },
  methods: {
    onSwitch () {
      this.concatStr = ''
      if (this.activeName === 'tab-1') {
        this.readFileToArr(this.waitSwitchFilePath, (data) => {
          this.isSwitchLoading = true
          if (this.form1.type === 'txt') {
            this.concatStr = data.map((item) => {
              return '{"string":"' + item + '","entities":[],"relations":[],"dw":[],"dr":[]}'
            }).join('\n')
            this.$electron.ipcRenderer.send('save-as-file-dialog', this.modelName)
          } else {
            console.log(this.form1.type)
            this.concatStr = this.getConcatStr(data, this.form1.type)
            this.$electron.ipcRenderer.send('save-as-file-dialog', this.modelName)
          }
          this.isSwitchLoading = false
        })
      }
    },
    getConcatStr (data, type) {
      var dataLen = data.length
      var resArr = []
      var sen = ''
      var senCount = 0
      var senWords = []
      var latestWord = ''
      var latestWordStart = 0
      var latestTag = ''
      var latestType = ''
      for (var i = 0; i < dataLen; i++) {
        var item = data[i]
        if (item.trim() === '' && latestTag !== '') {
          // 句子末尾
          if (latestTag === 'I') {
            senWords.push('{"pos":"' + latestWordStart + ',' + senCount + '","word":"' + this.escapeStr(latestWord) + '","type":"' + latestType + '","link":"none"}')
            latestWord = ''
            latestWordStart = 0
            latestType = ''
          }
          resArr.push('{"string":"' + this.escapeStr(sen) + '","entities":[' + senWords.join(',') + '],"relations":[],"dw":[],"dr":[]}')
          sen = ''
          senCount = 0
          senWords = []
          latestTag = ''
          latestType = ''
        } else if (item.split(' ')[1] === 'O') {
          // 无标注
          if (latestTag === 'I') {
            senWords.push('{"pos":"' + latestWordStart + ',' + senCount + '","word":"' + this.escapeStr(latestWord) + '","type":"' + latestType + '","link":"none"}')
            latestWord = ''
            latestWordStart = 0
            latestType = ''
          }
          sen += item.split(' ')[0]
          senCount += 1
          latestTag = 'O'
        } else {
          // 有标注
          var ann = item.split(' ')[1]
          var tag = ann.split('-')[0]
          var tp = ann.split('-')[1]
          if (tag === 'B') {
            if (latestTag === 'I') {
              senWords.push('{"pos":"' + latestWordStart + ',' + senCount + '","word":"' + this.escapeStr(latestWord) + '","type":"' + latestType + '","link":"none"}')
              latestWord = ''
              latestWordStart = 0
              latestType = ''
            }
            latestType = tp
            latestWordStart = senCount
          }
          latestWord += item.split(' ')[0].trim()
          sen += item.split(' ')[0].trim()
          senCount += 1
          latestTag = tag
        }
      }
      return resArr.join('\n')
    },
    escapeStr (str) {
      return str.replace(/"/g, "'").replace(/\\/g, '')
    },
    onSubmit () {
      this.nlpResult = ''
      if (this.activeName === 'tab-2' && this.form2.type && this.form2.content) {
        this.$http.get(this.actkgUrl + '/api/graph/entity/?autopick=false&' + this.form2.type + '=' + this.form2.content).then((response) => {
          var res = JSON.parse(JSON.stringify(response))
          console.log(res)
          if (res.status === 200) {
            if (this.form2.type === 'name') {
              for (var i in res.data) {
                this.nlpResult += '<p>可能实体' + (parseInt(i) + 1) + '：</p>'
                for (var key in res.data[i]) {
                  var value = res.data[i][key]
                  this.nlpResult += '<p>' + key + '：' + value + '</p>'
                }
                this.nlpResult += '<br>'
              }
            } else {
              for (var key2 in res.data) {
                var value2 = res.data[key2]
                this.nlpResult += '<p>' + key2 + '：' + value2 + '</p>'
              }
            }
          } else {
            this.nlpResult = '网络错误'
          }
        }).catch((error) => {
          this.nlpResult = JSON.stringify(error)
        })
      } else if (this.activeName === 'tab-3' && this.form3.content) {
        this.$http.get(this.actkgUrl + '/api/graph/qa/?q=' + this.form3.content).then((response) => {
          var res = JSON.parse(JSON.stringify(response))
          console.log(res)
          if (res.status === 200) {
            this.nlpResult += '<p>回答：' + res.data.answer + '</p>'
            if (res.data.triples && res.data.triples.length !== 0) {
              this.nlpResult += '<br><p>涉及的三元组有：</p>'
              for (var i in res.data.triples) {
                var item = res.data.triples[i]
                this.nlpResult += '<p>[' + item[0].neoId + '/' + item[0].label + ']' + item[0].name + '-' + item[1] + '-[' + item[2].neoId + '/' + item[2].label + ']' + item[2].name + '</p>'
              }
            }
          } else {
            this.nlpResult = '网络错误'
          }
        }).catch((error) => {
          this.nlpResult = JSON.stringify(error)
        })
      }
    },
    query () {
      this.nlpResult = ''
      if (this.activeName === 'tab-4') {
        this.$http.get(this.actkgUrl + '/api/nlp/parse/?level=4&content=' + this.senList[this.curIndex].string).then((response) => {
          var res = JSON.parse(JSON.stringify(response))
          if (res.status === 200) {
            this.nlpResult = '<p>分词(SEG)<br>' + res.data.seg.join('/ ') + '</p><br><p>词性标注(POS)<br>' + res.data.pos.join('/ ') + '</p><br><p>实体识别(NER)<br>' + res.data.ner.join('/ ') + '</p><br><p>实体链接(NEL)<br>' + res.data.nel.join('/ ') + '</p>'
          } else {
            this.nlpResult = '网络错误'
          }
        }).catch((error) => {
          this.nlpResult = JSON.stringify(error)
        })
      } else if (this.activeName === 'tab-5') {
        this.$http.get(this.actkgUrl + '/api/nlp/extraction/?model=hybrid&content=' + this.senList[this.curIndex].string).then((response) => {
          var res = JSON.parse(JSON.stringify(response))
          console.log(res)
          if (res.status === 200) {
            for (var i in res.data.results) {
              var item = res.data.results[i]
              this.nlpResult += '<p>句子：' + item.sentence + '</p><p>三元组有：<br>'
              for (var j in item.triples) {
                var item2 = item.triples[j]
                this.nlpResult += '<p>（' + item2[0] + '，' + item2[1] + '，' + item2[2] + '）</p>'
              }
              this.nlpResult += '<br>'
            }
          } else {
            this.nlpResult = '网络错误'
          }
        }).catch((error) => {
          this.nlpResult = JSON.stringify(error)
        })
      }
    },
    handleTabClick () {
      this.curIndex = 0
      this.nlpResult = ''
      this.tip = ''
      this.pageLoading = false
    },
    openFile () {
      console.log('open-file')
      if (this.activeName === 'tab-1') {
        this.$electron.ipcRenderer.send('open-file-dialog-all-type', this.modelName)
      } else {
        this.$electron.ipcRenderer.send('open-file-dialog', this.modelName)
      }
    },
    readFileToArr: (fReadName, callback) => {
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
    readLineCallback (data) {
      this.listLen = data.length
      this.senList = data.map((item) => {
        return JSON.parse(item)
      })
    },
    resetPage () {
      this.curIndex = 0
      this.listLen = 0
      this.senList = []
      this.srcFilePath = ''
      this.pageLoading = false
      this.tip = ''
    }
  },
  mounted () {
    this.$electron.ipcRenderer.on('selected-open-file-' + this.modelName, (event, path) => {
      // const name = path[0].slice(path[0].lastIndexOf('/') + 1)
      this.resetPage()
      if (this.activeName !== 'tab-1') {
        this.srcFilePath = path[0]
        this.readFileToArr(path[0], this.readLineCallback)
      } else {
        this.waitSwitchFilePath = path[0]
      }
    })
    this.$electron.ipcRenderer.on('selected-save-file-' + this.modelName, (event, path) => {
      console.log('save to:' + path)
      var that = this
      fs.writeFile(path, this.concatStr, () => {
        that.$electron.ipcRenderer.send('show-message', '转换成功')
      })
    })
    this.$electron.ipcRenderer.on('get-all-config-reply-' + this.modelName, (event, value) => {
      if (value.hasOwnProperty('toolkitDefaultPath')) {
        this.srcFilePath = value.toolkitDefaultPath
        if (this.srcFilePath) {
          this.readFileToArr(this.srcFilePath, this.readLineCallback)
        }
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.toolkit-page {
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
    margin-left: 20px;
  }
  .sen-block {
    text-align: center;
    .sen {
      border: 1px solid #eee;
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

<template>
  <div class="setting-page">
    <el-tabs type="card" v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="文件格式转化" name="tab-1">
        <div class="tips">TIPS：将不同格式的文件转为.na格式的文件，na格式文件的介绍见"<a style="color: black" href="#/about">关于</a>-NA格式文件介绍"</div>
      </el-tab-pane>
      <el-tab-pane label="实体搜索" name="tab-2">
      </el-tab-pane>
      <el-tab-pane label="中文问答" name="tab-3">
      </el-tab-pane>
      <el-tab-pane label="分词/词性标注/实体识别/链接" name="tab-4">
        <div class="toolkit-page">
          <p>① 打开句子文件</p>
          <div class="block open-block">
            <el-button size="mini" type="primary" @click="openFile">打开NA文件</el-button>
            <div v-if="srcFilePath" class="el-upload__tip">当前打开文件路径：{{ srcFilePath }}</div>
          </div>
          <p>② 查看句子</p>
          <div class="jump-index" v-if="listLen !== 0"><el-input-number v-model="curIndex" size="mini" :min="0" :max="listLen-1" controls-position="right"></el-input-number> / {{listLen - 1}}</div>
          <el-row class="block sen-block" id="sen-block">
            <el-col :span="2">
              <el-button class="sen-btn" type="primary" size="medium" icon="el-icon-d-arrow-left" circle @click="pre()"></el-button>
            </el-col>
            <el-col class="sen-wrapper" :span="20">
              <el-input type="text" v-if="senList[curIndex]" class="sen" v-html="senList[curIndex].string"></el-input>
              <div v-else class="sen">暂无内容</div>
            </el-col>
            <el-col :span="2">
              <el-button class="sen-btn" type="primary" size="medium" icon="el-icon-d-arrow-right" circle @click="next()"></el-button>
            </el-col>
          </el-row>
          <p>③ 识别结果</p>
          <div el-input type="text" v-html="nlpResult"></div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="信息抽取" name="tab-5">
        <div class="toolkit-page">
          <p>① 打开句子文件</p>
          <div class="block open-block">
            <el-button size="mini" type="primary" @click="openFile">打开NA文件</el-button>
            <div v-if="srcFilePath" class="el-upload__tip">当前打开文件路径：{{ srcFilePath }}</div>
          </div>
          <p>② 查看句子</p>
          <div class="jump-index" v-if="listLen !== 0"><el-input-number v-model="curIndex" size="mini" :min="0" :max="listLen-1" controls-position="right"></el-input-number> / {{listLen - 1}}</div>
          <el-row class="block sen-block" id="sen-block">
            <el-col :span="2">
              <el-button class="sen-btn" type="primary" size="medium" icon="el-icon-d-arrow-left" circle @click="pre()"></el-button>
            </el-col>
            <el-col class="sen-wrapper" :span="20">
              <el-input type="text" v-if="senList[curIndex]" class="sen" v-html="senList[curIndex].string"></el-input>
              <div v-else class="sen">暂无内容</div>
            </el-col>
            <el-col :span="2">
              <el-button class="sen-btn" type="primary" size="medium" icon="el-icon-d-arrow-right" circle @click="next()"></el-button>
            </el-col>
          </el-row>
          <p>③ 识别结果</p>
          <div el-input type="text" v-html="nlpResult"></div>
        </div>
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
      srcFilePath: '',
      showError: false,
      senList: [],
      curIndex: 0,
      listLen: 0,
      nlpResult: '',
      activeName: 'tab-1',
      actkgUrl: 'http://www.actkg.com'
    }
  },
  created () {
    this.$electron.ipcRenderer.send('get-all-config')
  },
  watch: {
    activeName () {
      this.query()
    },
    curIndex () {
      this.query()
    }
  },
  methods: {
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
    },
    openFile () {
      console.log('open-file-dialog')
      this.$electron.ipcRenderer.send('open-file-dialog')
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
      this.srcFilePath = ''
    }
  },
  mounted () {
    this.$electron.ipcRenderer.on('selected-open-file', (event, path) => {
      // const name = path[0].slice(path[0].lastIndexOf('/') + 1)
      this.resetPage()
      this.srcFilePath = path[0]
      this.readFileToArr(path[0], this.readLineCallback)
    })
    this.$electron.ipcRenderer.on('get-all-config-reply', (event, value) => {
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
      margin-top: 10px;
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

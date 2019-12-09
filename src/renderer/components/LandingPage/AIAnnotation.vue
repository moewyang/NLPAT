<template>
  <div class="ai-annotation-page">
    <el-card shadow="always">
      <el-input type="textarea" v-model="sentence" :rows="3"></el-input>
    </el-card>
    <br>
    <el-card shadow="always">
      <span>请选择模式：</span>
      <el-select v-model="mode">
        <el-option
          v-for="(item, index) in modeOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-button @click="aiTap" type="success" :loading="aiBtnStatus" style="float: right;">开始</el-button>
    </el-card>
    <br>
    <el-card shadow="always" v-loading="pageLoading">
      <p>实体标注结果:</p>
      <div v-for="(item, index) in senDict" v-bind:key="index">
        <el-row class="block sen-block">
          <el-col class="sen-wrapper">
            <el-input type="text" class="sen" v-html="color(item)"></el-input>
          </el-col>
        </el-row>
        <el-form class="block entity-block" ref="form" label-width="40px" label-position="left">
          <el-form-item v-for="(it, i) in item.entities" v-bind:key="i" label-width="0">
            <el-badge :value="it.id" type="primary">
              <el-tag type="primary">{{ it.mention }}</el-tag>
            </el-badge>
            &nbsp;=>
            <el-tag type="success">{{ it.tag }}</el-tag>
            &nbsp;
            <el-tag v-if="it.link !== 'nil'" type="warning">{{ it.link }}</el-tag>
            &nbsp;
            <el-autocomplete :highlight-first-item="true" class="entity-auto-complete" popper-class="entitiy-pull-down" v-model="item.description" :fetch-suggestions="querySearchAsync(it.mention, it.link)" placeholder="点击查看歧义实体链接" clearable>
              <template slot-scope="{ item }">
                <div class="nid">{{ item.neoId }}</div>
                <span class="ndes">{{ item.description }}</span>
              </template>
            </el-autocomplete>
          </el-form-item>
        </el-form>
      </div>
      <!--<div v-else class="sen">暂无内容</div>-->
    </el-card>
    <br>
    <el-card shadow="always" v-loading="pageLoading">
      <p>关系图:</p>
      <el-form class="block graph-block">
        <div id="echart" style="width: 600px; height: 900px;"></div>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import echarts from 'echarts'
export default {
  data () {
    return {
      modelName: 'aiannotation',
      // sentence: '毛加恩公开高以翔纪念影片满满泪点，绅士王沥川从未离开', 为什么导演杨洁说《西游记》永远是我心中的一个结一个痛
      sentence: '《心理罪》是由凤凰联动影业和爱奇艺联合出品、根据作家雷米所著的同名系列小说改编而成的犯罪悬疑网络剧，由五百执导，顾小白编剧，陈若轩、付枚、王泷正、温心等联袂主演。中国官方宣布，国务院总理李克强此次出访非洲，夫人程虹随行。《妄想》是香港男歌手张国荣的一首粤语歌曲，由林夕填词，唐奕聪谱曲，张国荣演唱。',
      senDict: null,
      pageLoading: false,
      kgUrl: 'http://localhost:7474/db/data/transaction/commit',
      kgAuthCode: 'bmVvNGo6MjA4MDI5OTE=',
      curIndex: 0,
      listLen: 0,
      descriptions: [],
      isOnSubmit: false,
      myChart: null,
      modeOptions: [{
        value: 'joint',
        label: '联合抽取'
      }, {
        value: 'pipeline',
        label: '流水线抽取'
      }],
      mode: 'joint',
      aiBtnStatus: false,
      // aiUrl: 'http://localhost:20006/',
      aiUrl: 'http://localhost:8000/'
    }
  },
  created () {
  },
  watch: {
    sentence: function (oldValue, newValue) {
      this.senDict = null
      this.myChart.dispose()
      this.myChart = echarts.init(document.getElementById('echart'))
    }
  },
  mounted () {
    this.myChart = echarts.init(document.getElementById('echart'))
  },
  methods: {
    aiTap () {
      this.pageLoading = true
      this.aiBtnStatus = true
      // this.$http.get(this.aiUrl + this.mode + '/' + this.sentence).then((response) => {
      this.$http.get(this.aiUrl + 'api/nlp/ie/?mode=' + this.mode + '&content=' + this.sentence).then((response) => {
        this.aiBtnStatus = false
        console.log(response)
        this.senDict = response.data.results
        this.showGraph(response.data.graph)
        this.pageLoading = false
      }).catch((error) => {
        this.aiBtnStatus = false
        console.log(error)
      })
      // temp
      // clearTimeout(this.timeout)
      // this.timeout = setTimeout(() => {
      //   var temp = {
      //     string: '为什么导演杨洁说《西游记》永远是我心中的一个结一个痛',
      //     entities: [
      //       {
      //         id: 1,
      //         pos: '5,7',
      //         name: '杨洁',
      //         type: '人物',
      //         link: 8890014
      //       },
      //       {
      //         id: 2,
      //         pos: '9,12',
      //         name: '西游记',
      //         type: '影视作品',
      //         link: 5407654
      //       }
      //     ],
      //     relations: [
      //       {
      //         entity1: '9,12',
      //         entity2: '5,7',
      //         relation: '导演'
      //       }
      //     ]
      //   }
      //   this.senDict = temp
      //   this.showGraph()
      //   this.pageLoading = false
      // }, 3000 * Math.random())
    },
    color (item) {
      var senArr = item.sentence.split('')
      var entities = item.entities
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
    querySearchAsync (name, link) {
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
                var flag = 0
                descriptions = resData.map((item, i) => {
                  var index = i
                  if (item.row[0] !== link && flag === 0) {
                    index = i + 1
                  } else if (item.row[0] === link) {
                    index = 0
                    flag = 1
                  } else {
                    index = i
                  }
                  return {
                    id: index,
                    neoId: item.row[0],
                    description: item.row[1].description,
                    value: '' + item.row[0]
                  }
                })
                descriptions = descriptions.sort((item1, item2) => item1.id - item2.id)
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
    showGraph (graph) {
      // myChart.showLoading()
      var nodes = []
      var links = []
      var categories = []
      graph.nodes.forEach(function (node) {
        if (categories.indexOf(node.category) < 0) {
          categories.push({
            name: node.category
          })
        }
        node.symbol = 'circle'
        node.symbolSize = 15
        node.x = null
        node.y = null
        node.itemStyle = null
        node.label = {
          normal: {
            show: true,
            position: 'right'
          }
        }
        nodes.push(node)
      })
      // this.senDict[0].relations.forEach((edge, i) => {
      //   var source = this.senDict[0].entities.filter((item) => {
      //     return item.pos === edge.entity1.pos
      //   })[0].id
      //   var target = this.senDict[0].entities.filter((item) => {
      //     return item.pos === edge.entity2.pos
      //   })[0].id
      //   links.push({
      //     id: i,
      //     source: source.toString(),
      //     target: target.toString(),
      //     name: edge.relation
      //   })
      // })
      graph.links.forEach(function (edge) {
        links.push(edge)
      })
      var colorPalette = ['#E01F54', '#001852', '#e05038', '#009966', '#9fa8a3', '#89bdd3', '#e6af4b', '#d3758f']
      var fontSize = 12
      this.myChart.setOption({
        color: colorPalette,
        backgroundColor: 'white',
        title: {
          text: '实体关系图',
          top: '1%',
          left: '1%',
          textStyle: {
            color: '#333333',
            fontSize: fontSize * 1.8,
            fontWeight: 'bolder'
          },
          subtext: '图中共有 ' + graph.nodes.length + ' 个节点以及 ' + graph.links.length + ' 条关系',
          subtextStyle: {
            color: '#333333',
            fontSize: fontSize,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          // formatter: function (params) {
          //   if (params.dataType === 'node') {
          //     return params.data.mention
          //   } else {
          //     return params.data.name
          //   }
          // }
          formatter: function (params) {
            return params.data.name
          }
        },
        legend: [{
          data: categories.map(function (a) {
            return a.name
          }),
          left: 'middle',
          orient: 'horizontal',
          itemGap: 20,
          selectedMode: false,
          textStyle: {
            color: '#333333',
            fontFamily: '微软雅黑'
          }
        }],
        series: [{
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          categories: categories,
          lineStyle: {
            normal: {
              color: 'source',
              width: 5,
              curveness: 0.2
            }
          },
          force: {
            repulsion: 1000,
            layoutAnimation: false
          },
          roam: true,
          focusNodeAdjacency: true,
          animationDuration: 2000
        }],
        textStyle: {
          fontFamily: '微软雅黑',
          fontSize: fontSize
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.ai-annotation-page {
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
    .sen {
      border: 1px solid #EEE;
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
    padding: 20px 20px 0 20px;
    overflow-y: auto;
    .entity-auto-complete {
      width: 65%;
    }
  }
  .graph-block {
    border: 1px solid #EEE;
    border-radius: 10px;
    padding: 20px 20px 0 20px;
    height: 1000px;
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

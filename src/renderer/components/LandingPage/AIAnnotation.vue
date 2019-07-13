<template>
  <div class="ai-annotation-page">
    <el-card shadow="always">
      <el-input type="text" v-model="sentence" clearable>
        <el-button slot="append" @click="aiTap">AI</el-button>
      </el-input>
    </el-card>
    <br>
    <el-card shadow="always" v-loading="pageLoading">
      <p>AI标注结果:</p>
      <el-row class="block sen-block">
        <el-col class="sen-wrapper">
          <el-input type="text" v-if="senDict" class="sen" v-html="color(sentence)"></el-input>
          <div v-else class="sen">暂无内容</div>
        </el-col>
      </el-row>
      <p>实体信息:</p>
      <el-form class="block entity-block" ref="form" label-width="40px" label-position="left">
        <div v-if="senDict">
          <el-form-item v-for="(item, i) in senDict.entities" v-bind:key="i" label-width="0">
            <el-badge :value="item.id" type="primary">
              <el-tag type="primary">{{ item.name }}</el-tag>
            </el-badge>
            &nbsp;=>
            <el-tag type="success">{{ item.type }}</el-tag>
            &nbsp;
            <el-tag type="warning">{{ item.link }}</el-tag>
            &nbsp;
            <el-autocomplete :highlight-first-item="true" class="entity-auto-complete" popper-class="entitiy-pull-down" v-model="item.description" :fetch-suggestions="querySearchAsync(item.name, item.link)" placeholder="点击查看歧义实体链接" clearable>
              <template slot-scope="{ item }">
                <div class="nid">{{ item.neoId }}</div>
                <span class="ndes">{{ item.description }}</span>
              </template>
            </el-autocomplete>
          </el-form-item>
        </div>
      </el-form>
      <p>关系图:</p>
      <el-form class="block graph-block">
        <div id="echart" style="width: 600px; height: 200px;"></div>
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
      sentence: '为什么导演杨洁说《西游记》永远是我心中的一个结一个痛',
      senDict: null,
      pageLoading: false,
      kgUrl: 'http://localhost:7474/db/data/transaction/commit',
      kgAuthCode: 'bmVvNGo6MjA4MDI5OTE=',
      curIndex: 0,
      listLen: 0,
      descriptions: [],
      isOnSubmit: false,
      myChart: null
    }
  },
  created () {
  },
  mounted () {
    this.myChart = echarts.init(document.getElementById('echart'))
  },
  methods: {
    aiTap () {
      this.pageLoading = true
      // temp
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        var temp = {
          string: '为什么导演杨洁说《西游记》永远是我心中的一个结一个痛',
          entities: [
            {
              id: 1,
              pos: '5,7',
              name: '杨洁',
              type: '人物',
              link: 8890014
            },
            {
              id: 2,
              pos: '9,12',
              name: '西游记',
              type: '影视作品',
              link: 5407654
            }
          ],
          relations: [
            {
              entity1: '9,12',
              entity2: '5,7',
              relation: '导演'
            }
          ]
        }
        this.senDict = temp
        this.showGraph()
        this.pageLoading = false
      }, 3000 * Math.random())
    },
    color (sen) {
      var senArr = sen.split('')
      var entities = this.senDict.entities
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
    showGraph () {
      // myChart.showLoading()
      var nodes = []
      var links = []
      var categories = []
      this.senDict.entities.forEach(function (entity) {
        if (categories.indexOf(entity.type) < 0) {
          categories.push({
            name: entity.type
          })
        }
        entity.category = entity.type
        entity.symbol = 'circle'
        entity.symbolSize = 15
        entity.x = null
        entity.y = null
        entity.itemStyle = null
        entity.label = {
          normal: {
            show: true,
            position: 'right'
          }
        }
        nodes.push(entity)
      })
      this.senDict.relations.forEach((edge, i) => {
        var source = this.senDict.entities.filter((item) => {
          return item.pos === edge.entity1
        })[0].id
        var target = this.senDict.entities.filter((item) => {
          return item.pos === edge.entity2
        })[0].id
        links.push({
          id: i,
          source: source.toString(),
          target: target.toString(),
          name: edge.relation
        })
      })
      this.myChart.setOption({
        tooltip: {
          formatter: function (params) {
            if (params.dataType === 'node') {
              return params.data.category
            } else {
              return params.data.name
            }
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
          fontSize: 12
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

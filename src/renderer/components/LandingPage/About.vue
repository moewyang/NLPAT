<template>
    <div class="about-page">
      <el-tabs type="card">
        <el-tab-pane label="技术介绍">
          <el-card shadow="always">
            <div class="title">远程监督</div>
            <div class="content">
              <p>即Distant Supervision，是目前关系抽取中比较常见的一类做法。</p>
              <p>该方法由 M Mintz 大佬于ACL2009上首次提出，它既不是单纯的传统意义上的监督语料，当然也不是无监督。它是一种用KB去对齐朴素文本的标注方法（Distant supervision for relation extraction without labeled data ）。KB中已经有关系名和实体对的三元组，只需要把这三元组付给朴素文本中相应的句子就可以了，那按照什么原则付？（数据库监督）M Mintz 提出了一种十分大胆的假设:如果我们训练语料中的句子所包含的实体对在数据库中有关系的体现，那么我们认为语料库中所有包含相同实体对的句子都表达此关系。那么，自然而然的我们提取特征的时候就会出现很多噪声。比如两个实体之间还有别的关系或者是没有关系，这样的训练数据会对我们的关系抽取器产生影响。</p>
            </div>
          </el-card>
          <br>
          <el-card shadow="always">
            <div class="title">常见标注方法</div>
            <div class="content">
              <p>IO，BIO，BIOES，BMEWO</p>
              <p></p>
            </div>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="NA格式文件介绍">
          <el-card shadow="always">
            <div class="title">NA文件</div>
            <p>NA文件是专用于nlpat软件的“.na”文件格式，该格式文件为基于远程监督KG库的单句标注信息文件。每一行是和一个句子有关的json格式串，具体格式如下：</p>
            <img src="~@/assets/na.png" alt=".an文件格式" width="50%"/>
            <ul>
              <li>string：原句子</li>
              <li>entities：实体（start：实体开始位置，end：实体结束位置，word：实体名称，type：实体标注类型</li>
              <li>links：实体链接（对应KG中的实体id）</li>
              <li>relations：实体关系（表示entity1到entity2的关系，对应KG中的关系id）</li>
            </ul>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="系统软件介绍">
          <el-card shadow="always">
            <img src="~@/assets/kglogo.png" />
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
          <img src="~@/assets/actlab.jpg" />
          <el-link type="primary" @click="open('http://www.act.buaa.edu.cn/')">欢迎访问主页</el-link>
          <p>北航计算机新技术研究所（Institute of Advanced Computing Technology,简称ACT）成立于1999年，现有教师19人，其中院士1人、海外兼职教授2人、优青1人及优博1人。在校博士生40余人、硕士生150余人。现已初步形成了以知名学者为带头人、以青年教师为骨干、以研究生为主力的创新团队。ACT秉承“进取（Active）、创新（Creative）、合作(Teamwork)”的治学理念，在网络计算（包括大数据计算与云计算等）、互联网软件与服务、安全关键实时系统等方面展开研究，并成立了大数据科学与工程国际研究中心与中国云产业联盟。ACT具有良好的科研环境，是可信网络计算技术国防重点学科实验室的依托单位，拥有IPv4/v6高速互联网、十万亿次级计算能力与PB级存储能力，可通过网络计算系统CROWN、iVIC及Ring等共享海内外资源和数据处理等服务。</p>
          <p>ACT在国家自然科学基金重大项目、国家杰出青年基金、国家973计划、863计划重大项目、国家发改委产业化专项以及国际合作等项目的支持下，共获得国家科学技术进步二等奖2项、省部级科学技术一等奖5项、何梁何利科技奖1项，申请发明专利百余项，在FAST、VLDB、SIGMOD、PODS、DSN、WWW等国内外重要学术会议和期刊发表论文200余篇。</p>
          <p>ACT坚持学术至上和开放合作，举办了SRDS07、WWW08、ICWS08和ISORC12等国际学术会议，并于2013年1月成立了世界万维网联盟W3C中国总部，与美国麻省理工大学（MIT）、欧洲数学与信息学研究联盟（ERCIM）和日本庆应大学(KEIO)等共同运营W3C，对于促进我国ICT行业参与国际合作及竞争具有重要意义。</p>
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

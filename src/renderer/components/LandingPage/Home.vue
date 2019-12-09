<template>
    <div class="home-page">
        <span class="title">欢迎使用NLPAT</span>
        <div class="doc">
            <div class="subtitle">软件介绍</div>
            <ul class="functions">
                <li>北航“知行”中文知识图谱标注软件NLPAT（Natural Language Processing Annotation Toolkit）是一款集命名实体识别标注工具、命名实体链接标注工具、命名实体关系标注工具、自动信息抽取（AI自动标注）等为一身的客户端软件。</li>
                <li>本软件基于“.na”文件格式进行操作，部分功能需要链接远程图数据库进行操作，如Neo4J。</li>
                <li>本软件界面清新美观、操作人性化，为中文信息抽取研究在基础数据领域提供了大量帮助。</li>
            </ul>
            <br>
            <div class="subtitle">软件功能</div>
            <ul class="functions">
                <li><router-link to='/entity-tagging'>实体标注</router-link></li>
                <li><router-link to='/entity-linking'>实体链接标注</router-link></li>
                <li><router-link to='/entity-relationship'>实体关系标注</router-link></li>
                <li><router-link to='/ai-annotation'>AI自动标注</router-link></li>
                <li><router-link to='/toolkit'>其他工具集</router-link></li>
                <li><router-link to='/setting'>配置</router-link></li>
            </ul>
        </div>
    </div>
</template>
<style>
    .home-page .title {
        font-size: 2.5em;
        font-weight: 700;
    }
    .home-page .doc {
        margin-top: 20px;
    }
    .home-page .doc .subtitle {
        font-size: 1.2em;
        font-weight: 600;
    }
    .home-page .doc .functions {
        margin-top: 15px;
        margin-left: 20px;
    }
    .panel {
        overflow: auto;
    }
</style>

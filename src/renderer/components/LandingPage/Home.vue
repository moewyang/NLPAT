<template>
    <div class="home-page">
        <span class="title">欢迎使用NLPAT</span>
        <div class="doc">
            <div class="subtitle">功能</div>
            <ul class="functions">
                <li><router-link to='/entity-tagging'>实体标注</router-link></li>
                <li><router-link to='/entity-linking'>实体链接标注</router-link></li>
                <li><router-link to='/entity-relationship'>实体关系标注</router-link></li>
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
</style>

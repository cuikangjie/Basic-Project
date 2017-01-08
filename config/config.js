var config={};

config.debug = true;

config.devp=false;

config.es6 = true;

config.buildJs={};

config.buildJs.debug=true;

config.buildJs.names=[
  'jquery.min.js',
  'vue.min.js'
];
config.buildCss={};
config.buildCss.names=[];

config.httpServerOptions ={
  name: 'App',
  root: 'dist',
  port: 8001,
  livereload: true
};

config.htmlOptions = {
    removeComments: false,//清除HTML注释
    collapseWhitespace: false,//压缩HTML
    collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
    minifyJS: true,//压缩页面JS
    minifyCSS: true//压缩页面CSS
};


exports.data=config;

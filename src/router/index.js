import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'; //element
import '../../static/css/public.css' /*引入公共样式*/
import tools from '../components/tools';  //工具
import login from '@/components/login/login'   //login.vue
import main from '@/components/home/main/main'   //main.vue
//公众号管理
import configure from '@/components/home/public/configure'   //公众号配置
import menu from '@/components/home/public/menu'   //自定义菜单
import autoReply from '@/components/home/public/autoReply'   //自动回复
//消息推送
import template from '@/components/home/pushMessage/template'   //模板消息
//系统管理
import roleManage from '@/components/home/systemManager/roleManage'
import systemUser from '@/components/home/systemManager/systemUser'
Vue.use(ElementUI)
Vue.use(Router)
Vue.prototype.tools = tools
export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: login
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/main',
      name: 'main',
      component: main,
      children: [
        { 
        	name: 'configure',
          path: '/configure',
          component: configure
        },
        {
        	name:"menu",
          path: '/menu',
          component: menu
        },
        {
        	name:"autoReply",
          path: '/autoReply',
          component: autoReply
        },
        {
        	name:"template",
          path: '/template',
          component: template
        },
        {
        	name:"roleManage",
          path: '/roleManage',
          component: roleManage
        },
        {
        	name:"systemUser",
          path: '/systemUser',
          component: systemUser
        }
      ]
    }
  ]
})


import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

/** note: Submenu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    perms: ['GET /aaa','POST /bbb']     will control the page perms (you can set multiple perms)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
 **/
export const constantRouterMap = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
    // redirect: '401',
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', noCache: true }
      }
    ]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/target',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: false,
    name: 'targetManage',
    meta: {
      title: '布控管理',
      icon: 'list'
    },
    children: [
      {
        path: 'targetNum',
        component: () => import('@/views/target/targetNum'),
        name: 'targetNum',
        meta: {
          title: '布控号码',
          noCache: true
        }
      },
      {
        path: 'targetFace',
        component: () => import('@/views/target/targetFace'),
        name: 'targetFace',
        meta: {
          perms: ['GET /admin/brand/list', 'POST /admin/brand/create', 'GET /admin/brand/read', 'POST /admin/brand/update', 'POST /admin/brand/delete'],
          title: '布控人脸',
          noCache: true
        }
      }

    ]
  },

  {
    path: '/captureHistory',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'targetManage',
    roles: ['user'],
    meta: {
      title: '捕获历史',
      icon: 'list'
    },
    children: [
      {
        path: 'captureFace',
        component: () => import('@/views/captureHistory/captureFace'),
        name: 'captureFace',
        meta: {
          title: '人脸捕获',
          noCache: true
        }
      },
      {
        path: 'captureNum',
        component: () => import('@/views/captureHistory/captureNum'),
        name: 'captureNum',
        meta: {
          perms: ['GET /admin/brand/list', 'POST /admin/brand/create', 'GET /admin/brand/read', 'POST /admin/brand/update', 'POST /admin/brand/delete'],
          title: '号码捕获',
          noCache: true
        }
      }

    ]
  },

  {
    path: '/campareResult',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'targetManage',
    meta: {
      title: '比对结果',
      icon: 'list'
    },
    children: [
      {
        path: 'faceCampare',
        component: () => import('@/views/campareResult/faceCampare'),
        name: 'faceCampare',
        meta: {
          title: '人脸比对',
          noCache: true
        }
      },
      {
        path: 'relatedNum',
        component: () => import('@/views/campareResult/relatedNum'),
        name: 'relatedNum',
        meta: {
          title: '关联号码',
          noCache: true
        }
      },
      {
        path: 'targetInfo',
        component: () => import('@/views/targetInfo/targetInfo'),
        name: 'targetInfo',
        meta: {
          title: '号码比对',
          noCache: true
        }
      }

    ]
  },

  // {
  //   path: '/video',
  //   component: Layout,
  //   redirect: 'noredirect',
  //   alwaysShow: true,
  //   name: 'videoManage',
  //   meta: {
  //     title: '视频广场',
  //     icon: 'chart'
  //   },
  //   children: [
  //     {
  //       path: 'live',
  //       component: () => import('@/views/video/live'),
  //       name: 'region',
  //       meta: {
  //         perms: ['GET /admin/video/live'],
  //         title: '视频直播',
  //         noCache: true
  //       }
  //     },
  //     {
  //       path: 'record',
  //       component: () => import('@/views/video/record'),
  //       name: 'record',
  //       meta: {
  //         perms: ['POST /admin/video/record/list', 'GET /admin/video/record/delete', 'POST /admin/video/record/search'],
  //         title: '视频录播',
  //         noCache: true
  //       }
  //     }
  //   ]
  // },
  {
    path: '/fenXi',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'fenXi',
    meta: {
      title: '分析管理',
      icon: 'chart'
    },
    children: [
      {
        path: 'fenXi1',
        component: () => import('@/views/guishu/guishu'),
        name: 'fenXi1',
        meta: {
          perms: ['GET /admin/video/live'],
          title: '归属分析',
          noCache: true
        }
      },
      {
        path: 'fenXi2',
        component: () => import('@/views/renliu/renliu'),
        name: 'fenXi2',
        meta: {
          perms: ['POST /admin/video/record/list', 'GET /admin/video/record/delete', 'POST /admin/video/record/search'],
          title: '人流分析',
          noCache: true
        }
      }
      // {
      //   path: 'fenXi3',
      //   component: () => import('@/views/tongxing/tongxing'),
      //   name: 'fenXi3',
      //   meta: {
      //     perms: ['POST /admin/video/record/list', 'GET /admin/video/record/delete', 'POST /admin/video/record/search'],
      //     title: '同行分析',
      //     noCache: true
      //   }
      // },
      // {
      //   path: 'fenXi4',
      //   component: () => import('@/views/pinfan/pinfan'),
      //   name: 'fenXi4',
      //   meta: {
      //     perms: ['POST /admin/video/record/list', 'GET /admin/video/record/delete', 'POST /admin/video/record/search'],
      //     title: '频繁分析',
      //     noCache: true
      //   }
      // }
    ]
  },
  {
    path: '/devmana',
    component: Layout,
    redirect: 'device',
    children: [
      {
        path: 'device',
        component: () => import('@/views/devmana/device'),
        name: 'device',
        meta: { title: '设备管理', icon: 'dashboard', noCache: true }
      }
    ]
  },

  {
    path: '/sys',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'sysManage',
    meta: {
      title: '系统管理',
      icon: 'chart'
    },
    children: [
      {
        path: 'admin',
        component: () => import('@/views/sys/admin'),
        name: 'admin',
        meta: {
          perms: ['GET /admin/admin/list', 'POST /admin/admin/create', 'POST /admin/admin/update', 'POST /admin/admin/delete'],
          title: '用户管理',
          noCache: true
        }
      },
      {
        path: 'rolePermission',
        component: () => import('@/views/sys/rolePermission'),
        name: 'rolePermission',
        meta: {
          perms: ['GET /role/permission/list'],
          title: '权限管理',
          noCache: true
        }
      },
      {
        path: 'logResult',
        component: () => import('@/views/log/logResult'),
        name: 'admin',
        meta: {
          perms: ['GET /admin/admin/list', 'POST /admin/admin/create', 'POST /admin/admin/update', 'POST /admin/admin/delete'],
          title: '日志管理',
          noCache: true
        }
      }
      // {
      //     path: 'logResult',
      //     component: () => import('@/views/log/logResult'),
      //     name: 'logResult',
      //     meta: {
      //       perms: ['POST /admin/video/record/list', 'GET /admin/video/record/delete', 'POST /admin/video/record/search'],
      //       title: '日志管理',
      //       noCache: true
      //     }
      // }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    children: [
      {
        path: 'password',
        component: () => import('@/views/profile/password'),
        name: 'password',
        meta: { title: '修改密码', noCache: true }
      }
    ],
    hidden: true
  },

  { path: '*', redirect: '/404', hidden: true }
]

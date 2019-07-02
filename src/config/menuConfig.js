const menuList = [
  {
    title: '仪表盘',
    key: '/dashboard',
    icon: 'dashboard'
  },
  {
    title: '工作台',
    key: '/workbench',
    icon: 'project',
    children: [
      {
        title: '我的待办',
        key: '/workbench/ticket'
      },
      {
        title: '我的排班',
        key: '/workbench/scheduling'
      },
    ]
  },
  {
    title: '工单管理',
    key: '/ticket',
    icon: 'alert',
    children: [
      {
        title: '工单列表',
        key: '/ticket/list'
      },
      {
        title: '提交工单',
        key: '/ticket/add'
      },
    ]
  },
  {
    title: '用户管理',
    key: '/user',
    icon: 'user',
    super: true
  },
  {
    title: '资产管理',
    key: '/server',
    icon: 'database'
  },
  {
    title: '值班管理',
    key: '/scheduling',
    icon: 'calendar'
  },
  // {
  //   title: '系统设置',
  //   key: '/setting',
  //   icon: 'setting'
  // }
]

export default menuList;

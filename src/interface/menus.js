import Cookies from 'js-cookie'
const MenuConfig = [
  {
    text: 'Timesheet Submission',
    icon: 'user',
    link: '/timesheet',
    permissible: {
      oneperm: true,
      requiredPermissions: ['work_report_create']
    },

    subMenu: [
      {
        text: 'My Timesheet',
        icon: 'user-add',
        link: '/timesheet/list',
        title: 'Timesheet',
        permissible: {
          oneperm: true,
          requiredPermissions: ['work_report_read', 'work_report_create']
        },
      },
      {
        text: 'Employees submissions',
        icon: 'user-add',
        link: '/timesheet/review',
        title: 'Timesheet Review',
        permissible: {
          oneperm: true,
          requiredPermissions: ['charge_code_create']
        },
      },
    ]
  },
  {
    text: 'Work Configuration',
    icon: 'team',
    link: '/timeAttendence',
    permissible: {
      requiredPermissions: ['charge_code_read']
    },
    subMenu: [
      {
        text: 'Charge Code',
        icon: 'team',
        link: '/chargecode/list',
        title: 'Charge Code List',
        permissible: {
          requiredPermissions: ['charge_code_read']
        },
        callback: () => {
          Cookies.set('active_tab', 'ChargeCode')
        }
      },
      {
        text: 'Work Presets',
        icon: 'team',
        link: '/workpreset/list',
        title: 'Work Presets',
        permissible: {
          requiredPermissions: ['work_preset_create']
        },
      }
    ]
  },
  {
    text: 'Dashboard Menu',
    icon: 'team',
    link: '/dashboard',
    permissible: {
      requiredPermissions: ['admin']
    }
  },
  {
    text: 'Holiday Configuration',
    icon: 'user',
    link: '/timeconfiguration',
    permissible: {
      oneperm: true,
      requiredPermissions: ['holiday_preset_create', 'company_holiday_create']
    },
    subMenu: [
      {
        text: 'Company Holiday',
        icon: 'user-add',
        link: '/companyholiday/list',
        title: 'Company Holiday',
        permissible: {
          requiredPermissions: ['company_holiday_create']
        },
      },
      {
        text: 'Holiday Presets',
        icon: 'user-add',
        link: '/holidaypreset/list',
        title: 'Holiday Presets',
        permissible: {
          requiredPermissions: ['holiday_preset_create']
        },
      }
    ]
  }
]

export { MenuConfig }

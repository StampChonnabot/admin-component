import WorkPresetsComponents from '../page/WorkSchedule/WorkPresets';
import ViewCompanyHoliday from '../page/CompanyHoliday/ViewCompanyHoliday'
import ViewCompanyHolidayDetail from '../page/CompanyHoliday/ViewCompanyHolidayDetail'
import CreateCompanyHoliday from '../page/CompanyHoliday/CreateCompanyHoliday'
import EditCompanyHoliday from '../page/CompanyHoliday/EditCompanyHoliday'
import ViewHolidayPresets from '../page/HolidayPreset/ViewHolidayPresets'
import CreateHolidayPreset from '../page/HolidayPreset/CreateHolidayPreset'
import ViewHolidatPresetDetail from '../page/HolidayPreset/ViewHolidayPresetDetail'
import EditHolidayPreset from '../page/HolidayPreset/EditHolidayPreset'
import ViewChargeCodeList from '../page/ChargeCode/ViewChargeCodeList'
import ViewChargeCodeDetails from '../page/ChargeCode/ViewChargeCodeDetails';
import CreateChargeCode from '../page/ChargeCode/CreateChargeCode'
import EditChargeCode from '../page/ChargeCode/EditChargeCode'
import CreateReportConfiguration from '../page/ReportConfiguration/CreateReportConfiguration'
import EditReportConfiguration from '../page/ReportConfiguration/EditReportConfiguration'
import DisplayReportConfiguration from '../page/ReportConfiguration/DisplayReportConfiguration'
import CreatePresetsComponents from '../page/WorkSchedule/CreatePreset';
import EditWorkPresetComponents from '../page/WorkSchedule/EditPreset';
import WorkPresetDetailsComponents from '../page/WorkSchedule/WorkPresetDetails';
import TimeSheetListComponent from '../page/TimeSheet/TimeSheetList';
// import TimeSheetSubmission from '../page/TimeSheet/TimeSheetSubmission'
import TimeSheetSubmission from '../page/TimeSheet/NewTimesheetSubmission'
import ProgressReview from '../page/WorkProgressSubmission/ProgressReview';
export const RoutesConfig = [
  
  {
      path: '/workpreset/list',
      component: WorkPresetsComponents,
      permissible: {
        requiredPermissions: ['work_preset_read']
      },
  },
  {
    path: '/workpreset/create',
    component: CreatePresetsComponents,
    permissible: {
      requiredPermissions: ['work_preset_create']
  },
  },
  {
    path: '/workpreset/edit',
    component: EditWorkPresetComponents,
    permissible: {
      requiredPermissions: ['work_preset_edit']
    },
  },
  {
    path: '/workpreset/details',
    component: WorkPresetDetailsComponents,
    permissible: {
      requiredPermissions: ['work_preset_read']
    },
  },
  {
    path: '/companyholiday/details',
    component: ViewCompanyHolidayDetail,
    permissible: {
      requiredPermissions: ['company_holiday_read']
    }
  },
  {
    path: '/companyholiday/list',
    component: ViewCompanyHoliday,
    permissible: {
      requiredPermissions: ['company_holiday_read']
    }
  },
  {
    path: '/companyholiday/create',
    component: CreateCompanyHoliday,
    permissible: {
      requiredPermissions: ['company_holiday_create']
    }
  },
  {
    path: '/companyholiday/edit',
    component: EditCompanyHoliday,
    permissible: {
      requiredPermissions: ['company_holiday_edit']
    }
  },
  {
    path: '/holidaypreset/list',
    component: ViewHolidayPresets,
    permissible: {
      requiredPermissions: ['holiday_preset_read']
    }
  },
  {
    path: '/chargecode/list',
    component: ViewChargeCodeList,
    permissible: {
      requiredPermissions: ['charge_code_read']
    }
  },{
    path: '/holidaypreset/create',
    component: CreateHolidayPreset,
    permissible: {
      requiredPermissions: ['holiday_preset_create']
    }
  },
  {
    path: '/chargecode/details',
    component: ViewChargeCodeDetails,
    permissible: {
      requiredPermissions: ['charge_code_read']
    }
  } ,{
    path: '/holidaypreset/details',
    component: ViewHolidatPresetDetail,
    permissible: {
      requiredPermissions: ['holiday_preset_read']
    }
  },
  {
    path: '/chargecode/create',
    component: CreateChargeCode,
    permissible: {
      requiredPermissions: ['charge_code_create']
    }
  },
  {
    path: '/chargecode/edit',
    component: EditChargeCode,
    permissible: {
      requiredPermissions: ['charge_code_edit']
    }
  },
  {
    path: '/reportconfiguration/create',
    component: CreateReportConfiguration,
    permissible: {
      requiredPermissions: ['work_report_create']
    }
  },
  {
    path: '/reportconfiguration/edit',
    component: EditReportConfiguration,
    permissible: {
      requiredPermissions: ['work_report_edit']
    }
  },
  {
    path: '/reportconfiguration/details',
    component: DisplayReportConfiguration,
    permissible: {
      requiredPermissions: ['work_report_read']
    }
  },
  {
    path: '/timeconfiguration/edit',
    component: EditHolidayPreset,
    permissible: {
      requiredPermissions: ['holiday_preset_edit']
    }
  },
  {
    path: '/timesheet/list',
    component: TimeSheetListComponent,
    permissible: {
      requiredPermissions: ['work_report_read']
    }
  }
  ,
  {
    path: '/timesheet/submission',
    component: TimeSheetSubmission,
    permissible: {
      requiredPermissions: ['work_report_read']
    }
  },
  {
    path: '/timesheet/review',
    component: ProgressReview,
    permissible: {
      oneperm:true,
      requiredPermissions: ['work_report_read','company_holiday_read' ]
    }
  }
]

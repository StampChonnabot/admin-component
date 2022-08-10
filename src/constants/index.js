import { gql } from 'apollo-boost'

//---------------------- COMPANY HOLIDAY ----------------------------------
export const GET_COMPANY_HOLIDAY_VARS = gql`
query holidaycompanys($limit:Int!,$offset:Int!)
{
  company_holidays(limit:$limit offset:$offset){
    company_holidays{
      id
      holidaycompany_name
      holiday_amount
      created_at
      holidaydetails{
        name
        date
      }
    }
    total
  }
}`

export const DELETE_COMPANY_HOLIDAY = gql`
mutation deleteCompanyHoliday($id:Int!){
  delete_holiday_company(id:$id){
    id
  }
}`

export const CREATE_COMPANY_HOLIDAY = gql`
mutation holidayCompanyCreation(
  $holidaycompany_name:String!,
  $holiday_amount:Int!,
  $holidaydetails: [HolidayCompanyInput!]!
  ){
    create_company_holiday(
      holidaycompany_name: $holidaycompany_name
      holiday_amount: $holiday_amount
      holidaydetails: $holidaydetails
  ){
    id
  }
}`

export const GET_HOLIDAY_PRESET_BYID=gql`
query holidaycompanys(
  $id:String!
  ){
    holiday_preset(id:$id){
    id
    holidays{
      id
      holiday_name
      holiday_date
    }
    created_at
    name
  }
}`

export const GET_COMPANY_HOLIDAY_EXIST = gql`
query HolidayCompany($offset: Int!, $limit: Int!)
{
  company_holidays(offset: $offset,limit:$limit ){
    company_holidays{
      id
      holidaycompany_name
      holiday_amount
      created_at
    }
    total
  }
}`

export const GET_HOLIDAY_PRESETS_LIST = gql`
query HolidayPresets($limit:Int!,$offset:Int!)
{
  holiday_presets(limit:$limit offset:$offset) {
      preset_list {
          id
          name
      }
      total
    }
}`

export const EDIT_COMPANY_HOLIDAY = gql`
mutation EditCompanyHoliday(
  $holiday_amount: Int!,
  $holiday_details: [HolidayCompanyInput!]!,
  $delete_company_holiday_ids: [Int!]!,
  $id: Int!
  $holidaycompany_name: String!){
    edit_company_holiday(
      holiday_amount:  $holiday_amount
      holiday_details: $holiday_details
      delete_company_holiday_ids: $delete_company_holiday_ids
      id: $id
      holidaycompany_name:  $holidaycompany_name
      ){
        id
      }
  }`

export const GET_COMPANY_HOLIDAY_DETAILS = gql`
query holidaycompanys($id:String!)
{
  company_holiday(id:$id){
    holiday_amount
    holidaydetails{
      id
      date
      name
    }
    holidaycompany_name
  }
}`

//----------------------- HOLIDAY PRESET ----------------------------------
export const CREATE_HOLIDAY_PRESET = gql`
mutation presetCreation(
  $name:String!,
  $amount:Int!,
  $holidays: [holidayInput!]!){
  create_holiday_preset(
    name: $name
    amount: $amount
    holidays: $holidays
  ){
    id
    name
    amount
    holidays{
      holiday_name
      holiday_date
    }
  }
}`

export const EDIT_HOLIDAY_PRESET = gql`
mutation editPreset($name:String!,
  $amount:Int!,
  $holidays: [holidayInput!]!,
  $delete_holiday_ids: [Int!]!,
  $id: Int!){
    edit_holiday_preset(
      name: $name,
      amount: $amount,
      holidays: $holidays,
      delete_holiday_ids:$delete_holiday_ids,
      id: $id
    ){
      id
    }
}`

export const GET_HOLIDAY_PRESET_DETAILS = gql`
query holidayPresetDetails($id:String!)
{
  holiday_preset(id:$id) {
      holidays{
        holiday_date
        holiday_name
        id
    },
    name
  }
}`

export const DELETE_HOLIDAY_PRESET = gql`
mutation deleteHolidayPreset($id: Int!){
  delete_holiday_preset(id: $id){
    name
    id
  }
}`

export const GET_HOLIDAY_PRESET_LIST = gql`
query holiday_presets($limit:Int!,$offset:Int!)
{
  holiday_presets(limit:$limit offset:$offset) {
      preset_list {
          id
          name
          amount
          holidays{
              holiday_date
              holiday_name
              id
          }
          created_at
      }
      total
    }
}`

export const GET_EMPINFO = gql`query{
  employee{
    id
    general_info{
      work_type_id
    }
  }
}`
export const GET_EMPINFO_WITHID = gql`query employeeInfo($id:Int!){
  employee(id:$id){
    id
    general_info{
      work_type_id
    }
  }
}`
//----------------------- CHARGE CODE ----------------------------------
export const GET_CHARGECODES = gql`
query  chargecodes($limit:Int!,$offset:Int!)
{
  charge_codes(
limit: $limit
offset: $offset
search_keyword: ""
status: "active"
  ){
    charge_codes{
      name
      id
      is_active
      start_date
      end_date
    }
  }
}`

export const GET_CHARGE_CODES_LIST = gql`
query  chargecodes(
  $limit:Int!,
  $offset:Int!,
  $status:String!,
  $search_keyword:String!)
{
  charge_codes(
    limit:$limit
    offset:$offset
    status:$status
    search_keyword:$search_keyword){
    charge_codes{
      code
      name
      description
      employees{
        type
        employee_id
        roll_on
        roll_off
      }
      start_date
      end_date
      is_active
      id
    }
    total
  }
}`

export const GET_CHRAGE_CODES_DETAIL = gql`
query chargecodeDetail($id:Int!)
{
  charge_code(
    id:$id
    ){
      is_not_work
      code
      id
      description
      is_active
      visibility_private
      start_date
      end_date
      name
      employees{
        id
        employee_id
        type
        roll_on
        roll_off

      }

    }
}`

export const GET_CHRAGE_CODES_DUPLICATE = gql`
query chargeCodeDuplicate($code:String!)
{
  charge_code_duplicate(
    code:$code
    )
}`

export const GET_CHARGE_CODES_DETAILS = gql`
query chargecodeDetail($id:Int!)
  {
    charge_code(
      id:$id
      ){
        code
        id
        description
        is_active
        visibility_private
        start_date
        end_date
        name
        employees{
          id
          employee_id
          type
          roll_on
          roll_off

        }
      }
  }`


export const CREATE_CHARGE_CODE = gql`
mutation CreateChareCode(
  $is_active: Boolean!,
  $name: String!,
  $start_date: String!,
  $end_date: String!,
  $visibility_private: Boolean!,
  $description: String!,
  $code: String!,
  $employees: [EmployeeChargeCodeInput!]!
  ){
    create_charge_code(
      is_active: $is_active,
      name: $name,
      start_date: $start_date,
      end_date: $end_date,
      visibility_private: $visibility_private,
      description: $description,
      code: $code,
      employees: $employees
    ){
     id
     employees{
       employee_id
       id
       type
     }
    }
  }
`
export const EDIT_CHARGE_CODE = gql`
mutation EditChareCode(
  $end_date: String!,
  $is_active: Boolean!,
  $deleted_employee_ids: [Int!]!,
  $name: String!,
  $id: Int!,
  $start_date: String!,
  $employees: [EmployeeChargeCodeInput!]!,
  $visibility_private: Boolean!,
  $description: String!
){
  edit_charge_code(
    end_date: $end_date,
    is_active: $is_active,
    deleted_employee_ids: $deleted_employee_ids,
    name: $name,
    id: $id,
    start_date: $start_date,
    employees: $employees,
    visibility_private: $visibility_private,
    description: $description
  ){
    id
    description
    name
    end_date
    start_date
    employees{
      id
      employee_id
      type
    }
  }
}
`
//----------------- Report code set ---------------------
export const GET_REPORT_CODE_SETS_LIST = gql`
query  report_code_sets(
  $limit:Int!,
  $offset:Int!,
  $search_keyword:String!)
{
  report_code_sets(
    limit:$limit
    offset:$offset
    search_keyword:$search_keyword){
      report_code_sets{
        charge_codes{
          id
          code
          name
        }
        id
        created_at
        name
        employee_id
    }
    total
  }
}
`
export const GET_REPORT_CODE_SET_DETAILS = gql`
query  report_code_set($id:Int!){
  report_code_set(id:$id){
    name
    id
    created_at
    employee_id
    charge_codes{
      id
      name
      code
    }
  }
}
`

export const CREATE_REPORT_CODE_SET = gql`
mutation CreateReportCodeSet(
  $charge_code_ids: [Int!]!
  $name: String!
  ){
    create_report_code_set(
      charge_code_ids: $charge_code_ids
      name: $name
    ){
      id
      created_at
      name
      }
    }
`

export const EDIT_REPORT_CODE_SET = gql`
mutation EditReportCodeSet(
  $charge_code_delete_ids: [Int!]!
  $charge_code_ids: [Int!]!
  $name: String!
  $id: Int!
  ){
    edit_report_code_set(
      charge_code_delete_ids: $charge_code_delete_ids
      charge_code_ids: $charge_code_ids
      name: $name
      id: $id
    ){
      id
      created_at
      name
        charge_codes{
          id
          code
          name
        }
      }
    }
`

export const DELETE_REPORT_CODE_SET = gql`
mutation deleteReportCodeSet($id:Int!){
  delete_report_code_set(id:$id){
    id
  }
}
`

//----------------- TIME SHEET ------------------------
export const GET_TIMESHEETS = gql`
query biweekly_reports(
    $employeeID: Int!
    $limit: Int!
    $offset: Int!)
    {
      work_submissions(
    employee_id: $employeeID
    limit:  $limit
    offset: $offset
    ){
      total
      work_submissions{
        leave_hour
    period_id
    period{
      start_date
      end_date
    }
    status
    submit_date
    total_hour
    type
    work_hour
      }
    }
    }
`


export const GET_TIMESHEETS_AS_EMP = gql`
query biweekly_reports(
    $limit: Int!
    $offset: Int!)
    {
      my_work_submissions(
    limit:  $limit
    offset: $offset
    ){
      total
      work_submissions{
        leave_hour
    period_id
    period{
      start_date
      end_date
    }
    status
    submit_date
    total_hour
    type
    work_hour
      }
    }
    }
`
// export const GET_TIMESHEETS_REVIEWER = gql`
// query biweekly_reports(
//     $reviewer_id: Int!
//     $limit: Int!
//     $offset: Int!)
//     {
//       work_submissions(
//     reviewer_id:$reviewer_id,
//     limit:  $limit
//     offset: $offset
//     ){
//       total
//       work_submissions{
//         leave_hour
//     period_id
//     period{
//       start_date
//       end_date
//     }
//     status
//     submit_date
//     total_hour
//     type
//     work_hour
//       }
//     }
//     }
// `


export const GET_TIMESHEETS_REVIEWER = gql`
query get_worksubmissions(
  $period_id: Int!
  $status: Int!
  $limit: Int!
  $offset: Int!
){
  work_submissions(
    is_reviewer:true,
    status: $status
    period_id: $period_id
    limit: $limit
    offset: $offset
  ){
    total
    work_submissions{
      employee_id
      work_hour
      leave_hour
      total_hour
      status
    }
  }
}
`

export const GET_TIMESHEET = gql`
query  biweekly_report($employee_id: Int!,$period_id: Int!){
  work_reports(
    employee_id: $employee_id
    period_id: $period_id
    ){
      work_reports{
        project_id
        status
        work_progresses{
          id
          date
          work_hours
        }
        reviewers{
          reviewer_id
          employee_id
        }
        description
        report_id
      }
    }
}
`
export const GET_COMPANY_HOLIDAY_EMP = gql`
query getHolidays($name:String!){
  company_holidays(
    name:$name
    offset: 0
    limit: 1
  ) {
    company_holidays{
      holidaydetails{
        date
      }
    }
    total
  }
}
`

export const GET_TIMESHEET_EMPLOYEE = gql`
query  biweekly_report($period_id: Int!){
  work_reports(
    period_id: $period_id
    ){
      work_reports{
        project_id
        status
        work_progresses{
          id
          date
          work_hours
        }
        reviewers{
          reviewer_id
          employee_id
        }
        description
        report_id
      }
    }
}
`

export const EDIT_TIMESHEET = gql`
mutation edit_work_report(
  $id: Int!
  $project_id: Int!
  $files: [FileInput!]!
  $description: String!
  $delete_file_ids: [Int!]!
  $period_id: Int!
  $work_progresses: [WorkProgressInput!]!
  $reviewers: [ReviewerInput!]!
  $delete_reviewer_ids: [Int!]!
  ){
    edit_work_report (
      id: $id
  project_id: $project_id
  files: $files
  description: $description
  delete_file_ids: $delete_file_ids
  period_id: $period_id
  work_progresses: $work_progresses
  reviewers:  $reviewers
  delete_reviewer_ids: $delete_reviewer_ids
      )
  }
`

export const CREATE_CHARE_CODE = gql`
mutation CreateChareCode(
  $is_active: Boolean!,
  $name: String!,
  $start_date: String!,
  $end_date: String!,
  $visibility_private: Boolean!,
  $description: String!,
  $code: String!,
  $employees: [EmployeeChargeCodeInput!]!,
  $is_not_work: Boolean!,
  ){
    create_charge_code(
      is_active: $is_active,
      name: $name,
      start_date: $start_date,
      end_date: $end_date,
      visibility_private: $visibility_private,
      description: $description,
      code: $code,
      employees: $employees,
      is_not_work : $is_not_work,
    ){
     id
     employees{
       employee_id
       id
       type
     }
    }
  }
`

export const CREATE_TIMESHEET = gql`
mutation create_work_report(
  $project_id: Int!,
  $period_id: Int!,
  $work_progresses: [WorkProgressInput!]!,
  $reviewers:  [ReviewerInput!]!,
  $files:  [FileInput!]!,
  $description: String!
  ){
    create_work_report(
      project_id: $project_id
      period_id: $period_id
      work_progresses: $work_progresses
      reviewers: $reviewers
      files: $files
      description: $description
      )
  }
`

export const GET_PERIODS = gql`
query get_periods{
  Periods
  {
    start_date
    end_date
    id
    total_date
  }
}
`

export const GET_WORKSUBMISSIONS = gql`
query get_worksubmissions(
  $period_id: Int!
  $limit: Int!
  $offset: Int!
){
  work_submissions(
    period_id: $period_id
    limit: $limit
    offset: $offset
  ){
    total
    work_submissions{
      employee_id
      work_hour
      leave_hour
      total_hour
      status
    }
  }
}
`

export const CREATE_ADJUSTMENT = gql`
mutation create_work_adjustment(
  $project_id: Int!
  $period_id: Int!
  $work_adjustments: [WorkAdjustmentInput!]!
  $adjust_period: Int!
  ){
    create_work_adjustment(
      project_id: $project_id
      period_id: $period_id
      work_adjustments: $work_adjustments
      adjust_period: $adjust_period
      )
  }
`

export const GET_WORK_ADJUSTMENTS = gql`
query  work_adjustments($period_id: Int!)
{
  work_adjustments(period_id: $period_id){
    work_adjustments {
      project_id
      status
      work_adjustments {
        is_pending_delete
        date
        work_hours
        original_work_hours
        id
      }
      reviewers {
        reviewer_id
      }
      files {
        name
        url
      }
      description
    }
    }
}

`


export const GET_WORK_ADJUSTMENTS_EMPLOYEE = gql`
query  work_adjustments($period_id: Int!,$employee_id: Int!)
{
  work_adjustments(period_id: $period_id employee_id: $employee_id){
    work_adjustments {
      project_id
      status
      work_adjustments {
        is_pending_delete
        date
        work_hours
        original_work_hours
        id
      }
      reviewers {
        reviewer_id
      }
      files {
        name
        url
      }
      description
    }
    }
}

`


export const GET_WORK_REPORTS = gql`
query  get_work_reports($employee_id:Int!,$period_id:Int!)
{
  work_reports(
    employee_id: 114
    period_id: $period_id
    ){
      work_reports{
        project_id
        work_progresses{
          date
          work_hours
          id
        }
        reviewers{
          employee_id
        }
        files{
          name
          url
        }
        description
      }
    }
}

`

export const EDIT_WORK_ADJUSTMENT = gql`
mutation edit_work_adjustment(
  $project_id: Int!
  $period_id: Int!
  $work_adjustments: [WorkAdjustmentInput!]!
  $adjust_period: Int!
  ){
    edit_work_adjustment(
      project_id: $project_id
      period_id: $period_id
      work_adjustments: $work_adjustments
      adjust_period: $adjust_period
      )
  }
`

export const GET_LEAVE_REQUEST = gql`{
  leave_requests(limit: -1, offset: 0, status: "approve") {
    leave_requests {
      start_date
      end_date
      leave_request_dates {
        date
        hour
        period
      }
      leave_type {
        name
        charge_code_id
      }
      id
    }
    total
  }
}`

export const GET_LEAVE_REQUEST_EMP = gql`
  query get_leave($employee_id: Int!){
  leave_requests(limit: -1, offset: 0, status: "approve",employee_id:$employee_id) {
    leave_requests {
      start_date
      end_date
      leave_request_dates {
        date
        hour
        period
      }
      leave_type {
        name
        charge_code_id
      }
      id
    }
    total
  }
}`

export const CREATE_WORK_SUBMIT = gql`
mutation create_work_submit($period_id: Int!, $report_ids: [Int!]!)
  {
  create_work_submit(period_id:$period_id, report_ids: $report_ids)
}
`

//---------------------- Work preset ----------------------
export const GET_WORK_PRESETS_LIST=gql`
query WorkPreset(
  $limit: Int!,
  $offset: Int!
){
    work_presets(limit:$limit offset: $offset work_type: "") {
        work_presets{
            id
            name
            type
            start_time
            end_time
            work_day
        }
        total
      }
}
`
export const GET_WORK_PRESET_DETAILS=gql`
query WorkPresetId($id: Int!)
      {
        work_preset(id: $id){
          name
          type
          start_time
          end_time
          work_day
        }
      }
`

export const DELETE_WORK_PRESET = gql`
mutation WorkPresetDelete($id: Int!)
            {
                delete_work_preset(id: $id){
                    id
                  }
            }
`

export const CREATE_WORK_PRESET =gql`
mutation WorkPresetCreate(
    $name: String!,
    $type: String!,
    $start_time: String!,
    $end_time: String!,
    $work_day: String!
  ){
    create_work_preset(
      name:  $name
      type:  $type
      start_time: $start_time
      end_time: $end_time
      work_day: $work_day
    ){
      name
      type
      start_time
      end_time
      work_day
    }
  }
`

export const EDIT_WORK_PRESET = gql`
mutation WorkPresetEdit($id: Int!, $name: String!, $type: String!,
    $start_time: String!,$end_time: String!,$work_day: String!)
    {
      edit_work_preset(
        id: $id
        name: $name
        type: $type
        start_time: $start_time
        end_time: $end_time
        work_day: $work_day
      ){
        id
        name
        type
        start_time
        end_time
        work_day
      }
  }
`
export const GET_EMPLOYEE_LIST = gql`
query employees(
  $limit: Int!,
  $offset: Int!
){
  employees(limit:$limit offset: $offset) {
    employee_list{
      personnel_info{
        firstname_en
        lastname_en
        id
      }
      general_info{
        position{
          is_manager
          name
        }
      }
      id
    }
    total
  }
}
`

export const GET_EMPLOYEES = gql`
query employees($limit:Int! $offset:Int!){
    employees(
        limit: $limit
        offset: $offset
        ){
          employee_list
          {
            id
            personnel_info{
              firstname_en
              lastname_en
            }
            general_info
            {
              company_employee_id
              position{
                name
                is_manager
              }
            }
          }
          total
        }
  }
  `


export const GET_EMPLOYEE = gql`
query employee($id: Int!){
  employee(id:$id) {
    personnel_info{
      firstname_en
      lastname_en
    }
    general_info{
      position{
        name
      }
    }
  }
}
`

export const GET_POSITION_NAME = gql`
query position($id: Int!){
  position(id:$id){
    id
    name
  }
}
`

export const GET_CHARGE_CODE_DUPE = gql`
query  chargecodes(
  $search_keyword:String!)
{
  charge_codes(
    limit:10
    offset:0
    search_keyword:$search_keyword){
    total
  }
}`

export const FETCH_MONTHLY_REPORT = gql`
query fetchMonthlyReport(
  $start_period:String!,
  $end_period:String!,
  $project_ids:[Int!]!
)
  {
  monthly_report(
  start_period: $start_period
  end_period: $end_period
  project_ids: $project_ids
  ){
    code
    description
    hours
  }}
`





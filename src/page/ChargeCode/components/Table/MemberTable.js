import React, { Fragment } from 'react'
import { TableCustom } from '../styled'
import { Avatar, Icon, Spin } from 'antd'
import _ from 'lodash'
import moment from 'moment'
import { withApollo } from 'react-apollo';
import {
  GET_EMPLOYEES
} from '../../../../constants/index'

class MemberTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mockdata: this.props.projectdata,
      members: [],
      pageSize: 10000,
      currentPage: 0,
      picture: '',
      member_name: '',
      position: '',
      roll_on: null,
      roll_off: null,
      currentData: [],
      newRoll_on: null,
      newRoll_off: null,
      employeeList: [],
      parseData: _.map(this.props.memberdata, this.mockDataParser),
      isLoading: true
    };
  }

  componentWillMount() {
    this.runqueryBatchMember()
  }

  runqueryBatchMember = async () => {
    let employeeMemberList = ''
    this.props.client.cache.reset().then(async () => {
      await this.runQueryEmployees(this.state.pageSize, this.state.currentPage)
      employeeMemberList = await this.setEmployeeName(this.state.parseData)
      this.setState({ members: employeeMemberList, isLoading: false })
    })


  }

  setEmployeeName = (memberList) => {
    return new Promise(async (resolve, reject) => {
      let cloneEmpList = _.cloneDeep(memberList)
      let newList = _.map(cloneEmpList, (value) => {
        return new Promise(async (resolve, reject) => {
          let memberInfo = _.filter(this.state.employeeList, emp => emp.id == value.member_id)
          value.member_name = `${_.get(memberInfo,'[0].personnel_info.firstname_en','')} ${_.get(memberInfo,'[0].personnel_info.lastname_en','')}`
          value.position = _.get(memberInfo,'[0].general_info.position.name','')
          resolve(value)
        })
      })
      Promise.all(newList).then(
        (result) => {
          resolve(result)
        }
      )
    })

  }

  runQueryEmployees = (limit, offset) => {
    return new Promise(async (resolve, reject) => {
      try {
        const queryResultEmployees = await
          this.props.client.query({
            query: GET_EMPLOYEES,
            variables: { limit, offset },
          })
        this.setState({
          employeeList: queryResultEmployees.data.employees.employee_list,
          isLoading: false
        }, () => {
          resolve("get employee")
        })

      } catch (error) {
        reject(error)
      }

    })
  }



  mockDataParser = (currentObject, index) => {
    return {
      picture: (<div><Avatar src="https://f.ptcdn.info/575/053/000/ow5utonifPJas6jmUI2-o.jpg" /></div>),
      member_name: "",
      member_id: currentObject.employee_id,
      position: "",
      roll_on: moment(currentObject.roll_on).format('DD MMM YYYY'),
      roll_off: moment(currentObject.roll_off).format('DD MMM YYYY'),
    }
  }

  render() {
    const columns = [
      {
        title: 'Picture',
        dataIndex: 'picture',
        align: 'center',
        width: 120,
        key: 'picture',
      },
      {
        title: 'Member Name',
        dataIndex: 'member_name',
        key: 'member_name',
        width: 200,
      },
      {
        title: 'Position',
        dataIndex: 'position',
        key: 'position',
        width: 150,
      },
      {
        title: 'Roll on',
        key: 'roll_on',
        dataIndex: 'roll_on',
        width: 120,
      },
      {
        title: 'Roll off',
        key: 'roll_off',
        dataIndex: 'roll_off',
        width: 120,
      },
    ]

    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    return (
      <Fragment>
        <TableCustom
          loading={{
            spinning: this.state.isLoading,
            indicator: <Spin indicator={antIcon} />,
          }}
          pagination={{ position: 'none', defaultPageSize: 100 }}
          columns={columns}
          dataSource={this.state.members} />

      </Fragment>
    )



  }
}
export default withApollo(MemberTable)

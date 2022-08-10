import React, { Fragment } from 'react'
import { TableCustom } from '../styled'
import { Avatar, Icon, Spin } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { withApollo } from 'react-apollo';
import {
  GET_EMPLOYEE,
  GET_EMPLOYEES
} from '../../../../constants/index'

class OwnerTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerdata: [],
      pageSize: 10000,
      currentPage: 0,
      picture: '',
      owner_name: '',
      position: '',
      roll_on: null,
      roll_off: null,
      currentData: [],
      newRoll_on: null,
      newRoll_off: null,
      employeeList: [],
      parseData: _.map(this.props.ownerdata, this.mockDataParser),
      isLoading: true
    };
  }

  componentWillMount() {
    this.runqueryBatch()
  }

  runqueryBatch = async () => {
    let employeeOwnerList = ''
    this.props.client.cache.reset().then(async () => {
      await this.runQueryEmployees(this.state.pageSize, this.state.currentPage)
      employeeOwnerList = await this.setEmployeeName(this.state.parseData)
      this.setState({ ownerdata: employeeOwnerList, isLoading: false })
    })
  }

  setEmployeeName = (ownerList) => {
    return new Promise(async (resolve, reject) => {
      let cloneEmpList = _.cloneDeep(ownerList)
      let newList = _.map(cloneEmpList, (value) => {
        return new Promise(async (resolve, reject) => {
          let ownerInfo = _.filter(this.state.employeeList, emp => emp.id == value.owner_id)
          value.owner_name = `${_.get(ownerInfo,'[0].personnel_info.firstname_en', '')} ${_.get(ownerInfo,'[0].personnel_info.lastname_en')}`
          value.position = _.get(ownerInfo,'[0].general_info.position.name','')
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

  runQueryGetEmpName = (id) => {
    return new Promise(async (resolve, reject) => {
      const queryResult =
        await this.props.client.query({
          query: GET_EMPLOYEE,
          variables: { id },
        })
      resolve(queryResult.data.employee)
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

  mockDataParser = (currentObject) => {
    return {
      picture: (<div><Avatar src="https://f.ptcdn.info/575/053/000/ow5utonifPJas6jmUI2-o.jpg" /></div>),
      owner_name: currentObject.owner_name,
      owner_id: currentObject.employee_id,
      position: 'Project owner',
      roll_on: moment(currentObject.roll_on).format('DD MMM YYYY'),
      roll_off: moment(currentObject.roll_off).format('DD MMM YYYY'),
    }
  }


  render() {
    const columns = [
      {
        title: 'Picture',
        dataIndex: 'picture',
        key: 'picture',
        align: 'center',
        width: 120,

      },
      {
        title: 'Owner Name',
        dataIndex: 'owner_name',
        key: 'owner_name',
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

    const data = [..._.map(this.state.ownerdata, this.mockDataParser)]
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
          dataSource={data} />

      </Fragment>
    )
  }
}
export default withApollo(OwnerTable)

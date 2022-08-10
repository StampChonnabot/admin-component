import React, { Fragment } from 'react'
import _ from 'lodash'
import moment from 'moment'
import { Avatar, Icon } from 'antd'
import { withApollo } from 'react-apollo';
import {
  DatePickerTable,
  SelectButton,
  TableCustom,
  Popup,
  ButtonCustom,
  Truncate
} from '../styled'
import {
  GET_POSITION_NAME,
  GET_EMPLOYEE
} from '../../../../constants/index'
const { Option } = SelectButton

class OwnerEditChargeCodeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mockdata: this.props.ownersList,
      pageSize: 10000,
      currentPage: 1,
      picture: '',
      owner_name: '',
      position: '',
      roll_on: null,
      roll_off: null,
      currentData: 0,
      newRoll_on: null,
      newRoll_off: null,
      selectedItems: [],
      visibleErr: false,
      originalEmployeeList: [],
      deletedEmp: [],
      existingID: 0,
      parseData: _.map(this.props.ownersList, this.mockDataParser)
    };
  }
  componentWillMount() {
    this.runqueryBatch()
  }

  addExistingIDtoDropdown = (empList) => {
    return _.map(empList, eachEmp => {
      let tempEmp = _.cloneDeep(eachEmp)
      _.forEach(this.props.ownersList, eachExistingOwner => {
        if (eachEmp.id == eachExistingOwner.employee_id) {
          tempEmp.existingID = eachExistingOwner.existingID
          return false
        }
      })
      return tempEmp
    })
  }

  componentWillUpdate(nextprop, nextstate) {
    if (this.props.employeeList.length != nextprop.employeeList.length && this.props.employeeList) {

      this.setState({ originalEmployeeList: this.addExistingIDtoDropdown(nextprop.employeeList) })

    }
    if (nextprop.shouldResetDate) {


      let tempMock = _.map(this.state.mockdata, owner => {
        let tempOwner = owner
        tempOwner.roll_on = nextprop.forcedStartDate
        tempOwner.roll_off = nextprop.forcedEndDate
        return tempOwner
      })
      this.setState({
        mockdata: tempMock,
        lockedStartDate: nextprop.start_date,
        lockedEndDate: nextprop.end_date,
        newRoll_on: '',
        newRoll_off: '',

      })
      this.props.setReset()
    }

  }

  runqueryBatch = async () => {
    let employeeOwnerList = ''
    this.props.client.cache.reset().then(async () => {
      employeeOwnerList = await this.setEmployeeName(this.state.parseData)
      this.setState({ mockdata: _.map(employeeOwnerList, this.mockfinalDataParser) })


    })
  }

  setEmployeeName = (ownerList) => {
    return new Promise(async (resolve, reject) => {
      let cloneEmpList = _.cloneDeep(ownerList)
      let newList = _.map(cloneEmpList, (value) => {
        return new Promise(async (resolve, reject) => {
          let ownerInfo = await this.runQueryGetEmpName(value.owner_id)
          value.owner_name = `${ownerInfo.personnel_info.firstname_en} ${ownerInfo.personnel_info.lastname_en}`
          value.position = ownerInfo.general_info.position.name
          resolve(value)
        })
      })
      Promise.all(newList).then(
        (result) => {
          this.props.setOwners({
            owners: _.map(_.map(cloneEmpList, this.mockfinalDataParser), this.ownerParser)
          })
          resolve(result)
        }
      )
    })

  }

  runQueryGetEmpName = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const queryResult =
          await this.props.client.query({
            query: GET_EMPLOYEE,
            variables: { id },
          })
        resolve(queryResult.data.employee)
      } catch (error) {
        reject(error)
      }

    })
  }

  setEmployeePosition = (employeeList) => {
    return new Promise(async (resolve, reject) => {
      let cloneEmpList = _.cloneDeep(employeeList)
      _.each(cloneEmpList, async (value) => {
        value.position = await this.runQueryGetPosition(value.owner_id)
      })
      this.setState({
        mockdata: _.map(cloneEmpList, this.mockfinalDataParser)
      }, () => {
        resolve(cloneEmpList)
      })

      this.props.setOwners({
        owners: _.map(_.map(cloneEmpList, this.mockfinalDataParser), this.ownerParser)
      })

    })
  }

  runQueryGetPosition = async (id) => {
    return new Promise(async (resolve, reject) => {
      const queryResult =
        await this.props.client.query({
          query: GET_POSITION_NAME,
          variables: { id },
        })
      resolve(queryResult.data.position.name)
    })
  }


  mockDataParser = (currentObject) => {
    return {
      picture: (<div><Avatar src="https://f.ptcdn.info/575/053/000/ow5utonifPJas6jmUI2-o.jpg" /></div>),
      owner_name: currentObject.owner_name,
      owner_id: currentObject.employee_id,
      position: 'Project owner',
      roll_on: currentObject.roll_on,
      roll_off: currentObject.roll_off,
      existingID: currentObject.id
    }
  }

  mockfinalDataParser = (currentObject) => {
    return {
      picture: (<div><Avatar src="https://f.ptcdn.info/575/053/000/ow5utonifPJas6jmUI2-o.jpg" /></div>),
      owner_name: currentObject.owner_name,
      employee_id: currentObject.owner_id,
      position: 'Project owner',
      roll_on: currentObject.roll_on,
      roll_off: currentObject.roll_off,
      existingID: currentObject.existingID
    }
  }

  onDropDownChange = (input) => {
    const getEmployee = _.filter(this.state.originalEmployeeList, employee => employee.id == input)
    let tempSelected = ''
    if (input) {
      if (getEmployee[0].existingID) {
        this.setState(
          {
            position: "Project owner",
            owner_name: `${getEmployee[0].personnel_info.firstname_en} ${getEmployee[0].personnel_info.lastname_en}`,
            selectedItems: input,
            currentData: input,
            existingID: getEmployee[0].existingID
          }
        )
      } else {
        this.setState(
          {
            position: "Project owner",
            owner_name: `${getEmployee[0].personnel_info.firstname_en} ${getEmployee[0].personnel_info.lastname_en}`,
            selectedItems: input,
            currentData: input,
          }
        )
      }
      tempSelected = input
    } else {
      this.setState(
        {
          position: '',
          owner_name: '',
          selectedItems: undefined,
          currentData: '',
        }
      )
      tempSelected = undefined
    }

    this.toCheckIsExistingData(tempSelected, this.state.newRoll_on, this.state.newRoll_off)
  }

  filterSelectable = (input) => {
    return _.filter(input, (employee) => {
      return (!(_.includes(this.state.mockdata.map(value => value.employee_id), employee.id) ||
        _.includes(this.props.memberList.map(value => value.employee_id), employee.id)) &&
        employee.general_info.position.is_manager)
    })
  }


  ownerParser = (currentObject) => {
    return {
      existingID: currentObject.existingID,
      employee_id: currentObject.employee_id,
      roll_on: currentObject.roll_on,
      roll_off: currentObject.roll_off,
      type: 1
    }
  }

  onClickAdd = () => {
    let newdata = {
      picture: (<div><Avatar src='https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' /></div>),
      owner_name: _.cloneDeep(this.state.owner_name),
      position: _.cloneDeep(this.state.position),
      roll_on: _.cloneDeep(this.state.newRoll_on),
      roll_off: _.cloneDeep(this.state.newRoll_off),
      employee_id: _.cloneDeep(this.state.currentData),
      type: 1
    }
    if (this.state.existingID > 0) {
      newdata.existingID = _.cloneDeep(this.state.existingID)
      let newDelete = _.filter(this.state.deletedEmp, eachDeleted => {
        return !_.isEqual(eachDeleted.existingID, this.state.existingID)
      })
      this.setState({
        deletedEmp: newDelete
      }, () => {
        this.props.setDeleteOwner({
          deletedOwner: _.map(newDelete, this.ownerParser)
        })
      })

    }

    let mappedOwners = _.map([newdata, ...this.state.mockdata], this.ownerParser)
    this.props.setIsExistingData('isExistingDataOwner', false)
    this.setState({
      mockdata: [newdata, ...this.state.mockdata],
      picture: '',
      owner_name: '',
      position: '',
      roll_on: null,
      roll_off: null,
      newRoll_on: null,
      newRoll_off: null,
      selectedItems: [],
      existingID: 0
    });
    if (mappedOwners) {
      this.props.setOwners({
        owners: mappedOwners
      })
    }
  }

  onClickDelete = (index) => {
    let defaultarr = _.cloneDeep(this.state.mockdata)
    let cutEmp = defaultarr.splice(index - 1, 1);
    if (cutEmp) {
      if (cutEmp[0].existingID) {
        this.setState({
          mockdata: defaultarr,
          deletedEmp: _.map([...this.state.deletedEmp, cutEmp[0]], this.ownerParser)
        })

        this.props.setDeleteOwner({
          deletedOwner: _.map([...this.state.deletedEmp, cutEmp[0]], this.ownerParser)
        })
      } else {
        this.setState({
          mockdata: defaultarr
        })
      }

      this.props.setOwners({
        owners: _.map(defaultarr, this.ownerParser),
      })

    }
  }

  onEditDateField = (index, updateValue, field) => {
    let updateValue_date = moment.utc(moment(updateValue)).format()
    let toBeManipulate = _.cloneDeep(this.state.mockdata)
    toBeManipulate[index][field] = moment(updateValue_date)
    this.props.setOwners({
      owners: _.map(toBeManipulate, this.ownerParser),
    })
    this.setState({
      mockdata: toBeManipulate
    })
  }

  onValueChange = (field, e) => {
    this.setState({
      [field]: e.target.value
    });
  }

  onChange = (field, e) => {
    if (e) {
      this.setState({
        [field]: e
      });
    } else {
      this.setState({
        [field]: null
      });
    }
  }

  toCheckIsExistingData = (selectedItem, rollOn, rollOff) => {
    if (selectedItem || rollOn || rollOff) {
      this.props.setIsExistingData('isExistingDataOwner', true)
    } else {
      this.props.setIsExistingData('isExistingDataOwner', false)
    }
  }

  onChangePosition = (field, e) => {
    if (e == null) {
      this.setState({ owner_name: "" })
      this.setState({ position: "" })
    } else {
      this.setState({ owner_name: e })
      this.setState({ position: "Project owner" })
    }
  }

  showAddFail = () => {
    this.setState({
      visibleErr: true,
    });
  };

  handleCancel = () => {
    this.setState({
      visibleErr: false,
    });
  };

  render() {
    const { visibleErr } = this.state
    const { IconHelper } = this.props.components

    const columns = [
      {
        title: 'Picture',
        dataIndex: 'picture',
        key: 'picture',
        align: 'center',
        width: 120,
        render: (text) => {
          if (columns[0]) {
            return text
          } else {
            return (
              { text }
            )
          }
        }
      },
      {
        title: 'Owner Name',
        dataIndex: 'owner_name',
        key: 'owner_name',
        width: 200,
        render: (text) => {
          if (columns[0]) {
            return text
          } else {
            return (
              <Truncate>
                {text}
              </Truncate>
            )
          }
        }
      },
      {
        title: 'Position',
        dataIndex: 'position',
        key: 'position',
        width: 200,
        render: (text) => {
          if (columns[0]) {
            return text
          } else {
            return { text }
          }
        }
      },
      {
        title: 'Roll on',
        dataIndex: 'roll_on',
        key: 'roll_on',
        width: 200,
        render: (text, record, index) => {
          if (index !== 0) {
            return (
              <div>
                <DatePickerTable
                  allowClear={false}
                  size='large'
                  format='DD MMM YYYY'
                  disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.props.start_date).startOf('day').valueOf() ||
                    (moment(this.props.end_date).endOf('day').valueOf() < dateSelect.valueOf()) ||
                    (this.state.mockdata[index-1].roll_off ? moment(this.state.mockdata[index-1].roll_off).endOf('day').valueOf() < dateSelect.valueOf() : false))}

                  value={moment(_.get(this.state, `mockdata[${index - 1}].roll_on`))}
                  onChange={
                    (date, dateString) => {
                      this.onChange("roll_on", date)
                      this.onEditDateField(index - 1, date, "roll_on")
                    }
                  }
                  size="large" />

              </div>
            )
          } else {
            return text
          }
        }
      },
      {
        title: 'Roll off',
        dataIndex: 'roll_off',
        key: 'roll_off',

        width: 200,
        render: (text, record, index) => {
          if (index !== 0) {
            return (
              <div>
                <DatePickerTable
                  allowClear={false}
                  size='large'
                  format='DD MMM YYYY'
                  disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.props.start_date).startOf('day').valueOf() ||
                    (this.state.mockdata[index - 1].roll_on !== null ? this.state.mockdata[index - 1].roll_on.valueOf() > dateSelect.valueOf() : false) ||
                    (moment(this.props.end_date).endOf('day').valueOf() < dateSelect.valueOf()))}
                  value={moment(_.get(this.state, `mockdata[${index - 1}].roll_off`))}
                  onChange={
                    (date, dateString) => {
                      this.onChange("roll_off", date)
                      this.onEditDateField(index - 1, date, "roll_off")
                    }
                  }
                  size="large" />
              </div>
            )
          } else {
            return text
          }
        }
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        render: (text, record, index) => {
          {
            if (index !== 0) {
              return (
                <span onClick={() => this.onClickDelete(index)}>
                  <IconHelper type="delete" />
                </span>
              )
            } else {
              if (this.state.owner_name !== '' && (this.state.newRoll_on !== null && this.state.newRoll_off !== null)) {
                let isDuplicate = false
                _.each(this.props.memberList, (value) => {
                  if (this.state.currentData === value.employee_id) {
                    return isDuplicate = true
                  }
                })
                if (isDuplicate) {
                  return (<div style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={() => this.showAddFail()}
                  >
                    <Icon style={{ fontSize: '18px' }}
                      type="plus-circle" />
                  </div>)
                } else {
                  return (<div style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={() => this.onClickAdd()}
                  >
                    <Icon style={{ fontSize: '18px' }}
                      type="plus-circle" />
                  </div>)
                }
              } else {
                return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Icon style={{ fontSize: '18px' }}
                    type="plus-circle" />
                </div>
                )
              }
            }

          }
        }
      },
    ]
    const createTab = {
      picture: (<div><Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" /></div>),
      owner_name: (<div style={{ width: '160px' }}>
        <SelectButton
          showSearch
          allowClear={true}
          placeholder="Project Owner"
          optionFilterProp="children"
          value={this.state.selectedItems}
          onChange={
            value => {
              this.onDropDownChange(value)
            }}>

          {
            this.state.originalEmployeeList ? this.filterSelectable(this.state.originalEmployeeList).map(item => (
              <Option key={item.id} value={item.id}>
                {`${item.personnel_info.firstname_en} ${item.personnel_info.lastname_en}`}
              </Option>
            )) : (<Option value="lucy">Lucy</Option>)
          }
        </SelectButton>
      </div>
      ),
      position: (<div>{this.state.position}</div>),
      roll_on: (<div>
        <DatePickerTable
          allowClear={true}
          size='large'
          format={'DD MMM YYYY'}
          defaultPickerValue={moment(this.props.start_date)}
          disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.props.start_date).startOf('day').valueOf()) ||
            (moment(this.props.end_date).endOf('day').valueOf() < dateSelect.valueOf()) ||
            (this.state.newRoll_off ? moment(this.state.newRoll_off).endOf('day').valueOf() < dateSelect.valueOf() : false)}
          value={
            this.state.newRoll_on
          }
          onChange={
            (roll_on, dateString) => {
              this.onChange("newRoll_on", roll_on)
              this.toCheckIsExistingData(this.state.selectedItems, roll_on, this.state.newRoll_off)
            }
          }
        /></div>),
      roll_off: (<div>
        <DatePickerTable
          allowClear={true}
          size='large'
          format={'DD MMM YYYY'}
          defaultPickerValue={moment(this.props.end_date)}
          disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.props.start_date).startOf('day').valueOf() ||
            (this.state.newRoll_on !== null ? moment(this.state.newRoll_on).valueOf() > dateSelect.valueOf() : false) ||
            (moment(this.props.end_date).endOf('day').valueOf() < dateSelect.valueOf()))}
          value={
            this.state.newRoll_off
          }
          onChange={
            (roll_off, dateString) => {
              this.onChange("newRoll_off", roll_off)
              this.toCheckIsExistingData(this.state.selectedItems, this.state.newRoll_on, roll_off)
            }
          }
        /></div>),
    }
    const data = [createTab, ...this.state.mockdata]

    return (
      <Fragment>
        <TableCustom
          scroll={{ y: 602 }}
          pagination={{ position: 'none', defaultPageSize: 100 }}
          columns={columns}
          dataSource={data}
          rowKey="owner_name"
        />
        <div>
          <Popup
            title="Error"
            visible={visibleErr}
            onOk={this.handleCancel}
            footer={[
              <ButtonCustom type="primary" onClick={this.handleCancel}>Ok</ButtonCustom>
            ]}
          >
            <p>" {this.state.owner_name} " is Assigned</p>
          </Popup>
        </div>
      </Fragment>
    )
  }

}


export default withApollo(OwnerEditChargeCodeTable)


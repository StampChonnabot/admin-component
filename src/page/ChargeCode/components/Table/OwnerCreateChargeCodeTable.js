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
  ButtonCustom
} from '../styled'
const { Option } = SelectButton

class OwnerCreateChargeCodeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mockdata: [],
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
      originalEmployeeList: this.props.employeeList,
      lockedStartDate: this.props.start_date,
      lockedEndDate: this.props.end_date,
    };
  }

  componentWillUpdate(nextprop, nextstate) {
    if (this.props.employeeList.length != nextprop.employeeList.length && this.props.employeeList) {

      this.setState({ originalEmployeeList: nextprop.employeeList })
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

    if (nextprop.start_date != this.state.lockedStartDate) {
      this.setState({
        lockedStartDate: nextprop.start_date,
        lockedEndDate: nextprop.end_date
      })
    }

  }

  onDropDownChange = (input) => {
    const getEmployee = _.filter(this.state.originalEmployeeList, employee => employee.id == input)
    let tempSelected = ''
    if(input){
      this.setState(
        {
          position: "Project owner",
          owner_name: `${getEmployee[0].personnel_info.firstname_en} ${getEmployee[0].personnel_info.lastname_en}`,
          selectedItems: input,
          currentData: input,
        }
      )
      tempSelected = input
    }else{
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
    this.toCheckIsExistingData(tempSelected,this.state.newRoll_on,this.state.newRoll_off)

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
      employee_id: currentObject.employee_id,
      roll_on: currentObject.roll_on,
      roll_off: currentObject.roll_off,
      type: 1
    }
  }


  onClickAdd = () => {
    let newdata = {
      picture: (<div><Avatar src='https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' /></div>),
      owner_name: this.state.owner_name,
      position: this.state.position,
      roll_on: this.state.newRoll_on,
      roll_off: this.state.newRoll_off,
      employee_id: this.state.currentData,
      type: 1,
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
    });
    if (mappedOwners) {
      this.props.setOwners({
        owners: mappedOwners
      })
    }

  }

  toCheckIsExistingData = (selectedItem,rollOn,rollOff) => {
    if(selectedItem || rollOn || rollOff){
      this.props.setIsExistingData('isExistingDataOwner', true)
    }else{
      this.props.setIsExistingData('isExistingDataOwner', false)
    }
  }

  onClickDelete = (index) => {
    let defaultarr = _.cloneDeep(this.state.mockdata)
    defaultarr.splice(index - 1, 1);
    this.setState({
      mockdata: defaultarr,
    })
    this.props.setOwners({
      owners: _.map(defaultarr, this.ownerParser)
    })
  }

  onEditDateField = (index, updateValue, field) => {
    let toBeManipulate = _.cloneDeep(this.state.mockdata)
    toBeManipulate[index][field] = updateValue
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
    if(e){
      this.setState({
        [field]: e
      });
    }else{
      this.setState({
        [field]: null
      });
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
            return { text }
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
                  disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.state.lockedStartDate).valueOf() ||
                     (dateSelect.valueOf() > moment(moment(this.state.lockedEndDate).valueOf()))||
                     (this.state.mockdata[index-1].roll_off ? moment(this.state.mockdata[index-1].roll_off).endOf('day').valueOf() < dateSelect.valueOf() : false))}
                  value={moment(text)}
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
                  disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.state.lockedStartDate).valueOf() || this.state.mockdata[index - 1].roll_on !== null ? this.state.mockdata[index - 1].roll_on.valueOf() > dateSelect.valueOf() : false) || (moment(moment(this.state.lockedEndDate)).valueOf() < dateSelect.valueOf())}
                  value={moment(text)}
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
                  return (
                    <div style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      onClick={() => this.showAddFail()}
                    >
                      <Icon style={{ fontSize: '18px' }}
                        type="plus-circle" />
                    </div>
                  )
                } else {
                  return (
                    <div style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      onClick={() => this.onClickAdd()}
                    >
                      <Icon style={{ fontSize: '18px' }}
                        type="plus-circle" />
                    </div>
                  )
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
      owner_name: (<div style={{width:'160px'}}>
        
        <SelectButton
          showSearch
          allowClear={true}
          placeholder="Project Owner"
          optionFilterProp="children"
          disabled={!this.state.lockedStartDate}
          value={this.state.selectedItems}
          onChange={
            value => {
              this.onDropDownChange(value)
            }
          }>

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
      roll_on: (<div><DatePickerTable
        disabled={!this.state.lockedStartDate}
        allowClear={true}
        defaultPickerValue={moment(this.props.start_date)}
        size='large'
        format={'DD MMM YYYY'}
        disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.state.lockedStartDate).valueOf()) || 
          (moment(moment(this.state.lockedEndDate)).valueOf() < dateSelect.valueOf())||
          (this.state.newRoll_off ? moment(this.state.newRoll_off).endOf('day').valueOf() < dateSelect.valueOf() : false)}
        value={
          this.state.newRoll_on
        }
        onChange={
          (roll_on, dateString) => {
            this.onChange("newRoll_on", roll_on)
            this.toCheckIsExistingData(this.state.selectedItems,roll_on,this.state.newRoll_off)
          }
        }
      /></div>),
      roll_off: (<div><DatePickerTable
        allowClear={true}
        size='large'
        disabled={!this.state.lockedStartDate}
        format={'DD MMM YYYY'}
        defaultPickerValue={this.props.end_date}
        disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.state.lockedStartDate).valueOf() || (this.state.newRoll_on != null ? this.state.newRoll_on.valueOf() > dateSelect.valueOf() : false) || (moment(moment(this.state.lockedEndDate)).valueOf() < dateSelect.valueOf()))}
        value={
          this.state.newRoll_off
        }
        onChange={
          (roll_off, dateString) => {
            this.onChange("newRoll_off", roll_off)
            this.toCheckIsExistingData(this.state.selectedItems,this.state.newRoll_on,roll_off)

          }
        }
      /></div>),
    }
    const data = [createTab, ...this.state.mockdata]

    return (
      <Fragment>
        <TableCustom
          scroll={{ y: 602 }}
          pagination={{ position: 'none',defaultPageSize: 100 }}
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


export default withApollo(OwnerCreateChargeCodeTable)


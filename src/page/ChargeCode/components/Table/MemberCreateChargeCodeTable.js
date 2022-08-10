import React, { Fragment } from 'react'
import _ from 'lodash'
import { Avatar, Icon } from 'antd'
import moment from 'moment'
import { withApollo } from 'react-apollo';
import {
  SelectButton,
  DatePickerTable,
  TableCustom,
  Popup,
  ButtonCustom
} from '../styled'
const { Option } = SelectButton

class MemberCreateChargeCodeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mockdata: [],
      pageSize: 10000,
      currentPage: 1,
      picture: (<div><Avatar src='https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' /></div>),
      member_name: '',
      position: null,
      roll_on: null,
      roll_off: null,
      currentData: [],
      newRoll_on: null,
      newRoll_off: null,
      selectedItems: [],
      visibleErr: false,
      originalEmployeeList: [],
      lockedStartDate: this.props.start_date,
      lockedEndDate: this.props.end_date,
    };


  }
  componentWillMount() {
    this.setState({ originalEmployeeList: this.props.employeeList })
  }
  componentWillUpdate(nextprop, nextstate) {

    if (nextprop.shouldResetDate) {
      let tempMock = _.map(this.state.mockdata, member => {
        let tempMember = member
        tempMember.roll_on = nextprop.forcedStartDate
        tempMember.roll_off = nextprop.forcedEndDate
        return tempMember
      })
      this.setState({
        mockdata: tempMock,
        newRoll_on: '',
        newRoll_off: '',
      })
    }
    if (nextprop.start_date != this.props.start_date || nextprop.end_date != this.props.end_date) {
      this.setState({
        newRoll_on: '',
        newRoll_off: '',
      })
    }

  }

  filterSelectable = (input) => {
    return _.filter(input, (employee) => {
      return (!(_.includes(this.state.mockdata.map(value => value.employee_id), employee.id) ||
        _.includes(this.props.ownerList.map(value => value.employee_id), employee.id)) &&
        !employee.general_info.position.is_manager)
    })
  }

  onDropDownChange = (input) => {
    const getEmployee = _.filter(this.state.originalEmployeeList, employee => employee.id == input)
    let tempSelected = ''
    if (input) {
      this.setState(
        {
          position: getEmployee[0].general_info.position.name,
          member_name: `${getEmployee[0].personnel_info.firstname_en} ${getEmployee[0].personnel_info.lastname_en}`,
          selectedItems: input,
          currentData: input,
        }
      )

      tempSelected = input
    } else {
      this.setState(
        {
          position: '',
          member_name: '',
          selectedItems: undefined,
          currentData: '',
        }
      )
      tempSelected = undefined
    }
    this.toCheckIsExistingData(tempSelected, this.state.newRoll_on, this.state.newRoll_off)
  }

  memberParser = (currentObject) => {
    return {
      employee_id: currentObject.employee_id,
      roll_on: currentObject.roll_on,
      roll_off: currentObject.roll_off,
      type: 2
    }
  }



  onClickAdd = () => {
    let newdata = {
      picture: (<div><Avatar src='https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' /></div>),
      member_name: this.state.member_name,
      position: this.state.position,
      roll_on: this.state.newRoll_on,
      roll_off: this.state.newRoll_off,
      employee_id: this.state.currentData,
      type: 2
    }

    let mappedMembers = _.map([newdata, ...this.state.mockdata], this.memberParser)

    this.setState({
      mockdata: [newdata, ...this.state.mockdata],
      picture: '',
      member_name: '',
      position: '',
      roll_on: null,
      roll_off: null,
      newRoll_on: null,
      newRoll_off: null,

      selectedItems: [],

    });
    if (mappedMembers) {
      this.props.setMembers({
        members: mappedMembers
      })

    }
    this.props.setIsExistingData('isExistingDataMember', false)
  }

  onClickDelete = (index) => {
    let defaultarr = _.cloneDeep(this.state.mockdata)

    defaultarr.splice(index - 1, 1);

    this.setState({
      mockdata: defaultarr,
    })
    this.props.setMembers({
      members: _.map(defaultarr, this.memberParser)
    })
  }

  onEditDateField = (index, updateValue, field) => {
    let toBeManipulate = _.cloneDeep(this.state.mockdata)
    toBeManipulate[index][field] = updateValue
    this.setState({
      mockdata: toBeManipulate
    })
  }

  toCheckIsExistingData = (selectedItem, rollOn, rollOff) => {
    if (selectedItem || rollOn || rollOff) {
      this.props.setIsExistingData('isExistingDataMember', true)
    } else {
      this.props.setIsExistingData('isExistingDataMember', false)
    }
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

    const { IconHelper
    } = this.props.components

    const columnsmember = [
      {
        title: 'Picture',
        dataIndex: 'picture',
        key: 'picture',
        align: 'center',
        width: 120,
        render: (text) => {
          if (columnsmember[0]) {
            return text
          } else {
            return { text }
          }
        }
      },
      {
        title: 'Member Name',
        dataIndex: 'member_name',
        key: 'member_name',
        width: 200,
        render: (text) => {
          if (columnsmember[0]) {
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
          if (columnsmember[0]) {
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
                  format="DD MMM YYYY"
                  disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.props.start_date).valueOf() ||
                    (moment(moment(this.props.end_date)).valueOf() < dateSelect.valueOf()) ||
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
        key: 'roll_off',
        dataIndex: 'roll_off',
        width: 200,
        render: (text, record, index) => {
          if (index !== 0) {
            return (
              <div>
                <DatePickerTable
                  allowClear={false}
                  format="DD MMM YYYY"
                  disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.props.start_date).valueOf() || this.state.mockdata[index - 1].roll_on !== null ? this.state.mockdata[index - 1].roll_on.valueOf() > dateSelect.valueOf() : false) || (moment(moment(this.props.end_date)).valueOf() < dateSelect.valueOf())}
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
              if (this.state.member_name !== '' && (this.state.newRoll_on !== null && this.state.newRoll_off !== null)) {
                let isDuplicate = false
                _.each(this.props.ownerList, (value) => {
                  if (this.state.currentData === value.employee_id) {
                    return isDuplicate = true
                  }
                })
                if (isDuplicate) {
                  return (
                    <div
                      onClick={() => this.showAddFail()}
                      style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Icon style={{ fontSize: '18px' }}
                        type="plus-circle" />
                    </div>

                  )
                } else {
                  return (
                    <div
                      onClick={() => this.onClickAdd()}
                      style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Icon style={{ fontSize: '18px' }}
                        type="plus-circle" />
                    </div>
                  )
                }

              } else {
                return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Icon style={{ fontSize: '18px' }}
                    type="plus-circle" />
                </div>)
              }
            }

          }
        }
      },
    ]

    const createTab = {
      picture: (<div><Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" /></div>),
      member_name: (<div style={{ width: '160px' }}>
        <SelectButton
          disabled={!this.props.start_date}
          allowClear={true}
          showSearch
          placeholder="Project Member"
          optionFilterProp="children"
          value={this.state.selectedItems}
          onChange={
            value => {
              this.onDropDownChange(value)
            }
          }
        >
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
      roll_on: (<DatePickerTable
        defaultPickerValue={moment(this.props.start_date)}
        disabled={!this.props.start_date}
        allowClear={true}
        size='large'
        format={'DD MMM YYYY'}
        disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.props.start_date).valueOf()) ||
          (moment(moment(this.props.end_date)).valueOf() < dateSelect.valueOf()) ||
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
      />),
      roll_off: (<DatePickerTable
        defaultPickerValue={moment(this.props.end_date)}
        disabled={!this.props.start_date}
        allowClear={true}
        size='large'
        format={'DD MMM YYYY'}
        disabledDate={dateSelect => (dateSelect.valueOf() < moment(this.props.start_date).valueOf() || (this.state.newRoll_on !== null ? this.state.newRoll_on.valueOf() > dateSelect.valueOf() : false) || (moment(moment(this.props.end_date)).valueOf() < dateSelect.valueOf()))}
        value={
          this.state.newRoll_off
        }
        onChange={
          (roll_off, dateString) => {
            this.onChange("newRoll_off", roll_off)
            this.toCheckIsExistingData(this.state.selectedItems, this.state.newRoll_on, roll_off)
          }
        }
      />),
    }
    const datamember = [createTab, ...this.state.mockdata]

    return (
      <Fragment>
        <TableCustom
          scroll={{ y: 602 }}
          pagination={{ position: 'none', defaultPageSize: 100 }}
          columns={columnsmember}
          dataSource={datamember}
          rowKey="member_name" />
        <div>
          <Popup
            title="Error"
            visible={visibleErr}
            onOk={this.handleCancel}
            footer={[
              <ButtonCustom type="primary" onClick={this.handleCancel}>Ok</ButtonCustom>
            ]}
          >
            <p>" {this.state.member_name} " is Assigned</p>
          </Popup>
        </div>
      </Fragment>
    )
  }

}


export default withApollo(MemberCreateChargeCodeTable)

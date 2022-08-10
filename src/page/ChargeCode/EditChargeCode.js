/* eslint-disable react/no-unescaped-entities */
/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import { Form, Row, Col, Select, Input, Icon, Spin } from 'antd'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withApollo } from 'react-apollo'
import _ from 'lodash'
import moment from 'moment'
import {
  EDIT_CHARGE_CODE,
  GET_CHRAGE_CODES_DUPLICATE,
  GET_EMPLOYEE_LIST,
  GET_CHRAGE_CODES_DETAIL
} from '../../constants/index'
import OwnerEditChargeCodeTable from './components/Table/OwnerEditChargeCodeTable';
import MemberEditChargeCodeTable from './components/Table/MemberEditChargeCodeTable';
import {
  Sectioner,
  TextOnButton,
  InputBox,
  Footer,
  RangePickerCustom,
  SelectButton,
  Popup,
} from './components/styled'

const { Option } = Select
const { TextArea } = Input

class EditChargeCode extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentData: null,
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      description: 'Default desc',
      code: '',
      codeName: 'default name',
      startdate: '',
      enddate: '',
      id: 0,
      owners: [],
      members: [],
      is_active: false,
      visibility_private: false,
      pageSize: 100,
      currentPage: 1,
      getEmployeeList: [],
      deletedMember: [],
      deletedOwner: [],
      isWarning: false,
      isLoading: true,
      lastStateDate: '',
      isExistingDataOwner: false,
      isExistingDataMember: false,
      typeCancel: 'cancel_general',
      currentModalDetailSecond: '',
      isLeave: false
    }
  }

  componentWillMount() {
    const { location } = this.props
    const { pageSize, currentPage } = this.state
    this.runQuery(location.state.currentID)
    this.runQueryGetEmployee(pageSize, currentPage)

  }

  Modal = (title, detail, second, type, left, right) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalDetailSecond: second,
      currentModalType: type,
      leftModalButton: left,
      rightModalButton: right,
    })
  };

  ModalWarning = (title, detail, second, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalDetailSecond: second,
      currentModalType: type
    })
  };

  runQuery = async (id) => {
    const { client } = this.props
    let isLeave = false
    return new Promise(async (resolve) => {
      const queryResult = await
        client.query({
          query: GET_CHRAGE_CODES_DETAIL,
          variables: { id },
        })
      let owner_array = []
      let member_array = []
      if (queryResult.data) {
        _.each(queryResult.data.charge_code.employees, (value) => {
          if (value.type === 'OWNER') {
            value.type = 1
            value.roll_on = moment(value.roll_on)
            value.roll_off = moment(value.roll_off)
            owner_array = [...owner_array, value]
            return owner_array

          } else {
            value.type = 2
            value.roll_on = moment(value.roll_on)
            value.roll_off = moment(value.roll_off)
            member_array = [...member_array, value]
            return member_array
          }
        })
      }

      const currentCode = queryResult.data.charge_code

      // check isLeave charge code
      let tempCodeName = _.cloneDeep(currentCode.name)
      if (currentCode.name.includes('[LEAVE] - ')) {
        tempCodeName = currentCode.name.replace('[LEAVE] - ', '')
        isLeave = true
      }
      this.setState({
        currentData: currentCode,
        owners: owner_array,
        members: member_array,
        description: currentCode.description,
        id: currentCode.id,
        codeName: tempCodeName,
        is_active: currentCode.is_active,
        visibility_private: currentCode.visibility_private,
        startdate: currentCode.start_date,
        enddate: currentCode.end_date,
        isLoading: false,
        lastStateDate: [moment(moment(currentCode.start_date).format('DD MMM YYYY'), 'DD MMM YYYY'), moment(moment(currentCode.end_date).format('DD MMM YYYY'), 'DD MMM YYYY')],
        isLeave
      }, () => {
        resolve('runquery success !! ')
      })
    })
  }

  onWarnModalOk = () => {
    const {
      owners,
      members,
      tempStart,
      tempEnd,
    } = this.state
    const tempOwners = _.map(owners, owner => {
      const tempOwner = owner
      tempOwner.roll_on = tempStart
      tempOwner.roll_off = tempEnd
      return tempOwner
    })
    const tempMembers = _.map(members, member => {
      const tempMember = member
      tempMember.roll_on = _.cloneDeep(tempStart)
      tempMember.roll_off = _.cloneDeep(tempEnd)
      return tempMember
    })

    this.setState({
      isWarning: false,
      owners: tempOwners,
      members: tempMembers,
      shouldResetEmployeeDate: true,
      startdate: _.cloneDeep(tempStart),
      enddate: _.cloneDeep(tempEnd)
    })
  }

  EmpParser = (currentObject) => {
    return {
      id: currentObject.existingID,
      employee_id: currentObject.employee_id,
      roll_on: currentObject.roll_on,
      roll_off: currentObject.roll_off,
      type: currentObject.type
    }
  }

  checkShouldWarn = (startDate, endDate, value) => {
    const { form } = this.props
    const {
      owners,
      members,
    } = this.state

    let passedCheck = true

    // eslint-disable-next-line consistent-return
    _.forEach(owners, owner => {
      if (owner.roll_on.startOf('day').diff(startDate.startOf('day')) < 0 || owner.roll_off.startOf('day').diff(endDate.startOf('day')) > 0) {
        this.setState({
          isWarning: true,
          tempStart: startDate,
          tempEnd: endDate
        })
        passedCheck = false
        return false
      }
    })

    // eslint-disable-next-line consistent-return
    _.forEach(members, member => {
      if (member.roll_on.startOf('day').diff(startDate.startOf('day')) < 0 || member.roll_off.startOf('day').diff(endDate.startOf('day')) > 0) {
        this.setState({
          isWarning: true,
          tempStart: startDate,
          tempEnd: endDate
        })
        passedCheck = false
        return false
      }
    })

    if (passedCheck) {
      this.onDateChange('startdate', startDate)
      this.onDateChange('enddate', endDate)
      this.setState({ lastStateDate: value })
      form.setFieldsValue({ 'range-picker': value })
    }

  }

  runQueryGetEmployee = async (limit, page) => {
    const offset = (page - 1) * limit
    const { client } = this.props
    try {
      const queryResult = await
        client.query({
          query: GET_EMPLOYEE_LIST,
          variables: { limit, offset },
        })
      this.setState({
        getEmployeeList: queryResult.data.employees.employee_list,
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error)
    }
  }

  setDeleteOwner = (value) => {
    const newData = []
    if (value.deletedOwner) {
      _.each(value.deletedOwner, Item => {
        newData.push(Item.existingID)
      })
      this.setState({ deletedOwner: newData })
    } else {
      _.each(value.deletedMem, Item => {
        newData.push(Item.existingID)
      })
      this.setState({ deletedMember: newData })
    }
  }

  setOwners = (value) => {
    this.setState({ owners: value.owners })
  }

  setMembers = (value) => {
    this.setState({ members: value.members })
  }

  setIsExistingData = (field, value) => {
    this.setState({ [field]: value })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { form } = this.props
    const { currentData,
      isExistingDataMember,
      isExistingDataOwner,
      owners,
    } = this.state
    form.validateFieldsAndScroll((err) => {
      if (err) {
        return
      }
      if (owners.length === 0) {
        this.ModalWarning('Warning', 'Please select at least one owner.', '', 'warning')
      } else if (isExistingDataOwner) {
        this.setState({ typeCancel: 'cancel_existing_owner' })
        this.Modal('Warning', "You haven't added owner.", 'Are you sure you want to continue ?', 'existing_owner', 'Cancel', 'Confirm')
      } else if (isExistingDataMember) {
        this.setState({ typeCancel: 'cancel_existing_member' })
        this.Modal('Warning', "You haven't added member.", 'Are you sure you want to continue ?', 'existing_member', 'Cancel', 'Confirm')
      }
      else {
        this.setState({ typeCancel: 'cancel_general' })
        this.Modal('Confirmation', `Are you sure you want to update ${currentData.name} ?`, '', 'edit', 'Cancel', 'Confirm')
      }
    })
  }

  handleOk = (type) => {
    const { setBreadCrumb, history } = this.props
    switch (type) {
      case 'edit':
        this.onClickEdit()
        setBreadCrumb(
          [
            { url: '/chargecode/list', text: 'Charge Code List', inactive: true, backIndex: 2 },
            { url: '/chargecode/details', text: 'Charge Code Details' }
          ]
        )
        break
      case 'cancel':
        this.setState({ visibleModal: false })
        history.push({
          pathname: '/chargecode/list'
        })
        break
      case 'existing_owner':
        this.setState({ visibleModal: false, visibleModalWarning: false })
        this.onClickEdit()
        break
      case 'existing_member':
        this.setState({ visibleModal: false, visibleModalWarning: false })
        this.onClickEdit()
        break
      case 'warning':
        this.setState({ visibleModalWarning: false })
        break
      default:
        break
    }

  };


  handleCancel = type => {
    const { form } = this.props
    const { lastStateDate } = this.state
    switch (type) {
      case 'cancel_general':
        this.setState({
          visibleModal: false,
          visibleModalWarning: false
        })
        break
      case 'cancel_existing_owner':
        this.setState({
          visibleModal: false,
          visibleModalWarning: false,
          typeCancel: 'cancel_general'
        })
        break
      case 'cancel_existing_member':
        this.setState({
          visibleModal: false,
          visibleModalWarning: false,
          typeCancel: 'cancel_general'
        })
        break
      case 'warning':
        this.setState({
          isWarning: false
        })
        form.setFieldsValue({ 'range-picker': lastStateDate })
        break
      default:
        break
    }
  };

  handleOKToCancel = () => {
    const { history } = this.props
    history.push({
      pathname: '/chargecode/list'
    })
  }

  onSeletedVisibility = (value) => {
    if (value === 'private') {
      this.setState({ visibility_private: true })
    } else {
      this.setState({ visibility_private: false })
    }
  }

  onSeletedIsActive = (value) => {
    this.setState({ is_active: value })
  }

  onDateChange = (field, date) => {
    this.setState({ [field]: date })

  }

  runQueryCheckCode = (code) => {
    const { client } = this.props
    return new Promise(async (res) => {
      await client.resetStore()
      const queryResult = await
        client.query({
          query: GET_CHRAGE_CODES_DUPLICATE,
          variables: { code },
        })
      if (!queryResult.data.charge_code_duplicate) {
        this.setState({
          code
        })
      }
      res(queryResult.data.charge_code_duplicate)
    })
  }

  onNameChange = (field, event) => {
    this.setState({ [field]: event })

  }

  setReset = () => {
    this.setState({ shouldResetEmployeeDate: false })
  }

  runQueryEdit = async (
    is_active,
    name,
    start_date,
    end_date,
    visibility_private,
    description,
    deleted_employee_ids,
    id,
    employees) => {
    const { components } = this.props
    const { Message } = components
    const { history, client, location } = this.props
    await client.resetStore()
    await client.mutate({
      mutation: EDIT_CHARGE_CODE,
      variables: { is_active, name, start_date, end_date, visibility_private, description, deleted_employee_ids, id, employees }
    })
    history.replace({
      pathname: '/chargecode/details',
      state: {
        currentID: location.state.currentID
      }
    })
    Message('success', 'Edit charge code successful')
    this.setState({ visibleModal: false })
  }

  validateToDescription = (rule, value, callback) => {
    try {
      if (value) {
        if (value.length > 30) {
          callback('Character must be no longer than 30 characters.')
        } else {
          callback()
        }
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  };

  validateToDescriptionText = (rule, value, callback) => {
    try {
      if (value && value.length > 50) {
        callback('Character must be no longer than 50 characters')
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  };

  validateToDuplicate = async (rule, value, callback) => {
    const { code } = this.state
    try {
      if (value && value.length === 6) {
        if (await this.runQueryCheckCode(value)) {
          callback(`${code} already exist, please use a different code`)
        }
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  };

  onClickEdit = () => {
    const {
      owners,
      members,
      codeName,
      isLeave,
      deletedOwner,
      deletedMember,
      startdate,
      enddate,
      is_active,
      visibility_private,
      description,
      id,
    } = this.state
    let employees = _.cloneDeep(owners)
    const tempCodeName = '[LEAVE] - '
    let tempCurrentCodeName = _.cloneDeep(codeName)
    if (isLeave) {
      tempCurrentCodeName = tempCodeName + codeName
    }
    if (members.length !== 0) {

      _.each(members, (value) => {
        employees = [...employees, value]
      })
    }

    let deletedEmployee = _.cloneDeep(deletedOwner)
    if (deletedMember.length > 0) {
      _.each(deletedMember, (value) => {
        deletedEmployee = [...deletedEmployee, value]
      })
    }
    const startTime = moment(startdate)
    const endTime = moment(enddate)
    const parsedStart = moment.utc(startTime.format('YYYY-MM-DD')).format()
    const parsedEnd = moment.utc(endTime.format('YYYY-MM-DD')).format()
    const parsedEmp = _.map(employees, this.EmpParser)
    this.runQueryEdit(
      is_active,
      tempCurrentCodeName,
      parsedStart,
      parsedEnd,
      visibility_private,
      description,
      deletedEmployee,
      id,
      parsedEmp
    )

  }


  render() {
    const { components, form } = this.props
    const { Button, StandardContainer } = components
    const { getFieldDecorator } = form
    const {
      currentModalDetailSecond,
      currentModalDetail,
      currentModalType,
      typeCancel,
      rightModalButton,
      leftModalButton,
      visibleModal,
      currentModalTitle,
      visibleModalWarning,
      isWarning,
      isLoading,
      visibility_private,
      shouldResetEmployeeDate,
      tempStart,
      tempEnd,
      startdate,
      enddate,
      owners,
      members,
      getEmployeeList,
      isExistingDataMember,
      isExistingDataOwner,
      currentData,
      lastStateDate,
      codeName,

    } = this.state

    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    if (currentData) {
      return (
        <Fragment>
          <StandardContainer subHeader="Edit Charge Code" loading={false}>
            <Form onSubmit={this.handleSubmit} className="login-form">
              <Row style={{ paddingTop: '24px' }}>
                <Col span={12}>
                  <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                    <TextOnButton>Charge Code Name <span style={{ color: 'red' }}>*</span></TextOnButton>
                    <Form.Item>
                      {getFieldDecorator('Description', {
                        initialValue: codeName,
                        rules: [

                          {
                            required: true,
                            message: 'Please input your charge code name !'
                          },
                          {
                            validator: this.validateToDescription,
                          },
                          {
                            pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                            message: 'Charge Code can not contain any of the following characters: /:*!@#$%&^| !!',
                          }
                        ],
                      })(
                        <InputBox
                          style={{ width: '100%', height: '40px', fontSize: '16px' }}
                          maxlength="31"
                          placeholder="Charge code name"
                          onChange={value => { this.onNameChange('codeName', value.target.value) }}
                        />
                      )}
                    </Form.Item>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ paddingRight: '24px' }}>
                    <TextOnButton>Charge Code (maximum  6 characters) <span style={{ color: 'red' }}>*</span></TextOnButton>
                    <InputBox
                      style={{ width: '100%', height: '40px', fontSize: '16px' }}
                      defaultValue={currentData.code}
                      disabled
                      maxlength="6"
                      onBlur={value => { this.onNameChange('code', value.target.value) }}
                    />
                  </div>
                </Col>
              </Row>

              <Row style={{ paddingTop: '16px' }}>
                <Col span={12}>
                  <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                    <TextOnButton>Start Date - End Date <span style={{ color: 'red' }}>*</span></TextOnButton>
                    <Form.Item>
                      {getFieldDecorator('range-picker', {
                        initialValue: [moment(moment(currentData.start_date).format('DD MMM YYYY'), 'DD MMM YYYY'), moment(moment(currentData.end_date).format('DD MMM YYYY'), 'DD MMM YYYY')],
                        rules: [{ type: 'array', required: true, message: 'Please select time !' }]
                      })(
                        <RangePickerCustom
                          allowClear={false}
                          size='large'
                          format='DD MMM YYYY'
                          value={lastStateDate}
                          onChange={(value) => {
                            this.checkShouldWarn(value[0], value[1], value)
                          }}
                        />
                      )}
                    </Form.Item>
                  </div>
                </Col>

                <Col span={12}>
                  <div style={{ paddingRight: '24px' }}>
                    <TextOnButton>Charge Code Type <span style={{ color: 'red' }}>*</span></TextOnButton>
                    <InputBox
                      style={{ width: '100%', height: '40px', fontSize: '16px' }}
                      disabled
                      defaultValue={currentData.visibility_private ? 'Private' : 'Public'}
                    />
                  </div>
                </Col>
              </Row>

              <Row style={{ paddingTop: '16px' }}>
                <Col span={12}>
                  <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                    <TextOnButton>Charge Code Description</TextOnButton>
                    <Form.Item>
                      {getFieldDecorator('ProjectProject', {
                        initialValue: currentData.description,
                        rules: [
                          {
                            validator: this.validateToDescriptionText,
                          },
                          {
                            pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                            message: 'Charge code description can not contain any of the following characters: /:*!@#$%&^| !!',
                          },
                        ],
                      })(
                        <TextArea
                          style={{ height: '120px', fontSize: '16px' }}
                          maxlength="51"
                          placeholder="Charge code description"
                          onChange={(value) => { this.onNameChange('description', value.target.value) }}
                        />
                      )}
                    </Form.Item>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ paddingRight: '24px' }}>
                    <TextOnButton>Charge Code Status <span style={{ color: 'red' }}>*</span></TextOnButton>
                    <Form.Item>
                      {getFieldDecorator('is-active', {
                        initialValue: currentData.is_active,
                        rules: [{ required: true, message: 'Please select charge code status !' }],
                      })(
                        <SelectButton
                          onChange={(value) => {
                            this.onSeletedIsActive(value)
                          }}
                          placeholder='Charge code status'
                        >
                          <Option value>Active</Option>
                          <Option value={false}>Inactive</Option>
                        </SelectButton>,
                      )}
                    </Form.Item>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ paddingRight: '24px' }}>
                    <TextOnButton>Working Type</TextOnButton>
                    <Form.Item>
                      <InputBox
                        style={{ width: '100%', height: '40px', fontSize: '16px' }}
                        disabled
                        value={currentData.is_not_work === 1 ? 'Non-Billable' : 'Billable'}
                      />

                    </Form.Item>
                  </div>
                </Col>
              </Row>
              <Row style={{ paddingTop: '48px' }}>
                <Col>
                  <Sectioner>Owner</Sectioner>
                </Col>
              </Row>
              <Row style={{ paddingTop: '16px', paddingRight: '24px', paddingLeft: '24px' }}>
                <OwnerEditChargeCodeTable
                  loading={{
                    spinning: isLoading,
                    indicator: <Spin indicator={antIcon} />,
                  }}
                  setReset={this.setReset}
                  shouldResetDate={shouldResetEmployeeDate}
                  forcedStartDate={tempStart}
                  forcedEndDate={tempEnd}
                  start_date={startdate}
                  end_date={enddate}
                  memberList={members}
                  setDeleteOwner={this.setDeleteOwner}
                  ownersList={owners}
                  employeeList={getEmployeeList}
                  isExistingDataOwner={isExistingDataOwner}
                  setIsExistingData={this.setIsExistingData}
                  setOwners={this.setOwners}
                  pagination={{ position: 'none' }}
                  components={components}
                />
              </Row>

              {visibility_private ?
                (
                  <div>
                    <Row style={{ paddingTop: '48px' }}>
                      <Col>
                        <Sectioner>Member</Sectioner>
                      </Col>
                    </Row>
                    <Row style={{ paddingTop: '16px', paddingRight: '24px', paddingLeft: '24px' }}>
                      <MemberEditChargeCodeTable
                        loading={{
                          spinning: isLoading,
                          indicator: <Spin indicator={antIcon} />,
                        }}
                        shouldResetDate={shouldResetEmployeeDate}
                        forcedStartDate={tempStart}
                        forcedEndDate={tempEnd}
                        start_date={startdate}
                        end_date={enddate}
                        ownerList={owners}
                        setDeleteOwner={this.setDeleteOwner}
                        memberList={members}
                        employeeList={getEmployeeList}
                        isExistingDataMember={isExistingDataMember}
                        setIsExistingData={this.setIsExistingData}
                        setMembers={this.setMembers}
                        pagination={{ position: 'none' }}
                        components={components}
                      />
                    </Row>
                  </div>
                ) : null}

              <Footer>
                <Form.Item>

                  <Button
                    theme='cancel'
                    onClick={() => {
                      this.Modal('Confirmation', 'Are you sure you want to discard your changes ?', '', 'cancel', 'Cancel', 'Confirm')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button htmlType="submit">Save</Button>

                </Form.Item>
              </Footer>
            </Form>

            <div>
              <Popup
                title="Warning"
                visible={isWarning}
                onOk={this.onWarnModalOk}
                onCancel={() => {
                  this.handleCancel('warning')
                }}
              >

                <p>Changing start and end date will reset all employee's roll on and roll off date, continue?</p>
              </Popup>
            </div>

            <Popup
              title={currentModalTitle}
              visible={visibleModalWarning}
              footer={[
                <Button type="primary" onClick={() => { this.handleOk(currentModalType) }}>Ok</Button>
              ]}
            >
              {currentModalDetail}<br />
              {currentModalDetailSecond}

            </Popup>


            <Popup
              title={currentModalTitle}
              visible={visibleModal}
              footer={[
                <Button theme="cancel" key="back" onClick={() => { this.handleCancel(typeCancel) }}>{leftModalButton}</Button>,
                <Button onClick={() => { this.handleOk(currentModalType) }} key="submit" type="primary">{rightModalButton}</Button>
              ]}
            >
              {currentModalDetail}<br />
              {currentModalDetailSecond}
            </Popup>

          </StandardContainer>
        </Fragment>
      )
    } else {
      return null
    }
  }

}

function mapStateToProps() {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setBreadCrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
  }
}

const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}
const actionSetTitle = (title) => {
  return {
    type: 'SET_TITLE',
    payload: title,
  }
}

const NewEditChargeCode = Form.create({ name: 'normal_login' })(EditChargeCode)

EditChargeCode.propTypes = {
  components: PropTypes.oneOfType([PropTypes.object]),
  form: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  location: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func,
}

EditChargeCode.defaultProps = {
  components: {},
  form: {},
  history: {},
  client: {},
  location: {},
  setBreadCrumb: null
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(NewEditChargeCode))

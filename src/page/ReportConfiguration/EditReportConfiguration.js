/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import { Row, Col, Form, Spin, Icon } from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import EditReportConfigurationListTable from './components/Table/EditReportConfigurationListTable'
import { GET_REPORT_CODE_SET_DETAILS, EDIT_REPORT_CODE_SET } from '../../constants/index'

import {
  InputBox,
  TextOnButton,
  Footer,
  Popup,
} from './components/styled'


class EditReportConfiguration extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chargecode_delete: [],
      chargecode: [],
      reportname: null,
      report_id: null,
      currentData: {},
      chargeCodeData: [],
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      visibleModalWarning: false,
      isLoading: true,
      isExistingData: false,
      currentModalDetailSecond: ''
    }
  }


  // eslint-disable-next-line react/sort-comp
  UNSAFE_componentWillMount() {
    const id = _.get(this.props, 'location.state.currentData')
    this.runQuery(id)
  }

  Modal = (title, detail,second, type, left, right) => {
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

  setExistingData = (value) => {
    this.setState({ isExistingData: value })
  }

  ModalWarning = (title, detail,second, type) => {
    this.setState({
      visibleModalWarning: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalDetailSecond: second,
      currentModalType: type
    })
  };

  runQuery = async (id) => {
    const {client} = this.props
    await client.resetStore()
    const queryResult = await
      client.query({
        query: GET_REPORT_CODE_SET_DETAILS,
        variables: { id },
      })
    this.setChargeCode({
      chargecode: queryResult.data.report_code_set.charge_codes
    })
    this.setState({
      report_id: id,
      reportname: queryResult.data.report_code_set.name,
      currentData: queryResult.data.report_code_set,
      chargeCodeData: queryResult.data.report_code_set.charge_codes,
      isLoading: false
    })
  }

  runQueryEdit = async (
    charge_code_delete_ids,
    charge_code_ids,
    name,
    id) => {
      const {client,history} = this.props
      const {chargecode} = this.state
    await client.resetStore()
    await client.mutate({
        mutation: EDIT_REPORT_CODE_SET,
        variables: { charge_code_delete_ids, charge_code_ids, name, id }
      })
    history.replace({
      pathname: '/reportconfiguration/details',
      state: {
        activeTab: '2',
        codeSet: chargecode
      }
    })
    this.setState({ visibleModal: false, visibleModalWarning: false })
  }

  setChargeCode = (value) => {
    const arrChargeCode = []
    _.each(value.chargecode, Item => {
      arrChargeCode.push(Item.id)
    })
    this.setState({
      chargecode: arrChargeCode
    })
  }

  setChargeCodeDelete = (value) => {
    const arrChargeCodedelete = []
    const uniqArr = _.uniqBy(value.chargecode_delete, 'id')
    _.each(uniqArr, Item => {
      arrChargeCodedelete.push(Item.id)
    })
    this.setState({
      chargecode_delete: arrChargeCodedelete
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    const {form} = this.props
    const {chargecode,isExistingData,reportname} = this.state
    form.validateFields((err) => {
      if (err) {
        return
      }
      if (chargecode.length === 0) {
        this.ModalWarning('Warning', 'Please input Charge code at least one code.','', 'warning')
      }
      else if (isExistingData) {
        this.Modal('Warning', "You haven't added charge code.", 'Are you sure you want to continue ?', 'existing_data','Cancel', 'Confirm')

      } else {
        this.Modal('Confirmation', `Are you sure you want to update ${reportname} ?`,'', 'edit', 'Cancel', 'Confirm')
      }
    })
  };

  handleOk = (type) => {
    const {chargecode_delete,chargecode,reportname,report_id} = this.state
    const {setBreadCrumb,history} = this.props
    switch (type) {
      case 'edit':
        this.runQueryEdit(
          chargecode_delete,
          chargecode,
          reportname,
          report_id
        )
        setBreadCrumb(
          [
            { url: '/chargecode/list', text: 'Report Configuration List', inactive: true },
            { url: '/reportconfiguration/details', text: 'Report Configuration Details' }
          ]
        )
        break
      case 'warning':
        this.setState({ visibleModalWarning: false })

        break
      case 'cancel':
        history.push({
          pathname: '/chargecode/list',
          state: {
            activeTab: '2'
          }
        })
        this.setState({ visibleModal: false })
        break
      case 'existing_data':
        this.runQueryEdit(
          chargecode_delete,
          chargecode,
          reportname,
          report_id
        )
        setBreadCrumb(
          [
            { url: '/chargecode/list', text: 'Report Configuration List', inactive: true },
            { url: '/reportconfiguration/details', text: 'Report Configuration Details' }
          ]
        )
        break
      default:
        break
    }
  }

  handleCancel = () => {
    this.setState({
      visibleModal: false,
      visibleModalWarning: false,
    })
  };

  onNameChange = (field, event) => {
    const {value} = event.target
    this.setState({ [field]: value })
  }

  validateToDescription = (rule, value, callback) => {
    try {
      if (value && value.length > 30) {
        callback('Character must be no longer than 30 characters')
      } else {
        callback()
      }
    } catch (err) {
      callback(err)
    }
  };


  render() {
    const {components,form} = this.props
    const { Button, StandardContainer } = components
    const { getFieldDecorator } = form
    const {visibleModalWarning,currentData,isLoading,chargeCodeData,currentModalTitle,visibleModal,typeCancel,leftModalButton,currentModalType,rightModalButton,currentModalDetail,currentModalDetailSecond} = this.state
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    return (
      <Fragment>
        <StandardContainer subHeader="Edit Report Set">
          <Form onSubmit={this.handleSubmit} className="form">
            <Row style={{ paddingTop: '24px' }}>
              <Col span={12}>
                <div style={{ paddingLeft: '24px', paddingRight: '16px' }}>
                  <TextOnButton>Report Name<span style={{ color: 'red' }}>*</span></TextOnButton>
                  <Form.Item>
                    {getFieldDecorator('Name', {
                      initialValue: currentData.name,
                      rules: [
                        {
                          required: true,
                          message: 'Please input report name !'
                        }, {
                          validator: this.validateToDescription,
                        },
                        {
                          pattern: new RegExp("^[ก-๛A-Za-z0-9_():,.' ']{1,}$"),
                          // eslint-disable-next-line quotes
                          message: "Report name can not contain any of the following characters:  /:*!@#$%&^| !!",
                        },
                      ],
                    })(
                      <InputBox
                        maxlength="31"
                        placeholder="Please input report name"
                        onChange={value => { this.onNameChange('reportname', value) }}
                        style={{width:'352px',  height: '40px',fontSize: '16px'}}
                      />
                    )}
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <Row style={{ paddingTop: '16px' }}>
              <EditReportConfigurationListTable
                loading={{
                  spinning: isLoading,
                  indicator: <Spin indicator={antIcon} />,
                }}
                setExistingData={this.setExistingData}
                setChargeCode={this.setChargeCode}
                setChargeCodeDelete={this.setChargeCodeDelete}
                components={components}
                chargeCodeData={chargeCodeData}
              />
            </Row>
            <Footer>
              <Form.Item>
                <Button
                  theme='cancel'
                  onClick={() => {
                  this.Modal('Confirmation', 'Are you sure you want to discard your changes ?','', 'cancel', 'Cancel', 'Confirm')
                }}
                >Cancel
                </Button>
                <Button htmlType="submit">Update</Button>
              </Form.Item>
            </Footer>
          </Form>

          <Popup
            title={currentModalTitle}
            visible={visibleModal}
            footer={[
              <Button theme="cancel" key="back" onClick={() => { this.handleCancel(typeCancel) }}>{leftModalButton}</Button>,
              <Button onClick={() => { this.handleOk(currentModalType) }} key="submit" type="primary">{rightModalButton}</Button>
            ]}
          >
            {currentModalDetail}
            <br />
            {currentModalDetailSecond}
          </Popup>

          <Popup
            title={currentModalTitle}
            visible={visibleModalWarning}
            footer={[
              <Button type="primary" onClick={() => { this.handleOk(currentModalType) }}>Ok</Button>
            ]}
          >
            {currentModalDetail}
            <br />
            {currentModalDetailSecond}
          </Popup>
        </StandardContainer>
      </Fragment>
    )
  }

}

EditReportConfiguration.propTypes={
  form:PropTypes.oneOfType([PropTypes.object]),
  location:PropTypes.oneOfType([PropTypes.object]),
  client:PropTypes.func,
  history:PropTypes.func,
  components:PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb:PropTypes.func,
}
EditReportConfiguration.defaultProps={
  form:{},
  location:{},
  client:()=>{},
  history:()=>{},
  setBreadCrumb:()=>{},
  components:{}
}


const NewEditReportConfiguration = Form.create({ name: 'form' })(EditReportConfiguration)

export default withApollo(NewEditReportConfiguration)


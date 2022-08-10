/* eslint-disable react/no-unescaped-entities */
/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { Row, Col, Spin, Icon } from 'antd'
import Cookies from 'js-cookie'
import PropTypes from 'prop-types'
import { GET_REPORT_CODE_SETS_LIST, DELETE_REPORT_CODE_SET } from '../../../../constants/index'
import CustomPagination from '../Foot'
import {
  TableList,
  InputBox,
  Popup
} from '../styled'

class ReportConfigurationListTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      total: props.totalPage,
      pageSize: 10,
      currentPage: 1,
      search_keyword: '',
      reportID: null,
      currentData: [],
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      leftModalButton: '',
      rightModalButton: '',
      visibleModal: false,
      isLoading: true
    }
  }



  Modal = (title, detail, type, left, right) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type,
      leftModalButton: left,
      rightModalButton: right,
    })
  };

  codeListParser = (val) => {
    const tempValue = _.clone(val)
    tempValue.code_amount = val.charge_codes.length
    return tempValue
  }

  runQuery = async (limit, page, search_keyword) => {
    const offset = (page - 1) * limit
    const {client} = this.props
    await client.resetStore()
    const queryResult = await
      client.query({
        query: GET_REPORT_CODE_SETS_LIST,
        variables: { limit, offset, search_keyword },
      })
    this.setState({
      currentData: _.map(queryResult.data.report_code_sets.report_code_sets, this.codeListParser),
      total: queryResult.data.report_code_sets.total,
      isLoading: false,
    })
    
  }

  runQueryDelete = async (id) => {
    const {client} = this.props
    const{pageSize,currentPage} =this.state
    await client.mutate({
        mutation: DELETE_REPORT_CODE_SET,
        variables: { id },
      })
    this.runQuery(pageSize, currentPage, '')
    this.setState({ visibleModal: false })
  }

  onSelectRowToEdit = (data) => {
    const {setBreadCrumb,history} = this.props
    Cookies.set('active_tab', 'report')
    setBreadCrumb(
      [
        { url: '/chargecode/list', text: 'Report Configuration List', inactive: true },
        { url: '/reportconfiguration/edit', text: 'Edit Report Configuration' }
      ]
    )
    history.push({
      pathname: '/reportconfiguration/edit',
      state: {
        currentData: data.id
      }
    })
  }

  showModalDelete = (index) => {
    const {currentData}=this.state
    const a = currentData[index]['id']
    this.setState({ reportID: a })
    this.Modal('Confirmation',`Are you sure you want to delete ${currentData[index].name} ?`,'delete','Cancel','Confirm')
  }

  handleOk = (type) => {
    const {reportID} = this.state
    switch (type) {
      case 'delete':
        this.runQueryDelete(reportID)
        break

      default:
        break
    }


  };

  handleCancel = () => {
    this.setState({ visibleModal: false })
  };

  onNameChange = (field, event) => {
    const {value} = event.target
    this.setState({ [field]: value })
  }


  showSearch = () => {
    const {pageSize, currentPage, search_keyword}=this.state
    // eslint-disable-next-line camelcase
    if (search_keyword) {
      this.runQuery(pageSize, currentPage, search_keyword)
    } else {
      this.runQuery(pageSize, currentPage, '')
    }
  }

  onSelectRow = (record) => {
    const ids = _.map(record.charge_codes, (eachCode) => eachCode.id)
    Cookies.set('active_tab', 'report')
    const {history} = this.props
    history.push({
      pathname: '/reportconfiguration/details',
      state: { codeSet: ids }
    })
  }

  onCreateReportSet = () => {
    const {setBreadCrumb,history}= this.props
    Cookies.set('active_tab', 'report')
    setBreadCrumb(
      [
        { url: '/chargecode/list', text: 'Report Configuration List', inactive: true, state: { isReportActive: true } },
        { url: '/reportconfiguration/create', text: 'Create Report Configuration' }
      ]
    )
    history.push({
      pathname: '/reportconfiguration/create'
    })
  }

  onNameClick = (record) => {
    Cookies.set('active_tab', 'report')
    const {setBreadCrumb,history} = this.props
    setBreadCrumb(
      [
        { url: '/chargecode/list', text: 'Report Configuration List', inactive: true },
        { url: '/reportconfiguration/details', text: 'Report Configuration Details' }
      ])
    const ids = _.map(record.charge_codes, (eachCode) => eachCode.id)
    history.push({
      pathname: '/reportconfiguration/details',
      state: { 
        codeSet: ids,
        reportName: record.name
       }
    })

  }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {
      const {pageSize, currentPage, search_keyword} = this.state
      const {setBreadCrumb} = this.props
      setBreadCrumb()
      this.runQuery(pageSize, currentPage, search_keyword)
    }

  render() {
    const {components} = this.props
    const {currentData,pageSize,isLoading,total,currentModalDetail,currentModalTitle,visibleModal,currentModalType,leftModalButton,rightModalButton} = this.state
    const { Button, IconHelper } = components
    
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    const columns = [
      {
        title: 'Report Set',
        dataIndex: 'name',
        key: 'name',
        width:'15%',
        render: (text, record) => (
          <a style={{paddingLeft:'14px'}} onClick={() => { this.onNameClick(record) }}>
            {text}
          </a>
        ),
      },
      {
        title: 'Code Amount',
        dataIndex: 'code_amount',
        key: 'code_amount',
        align: 'center',
        width:'30%',
      },
      {
        title: 'Create Date',
        dataIndex: 'created_at',
        key: 'created_at',
        width:'30%',
        render: (text) => (
          <span>
            {moment(text).format('DD MMM YYYY')}
          </span>
        )
      },
      {
        title: 'Action',
        key: 'action',
        width:'15%',
        render: (text, record, index) => (
          <span>
            <a onClick={() => {
              this.onSelectRowToEdit(record, index)
            }}
            >
              <span>
                <IconHelper type="edit" />
              </span>
            </a>
            <a onClick={() => {
              this.showModalDelete(index)
            }}
            >
              <span>
                <IconHelper type="delete" />
              </span>
            </a>
          </span>
        ),
      },
    ]

    const data = currentData

    const onShowSizeChange = (current, pageSize) => {
      this.setState({ pageSize })
      this.runQuery(pageSize, current, '')
    }

    const onChange = page => {
      this.setState({
        currentPage: page,
      })
      this.runQuery(pageSize, page, '')
    }

    return (
      <Fragment>
        <Row style={{ paddingTop: '16px' }}>
          <Col span={6} style={{ left: '24px', paddingRight: '8px' }}>
            <div>
              <InputBox
                style={{ width: '100%', height: '40px' }}
                allowClear
                placeholder="Search"
                onChange={value => { this.onNameChange('search_keyword', value) }}
              />
            </div>
          </Col>

          <Col span={12}>
            <div>
              <Button style={{ left: '4px' }} mode="search" onClick={this.showSearch}>></Button>
            </div>
          </Col>

          <Col span={6}>
            <div style={{ position: 'absolute', right: '24px' }}>
              <Button size="l" onClick={this.onCreateReportSet}>Create Report Set</Button>
            </div>
          </Col>
        </Row>
        <Row style={{ paddingTop: '16px' }}>
          <TableList
            loading={{
              spinning: isLoading,
              indicator: <Spin indicator={antIcon} />,
            }}
            pagination={{ position: 'none', pageSize }}
            columns={columns}
            dataSource={data}
          />
          <CustomPagination
            showSizeChanger
            onShowSizeChange={onShowSizeChange}
            onChange={onChange}
            defaultCurrent={1}
            total={total}
          />
        </Row>

        <Popup
          title={currentModalTitle}
          visible={visibleModal}
          footer={[
            <Button theme="cancel" onClick={this.handleCancel}>{leftModalButton}</Button>,
            <Button onClick={() => { this.handleOk(currentModalType) }}> {rightModalButton}</Button>
          ]}
        >
          <p>{currentModalDetail}</p>
        </Popup>
      </Fragment>
    )
  }
}

const actionSetTitle = (title) => {
  return {
    type: 'SET_TITLE',
    payload: title,
  }
}

const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setBreadCrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
  }
}

ReportConfigurationListTable.propTypes={
  client:PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb:PropTypes.func,
  history:PropTypes.oneOfType([PropTypes.object]),
  components:PropTypes.oneOfType([PropTypes.object]),
  totalPage:PropTypes.number
}

ReportConfigurationListTable.defaultProps={
  client:{},
  setBreadCrumb:()=>{},
  history:()=>{},
  components:{},
  totalPage:0
}


export default connect(null, mapDispatchToProps)(withApollo(ReportConfigurationListTable))


/* eslint-disable camelcase */
import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { Link } from 'react-router-dom'
import { Spin, Icon } from 'antd'
import CustomPagination from './Footer'
import { DELETE_COMPANY_HOLIDAY, GET_COMPANY_HOLIDAY_VARS } from '../../../constants/index'
import { Popup, TableCustom } from './styled'

class HolidayCompanyTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      total: props.totalPage,
      pageSize: 10,
      currentPage: 1,
      currentData: _.map(props.data, this.holidayCompanyParser),
      currentDelID: '',
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      visibleModal: false,
      isLoading: true
    }
  }

  // eslint-disable-next-line react/sort-comp
  UNSAFE_componentWillMount() {
    const {currentPage,pageSize} = this.state
    this.runQuery(currentPage,pageSize)
  }

  Modal = (title, detail, type) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type,
    })
  }

  holidayCompanyParser = (holidaycompany, index) => {
    return {
      id: holidaycompany.id,
      key: index,
      holidaycompany_name: holidaycompany.holidaycompany_name,
      holiday_amount: holidaycompany.holiday_amount,
      created_at: holidaycompany.created_at,
      holidaydetails: holidaycompany.holidaydetails
    }
  }

  showModal = (index) => {
    const {currentData} = this.state
    const a = currentData[index]['id']
    this.setState({ currentDelID: a })
    this.Modal('Confirmation', `Are you sure you want to delete ${currentData[index].holidaycompany_name} ?`, 'delete')
  }

  handleOk = (type) => {
    const {currentDelID} = this.state
    switch (type) {
      case 'delete':
        this.runQueryDelete(currentDelID)
        break
      default:
        break
    }
  }

  handleCancel = () => {
    this.setState({
      visibleModal: false,
    })
  }

  runQueryDelete = async (id) => {
    const {components,client} = this.props
    const {currentPage,pageSize} = this.state
    const { Message } = components
    await client.resetStore()
    await client.mutate({
      mutation: DELETE_COMPANY_HOLIDAY,
      variables: { id },
    })
    Message('success', 'Delete company holiday successful')
    this.runQuery(currentPage, pageSize)
    this.setState({ visibleModal: false })
  }

  runQuery = async (page, limit) => {
    const offset = (page - 1) * limit
    const {components,client} = this.props
    const { Message } = components
    try {
      await client.resetStore()
      const queryResult = await
       client.query({
          query: GET_COMPANY_HOLIDAY_VARS,
          variables: { offset, limit },
        })
      this.setState({
        currentData: _.map(queryResult.data.company_holidays.company_holidays, this.holidayCompanyParser),
        total: queryResult.data.company_holidays.total,
        isLoading: false
      })
    } catch (error) {

      Message('error', 'Query company holiday data error')
    }
  }

  checkDatePassed = (obj) => {
    const {currentData} = this.state
    let isPass = true
    if (currentData) {
      const findIndex = currentData.indexOf(obj)
      _.each(currentData[findIndex].holidaydetails, (holiday) => {
        if (moment(holiday.date).valueOf() < moment().valueOf()) {
          isPass = false
        }
      })
    }
    return isPass
  }

  render() {
    const {isLoading,currentData,pageSize,total,currentModalTitle,visibleModal,currentModalDetail,currentModalType} = this.state
    const {setBreadCrumb} = this.props
    const columns = [
      {
        title: 'Effective Year',
        dataIndex: 'holidaycompany_name',
        key: 'holidaycompany_name',
        width: '296px',
        render: (text, record, index) => (
          <Link
            to={{
              pathname: '/companyholiday/details',
              state: {
                currentId:currentData[index].id,
                currentData
              }
            }}
          >
            <span onClick={() => {
              setBreadCrumb(
                [
                  { url: '/companyholiday/list', text: 'Company Holiday List', inactive: true },
                  { url: '/companyholiday/details', text: 'Company Holiday Details' }
                ]
              )
            }}
            >{text}
            </span>
          </Link>
        ),
      },
      {
        title: 'Amount Holiday',
        dataIndex: 'holiday_amount',
        align: 'center',
        width: '296px',
        key: 'holiday_amount',
      },
      {
        title: 'Create Date',
        dataIndex: 'created_at',
        width: '267px',
        key: 'created_at',
        align: 'center',
        render: (text) => (
          <span>
            {moment(text).format('DD MMM YYYY')}
          </span>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: '173px',
        align: 'center',
        render: (text, record, index) => {
            if (this.checkDatePassed(text)) {
              return (
                <span onClick={() => {
                  this.showModal(index)
                }}
                >
                  <IconHelper type="delete" />
                </span>
              )
            } else {
              return (
                <span>
                  <IconHelper type="delete" color="grey" />
                </span>
              )
            }
        },
      },
    ]

    const onShowSizeChange = (current, pageSize) => {
      this.setState({ pageSize })
      this.runQuery(current, pageSize)
    }
    
    const onChange = page => {
      const {pageSize} = this.state
      this.setState({
        currentPage: page,
      })
      this.runQuery(page, pageSize)
    }
    const {components} = this.props
    const { IconHelper, Button
    } = components

    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

    return (
      <div>
        <TableCustom
          loading={{
            spinning: isLoading,
            indicator: <Spin indicator={antIcon} />,
          }}
          scroll={{ y: 602 }}
          style={{ height: 594 }}
          columns={columns}
          dataSource={currentData}
          pagination={{ position: 'none', pageSize }}
        />
        <CustomPagination
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          onChange={onChange}
          defaultCurrent={1}
          total={total}
        />
        <Popup
          title={currentModalTitle}
          visible={visibleModal}
          footer={[
            <Button theme="cancel" key="back" onClick={this.handleCancel}>Cancel</Button>,
            <Button key="submit" type="primary" onClick={() => { this.handleOk(currentModalType) }}>Confirm</Button>
          ]}
        >{currentModalDetail}
        </Popup>
      </div>
    )
  }
}
function mapStateToProps() {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setBreadCrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
  }
}
const actionSetBreadcrumb = (stage = []) => {
  return {
    type: 'SET_BREAD',
    payload: stage,
  }
}

HolidayCompanyTable.propTypes={
  components:PropTypes.oneOfType([PropTypes.object]),
  client:PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb:PropTypes.oneOfType([PropTypes.object]),
  data:PropTypes.oneOfType([PropTypes.object]),
  totalPage:PropTypes.number
}
HolidayCompanyTable.defaultProps={
  components:{},
  client:{},
  setBreadCrumb:{},
  data:{},
  totalPage:0
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(HolidayCompanyTable))

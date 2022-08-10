import React, { Fragment } from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withApollo } from 'react-apollo'
import moment from 'moment'
import { GET_CHARGE_CODES_LIST } from '../../../../constants/index'
import { Row, Col, Typography, Spin, Icon } from 'antd'
import CustomPagination from '../Foot'
import Cookies from 'js-cookie'

import {
  TableCustom,
  InputBox,
  SelectButton,
  Truncate
} from '../styled'
class ChargeCodeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      total: props.totalPage,
      pageSize: 10000,
      currentPage: 1,
      status: '',
      search_keyword: '',
      currentData: _.map(props.data, this.chargeCodeParser),
      userPermission: Cookies.get("user_role"),
      isLoading: true
    };
  }

  chargeCodeParser = (preset, index) => {
    return {
      key: index,
      code: preset.code,
      name: preset.name,
      description: preset.description,
      employees: preset.employees,
      start_date: preset.start_date,
      end_date: preset.end_date,
      is_active: preset.is_active,
      id: preset.id
    }
  }

  UNSAFE_componentWillMount() {
    this.props.setBreadCrumb()
    this.props.actionSetTitle('Charge Code')
    this.runQuery(this.state.pageSize, this.state.currentPage, this.state.status, this.state.search_keyword)
  }

  runQuery = async (limit, page, status, search_keyword) => {
    let offset = (page - 1) * limit
    await this.props.client.resetStore()
    const queryResult = await
      this.props.client.query({
        query: GET_CHARGE_CODES_LIST,
        variables: { limit, offset, status, search_keyword },
      })
    this.setState({
      currentData: _.map(queryResult.data.charge_codes.charge_codes, this.chargeCodeParser),
      total: queryResult.data.charge_codes.total,
      isLoading: false
    })
  }

  onChange = (field, e) => {
    this.setState({
      [field]: e
    });
  }

  onNameChange = (field, event) => {
    let value = event.target.value
    this.setState({ [field]: value })
  }

  onSeletedIsActive = (value) => {
    this.setState({ status: value })
  }

  showSearch = () => {
    if (this.state.search_keyword && this.state.status) {

      this.runQuery(this.state.pageSize, this.state.currentPage, this.state.status, this.state.search_keyword)
    } else if (this.state.search_keyword) {

      this.runQuery(this.state.pageSize, this.state.currentPage, "", this.state.search_keyword)
    } else if (this.state.status) {

      this.runQuery(this.state.pageSize, this.state.currentPage, this.state.status, "")
    } else {

      this.runQuery(this.state.pageSize, this.state.currentPage, "", "")
    }
  }

  render() {
    const { Button } = this.props.components
    const columns = [
      {
        title: 'Charge Code',
        dataIndex: 'code',
        key: 'code',
        paddingLeft: 14,
        render: (text, record, index) => (
          <Link to={{
            pathname: "/chargecode/details",
            state: {
              currentID: this.state.currentData[index].id
            }
          }}>
            <span onClick={() => {
              this.props.setBreadCrumb(
                [
                  { url: '/chargecode/list', text: "Charge Code List", inactive: true },
                  { url: '/chargecode/details', text: "Charge Code Details" }
                ]
              )
            }}>
              {text}
            </span>
          </Link>
        ),
      },
      {
        title: 'Charge Code Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => (
          <Truncate>
            {text}
          </Truncate>



        )
      },
      {
        title: 'Start Date',
        key: 'start_date',
        dataIndex: 'start_date',
        render: (text) => (
          <span>
            {moment(text).format('DD MMM YYYY')}
          </span>
        )
      },
      {
        title: 'End Date',
        key: 'end_date',
        dataIndex: 'end_date',
        render: (text) => (
          <span>
            {moment(text).format('DD MMM YYYY')}
          </span>
        )
      },
      {
        title: 'Status',
        key: 'is_active',
        dataIndex: 'is_active',
        render: (text) => (
          <span>
            {text == true ? <div style={{ color: '#57D9A3' }}>Active</div> : <div style={{ color: '#FF8F73' }}>Inactive</div>}
          </span>
        )

      },
    ]
    const onShowSizeChange = (current, pageSize) => {
      this.setState({ pageSize })
      this.runQuery(pageSize, current, "", "")
    }
    const onChange = page => {
      this.setState({
        currentPage: page,
      });
      this.runQuery(this.state.pageSize, page, "", "")
    };
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

    return (
      <Fragment>
        <Row>
          <Col span={6}>
            <div style={{ paddingLeft: '24px', paddingRight: '16px', paddingTop: '24px' }}>
              <SelectButton style={{ width: '100%' }}
                allowClear
                placeholder="Select Status"
                onChange={(value) => {
                  this.onSeletedIsActive(value)
                }}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </SelectButton>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ paddingRight: '8px', paddingTop: '24px' }}>
              <InputBox
                style={{ width: '100%', height: '40px' }}
                allowClear
                placeholder="Search"
                onChange={value => { this.onNameChange("search_keyword", value) }} />
            </div>
          </Col>
          <Col span={6}>
            <div style={{ paddingTop: '24px' }}>
              <Button style={{ marginLeft: '0px' }} mode="search" onClick={this.showSearch}></Button>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ position: 'absolute', right: '24px', paddingTop: '24px' }}>
              {this.state.userPermission == 'back_office_admin' || this.state.userPermission == 'hr' || this.state.userPermission == 'manager' ? (
                <Link to="/chargecode/create">
                  <Button 
                  size="xl" 
                  onClick={() => {
                    this.props.setBreadCrumb(
                      [
                        { url: '/chargecode/list', text: "Charge Code List", inactive: true },
                        { url: '/chargecode/create', text: "Create Charge Code" }
                      ]
                    )
                  }}>Create Charge Code</Button></Link>
              ) : (
                  null
                )}

            </div>
          </Col>

        </Row>
        <Row style={{ paddingTop: '16px' }}>
          <TableCustom
            loading={{
              spinning: this.state.isLoading,
              indicator: <Spin indicator={antIcon} />,
            }}
            pagination={{ position: 'none' }}
            columns={columns}
            dataSource={this.state.currentData}
            pagination={{ position: 'none', pageSize: this.state.pageSize }}
          />
          <CustomPagination
            showSizeChanger={true}
            onShowSizeChange={onShowSizeChange}
            onChange={onChange}
            defaultCurrent={1}
            total={this.state.total}
          />
        </Row>


      </Fragment>
    )
  }

}

function mapStateToProps(state) {
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



export default connect(mapStateToProps, mapDispatchToProps)(withApollo(ChargeCodeTable))

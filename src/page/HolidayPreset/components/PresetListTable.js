import React, { Fragment } from 'react'
import moment from 'moment'
import _ from 'lodash'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Spin, Icon } from 'antd'
import CustomPagination from './Footer'
import { Popup, TableCustom, Truncate } from './styled'
import { DELETE_HOLIDAY_PRESET, GET_HOLIDAY_PRESET_LIST } from '../../../constants/index'

class PresetListTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      total: 0,
      pageSize: 10,
      currentPage: 1,
      visible: false,
      currentDelID: '',
      currentData: {},
      currentModalTitle: '',
      currentModalDetail: '',
      currentModalType: '',
      isLoading: true,
    }
  }

  componentWillMount() {
    const { data } = this.props
    const { pageSize, currentPage } = this.state
    this.setState({
      currentData: _.map(data, this.holidayPresetsParser),
    })
    this.runQuery(pageSize, currentPage)
  }

  Modal = (title, detail, type) => {
    this.setState({
      visibleModal: true,
      currentModalTitle: title,
      currentModalDetail: detail,
      currentModalType: type,
    })
  }

  holidayPresetsParser = (preset, index) => {
    return {
      key: index,
      name: preset.name,
      amount: preset.amount,
      holidays: preset.holidays,
      created_at: preset.created_at,
      id: preset.id,
    }
  }

  showModal = (index) => {
    const { currentData } = this.state
    const a = currentData[index]['id']
    this.setState({ currentDelID: a })
    this.Modal(
      'Confirmation',
      `Are you sure you want to delete ${currentData[index].name} ?`,
      'delete',
    )
  }

  handleOk = (type) => {
    const { currentDelID } = this.state
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

  runQuery = async (limit, page) => {
    const { components, client } = this.props
    const offset = (page - 1) * limit
    const { Message } = components
    await client.resetStore()
    try {
      const queryResult = await client.query({
        query: GET_HOLIDAY_PRESET_LIST,
        variables: { limit, offset },
      })
      this.setState({
        currentData: _.map(
          queryResult.data.holiday_presets.preset_list,
          this.holidayPresetsParser,
        ),
        total: queryResult.data.holiday_presets.total,
        isLoading: false,
      })
    } catch (error) {
      Message('error', 'Query holiday preset error')
    }
  }

  runQueryDelete = async (id) => {
    const { components, client } = this.props
    const { Message } = components
    const { pageSize, currentPage } = this.state
    await client.resetStore()

    await client.mutate({
      mutation: DELETE_HOLIDAY_PRESET,
      variables: { id },
    })
    Message('success', 'Delete holiday preset successful')
    this.runQuery(pageSize, currentPage)
    this.setState({
      visibleModal: false,
    })
  }

  render() {
    const { components, setBreadCrumb } = this.props
    const { Button, IconHelper } = components
    const {
      pageSize,
      isLoading,
      currentData,
      total,
      currentModalTitle,
      visibleModal,
      currentModalType,
      currentModalDetail,
    } = this.state
    const columns = [
      {
        title: 'Preset Name',
        dataIndex: 'name',
        key: 'name',
        width: '296px',
        render: (text, record) => (
          <Link
            to={{
              pathname: '/holidaypreset/details',
              state: {
                currentPreset: record.id,
              },
            }}
          >
            <Truncate
              onClick={() => {
                setBreadCrumb([
                  {
                    url: '/holidaypreset/list',
                    text: 'Holiday Preset List',
                    inactive: true,
                  },
                  { url: '/holidaypreset/details', text: 'Holiday Preset Details' },
                ])
              }}
            >
              {text}
            </Truncate>
          </Link>
        ),
      },
      {
        title: 'Amount Holiday',
        dataIndex: 'amount',
        align: 'center',
        width: '296px',
        key: 'amount',
      },
      {
        title: 'Modified',
        dataIndex: 'created_at',
        width: '267px',
        key: 'created_at',
        align: 'center',
        render: (text) => <span>{moment(text).format('DD MMM YYYY')}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        width: '173px',
        align: 'center',
        render: (text, record, index) => (
          <span
            onClick={() => {
              this.showModal(index)
            }}
          >
            <IconHelper type="delete" />
          </span>
        ),
      },
    ]
    const onShowSizeChange = (current, pageSize) => {
      this.setState({ pageSize })
      this.runQuery(pageSize, current)
    }
    const onChange = (page) => {
      this.setState({
        currentPage: page,
      })
      this.runQuery(pageSize, page)
    }

    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    return (
      <div>
        <TableCustom
          loading={{
            spinning: isLoading,
            indicator: <Spin indicator={antIcon} />,
          }}
          scroll={{ y: 602 }}
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
            <Button theme="cancel" key="back" onClick={this.handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                this.handleOk(currentModalType)
              }}
            >
              Confirm
            </Button>,
          ]}
        >
          {currentModalDetail}
        </Popup>
      </div>
    )
  }
}

function mapStateToProps() {
  return {}
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
PresetListTable.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  data: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func.isRequired,
  actionSetTitle: PropTypes.func.isRequired,
}
PresetListTable.defaultProps = {
  data: {},
  location: {},
  components: {},
  client: {},
}
export default connect(mapStateToProps, mapDispatchToProps)(withApollo(PresetListTable))

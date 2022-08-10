/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { Fragment } from 'react'
import moment from 'moment'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import CustomPagination from '../../HolidayPreset/components/Footer'
import { GET_WORK_PRESETS_LIST } from '../../../constants/index'
import { Truncate, TableCustom } from './styles'


class WorkListTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      total: 0,
      pageSize: 10,
      currentPage: 1,
      currentData: _.map(props.data, this.workPresetsParser),
    }
  }

  componentWillMount() {
    const {setBreadCrumb } = this.props
    const { pageSize, currentPage } = this.state
    setBreadCrumb()
    this.runQuery(pageSize, currentPage)
  }

  workPresetsParser = (preset, index) => {
    return {
      key: index,
      name: preset.name,
      type: preset.type,
      start_time: preset.start_time,
      end_time: preset.end_time,
      work_day: preset.work_day,
      id: preset.id
    }
  }

  runQuery = async (limit, page) => {
    const { client } = this.props
    const offset = page > 1 ? (page - 1) * limit : 0
    await client.resetStore()

    const queryResult = await
      client.query({
        query: GET_WORK_PRESETS_LIST,
        variables: { limit, offset },
      })
    this.setState({
      currentData: _.map(queryResult.data.work_presets.work_presets, this.workPresetsParser),
      total: queryResult.data.work_presets.total,
    })
  }

    render(){
      const {pageSize, total, currentData } = this.state
      const { setBreadCrumb } = this.props
      const columns = [
        {
          title: 'Preset Name',
          dataIndex: 'name',
          key: 'name',
          width: '296px',
          render: (text, record, index) => (
            <Link to={{
              pathname: '/workpreset/details',
              state: {
                work_day: this.state.currentData[index].work_day,
                currentID: this.state.currentData[index].id,

              }
            }}
            >
              <Truncate onClick={() => {
                setBreadCrumb(
                  [
                    { url: '/workpreset/list', text: 'Work Preset List', inactive: true },
                    { url: '/workpreset/details', text: 'Work Presets Details' }
                  ]
                )
              }}
              >{text}
              </Truncate>
            </Link>
          ),

        },
        {
          title: 'Work Type',
          dataIndex: 'type',
          key: 'type',
          width: '296px',
        },
        {
          title: 'Start Time',
          dataIndex: 'start_time',
          key: 'start_time',
          width: '296px',
          render: (text) => (
            <span>
              {moment(text).format('LT')}
            </span>
          ),
        },
        {
          title: 'End Time',
          dataIndex: 'end_time',
          key: 'end_time',
          width: '296px',
          render: (text) => (
            <span>
              {moment(text).format('LT')}
            </span>
          ),
        },
        {
          title: 'Work Day',
          dataIndex: 'work_day',
          key: 'work_day',
          width: '296px',
        },
      ]
      const onShowSizeChange = (current, pageSize) => {
        this.setState({ pageSize })
        this.runQuery(pageSize, current)
      }
      const onChange = page => {
        this.setState({
          currentPage: page,
        })
        this.runQuery(pageSize, page)
      }
      return (
        <Fragment>
          <div>
            <TableCustom columns={columns} dataSource={currentData} pagination={{ position: 'none', pageSize }} />
            <CustomPagination
              showSizeChanger
              onShowSizeChange={onShowSizeChange}
              onChange={onChange}
              defaultCurrent={1}
              total={total}
            />
          </div>
        </Fragment>

      )
    }
}

const mapDispatchToProps = dispatch => {
  return {
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
    setBreadCrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
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
WorkListTable.propTypes = {
  setBreadCrumb: PropTypes.func,
  client:PropTypes.func,
}

WorkListTable.defaultProps = {
  setBreadCrumb: null,
  client:()=>{},
}
export default connect(null, mapDispatchToProps)(withApollo(WorkListTable))

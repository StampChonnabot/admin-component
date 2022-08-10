import React from 'react'
import { Table, Avatar } from 'antd'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Link } from 'react-router-dom'

class ReviewTable extends React.Component {
  mockDataParser = (currentObject) => {
    return {
      picture: (
        <div>
          <Avatar src="https://f.ptcdn.info/575/053/000/ow5utonifPJas6jmUI2-o.jpg" />
        </div>
      ),
      name: currentObject.name,
      status: currentObject.status,
      work: currentObject.work,
      leave: currentObject.leave,
      total: currentObject.total,
    }
  }

  render() {
    const { period, setBreadCrumb, data, pageSize } = this.props
    const columns = [
      {
        title: '',
        dataIndex: 'picture',
        key: 'picture',
        align: 'center',
        width: '120px',
      },

      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        width: '176px',
        render: (text) => (
          <Link
            to={{
              pathname: '/timesheet/submission',
              state: {
                viewOnly: true,
                currentID: period,
                empID: text.id,
              },
            }}
          >
            <span
              onClick={() => {
                setBreadCrumb([
                  { url: '/timesheet/review', text: 'Timesheet Review', inactive: true },
                  { url: '/timesheet/submission', text: 'Timesheet Submission' },
                ])
              }}
            >
              {text.name}
            </span>
          </Link>
        ),
      },
      {
        title: 'Chargeable Hour',
        dataIndex: 'work',
        width: '267px',
        key: 'work',
        align: 'center',
      },
      {
        title: 'Non-chargeable Hour',
        dataIndex: 'leave',
        width: '267px',
        align: 'center',
        key: 'leave',
      },
      {
        title: 'Total Hour',
        dataIndex: 'total',
        width: '267px',
        key: 'total',
        align: 'center',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        align: 'center',
        width: '296px',
        key: 'status',
        render: (text) => (
          <span>
            {text === 'Submitted' ? (
              <div style={{ color: '#57D9A3' }}>Submitted</div>
            ) : (
              <div style={{ color: '#FF8F73' }}>No Submission</div>
            )}
          </span>
        ),
      },
    ]

    const newData = [..._.map(data, this.mockDataParser)]

    return (
      <div>
        <Table
          columns={columns}
          dataSource={newData}
          pagination={{ position: 'none', pageSize }}
        />
      </div>
    )
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
  }
}
ReviewTable.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  data: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  period: PropTypes.oneOfType([PropTypes.object]),
  pageSize: PropTypes.number,
  setBreadCrumb: PropTypes.func.isRequired,
  actionSetTitle: PropTypes.func.isRequired,
  actionSetBreadcrumb: PropTypes.func.isRequired,
}
ReviewTable.defaultProps = {
  data: {},
  period: {},
  pageSize: {},
  location: {},
  history: {},
  components: {},
}
export default connect(null, mapDispatchToProps)(ReviewTable)

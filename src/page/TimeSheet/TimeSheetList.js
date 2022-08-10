import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import TableTimeSheet from './component/table'

class TimeSheetListComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchInput: 'default search',
    }
  }

  componentWillMount() {
    const { actionSetTitle, actionSetBreadcrumb } = this.props
    actionSetTitle('Timesheet')
    actionSetBreadcrumb('')
  }

  render() {
    const { components, setBreadCrumb, location } = this.props
    const { StandardContainer, Button } = components

    return (
      <Fragment>
        <StandardContainer
          subHeader="Work Pregress Report"
          loading={false}
          buttons={
            <Link to="/timesheet/submission">
              <Button
                size="xl"
                onClick={() => {
                  setBreadCrumb([
                    { url: '/timesheet/list', text: 'Timesheet', inactive: true },
                    { url: '/timesheet/submission', text: 'Timesheet Submission' },
                  ])
                }}
              >
                Create Submission
              </Button>
            </Link>
          }
        >
          <TableTimeSheet
            setBreadCrumb={setBreadCrumb}
            location={location}
            components={components}
          />
        </StandardContainer>
      </Fragment>
    )
  }
}
function mapStateToProps() {
  return {}
}
export const actionSetTitle = (title) => {
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
    actionSetTitle: bindActionCreators(actionSetTitle, dispatch),
    actionSetBreadcrumb: bindActionCreators(actionSetBreadcrumb, dispatch),
  }
}

TimeSheetListComponent.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  data: PropTypes.oneOfType([PropTypes.object]),
  history: PropTypes.oneOfType([PropTypes.object]),
  period: PropTypes.oneOfType([PropTypes.object]),
  pageSize: PropTypes.number,
  setBreadCrumb: PropTypes.func.isRequired,
  actionSetTitle: PropTypes.func.isRequired,
  actionSetBreadcrumb: PropTypes.func.isRequired,
  client: PropTypes.oneOfType([PropTypes.object]),
}
TimeSheetListComponent.defaultProps = {
  data: {},
  client: {},
  period: {},
  pageSize: {},
  location: {},
  history: {},
  components: {},
}
export default connect(mapStateToProps, mapDispatchToProps)(TimeSheetListComponent)

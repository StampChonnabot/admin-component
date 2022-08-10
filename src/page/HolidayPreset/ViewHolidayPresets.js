import React, { Fragment } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PresetListTable from './components/PresetListTable'

class ViewHolidayPresets extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      isRefresh: true,
    }
  }

  componentWillMount() {
    const { setBreadCrumb } = this.props
    setBreadCrumb()
    actionSetTitle('Holiday Presets')
  }

  render() {
    const { components, setBreadCrumb, location } = this.props
    const { Button, StandardContainer } = components

    return (
      <Fragment>
        <StandardContainer
          subHeader="Holiday Preset List"
          loading={false}
          buttons={
            <Fragment>
              <Link to={{ pathname: '/holidaypreset/create' }}>
                <Button
                  size="l"
                  onClick={() => {
                    setBreadCrumb([
                      {
                        url: '/holidaypreset/list',
                        text: 'Holiday Preset List',
                        inactive: true,
                      },
                      { url: '/holidaypreset/create', text: 'Create Holiday Preset' },
                    ])
                  }}
                >
                  Create Preset
                </Button>
              </Link>
            </Fragment>
          }
        >
          <PresetListTable location={location} components={components} />
        </StandardContainer>
      </Fragment>
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
ViewHolidayPresets.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func.isRequired,
  actionSetTitle: PropTypes.func.isRequired,
}
ViewHolidayPresets.defaultProps = {
  location: {},
  components: {},
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(ViewHolidayPresets))

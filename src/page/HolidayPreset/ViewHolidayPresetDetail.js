import React, { Fragment } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import moment from 'moment'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Typography, Spin, Icon } from 'antd'
import { TextOnButton, Sectioner, TableCustom } from './components/styled'
import { GET_HOLIDAY_PRESET_DETAILS } from '../../constants/index'

const Text = Typography

class ViewHolidayPresetDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      holidays: [],
      details: '',
      total: 1,
      pageSize: 10,
      currentPage: 1,
      presetName: '',
      isLoading: true,
    }
  }

  componentWillMount() {
    const { location } = this.props
    this.setState({ details: location.state.currentPreset })
    this.runQuery(`${location.state.currentPreset}`)
  }

  runQuery = async (id) => {
    const { client } = this.props
    await client.resetStore()
    const queryResult = await client.query({
      query: GET_HOLIDAY_PRESET_DETAILS,
      variables: { id },
    })

    this.setState({
      holidays: queryResult.data.holiday_preset.holidays,
      total: queryResult.data.holiday_preset.holidays.length,
      presetName: queryResult.data.holiday_preset.name,
      isLoading: false,
    })
  }

  render() {
    const { components,setBreadCrumb } = this.props
    const { Button, StandardContainer } = components
    const { details, holidays, presetName, isLoading } = this.state

    const columns = [
      {
        title: 'Holiday Name',
        dataIndex: 'holiday_name',
        key: 'holiday_name',
      },
      {
        title: 'Date',
        dataIndex: 'holiday_date',
        key: 'holiday_date',
        render: (text) => moment(text).format('DD MMMM'),
      },
    ]
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
    return (
      <Fragment>
        <StandardContainer
          subHeader="Holiday Preset Details"
          buttons={
            <Fragment>
              <Link
                to={{
                  pathname: '/timeconfiguration/edit',
                  state: {
                    currentPreset: details,
                    holidays,
                    presetName,
                  },
                }}
              >
                <Button
                  size="l"
                  onClick={() => {
                    setBreadCrumb([
                      {
                        url: '/holidaypreset/list',
                        text: 'Holiday Preset List',
                        inactive: true,
                      },
                      {
                        url: '/holidaypreset/details',
                        text: 'Holiday Preset Details',
                        inactive: true,
                      },
                      { url: '/timeconfiguration/edit', text: 'Edit Holiday Preset' },
                    ])
                  }}
                >
                  Edit
                </Button>
              </Link>
            </Fragment>
          }
          loading={false}
        >
          <Sectioner>
            <div>
              <TextOnButton>Preset Name</TextOnButton>
              <span>
                <Text>{presetName}</Text>
              </span>
            </div>
          </Sectioner>

          <TableCustom
            loading={{
              spinning: isLoading,
              indicator: <Spin indicator={antIcon} />,
            }}
            columns={columns}
            dataSource={holidays}
            pagination={{ position: 'none', defaultPageSize: 100 }}
          />
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

ViewHolidayPresetDetail.propTypes = {
  location: PropTypes.oneOfType([PropTypes.object]),
  client: PropTypes.oneOfType([PropTypes.object]),
  components: PropTypes.oneOfType([PropTypes.object]),
  setBreadCrumb: PropTypes.func.isRequired,
}
ViewHolidayPresetDetail.defaultProps = {
  location: {},
  client: {},
  components: {},
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withApollo(ViewHolidayPresetDetail))

import React, { Fragment } from 'react'
import { Select } from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { chargeCodeRenderParser } from '../HelperTimesheet'

class SearchNameComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chargeCodes: null,
      selectChargeCode: null,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      chargeCodes: nextProps.chargeCodes,
      selectChargeCode: nextProps.selectChargeCode,
    })
  }

  onChargeCodeChange = (input) => {
    this.props.setSelect(input)
  }

  onSearchChargeCode = (value, codeList) => {
    const { chargeCodes } = this.props
    const defaultCodeList = chargeCodes
    const output = _.filter(defaultCodeList, (code) => {
      return code.name.includes(value)
    })
    this.setState({
      chargeCodes: output,
    })
  }

  render() {
    const { selectChargeCode, chargeCodes } = this.state
    return (
      <Select
        size="large"
        showSearch
        disabled={false}
        placeholder="Add Charge code"
        style={{ width: '200px' }}
        filterOption={false}
        value={selectChargeCode}
        onSearch={(e) => {
          this.onSearchChargeCode(e, chargeCodes)
        }}
        onChange={this.onChargeCodeChange}
        notFoundContent={null}
      >
        {_.map(chargeCodes, chargeCodeRenderParser)}
      </Select>
    )
  }
}

SearchNameComponent.propTypes = {
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
  chargeCodes: PropTypes.oneOfType([PropTypes.object]),
}
SearchNameComponent.defaultProps = {
  data: {},
  client: {},
  period: {},
  pageSize: {},
  location: {},
  history: {},
  components: {},
  chargeCodes: {},
}

export default SearchNameComponent

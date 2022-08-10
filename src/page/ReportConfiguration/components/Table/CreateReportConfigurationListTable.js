/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { Icon } from 'antd'
import { GET_CHARGE_CODES_LIST } from '../../../../constants/index'
import {
  TableList,
  SelectButton
} from '../styled'

const { Option } = SelectButton

let mockChargeCode = []
let OPTIONS = []


class CreateReportConfigurationListTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pageSize: -1,
      currentPage: 1,
      status: '',
      search_keyword: '',
      code_name: null,
      mockdata: [],
      selectedItems: [],
      currentData: [],
      getChargeCodeList: [],
      chargeCodeList: [],
    }
  }
  
  // eslint-disable-next-line react/sort-comp
  UNSAFE_componentWillMount() {
    const  {pageSize,currentPage,status,search_keyword} =this.state
    this.runGetQuery(pageSize, currentPage, status, search_keyword)
  }

  runGetQuery = async (limit, page, status, search_keyword) => {
    const offset = (page - 1) * limit
    const {client} = this.props
    await client.resetStore()
    const queryResult = await
      client.query({
        query: GET_CHARGE_CODES_LIST,
        variables: { limit, offset, status, search_keyword },
      })

    this.setState({
      getChargeCodeList: queryResult.data.charge_codes.charge_codes,
      chargeCodeList: queryResult.data.charge_codes.charge_codes
    })
  }

  handleChange = selectedItems => {
    this.setState({ selectedItems })
  };

  onChange = (field, e) => {
    this.setState({
      [field]: e
    })
  }

  getCurrentData = (name) => {
    const newarr = []
    const {getChargeCodeList}=this.state
    // eslint-disable-next-line consistent-return
    _.each(getChargeCodeList, (value) => {
      if (value.name === name) {
        return newarr.push(value)
      }
    })

    this.setState({
      currentData: newarr
    })
  }

  onClickAdd = () => {
    const {currentData,getChargeCodeList,mockdata} = this.state
    const {setChargeCode,setExistingData}=this.props
    const newdata = {
      code: currentData[0].code,
      code_name: currentData[0].name,
      id: currentData[0].id
    }

    const cloneGetChargeCode = _.cloneDeep(getChargeCodeList)
    _.map(OPTIONS, (value, index) => {
      if (value === currentData[0].name) {
        return cloneGetChargeCode.splice(index, 1)
      } else {
        return null
      }
    })

    const chargeCode = [newdata, ...mockdata]

    this.setState({
      mockdata: [newdata, ...mockdata],
      code_name: null,
      selectedItems: [],
      getChargeCodeList: cloneGetChargeCode
    })
    if (chargeCode) {
     setChargeCode({
        chargecode: chargeCode,
      })
      setExistingData(false)
    }
  }

  onClickDelete = (index) => {
    const {mockdata,getChargeCodeList,chargeCodeList} = this.state
    const {setChargeCode} = this.props
    const defaultarr = mockdata
    let cloneGetChargeCode = _.cloneDeep(getChargeCodeList)
    _.each(chargeCodeList, (value) => {

      if (value.name === defaultarr[index - 1].code_name) {
        cloneGetChargeCode = [...cloneGetChargeCode, value]
      }
    })
    defaultarr.splice(index - 1, 1)
    this.setState({
      mockdata: defaultarr,
      getChargeCodeList: cloneGetChargeCode
    })

    setChargeCode({
      chargecode: mockdata
    })
  }

  render() {
    const {getChargeCodeList,code_name,mockdata} = this.state
    const {components,setExistingData}=this.props
    mockChargeCode = getChargeCodeList
    OPTIONS = _.map(mockChargeCode, (value) => {
      return value.name
    })

    const { IconHelper } = components
    const columns = [
      {
        title: 'Charge Code Name',
        dataIndex: 'code_name',
        key: 'code_name',
        width:'40%',
        render: (text, record, index) => {
          if (index !== 0) {
            return (
              <div style={{ paddingLeft: '14px' }}>
                {text}
              </div>
)
          } else {
            return text
          }

        }
      },
      {
        title: 'Charge Code',
        dataIndex: 'code',
        key: 'code',
        width:'40%'
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        width:'20%',
        render: (text, record, index) => 
          {
            if (index !== 0) {
              return (
                <span onClick={() => this.onClickDelete(index)}>
                  <IconHelper type="delete" />
                </span>
              )
            } else if (code_name) {
                  return (
                    <div
                      style={{ color: '#7540EE', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      onClick={() => this.onClickAdd()}
                    >
                      <Icon
                        style={{ fontSize: '18px' }}
                        type="plus-circle"
                      />
                    </div>
                  )
              } else {
                return (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Icon
                      style={{ fontSize: '18px' }}
                      type="plus-circle"
                    />
                  </div>
                )
              }

          }
        
      }
    ]

    const { selectedItems } = this.state
    const filteredOptions = OPTIONS.filter(o => {
      if (selectedItems) {
        return !selectedItems.includes(o)
      } else {
        return OPTIONS
      }
    })

    const createTab = {
      code_name: (
        <div style={{ width: '237px',paddingLeft:'14px' }}>
          <SelectButton
            showSearch
            allowClear
            placeholder="Charge code name"
            optionFilterProp="children"
            value={selectedItems}

            onChange={
              value => {
                this.handleChange(value)
                this.onChange('code_name', value)
                this.getCurrentData(value)
                if (value) {
                 setExistingData(true)
                } else {
                setExistingData(false)
                }
              }
            }
          >
            {filteredOptions ? (
              filteredOptions.map(item => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))
            ) : (
              <Option value='lucy'>Lucy</Option>
              )}
          </SelectButton>
        </div>
      ),

    }

    const data = [createTab, ...mockdata]


    return (
      <Fragment>

        <TableList
          scroll={{ y: 602 }}
          pagination={{ position: 'none' }}
          columns={columns}
          dataSource={data}
        />
      </Fragment>
    )
  }

}

CreateReportConfigurationListTable.propTypes={
  components:PropTypes.oneOfType([PropTypes.object]),
  setExistingData:PropTypes.func,
  setChargeCode:PropTypes.func,
  client:PropTypes.oneOfType([PropTypes.object]),
}

CreateReportConfigurationListTable.defaultProps={
  components:{},
  setExistingData:()=>{},
  setChargeCode:()=>{},
  client:{},
}

export default withApollo(CreateReportConfigurationListTable)

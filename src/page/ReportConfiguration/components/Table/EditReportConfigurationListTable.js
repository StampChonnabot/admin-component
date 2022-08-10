/* eslint-disable camelcase */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { withApollo } from 'react-apollo'
import { Icon} from 'antd'
import { GET_CHARGE_CODES_LIST } from '../../../../constants/index'
import {
  TableList,
  SelectButton
} from '../styled'

const { Option } = SelectButton



class EditReportConfigurationListTable extends React.Component {
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
      currentData: {},
      getChargeCodeList: [],
      selectOption: [],
      chargecodeDelete: [],
    }
  }

  componentWillUpdate(nextProps) {
    let mappedChargeCodes = []
    const {chargeCodeData}=this.props
    const {pageSize,currentPage,status,search_keyword}=this.state
    if (nextProps.chargeCodeData !== chargeCodeData) {
      mappedChargeCodes = _.map(nextProps.chargeCodeData, this.chargeCodeParser)
      // eslint-disable-next-line react/no-will-update-set-state
      this.setState({
        mockdata: mappedChargeCodes,
      })
      this.runGetQueryChargeCodeList(pageSize, currentPage,status, search_keyword)

    }
  }

  setOption(codelist) {
    const clonegetChargeCodeList = _.cloneDeep(codelist)
    const {mockdata}=this.state
    _.each(mockdata, (mockdata) => {
      // eslint-disable-next-line consistent-return
      _.each(clonegetChargeCodeList, (mockChargeCode) => {
        if (mockdata.code === mockChargeCode.code) {
          clonegetChargeCodeList.splice(clonegetChargeCodeList.indexOf(mockChargeCode), 1)
          return false
        }
      })
    })
   const newCodelist = _.map(clonegetChargeCodeList, (value) => {
      return value.name
    })
    this.setState({
      selectOption: newCodelist,
    })

  }

  runGetQueryChargeCodeList = async (limit, offset, status, search_keyword) => {
    const { client }=this.props
    await client.resetStore()
    const queryResultChargeCodeList = await
      client.query({
        query: GET_CHARGE_CODES_LIST,
        variables: { limit, offset, status, search_keyword },
      })
    this.setState({
      getChargeCodeList: queryResultChargeCodeList.data.charge_codes.charge_codes
    })
    this.setOption(queryResultChargeCodeList.data.charge_codes.charge_codes)
  }


  chargeCodeParser = (currentObject) => {
    return {
      code: currentObject.code,
      id: currentObject.id,
      code_name: currentObject.name,
    }
  }

  handleChange = selectedItems => {
    this.setState({ selectedItems })
  }

  onChange = (field, e) => {
    this.setState({
      [field]: e
    })
  }

  getCurrentData = (name) => {
    let data = ''
    const {getChargeCodeList} = this.state
    // eslint-disable-next-line consistent-return
    _.each(getChargeCodeList, (value) => {
      if (value.name === name) {
        data = value
        return false
      }
    })

    this.setState({
      currentData: data
    })

  }

  onClickAdd = () => {
    const {selectOption,mockdata,currentData,chargecodeDelete} = this.state
    const {setChargeCode,setChargeCodeDelete}=this.props
    const cloneSelectOption = _.cloneDeep(selectOption)
    let cloneMockdata = _.cloneDeep(mockdata)
    const newdata = {
      code: currentData.code,
      code_name: currentData.name,
      id: currentData.id
    }
    _.each(cloneSelectOption, (value, index) => {
      if (value === currentData.name) {
        cloneSelectOption.splice(index, 1)
        cloneMockdata = [newdata, ...mockdata]
        return false
      } else {
        return null
      }
    })

    const chargeCode = [newdata, ...mockdata]
    const cloneCodeDelete = _.filter(chargecodeDelete, (chargeCode) => {
      return chargeCode.id !== newdata.id
    })
    this.setState({
      selectOption: cloneSelectOption,
      mockdata: cloneMockdata,
      code_name: null,
      selectedItems: [],
      chargecodeDelete: cloneCodeDelete
    })
    if (chargeCode) {
     setChargeCode({
        chargecode: chargeCode
      })
      setChargeCodeDelete({
        chargecode_delete: cloneCodeDelete
      })
    }
  }

  onClickDelete = (index) => {
    const {mockdata,selectOption,getChargeCodeList,chargecodeDelete} = this.state
    const {setChargeCodeDelete,setChargeCode} = this.prop
    const defaultarr = _.cloneDeep(mockdata)
    let cloneSelectOption = _.cloneDeep(selectOption)
    // eslint-disable-next-line consistent-return
    _.each(getChargeCodeList, (value) => {
      if (value.name === defaultarr[index - 1].code_name) {
        cloneSelectOption = [...selectOption, value.name]
        return false
      }
    })
    const dataSplice = defaultarr.splice(index - 1, 1)
    let newDeleteData = chargecodeDelete

    if (!_.find(chargecodeDelete, { 'id': dataSplice[0].id })) {
      newDeleteData = [...chargecodeDelete, dataSplice[0]]
    }

    this.setState({
      mockdata: defaultarr,
      selectOption: cloneSelectOption,
      chargecodeDelete: newDeleteData
    })

    if (newDeleteData.length !== 0) {
      setChargeCodeDelete({
        chargecode_delete: newDeleteData
      })
      setChargeCode({
        chargecode: defaultarr
      })
    }

  }

  render() {
    const {components,setExistingData} = this.props
    const {code_name,selectOption,selectedItems,mockdata,getChargeCodeList}=this.state
  
    const { IconHelper } = components
    const columns = [
      {
        title: 'Charge Code Name',
        dataIndex: 'code_name',
        key: 'code_name',
        width: '40%',
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
        width: '40%'
},
{
  title: 'Action',
    key: 'action',
      align: 'center',
        width: '20%',
          render: (text, record, index) => {
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
 
let filteredOptions = []

if (selectOption) {
  filteredOptions = selectOption.filter(o => {
    if (selectedItems) {
      return !selectedItems.includes(o)
    } else {
      return selectOption
    }
  })
}


const createTab = {
  code_name: (
    <div style={{ width: '237px', paddingLeft: '14px' }}>
      <SelectButton
        showSearch
        allowClear
        placeholder="Project Owner"
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
        {filteredOptions !== [] ? (
        filteredOptions.map(item => (
          <Option key={item} value={item}>
            {item}
          </Option>
        ))
      ) : (
        <Option value="lucy">Lucy</Option>
        )}
      </SelectButton>
    </div>
  ),

}

const data = [createTab, ...mockdata]
return (
  <Fragment>
    {getChargeCodeList ? (
      <div>
        <TableList
          scroll={{ y: 602 }}
          pagination={{ position: 'none' }}
          columns={columns}
          dataSource={data}
        />
      </div>
) : null}
  </Fragment>
)
  }

}

EditReportConfigurationListTable.propTypes={
  components:PropTypes.oneOfType([PropTypes.object]),
  setExistingData:PropTypes.func,
  setChargeCode:PropTypes.func,
  setChargeCodeDelete:PropTypes.func,
  chargeCodeData:PropTypes.oneOfType([PropTypes.object]),
  client:PropTypes.oneOfType([PropTypes.object]),
}

EditReportConfigurationListTable.defaultProps={
  components:{},
  setExistingData:()=>{},
  setChargeCode:()=>{},
  setChargeCodeDelete:()=>{},
  chargeCodeData:{},
  client:{},
}

export default withApollo(EditReportConfigurationListTable)

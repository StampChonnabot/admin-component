import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import { TableList } from '../styled'

function DisplayReportConfigurationTable(props) {
  console.log("Data day",currentDataDay)
  console.log("Data",currentData)

  // onSelectRow = (data, index) => {
  //   const {currentData} = this.state
  //   const newData = _.cloneDeep(currentData)
  //   // let result = _.each(newData, (value, index) => {
  //   //   return value.code === data.code
  //   // })
  // }


    const columns = [
      {
        title: 'Charge Code',
        dataIndex: 'code',
        key: 'code',
        fixed: 'left',
        width: 200,
      },
      {
        title: 'Charge Code Name',
        dataIndex: 'description',
        key: 'description',
        fixed: 'left',
        width: 300,
      },
      { title: 'Jan', dataIndex: 'hours', key: 'jan',

     },
      { title: 'Feb', dataIndex: 'hours2', key: 'feb',

     },
      { title: 'Mar', dataIndex: 'hours3', key: 'mar',

    },
      { title: 'Apr', dataIndex: 'hours4', key: 'apr',

    },
      { title: 'May', dataIndex: 'hours5', key: 'may',
      },
      { title: 'Jun', dataIndex: 'hours6', key: 'jun',
      },
      { title: 'Jul', dataIndex: 'hours7', key: 'jul',
      },
      { title: 'Aug', dataIndex: 'hours8', key: 'aug',
      },
      { title: 'Sep', dataIndex: 'hours9', key: 'sep',
      },
      { title: 'Oct', dataIndex: 'hours10', key: 'oct',
      },
      { title: 'Nov', dataIndex: 'hours11', key: 'nov',

    },
      { title: 'Dec', dataIndex: 'hours12', key: 'dec',
      },
      {
        title: 'Sub Total',
        dataIndex: 'sub_total',
        key: 'sub_total',
        fixed: 'right',
        width: 100,
      },
    ]
    const {displayUnit,currentDataDay,currentData} = props
    return (
      <Fragment>

        <TableList
          pagination={{ position: 'none' }}
          columns={columns}
          dataSource={displayUnit === 'Day' ?currentDataDay :currentData}
          bordered
          scroll={{ x: 1500 }}
        />

      </Fragment>
    )
}

DisplayReportConfigurationTable.propTypes={
  displayUnit:PropTypes.string,
  currentDataDay:PropTypes.oneOfType([PropTypes.object]),
  currentData:PropTypes.oneOfType([PropTypes.object])
}


DisplayReportConfigurationTable.defaultProps={
  displayUnit:'',
  currentDataDay:{},
  currentData:{},
}
export default withApollo(DisplayReportConfigurationTable)

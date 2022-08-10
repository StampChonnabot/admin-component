import { Pagination } from 'antd'
import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const MyDivCompanyHoliday = styled.div`
  height: 74px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-end;
  border-top: 1px solid rgb(232, 232, 232);
`

const CustomPagination = ({
  showSizeChanger,
  onShowSizeChange,
  onChange,
  defaultCurrent,
  total,
}) => (
  <MyDivCompanyHoliday>
    <Pagination
      showSizeChanger={showSizeChanger}
      onShowSizeChange={onShowSizeChange}
      onChange={onChange}
      defaultCurrent={defaultCurrent}
      total={total}
    />
  </MyDivCompanyHoliday>
)
CustomPagination.propTypes = {
  showSizeChanger: PropTypes.number,
  onShowSizeChange: PropTypes.number,
  onChange: PropTypes.oneOfType([PropTypes.object]),
  defaultCurrent: PropTypes.number,
  total: PropTypes.number,
}
CustomPagination.defaultProps = {
  showSizeChanger: '',
  onShowSizeChange: '',
  onChange: {},
  defaultCurrent: '',
  total: '',
}
export default CustomPagination

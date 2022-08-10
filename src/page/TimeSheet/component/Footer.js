import { Pagination } from 'antd'
import React from 'react'
import styled from 'styled-components'

const MyDivTimeSheet = styled.div`
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
  <MyDivTimeSheet>
    <Pagination
      showSizeChanger={showSizeChanger}
      onShowSizeChange={onShowSizeChange}
      onChange={onChange}
      defaultCurrent={defaultCurrent}
      total={total}
    />
  </MyDivTimeSheet>
)

export default CustomPagination

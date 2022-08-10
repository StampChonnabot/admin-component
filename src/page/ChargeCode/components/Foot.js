import { Pagination } from 'antd'
import React from 'react'
import styled from 'styled-components'

const MyDiv = styled.div`
    height:74px;
    display:flex;
    align-items:center;
    flex-direction:row;
    justify-content:flex-end;
    border-top:1px solid rgb(232, 232, 232);


`

const CustomPagination = ({ showSizeChanger,onShowSizeChange, onChange, defaultCurrent ,total}) =>
    <MyDiv>
       <Pagination
          showSizeChanger={showSizeChanger}
          onShowSizeChange={onShowSizeChange}
          onChange={onChange}
          defaultCurrent={defaultCurrent}
          total={total}
        />
    </MyDiv>

export default CustomPagination

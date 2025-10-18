import { CircularProgress, IconButton } from '@mui/material'
import React, { FC } from 'react'
type CustomIconButtonProps = {
    children: React.ReactNode
    onclick: () => void
    size?: 'small' | 'medium'
    loading?: boolean
    disabled?: boolean
    hoverColor?: string

}
const CustomIconButton: FC<CustomIconButtonProps> = ({
    children,
    onclick,
    size="medium",
    loading=false,
    disabled=false,
    hoverColor="#e1fffc"

}) => {
  return (
    <IconButton disabled={disabled} size={size} onClick={onclick}
    sx={{ bgcolor: "transparent", "&:hover": { bgcolor: hoverColor  }}} >
         {loading ? <CircularProgress size={16} /> : children}
    </IconButton>
  )
}

export default CustomIconButton
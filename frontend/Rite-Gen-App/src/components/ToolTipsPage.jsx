import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

const TooltipBox = ({ title, placement }) => {
  return (
    <Tooltip title={title} placement={placement} arrow>
      <IconButton>
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
};

TooltipBox.propTypes = {
  title: PropTypes.string.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};

TooltipBox.defaultProps = {
  placement: 'top',
};

export default TooltipBox;

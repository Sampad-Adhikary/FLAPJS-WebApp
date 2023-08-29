import React from 'react';
import { hot } from 'react-hot-loader/root';
import Style from './App.css';

import DrawerView, { DRAWER_SIDE_RIGHT, DRAWER_SIDE_BOTTOM, DRAWER_BAR_DIRECTION_VERTICAL, DRAWER_BAR_DIRECTION_HORIZONTAL } from 'experimental/drawer/DrawerView.js';
import ToolbarView from 'experimental/toolbar/ToolbarView.js';
import TooltipView from 'experimental/tooltip/TooltipView.js';
import UploadDropZone from 'experimental/components/UploadDropZone.js';

export default hot(App);

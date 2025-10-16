import React, { forwardRef } from 'react';

import ModuleDetail from "./ModuleDetail";
import PortDetail from "./PortDetail";
import CombinedEdgeDetail from "./CombinedEdgeDetail";
import ProcessDetail from "./ProcessDetail";
import 'antd/lib/input/style';
import 'antd/lib/select/style';
import 'antd/lib/switch/style';
import styles from "./index.less";
import { IDefaultModel, ISelectData } from '../../types';

export interface DetailProps {
  height: number;
  model: IDefaultModel;
  users: ISelectData[];
  groups: ISelectData[];
  messageDefs: ISelectData[];
  signalDefs: ISelectData[];
  onChange: (...args: any[]) => any;
  readOnly: boolean;
}



const DetailPanel = forwardRef<any, DetailProps>(({ height, model, users, groups, messageDefs, signalDefs, onChange, readOnly = false }, ref) => {
  return (
    <div ref={ref} className={styles.detailPanel} style={{ height }}>
      {model.clazz === 'scriptTask' && <ModuleDetail model={model} onChange={onChange} readOnly={readOnly} />}
      {model.clazz === 'process' && <ProcessDetail model={model} onChange={onChange} readOnly={readOnly} />}
      {model.clazz === 'flow' && <PortDetail model={model} onChange={onChange} readOnly={readOnly} />}
      {model.clazz === 'combinedEdge' && <CombinedEdgeDetail model={model} onChange={onChange} readOnly={readOnly} />}
      
      
    </div>
  )
});

export default DetailPanel;

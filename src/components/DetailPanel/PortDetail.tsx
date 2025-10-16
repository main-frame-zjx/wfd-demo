import styles from "./index.less";
import { Checkbox, Input, } from "antd";
import React, { useContext } from "react";
import DefaultDetail from './DefaultDetail';
import LangContext from "../../util/context";
import { IPortModel } from '../../types';
import i18n from "../../util/zhcn";

export interface PortProps {
  model: IPortModel;
  onChange: (...args: any[]) => any;
  readOnly: boolean;
}
const PortDetail: React.FC<PortProps> = ({ model, onChange, readOnly = false, }) => {
  
  const title = i18n['portDetail'];
  return (
    <div data-clazz={model.clazz}>
      <div className={styles.panelTitle}>{title}</div>
      <div className={styles.panelBody}>
        <div className={styles.panelRow}>
          <div>Port变量名：</div>
          <Input style={{ width: '100%', fontSize: 12 }}
            value={model.MxLabel}
            onChange={(e) => onChange('MxLabel', e.target.value)}
            disabled={true}
          />
        </div>


        <div className={styles.panelRow}>
          <div>文件名：</div>
          <Input style={{ width: '100%', fontSize: 12 }}
            value={model.MxFileName}
            onChange={(e) => onChange('MxFileName', e.target.value)}
            disabled={true}
          />
        </div>

        <div className={styles.panelRow}>
          <div>传输速率：</div>
          <Input style={{ width: '100%', fontSize: 12 }}
            value={model.currentRate}
            onChange={(e) => onChange('currentRate', e.target.value)}
            disabled={true}
          />
        </div>

  
      </div>
    </div>
  )
};

export default PortDetail;

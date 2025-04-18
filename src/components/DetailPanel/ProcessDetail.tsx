import styles from "./index.less";
import { Input, Button } from "antd";
import React, { useContext, useState } from "react";
import LangContext from "../../util/context";
import DataTableModal from "./DataTableModal";
import { IProcessModel } from '../../types';

export interface ProcessProps {
  model: IProcessModel;
  onChange: (...args: any[]) => any;
  readOnly: boolean;
}
const ProcessDetail: React.FC<ProcessProps> = ({ model, onChange, readOnly = false, }) => {
  const { i18n, lang } = useContext(LangContext);

  const validateIntegerInput = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };


  const windowSizeOnChange = (e) => {
    const validValue = Math.max(validateIntegerInput(e.target.value, 20), 1);
    onChange('windowSize', validValue);
  };

  return (
    <>
      <div data-clazz={model.clazz}>
        <div className={styles.panelTitle}>{i18n['process']}</div>
        <div className={styles.panelBody}>
          <div className={styles.panelRow}>
            <div>{i18n['process.id']}：</div>
            <Input style={{ width: '100%', fontSize: 12 }}
              value={model.id}
              onChange={(e) => onChange('id', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className={styles.panelRow}>
            <div>{i18n['process.name']}：</div>
            <Input style={{ width: '100%', fontSize: 12 }}
              value={model.name}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className={styles.panelRow}>
            <div>{i18n['process.windowSize']}：</div>
            <Input style={{ width: '100%', fontSize: 12 }}
              value={model.windowSize}
              onChange={windowSizeOnChange}
              disabled={readOnly}
            />
          </div>
          <div className={styles.panelRow}>
            <div>{i18n['process.dpcId']}：</div>
            <Input style={{ width: '100%', fontSize: 12 }}
              value={model.dpcId}
              onChange={(e) => onChange('dpcId', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

    </>
  )
};

export default ProcessDetail;

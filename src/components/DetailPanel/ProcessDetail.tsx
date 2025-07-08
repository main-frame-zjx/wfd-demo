import styles from "./index.less";
import { Input, Button } from "antd";
import React, { useContext, useState } from "react";
import LangContext from "../../util/context";
import DataTableModal from "./DataTableModal";
import { IProcessModel } from '../../types';
import i18n from "../../util/zhcn";

export interface ProcessProps {
  model: IProcessModel;
  onChange: (...args: any[]) => any;
  readOnly: boolean;
}
const ProcessDetail: React.FC<ProcessProps> = ({ model, onChange, readOnly = false, }) => {
  // const { i18n, lang } = useContext(LangContext);

  const validateIntegerInput = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };


  const windowSizeOnChange = (e) => {
    const validValue = Math.max(validateIntegerInput(e.target.value, 20), 1);
    onChange('windowSize', validValue);
  };

  const stepSizeOnChange = (e) => {
    const validValue = Math.max(validateIntegerInput(e.target.value, 1), 1);
    onChange('stepSize', validValue);
  };

  const fpsmaxOnChange = (e) => {
    const validValue = Math.max(validateIntegerInput(e.target.value, 10), 1);
    onChange('fpsmax', validValue);
  };

  const dpcIdOnChange = (e) => {
    const validValue = Math.min(Math.max(validateIntegerInput(e.target.value, 0), 0), 3);
    onChange('dpcId', validValue);
    window.SwitchDpcId(validValue);
  };

  // const fpsOnChange = (e) => {
  //   const validValue = Math.max(validateIntegerInput(e.target.value, 10), 1);
  //   onChange('fps', validValue);
  // };

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
            <div>{i18n['process.stepSize']}：</div>
            <Input style={{ width: '100%', fontSize: 12 }}
              value={model.stepSize}
              onChange={stepSizeOnChange}
              disabled={readOnly}
            />
          </div>
          <div className={styles.panelRow}>
            <div>{i18n['process.fpsmax']}：</div>
            <Input style={{ width: '100%', fontSize: 12 }}
              value={model.fpsmax}
              onChange={fpsmaxOnChange}
              disabled={readOnly}
            />
          </div>
          {/* <div className={styles.panelRow}>
            <div>{i18n['process.fps']}：</div>
            <Input style={{ width: '100%', fontSize: 12 }}
              value={model.fps}
              onChange={fpsOnChange}
              disabled={true}
            />
          </div> */}
          <div className={styles.panelRow}>
            <div>{i18n['process.dpcId']}：</div>
            <Input style={{ width: '100%', fontSize: 12 }}
              value={model.dpcId}
              onChange={dpcIdOnChange}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

    </>
  )
};

export default ProcessDetail;

import styles from "./index.less";
import { Checkbox, Input, } from "antd";
import React, { useContext } from "react";
import DefaultDetail from './DefaultDetail';
import LangContext from "../../util/context";
import { IFlowModel } from '../../types';
import i18n from "../../util/zhcn";

export interface FlowProps {
  model: IFlowModel;
  onChange: (...args: any[]) => any;
  readOnly: boolean;
}
const FlowDetail: React.FC<FlowProps> = ({ model, onChange, readOnly = false, }) => {
  // const { i18n } = useContext(LangContext);
  const title = i18n['sequenceFlow'];
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
          <Checkbox onChange={(e) => onChange('hideIcon', e.target.checked)}
            disabled={readOnly}
            checked={!!model.hideIcon}>隐藏port</Checkbox>
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

        {/* <div className={styles.panelRow}>
          <div>{i18n['sequenceFlow.expression']}：</div>
          <Input.TextArea style={{ width: '100%', fontSize: 12 }}
            rows={4}
            value={model.conditionExpression}
            onChange={(e) => {
              onChange('conditionExpression', e.target.value)
            }}
            disabled={readOnly}
          />
        </div>
        <div className={styles.panelRow}>
          <div>{i18n['sequenceFlow.seq']}：</div>
          <Input style={{ width: '100%', fontSize: 12 }}
            value={model.seq}
            onChange={(e) => {
              onChange('seq', e.target.value)
            }}
            disabled={readOnly}
          />
        </div>
        <div className={styles.panelRow}>
          <Checkbox onChange={(e) => onChange('reverse', e.target.checked)}
            disabled={readOnly}
            checked={!!model.reverse}>{i18n['sequenceFlow.reverse']}</Checkbox>
        </div> */}
      </div>
    </div>
  )
};

export default FlowDetail;

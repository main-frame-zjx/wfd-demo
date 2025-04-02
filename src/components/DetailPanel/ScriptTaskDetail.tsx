import styles from "./index.less";
import { Checkbox, Input } from "antd";
import React, { useContext } from "react";
import LangContext from "../../util/context";
import { IScriptModel } from '../../types';

export interface ScriptProps {
  model: IScriptModel;
  onChange: (...args: any[]) => any;
  readOnly: boolean;
}
const ScriptTaskDetail: React.FC<ScriptProps> = ({ model, onChange, readOnly = false, }) => {
  const { i18n } = useContext(LangContext);
  const title = i18n['scriptTask'];
  return (
    <div data-clazz={model.clazz}>
      <div className={styles.panelTitle}>{title}</div>
      <div className={styles.panelBody}>
        <div className={styles.panelRow}>
          <div>{i18n['label']}：</div>
          <Input style={{ width: '100%', fontSize: 12 }}
            value={model.label}
            onChange={(e) => onChange('label', e.target.value)}
            disabled={true}
          />
        </div>
        <div className={styles.panelRow}>
          <Checkbox onChange={(e) => onChange('hideIcon', e.target.checked)}
            disabled={readOnly}
            checked={!!model.hideIcon}>隐藏module</Checkbox>
        </div>
        <div className={styles.panelRow}>
          <div>{i18n['scriptTask.script']}：</div>
          <Input.TextArea style={{ width: '100%', fontSize: 12 }}
            rows={4}
            value={model.script}
            onChange={(e) => {
              onChange('script', e.target.value)
            }}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  )
};

export default ScriptTaskDetail;

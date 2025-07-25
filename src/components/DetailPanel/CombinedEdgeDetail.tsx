import styles from "./index.less";
import { Checkbox, Input, } from "antd";
import React, { useContext } from "react";
import DefaultDetail from './DefaultDetail';
import LangContext from "../../util/context";
import { ICombinedEdgeModel } from '../../types';
import i18n from "../../util/zhcn";

export interface CombinedEdgeProps {
    model: ICombinedEdgeModel;
    onChange: (...args: any[]) => any;
    readOnly: boolean;
}

function mergeArraysToString(fileArray, scoreArray) {
    // console.log(scoreArray);
    return fileArray.map((filename, index) =>
        `${filename}  ${scoreArray[index] !== null && scoreArray[index] !== undefined ? scoreArray[index] : ''}`
    ).join('\n');
}

function calcCombinedEdgeRate(currentRateArray, flag) {
    if (!Array.isArray(currentRateArray) || typeof currentRateArray.length !== 'number') {
        return 0;
    }
    if (currentRateArray.length === 0) return 0;
    if (flag) {
        // 计算最大值 
        return Math.max(...currentRateArray);
    } else {
        // 计算平均值 
        const sum = currentRateArray.reduce((acc, curr) => acc + curr, 0);
        return sum / currentRateArray.length;
    }

}



const CombinedEdgeDetail: React.FC<CombinedEdgeProps> = ({ model, onChange, readOnly = false, }) => {
    // const { i18n } = useContext(LangContext);
    const title = i18n['combinedEdge'];

    const useMaxCalcRateOnChange = (e) => {
        onChange('useMaxCalcRate', e.target.checked)
    };

    return (
        <div data-clazz={model.clazz}>
            <div className={styles.panelTitle}>{title}</div>
            <div className={styles.panelBody}>
                {/* <div className={styles.panelRow}>
                    <div>合并边起点</div>
                    <Input style={{ width: '100%', fontSize: 12 }}
                        value={model.MxLabel}
                        onChange={(e) => onChange('MxLabel', e.target.value)}
                        disabled={true}
                    />
                </div> */}

                <div className={styles.panelRow}>
                    <Checkbox onChange={(e) => onChange('hideIcon', e.target.checked)}
                        disabled={readOnly}
                        checked={!!model.hideIcon}>隐藏合并边</Checkbox>
                </div>


                <div className={styles.panelRow}>
                    <div>总传输速率：</div>
                    <Input style={{ width: '100%', fontSize: 12 }}
                        value={calcCombinedEdgeRate(model.currentRate, model.useMaxCalcRate)}
                        disabled={true}
                    />
                </div>

                <div className={styles.panelRow}>
                    <div>各边的传输速率：</div>
                    <Input.TextArea
                        style={{
                            width: '100%',
                            fontSize: 12,
                            whiteSpace: 'pre-wrap' // 保留换行和空格
                        }}
                        value={mergeArraysToString(model.fileNameArray, model.currentRate)}
                        autoSize={{ minRows: 3, maxRows: 10 }} // 自动调整高度
                        disabled={true}
                    />
                </div>


                <div className={styles.panelRow}>
                    <Checkbox onChange={useMaxCalcRateOnChange}
                        disabled={readOnly}
                        checked={model.useMaxCalcRate}>使用最大值表示合并边速率</Checkbox>
                </div>


            </div>
        </div>
    )
};

export default CombinedEdgeDetail;

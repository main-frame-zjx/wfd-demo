import React, { forwardRef,useRef,useEffect, useState, useContext, PropsWithChildren } from 'react';
import '../../iconfont.css';
import styles from "./index.less";
import { Tooltip } from "antd";
import 'antd/lib/tooltip/style';
import LangContext from "../../util/context";

interface IProgressBarProps {
  percent: 88; // 当前进度值
  maxPercent?: number; // 最大百分比（进度）
  color?: string; // 进度值颜色
  showText?: "right"| "center" | "both"  // 标签显示在哪里：右边、中间
 
}


const BottombarPanel = forwardRef<any, PropsWithChildren<any>>((props,ref) => {
  const { i18n } = useContext(LangContext);
  const [textStyle, setTextStyle] = useState<string>("progressTextCenter");
  const newColor = "#63a3fc"; // 默认颜色

  const [percent, setPercent] = useState(0); // 当前进度值
  const progressBarRef = useRef<HTMLDivElement>(null); // 进度条容器的引用
  const isDragging = useRef(false); // 是否正在拖动

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Mouse down');
    e.preventDefault(); // 防止默认行为
    isDragging.current = true; // 设置为拖动状态
    updateProgress(e); // 更新进度
  };

  const handleMouseMove = (e: MouseEvent) => {
    // console.log('Mouse moving');
    if (isDragging.current) {
      updateProgress(e);// 更新进度
    }
  };

  const handleMouseUp = () => {
    console.log('Mouse up');
    isDragging.current = false;// 停止拖动
  };

  const updateProgress = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX : (e as MouseEvent).clientX;
    const width = rect.width;
    console.log('width:', width);
    const newPercent = Math.min(100, Math.max(0, ((x - rect.left) / width) * 100));
    setPercent(newPercent);
    console.log('newPercent:', newPercent);
  };

  useEffect(() => {
    console.log('Adding event listeners');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      console.log('Removing event listeners');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  let num1=6603;
  let num2=11077;
  let now=Math.floor((num2-num1)*percent/100)+num1;
  return (
    <div className={styles.bottombar} ref={ref}>
      <div className={styles.progressTextLeft}>{num1}</div>
      <div className={styles.progressContainer} ref={progressBarRef} onMouseDown={handleMouseDown}>
        <div className={styles.progressBar} style={{ width: `${percent}%`, backgroundColor: newColor }}></div>
      </div>
      <div className={styles.progressTextCenter}>{now}/</div>
      <div className={styles.progressTextRight}>{num2}</div>
    </div>
  );
});

export default BottombarPanel;